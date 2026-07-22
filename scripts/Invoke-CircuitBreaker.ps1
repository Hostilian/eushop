#Requires -Version 5.1
<#
.SYNOPSIS
    EUshop AI Provider Circuit Breaker State Machine
.DESCRIPTION
    Manages CLOSED, OPEN, and HALF-OPEN states per AI provider to prevent API rate-limit bans
    and cascade failures. Persists state to .agent-state\circuit-breaker-state.json.
#>

param(
    [string]$ProjectPath = "D:\CODING\eushop",
    [string]$Provider = "fcc",
    [ValidateSet("Test", "ReportSuccess", "ReportFailure", "GetState")]
    [string]$Action = "Test"
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = "SilentlyContinue"

$StateFile = Join-Path $ProjectPath ".agent-state\circuit-breaker-state.json"
$FailureThreshold = 3
$CooldownSeconds  = 900 # 15 minutes

function Load-CircuitState {
    if (Test-Path -LiteralPath $StateFile) {
        try {
            $raw = Get-Content -LiteralPath $StateFile -Raw -ErrorAction Stop
            return ($raw | ConvertFrom-Json)
        } catch {}
    }
    return [pscustomobject]@{}
}

function Save-CircuitState($state) {
    $dir = Split-Path -Parent $StateFile
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    $json = $state | ConvertTo-Json -Depth 5 -Compress
    Set-Content -LiteralPath $StateFile -Value $json -Force -ErrorAction SilentlyContinue
}

$stateObj = Load-CircuitState

if (-not $stateObj.$Provider) {
    $stateObj | Add-Member -NotePropertyName $Provider -NotePropertyValue ([pscustomobject]@{
        state              = "CLOSED"
        consecutive_fails  = 0
        last_failure_time  = $null
        last_success_time  = $null
        cooldown_until     = $null
    }) -Force
}

$pState = $stateObj.$Provider
$now = Get-Date

switch ($Action) {
    "Test" {
        if ($pState.state -eq "OPEN") {
            if ($pState.cooldown_until -and ($now -gt [DateTime]::Parse($pState.cooldown_until))) {
                $pState.state = "HALF-OPEN"
                Save-CircuitState $stateObj
                Write-Output "HALF-OPEN"
            } else {
                Write-Output "OPEN"
            }
        } else {
            Write-Output $pState.state
        }
    }

    "ReportSuccess" {
        $pState.state = "CLOSED"
        $pState.consecutive_fails = 0
        $pState.last_success_time = $now.ToString("o")
        $pState.cooldown_until = $null
        Save-CircuitState $stateObj
        Write-Output "CLOSED"
    }

    "ReportFailure" {
        $pState.consecutive_fails++
        $pState.last_failure_time = $now.ToString("o")

        if ($pState.consecutive_fails -ge $FailureThreshold) {
            $pState.state = "OPEN"
            $pState.cooldown_until = $now.AddSeconds($CooldownSeconds).ToString("o")
            Write-Host "Circuit Breaker OPEN for $Provider until $($pState.cooldown_until)" -ForegroundColor Yellow
        }

        Save-CircuitState $stateObj
        Write-Output $pState.state
    }

    "GetState" {
        Write-Output ($pState | ConvertTo-Json -Compress)
    }
}
