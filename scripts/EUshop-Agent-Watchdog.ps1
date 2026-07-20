<#
.SYNOPSIS
    EUshop Agent Watchdog - Self-healing agent monitor with user alerts.

.DESCRIPTION
    - Monitors the orchestrator + AI agent process every 30 seconds.
    - Auto-restarts them (with exponential backoff) if they stop.
    - After 5 consecutive failures: shows a Windows Toast + writes .agent-state\ALERT.md.
    - Detects AUTONOMOUS_COMPLETE and notifies you the mission is done.
    - Never crashes silently.

.USAGE
    Start:  .\scripts\EUshop-Agent-Watchdog.ps1
    Stop:   .\scripts\EUshop-Agent-Watchdog.ps1 -Stop
#>
[CmdletBinding()]
param(
    [string]$ProjectPath = "D:\CODING\eushop",
    [switch]$Stop
)

$ErrorActionPreference = "Continue"

# ---- Paths ------------------------------------------------------------------
$LockPath           = Join-Path $ProjectPath ".claude\AGENT_FAILOVER.lock"
$StopMarker         = Join-Path $ProjectPath ".claude\AUTONOMOUS_STOP"
$CompleteMarker     = Join-Path $ProjectPath ".claude\AUTONOMOUS_COMPLETE"
$AlertPath          = Join-Path $ProjectPath ".agent-state\ALERT.md"
$WatchdogLock       = Join-Path $ProjectPath ".agent-state\watchdog.pid"
$WatchdogLog        = Join-Path $ProjectPath ".agent-state\watchdog.log"
$OrchestratorScript = Join-Path $ProjectPath "scripts\EUshop-Agent-Orchestrator.ps1"

# ---- Tuning -----------------------------------------------------------------
$CheckIntervalSec  = 30
$InitialBackoffSec = 60
$MaxBackoffSec     = 600
$AlertAfterFails   = 5
$StabilityResetSec = 3600

# ---- Logging ----------------------------------------------------------------
function Write-Log {
    param([string]$Level, [string]$Msg)
    $ts   = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$ts][$Level] $Msg"
    $color = switch ($Level) {
        "OK"    { "Green"  }
        "WARN"  { "Yellow" }
        "ERROR" { "Red"    }
        default { "Cyan"   }
    }
    Write-Host $line -ForegroundColor $color
    try {
        $d = Split-Path -Parent $WatchdogLog
        if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
        Add-Content -LiteralPath $WatchdogLog -Value $line -ErrorAction SilentlyContinue
    } catch {}
}

# ---- Windows Toast ----------------------------------------------------------
function Send-Toast {
    param([string]$Title, [string]$Body)
    try {
        Add-Type -AssemblyName System.Windows.Forms -ErrorAction SilentlyContinue
        $n = New-Object System.Windows.Forms.NotifyIcon
        $n.Icon            = [System.Drawing.SystemIcons]::Information
        $n.BalloonTipTitle = $Title
        $n.BalloonTipText  = $Body
        $n.Visible         = $true
        $n.ShowBalloonTip(8000)
        Start-Sleep -Seconds 1
        $n.Dispose()
    } catch {
        # Fallback: bright console banner
        Write-Host ""
        Write-Host "================================================" -ForegroundColor Red
        Write-Host "  ALERT: $Title" -ForegroundColor Red
        Write-Host "  $Body" -ForegroundColor Yellow
        Write-Host "================================================" -ForegroundColor Red
        Write-Host ""
    }
}

# ---- Alert file -------------------------------------------------------------
function Write-Alert {
    param([string]$Title, [string]$Body, [string]$Action)
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $d  = Split-Path -Parent $AlertPath
    if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
    $txt = @"
# EUshop Agent ALERT - $ts

## Status
$Title

## Detail
$Body

## What to do
$Action

---
Delete this file once you have taken action.
"@
    [System.IO.File]::WriteAllText($AlertPath, $txt, [System.Text.UTF8Encoding]::new($false))
    Write-Log "WARN" "Alert written to: $AlertPath"
}

function Clear-Alert {
    if (Test-Path -LiteralPath $AlertPath) {
        Remove-Item -LiteralPath $AlertPath -Force -ErrorAction SilentlyContinue
    }
}

# ---- Orchestrator helpers ---------------------------------------------------
function Get-OrchestratorPid {
    if (Test-Path -LiteralPath $LockPath) {
        try { return [int](Get-Content -LiteralPath $LockPath -Raw -ErrorAction Stop) }
        catch { return 0 }
    }
    return 0
}

function Test-OrchestratorAlive {
    $p = Get-OrchestratorPid
    if ($p -le 0) { return $false }
    return ($null -ne (Get-Process -Id $p -ErrorAction SilentlyContinue))
}

function Test-AgentAlive {
    $a = Get-Process -Name "claude","codex","hermes" -ErrorAction SilentlyContinue
    return ($null -ne $a -and @($a).Count -gt 0)
}

function Clear-StaleState {
    if (Test-Path -LiteralPath $StopMarker) {
        Remove-Item -LiteralPath $StopMarker -Force -ErrorAction SilentlyContinue
        Write-Log "INFO" "Cleared AUTONOMOUS_STOP marker."
    }
    if (Test-Path -LiteralPath $LockPath) {
        $p = [int](Get-Content -LiteralPath $LockPath -Raw -ErrorAction SilentlyContinue)
        if ($p -gt 0 -and -not (Get-Process -Id $p -ErrorAction SilentlyContinue)) {
            Remove-Item -LiteralPath $LockPath -Force -ErrorAction SilentlyContinue
            Write-Log "INFO" "Cleared stale lock for dead PID $p."
        }
    }
}

function Start-Orchestrator {
    Write-Log "INFO" "Launching orchestrator (detached window)..."
    Start-Process powershell.exe `
        -ArgumentList "-NoLogo -NoProfile -ExecutionPolicy Bypass -File `"$OrchestratorScript`" -Mode Run -ProjectPath `"$ProjectPath`"" `
        -WindowStyle Normal
    Start-Sleep -Seconds 4
}

# ============================
# STOP MODE
# ============================
if ($Stop) {
    Write-Log "INFO" "Stopping watchdog..."
    if (Test-Path -LiteralPath $WatchdogLock) {
        $wdp = [int](Get-Content -LiteralPath $WatchdogLock -Raw -ErrorAction SilentlyContinue)
        if ($wdp -gt 0) {
            Stop-Process -Id $wdp -Force -ErrorAction SilentlyContinue
            Remove-Item -LiteralPath $WatchdogLock -Force -ErrorAction SilentlyContinue
            Write-Log "OK" "Watchdog PID $wdp stopped."
        }
    } else {
        Write-Log "WARN" "Watchdog lock not found - may not be running."
    }
    exit 0
}

# ============================
# START MODE - write PID file
# ============================
$d = Split-Path -Parent $WatchdogLock
if (-not (Test-Path $d)) { New-Item -ItemType Directory -Path $d -Force | Out-Null }
[System.IO.File]::WriteAllText($WatchdogLock, "$PID", [System.Text.UTF8Encoding]::new($false))

Write-Log "OK" "=== EUshop Agent Watchdog started (PID $PID) ==="
Write-Log "OK" "Polling every $CheckIntervalSec seconds. Alert after $AlertAfterFails failures."
Write-Log "OK" "Alert file: $AlertPath"
Write-Log "OK" "Stop with: .\scripts\EUshop-Agent-Watchdog.ps1 -Stop"

$fails       = 0
$backoff     = $InitialBackoffSec
$lastRestart = [DateTime]::MinValue

# ============================
# MAIN LOOP
# ============================
while ($true) {
    try {

        # -- Mission complete? Celebrate and exit. ----------------------------
        if (Test-Path -LiteralPath $CompleteMarker) {
            Write-Log "OK" "AUTONOMOUS_COMPLETE detected! All tasks done."
            Clear-Alert
            Send-Toast -Title "EUshop AI: MISSION COMPLETE!" `
                       -Body "All autonomous tasks finished. Check GitHub Pages!"
            Remove-Item -LiteralPath $WatchdogLock -Force -ErrorAction SilentlyContinue
            break
        }

        # -- Reset backoff after sustained stability --------------------------
        if ($lastRestart -ne [DateTime]::MinValue) {
            $upSecs = ([DateTime]::Now - $lastRestart).TotalSeconds
            if ($upSecs -gt $StabilityResetSec -and $fails -gt 0) {
                Write-Log "INFO" "Stable for $([int]$upSecs)s - resetting backoff."
                $fails   = 0
                $backoff = $InitialBackoffSec
            }
        }

        $orchAlive  = Test-OrchestratorAlive
        $agentAlive = Test-AgentAlive
        $stopExists = Test-Path -LiteralPath $StopMarker

        # -- AUTONOMOUS_STOP set (agent asked to pause) - auto-clear & restart -
        if ($stopExists -and -not $orchAlive) {
            Write-Log "WARN" "AUTONOMOUS_STOP found and orchestrator down. Auto-clearing and restarting..."
            Clear-StaleState
            Start-Sleep -Seconds 3
            Start-Orchestrator
            $fails++
            $lastRestart = [DateTime]::Now

        } elseif (-not $orchAlive -and -not $stopExists) {
            # -- Orchestrator died silently - restart with backoff -------------
            $fails++
            Write-Log "WARN" "Orchestrator down (failure #$fails). Waiting ${backoff}s before restart..."

            if ($fails -ge $AlertAfterFails) {
                $body   = "Orchestrator has failed $fails times. Last restart: $lastRestart"
                $action = "1. Run: .\scripts\EUshop-Agent-Orchestrator.ps1 -Mode Status`n" +
                          "2. Check logs: .claude\agent-failover-logs-v3\`n" +
                          "3. Manually restart: .\scripts\EUshop-Agent-Orchestrator.ps1 -Mode Run"
                Write-Alert -Title "Orchestrator repeatedly failing" -Body $body -Action $action
                Send-Toast -Title "EUshop Agent Needs Attention ($fails fails)" `
                           -Body "Check .agent-state\ALERT.md for instructions."
            }

            Start-Sleep -Seconds $backoff
            Clear-StaleState
            Start-Orchestrator
            $lastRestart = [DateTime]::Now
            # Exponential backoff (cap at max)
            $backoff = [Math]::Min($backoff * 2, $MaxBackoffSec)

        } elseif ($orchAlive -and -not $agentAlive) {
            # -- Orchestrator alive but no agent yet - just wait ---------------
            Write-Log "INFO" "Orchestrator alive, waiting for agent process to spawn..."

        } else {
            # -- HEALTHY ------------------------------------------------------
            if ($fails -gt 0) {
                Write-Log "OK" "Agent recovered after $fails failure(s). Clearing alert."
                Clear-Alert
                $fails   = 0
                $backoff = $InitialBackoffSec
            }
            $op  = Get-OrchestratorPid
            $ags = Get-Process -Name "claude","codex","hermes" -ErrorAction SilentlyContinue
            $astr = if ($ags) { ($ags | ForEach-Object { "$($_.Name)[$($_.Id)]" }) -join ", " } else { "none" }
            Write-Log "OK" "Healthy - Orch:PID $op | Agent: $astr"
        }

    } catch {
        Write-Log "ERROR" "Watchdog internal error (will continue): $_"
    }

    Start-Sleep -Seconds $CheckIntervalSec
}
