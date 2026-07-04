<#
.SYNOPSIS
    Install EUshop Key Daemon as a Windows Task Scheduler job.
    Compatible with PowerShell 5.1+

.DESCRIPTION
    Registers key_daemon.py to run every hour via Windows Task Scheduler.
    Starts on system boot, repeats every 60 minutes, survives reboots.
    Also installs a WATCHDOG task that restarts the daemon if it dies.

.EXAMPLE
    .\scripts\install_daemon.ps1
    .\scripts\install_daemon.ps1 -Uninstall
    .\scripts\install_daemon.ps1 -Status
    .\scripts\install_daemon.ps1 -RunNow
#>

param(
    [switch]$Uninstall,
    [switch]$Status,
    [switch]$RunNow
)

$TaskName         = "EushopKeyDaemon"
$WatchdogTaskName = "EushopKeyDaemonWatchdog"
$ProjectRoot      = Split-Path -Parent -Path (Split-Path -Parent -Path $MyInvocation.MyCommand.Definition)
$VenvPython       = Join-Path $ProjectRoot ".venv\Scripts\python.exe"
$ScriptPath       = Join-Path $ProjectRoot "scripts\key_daemon.py"
$LogDir           = Join-Path $ProjectRoot "logs"
$PythonExe        = $null

# ─── Find Python (PS 5.1 compatible, no ?. operator) ──────────────────────────
if (Test-Path $VenvPython) {
    $PythonExe = $VenvPython
    Write-Host "[INFO] Using venv Python: $PythonExe" -ForegroundColor Cyan
} else {
    $pyCmd = Get-Command python -ErrorAction SilentlyContinue
    if ($null -ne $pyCmd) {
        $PythonExe = $pyCmd.Source
        Write-Warning "Venv not found, using system Python: $PythonExe"
    } else {
        $py3Cmd = Get-Command python3 -ErrorAction SilentlyContinue
        if ($null -ne $py3Cmd) {
            $PythonExe = $py3Cmd.Source
            Write-Warning "Using python3: $PythonExe"
        } else {
            Write-Error "No Python found. Install Python or set up the virtual environment first."
            Exit 1
        }
    }
}

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

# ─── STATUS ────────────────────────────────────────────────────────────────────
if ($Status) {
    Write-Host "`n=== Task Scheduler Status ===" -ForegroundColor Cyan
    foreach ($name in @($TaskName, $WatchdogTaskName)) {
        $task = Get-ScheduledTask -TaskName $name -ErrorAction SilentlyContinue
        if ($task) {
            $info = Get-ScheduledTaskInfo -TaskName $name -ErrorAction SilentlyContinue
            Write-Host "`n  Task       : $name" -ForegroundColor Green
            Write-Host "  State      : $($task.State)"
            if ($info) {
                Write-Host "  Last Run   : $($info.LastRunTime)"
                Write-Host "  Last Result: $($info.LastTaskResult)"
                Write-Host "  Next Run   : $($info.NextRunTime)"
            }
        } else {
            Write-Warning "  Task '$name' is NOT registered."
        }
    }

    $cachePath = Join-Path $ProjectRoot ".api_keys_pool.json"
    if (Test-Path $cachePath) {
        try {
            $cache = Get-Content $cachePath -Raw | ConvertFrom-Json
            Write-Host "`n=== Key Pool Status ===" -ForegroundColor Cyan
            Write-Host "  Updated   : $($cache.updated_at)"
            Write-Host "  Valid Keys: $($cache.total_valid)"
        } catch {
            Write-Warning "Could not parse .api_keys_pool.json"
        }
    } else {
        Write-Warning "`nHot cache not found. Run: python scripts\key_daemon.py --once"
    }
    Write-Host ""
    Exit 0
}

# ─── UNINSTALL ─────────────────────────────────────────────────────────────────
if ($Uninstall) {
    foreach ($name in @($TaskName, $WatchdogTaskName)) {
        $task = Get-ScheduledTask -TaskName $name -ErrorAction SilentlyContinue
        if ($task) {
            Unregister-ScheduledTask -TaskName $name -Confirm:$false
            Write-Host "[OK] Unregistered task '$name'" -ForegroundColor Green
        } else {
            Write-Warning "Task '$name' was not found."
        }
    }
    Exit 0
}

# ─── RUN NOW ───────────────────────────────────────────────────────────────────
if ($RunNow) {
    Write-Host "Running immediate key refresh..." -ForegroundColor Yellow
    & $PythonExe $ScriptPath --once
    Exit $LASTEXITCODE
}

# ─── INSTALL ───────────────────────────────────────────────────────────────────
Write-Host "`n=== Installing EUshop Key Daemon (PowerShell 5.1 compatible) ===" -ForegroundColor Cyan
Write-Host "  Project root : $ProjectRoot"
Write-Host "  Python       : $PythonExe"
Write-Host "  Script       : $ScriptPath"
Write-Host "  Task names   : $TaskName, $WatchdogTaskName"
Write-Host ""

# Remove existing tasks
foreach ($name in @($TaskName, $WatchdogTaskName)) {
    if (Get-ScheduledTask -TaskName $name -ErrorAction SilentlyContinue) {
        Unregister-ScheduledTask -TaskName $name -Confirm:$false
        Write-Host "[INFO] Removed existing task: $name"
    }
}

# ─── MAIN DAEMON TASK ─────────────────────────────────────────────────────────
$Action = New-ScheduledTaskAction `
    -Execute $PythonExe `
    -Argument "`"$ScriptPath`"" `
    -WorkingDirectory $ProjectRoot

# Trigger 1: At system startup (2-minute delay for network)
$TriggerBoot = New-ScheduledTaskTrigger -AtStartup

# Trigger 2: Repeat every hour starting in 2 minutes
$startTime = (Get-Date).AddMinutes(2)
$TriggerRepeat = New-ScheduledTaskTrigger -Once -At $startTime `
    -RepetitionInterval (New-TimeSpan -Hours 1) `
    -RepetitionDuration ([TimeSpan]::MaxValue)

$Settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 50) `
    -RestartCount 5 `
    -RestartInterval (New-TimeSpan -Minutes 3) `
    -RunOnlyIfNetworkAvailable `
    -StartWhenAvailable `
    -MultipleInstances IgnoreNew `
    -Hidden

$Principal = New-ScheduledTaskPrincipal `
    -UserId $env:USERNAME `
    -LogonType Interactive `
    -RunLevel Limited

try {
    Register-ScheduledTask `
        -TaskName $TaskName `
        -Action $Action `
        -Trigger @($TriggerBoot, $TriggerRepeat) `
        -Settings $Settings `
        -Principal $Principal `
        -Description "EUshop Key Daemon: hourly refresh of free LLM API key pool" `
        -Force | Out-Null
    Write-Host "[OK] Main daemon task registered: $TaskName" -ForegroundColor Green
} catch {
    Write-Error "Failed to register main task: $_"
    Exit 1
}

# ─── WATCHDOG TASK ────────────────────────────────────────────────────────────
# Watchdog runs every 15 minutes, detects if pool is stale (>2h), re-triggers --once
$WatchdogScript = Join-Path $ProjectRoot "scripts\watchdog_daemon.ps1"
$WatchdogContent = @"
# Auto-generated by install_daemon.ps1 — DO NOT EDIT
`$CachePath = "$($ProjectRoot.Replace('\','\\'))\\.api_keys_pool.json"
`$DaemonScript = "$($ScriptPath.Replace('\','\\'))"
`$Python = "$($PythonExe.Replace('\','\\'))"
`$MaxAgeMinutes = 120

if (Test-Path `$CachePath) {
    try {
        `$data = Get-Content `$CachePath -Raw | ConvertFrom-Json
        `$updated = [datetime]::Parse(`$data.updated_at)
        `$ageMinutes = ([datetime]::UtcNow - `$updated).TotalMinutes
        if (`$ageMinutes -gt `$MaxAgeMinutes) {
            Write-Host "WATCHDOG: Pool stale (`$([int]`$ageMinutes) min). Triggering refresh..."
            & `$Python `$DaemonScript --once 2>&1
        } else {
            Write-Host "WATCHDOG: Pool OK (`$([int]`$ageMinutes) min old, `$(`$data.total_valid) keys)"
        }
    } catch {
        Write-Host "WATCHDOG: Cache parse error, triggering refresh: `$_"
        & `$Python `$DaemonScript --once 2>&1
    }
} else {
    Write-Host "WATCHDOG: No cache found. Triggering initial refresh..."
    & `$Python `$DaemonScript --once 2>&1
}
"@
$WatchdogContent | Set-Content -Path $WatchdogScript -Encoding UTF8

$WatchdogAction = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument "-NoProfile -NonInteractive -ExecutionPolicy Bypass -File `"$WatchdogScript`"" `
    -WorkingDirectory $ProjectRoot

$WatchdogStart = (Get-Date).AddMinutes(15)
$TriggerWatchdog = New-ScheduledTaskTrigger -Once -At $WatchdogStart `
    -RepetitionInterval (New-TimeSpan -Minutes 15) `
    -RepetitionDuration ([TimeSpan]::MaxValue)

$WatchdogSettings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 10) `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 2) `
    -StartWhenAvailable `
    -MultipleInstances IgnoreNew

try {
    Register-ScheduledTask `
        -TaskName $WatchdogTaskName `
        -Action $WatchdogAction `
        -Trigger $TriggerWatchdog `
        -Settings $WatchdogSettings `
        -Principal $Principal `
        -Description "Watchdog: restarts EUshop Key Daemon if pool goes stale for 2+ hours" `
        -Force | Out-Null
    Write-Host "[OK] Watchdog task registered: $WatchdogTaskName (every 15 min)" -ForegroundColor Green
} catch {
    Write-Warning "Failed to register watchdog (non-critical): $_"
}

# ─── RUN INITIAL CYCLE ────────────────────────────────────────────────────────
Write-Host "`nRunning initial key refresh (takes ~15s)..." -ForegroundColor Yellow
& $PythonExe $ScriptPath --once
$exitCode = $LASTEXITCODE

Write-Host ""
Write-Host "=== Installation Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Tasks installed:" -ForegroundColor Cyan
Write-Host "  $TaskName          — runs every 1 hour"
Write-Host "  $WatchdogTaskName  — checks every 15 min, heals if stale"
Write-Host ""
Write-Host "Management:" -ForegroundColor Yellow
Write-Host "  Status    : .\scripts\install_daemon.ps1 -Status"
Write-Host "  Run now   : .\scripts\install_daemon.ps1 -RunNow"
Write-Host "  Uninstall : .\scripts\install_daemon.ps1 -Uninstall"
Write-Host "  Pool info : python scripts\key_daemon.py --status"
