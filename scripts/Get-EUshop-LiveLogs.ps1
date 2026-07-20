<#
.SYNOPSIS
    EUshop Autonomous Live Activity & Log Streamer.

.DESCRIPTION
    Streams real-time execution logs from Hermes, the task journal, and git activity.
#>

param(
    [int]$TailLines = 15
)

$baseDir = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
$repoRoot = [System.IO.Path]::GetFullPath("$baseDir\..")

$journalPath = "$repoRoot\.hermes\version-44-journal.md"
$taskLogsDir = "C:\Users\Hostilian\.gemini\antigravity-ide\brain\d055af53-bc9f-4d2d-af35-369060204d76\.system_generated\tasks"

$latestTaskLog = Get-ChildItem -Path $taskLogsDir -Filter "*.log" -ErrorAction SilentlyContinue |
    Sort-Object CreationTime -Descending |
    Select-Object -First 1

Clear-Host
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host "  EUshop Real-Time Live Activity & Log Streamer" -ForegroundColor Yellow
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "--- RECENT COMPLETED TASK JOURNAL (Last $TailLines lines) ---" -ForegroundColor Cyan
if (Test-Path $journalPath) {
    Get-Content $journalPath -Tail $TailLines | ForEach-Object { Write-Host "  $_" -ForegroundColor Green }
} else {
    Write-Host "  (No journal entries logged yet)" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "--- RECENT GIT COMMITS ---" -ForegroundColor Cyan
Push-Location $repoRoot
try {
    git log -n 5 --oneline | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "--- LIVE LAUNCHER & AGENT PROCESS LOG ---" -ForegroundColor Cyan
if ($latestTaskLog) {
    Write-Host "Streaming from: $($latestTaskLog.Name) (Press Ctrl+C to stop)" -ForegroundColor DarkGray
    Write-Host "-------------------------------------------------------------------------`n" -ForegroundColor DarkGray
    Get-Content $latestTaskLog.FullName -Wait -Tail $TailLines
} else {
    Write-Host "  No active process log file found." -ForegroundColor Red
}
