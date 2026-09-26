@echo off
title Synapse-OS Ngrok Tunnel
echo ========================================================
echo       Starting Ngrok Tunnel for Synapse-OS
echo ========================================================
echo.

set "PATH=C:\Users\KUSHAL N\AppData\Local\Author Software\nvm\.nodejs;C:\Users\KUSHAL N\AppData\Local\Author Software\nvm;C:\Users\KUSHAL N\AppData\Roaming\npm;%PATH%"

cd /d "%~dp0"
node tunnel.mjs
pause
