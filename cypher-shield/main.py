"""
Cypher-Shield Microservice (Layer 3)
Aegis-Prime Sovereign Intelligence Mesh — Post-Quantum Cryptographic Tunnel.
Running on Port 9200.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, Optional
import uvicorn
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from core.lattice import IngressSecurityTrap, default_lattice
from core.honey_grid import default_honey_grid

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [CYPHER-SHIELD-L3] %(message)s",
)
logger = logging.getLogger("cypher_shield")

# Initialize FastAPI application
app = FastAPI(
    title="Cypher-Shield PQC Tunnel",
    version="1.0.0",
    description="Layer 3 Post-Quantum Cryptographic (ML-KEM-768) and Active Honey-Grid Microservice",
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


# Request and Response schemas
class EncapsulateRequest(BaseModel):
    payload: str = Field(..., description="Prompt or payload to be encapsulated with post-quantum lattice security")
    tau_cap: Optional[str] = Field(None, description="Lumina-Auth capability token. Must start with 'CAP_'")
    client_ip: Optional[str] = Field("127.0.0.1", description="Client IP address for attribution and honeypot canary")


class EncapsulateSuccessResponse(BaseModel):
    status: str = "ENCAPSULATED"
    algorithm: str = "ML-KEM-768"
    rank_k: int = 3
    ciphertext: str
    cipher_hash: str
    lattice_integrity: float
    encrypted_payload: str
    shared_key_fingerprint: str
    tau_cap_bound: str


@app.get("/health", tags=["Telemetry"])
async def health_check() -> Dict[str, Any]:
    """
    Cypher-Shield health and armoring telemetry status.
    """
    return {
        "service": "cypher-shield",
        "status": "ARMORED",
        "layer": 3,
        "port": 9200,
        "active_protocol": default_lattice.protocol_name,
        "lattice_integrity": default_lattice._current_integrity,
    }


@app.get("/pqc/status", tags=["Post-Quantum Telemetry"])
async def get_pqc_status(physical_qubits: Optional[float] = None) -> Dict[str, Any]:
    """
    Returns active Quantum Resource Estimation (QRE) stress-test telemetry.
    If physical_qubits < 1.0e7, rank escalates to k=4 (ML-KEM-1024).
    """
    telemetry = default_lattice.check_quantum_hardness(simulated_qubits=physical_qubits)
    logger.info("QRE telemetry requested: Protocol=%s, Rank=%d, Qubits=%.2e",
                telemetry["active_protocol"], telemetry["rank_k"], telemetry["physical_qubits_required"])
    return telemetry


@app.post("/pqc/encapsulate", tags=["Post-Quantum Encapsulation"])
async def post_encapsulate(req: EncapsulateRequest, raw_request: Request) -> JSONResponse:
    """
    Encapsulates payload into ML-KEM-768 / ChaCha20-Poly1305 ciphertext envelope.
    Executes proactive deception if adversarial probes or traversal patterns are detected.
    """
    client_ip = req.client_ip or (raw_request.client.host if raw_request.client else "127.0.0.1")

    # 1. Proactive Adversarial Detection via Honey-Grid Pipeline
    if default_honey_grid.detect_adversarial_probe(req.payload):
        logger.warning(
            "Adversarial probe detected in payload from IP %s. Rerouting to active Honey-Grid trap.",
            client_ip,
        )
        honey_payload = default_honey_grid.spawn_decoy_payload(attacker_ip=client_ip)
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content=honey_payload,
        )

    # 2. Lattice Encapsulation with Tau Capability Verification
    try:
        encap_result = default_lattice.encapsulate(payload=req.payload, tau_cap=req.tau_cap)
        logger.info(
            "Successfully encapsulated payload under %s with tau_cap %s",
            encap_result["algorithm"],
            encap_result["tau_cap_bound"],
        )
        return JSONResponse(status_code=status.HTTP_200_OK, content=encap_result)

    except IngressSecurityTrap as trap_err:
        logger.error("IngressSecurityTrap triggered: %s", trap_err.message)
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={
                "status": "INGRESS_SECURITY_TRAP",
                "error": "UNAUTHORIZED_CAPABILITY_TOKEN",
                "detail": trap_err.message,
                "layer": 3,
                "remediation": "Obtain authenticated capability token (CAP_*) from Lumina-Auth (Port 9100).",
            },
        )
    except Exception as exc:
        logger.exception("Unexpected error in Cypher-Shield encapsulation: %s", str(exc))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Cryptographic encapsulation failure: {str(exc)}",
        )


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=9200, reload=False)
