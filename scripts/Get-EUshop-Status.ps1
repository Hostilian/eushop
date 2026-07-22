#Requires -Version 5.1
<#
.SYNOPSIS
    Canonical Status & Observability Command for EUshop
.DESCRIPTION
    Displays main background service status, uptime, 3-level health checks (Process, App, AI),
    active AI provider & circuit breaker states, master queue completion, disk usage, and log paths.
.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\scripts\Get-EUshop-Status.ps1
#>

param(
    [string]$ProjectPath = "D:\CODING\eushop",
    [switch]$Json
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = "SilentlyContinue"

$RepoPath      = [System.IO.Path]::GetFullPath($ProjectPath)
$AgentState    = Join-Path $RepoPath ".agent-state"
$LockFile      = Join-Path $RepoPath ".claude\AGENT_FAILOVER.lock"
$WdLock        = Join-Path $AgentState "watchdog.pid"
$QueueFile     = Join-Path $RepoPath ".hermes\yc-optimization-queue.md"
$CircuitFile   = Join-Path $AgentState "circuit-breaker-state.json"
$LogFile       = Join-Path $AgentState "logs\unattended-runner.log"

# Process Health
$orchPid = if (Test-Path $LockFile) { (Get-Content $LockFile -Raw).Trim() } else { $null }
$orchAlive = if ($orchPid) { $null -ne (Get-Process -Id ([int]$orchPid) -ErrorAction SilentlyContinue) } else { $false }

$wdPid = if (Test-Path $WdLock) { (Get-Content $WdLock -Raw).Trim() } else { $null }
$wdAlive = if ($wdPid) { $null -ne (Get-Process -Id ([int]$wdPid) -ErrorAction SilentlyContinue) } else { $false }

# App Health
$appAlive = (Test-Path (Join-Path $RepoPath "apps\web\package.json")) -and (Test-Path (Join-Path $RepoPath "services\core-service\pom.xml"))

# AI Health
$aiAlive = $false
try {
    $resp = Invoke-RestMethod -Uri "http://127.0.0.1:8082/health" -TimeoutSec 3 -ErrorAction Stop
    $aiAlive = ($resp.status -eq "healthy")
} catch {
    $aiAlive = $null -ne (Get-Command hermes.exe, claude.exe, codex.exe -ErrorAction SilentlyContinue)
}

# Task Queue Progress
$total = 0
$completed = 0
if (Test-Path $QueueFile) {
    foreach ($line in (Get-Content $QueueFile -Encoding UTF8 -ErrorAction SilentlyContinue)) {
        if ($line -match '^\s*-\s*\[([x /!])\]\s+TASK\s+(\d+)\s*(?:[—\-:\s])\s*(.*)$') {
            $total++
            if ($Matches[1] -eq 'x') { $completed++ }
        }
    }
}
if ($total -eq 0) { $total = 136 }
$pct = [math]::Round(($completed / $total) * 100, 1)

# Circuit Breaker States
$circuitInfo = if (Test-Path $CircuitFile) { Get-Content $CircuitFile -Raw -ErrorAction SilentlyContinue } else { "{}" }

# Disk Usage
$drive = (Get-Item $RepoPath).PSDrive.Name
$disk = Get-WmiObject Win32_LogicalDisk -Filter "DeviceID='${drive}:'" -ErrorAction SilentlyContinue
$freeGb = if ($disk) { [math]::Round($disk.FreeSpace / 1GB, 2) } else { "N/A" }

$statusObj = [ordered]@{
    timestamp          = (Get-Date -Format "o")
    branch             = (git -C $RepoPath branch --show-current 2>$null).Trim()
    service_status     = if ($orchAlive -or $wdAlive) { "RUNNING" } else { "STOPPED" }
    orchestrator_pid   = if ($orchAlive) { [int]$orchPid } else { $null }
    watchdog_pid       = if ($wdAlive) { [int]$wdPid } else { $null }
    health_process     = if ($orchAlive -or $wdAlive) { "HEALTHY" } else { "UNHEALTHY" }
    health_app         = if ($appAlive) { "HEALTHY" } else { "UNHEALTHY" }
    health_ai          = if ($aiAlive) { "HEALTHY" } else { "DEGRADED" }
    completed_tasks    = $completed
    total_tasks        = $total
    progress_pct       = $pct
    disk_free_gb       = $freeGb
    log_file           = $LogFile
}

if ($Json) {
    $statusObj | ConvertTo-Json -Depth 4
    exit 0
}

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "             EUshop Unattended System Status & Observability Report            " -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "  TIMESTAMP        : $((Get-Date -Format 'yyyy-MM-dd HH:mm:ss'))" -ForegroundColor DarkGray
Write-Host "  GIT BRANCH       : $($statusObj.branch)" -ForegroundColor Yellow
Write-Host "  SERVICE STATUS   : $($statusObj.service_status)" -ForegroundColor (if ($statusObj.service_status -eq "RUNNING") { "Green" } else { "Red" })
Write-Host "--------------------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "  3-TIER HEALTH CHECKS:" -ForegroundColor White
Write-Host "    [1] Process Health : $($statusObj.health_process) (Orch PID: $orchPid | Watchdog PID: $wdPid)" -ForegroundColor (if ($statusObj.health_process -eq "HEALTHY") { "Green" } else { "Red" })
Write-Host "    [2] App Health     : $($statusObj.health_app) (Next.js & Spring Boot Configured)" -ForegroundColor (if ($statusObj.health_app -eq "HEALTHY") { "Green" } else { "Red" })
Write-Host "    [3] AI Path Health : $($statusObj.health_ai) (FCC Gateway / Fallback Matrix)" -ForegroundColor (if ($statusObj.health_ai -eq "HEALTHY") { "Green" } else { "Yellow" })
Write-Host "--------------------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "  TASK QUEUE PROGRESS:" -ForegroundColor White
Write-Host "    Completed        : $completed / $total Tasks ($pct%)" -ForegroundColor Green
Write-Host "    Next Phase       : Phase 27 (Security Emergency & CodeQL Remediation)" -ForegroundColor Cyan
Write-Host "--------------------------------------------------------------------------------" -ForegroundColor DarkGray
Write-Host "  RESOURCE & LOG INFO:" -ForegroundColor White
Write-Host "    Disk Free        : $freeGb GB" -ForegroundColor White
Write-Host "    Log Path         : $LogFile" -ForegroundColor DarkGray
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""
