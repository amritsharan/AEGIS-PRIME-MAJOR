@echo off
title AEGIS PRIME - Full Ecosystem Launcher
echo ======================================================================
echo   AEGIS PRIME: DUAL-SHIELD POST-QUANTUM MESH ECOSYSTEM LAUNCHER
echo ======================================================================
echo.

set ROOT_DIR=%~dp0

echo [1/6] Launching Cypher-Shield PQC Engine Backend (Port 9200)...
start "1. Cypher-Shield Backend (Port 9200)" cmd /k "cd /d %ROOT_DIR%cypher-shield\server && python main.py --port 9200"

echo [2/6] Launching Cypher-Shield UI (Port 5175)...
start "2. Cypher-Shield Frontend (Port 5175)" cmd /k "cd /d %ROOT_DIR%cypher-shield\client && npm run dev"

echo [3/6] Launching Zenith-Mesh Substrate RPC Node (Port 9944)...
start "3. Zenith-Mesh Substrate RPC (Port 9944)" cmd /k "cd /d %ROOT_DIR%zenith-mesh\server && python substrate_server.py --port 9944"

echo [4/6] Launching Synapse-OS Microkernel Dispatcher (Port 9300)...
start "4. Synapse Dispatcher Bus (Port 9300)" cmd /k "cd /d %ROOT_DIR%zenith-mesh\server && python synapse_gateway.py --port 9300"

echo [5/6] Launching Zenith-Mesh UI (Port 5176)...
start "5. Zenith-Mesh Frontend (Port 5176)" cmd /k "cd /d %ROOT_DIR%zenith-mesh && npm run dev"

echo [6/6] Launching Synapse-OS Frontend (Port 5173)...
start "6. Synapse-OS Frontend (Port 5173)" cmd /k "cd /d %ROOT_DIR%synapse-os-repo && npm run dev"

echo.
echo ======================================================================
echo   ALL 3 SYSTEMS LAUNCHED SUCCESSFULLY!
echo ======================================================================
echo   [1] Synapse-OS Workspace UI  : http://localhost:5173
echo   [2] Cypher-Shield PQC UI     : http://localhost:5175
echo   [3] Zenith-Mesh Substrate UI : http://localhost:5176
echo.
echo   Backend APIs:
echo   - Cypher-Shield Engine       : http://127.0.0.1:9200
echo   - Synapse Microkernel Bus    : http://127.0.0.1:9300
echo   - Zenith Substrate RPC Node  : http://127.0.0.1:9944
echo ======================================================================
echo.
echo Press any key to run integration diagnostics test...
pause >nul
python test_integration.py
pause
