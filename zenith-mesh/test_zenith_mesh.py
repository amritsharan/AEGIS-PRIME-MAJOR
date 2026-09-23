"""
Comprehensive Test Suite for Zenith-Mesh (Layer 4)
"""

import sys
import os

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200, f"Expected 200, got {res.status_code}"
    data = res.json()
    assert data["service"] == "zenith-mesh"
    assert data["status"] == "CONSENSUS_ONLINE"
    assert data["layer"] == 4
    assert data["port"] == 9944
    assert data["consensus"] == "AURA-GRANDPA"
    print("[PASS] test_health")

def test_ledger_state():
    res = client.get("/ledger/state")
    assert res.status_code == 200
    data = res.json()
    assert "current_block" in data
    assert "total_extrinsics" in data
    assert data["consensus"] == "AURA-GRANDPA"
    print("[PASS] test_ledger_state")

def test_commit_intent():
    res = client.post("/ledger/commit", json={
        "agentId": "aegis-sovereign-agent-01",
        "actionHash": "0x7890abcdef123456",
        "tau_cap": "CAP_LUMINA_ZK_TEST",
        "payloadDigest": "0x1122334455667788"
    })
    assert res.status_code == 200, res.text
    data = res.json()
    assert "blockHeight" in data
    assert data["txHash"].startswith("0x")
    assert data["merkleRoot"].startswith("0x")
    assert data["intentDigest"].startswith("0x")
    assert data["agentId"] == "aegis-sovereign-agent-01"
    assert data["status"] == "FINALIZED"
    print("[PASS] test_commit_intent")

def test_commit_incident():
    res = client.post("/ledger/incident", json={
        "attackerIp": "203.0.113.19",
        "canaryId": "CANARY_0x99AA88BB",
        "signature": "SIG_HONEY_TRAP_TEST123"
    })
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["status"] == "EVIDENCE_SEALED"
    assert data["evidenceHash"].startswith("0x")
    assert "blockHeight" in data
    assert data["txHash"].startswith("0x")
    print("[PASS] test_commit_incident")

def test_latest_blocks():
    res = client.get("/ledger/latest?limit=5")
    assert res.status_code == 200
    blocks = res.json()
    assert isinstance(blocks, list)
    assert len(blocks) <= 5
    assert len(blocks) > 0
    assert "blockHeight" in blocks[0]
    print("[PASS] test_latest_blocks")

def test_fl_aggregation():
    # Byzantine gradient vectors (3 clients, 4 parameters each)
    # One is normal, one is normal, one is Byzantine poisoned
    gradients = [
        [0.10, -0.05, 0.40, 0.90],
        [0.12, -0.04, 0.42, 0.88],
        [9.99, -9.99, 99.0, 99.0],  # Byzantine poisoned vector
    ]
    res = client.post("/fl/aggregate", json={"gradients": gradients})
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["status"] == "AGGREGATION_SUCCESSFUL"
    assert data["dimension"] == 4
    agg = data["aggregated_gradient"]
    # Median should eliminate Byzantine outlier
    assert 0.09 <= agg[0] <= 0.13
    assert -0.06 <= agg[1] <= -0.03
    assert 0.39 <= agg[2] <= 0.43
    assert 0.87 <= agg[3] <= 0.91
    print("[PASS] test_fl_aggregation (Byzantine Fault Tolerance Verified)")

if __name__ == "__main__":
    print("\n--- Running Zenith-Mesh Verification Suite ---")
    test_health()
    test_ledger_state()
    test_commit_intent()
    test_commit_incident()
    test_latest_blocks()
    test_fl_aggregation()
    print("--- Zenith-Mesh: All Tests Passed! ---\n")
