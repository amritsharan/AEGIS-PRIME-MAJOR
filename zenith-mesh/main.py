"""
Zenith-Mesh Microservice (Layer 4)
Aegis-Prime Sovereign Intelligence Mesh — Proof-of-Agency Merkle Ledger & HyperSpace FL.
Running on Port 9944.
"""

from __future__ import annotations

import logging
import os
import sys
from typing import Any, Dict, List, Optional

_current_dir = os.path.dirname(os.path.abspath(__file__))
if _current_dir not in sys.path:
    sys.path.insert(0, _current_dir)

import uvicorn
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from core.merkle_ledger import default_ledger
from core.hyperspace_fl import default_hyperspace_fl

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [ZENITH-MESH-L4] %(message)s",
)
logger = logging.getLogger("zenith_mesh")

# Initialize FastAPI application
app = FastAPI(
    title="Zenith-Mesh Proof-of-Agency Ledger & HyperSpace FL",
    version="2.0.0",
    description="Layer 4 Substrate Proof-of-Agency Ledger, MPT State Roots, and Byzantine-Tolerant Federated Learning Microservice",
)

# Configure CORS headers
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8443",
    "http://127.0.0.1:8443",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================================================
# Request Models
# =====================================================================

class CommitIntentRequest(BaseModel):
    agentId: str = Field(..., description="Unique sovereign agent identifier")
    actionHash: str = Field(..., description="Hash of the intended model action or prompt execution")
    tau_cap: str = Field(..., description="Lumina-Auth capability token")
    payloadDigest: str = Field(..., description="Cryptographic digest of the model output / AST")


class CommitIncidentRequest(BaseModel):
    attackerIp: str = Field(..., description="Attacker IP address triggering canary honey-grid trap")
    canaryId: str = Field(..., description="Unique canary beacon identifier")
    signature: str = Field("SEALED_CHAIN_OF_CUSTODY", description="Cryptographic honey-grid signature")


class GradientAggregationRequest(BaseModel):
    gradients: List[List[float]] = Field(..., description="List of client gradient vectors")
    apply_dp: Optional[bool] = Field(False, description="Whether to apply Gaussian Differential Privacy noise")
    epsilon: Optional[float] = Field(0.5, description="Privacy parameter epsilon")
    delta: Optional[float] = Field(1e-5, description="Privacy parameter delta")


class UserSessionSaveRequest(BaseModel):
    userId: str = Field(..., description="User unique identifier (e.g. email or sovereign UID)")
    sessionId: str = Field(..., description="Active session ID")
    sessionTitle: Optional[str] = Field("Sovereign Session", description="Title of the session")
    encryptedPayload: Optional[str] = Field("", description="Encrypted serialized state")
    messages: List[Dict[str, Any]] = Field(..., description="List of session chat messages")


class PoAComputeRequest(BaseModel):
    czk: str = Field(..., description="Poseidon commitment root from Lumina-Auth (C_ZK)")
    agentUuid: str = Field(..., description="Wasm sandbox agent identifier")
    toolUri: str = Field(..., description="Requested capability resource identifier")
    payloadOutput: str = Field(..., description="Synthesized payload evaluated by safety shield")
    epochTime: Optional[int] = Field(None, description="System epoch timestamp")


class MPTRootRequest(BaseModel):
    leaves: List[Dict[str, str]] = Field(..., description="List of leaf nodes with key, nibblePath, val")


class ForensicTupleRequest(BaseModel):
    attackerIp: str = Field(..., description="Attacker IP address")
    fingerprintTcp: str = Field(..., description="TCP / Browser TLS fingerprint")
    canaryId: str = Field(..., description="Canary beacon identifier")
    tCapture: Optional[str] = Field(None, description="Capture timestamp")


# =====================================================================
# Telemetry & Status Routes
# =====================================================================

@app.get("/health", tags=["Telemetry"])
async def health_check() -> Dict[str, Any]:
    return {
        "service": "zenith-mesh",
        "status": "CONSENSUS_ONLINE",
        "layer": 4,
        "port": 9944,
        "consensus": "AURA-GRANDPA",
        "current_block": default_ledger.current_block,
    }


@app.get("/ledger/state", tags=["Blockchain State"])
async def get_ledger_state() -> Dict[str, Any]:
    return {
        "current_block": default_ledger.current_block,
        "total_extrinsics": len(default_ledger.blockchain_state),
        "consensus": "AURA-GRANDPA",
        "chain": default_ledger.get_all_blocks()[-10:],
    }


@app.get("/ledger/blocks", tags=["Blockchain State"])
async def get_all_blocks() -> List[Dict[str, Any]]:
    return default_ledger.get_all_blocks()


# =====================================================================
# IEEE Zenith-Mesh Protocol Routes
# =====================================================================

@app.post("/ledger/poa/compute", tags=["IEEE Specification"])
async def compute_poa_intent_endpoint(request_data: PoAComputeRequest) -> Dict[str, Any]:
    """
    Computes canonical Proof-of-Agency (PoA) intent digest tau_audit (Eq. 1 in IEEE spec):
      tau_audit = SHA256( POA || C_ZK || Agent_UUID || H(Tool_URI) || H(Phi_output) || T_epoch )
    """
    return default_ledger.compute_poa_intent(
        czk=request_data.czk,
        agent_uuid=request_data.agentUuid,
        tool_uri=request_data.toolUri,
        payload_output=request_data.payloadOutput,
        epoch_time=request_data.epochTime,
    )


@app.post("/ledger/mpt/root", tags=["IEEE Specification"])
async def compute_mpt_root_endpoint(request_data: MPTRootRequest) -> Dict[str, Any]:
    """
    Computes Merkle-Patricia Trie (MPT) State Root R_state from leaf nodes (Eq. 2 in IEEE spec):
      R_state = MerkleRoot(Leaf_1, ..., Leaf_N)
    """
    return default_ledger.compute_mpt_state_root(request_data.leaves)


@app.post("/ledger/forensic/tuple", tags=["IEEE Specification"])
async def compute_forensic_tuple_endpoint(request_data: ForensicTupleRequest) -> Dict[str, Any]:
    """
    Computes Forensic Incident Tuple digest tau_incident (Eq. 8 in IEEE spec):
      tau_incident = SHA256( INCIDENT || Attacker_IP || Fingerprint_TCP || Canary_ID || T_capture )
    """
    return default_ledger.compute_forensic_incident_tuple(
        attacker_ip=request_data.attackerIp,
        fingerprint_tcp=request_data.fingerprintTcp,
        canary_id=request_data.canaryId,
        t_capture=request_data.tCapture,
    )


@app.post("/ledger/extrinsic", tags=["Transactions"])
async def commit_extrinsic(request_data: CommitIntentRequest) -> Dict[str, Any]:
    receipt = default_ledger.commit_intent(
        agent_id=request_data.agentId,
        action_hash=request_data.actionHash,
        tau_cap=request_data.tau_cap,
        payload_digest=request_data.payloadDigest,
    )
    return receipt


@app.post("/ledger/incident", tags=["Forensic"])
async def commit_incident(request_data: CommitIncidentRequest) -> Dict[str, Any]:
    receipt = default_ledger.seal_incident_tuple(
        incident_id=f"INCIDENT-{default_ledger.current_block}",
        vector="CANARY_HONEY_GRID_TRAP",
        canary_token=request_data.canaryId,
        ip_attribution=request_data.attackerIp,
        client_fingerprint=request_data.signature,
        evidence_payload={"source": "Layer-3 Cypher-Shield Ingress Filter"},
    )
    return receipt


# =====================================================================
# HYPERSPACE FEDERATED LEARNING
# =====================================================================

@app.post("/ledger/fl/aggregate", tags=["Federated Learning"])
async def aggregate_gradients(request_data: GradientAggregationRequest) -> Dict[str, Any]:
    """
    Performs Byzantine-tolerant coordinate-wise median aggregation (Eq. 6).
    Optionally applies Gaussian Differential Privacy noise (Eq. 5) and
    calculates comparative FedAvg to demonstrate attack mitigation.
    """
    try:
        raw_gradients = request_data.gradients
        dp_noise_sigma = 0.0

        if request_data.apply_dp and len(raw_gradients) > 0:
            noisy_list = []
            for grad in raw_gradients:
                noisy_grad, sigma = default_hyperspace_fl.add_differential_privacy_noise(
                    grad,
                    epsilon=request_data.epsilon or 0.5,
                    delta=request_data.delta or 1e-5,
                )
                noisy_list.append(noisy_grad)
                dp_noise_sigma = sigma
            target_gradients = noisy_list
        else:
            target_gradients = raw_gradients

        aggregated = default_hyperspace_fl.coordinate_median_aggregation(target_gradients)
        fed_avg = default_hyperspace_fl.fed_avg_comparison(target_gradients)

        return {
            "status": "AGGREGATION_FINALIZED",
            "strategy": "COORDINATE_WISE_MEDIAN_BYZANTINE_FAULT_TOLERANT",
            "dp_applied": request_data.apply_dp,
            "dp_sigma": dp_noise_sigma,
            "dimension": len(aggregated),
            "client_nodes": len(target_gradients),
            "aggregated_gradient": aggregated,
            "fed_avg_gradient": fed_avg,
            "byzantine_resilience": "Protected against up to 50% arbitrary poisoned gradients",
        }
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))


# =====================================================================
# SOVEREIGN USER BLOCKCHAIN HISTORY
# =====================================================================

@app.post("/ledger/user/history", tags=["User Sovereign Sandbox"])
async def save_user_history(payload: UserSessionSaveRequest) -> Dict[str, Any]:
    """
    Commits a user's isolated session sandbox query history into a dedicated Substrate blockchain block.
    """
    try:
        receipt = default_ledger.commit_user_session(
            user_id=payload.userId,
            session_id=payload.sessionId,
            session_title=payload.sessionTitle or "Sovereign Session",
            encrypted_payload=payload.encryptedPayload or "",
            messages=payload.messages,
        )
        return receipt
    except Exception as e:
        logger.error("Failed to commit user session block: %s", str(e))
        raise HTTPException(status_code=500, detail=f"Failed to commit user session to blockchain: {str(e)}")


@app.get("/ledger/user/{userId}/history", tags=["User Sovereign Sandbox"])
async def get_user_history(userId: str) -> Dict[str, Any]:
    """
    Restores a user's isolated session history from their dedicated Substrate blockchain block.
    """
    block = default_ledger.get_user_session(userId)
    if not block:
        return {
            "userId": userId,
            "status": "NOT_FOUND",
            "messages": [],
            "message": f"No historical blockchain session block found for user {userId}.",
        }
    return block


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9944)
