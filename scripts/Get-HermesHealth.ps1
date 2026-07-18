#Requires -Version 5.1
param(
    [string]$ProjectPath = "D:\CODING\eushop",
    [switch]$Json,
    [int]$FccPort = 8082
)
Set-StrictMode -Version 2.0
$ErrorActionPreference = "Continue"

$REPO_ROOT       = [System.IO.Path]::GetFullPath($ProjectPath)
$CLAUDE_DIR      = Join-Path $REPO_ROOT ".claude"
$AGENT_STATE_DIR = Join-Path $REPO_ROOT ".agent-state"
$LOCK_PATH       = Join-Path $CLAUDE_DIR "AUTONOMOUS_RUNNER.lock"
$HEALTH_FILE     = Join-Path $AGENT_STATE_DIR "provider-health.json"
$MISSION_FILE    = Join-Path $AGENT_STATE_DIR "mission.json"
$FCC_HOME        = Join-Path $env:USERPROFILE ".fcc"
$FCC_ENV         = Join-Path $FCC_HOME ".env"
$GATEWAY_URL     = "http://127.0.0.1:$FccPort"
$warnings  = 0
$failures  = 0
$results   = [ordered]@{}

function Check-Item {
    param([string]$Name, [string]$Status, [string]$Detail = "", [string]$Level = "PASS")
    $results[$Name] = [ordered]@{ status=$Status; detail=$Detail; level=$Level }
    if (-not $Json) {
        $color = switch ($Level) { "PASS" { "Green" } "WARN" { "Yellow" } "FAIL" { "Red" } default { "Cyan" } }
        $icon  = switch ($Level) { "PASS" { "[OK ]" } "WARN" { "[WRN]" } "FAIL" { "[ERR]" } default { "[INF]" } }
        $padded = $Name.PadRight(28)
        Write-Host ("  " + $icon + " " + $padded + " " + $Status) -ForegroundColor $color
        if ($Detail -and $Detail -ne $Status) { Write-Host ("      " + $Detail) -ForegroundColor DarkGray }
    }
    if ($Level -eq "WARN") { $script:warnings++ }
    if ($Level -eq "FAIL") { $script:failures++ }
}

function Get-FccSetting([string]$Name) {
    if (-not (Test-Path -LiteralPath $FCC_ENV)) { return $null }
    $pattern = "^\s*" + [regex]::Escape($Name) + "\s*=(.*)$"
    foreach ($line in Get-Content -LiteralPath $FCC_ENV) {
        if ($line -match $pattern) { return $Matches[1].Trim().Trim('"').Trim("'") }
    }
    return $null
}

if (-not $Json) {
    Write-Host ""
    Write-Host "=======================================================" -ForegroundColor Cyan
    Write-Host "  EUshop Hermes/FCC Health Dashboard" -ForegroundColor Cyan
    Write-Host "=======================================================" -ForegroundColor Cyan
    Write-Host ("  " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss")) -ForegroundColor DarkGray
    Write-Host ""
}

# Hermes
$hermesCmd = Get-Command hermes.exe -ErrorAction SilentlyContinue
$hermesExe = if ($hermesCmd) { $hermesCmd.Source } else { $null }
if ($hermesExe) {
    try {
        $v = & $hermesExe --version 2>&1 | Select-Object -First 1
        Check-Item "Hermes executable" "PASS" $v "PASS"
    } catch {
        Check-Item "Hermes executable" "WARN" "Found but version check failed" "WARN"
    }
} else {
    Check-Item "Hermes executable" "FAIL" "Not found in PATH" "FAIL"
}

if ($hermesExe) {
    $vStr = (& $hermesExe --version 2>&1 | Out-String).Trim()
    if ($vStr -match "v?([\d.]+)") { $vStr = $Matches[0] }
    Check-Item "Hermes version" $vStr "" "INFO"
}

# Claude
$claudeCmd = Get-Command claude.exe -ErrorAction SilentlyContinue
$claudeExe = if ($claudeCmd) { $claudeCmd.Source } else { $null }
if ($claudeExe) {
    $cv = (& $claudeExe --version 2>&1 | Out-String).Trim()
    Check-Item "Claude executable" "PASS" $cv "PASS"
} else {
    Check-Item "Claude executable" "WARN" "Not found (needed for FCC mode)" "WARN"
}

# FCC
try {
    $resp = Invoke-RestMethod -Uri "$GATEWAY_URL/health" -TimeoutSec 4 -ErrorAction Stop
    $fccHealthy = $resp.status -eq "healthy"
    if ($fccHealthy) {
        Check-Item "FCC integration" "PASS" ("http://127.0.0.1:" + $FccPort + "/health = healthy") "PASS"
    } else {
        Check-Item "FCC integration" "WARN" "Responded but not healthy" "WARN"
    }
} catch {
    Check-Item "FCC integration" "FAIL" ("Port " + $FccPort + " not responding") "FAIL"
    $fccHealthy = $false
}

# Recovery state
$recoveryFile = Join-Path $CLAUDE_DIR "RECOVERY_STATE.md"
if (Test-Path -LiteralPath $recoveryFile) {
    $age = (Get-Date) - (Get-Item -LiteralPath $recoveryFile).LastWriteTime
    $ageStr = if ($age.TotalHours -lt 1) { ([int]$age.TotalMinutes).ToString() + "min ago" } else { ([int]$age.TotalHours).ToString() + "h ago" }
    Check-Item "Recovery state" "PASS" ("Updated " + $ageStr) "PASS"
} else {
    Check-Item "Recovery state" "WARN" "File not found" "WARN"
}

# Lock
if (Test-Path -LiteralPath $LOCK_PATH) {
    try {
        $lk = Get-Content -LiteralPath $LOCK_PATH -Raw | ConvertFrom-Json
        $pid2 = [int]$lk.pid
        $proc = Get-Process -Id $pid2 -ErrorAction SilentlyContinue
        if ($proc) {
            Check-Item "Lock status" "ACTIVE" ("PID " + $pid2 + " (" + $proc.Name + ") running") "WARN"
        } else {
            Check-Item "Lock status" "STALE" ("PID " + $pid2 + " dead. Run -Repair.") "WARN"
        }
    } catch {
        Check-Item "Lock status" "CORRUPT" "Lock file malformed. Run -Repair." "FAIL"
    }
} else {
    Check-Item "Lock status" "NONE" "No active lock" "PASS"
}

# Provider registry
if (Test-Path -LiteralPath $HEALTH_FILE) {
    try {
        $health = Get-Content -LiteralPath $HEALTH_FILE -Raw | ConvertFrom-Json
        $total2  = @($health.providers).Count
        $enabled = @($health.providers | Where-Object { $_.enabled }).Count
        $hasKey  = @($health.providers | Where-Object { $_.credential_present -eq $true }).Count
        $cooling = @($health.providers | Where-Object { $_.circuit_state -eq "open" }).Count
        Check-Item "Provider registry" "PASS" ($total2.ToString() + " total, " + $enabled.ToString() + " enabled") "PASS"
        $wkLevel = if ($hasKey -gt 0) { "PASS" } else { "FAIL" }; Check-Item "Working providers" $hasKey.ToString() "With credentials present" $wkLevel
        $clLevel = if ($cooling -eq 0) { "PASS" } else { "WARN" }; Check-Item "Cooling providers" $cooling.ToString() "Circuit open" $clLevel
    } catch {
        Check-Item "Provider registry" "FAIL" ("Cannot parse " + $HEALTH_FILE) "FAIL"
    }
} else {
    Check-Item "Provider registry" "WARN" ("File not found: " + $HEALTH_FILE) "WARN"
}

# Local fallback
$lmStudioCmd = Get-Command lms.exe -ErrorAction SilentlyContinue
$lmStudio = if ($lmStudioCmd) { $lmStudioCmd.Source } else { $null }
try {
    Invoke-RestMethod -Uri "http://127.0.0.1:1234/v1/models" -TimeoutSec 2 -ErrorAction Stop | Out-Null
    Check-Item "Local fallback" "AVAILABLE" "LM Studio server running (port 1234)" "PASS"
} catch {
    if ($lmStudio) {
        Check-Item "Local fallback" "AVAILABLE" "lms.exe found but server not running" "WARN"
    } else {
        Check-Item "Local fallback" "UNAVAILABLE" "LM Studio not running" "WARN"
    }
}

# Secret scan
$secretTracked = git ls-files --error-unmatch custom_keys.json 2>$null
if (-not $secretTracked) {
    Check-Item "Secret scan" "PASS" "custom_keys.json not tracked by git" "PASS"
} else {
    Check-Item "Secret scan" "FAIL" "custom_keys.json IS TRACKED BY GIT!" "FAIL"
}
$envTracked = git ls-files --error-unmatch .env.local 2>$null
if (-not $envTracked) {
    Check-Item "Env file safety" "PASS" ".env.local not tracked" "PASS"
} else {
    Check-Item "Env file safety" "FAIL" ".env.local IS TRACKED BY GIT!" "FAIL"
}

# Mission state
if (Test-Path -LiteralPath $MISSION_FILE) {
    try {
        $mission = Get-Content -LiteralPath $MISSION_FILE -Raw | ConvertFrom-Json
        Check-Item "Current mission phase" $mission.current_phase "" "INFO"
        Check-Item "Last successful cmd" $mission.last_successful_command "" "INFO"
    } catch {
        Check-Item "Mission state" "WARN" "Cannot parse mission.json" "WARN"
    }
}

# Crash counter
$crashFile = Join-Path $AGENT_STATE_DIR "crash-counter.json"
if (Test-Path -LiteralPath $crashFile) {
    try {
        $crash = Get-Content -LiteralPath $crashFile -Raw | ConvertFrom-Json
        $fails = [int]$crash.consecutive_failures
        $lvl = if ($fails -eq 0) { "PASS" } elseif ($fails -lt 3) { "WARN" } else { "FAIL" }
        Check-Item "Consecutive failures" $fails.ToString() "" $lvl
    } catch {}
}

# Output
if (-not $Json) {
    Write-Host ""
    Write-Host "-------------------------------------------------------" -ForegroundColor DarkGray
    if ($failures -gt 0) {
        Write-Host ("  " + $failures.ToString() + " critical issue(s) found. Run: .\Start-EUshop-Hermes.ps1 -Repair") -ForegroundColor Red
    } elseif ($warnings -gt 0) {
        Write-Host ("  " + $warnings.ToString() + " warning(s). System is functional.") -ForegroundColor Yellow
    } else {
        Write-Host "  All systems healthy." -ForegroundColor Green
    }
    Write-Host ""
    Write-Host "  Launch  : .\Start-EUshop-Hermes.ps1" -ForegroundColor DarkCyan
    Write-Host "  Resume  : .\Start-EUshop-Hermes.ps1 -Resume" -ForegroundColor DarkCyan
    Write-Host "  Repair  : .\Start-EUshop-Hermes.ps1 -Repair" -ForegroundColor DarkCyan
    Write-Host ""
}

if ($Json) {
    @{ timestamp=(Get-Date -Format "o"); warnings=$warnings; failures=$failures; checks=$results } |
        ConvertTo-Json -Depth 5
}

if ($failures -gt 0) { exit 2 }
if ($warnings -gt 0) { exit 1 }
exit 0
