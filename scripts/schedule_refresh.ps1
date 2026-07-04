# schedule_refresh.ps1
# Set up a Windows Task Scheduler job to run the Python refresh script every 8 hours (3 times a day)

$PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
$projectRoot = Split-Path -Parent -Path $PSScriptRoot

$pythonPath = Join-Path $projectRoot ".venv\Scripts\python.exe"
$scriptPath = Join-Path $projectRoot "scripts\refresh_cache.py"

if (-not (Test-Path $pythonPath)) {
    Write-Error "Virtual environment python not found at $pythonPath. Please verify virtual environment setup."
    Exit 1
}

# Define the action
$action = New-ScheduledTaskAction -Execute $pythonPath -Argument $scriptPath -WorkingDirectory $projectRoot

# Define the trigger (runs daily, repeat every 8 hours indefinitely)
$trigger = New-ScheduledTaskTrigger -Daily -At "12:00 AM"
$trigger.RepetitionInterval = (New-TimeSpan -Hours 8)
$trigger.RepetitionDuration = (New-TimeSpan -Days 1)

# Define settings
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

# Register the task
$taskName = "EUshopKeysRefresher"
Write-Host "Registering Windows Scheduled Task '$taskName' to run every 8 hours..."

try {
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Force -ErrorAction Stop
    Write-Host "[OK] Successfully registered scheduled task. Cache will update 3 times a day in the background."
} catch {
    Write-Warning "Failed to register scheduled task. This usually requires Administrator privileges."
    Write-Warning "To run it, open PowerShell as Administrator and run: .\scripts\schedule_refresh.ps1"
    Write-Warning "Note: The chat-agent script already updates the cache automatically on startup anyway!"
}
