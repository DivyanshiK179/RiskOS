# RiskSetu — Quick Start Script
# Run from: d:\Study Area\RiskSetu
# Usage: .\start.ps1

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "╔══════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        RiskSetu — Start          ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 1. Check Docker PostGIS
Write-Host "[1/3] Checking PostGIS container..." -ForegroundColor Yellow
$running = docker ps --format "{{.Names}}" 2>$null | Select-String "risksetu-postgis"
if (-not $running) {
    $exists = docker ps -a --format "{{.Names}}" 2>$null | Select-String "risksetu-postgis"
    if ($exists) {
        Write-Host "      Starting existing PostGIS container..." -ForegroundColor Gray
        docker start risksetu-postgis | Out-Null
    } else {
        Write-Host "      Creating PostGIS container..." -ForegroundColor Gray
        docker run -d `
            --name risksetu-postgis `
            -e POSTGRES_PASSWORD=APS@ST29 `
            -e POSTGRES_DB=postgres `
            -p 5432:5432 `
            postgis/postgis:16-3.4 | Out-Null
        Write-Host "      Waiting 5s for PostGIS to initialise..." -ForegroundColor Gray
        Start-Sleep -Seconds 5
    }
    Write-Host "      PostGIS running." -ForegroundColor Green
} else {
    Write-Host "      PostGIS already running." -ForegroundColor Green
}

# 2. Start Django backend
Write-Host ""
Write-Host "[2/3] Starting Django backend (http://localhost:8000)..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    Set-Location "d:\Study Area\RiskSetu"
    & ".\myenv\Scripts\python.exe" "backend/manage.py" "runserver" 2>&1
}
Write-Host "      Backend started (background job $($backendJob.Id))." -ForegroundColor Green

# 3. Start Vite frontend
Write-Host ""
Write-Host "[3/3] Starting frontend (http://localhost:5173)..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "d:\Study Area\RiskSetu\frontend"
    & npm run dev 2>&1
}
Write-Host "      Frontend started (background job $($frontendJob.Id))." -ForegroundColor Green

Write-Host ""
Write-Host "════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Public map:       http://localhost:5173/" -ForegroundColor White
Write-Host "  Login:            http://localhost:5173/login" -ForegroundColor White
Write-Host "  Dashboard:        http://localhost:5173/dashboard" -ForegroundColor White
Write-Host "  API docs:         http://localhost:8000/api/docs/" -ForegroundColor White
Write-Host "  Dev admin:        http://localhost:8000/system-console/" -ForegroundColor White
Write-Host "════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Demo credentials:" -ForegroundColor DarkGray
Write-Host "  official / RiskSetu@2026 (full dashboard)" -ForegroundColor DarkGray
Write-Host "  superadmin / Admin@RS2026 (all access)" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Press Ctrl+C to stop all services." -ForegroundColor DarkGray
Write-Host ""

# Wait and stream output
try {
    while ($true) {
        $backendJob | Receive-Job | ForEach-Object { Write-Host "[backend] $_" -ForegroundColor DarkGray }
        $frontendJob | Receive-Job | ForEach-Object { Write-Host "[frontend] $_" -ForegroundColor DarkGray }
        Start-Sleep -Seconds 2
    }
} finally {
    Write-Host ""
    Write-Host "Stopping services..." -ForegroundColor Yellow
    Stop-Job $backendJob, $frontendJob
    Remove-Job $backendJob, $frontendJob
    Write-Host "Done." -ForegroundColor Green
}
