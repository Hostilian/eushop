<#
.SYNOPSIS
    Install EUshop Key Daemon as a Windows Task Scheduler job.

.DESCRIPTION
    Registers key_daemon.py to run every hour via Windows Task Scheduler.
    The task starts on system boot and repeats every 60 minutes indefinitely.
    Logs go to logs/key_daemon.log in the project root.

.EXAMPLE
    .\scripts\install_daemon.ps1
    .\scripts\install_daemon.ps1 -Uninstall
    .\scripts\install_daemon.ps1 -Status
#>

param(
    [switch]$Uninstall,
    [switch]$Status
)

$TaskName    = "EushopKeyDaemon"
$ProjectRoot = Split-Path -Parent -Path (Split-Path -Parent -Path $MyInvocation.MyCommand.Definition)
$PythonExe   = Join-Path $ProjectRoot ".venv\Scripts\python.exe"
$ScriptPath  = Join-Path $ProjectRoot "scripts\key_daemon.py"
$LogDir      = Join-Path $ProjectRoot "logs"

# Fall back to system Python if venv not found
if (-not (Test-Path $PythonExe)) {
    $PythonExe = (Get-Command python -ErrorAction SilentlyContinue)?.Source
    if (-not $PythonExe) {
        Write-Error "Python not found. Install Python or set up the virtual environment first."
        Exit 1
    }
    Write-Warning "Using system Python: $PythonExe (venv not found)"
}

# ─────────────────────────────────────────────
# Status
# ─────────────────────────────────────────────
if ($Status) {
    $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($task) {
        $info = Get-ScheduledTaskInfo -TaskName $TaskName
        Write-Host "`n=== Task Scheduler Status ===" -ForegroundColor Cyan
        Write-Host "Task       : $TaskName" -ForegroundColor Green
        Write-Host "State      : $($task.State)"
        Write-Host "Last Run   : $($info.LastRunTime)"
        Write-Host "Last Result: $($info.LastTaskResult)"
        Write-Host "Next Run   : $($info.NextRunTime)"
        Write-Host ""

        # Also show hot cache status
        $cachePath = Join-Path $ProjectRoot ".api_keys_pool.json"
        if (Test-Path $cachePath) {
            $cache = Get-Content $cachePath | ConvertFrom-Json
            Write-Host "=== Key Pool Status ===" -ForegroundColor Cyan
            Write-Host "Updated   : $($cache.updated_at)"
            Write-Host "Valid Keys: $($cache.total_valid)"
        } else {
            Write-Warning "Hot cache not found (.api_keys_pool.json). Run daemon --once first."
        }
    } else {
        Write-Warning "Task '$TaskName' is NOT registered."
    }
    Exit 0
}

# ─────────────────────────────────────────────
# Uninstall
# ─────────────────────────────────────────────
if ($Uninstall) {
    $task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($task) {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        Write-Host "[OK] Task '$TaskName' has been unregistered." -ForegroundColor Green
    } else {
        Write-Warning "Task '$TaskName' was not found."
    }
    Exit 0
}

# ─────────────────────────────────────────────
# Install
# ─────────────────────────────────────────────
Write-Host "`n=== Installing EUshop Key Daemon ===" -ForegroundColor Cyan
Write-Host "Project root : $ProjectRoot"
Write-Host "Python       : $PythonExe"
Write-Host "Script       : $ScriptPath"
Write-Host "Task name    : $TaskName"
Write-Host ""

# Create logs directory
New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

# Check if task already exists
$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
    Write-Warning "Task '$TaskName' already exists. Removing and re-registering..."
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

# Build the action: python scripts/key_daemon.py
# We pass --harvest on startup only (first cycle does full harvest)
$Action = New-ScheduledTaskAction `
    -Execute $PythonExe `
    -Argument "`"$ScriptPath`"" `
    -WorkingDirectory $ProjectRoot

# Trigger 1: At system startup (delay 2 min for network)
$TriggerBoot = New-ScheduledTaskTrigger -AtStartup
$TriggerBoot.Delay = "PT2M"  # 2 minute delay after boot

# Trigger 2: Repeat every 1 hour indefinitely (starting now)
$TriggerRepeat = New-ScheduledTaskTrigger -RepetitionInterval (New-TimeSpan -Hours 1) `
    -Once -At (Get-Date).AddMinutes(2)

# Settings
$Settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Hours 0 -Minutes 50) `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 5) `
    -RunOnlyIfNetworkAvailable `
    -StartWhenAvailable `
    -MultipleInstances IgnoreNew

# Principal: run as current user
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
        -Description "EUshop Key Daemon: hourly refresh of free LLM API keys pool" `
        -Force | Out-Null

    Write-Host "[OK] Task '$TaskName' registered successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Management commands:" -ForegroundColor Yellow
    Write-Host "  Status  : .\scripts\install_daemon.ps1 -Status"
    Write-Host "  Stop    : Stop-ScheduledTask -TaskName '$TaskName'"
    Write-Host "  Start   : Start-ScheduledTask -TaskName '$TaskName'"
    Write-Host "  Uninstall: .\scripts\install_daemon.ps1 -Uninstall"
    Write-Host ""

    # Run immediately as a test
    Write-Host "Running initial key refresh (this takes ~30 seconds)..." -ForegroundColor Yellow
    & $PythonExe $ScriptPath --once
    Write-Host ""
    Write-Host "[DONE] Daemon installed and initial key pool populated!" -ForegroundColor Green
    Write-Host "Keys are stored in .api_keys_pool.json and .env.local is updated." -ForegroundColor Cyan

} catch {
    Write-Error "Failed to register task: $_"
    Write-Host ""
    Write-Host "Try running this script as Administrator, or use the manual command:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "schtasks /create /tn `"$TaskName`" /tr `"`"$PythonExe`" `"$ScriptPath`"`" /sc hourly /mo 1 /ru `"$env:USERNAME`" /f"
    Exit 1
}
