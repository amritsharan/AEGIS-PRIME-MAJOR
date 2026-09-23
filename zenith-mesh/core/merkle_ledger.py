"""
Zenith-Mesh Proof-of-Agency Merkle Ledger Subsystem
Simulating a private Substrate blockchain with AURA-GRANDPA consensus.
Part of Aegis-Prime Sovereign Intelligence Mesh — Layer 4.
"""

from __future__ import annotations

import hashlib
import time
from typing import Any, Dict, List, Optional


def keccak_256(data: str | bytes) -> str:
    """
    Simulated Keccak-256 / SHA3-256 hashing for Merkle-Patricia Trie root representation.
    """
    if isinstance(data, str):
        data = data.encode("utf-8")
    return hashlib.sha3_256(data).hexdigest()


def sha3_256_hex(data: str | bytes) -> str:
    """Standard SHA3-256 digest in hex."""
    if isinstance(data, str):
        data = data.encode("utf-8")
    return hashlib.sha3_256(data).hexdigest()


class MerkleLedger:
    """
    Append-only in-memory storage simulating a private Substrate blockchain.
    Manages Proof-of-Agency state transitions, Merkle-Patricia root commitments,
    and forensic incident sealing.
    """

    def __init__(self, initial_block: int = 1048) -> None:
        self.blockchain_state: List[Dict[str, Any]] = []
        self.current_block: int = initial_block

        # Seed initial genesis state if empty
        self._seed_genesis_state()

    def _seed_genesis_state(self) -> None:
        """Seed ledger with historical finalized blocks for baseline auditing."""
        genesis_ts = int(time.time()) - 3600
        for i in range(1040, self.current_block):
            delta = i - 1040
            t_epoch = genesis_ts + (delta * 12)  # Substrate 12-second slot time
            intent_digest = sha3_256_hex(f"GENESIS_SEED:{i}:{t_epoch}")
            merkle_root = "0x" + keccak_256(f"{i}:{intent_digest}")
            tx_hash = "0x" + sha3_256_hex(f"EXTRINSIC:{intent_digest}:{i}")

            self.blockchain_state.append({
                "blockHeight": i,
                "txHash": tx_hash,
                "intentDigest": "0x" + intent_digest,
                "merkleRoot": merkle_root,
                "agentId": f"aegis-validator-node-0{i % 4}",
                "status": "FINALIZED",
                "timestamp": t_epoch,
                "consensus": "AURA-GRANDPA",
                "type": "PO_AGENCY_COMMIT",
            })

    def commit_intent(
        self,
        agent_id: str,
        action_hash: str,
        tau_cap: str,
        payload_digest: str,
    ) -> Dict[str, Any]:
        """
        Synthesize Proof-of-Agency commitment into a Substrate block:
          1. Monotonic epoch timestamp T_epoch = int(time.time()).
          2. tau_audit = sha3_256(f"{tau_cap}:{agent_id}:{action_hash}:{payload_digest}:{T_epoch}")
          3. merkle_root = "0x" + keccak_256(f"{current_block}:{tau_audit}")
          4. tx_hash = "0x" + sha3_256(f"EXTRINSIC:{tau_audit}:{current_block}")
          5. Increment current_block, append to BLOCKCHAIN_STATE, and return finalized receipt.
        """
        t_epoch: int = int(time.time())

        # Proof-of-Agency Intent Digest
        audit_raw = f"{tau_cap}:{agent_id}:{action_hash}:{payload_digest}:{t_epoch}"
        tau_audit: str = sha3_256_hex(audit_raw)

        # Merkle-Patricia Trie Root calculation
        merkle_root_raw = f"{self.current_block}:{tau_audit}"
        merkle_root: str = "0x" + keccak_256(merkle_root_raw)

        # Extrinsic transaction hash
        tx_raw = f"EXTRINSIC:{tau_audit}:{self.current_block}"
        tx_hash: str = "0x" + sha3_256_hex(tx_raw)

        block_height = self.current_block

        receipt: Dict[str, Any] = {
            "blockHeight": block_height,
            "txHash": tx_hash,
            "intentDigest": "0x" + tau_audit,
            "merkleRoot": merkle_root,
            "agentId": agent_id,
            "status": "FINALIZED",
            "timestamp": t_epoch,
            "consensus": "AURA-GRANDPA",
            "type": "PO_AGENCY_COMMIT",
        }

        # Monotonically increment block and commit
        self.blockchain_state.append(receipt)
        self.current_block += 1

        return receipt

    def commit_incident(
        self,
        attacker_ip: str,
        canary_id: str,
        signature: str,
    ) -> Dict[str, Any]:
        """
        Forensic Incident Vault:
        Commits an unalterable forensic record for security breaches and honey-grid trips.
          - incident_hash = sha3_256(f"SECURITY_BREACH:{attacker_ip}:{canary_id}:{time.time()}")
          - Seals leaf directly to block, status "EVIDENCE_SEALED"
        """
        t_epoch: float = time.time()
        incident_raw = f"SECURITY_BREACH:{attacker_ip}:{canary_id}:{t_epoch}"
        incident_hash: str = sha3_256_hex(incident_raw)

        merkle_root_raw = f"{self.current_block}:INCIDENT:{incident_hash}"
        merkle_root: str = "0x" + keccak_256(merkle_root_raw)

        tx_raw = f"EXTRINSIC_FORENSIC:{incident_hash}:{self.current_block}"
        tx_hash: str = "0x" + sha3_256_hex(tx_raw)

        block_height = self.current_block

        forensic_record: Dict[str, Any] = {
            "blockHeight": block_height,
            "txHash": tx_hash,
            "evidenceHash": "0x" + incident_hash,
            "merkleRoot": merkle_root,
            "attackerIp": attacker_ip,
            "canaryId": canary_id,
            "signature": signature,
            "status": "EVIDENCE_SEALED",
            "timestamp": int(t_epoch),
            "consensus": "AURA-GRANDPA",
            "type": "FORENSIC_INCIDENT",
        }

        self.blockchain_state.append(forensic_record)
        self.current_block += 1

        return {
            "status": "EVIDENCE_SEALED",
            "evidenceHash": forensic_record["evidenceHash"],
            "blockHeight": block_height,
            "txHash": tx_hash,
            "merkleRoot": merkle_root,
            "timestamp": int(t_epoch),
        }

    def get_latest_blocks(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Retrieve the last N finalized block receipts."""
        return list(reversed(self.blockchain_state[-limit:]))

    def get_state(self) -> Dict[str, Any]:
        """Telemetry of current ledger height and total extrinsics."""
        return {
            "current_block": self.current_block,
            "total_extrinsics": len(self.blockchain_state),
            "consensus": "AURA-GRANDPA",
        }


# Global default instance
default_ledger = MerkleLedger(initial_block=1048)
