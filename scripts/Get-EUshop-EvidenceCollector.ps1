# EUshop Read-Only Evidence Collector
param (
    [string]$OutputFile = ".agent-state\evidence.json"
)

$commit = (git rev-parse HEAD).Trim()
$progressScript = "scripts\Get-EUshop-Progress.ps1"
$claudeProcs = Get-Process -Name claude -ErrorAction SilentlyContinue | Select-Object Id, CPU, WorkingSet

$evidence = @{
    Timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    GitCommit = $commit
    ClaudePIDs = ($claudeProcs | ForEach-Object { $_.Id })
    TotalTasks = 108
}

if (-not (Test-Path ".agent-state")) {
    New-Item -ItemType Directory -Path ".agent-state" -Force | Out-Null
}

$evidence | ConvertTo-Json -Depth 3 | Set-Content -Path $OutputFile
Write-Host "[EVIDENCE] Collected evidence to $OutputFile at $($evidence.Timestamp)"
