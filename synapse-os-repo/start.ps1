# Synapse-OS PowerShell One-Click Launcher

$nodePaths = "C:\Users\KUSHAL N\AppData\Local\Author Software\nvm\.nodejs;C:\Users\KUSHAL N\AppData\Local\Author Software\nvm;C:\Users\KUSHAL N\AppData\Roaming\npm;"
$env:Path = $nodePaths + $env:Path

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "          Launching Synapse-OS Environment              " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Start OmniRoute in a new window
Write-Host "[1/2] Starting OmniRoute Neural Gateway on port 20128..." -ForegroundColor Yellow
$omniScript = @"
`$env:Path = '$nodePaths' + `$env:Path
`$env:CLAUDE_CONFIG_DIR = "`$HOME\.claude-omniroute"
`$env:ANTHROPIC_BASE_URL = "http://localhost:20128"
`$env:ANTHROPIC_AUTH_TOKEN = "sk-52e4897eef6ec3a2-c6b4a5-a7142476"
`$env:ANTHROPIC_MODEL = "SYNAPSE-OS FREE"
omniroute
"@

Start-Process powershell -ArgumentList "-NoExit", "-Command", $omniScript

Start-Sleep -Seconds 2

# 2. Start Frontend Dev Server in current window
Write-Host "[2/2] Starting Synapse-OS Vite Dev Server..." -ForegroundColor Green
Write-Host ""
Set-Location -Path $PSScriptRoot
npm run dev
