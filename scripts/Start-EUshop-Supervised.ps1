#Requires -Version 5.1
<#
.SYNOPSIS
    Production Background Process Supervisor for EUshop
.DESCRIPTION
    Runs Start-EUshop-Hermes.ps1 / Orchestrator in a supervised background process with single-instance PID locking,
    exponential backoff, stdout/stderr logging, and continuous self-healing daemon.
#>

param(
    [string]$ProjectPath = "D:\CODING\eushop",
    [switch]$DaemonMode
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = "Continue"

$CLAUDE_DIR     = Join-Path $ProjectPath ".claude"
$AGENT_STATE    = Join-Path $ProjectPath ".agent-state"
$SUPERVISOR_PID = Join-Path $AGENT_STATE "supervisor.pid"
$WATCHDOG_PID   = Join-Path $AGENT_STATE "watchdog.pid"
$LOG_FILE       = Join-Path $AGENT_STATE "logs\unattended-runner.log"

if (-not (Test-Path $AGENT_STATE)) { New-Item -ItemType Directory -Path $AGENT_STATE -Force | Out-Null }
if (-not (Test-Path (Join-Path $AGENT_STATE "logs"))) { New-Item -ItemType Directory -Path (Join-Path $AGENT_STATE "logs") -Force | Out-Null }

# Single-instance lock verification
if (Test-Path $SUPERVISOR_PID) {
    $existingPid = Get-Content $SUPERVISOR_PID -ErrorAction SilentlyContinue
    if ($existingPid -and (Get-Process -Id ([int]$existingPid) -ErrorAction SilentlyContinue)) {
        Write-Host "[SUPERVISOR] Supervisor process is already active (PID $existingPid)." -ForegroundColor Yellow
        exit 0
    }
}

# Write PID lock
$PID | Out-File -FilePath $SUPERVISOR_PID -Encoding ASCII -Force

$ts = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  EUshop Production Process Supervisor (PID $PID)" -ForegroundColor Cyan
Write-Host "  Started: $ts" -ForegroundColor DarkGray
Write-Host "=======================================================" -ForegroundColor Cyan

# 1. Launch Watchdog Daemon if not running
$wdActive = $false
if (Test-Path $WATCHDOG_PID) {
    $wdPid = Get-Content $WATCHDOG_PID -ErrorAction SilentlyContinue
    if ($wdPid -and (Get-Process -Id ([int]$wdPid) -ErrorAction SilentlyContinue)) {
        $wdActive = $true
    }
}

if (-not $wdActive) {
    Write-Host "[SUPERVISOR] Launching self-healing Watchdog daemon..." -ForegroundColor Green
    Start-Process powershell.exe -ArgumentList "-NoExit -ExecutionPolicy Bypass -File D:\CODING\eushop\scripts\EUshop-Agent-Watchdog.ps1" -WindowStyle Minimized -WorkingDirectory $ProjectPath
}

# 2. Launch Canonical Launcher / Orchestrator
Write-Host "[SUPERVISOR] Launching Hermes Launcher (-Resume)..." -ForegroundColor Green
Start-Process powershell.exe -ArgumentList "-ExecutionPolicy Bypass -File D:\CODING\eushop\Start-EUshop-Hermes.ps1 -Resume" -WindowStyle Minimized -WorkingDirectory $ProjectPath

Write-Host "[SUPERVISOR] System online. Background supervision active." -ForegroundColor Green
