import time
import json
import urllib.request
import urllib.error

print("=" * 70)
print("  IEEE TRANSACTIONS ON DEPENDABLE AND SECURE COMPUTING (SEPT 2026)")
print("  DUAL-SHIELD MESH SYNTHESIS: FORMAL INTEGRATION VERIFICATION")
print("=" * 70)

CYPHER_URL = "http://127.0.0.1:9200"
SYNAPSE_URL = "http://127.0.0.1:9300"
ZENITH_URL = "http://127.0.0.1:9944"

def post_json(url, data):
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=5) as resp:
        return json.loads(resp.read().decode('utf-8'))

# Diagnostic 1: Probe Cypher-Shield PQC Encapsulation Engine
print("\n[DIAGNOSTIC 1] Probing Cypher-Shield PQC Encapsulation Engine (Port 9200)...")
try:
    pqc_res = post_json(
        f"{CYPHER_URL}/pqc/encapsulate",
        {"payload": "ping_test", "tau_cap": "CAP_BOOTSTRAP"}
    )
    print("  [+] Status: SUCCESS")
    print(f"  [+] Algorithm: {pqc_res.get('algorithm')}")
    print(f"  [+] Ciphertext Digest H(C_inbound): {pqc_res.get('cipher_hash')}")
    print(f"  [+] Active Rank k: {pqc_res.get('active_k')}")
except Exception as e:
    print(f"  [-] Failed: {e}")

# Diagnostic 2: Verify Zenith-Mesh Substrate Block Header Finalization
print("\n[DIAGNOSTIC 2] Verifying Zenith-Mesh Substrate Block Header Finalization (Port 9944)...")
try:
    rpc_res = post_json(
        f"{ZENITH_URL}/",
        {"id": 1, "jsonrpc": "2.0", "method": "chain_getHeader", "params": []}
    )
    header = rpc_res.get("result", {})
    print("  [+] Status: SUCCESS (JSON-RPC 2.0)")
    print(f"  [+] Block Number: {header.get('number')}")
    print(f"  [+] State Root (R_state): {header.get('stateRoot')}")
    print(f"  [+] Extrinsics Root: {header.get('extrinsicsRoot')}")
    print(f"  [+] Parent Hash: {header.get('parentHash')}")
except Exception as e:
    print(f"  [-] Failed: {e}")

# Diagnostic 3: Test Full Loop via Synapse-OS Dispatcher Route
print("\n[DIAGNOSTIC 3] Testing Full Loop via Synapse-OS Dispatcher Route (Port 9300)...")
try:
    forge_res = post_json(
        f"{SYNAPSE_URL}/api/forge",
        {"prompt": "Generate secure micro-service scaffold", "mode": "forge"}
    )
    print("  [+] Status: SUCCESS")
    print(f"  [+] Block Receipt: {forge_res.get('blockReceipt')}")
    print(f"  [+] Extrinsic TxHash: {forge_res.get('txHash')}")
    print(f"  [+] PQC Security Status: {forge_res.get('pqcStatus')}")
    print(f"  [+] Proof-of-Agency Intent Hash (tau_audit): {forge_res.get('tau_audit')}")
    print(f"  [+] Synapse Execution Digest: {forge_res.get('payload', {}).get('digest')}")
except Exception as e:
    print(f"  [-] Failed: {e}")

print("\n" + "=" * 70)
print("  ALL 3 SECTION 6 DIAGNOSTIC COMMANDS COMPLETED")
print("=" * 70)
