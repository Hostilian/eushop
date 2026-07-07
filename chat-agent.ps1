$PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
Set-Location $PSScriptRoot

$pythonPath = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
if (-not (Test-Path $pythonPath)) {
    Write-Error "Virtual environment python not found at $pythonPath"
    Exit 1
}

$scriptPath = Join-Path $PSScriptRoot "scripts\chat_agent.py"

# Run inline in the current shell by default to support easy copy-pasting of prompts.
# If you explicitly want a separate popup window, run with -NewWindow
if ($args -contains "-NewWindow") {
    # Filter out -NewWindow argument
    $filteredArgs = $args | Where-Object { $_ -ne "-NewWindow" }
    $argString = ""
    if ($filteredArgs) {
        $argString = $filteredArgs -join " "
    }
    Write-Host "Launching EUshop AI Agent in a new PowerShell window..." -ForegroundColor Cyan
    Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command `& `"$pythonPath`" `"$scriptPath`" $argString; Write-Host; Read-Host 'Press Enter to exit...'"
} else {
    & $pythonPath $scriptPath $args
}
