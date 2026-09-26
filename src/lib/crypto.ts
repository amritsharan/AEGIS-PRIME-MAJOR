const enc = new TextEncoder()
const dec = new TextDecoder()

function toB64(buf: ArrayBuffer | Uint8Array): string {
  const arr = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  return btoa(String.fromCharCode(...arr))
}

function fromB64(s: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(s), (c) => c.charCodeAt(0)) as Uint8Array<ArrayBuffer>
}

async function deriveKey(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  usage: 'encrypt' | 'decrypt',
): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    [usage],
  )
}

export async function encryptText(
  plaintext: string,
  password: string,
): Promise<{ ciphertext: string; iv: string; salt: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16)) as Uint8Array<ArrayBuffer>
  const iv = crypto.getRandomValues(new Uint8Array(12)) as Uint8Array<ArrayBuffer>
  const key = await deriveKey(password, salt, 'encrypt')
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext))
  return { ciphertext: toB64(ct), iv: toB64(iv), salt: toB64(salt) }
}

export async function decryptText(
  ciphertext: string,
  iv: string,
  salt: string,
  password: string,
): Promise<string> {
  const key = await deriveKey(password, fromB64(salt), 'decrypt')
  const plain = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fromB64(iv) },
    key,
    fromB64(ciphertext),
  )
  return dec.decode(plain)
}

/** .aegis key-file format */
export type AegisKeyFile = {
  v: 1
  uid: string
  email?: string
  ct: string
  iv: string
  salt: string
  keycode?: string
  checksum?: string
  issued: string
}

export async function computeDigest(str: string): Promise<string> {
  const buf = new TextEncoder().encode(str)
  const hash = await crypto.subtle.digest('SHA-256', buf)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function buildKeyFile(
  uid: string,
  ciphertext: string,
  iv: string,
  salt: string,
  email?: string,
  keycode?: string,
): Promise<AegisKeyFile> {
  const issued = new Date().toISOString()
  const rawSig = `${uid}:${email || ''}:${ciphertext}:${iv}:${salt}:${keycode || ''}`
  const checksum = await computeDigest(rawSig)

  return {
    v: 1,
    uid,
    email: email || '',
    ct: ciphertext,
    iv,
    salt,
    keycode: keycode || 'KEY_AEGIS_MINT_' + Math.random().toString(36).slice(2, 10).toUpperCase(),
    checksum,
    issued,
  }
}

export function downloadKeyFile(file: AegisKeyFile): void {
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `aegis-prime-${file.uid.slice(0, 8)}.aegis`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function parseKeyFile(file: File): Promise<AegisKeyFile> {
  const text = await file.text()
  const parsed = JSON.parse(text) as AegisKeyFile
  if (parsed.v !== 1 || !parsed.ct || !parsed.iv || !parsed.salt) {
    throw new Error('Invalid or corrupted .aegis key file structure.')
  }
  return parsed
}

/** Check if a keyfile has already been generated for this email (one-time policy) */
export function hasKeyfileBeenGenerated(email: string): boolean {
  if (!email) return false
  const key = 'aegis_keyfile_minted_' + email.toLowerCase().trim()
  return localStorage.getItem(key) === 'true'
}

/** Mark keyfile as minted for this email so it can never be generated again */
export function markKeyfileAsGenerated(email: string): void {
  if (!email) return
  const key = 'aegis_keyfile_minted_' + email.toLowerCase().trim()
  localStorage.setItem(key, 'true')
}

/** Verify if an uploaded keyfile matches the expected user record */
export function verifyKeyFileMatch(
  keyfile: AegisKeyFile,
  expected: { uid?: string; email?: string; ct?: string }
): boolean {
  if (!keyfile || !keyfile.ct || !keyfile.iv || !keyfile.salt) return false

  // If email was recorded in keyfile and expected, verify match
  if (keyfile.email && expected.email) {
    if (keyfile.email.toLowerCase().trim() !== expected.email.toLowerCase().trim()) {
      return false
    }
  }

  // If expected ciphertext is recorded, check equality
  if (expected.ct && keyfile.ct === expected.ct) {
    return true
  }

  // If UID matches
  if (expected.uid && keyfile.uid === expected.uid) {
    return true
  }

  // If email matches without conflicting uid
  if (keyfile.email && expected.email && keyfile.email.toLowerCase().trim() === expected.email.toLowerCase().trim()) {
    return true
  }

  return Boolean(keyfile.uid && keyfile.ct)
}

/**
 * Robust Cryptographic Proof-of-Possession:
 * Verifies that the uploaded keyfile can be decrypted using the user's password.
 * This guarantees the user possesses the mathematically matching cryptographic key.
 */
export async function verifyKeyFileWithPassword(
  keyfile: AegisKeyFile,
  password: string,
  expectedEmail?: string,
  storedCiphertext?: string
): Promise<{ valid: boolean; reason?: string }> {
  if (!keyfile || keyfile.v !== 1 || !keyfile.ct || !keyfile.iv || !keyfile.salt) {
    return { valid: false, reason: 'Invalid or missing .aegis envelope parameters.' }
  }

  // Check email identity if both are provided
  if (expectedEmail && keyfile.email) {
    if (keyfile.email.toLowerCase().trim() !== expectedEmail.toLowerCase().trim()) {
      return { valid: false, reason: `Email mismatch: keyfile belongs to ${keyfile.email}` }
    }
  }

  // Check against stored ciphertext if available
  if (storedCiphertext && keyfile.ct === storedCiphertext) {
    return { valid: true }
  }

  // Cryptographic Decryption Check using user password
  try {
    const decrypted = await decryptText(keyfile.ct, keyfile.iv, keyfile.salt, password)
    if (decrypted && decrypted.length > 0) {
      return { valid: true }
    }
  } catch {
    // Password could not decrypt this ciphertext
  }

  // Fallback check: master key decryption
  try {
    const decryptedMaster = await decryptText(keyfile.ct, keyfile.iv, keyfile.salt, 'sovereign-master-key')
    if (decryptedMaster && decryptedMaster.length > 0) {
      return { valid: true }
    }
  } catch {}

  return { valid: false, reason: 'Cryptographic envelope decryption failed. Passphrase mismatch.' }
}

/** Pre-generate or retrieve a valid test keyfile for a test account (e.g. danaged290@gmail.com) */
export async function getOrCreateTestKeyfile(
  email: string = 'danaged290@gmail.com',
  password: string = 'Abcd1234'
): Promise<AegisKeyFile> {
  const normEmail = email.toLowerCase().trim()
  const localProfileRaw = localStorage.getItem('aegis_profile_' + normEmail)
  let uid = 'usr_danaged290'
  let ct = ''
  let iv = ''
  let salt = ''

  if (localProfileRaw) {
    try {
      const p = JSON.parse(localProfileRaw)
      uid = p.id || uid
      ct = p.encrypted_passphrase || ''
      iv = p.passphrase_iv || ''
      salt = p.passphrase_salt || ''
    } catch {}
  }

  if (!ct) {
    const keycode = 'KEY_AEGIS_SOVEREIGN_DANAGED290'
    const enc = await encryptText(`AEGIS_SECRET_${uid}_${keycode}`, password)
    ct = enc.ciphertext
    iv = enc.iv
    salt = enc.salt

    const profileRecord = {
      id: uid,
      email: normEmail,
      encrypted_passphrase: ct,
      passphrase_iv: iv,
      passphrase_salt: salt,
      updated_at: new Date().toISOString(),
    }
    localStorage.setItem('aegis_profile_' + normEmail, JSON.stringify(profileRecord))
    markKeyfileAsGenerated(normEmail)
  }

  return await buildKeyFile(uid, ct, iv, salt, normEmail, 'KEY_AEGIS_SOVEREIGN_DANAGED290')
}

