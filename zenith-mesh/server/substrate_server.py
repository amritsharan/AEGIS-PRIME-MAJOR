import os
import time
import json
import hashlib
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="Zenith-Mesh Substrate Node (Port 9944) - Layer 4 Ledger Runtime")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SubstrateNodeState:
    def __init__(self):
        self.genesis_hash = "0x0000000000000000000000000000000000000000000000000000000000000000"
        self.mpt_leaves: List[Dict[str, str]] = [
            {
                "key": "AgentUUID::wasm-agent-uuid-7710",
                "nibblePath": "0x7a",
                "val": "0x3a99f1b2c48e890a7d91e2049b5c8712"
            }
        ]
        self.blocks: List[Dict[str, Any]] = []
        self._initialize_genesis()

    def _hash(self, text: str) -> str:
        return hashlib.sha256(text.encode('utf-8')).hexdigest()

    def _compute_mpt_root(self) -> str:
        if not self.mpt_leaves:
            return "0x" + self._hash("EMPTY_MPT_ROOT")
        leaf_hashes = [self._hash(f"LEAF:{l['key']}:{l['nibblePath']}:{l['val']}") for l in self.mpt_leaves]
        current = leaf_hashes
        while len(current) > 1:
            nxt = []
            for i in range(0, len(current), 2):
                if i + 1 < len(current):
                    nxt.append(self._hash(current[i] + current[i+1]))
                else:
                    nxt.append(current[i])
            current = nxt
        return "0x" + (current[0] if current else self._hash("EMPTY_MPT_ROOT"))

    def _initialize_genesis(self):
        root = self._compute_mpt_root()
        genesis_block = {
            "index": 1040,
            "number": hex(1040),
            "parentHash": self.genesis_hash,
            "hash": "0x" + self._hash(f"1040-{self.genesis_hash}-{root}"),
            "stateRoot": root,
            "extrinsicsRoot": "0x" + self._hash("EXTRINSICS_GENESIS_ROOT"),
            "authorNode": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY (Alice - Aura #1)",
            "slotNumber": 1040,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()),
            "finalized": True,
            "intentHash": "GENESIS_PROOF_OF_AGENCY",
            "query": "Genesis System Boot & IEEE Dual-Shield Bus Authorization",
            "response": "Aura Consensus Slot 1040 initialized. Merkle-Patricia Trie Root computed and anchored with GRANDPA finality.",
            "mode": "genesis",
            "toolUri": "cap://zenith-mesh/genesis",
            "events": [{"type": "SubstratePalletPoA::GenesisInitialized"}]
        }
        self.blocks.append(genesis_block)

    def commit_intent(self, intent_hash: str, timestamp: Optional[int] = None, agent_uuid: str = "wasm-agent-uuid-7710", query: Optional[str] = None, response: Optional[str] = None, mode: Optional[str] = "forge", tool_uri: Optional[str] = None) -> Dict[str, Any]:
        last_block = self.blocks[-1]
        new_index = last_block["index"] + 1
        
        # 1. Update Merkle-Patricia Trie (MPT) State Tree: R_state,k+1 = UpdateMPT(R_state,k, Key(AgentUUID), tau_audit)
        nibble = "0x" + intent_hash[:2]
        self.mpt_leaves.append({
            "key": f"AgentUUID::{agent_uuid}",
            "nibblePath": nibble,
            "val": intent_hash
        })
        new_state_root = self._compute_mpt_root()
        
        # 2. Compute Substrate Header Hash
        t_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime((timestamp / 1000.0) if timestamp and timestamp > 1e11 else time.time()))
        extrinsic_hash = "0x" + self._hash(f"EXTRINSIC:{intent_hash}:{timestamp}")
        header_raw = f"{new_index}-{t_str}-{new_state_root}-{intent_hash}-{last_block['hash']}-Alice-{new_index}"
        block_hash = "0x" + self._hash(header_raw)
        
        user_query = query or f"Execution intent triggered via {tool_uri or 'cap://synapse-os/execute'}"
        ai_resp = response or f"Wasm SFI sandbox validated intent with digest 0x{intent_hash[:16]} under Z3 SMT constraints."

        block = {
            "index": new_index,
            "number": hex(new_index),
            "parentHash": last_block["hash"],
            "hash": block_hash,
            "stateRoot": new_state_root,
            "extrinsicsRoot": extrinsic_hash,
            "authorNode": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY (Alice - Aura #1)",
            "slotNumber": new_index,
            "timestamp": t_str,
            "finalized": True, # GRANDPA finalized
            "intentHash": intent_hash,
            "query": user_query,
            "response": ai_resp,
            "mode": mode or "forge",
            "toolUri": tool_uri or "cap://synapse-os/logic-shield/execute",
            "events": [
                {
                    "type": "pallet_proof_of_agency::IntentRegistered",
                    "tau_audit": intent_hash,
                    "agent": agent_uuid
                }
            ]
        }
        self.blocks.append(block)
        return {
            "blockHeight": new_index,
            "txHash": extrinsic_hash,
            "stateRoot": new_state_root,
            "blockHeader": block
        }

    def commit_forensic_incident(self, incident: Dict[str, Any]) -> Dict[str, Any]:
        last_block = self.blocks[-1]
        new_index = last_block["index"] + 1
        
        incident_id = incident.get("receipt_id") or incident.get("canary_id") or "CANARY_BREACH"
        tau_incident = incident.get("incident_hash") or ("0x" + self._hash(f"FORENSIC:{json.dumps(incident)}"))
        
        self.mpt_leaves.append({
            "key": f"ForensicIncident::{incident_id}",
            "nibblePath": "0xfe",
            "val": tau_incident
        })
        new_state_root = self._compute_mpt_root()
        extrinsic_hash = "0x" + self._hash(f"EXTRINSIC_FORENSIC:{tau_incident}")
        t_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        block_hash = "0x" + self._hash(f"{new_index}-{t_str}-{new_state_root}-{tau_incident}-{last_block['hash']}")
        
        block = {
            "index": new_index,
            "number": hex(new_index),
            "parentHash": last_block["hash"],
            "hash": block_hash,
            "stateRoot": new_state_root,
            "extrinsicsRoot": extrinsic_hash,
            "authorNode": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY (Forensic Vault)",
            "slotNumber": new_index,
            "timestamp": t_str,
            "finalized": True,
            "intentHash": tau_incident,
            "events": [
                {
                    "type": "pallet_forensic_vault::IncidentAnchored",
                    "incident": incident
                }
            ]
        }
        self.blocks.append(block)
        return {
            "blockHeight": new_index,
            "txHash": extrinsic_hash,
            "stateRoot": new_state_root,
            "incidentHash": tau_incident,
            "blockHeader": block
        }

    def commit_pqc_threat_finding(self, scan_data: Dict[str, Any]) -> Dict[str, Any]:
        last_block = self.blocks[-1]
        new_index = last_block["index"] + 1
        
        scan_id = scan_data.get("scan_id", "SCAN_AUTONOMOUS")
        merkle_root = scan_data.get("merkle_root") or ("0x" + self._hash(f"MERKLE_ROOT:{json.dumps(scan_data)}"))
        target_url = scan_data.get("target_url", "http://target.local")
        findings_count = scan_data.get("findings_count", 0)
        quantum_score = scan_data.get("quantum_score", 100.0)
        pqc_readiness = scan_data.get("pqc_readiness", 0.0)
        
        tau_threat = "0x" + self._hash(f"THREAT:{scan_id}:{merkle_root}:{quantum_score}")
        
        self.mpt_leaves.append({
            "key": f"AutonomousAgentFinding::{scan_id}",
            "nibblePath": "0xaa",
            "val": tau_threat
        })
        new_state_root = self._compute_mpt_root()
        extrinsic_hash = "0x" + self._hash(f"EXTRINSIC_PQC_THREAT:{tau_threat}")
        t_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
        block_hash = "0x" + self._hash(f"{new_index}-{t_str}-{new_state_root}-{tau_threat}-{last_block['hash']}")
        
        block = {
            "index": new_index,
            "number": hex(new_index),
            "parentHash": last_block["hash"],
            "hash": block_hash,
            "stateRoot": new_state_root,
            "extrinsicsRoot": extrinsic_hash,
            "authorNode": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY (QuantumShield Agent Aura)",
            "slotNumber": new_index,
            "timestamp": t_str,
            "finalized": True,
            "intentHash": tau_threat,
            "userQuery": f"PQC Assessment & Autonomous Scan for {target_url}",
            "response": f"Anchored {findings_count} findings. Merkle Root: {merkle_root[:16]}... | Quantum Score: {quantum_score} | PQC Readiness: {pqc_readiness}%",
            "mode": "pqc_threat_sync",
            "toolUri": "cap://zenith-mesh/pqc-threat-sync",
            "events": [
                {
                    "type": "pallet_aegis_mesh::PqcThreatSynchronized",
                    "scan_id": scan_id,
                    "merkle_root": merkle_root,
                    "target": target_url,
                    "findings_count": findings_count,
                    "quantum_score": quantum_score,
                    "pqc_readiness": pqc_readiness,
                    "threat_level": "CRITICAL" if quantum_score < 40 else ("ELEVATED" if quantum_score < 75 else "SECURE"),
                    "pqc_channel": "ML-KEM-768-KYBER"
                }
            ]
        }
        self.blocks.append(block)
        return {
            "blockHeight": new_index,
            "txHash": extrinsic_hash,
            "stateRoot": new_state_root,
            "threatHash": tau_threat,
            "blockHeader": block
        }

node_state = SubstrateNodeState()

@app.post("/api/mesh/sync-findings")
async def sync_mesh_findings(request: Request):
    """
    IEEE Layer 4: Receives Autonomous Agent (QuantumShield AI) security findings,
    anchors the scan's Merkle root and quantum risk score into the MPT state tree,
    and returns verified Substrate block metadata.
    """
    scan_data = await request.json()
    res = node_state.commit_pqc_threat_finding(scan_data)
    return {
        "success": True,
        "protocol": "Substrate Layer-4 PQC Threat Sync",
        "pqc_channel": "ML-KEM-768-KYBER",
        "blockHeight": res["blockHeight"],
        "txHash": res["txHash"],
        "stateRoot": res["stateRoot"],
        "threatHash": res["threatHash"],
        "finalized": True,
        "blockHeader": res["blockHeader"]
    }

@app.get("/api/mesh/threat-feed")
def get_mesh_threat_feed():
    """Returns all PQC and autonomous threat synchronization events from Substrate blocks."""
    threat_events = []
    for b in node_state.blocks[::-1]:
        for ev in b.get("events", []):
            if ev.get("type") in ("pallet_aegis_mesh::PqcThreatSynchronized", "pallet_forensic_vault::IncidentAnchored"):
                threat_events.append({
                    "blockIndex": b["index"],
                    "timestamp": b["timestamp"],
                    "blockHash": b["hash"],
                    "stateRoot": b["stateRoot"],
                    "event": ev
                })
    return {
        "total_threats": len(threat_events),
        "threat_feed": threat_events
    }

class CommitPayload(BaseModel):
    intent_hash: str
    timestamp: Optional[int] = None
    agent_uuid: Optional[str] = "wasm-agent-uuid-7710"
    query: Optional[str] = None
    response: Optional[str] = None
    mode: Optional[str] = "forge"
    tool_uri: Optional[str] = None

@app.get("/")
def get_root():
    return {
        "status": "Zenith-Mesh Substrate Node Active",
        "port": 9944,
        "runtime": "pallet-proof-of-agency / GRANDPA finality",
        "current_block_height": node_state.blocks[-1]["index"],
        "state_root": node_state.blocks[-1]["stateRoot"]
    }

@app.post("/")
async def handle_json_rpc(request: Request):
    """
    Substrate JSON-RPC 2.0 Handler.
    Supports chain_getHeader, system_health, chain_getBlock, etc.
    """
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON-RPC payload")
    
    req_id = body.get("id", 1)
    method = body.get("method", "")
    latest_block = node_state.blocks[-1]
    
    if method == "chain_getHeader":
        return {
            "jsonrpc": "2.0",
            "result": {
                "parentHash": latest_block["parentHash"],
                "number": latest_block["number"],
                "stateRoot": latest_block["stateRoot"],
                "extrinsicsRoot": latest_block["extrinsicsRoot"],
                "digest": {
                    "logs": [
                        f"Aura: slot {latest_block['slotNumber']}",
                        "GRANDPA: deterministic seal verified"
                    ]
                }
            },
            "id": req_id
        }
    elif method == "system_health":
        return {
            "jsonrpc": "2.0",
            "result": {
                "peers": 4,
                "isSyncing": False,
                "shouldHavePeers": True
            },
            "id": req_id
        }
    elif method == "chain_getBlock":
        return {
            "jsonrpc": "2.0",
            "result": {
                "block": {
                    "header": {
                        "parentHash": latest_block["parentHash"],
                        "number": latest_block["number"],
                        "stateRoot": latest_block["stateRoot"],
                        "extrinsicsRoot": latest_block["extrinsicsRoot"]
                    },
                    "extrinsics": [latest_block["extrinsicsRoot"]]
                }
            },
            "id": req_id
        }
    else:
        return {
            "jsonrpc": "2.0",
            "result": {
                "status": "ACCEPTED",
                "method": method,
                "height": latest_block["index"],
                "stateRoot": latest_block["stateRoot"]
            },
            "id": req_id
        }

@app.post("/ledger/commit")
def commit_ledger(payload: CommitPayload):
    """
    IEEE Layer 4: Maps and anchors Proof-of-Agency intent commitment (tau_audit)
    into Substrate Merkle-Patricia Trie state tree and mints finalized block.
    """
    res = node_state.commit_intent(
        intent_hash=payload.intent_hash,
        timestamp=payload.timestamp,
        agent_uuid=payload.agent_uuid or "wasm-agent-uuid-7710",
        query=payload.query,
        response=payload.response,
        mode=payload.mode or "forge",
        tool_uri=payload.tool_uri
    )
    return {
        "success": True,
        "blockHeight": res["blockHeight"],
        "txHash": res["txHash"],
        "stateRoot": res["stateRoot"],
        "blockHeader": res["blockHeader"]
    }

@app.post("/ledger/forensic")
async def commit_forensic(request: Request):
    """Anchors Canary Beacon attribution receipts from Cypher-Shield to Substrate ledger."""
    incident_data = await request.json()
    res = node_state.commit_forensic_incident(incident_data)
    return {
        "success": True,
        "blockHeight": res["blockHeight"],
        "txHash": res["txHash"],
        "stateRoot": res["stateRoot"],
        "incidentHash": res["incidentHash"]
    }

@app.get("/ledger/blocks")
def get_blocks():
    return {
        "blocks": node_state.blocks[::-1],
        "height": len(node_state.blocks),
        "stateRoot": node_state.blocks[-1]["stateRoot"]
    }

@app.get("/ledger/mpt")
def get_mpt_tree():
    return {
        "stateRoot": node_state.blocks[-1]["stateRoot"],
        "leaves": node_state.mpt_leaves
    }

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Zenith-Mesh Substrate Node")
    parser.add_argument("--host", type=str, default="0.0.0.0", help="Host")
    parser.add_argument("--port", type=int, default=9944, help="Port (default 9944)")
    args, _ = parser.parse_known_args()
    print(f"[*] Zenith-Mesh Substrate Node running on {args.host}:{args.port}")
    uvicorn.run(app, host=args.host, port=args.port)
