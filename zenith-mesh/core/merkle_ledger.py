"""
Zenith-Mesh Proof-of-Agency Merkle Ledger Subsystem
Simulating a private Substrate blockchain with AURA-GRANDPA consensus.
Part of Aegis-Prime Sovereign Intelligence Mesh — Layer 4.

Compliant with IEEE Zenith-Mesh Specification:
- Proof-of-Agency (PoA) Intent Digest (Eq. 1)
- Merkle-Patricia Trie (MPT) State Root (Eq. 2)
- Forensic Incident Attribution Tuples (Eq. 8)
- Substrate Block Runtime & User Session Persistence
"""

from __future__ import annotations

import hashlib
import json
import time
from typing import Any, Dict, List, Optional


def keccak_256(data: str | bytes) -> str:
    """Simulated Keccak-256 / SHA3-256 hashing for Merkle-Patricia Trie root representation."""
    if isinstance(data, str):
        data = data.encode("utf-8")
    return hashlib.sha3_256(data).hexdigest()


def sha256_hex(data: str | bytes) -> str:
    """Standard SHA-256 digest in hex."""
    if isinstance(data, str):
        data = data.encode("utf-8")
    return hashlib.sha256(data).hexdigest()


def sha3_256_hex(data: str | bytes) -> str:
    """Standard SHA3-256 digest in hex."""
    if isinstance(data, str):
        data = data.encode("utf-8")
    return hashlib.sha3_256(data).hexdigest()


class MerkleLedger:
    """
    Append-only in-memory storage simulating a private Substrate blockchain.
    Manages Proof-of-Agency state transitions, Merkle-Patricia root commitments,
    forensic incident sealing, and user sovereign chat history blocks.
    """

    def __init__(self, initial_block: int = 1048) -> None:
        self.blockchain_state: List[Dict[str, Any]] = []
        self.current_block: int = initial_block
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

    def compute_poa_intent(
        self,
        czk: str,
        agent_uuid: str,
        tool_uri: str,
        payload_output: str,
        epoch_time: Optional[int] = None,
    ) -> Dict[str, str]:
        """
        Calculates canonical Proof-of-Agency (PoA) intent digest tau_audit (Eq. 1 in IEEE spec):
          tau_audit = SHA256( POA || C_ZK || Agent_UUID || H(Tool_URI) || H(Phi_output) || T_epoch )
        """
        t_epoch = epoch_time or int(time.time())
        tool_uri_hash = sha256_hex(tool_uri)
        payload_hash = sha256_hex(payload_output)

        tuple_str = f"POA:{czk}:{agent_uuid}:{tool_uri_hash}:{payload_hash}:{t_epoch}"
        intent_hash = sha256_hex(tuple_str)

        return {
            "toolUriHash": "0x" + tool_uri_hash,
            "payloadHash": "0x" + payload_hash,
            "intentHash": "0x" + intent_hash,
            "epochTime": str(t_epoch),
        }

    def compute_mpt_state_root(self, leaves: List[Dict[str, str]]) -> Dict[str, Any]:
        """
        Calculates Merkle-Patricia Trie (MPT) State Root R_state from leaf nodes (Eq. 2 in IEEE spec):
          R_state = MerkleRoot(Leaf_1, Leaf_2, ..., Leaf_N)
        """
        if not leaves:
            return {"stateRoot": "0x" + sha256_hex("EMPTY_MPT_ROOT"), "leaves": []}

        leaf_hashes = [
            sha256_hex(f"LEAF:{leaf.get('key','')}:{leaf.get('nibblePath','')}:{leaf.get('val','')}")
            for leaf in leaves
        ]

        current_level = leaf_hashes
        while len(current_level) > 1:
            next_level = []
            for i in range(0, len(current_level), 2):
                if i + 1 < len(current_level):
                    combined = sha256_hex(current_level[i] + current_level[i + 1])
                    next_level.append(combined)
                else:
                    next_level.append(current_level[i])
            current_level = next_level

        state_root = "0x" + current_level[0]
        return {"stateRoot": state_root, "leaves": leaves}

    def compute_forensic_incident_tuple(
        self,
        attacker_ip: str,
        fingerprint_tcp: str,
        canary_id: str,
        t_capture: Optional[str] = None,
    ) -> Dict[str, str]:
        """
        Calculates Forensic Incident Tuple digest tau_incident (Eq. 8 in IEEE spec):
          tau_incident = SHA256( INCIDENT || Attacker_IP || Fingerprint_TCP || Canary_ID || T_capture )
        """
        t_str = t_capture or time.strftime("%Y-%m-%dT%H:%M:%SZ")
        raw = f"INCIDENT:{attacker_ip}:{fingerprint_tcp}:{canary_id}:{t_str}"
        incident_hash = sha256_hex(raw)
        return {
            "tau_incident": "0x" + incident_hash,
            "attacker_ip": attacker_ip,
            "fingerprint_tcp": fingerprint_tcp,
            "canary_id": canary_id,
            "capture_timestamp": t_str,
        }

    def commit_intent(
        self,
        agent_id: str,
        action_hash: str,
        tau_cap: str,
        payload_digest: str,
    ) -> Dict[str, Any]:
        """
        Synthesizes Proof-of-Agency commitment into a Substrate block.
        """
        t_epoch = int(time.time())
        audit_raw = f"{tau_cap}:{agent_id}:{action_hash}:{payload_digest}:{t_epoch}"
        tau_audit = sha3_256_hex(audit_raw)
        merkle_root = "0x" + keccak_256(f"{self.current_block}:{tau_audit}")
        tx_hash = "0x" + sha3_256_hex(f"EXTRINSIC:{tau_audit}:{self.current_block}")
        block_height = self.current_block

        receipt = {
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

        self.blockchain_state.append(receipt)
        self.current_block += 1
        return receipt

    def seal_incident_tuple(
        self,
        incident_id: str,
        vector: str,
        canary_token: str,
        ip_attribution: str,
        client_fingerprint: str,
        evidence_payload: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Seals tamper-proof forensic evidence to a finalized Substrate block.
        """
        t_epoch = int(time.time())
        incident_tuple_raw = f"{incident_id}:{vector}:{canary_token}:{ip_attribution}:{client_fingerprint}:{t_epoch}"
        evidence_digest = sha3_256_hex(incident_tuple_raw)
        merkle_root = "0x" + keccak_256(f"{self.current_block}:INCIDENT:{evidence_digest}")
        tx_hash = "0x" + sha3_256_hex(f"FORENSIC_SEAL:{evidence_digest}:{self.current_block}")
        block_height = self.current_block

        receipt = {
            "blockHeight": block_height,
            "txHash": tx_hash,
            "incidentId": incident_id,
            "evidenceDigest": "0x" + evidence_digest,
            "merkleRoot": merkle_root,
            "vector": vector,
            "canaryToken": canary_token,
            "ipAttribution": ip_attribution,
            "status": "EVIDENCE_SEALED",
            "timestamp": t_epoch,
            "consensus": "AURA-GRANDPA",
            "type": "FORENSIC_EVIDENCE_BLOCK",
            "evidencePayload": evidence_payload,
        }

        self.blockchain_state.append(receipt)
        self.current_block += 1
        return receipt

    def commit_user_session(
        self,
        user_id: str,
        session_id: str,
        session_title: str,
        encrypted_payload: str,
        messages: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """
        Saves a user's isolated session sandbox history into a dedicated Substrate blockchain block.
        """
        t_epoch = int(time.time())
        history_raw = f"USER_SESSION:{user_id}:{session_id}:{len(messages)}:{t_epoch}"
        tx_hash = "0x" + sha3_256_hex(history_raw)
        merkle_root = "0x" + keccak_256(f"{self.current_block}:{user_id}:{tx_hash}")
        block_height = self.current_block

        block_entry = {
            "blockHeight": block_height,
            "txHash": tx_hash,
            "merkleRoot": merkle_root,
            "userId": user_id,
            "sessionId": session_id,
            "sessionTitle": session_title,
            "encryptedPayload": encrypted_payload,
            "messages": messages,
            "timestamp": t_epoch,
            "consensus": "AURA-GRANDPA",
            "type": "USER_SESSION_BLOCK",
            "status": "FINALIZED",
        }

        self.blockchain_state.append(block_entry)
        self.current_block += 1

        return {
            "status": "FINALIZED",
            "blockHeight": block_height,
            "txHash": tx_hash,
            "merkleRoot": merkle_root,
            "userId": user_id,
            "sessionId": session_id,
            "timestamp": t_epoch,
            "totalMessagesSaved": len(messages),
        }

    def get_user_session(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieves the latest committed session sandbox block for a specific user from the blockchain.
        """
        norm_user_id = user_id.lower().trim() if hasattr(user_id, "trim") else user_id.lower().strip()
        for block in reversed(self.blockchain_state):
            if block.get("type") == "USER_SESSION_BLOCK":
                b_uid = str(block.get("userId", "")).lower().strip()
                if b_uid == norm_user_id:
                    return block
        return None

    def get_all_blocks(self) -> List[Dict[str, Any]]:
        return list(self.blockchain_state)

    def get_block_by_height(self, height: int) -> Optional[Dict[str, Any]]:
        for block in self.blockchain_state:
            if block["blockHeight"] == height:
                return block
        return None


# Global default instance
default_ledger = MerkleLedger()
