from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import crypto_utils
import database
from honey_data import honey_grid
from substrate_ledger import substrate_ledger
import os
import uuid

# Directory for encrypted files (The Vault)
STORAGE_DIR = os.path.join(os.path.dirname(__file__), "vault_storage")
os.makedirs(STORAGE_DIR, exist_ok=True)

app = FastAPI(title="Cypher-Shield API - Layer 3 Specification")

@app.on_event("startup")
def startup_event():
    database.init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PubKeyPayload(BaseModel):
    public_key: str
    file_id: int = None
    private_key: str = None

@app.get("/")
def read_root():
    return {"status": "Cypher-Shield Layer 3 Post-Quantum Architecture Active", "active_state": crypto_utils.ACTIVE_LATTICE_STATE}

# === AEGIS PRIME ROUTES ===

@app.post("/aegis/upload")
async def aegis_upload(request: Request):
    if request.headers.get("content-type", "").startswith("multipart/form-data"):
        form = await request.form()
        file = form.get("file")
        if file is None:
            raise HTTPException(status_code=400, detail="No file provided.")
        file_bytes = await file.read()
        filename = file.filename
    else:
        try:
            data = await request.json()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON body.")
        if "text" not in data or not data["text"]:
            raise HTTPException(status_code=400, detail="No file or text provided.")
        file_bytes = data["text"].encode("utf-8")
        filename = "input.txt"
    # 1. Generate keys
    pub, priv = crypto_utils.generate_aegis_keys()
    # 2. Sign file
    signature = crypto_utils.sign_aegis(file_bytes, priv)
    # 3. Encrypt file
    enc_data = crypto_utils.encrypt_aegis(file_bytes, pub)
    # 4. Save to disk (Vault)
    file_id_str = str(uuid.uuid4())
    cipher_path = os.path.join(STORAGE_DIR, f"{file_id_str}.aegis")
    with open(cipher_path, "wb") as f:
        f.write(enc_data)
    # 5. Store DB metadata
    db_id = database.save_file_metadata(filename, signature, cipher_path, "aegis")
    crypto_utils.AEGIS_KEY_STORE[db_id] = priv
    crypto_utils.AEGIS_KEY_STORE[pub] = priv
    return {
        "file_id": db_id,
        "filename": filename,
        "digital_signature": signature,
        "public_key": pub,
        "private_key": priv
    }

@app.post("/aegis/download")
async def aegis_download(file_id: int = Form(...), private_key: str = Form(...), public_key: str = Form(...)):
    meta = database.get_file_metadata(file_id)
    if not meta or meta['encryption_type'] != 'aegis':
        raise HTTPException(status_code=404, detail="File not found")
        
    with open(meta['cipher_text_path'], "rb") as f:
        enc_data = f.read()
        
    try:
        dec_data = crypto_utils.decrypt_aegis(enc_data, private_key)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Decryption failed. Incorrect key or damaged data.")
        
    is_valid = crypto_utils.verify_aegis(dec_data, meta['digital_signature'], public_key)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Digital signature verification failed! File integrity compromised.")
        
    return Response(
        content=dec_data, 
        media_type="application/octet-stream", 
        headers={"Content-Disposition": f'attachment; filename="{meta["filename"]}"',
                 "Access-Control-Expose-Headers": "Content-Disposition"}
    )

@app.post("/aegis/crack")
def crack_aegis(payload: PubKeyPayload):
    result = crypto_utils.simulate_shors_attack(
        public_key=payload.public_key,
        file_id=payload.file_id,
        private_key=payload.private_key
    )
    return result

# === CYPHER-SHIELD ROUTES ===

@app.post("/cypher/upload")
async def cypher_upload(request: Request):
    if request.headers.get("content-type", "").startswith("multipart/form-data"):
        form = await request.form()
        file = form.get("file")
        if file is None:
            raise HTTPException(status_code=400, detail="No file provided.")
        file_bytes = await file.read()
        filename = file.filename
    else:
        try:
            data = await request.json()
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid JSON body.")
        if "text" not in data or not data["text"]:
            raise HTTPException(status_code=400, detail="No file or text provided.")
        file_bytes = data["text"].encode("utf-8")
        filename = "input.txt"

    pub, priv = crypto_utils.generate_cypher_shield_keys()
    signature = crypto_utils.sign_cypher_shield(file_bytes)
    pqc_cipher, payload_cipher, shared_secret = crypto_utils.encrypt_cypher_shield(file_bytes, pub)

    file_id_str = str(uuid.uuid4())
    cipher_path = os.path.join(STORAGE_DIR, f"{file_id_str}.cypher")
    with open(cipher_path, "wb") as f:
        f.write(payload_cipher)

    db_id = database.save_file_metadata(filename, signature, cipher_path, "cypher")
    return {
        "file_id": db_id,
        "filename": filename,
        "digital_signature": signature,
        "public_key": pub,
        "pqc_key_ciphertext": pqc_cipher,
        "shared_secret_simulate": shared_secret,
        "active_k": crypto_utils.ACTIVE_LATTICE_STATE["rank_k"]
    }

@app.post("/cypher/download")
async def cypher_download(file_id: int = Form(...), shared_secret: str = Form(...)):
    meta = database.get_file_metadata(file_id)
    if not meta or meta['encryption_type'] != 'cypher':
        raise HTTPException(status_code=404, detail="File not found")
        
    with open(meta['cipher_text_path'], "rb") as f:
        payload_cipher = f.read()
        
    try:
        dec_data = crypto_utils.decrypt_cypher_shield(payload_cipher, shared_secret)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Decryption failed: Poly1305 MAC tag authentication rejected. ML-KEM session key is zeroized, mismatched, or corrupted.")
        
    is_valid = crypto_utils.verify_cypher_shield(dec_data, meta['digital_signature'])
    if not is_valid:
        raise HTTPException(status_code=400, detail="PQC digital signature verification failed!")
        
    return Response(
        content=dec_data, 
        media_type="application/octet-stream", 
        headers={"Content-Disposition": f'attachment; filename="{meta["filename"]}"',
                 "Access-Control-Expose-Headers": "Content-Disposition"}
    )

@app.post("/cypher/crack")
def crack_cypher(payload: PubKeyPayload):
    result = crypto_utils.simulate_lattice_attack()
    return result

# === IEEE SPECIFICATION ADVANCED ROUTES ===

class PqcEncapsulatePayload(BaseModel):
    payload: str
    tau_cap: str = None

@app.post("/pqc/encapsulate")
def pqc_encapsulate(data: PqcEncapsulatePayload):
    """
    IEEE Layer 3: Encapsulates incoming prompt/payload into NIST FIPS 203 ML-KEM-768/1024
    lattice ciphertext envelope with Poly1305 MAC and extracts tau_cap.
    Returns ciphertext and canonical digest cipher_hash H(C_inbound).
    """
    result = crypto_utils.encapsulate_pqc_payload(data.payload, data.tau_cap)
    return {
        "success": True,
        "ciphertext": result["ciphertext"],
        "cipher_hash": result["cipher_hash"],
        "shared_secret": result["shared_secret"],
        "algorithm": result["algorithm"],
        "active_k": result["active_k"],
        "poly1305_mac": result["poly1305_mac"]
    }

@app.get("/cypher/qre")
def get_qre_metrics():
    """Returns Quantum Resource Estimator (QRE) physical qubit costs and T-gate depth."""
    return crypto_utils.calculate_qre_cost()

@app.post("/cypher/ratchet")
def trigger_ratchet():
    """Executes Dynamic Lattice Parameter Ratcheting (k=3 -> k=4) and zeroizes memory."""
    return crypto_utils.trigger_lattice_ratchet(force_escalate=True)

@app.get("/agent/honey-data")
def get_honey_data():
    """Returns active Honey-Data decoy sandboxes and canary attribution receipts."""
    return {
        "sandboxes": honey_grid.get_all_sandboxes(),
        "receipts": honey_grid.get_all_receipts(),
        "canary_beacons": honey_grid.canary_beacons
    }

class CanaryTriggerPayload(BaseModel):
    canary_id: str
    attacker_ip: str = "198.51.100.42"

@app.post("/agent/honey-data/trigger-canary")
def trigger_canary(payload: CanaryTriggerPayload):
    """Simulates canary beacon phone home attribution and commits receipt to Zenith-Mesh."""
    import json
    import urllib.request
    receipt = honey_grid.trigger_canary_phone_home(
        canary_id=payload.canary_id, 
        attacker_ip=payload.attacker_ip
    )
    block = substrate_ledger.commit_forensic_receipt(receipt)
    
    # Also forward to live Zenith-Mesh Substrate Node (Port 9944) if available
    zenith_node_url = os.environ.get("ZENITH_MESH_URL", "http://127.0.0.1:9944")
    zenith_receipt = None
    try:
        req = urllib.request.Request(
            f"{zenith_node_url}/ledger/forensic",
            data=json.dumps(receipt).encode('utf-8'),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=1.5) as resp:
            zenith_receipt = json.loads(resp.read().decode('utf-8'))
    except Exception:
        zenith_receipt = {"status": "LOCAL_MIRROR_ONLY", "node": "127.0.0.1:9944_STANDBY"}

    return {
        "success": True,
        "receipt": receipt,
        "ledger_block": block,
        "zenith_mesh_sync": zenith_receipt
    }

@app.get("/ledger/blocks")
def get_ledger_blocks():
    """Returns Zenith-Mesh Substrate Blockchain blocks."""
    return {
        "chain": substrate_ledger.get_chain(),
        "height": len(substrate_ledger.chain)
    }

class ChatPayload(BaseModel):
    message: str

class ActionPayload(BaseModel):
    action_type: str # "scan", "exploit", "compliance"

@app.post("/agent/chat")
def agent_chat(payload: ChatPayload):
    try:
        response = crypto_utils.agent_chat_response(payload.message)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent reasoning loop failed: {str(e)}")

@app.post("/agent/action")
def agent_action(payload: ActionPayload):
    try:
        files = database.get_all_files()
        if payload.action_type == "scan":
            return crypto_utils.agent_scan_vulnerabilities(files)
        elif payload.action_type == "exploit":
            return crypto_utils.agent_quantum_exploit(files)
        elif payload.action_type == "compliance":
            vulnerable = [f for f in files if f.get('encryption_type') == 'aegis']
            secure = [f for f in files if f.get('encryption_type') == 'cypher']
            compliance_score = 100 if len(files) > 0 and len(vulnerable) == 0 else (0 if len(secure) == 0 else int(100 * len(secure) / len(files)))
            
            logs = [
                "[AGENT] Evaluating overall Post-Quantum Cryptographic Compliance...",
                f"[AGENT] Found {len(vulnerable)} non-compliant elements and {len(secure)} compliant lattice parameters.",
                f"[AGENT] Active Lattice Parameter: {crypto_utils.ACTIVE_LATTICE_STATE['security_level']} (Rank k={crypto_utils.ACTIVE_LATTICE_STATE['rank_k']})",
                f"[AGENT] Post-Quantum Readiness Index computed: {compliance_score}%"
            ]
            
            return {
                "logs": logs,
                "score": compliance_score,
                "message": "PQC Assessment Completed. Legacy RSA algorithms pose critical vulnerability to quantum attackers. Lattice KEM encryption provides robust math armor.",
                "compliant_status": "COMPLIANT" if compliance_score == 100 else "NON-COMPLIANT"
            }
        else:
            raise HTTPException(status_code=400, detail="Unknown action type")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent action failed: {str(e)}")

@app.get("/health")
@app.get("/cluster/health")
@app.post("/cluster/health")
def cluster_health():
    return {
        "status": "OPERATIONAL",
        "shield": "CYPHER-SHIELD (Shield 3)",
        "pqc_algorithm": "NIST FIPS 203 ML-KEM-768",
        "station": "Station 3: 10.0.0.103",
        "active_lattice_state": crypto_utils.ACTIVE_LATTICE_STATE,
        "honey_grid_status": "ACTIVE_ISOLATION",
        "iscwp_transport": "ChaCha20-Poly1305 Active"
    }

if __name__ == "__main__":
    import uvicorn
    import argparse
    parser = argparse.ArgumentParser(description="Cypher-Shield PQC Router")
    parser.add_argument("--host", type=str, default=os.environ.get("HOST", "0.0.0.0"), help="Bind Host")
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", 9200)), help="Bind Port (default 9200)")
    args, _ = parser.parse_known_args()
    print(f"[*] Cypher-Shield (Shield 3) running on {args.host}:{args.port}")
    uvicorn.run(app, host=args.host, port=args.port)
