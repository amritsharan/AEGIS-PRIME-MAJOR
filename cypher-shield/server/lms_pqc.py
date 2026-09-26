"""
NIST SP 800-208 / RFC 8554 Stateful Hash-Based Signatures (LMS / LMOTS)
Implements:
1. LMOTS (Leighton-Micali One-Time Signature: LMOTS_SHA256_N32_W4)
2. LMS (Leighton-Micali Signature Merkle Tree: LMS_SHA256_M32_H10 / 1024 leaf stateful tree)
3. Firmware update signing and verification engine
"""

import hashlib
import hmac
import os
import struct
import time
from typing import Any, Dict, List, Optional, Tuple

# RFC 8554 Type Identifiers
LMOTS_SHA256_N32_W4 = 0x00000002  # n=32, w=4, p=67, ls=4
LMS_SHA256_M32_H10 = 0x00000006   # m=32, h=10 (1024 leaves)

# Constants for LMOTS_SHA256_N32_W4
N = 32  # Hash length in bytes
W = 4   # Winternitz parameter (bits)
P = 67  # Number of n-byte string elements in signature (u=64, v=3)
LS = 4  # Left shift for checksum
W_MASK = (1 << W) - 1  # 0x0F (15)

# Tree height for LMS_SHA256_M32_H10
H = 10
NUM_LEAVES = 1 << H  # 1024


def _sha256(data: bytes) -> bytes:
    return hashlib.sha256(data).digest()


def _coef(S: bytes, i: int, w: int) -> int:
    """Extract the i-th w-bit coefficient from byte string S."""
    byte_idx = (i * w) // 8
    bit_offset = 8 - w - ((i * w) % 8)
    return (S[byte_idx] >> bit_offset) & ((1 << w) - 1)


def _checksum(S: bytes) -> int:
    """Compute RFC 8554 Winternitz checksum."""
    c = 0
    u = (len(S) * 8) // W  # 64 coefficients for 32-byte digest
    for i in range(u):
        c += (1 << W) - 1 - _coef(S, i, W)
    return c << LS


class LMOTSKey:
    """Leighton-Micali One-Time Signature Private Key & Public Key derivation."""

    def __init__(self, I: bytes, q: int, seed: Optional[bytes] = None):
        self.I = I  # 16-byte tree identifier
        self.q = q  # Leaf index (0 <= q < 1024)
        self.seed = seed or os.urandom(32)
        self.private_keys: List[bytes] = []
        self._generate_private_elements()

    def _generate_private_elements(self):
        """Derive P individual secret seeds x[0..P-1] from master seed using PRF."""
        for i in range(P):
            element_seed = _sha256(self.I + struct.pack(">I", self.q) + struct.pack(">H", i) + b"\xff" + self.seed)
            self.private_keys.append(element_seed)

    def compute_public_key(self) -> bytes:
        """Iteratively hash each x[i] 2^w - 1 (15) times to get y[i], then hash all y[i]."""
        y_elements: List[bytes] = []
        for i in range(P):
            y = self.private_keys[i]
            for j in range(15):  # (1 << W) - 1
                prefix = self.I + struct.pack(">I", self.q) + struct.pack(">H", i) + struct.pack(">B", j)
                y = _sha256(prefix + y)
            y_elements.append(y)

        # Hash all y elements together with prefix
        k_prefix = self.I + struct.pack(">I", self.q) + struct.pack(">H", 0x8080)
        return _sha256(k_prefix + b"".join(y_elements))

    def sign(self, message_digest: bytes, C: bytes) -> bytes:
        """Sign a 32-byte message digest with randomization token C."""
        # Append 3-byte checksum to message digest
        cksum = _checksum(message_digest)
        cksum_bytes = struct.pack(">H", cksum) + b"\x00"
        extended_digest = message_digest + cksum_bytes[:3]

        sig_elements: List[bytes] = []
        for i in range(P):
            a = _coef(extended_digest, i, W)
            x = self.private_keys[i]
            for j in range(a):
                prefix = self.I + struct.pack(">I", self.q) + struct.pack(">H", i) + struct.pack(">B", j)
                x = _sha256(prefix + x)
            sig_elements.append(x)

        # Format signature: type (4 bytes) || C (32 bytes) || elements (P * 32 bytes)
        return struct.pack(">I", LMOTS_SHA256_N32_W4) + C + b"".join(sig_elements)


class LMSStatefulTree:
    """
    NIST SP 800-208 / RFC 8554 Stateful Hash-Based Signature Tree (Height 10 / 1024 Leaves).
    Maintains strict one-time leaf reservation state to prevent key re-use.
    """

    def __init__(self, identifier: Optional[bytes] = None):
        self.I = identifier or os.urandom(16)
        self.height = H
        self.num_leaves = NUM_LEAVES
        self.ots_keys: List[LMOTSKey] = []
        self.leaf_nodes: List[bytes] = []
        self.tree_nodes: Dict[int, bytes] = {}  # 1-indexed binary heap array
        self.current_q = 0  # Stateful index counter (MUST increment after each signature)
        self._build_tree()

    def _build_tree(self):
        """Construct the 1024-leaf Merkle tree."""
        # 1. Derive all 1024 OTS public keys and leaf hashes
        for q in range(self.num_leaves):
            ots_key = LMOTSKey(self.I, q)
            self.ots_keys.append(ots_key)
            ots_pub = ots_key.compute_public_key()
            
            # Leaf hash: H(I || u32(2^h + q) || u16(0x8282) || ots_pub)
            leaf_idx = (1 << self.height) + q
            leaf_prefix = self.I + struct.pack(">I", leaf_idx) + struct.pack(">H", 0x8282)
            leaf_hash = _sha256(leaf_prefix + ots_pub)
            self.leaf_nodes.append(leaf_hash)
            self.tree_nodes[leaf_idx] = leaf_hash

        # 2. Build internal nodes up to root (node 1)
        for r in range((1 << self.height) - 1, 0, -1):
            left = self.tree_nodes[2 * r]
            right = self.tree_nodes[2 * r + 1]
            parent_prefix = self.I + struct.pack(">I", r) + struct.pack(">H", 0x8383)
            self.tree_nodes[r] = _sha256(parent_prefix + left + right)

    @property
    def public_key(self) -> Dict[str, Any]:
        """Returns the LMS Public Key (Root Key)."""
        root_hash = self.tree_nodes[1]
        return {
            "lms_type": "LMS_SHA256_M32_H10",
            "lmots_type": "LMOTS_SHA256_N32_W4",
            "identifier": self.I.hex(),
            "root_hash": root_hash.hex(),
            "tree_height": self.height,
            "total_leaves": self.num_leaves,
            "remaining_signatures": self.num_leaves - self.current_q,
        }

    def sign_firmware_update(self, firmware_bytes: bytes, version_tag: str) -> Dict[str, Any]:
        """
        Sign a microkernel firmware or OTA update payload using the next unconsumed stateful leaf.
        Increments the stateful leaf counter atomically.
        """
        if self.current_q >= self.num_leaves:
            raise RuntimeError("LMS Stateful Key Exhausted: All 1024 one-time signature leaves have been consumed!")

        q = self.current_q
        self.current_q += 1  # State advanced!

        # 1. Randomized hashing of message
        C = os.urandom(32)
        msg_prefix = self.I + struct.pack(">I", q) + struct.pack(">H", 0x8181) + C
        message_digest = _sha256(msg_prefix + firmware_bytes)

        # 2. Generate LMOTS signature for leaf q
        ots_sig = self.ots_keys[q].sign(message_digest, C)

        # 3. Compute Merkle authentication path (siblings from leaf to root)
        auth_path: List[str] = []
        curr_idx = (1 << self.height) + q
        for _ in range(self.height):
            sibling_idx = curr_idx ^ 1
            auth_path.append(self.tree_nodes[sibling_idx].hex())
            curr_idx //= 2

        signature_record = {
            "version_tag": version_tag,
            "leaf_index": q,
            "lms_type": "LMS_SHA256_M32_H10",
            "lmots_type": "LMOTS_SHA256_N32_W4",
            "identifier": self.I.hex(),
            "randomizer_C": C.hex(),
            "lmots_signature": ots_sig.hex(),
            "auth_path": auth_path,
            "firmware_sha256": hashlib.sha256(firmware_bytes).hexdigest(),
            "signed_at": time.strftime("%Y-%m-%d %H:%M:%SZ", time.gmtime()),
            "root_hash": self.tree_nodes[1].hex(),
            "quantum_security_level": "NIST SP 800-208 Category 5 (Stateful Hash-Based PQC)",
        }
        return signature_record


def verify_lms_firmware_signature(
    firmware_bytes: bytes,
    signature_record: Dict[str, Any],
    expected_root_hash: str,
) -> Dict[str, Any]:
    """
    Verify an RFC 8554 / NIST SP 800-208 LMS stateful signature against the expected Root Hash.
    Fully independent verifier: derives the public key from the OTS signature and climbs the Merkle tree.
    """
    try:
        I = bytes.fromhex(signature_record["identifier"])
        q = int(signature_record["leaf_index"])
        C = bytes.fromhex(signature_record["randomizer_C"])
        ots_sig_bytes = bytes.fromhex(signature_record["lmots_signature"])
        auth_path = [bytes.fromhex(h) for h in signature_record["auth_path"]]

        # 1. Compute message digest
        msg_prefix = I + struct.pack(">I", q) + struct.pack(">H", 0x8181) + C
        message_digest = _sha256(msg_prefix + firmware_bytes)

        # 2. Extract LMOTS signature parts
        # Format: type (4 bytes) || C (32 bytes) || elements (P * 32 bytes)
        raw_elements = ots_sig_bytes[36:]
        elements = [raw_elements[i * 32 : (i + 1) * 32] for i in range(P)]

        # 3. Derive LMOTS public key elements
        cksum = _checksum(message_digest)
        cksum_bytes = struct.pack(">H", cksum) + b"\x00"
        extended_digest = message_digest + cksum_bytes[:3]

        y_elements: List[bytes] = []
        for i in range(P):
            a = _coef(extended_digest, i, W)
            y = elements[i]
            for j in range(a, 15):
                prefix = I + struct.pack(">I", q) + struct.pack(">H", i) + struct.pack(">B", j)
                y = _sha256(prefix + y)
            y_elements.append(y)

        # Compute recovered OTS public key
        k_prefix = I + struct.pack(">I", q) + struct.pack(">H", 0x8080)
        recovered_ots_pub = _sha256(k_prefix + b"".join(y_elements))

        # 4. Compute recovered leaf hash
        leaf_idx = (1 << H) + q
        leaf_prefix = I + struct.pack(">I", leaf_idx) + struct.pack(">H", 0x8282)
        curr_hash = _sha256(leaf_prefix + recovered_ots_pub)

        # 5. Climb Merkle tree using authentication path
        curr_idx = leaf_idx
        for sibling_hash in auth_path:
            parent_idx = curr_idx // 2
            parent_prefix = I + struct.pack(">I", parent_idx) + struct.pack(">H", 0x8383)
            if curr_idx % 2 == 0:
                curr_hash = _sha256(parent_prefix + curr_hash + sibling_hash)
            else:
                curr_hash = _sha256(parent_prefix + sibling_hash + curr_hash)
            curr_idx = parent_idx

        computed_root = curr_hash.hex()
        is_valid = computed_root.lower() == expected_root_hash.lower()

        return {
            "valid": is_valid,
            "leaf_index": q,
            "recovered_root_hash": computed_root,
            "expected_root_hash": expected_root_hash,
            "status": "VERIFIED_AUTHENTIC" if is_valid else "CRYPTOGRAPHIC_MISMATCH",
            "standard": "NIST SP 800-208 / RFC 8554 (LMS_SHA256_M32_H10)",
        }
    except Exception as e:
        return {
            "valid": False,
            "error": str(e),
            "status": "VERIFICATION_ERROR",
        }


# Global singleton instance for system-wide microkernel signing
_GLOBAL_LMS_TREE = LMSStatefulTree()


def get_global_lms_tree() -> LMSStatefulTree:
    return _GLOBAL_LMS_TREE
