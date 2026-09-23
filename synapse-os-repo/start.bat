@echo off
title Synapse-OS Launcher
echo ========================================================
echo           Launching Synapse-OS Environment
echo ========================================================
echo.

set "PATH=C:\Users\KUSHAL N\AppData\Local\Author Software\nvm\.nodejs;C:\Users\KUSHAL N\AppData\Local\Author Software\nvm;C:\Users\KUSHAL N\AppData\Roaming\npm;%PATH%"

echo [1/2] Launching OmniRoute Neural Gateway on port 20128...
start "OmniRoute Gateway (Port 20128)" cmd /k "set PATH=C:\Users\KUSHAL N\AppData\Local\Author Software\nvm\.nodejs;C:\Users\KUSHAL N\AppData\Local\Author Software\nvm;C:\Users\KUSHAL N\AppData\Roaming\npm;%%PATH%% && set CLAUDE_CONFIG_DIR=%USERPROFILE%\.claude-omniroute && set ANTHROPIC_BASE_URL=http://localhost:20128 && set ANTHROPIC_AUTH_TOKEN=sk-52e4897eef6ec3a2-c6b4a5-a7142476 && set ANTHROPIC_MODEL=SYNAPSE-OS FREE && omniroute"

timeout /t 2 /nobreak >nul

echo [2/2] Launching Synapse-OS Vite Frontend...
echo.
cd /d "%~dp0"
npm run dev
pause
