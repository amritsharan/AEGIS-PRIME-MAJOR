# AEGIS PRIME MAJORS - Unified Launcher for All 3 Systems (Backends & Frontends)
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  AEGIS PRIME: DUAL-SHIELD POST-QUANTUM MESH ECOSYSTEM LAUNCHER       " -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

$WorkspaceRoot = $PSScriptRoot

# 1. Cypher-Shield PQC Engine Backend (Port 9200)
Write-Host "[1/6] Launching Cypher-Shield PQC Engine Backend (Port 9200)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$WorkspaceRoot\cypher-shield\server'; python main.py --port 9200"

# 2. Cypher-Shield Frontend UI (Port 5175)
Write-Host "[2/6] Launching Cypher-Shield UI (Port 5175)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$WorkspaceRoot\cypher-shield\client'; npm run dev"

# 3. Zenith-Mesh Substrate Node (Port 9944)
Write-Host "[3/6] Launching Zenith-Mesh Substrate RPC Node (Port 9944)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$WorkspaceRoot\zenith-mesh\server'; python substrate_server.py --port 9944"

# 4. Synapse-OS Microkernel Dispatcher Gateway (Port 9300)
Write-Host "[4/6] Launching Synapse-OS Microkernel Dispatcher (Port 9300)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$WorkspaceRoot\zenith-mesh\server'; python synapse_gateway.py --port 9300"

# 5. Zenith-Mesh Frontend UI (Port 5176)
Write-Host "[5/6] Launching Zenith-Mesh UI (Port 5176)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$WorkspaceRoot\zenith-mesh'; npm run dev"

# 6. Synapse-OS Frontend UI (Port 5173)
Write-Host "[6/6] Launching Synapse-OS Frontend (Port 5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$WorkspaceRoot\synapse-os-repo'; npm run dev"

Write-Host "`n======================================================================" -ForegroundColor Cyan
Write-Host "  ALL 3 SYSTEMS LAUNCHED SUCCESSFULLY!" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  [1] Synapse-OS Workspace UI  : http://localhost:5173" -ForegroundColor White
Write-Host "  [2] Cypher-Shield PQC UI     : http://localhost:5175" -ForegroundColor White
Write-Host "  [3] Zenith-Mesh Substrate UI : http://localhost:5176" -ForegroundColor White
Write-Host ""
Write-Host "  Backend APIs:" -ForegroundColor DarkGray
Write-Host "  - Cypher-Shield Engine       : http://127.0.0.1:9200" -ForegroundColor DarkGray
Write-Host "  - Synapse Microkernel Bus    : http://127.0.0.1:9300" -ForegroundColor DarkGray
Write-Host "  - Zenith Substrate RPC Node  : http://127.0.0.1:9944" -ForegroundColor DarkGray
Write-Host "======================================================================`n" -ForegroundColor Cyan

Write-Host "To verify the live integration loop, run: python test_integration.py`n" -ForegroundColor Yellow
