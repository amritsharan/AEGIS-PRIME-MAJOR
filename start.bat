@echo off
title Synapse-OS Launcher
echo ========================================================
echo   Starting Aegis-Prime: Synapse-OS AI Operating System
echo ========================================================
echo.

:: 1. Ensure Node and NPM in PATH
set "PATH=%LOCALAPPDATA%\Author Software\nvm\.nodejs;%LOCALAPPDATA%\Author Software\nvm;%APPDATA%\npm;%PATH%"

:: 2. Check if Ollama is running, launch if needed
echo [1/3] Checking Ollama Local LLM Engine (Port 11434)...
curl -s http://127.0.0.1:11434/api/tags >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting Ollama service...
    start "Ollama Engine" cmd /k "ollama serve"
) else (
    echo [OK] Ollama is active (llama3.2:1b ready).
)

:: 3. Check if OmniRoute is running, launch if needed
echo [2/3] Checking OmniRoute Neural Gateway (Port 20128)...
curl -s http://127.0.0.1:20128/health >nul 2>&1
if %errorlevel% neq 0 (
    echo Starting OmniRoute Gateway...
    start "OmniRoute Gateway" cmd /k "set PATH=%LOCALAPPDATA%\Author Software\nvm\.nodejs;%LOCALAPPDATA%\Author Software\nvm;%APPDATA%\npm;%PATH% && omniroute"
) else (
    echo [OK] OmniRoute is active on port 20128.
)

:: 4. Start Synapse-OS Frontend
echo [3/3] Starting Synapse-OS Web Interface on http://localhost:8443/ ...
echo.
npm run dev
