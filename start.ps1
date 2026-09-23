Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting Aegis-Prime: Synapse-OS AI Operating System" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Setup PATH
$env:Path = "$env:LOCALAPPDATA\Author Software\nvm\.nodejs;$env:LOCALAPPDATA\Author Software\nvm;$env:APPDATA\npm;" + $env:Path

# 2. Ollama check
Write-Host "[1/3] Checking Local Ollama LLM (Port 11434)..." -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "http://127.0.0.1:11434/api/tags" -TimeoutSec 2 -ErrorAction Stop
    $modelNames = ($r.models | ForEach-Object { $_.name }) -join ', '
    Write-Host "[OK] Ollama is active with models: $modelNames" -ForegroundColor Green
} catch {
    Write-Host "Starting Ollama..." -ForegroundColor Yellow
    Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Minimized
}

# 3. OmniRoute check
Write-Host "[2/3] Checking OmniRoute Neural Gateway (Port 20128)..." -ForegroundColor Yellow
try {
    $r = Invoke-RestMethod -Uri "http://127.0.0.1:20128/health" -TimeoutSec 2 -ErrorAction Stop
    Write-Host "[OK] OmniRoute is active (Status: $($r.status))" -ForegroundColor Green
} catch {
    Write-Host "Starting OmniRoute..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:Path = '$env:LOCALAPPDATA\Author Software\nvm\.nodejs;$env:LOCALAPPDATA\Author Software\nvm;$env:APPDATA\npm;' + `$env:Path; omniroute"
}

# 4. Start Frontend
Write-Host "[3/3] Launching Synapse-OS Frontend..." -ForegroundColor Yellow
Write-Host "➜ http://localhost:8443/" -ForegroundColor Green
Write-Host ""
npm run dev
