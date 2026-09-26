"""
Cypher-Shield Microservice (Layer 3)
Aegis-Prime Sovereign Intelligence Mesh — Post-Quantum Cryptographic Tunnel & Quantum Engine.
Running on Port 9200.
"""

from __future__ import annotations

import logging
import os
import sys
import uuid
from typing import Any, Dict, List, Optional

_current_dir = os.path.dirname(os.path.abspath(__file__))
if _current_dir not in sys.path:
    sys.path.insert(0, _current_dir)

import uvicorn
from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from core.lattice import IngressSecurityTrap, default_lattice
from core.honey_grid import default_honey_grid
from core.crypto_quantum import (
    ACTIVE_LATTICE_STATE,
    generate_aegis_keys,
    encrypt_aegis,
    decrypt_aegis,
    sign_aegis,
    verify_aegis,
    simulate_shors_attack,
    calculate_qre_cost,
    trigger_lattice_ratchet,
    generate_cypher_shield_keys,
    encrypt_cypher_shield,
    decrypt_cypher_shield,
    sign_cypher_shield,
    verify_cypher_shield,
    simulate_lattice_attack,
)
from core.agent_auditor import (
    agent_scan_vulnerabilities,
    agent_quantum_exploit,
    agent_compliance_audit,
    agent_chat_response,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [CYPHER-SHIELD-L3] %(message)s",
)
logger = logging.getLogger("cypher_shield")

# Storage directory for encrypted vault items
STORAGE_DIR = os.path.join(_current_dir, "vault_storage")
os.makedirs(STORAGE_DIR, exist_ok=True)

# In-memory vault metadata store
FILE_METADATA_STORE: Dict[str, Dict[str, Any]] = {}

# Seed initial files for demonstration
def _seed_vault():
    f1_id = "fl_aegis_01"
    f2_id = "fl_pqc_01"
    FILE_METADATA_STORE[f1_id] = {
        "id": f1_id,
        "filename": "classified_financial_ledger.csv",
        "encryption_type": "aegis",
        "signature": "RSA_SIG_MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A...",
        "created_at": "2026-09-23 12:00:00",
    }
    FILE_METADATA_STORE[f2_id] = {
        "id": f2_id,
        "filename": "sovereign_agent_weights.bin",
        "encryption_type": "cypher",
        "signature": "ML-DSA-87_SIG_[0x9a8f...]",
        "created_at": "2026-09-23 12:05:00",
    }

_seed_vault()

# Initialize FastAPI application
app = FastAPI(
    title="Cypher-Shield PQC Tunnel & Quantum Engine",
    version="2.0.0",
    description="Layer 3 Post-Quantum Cryptographic, IBM Qiskit Quantum Simulator, and Active Honey-Grid Microservice",
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
# Request / Response Models
# =====================================================================

class PubKeyPayload(BaseModel):
    public_key: str = ""


class ChatPayload(BaseModel):
    message: str
    client_ip: Optional[str] = "198.51.100.42"


class ActionPayload(BaseModel):
    action_type: str = Field(..., description="'scan', 'exploit', or 'compliance'")


class CanaryTriggerPayload(BaseModel):
    canary_id: str
    attacker_ip: str = "198.51.100.42"


class EncapsulateRequest(BaseModel):
    payload: str
    tau_cap: Optional[str] = None
    client_ip: Optional[str] = "127.0.0.1"


# =====================================================================
# Telemetry & Status Routes
# =====================================================================

@app.get("/")
def read_root():
    return {
        "service": "cypher-shield",
        "status": "ARMORED",
        "layer": 3,
        "active_state": ACTIVE_LATTICE_STATE,
        "capabilities": [
            "ML-KEM-768",
            "ML-KEM-1024",
            "ML-DSA-87",
            "IBM Qiskit Shor's Simulation",
            "Grover's Lattice Hardness Sieving",
            "Active Honey-Data Grid",
            "Dynamic Parameter Ratchet",
        ],
    }


@app.get("/health")
async def health_check() -> Dict[str, Any]:
    return {
        "service": "cypher-shield",
        "status": "ARMORED",
        "layer": 3,
        "port": 9200,
        "active_protocol": default_lattice.protocol_name,
        "lattice_integrity": default_lattice._current_integrity,
        "qre_qubits": calculate_qre_cost()["formatted_q_cost"],
    }


@app.get("/pqc/status")
async def get_pqc_status(physical_qubits: Optional[float] = None) -> Dict[str, Any]:
    return default_lattice.check_quantum_hardness(simulated_qubits=physical_qubits)


@app.get("/cypher/qre")
def get_qre_metrics():
    """Returns Quantum Resource Estimator (QRE) physical qubit costs and T-gate depth."""
    return calculate_qre_cost()


@app.post("/cypher/ratchet")
def trigger_ratchet():
    """Executes Dynamic Lattice Parameter Ratcheting (k=3 -> k=4), scrubs RAM, and writes block receipt."""
    return trigger_lattice_ratchet(force_escalate=True)


# =====================================================================
# AEGIS PRIME (RSA) ROUTES
# =====================================================================

@app.post("/aegis/upload")
async def aegis_upload(request: Request):
    if request.headers.get("content-type", "").startswith("multipart/form-data"):
        form = await request.form()
        file = form.get("file")
        if file is None:
            raise HTTPException(status_code=400, detail="No file provided.")
        file_bytes = await file.read()
        filename = getattr(file, "filename", "input.txt")
    else:
        try:
            data = await request.json()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON body.")
        if "text" not in data or not data["text"]:
            raise HTTPException(status_code=400, detail="No file or text provided.")
        file_bytes = data["text"].encode("utf-8")
        filename = "input.txt"

    pub, priv = generate_aegis_keys()
    signature = sign_aegis(file_bytes, priv)
    enc_data = encrypt_aegis(file_bytes, pub)

    file_id = str(uuid.uuid4())
    FILE_METADATA_STORE[file_id] = {
        "id": file_id,
        "filename": filename,
        "encryption_type": "aegis",
        "signature": signature,
        "public_key": pub,
        "created_at": "just now",
    }

    return {
        "file_id": file_id,
        "filename": filename,
        "digital_signature": signature,
        "public_key": pub,
        "private_key": priv,
    }


@app.post("/aegis/crack")
def crack_aegis(payload: PubKeyPayload):
    """Executes IBM Qiskit Shor's algorithm simulation against RSA modulus."""
    return simulate_shors_attack(payload.public_key)


# =====================================================================
# CYPHER-SHIELD (PQC) ROUTES
# =====================================================================

@app.post("/cypher/upload")
async def cypher_upload(request: Request):
    if request.headers.get("content-type", "").startswith("multipart/form-data"):
        form = await request.form()
        file = form.get("file")
        if file is None:
            raise HTTPException(status_code=400, detail="No file provided.")
        file_bytes = await file.read()
        filename = getattr(file, "filename", "input.txt")
    else:
        try:
            data = await request.json()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON body.")
        if "text" not in data or not data["text"]:
            raise HTTPException(status_code=400, detail="No file or text provided.")
        file_bytes = data["text"].encode("utf-8")
        filename = "input.txt"

    pub, priv = generate_cypher_shield_keys()
    signature = sign_cypher_shield(file_bytes)
    pqc_cipher, payload_cipher, shared_secret = encrypt_cypher_shield(file_bytes, pub)

    file_id = str(uuid.uuid4())
    FILE_METADATA_STORE[file_id] = {
        "id": file_id,
        "filename": filename,
        "encryption_type": "cypher",
        "signature": signature,
        "public_key": pub,
        "created_at": "just now",
    }

    return {
        "file_id": file_id,
        "filename": filename,
        "digital_signature": signature,
        "public_key": pub,
        "pqc_key_ciphertext": pqc_cipher,
        "shared_secret_simulate": shared_secret,
        "active_k": ACTIVE_LATTICE_STATE["rank_k"],
    }


@app.post("/cypher/crack")
def crack_cypher(payload: PubKeyPayload):
    """Executes Grover's / lattice attack simulation demonstrating SVP quantum bounds failure."""
    return simulate_lattice_attack()


# =====================================================================
# AGENTIC AI SECURITY AUDITOR ROUTES
# =====================================================================

@app.post("/agent/action")
def handle_agent_action(payload: ActionPayload):
    files = list(FILE_METADATA_STORE.values())
    if payload.action_type == "scan":
        return agent_scan_vulnerabilities(files)
    elif payload.action_type == "exploit":
        return agent_quantum_exploit(files)
    elif payload.action_type == "compliance":
        return agent_compliance_audit(files)
    else:
        raise HTTPException(status_code=400, detail="Unknown action type. Choose 'scan', 'exploit', or 'compliance'.")


@app.post("/agent/chat")
def handle_agent_chat(payload: ChatPayload):
    return agent_chat_response(payload.message, client_ip=payload.client_ip or "198.51.100.42")


@app.get("/agent/honey-data")
def get_honey_data_status():
    return {
        "sandboxes": default_honey_grid.list_active_sandboxes(),
        "total_contained": len(default_honey_grid._sandboxes),
        "canary_beacons": [
            {
                "canary_id": sb["canary_id"],
                "sandbox_id": sb["sandbox_id"],
                "status": "ACTIVE_LISTENING",
            }
            for sb in default_honey_grid.list_active_sandboxes()
        ],
    }


@app.post("/agent/honey-data/trigger-canary")
def trigger_canary_phone_home(payload: CanaryTriggerPayload):
    receipt = {
        "receipt_id": f"FORENSIC-RECEIPT-{uuid.uuid4().hex[:8].upper()}",
        "canary_id": payload.canary_id,
        "timestamp": "2026-09-23 18:00:00",
        "egress_ip": payload.attacker_ip,
        "asn": "AS13335 Cloudflare, Inc.",
        "routing_topology": "172.68.22.41 -> 10.0.4.12",
        "fingerprint": "Mozilla/5.0 (Quantum-Attacker-Probe/3.0; OS-Linux-x86_64)",
        "legal_attribution_status": "SEALED_CHAIN_OF_CUSTODY",
    }
    return {"success": True, "receipt": receipt}


# =====================================================================
# INGRESS TRAP & LATTICE ENCAPSULATION
# =====================================================================

@app.post("/tunnel/encapsulate", response_model=None, tags=["Lattice Operations"])
async def encapsulate_tunnel(request_data: EncapsulateRequest) -> Any:
    try:
        capsule = default_lattice.encapsulate_payload(
            payload=request_data.payload,
            tau_cap=request_data.tau_cap,
            client_ip=request_data.client_ip or "127.0.0.1",
        )
        return {
            "status": "ENCAPSULATED",
            "algorithm": capsule["algorithm"],
            "rank_k": capsule["rank_k"],
            "ciphertext": capsule["ciphertext"],
            "cipher_hash": capsule["cipher_hash"],
            "lattice_integrity": capsule["lattice_integrity"],
            "encrypted_payload": capsule["encrypted_payload"],
            "shared_key_fingerprint": capsule["shared_key_fingerprint"],
            "tau_cap_bound": capsule["tau_cap_bound"],
        }
    except IngressSecurityTrap as trap:
        receipt = default_honey_grid.divert_connection(
            client_ip=trap.client_ip,
            reason=trap.reason,
            canary_id=f"CANARY-{int(time.time())}",
        )
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={
                "error": "SECURITY_TRAP_TRIGGERED",
                "message": "Sovereign transport violation detected. Session diverted to Shadow Honeypot Grid.",
                "sandbox_id": receipt["sandbox_id"],
                "canary_id": receipt["canary_id"],
                "honeypot_active": True,
            },
        )


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9200)
