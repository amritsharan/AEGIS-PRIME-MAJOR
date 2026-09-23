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
  ct: string
  iv: string
  salt: string
  issued: string
}

export function buildKeyFile(
  uid: string,
  ciphertext: string,
  iv: string,
  salt: string,
): AegisKeyFile {
  return { v: 1, uid, ct: ciphertext, iv, salt, issued: new Date().toISOString() }
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
    throw new Error('Invalid .aegis key file format.')
  }
  return parsed
}
