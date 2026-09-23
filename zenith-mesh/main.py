"""
Zenith-Mesh Microservice (Layer 4)
Aegis-Prime Sovereign Intelligence Mesh — Proof-of-Agency Merkle Ledger.
Running on Port 9944.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional
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
    title="Zenith-Mesh Proof-of-Agency Ledger",
    version="1.0.0",
    description="Layer 4 Substrate Proof-of-Agency Ledger and Byzantine-Tolerant Federated Learning Microservice",
)

# Configure CORS headers
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:8443",
    "http://127.0.0.1:8443",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request schemas
class CommitIntentRequest(BaseModel):
    agentId: str = Field(..., description="Unique sovereign agent identifier")
    actionHash: str = Field(..., description="Hash of the intended model action or prompt execution")
    tau_cap: str = Field(..., description="Lumina-Auth capability token")
    payloadDigest: str = Field(..., description="Cryptographic digest of the model output / AST")


class CommitIncidentRequest(BaseModel):
    attackerIp: str = Field(..., description="Attacker IP address triggering canary honey-grid trap")
    canaryId: str = Field(..., description="Unique canary beacon identifier")
    signature: str = Field(..., description="Cryptographic honey-grid signature")


class GradientAggregationRequest(BaseModel):
    gradients: List[List[float]] = Field(..., description="List of client gradient vectors")


@app.get("/health", tags=["Telemetry"])
async def health_check() -> Dict[str, Any]:
    """
    Zenith-Mesh consensus and node telemetry status.
    """
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
    """
    Returns Substrate blockchain state metrics: current block, total extrinsics, and consensus model.
    """
    state = default_ledger.get_state()
    logger.info("Ledger state queried: Block=%d, Extrinsics=%d", state["current_block"], state["total_extrinsics"])
    return state


@app.get("/ledger/latest", tags=["Blockchain State"])
async def get_latest_blocks(limit: int = 10) -> List[Dict[str, Any]]:
    """
    Returns the latest finalized block receipts from the in-memory Substrate ledger.
    """
    blocks = default_ledger.get_latest_blocks(limit=limit)
    return blocks


@app.post("/ledger/commit", tags=["Proof-of-Agency"])
async def commit_intent_extrinsic(req: CommitIntentRequest) -> Dict[str, Any]:
    """
    Commits a Proof-of-Agency intent extrinsic to the Substrate Merkle ledger.
    Returns finalized transaction receipt with blockHeight, txHash, merkleRoot, status.
    """
    try:
        receipt = default_ledger.commit_intent(
            agent_id=req.agentId,
            action_hash=req.actionHash,
            tau_cap=req.tau_cap,
            payload_digest=req.payloadDigest,
        )
        logger.info(
            "Proof-of-Agency extrinsic finalized at block #%d with txHash=%s for agent %s",
            receipt["blockHeight"],
            receipt["txHash"],
            receipt["agentId"],
        )
        return receipt
    except Exception as exc:
        logger.exception("Failed to commit intent to Zenith-Mesh ledger: %s", str(exc))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ledger commitment failure: {str(exc)}",
        )


@app.post("/ledger/incident", tags=["Forensic Incident Vault"])
async def commit_forensic_incident(req: CommitIncidentRequest) -> Dict[str, Any]:
    """
    Forensic incident sealing endpoint for Honey-Grid canary breach records.
    Returns incident sealing receipt with evidenceHash, blockHeight, and txHash.
    """
    try:
        receipt = default_ledger.commit_incident(
            attacker_ip=req.attackerIp,
            canary_id=req.canaryId,
            signature=req.signature,
        )
        logger.warning(
            "Forensic incident sealed at block #%d with evidenceHash=%s for IP %s",
            receipt["blockHeight"],
            receipt["evidenceHash"],
            req.attackerIp,
        )
        return receipt
    except Exception as exc:
        logger.exception("Failed to commit forensic incident: %s", str(exc))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Incident sealing failure: {str(exc)}",
        )


@app.post("/fl/aggregate", tags=["Federated Learning"])
async def aggregate_gradients(req: GradientAggregationRequest) -> Dict[str, Any]:
    """
    Byzantine-tolerant coordinate-wise median aggregation over federated LoRA gradients.
    """
    try:
        aggregated = default_hyperspace_fl.coordinate_median_aggregation(req.gradients)
        return {
            "status": "AGGREGATION_SUCCESSFUL",
            "topic": default_hyperspace_fl.topic,
            "dimension": len(aggregated),
            "aggregated_gradient": aggregated,
        }
    except Exception as exc:
        logger.exception("Federated learning aggregation error: %s", str(exc))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Gradient aggregation failure: {str(exc)}",
        )


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=9944, reload=False)
