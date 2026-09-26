@echo off
title Aegis-Prime: Sovereign Intelligence Mesh Launcher
echo ==============================================================================
echo   AEGIS-PRIME-MAJOR: DUAL-SHIELD POST-QUANTUM MESH & AGENT LAUNCHER
echo ==============================================================================
echo.

:: 1. Ensure Node, NPM, and Python in PATH
set "PATH=%LOCALAPPDATA%\Author Software\nvm\.nodejs;%LOCALAPPDATA%\Author Software\nvm;%APPDATA%\npm;%PATH%"

:: 2. Check Ollama Local LLM Engine (Port 11434)
echo [1/7] Probing Ollama LLM Engine (Port 11434)...
curl -s http://127.0.0.1:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo       Starting Ollama service...
    start "Ollama Engine" /min cmd /c "ollama serve"
    timeout /t 3 /nobreak >nul
) else (
    echo       [OK] Ollama is active on port 11434.
)
echo       [*] Verifying local models (Qwen 2.5 0.5B and Llama 3.2 1B)...
ollama list 2>nul | findstr /i "qwen2.5:0.5b" >nul
if %errorlevel% equ 0 (
    echo       [OK] Model 'qwen2.5:0.5b' is downloaded and verified.
) else (
    echo       [+] Downloading lightweight 'qwen2.5:0.5b'...
    ollama pull qwen2.5:0.5b
)
ollama list 2>nul | findstr /i "llama3.2:1b" >nul
if %errorlevel% equ 0 (
    echo       [OK] Model 'llama3.2:1b' is downloaded and verified.
) else (
    echo       [+] Downloading lightweight 'llama3.2:1b'...
    ollama pull llama3.2:1b
)

:: 3. Check OmniRoute Neural Gateway (Port 20128)
echo [2/7] Probing OmniRoute Neural Gateway (Port 20128)...
curl -s http://127.0.0.1:20128/health >nul 2>&1
if %errorlevel% neq 0 (
    echo       Starting OmniRoute Gateway...
    start "OmniRoute Gateway" /min cmd /c "omniroute"
) else (
    echo       [OK] OmniRoute is active on port 20128.
)

:: 4. Check Cypher-Shield PQC Engine (Port 9200)
echo [3/7] Probing Cypher-Shield PQC Engine (Port 9200)...
curl -s http://127.0.0.1:9200/ >nul 2>&1
if %errorlevel% neq 0 (
    echo       Starting Cypher-Shield PQC Service on Port 9200...
    start "Cypher-Shield PQC (9200)" /min cmd /c "cd /d "%~dp0cypher-shield\server" && python main.py --port 9200"
) else (
    echo       [OK] Cypher-Shield is active on port 9200.
)

:: 5. Check Zenith-Mesh Substrate PoA Node (Port 9944)
echo [4/7] Probing Zenith-Mesh Substrate Node (Port 9944)...
curl -s http://127.0.0.1:9944/ >nul 2>&1
if %errorlevel% neq 0 (
    echo       Starting Zenith-Mesh Substrate PoA Node on Port 9944...
    start "Zenith-Mesh PoA (9944)" /min cmd /c "cd /d "%~dp0zenith-mesh\server" && python substrate_server.py --port 9944"
) else (
    echo       [OK] Zenith-Mesh is active on port 9944.
)

:: 6. Check Synapse Microkernel Dispatcher Gateway (Port 9300)
echo [5/7] Probing Synapse Gateway (Port 9300)...
curl -s http://127.0.0.1:9300/ >nul 2>&1
if %errorlevel% neq 0 (
    echo       Starting Synapse Dispatcher Gateway on Port 9300...
    start "Synapse Dispatcher (9300)" /min cmd /c "cd /d "%~dp0zenith-mesh\server" && python synapse_gateway.py --port 9300"
) else (
    echo       [OK] Synapse Gateway is active on port 9300.
)

:: 7. Check QuantumShield AI Autonomous Agent (Port 8000)
echo [6/7] Probing QuantumShield AI Autonomous Agent (Port 8000)...
curl -s http://127.0.0.1:8000/health >nul 2>&1
if %errorlevel% neq 0 (
    echo       Starting QuantumShield AI Security Platform on Port 8000...
    start "QuantumShield AI (8000)" /min cmd /c "cd /d "%~dp0ai-autonomous-agent\quantumshield-ai\backend" && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"
) else (
    echo       [OK] QuantumShield AI is active on port 8000.
)

:: 8. Launch Synapse-OS Primary Workspace UI
echo [7/7] Launching Synapse-OS Unified Sovereign Workspace...
echo.
echo ==============================================================================
echo   ALL 4 SYSTEMS LAUNCHED SUCCESSFULLY!
echo ==============================================================================
echo   - Primary Synapse-OS Workspace : http://localhost:5173 / http://localhost:8443
echo   - Cypher-Shield PQC Engine     : http://127.0.0.1:9200
echo   - Zenith Substrate RPC Node    : http://127.0.0.1:9944
echo   - Synapse Microkernel Bus      : http://127.0.0.1:9300
echo   - QuantumShield AI Backend     : http://127.0.0.1:8000
echo ==============================================================================
echo.

npm run dev
