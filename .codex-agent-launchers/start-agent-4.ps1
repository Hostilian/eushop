Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned -Force

Set-Location -LiteralPath 'D:\CODING\eushop'

Clear-Host

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Codex Agent 4" -ForegroundColor Cyan
Write-Host "Project: D:\CODING\eushop" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path 'D:\CODING\eushop\.venv\Scripts\Activate.ps1') {
    Write-Host "Activating Python virtual environment..." -ForegroundColor Yellow
    . 'D:\CODING\eushop\.venv\Scripts\Activate.ps1'
    Write-Host "Virtual environment activated." -ForegroundColor Green
    Write-Host ""
}

Write-Host "Starting Codex..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Example tasks you can type:" -ForegroundColor DarkYellow
Write-Host "  explain this project"
Write-Host "  find bugs in this app"
Write-Host "  fix the next error carefully"
Write-Host "  improve the frontend design"
Write-Host "  check why the server does not start"
Write-Host ""

codex
