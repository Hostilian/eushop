<#
.SYNOPSIS
    EUshop All-In-One Emergency Recovery & Multi-Agent Health Script.
.DESCRIPTION
    Resets provider circuit breakers, verifies sidecar worktrees, ensures supervisor
    and watchdog processes are running, and outputs live progress and accelerated ETA.
#>

[CmdletBinding()]
param()

Set-Location "D:\CODING\eushop"
Write-Host "========================================================================" -ForegroundColor Cyan
Write-Host "         EUshop Emergency Recovery & Multi-Agent Health Check           " -ForegroundColor Cyan
Write-Host "========================================================================" -ForegroundColor Cyan

# 1. Reset provider circuit breaker cooldowns
Write-Host "[1/4] Resetting provider circuit breaker failovers in .claude\provider-state-v3.json..." -ForegroundColor Yellow
if (Test-Path ".claude\provider-state-v3.json") {
    $json = Get-Content ".claude\provider-state-v3.json" -Raw
    $json = $json -replace '"failures":\s*\d+', '"failures": 0'
    $json = $json -replace '"circuitUntil":\s*"[^"]*"', '"circuitUntil": ""'
    $json | Set-Content ".claude\provider-state-v3.json" -Encoding UTF8
    Write-Host "[OK  ] Provider cooldowns reset to 0." -ForegroundColor Green
}

# 2. Ensure sidecar worktrees exist
Write-Host "`n[2/4] Verifying parallel multi-agent worktrees under D:\CODING\eushop-agents..." -ForegroundColor Yellow
powershell -ExecutionPolicy Bypass -File scripts\EUshop-MultiAgent-Sidecars.ps1 -Mode Launch

# 3. Restart supervisor if orchestrator is stopped
Write-Host "`n[3/4] Ensuring background supervisor and watchdog are active..." -ForegroundColor Yellow
powershell -ExecutionPolicy Bypass -File scripts\Start-EUshop-Supervised.ps1

# 4. Display status dashboard & ETA
Write-Host "`n[4/4] Fetching live progress and ETA..." -ForegroundColor Yellow
powershell -ExecutionPolicy Bypass -File scripts\Get-EUshop-Progress.ps1 -Once
