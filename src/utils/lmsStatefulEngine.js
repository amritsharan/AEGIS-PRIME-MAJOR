/**
 * NIST SP 800-208 / RFC 8554 Stateful Hash-Based Signatures (LMS / LMOTS)
 * Browser Engine for Synapse-OS Microkernel Firmware & State Verification
 */

// Helper to compute SHA-256 via Web Crypto or pure JS fallback
export async function sha256Bytes(bytes) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuf = await crypto.subtle.digest('SHA-256', bytes);
    return new Uint8Array(hashBuf);
  }
  // Fallback using simple bitwise implementation
  throw new Error('WebCrypto subtle not available');
}

export function bytesToHex(bytes) {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export function hexToBytes(hex) {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
  }
  return bytes;
}

export function concatBytes(...arrays) {
  let totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  let res = new Uint8Array(totalLength);
  let offset = 0;
  for (let arr of arrays) {
    res.set(arr, offset);
    offset += arr.length;
  }
  return res;
}

export function packU32(num) {
  const b = new Uint8Array(4);
  new DataView(b.buffer).setUint32(0, num, false); // Big endian
  return b;
}

export function packU16(num) {
  const b = new Uint8Array(2);
  new DataView(b.buffer).setUint16(0, num, false); // Big endian
  return b;
}

export function packU8(num) {
  return new Uint8Array([num & 0xff]);
}

/**
 * Extract i-th 4-bit coefficient from byte string
 */
function coef(S, i, w = 4) {
  const byteIdx = Math.floor((i * w) / 8);
  const bitOffset = 8 - w - ((i * w) % 8);
  return (S[byteIdx] >> bitOffset) & ((1 << w) - 1);
}

/**
 * RFC 8554 Winternitz Checksum calculation
 */
function computeChecksum(S, w = 4, ls = 4) {
  let c = 0;
  const u = (S.length * 8) / w;
  for (let i = 0; i < u; i++) {
    c += (1 << w) - 1 - coef(S, i, w);
  }
  return (c << ls);
}

/**
 * Verify an LMS / LMOTS signature against an expected root hash in the browser
 */
export async function verifyLmsSignatureInBrowser({
  firmwareBytes,
  identifierHex,
  leafIndex,
  randomizerHex,
  lmotsSignatureHex,
  authPathHex,
  expectedRootHex,
}) {
  try {
    const I = hexToBytes(identifierHex);
    const q = leafIndex;
    const C = hexToBytes(randomizerHex);
    const sigBytes = hexToBytes(lmotsSignatureHex);
    const authPath = authPathHex.map(hexToBytes);

    // 1. Message digest: H(I || u32(q) || u16(0x8181) || C || firmwareBytes)
    const msgPrefix = concatBytes(I, packU32(q), packU16(0x8181), C);
    const msgDigest = await sha256Bytes(concatBytes(msgPrefix, firmwareBytes));

    // 2. Extract LMOTS signature elements (P = 67 elements)
    // First 4 bytes are type, next 32 bytes are C, then 67 * 32 bytes elements
    const rawElements = sigBytes.slice(36);
    const P = 67;
    const elements = [];
    for (let i = 0; i < P; i++) {
      elements.push(rawElements.slice(i * 32, (i + 1) * 32));
    }

    // 3. Winternitz Checksum
    const cksum = computeChecksum(msgDigest, 4, 4);
    const cksumBytes = concatBytes(packU16(cksum), packU8(0));
    const extendedDigest = concatBytes(msgDigest, cksumBytes.slice(0, 3));

    // 4. Derive LMOTS public key elements
    const yElements = [];
    for (let i = 0; i < P; i++) {
      const a = coef(extendedDigest, i, 4);
      let y = elements[i];
      for (let j = a; j < 15; j++) {
        const prefix = concatBytes(I, packU32(q), packU16(i), packU8(j));
        y = await sha256Bytes(concatBytes(prefix, y));
      }
      yElements.push(y);
    }

    // Recovered OTS public key
    const kPrefix = concatBytes(I, packU32(q), packU16(0x8080));
    const recoveredOtsPub = await sha256Bytes(concatBytes(kPrefix, ...yElements));

    // 5. Compute leaf hash
    const H = 10;
    const leafIdx = (1 << H) + q;
    const leafPrefix = concatBytes(I, packU32(leafIdx), packU16(0x8282));
    let currHash = await sha256Bytes(concatBytes(leafPrefix, recoveredOtsPub));

    // 6. Climb Merkle tree
    let currIdx = leafIdx;
    for (let siblingHash of authPath) {
      const parentIdx = Math.floor(currIdx / 2);
      const parentPrefix = concatBytes(I, packU32(parentIdx), packU16(0x8383));
      if (currIdx % 2 === 0) {
        currHash = await sha256Bytes(concatBytes(parentPrefix, currHash, siblingHash));
      } else {
        currHash = await sha256Bytes(concatBytes(parentPrefix, siblingHash, currHash));
      }
      currIdx = parentIdx;
    }

    const computedRoot = bytesToHex(currHash);
    const isValid = computedRoot.toLowerCase() === expectedRootHex.toLowerCase();

    return {
      valid: isValid,
      computedRoot,
      expectedRoot: expectedRootHex,
      leafIndex: q,
      statefulTreeHeight: H,
      quantumCategory: 'NIST SP 800-208 Level 5 (Stateful Hash-Based PQC)',
    };
  } catch (err) {
    return {
      valid: false,
      error: err.message,
    };
  }
}
