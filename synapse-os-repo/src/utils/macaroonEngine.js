/**
 * Synapse-OS Cryptographic Macaroon Capability Attenuation Engine
 * Implements Google Research / Birkbeck Macaroon Specification with HMAC-SHA256 Chaining
 * Enables offline delegation of capability tokens with first-party caveats (TTL, path restrictions, permissions).
 */

async function hmacSha256(keyBytes, messageBytes) {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', cryptoKey, messageBytes);
    return new Uint8Array(sig);
  }
  throw new Error('WebCrypto HMAC not available');
}

function stringToBytes(str) {
  return new TextEncoder().encode(str);
}

function bytesToHex(bytes) {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBytes(hex) {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
  }
  return bytes;
}

export class Macaroon {
  constructor(location, identifier, signatureHex, caveats = []) {
    this.location = location;
    this.identifier = identifier;
    this.signatureHex = signatureHex;
    this.caveats = caveats; // Array of caveat strings
  }

  /**
   * Mint a root capability Macaroon token from the microkernel master secret
   */
  static async mint(location, identifier, rootSecret) {
    const secretBytes = stringToBytes(rootSecret);
    const idBytes = stringToBytes(identifier);
    const sigBytes = await hmacSha256(secretBytes, idBytes);
    return new Macaroon(location, identifier, bytesToHex(sigBytes), []);
  }

  /**
   * Add a first-party caveat to attenuate the token without contacting the root issuer
   * sig_new = HMAC(sig_current, caveat_text)
   */
  async addCaveat(caveatText) {
    const currSigBytes = hexToBytes(this.signatureHex);
    const caveatBytes = stringToBytes(caveatText);
    const newSigBytes = await hmacSha256(currSigBytes, caveatBytes);
    
    return new Macaroon(
      this.location,
      this.identifier,
      bytesToHex(newSigBytes),
      [...this.caveats, caveatText]
    );
  }

  /**
   * Serialize Macaroon to URL-safe base64 string
   */
  serialize() {
    const payload = {
      l: this.location,
      i: this.identifier,
      c: this.caveats,
      s: this.signatureHex
    };
    return btoa(JSON.stringify(payload));
  }

  /**
   * Deserialize from base64 string
   */
  static deserialize(str) {
    try {
      const payload = JSON.parse(atob(str));
      return new Macaroon(payload.l, payload.i, payload.s, payload.c || []);
    } catch {
      throw new Error('Invalid Macaroon serialization string');
    }
  }

  /**
   * Cryptographically verify the Macaroon against the root secret and execution context
   */
  async verify(rootSecret, context = {}) {
    // 1. Recompute cryptographic signature chain
    let currSigBytes = await hmacSha256(stringToBytes(rootSecret), stringToBytes(this.identifier));
    
    for (let caveat of this.caveats) {
      currSigBytes = await hmacSha256(currSigBytes, stringToBytes(caveat));
    }

    const recomputedSigHex = bytesToHex(currSigBytes);
    if (recomputedSigHex.toLowerCase() !== this.signatureHex.toLowerCase()) {
      return {
        valid: false,
        reason: 'CRYPTOGRAPHIC_SIGNATURE_MISMATCH: Macaroon has been tampered with or revoked'
      };
    }

    // 2. Evaluate caveats against the execution context
    const nowSec = Math.floor(Date.now() / 1000);

    for (let caveat of this.caveats) {
      // Check TTL: time_before < timestamp
      if (caveat.startsWith('time_before < ')) {
        const expireTime = parseInt(caveat.replace('time_before < ', ''), 10);
        if (nowSec > expireTime) {
          return {
            valid: false,
            reason: `CAVEAT_VIOLATED: Token expired at unix timestamp ${expireTime} (current: ${nowSec})`
          };
        }
      }

      // Check Path: path_prefix = /path/to/dir
      if (caveat.startsWith('path_prefix = ') && context.targetPath) {
        const requiredPrefix = caveat.replace('path_prefix = ', '').trim();
        if (!context.targetPath.startsWith(requiredPrefix)) {
          return {
            valid: false,
            reason: `CAVEAT_VIOLATED: Target path '${context.targetPath}' does not match allowed prefix '${requiredPrefix}'`
          };
        }
      }

      // Check Permission: max_permission = READ_ONLY
      if (caveat.startsWith('max_permission = ') && context.requestedOp) {
        const allowed = caveat.replace('max_permission = ', '').trim();
        if (allowed === 'READ_ONLY' && (context.requestedOp === 'WRITE' || context.requestedOp === 'DELETE' || context.requestedOp === 'EXECUTE')) {
          return {
            valid: false,
            reason: `CAVEAT_VIOLATED: Requested operation '${context.requestedOp}' exceeds '${allowed}' constraint`
          };
        }
      }
    }

    return {
      valid: true,
      identifier: this.identifier,
      caveatCount: this.caveats.length,
      status: 'VERIFIED_AND_ATTENUATED',
      signature: this.signatureHex
    };
  }
}
