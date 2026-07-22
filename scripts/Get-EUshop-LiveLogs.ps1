#Requires -Version 5.1
<#
.SYNOPSIS
    Live Log Tailing & Error Inspection Tool for EUshop
.DESCRIPTION
    Follow live log streams, filter errors, inspect recent activity, and review restart history.
.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\scripts\Get-EUshop-LiveLogs.ps1 -Follow
    powershell -ExecutionPolicy Bypass -File .\scripts\Get-EUshop-LiveLogs.ps1 -ErrorsOnly
    powershell -ExecutionPolicy Bypass -File .\scripts\Get-EUshop-LiveLogs.ps1 -RestartHistory
#>

param(
    [string]$ProjectPath = "D:\CODING\eushop",
    [switch]$Follow,
    [switch]$ErrorsOnly,
    [switch]$LastHour,
    [switch]$RestartHistory,
    [int]$Lines = 50
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = "SilentlyContinue"

$LogDir   = Join-Path $ProjectPath ".agent-state"
$LogFile  = Join-Path $LogDir "logs\unattended-runner.log"
$WdLog    = Join-Path $LogDir "watchdog.log"

if ($RestartHistory) {
    Write-Host "=== Watchdog Restart History ===" -ForegroundColor Cyan
    if (Test-Path $WdLog) {
        Get-Content $WdLog -ErrorAction SilentlyContinue | Select-String -Pattern "restart|launched|restarted|down|failure|recovered" | Select-Object -Last $Lines
    } else {
        Write-Host "No watchdog log found at $WdLog" -ForegroundColor Yellow
    }
    exit 0
}

$target = if (Test-Path $LogFile) { $LogFile } elseif (Test-Path $WdLog) { $WdLog } else { $null }

if (-not $target) {
    Write-Host "No active log file found." -ForegroundColor Yellow
    exit 0
}

Write-Host "Tailing log file: $target" -ForegroundColor DarkGray

if ($Follow) {
    Get-Content $target -Wait -Tail $Lines
} elseif ($ErrorsOnly) {
    Get-Content $target -Tail 500 | Select-String -Pattern "ERROR|FAIL|exception|error"
} elseif ($LastHour) {
    $cutoff = (Get-Date).AddHours(-1)
    Get-Content $target -Tail 500 | Where-Object { $_ -match '\[(.*?)\]' -and ([DateTime]::Parse($Matches[1]) -gt $cutoff) }
} else {
    Get-Content $target -Tail $Lines
}
