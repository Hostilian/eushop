$PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
Set-Location $PSScriptRoot

$pythonPath = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"
if (-not (Test-Path $pythonPath)) {
    Write-Error "Virtual environment python not found at $pythonPath"
    Exit 1
}

$scriptPath = Join-Path $PSScriptRoot "scripts\chat_agent.py"
& $pythonPath $scriptPath $args
