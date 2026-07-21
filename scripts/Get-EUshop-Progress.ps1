<#
.SYNOPSIS
    EUshop Autonomous Master Task Progress & Phase Relationship Analyzer.

.DESCRIPTION
    Analyzes .hermes/yc-optimization-queue.md to display:
    - Overall completion percentage & visual progress bar
    - Phase-by-phase breakdown & status
    - Dependency mapping between phases
    - Estimated Time to Completion (ETA)
    - Auto-refreshes every 20 seconds in Watch mode
#>

[CmdletBinding()]
param(
    [string]$QueuePath = "",
    [int]$AvgMinutesPerTask = 10,
    [int]$RefreshSeconds = 20,
    [switch]$Once
)

# Robust Queue Path Resolution
if ([string]::IsNullOrWhiteSpace($QueuePath)) {
    $baseDir = if ($PSScriptRoot) { $PSScriptRoot } else { (Get-Location).Path }
    if (Test-Path "$baseDir\.hermes\yc-optimization-queue.md") {
        $QueuePath = "$baseDir\.hermes\yc-optimization-queue.md"
    } elseif (Test-Path "$baseDir\..\.hermes\yc-optimization-queue.md") {
        $QueuePath = "$baseDir\..\.hermes\yc-optimization-queue.md"
    } else {
        $QueuePath = ".\.hermes\yc-optimization-queue.md"
    }
}

$resolvedPath = [System.IO.Path]::GetFullPath($QueuePath)

if (-not (Test-Path -LiteralPath $resolvedPath)) {
    Write-Host "[ERR ] Task queue file not found at: $resolvedPath" -ForegroundColor Red
    exit 1
}

do {
    $lines = Get-Content -LiteralPath $resolvedPath -ErrorAction SilentlyContinue

    $completed = 0
    $inProgress = 0
    $pending = 0
    $failed = 0

    $phases = @()
    $currentPhase = $null
    $dependencySection = $false
    $dependencies = @()

    foreach ($line in $lines) {
        if ($line -match '^##\s+(PHASE\s+\d+.*)$') {
            if ($currentPhase) { $phases += $currentPhase }
            $currentPhase = [PSCustomObject]@{
                Name = $Matches[1].Trim()
                Status = "READY"
                Total = 0
                Done = 0
                InProgress = 0
            }
        } elseif ($line -match '^Status:\s*(.+)$' -and $currentPhase) {
            $currentPhase.Status = $Matches[1].Trim()
        } elseif ($line -match '^\s*-\s*\[([x/! ])\]\s*(TASK\s+\d+.*)$') {
            $mark = $Matches[1]
            if ($currentPhase) { $currentPhase.Total++ }

            switch ($mark) {
                'x' { $completed++;  if ($currentPhase) { $currentPhase.Done++ } }
                '/' { $inProgress++; if ($currentPhase) { $currentPhase.InProgress++ } }
                '!' { $failed++; }
                ' ' { $pending++; }
            }
        } elseif ($line -match '^##\s+DEPENDENCY MAP') {
            $dependencySection = $true
        } elseif ($dependencySection -and $line -match '^\s*-\s*(PHASE\s+.*)$') {
            $dependencies += $Matches[1].Trim()
        }
    }
    if ($currentPhase) { $phases += $currentPhase }

    $totalTasks = $completed + $inProgress + $pending + $failed
    $percent = if ($totalTasks -gt 0) { [math]::Round(($completed / $totalTasks) * 100, 1) } else { 0 }

    # Progress Bar
    $barWidth = 30
    $filledWidth = [math]::Round(($percent / 100) * $barWidth)
    $emptyWidth = $barWidth - $filledWidth
    $progressBar = ("=" * $filledWidth) + ("-" * $emptyWidth)

    # ETA Calculation
    $remainingTasks = $inProgress + $pending + $failed
    $totalEstMinutes = $remainingTasks * $AvgMinutesPerTask
    $etaHours = [math]::Floor($totalEstMinutes / 60)
    $etaMins = $totalEstMinutes % 60

    $nowStr = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")

    Clear-Host
    Write-Host ""
    Write-Host "=========================================================================" -ForegroundColor Cyan
    Write-Host "  EUshop Master Optimization Task Progress & Dependency Map" -ForegroundColor Yellow
    Write-Host "  Last Updated: $nowStr  (Auto-refreshing every ${RefreshSeconds}s)" -ForegroundColor DarkGray
    Write-Host "=========================================================================" -ForegroundColor Cyan
    Write-Host ""

    # Overall Summary Card
    Write-Host "  Progress Bar       : [" -NoNewline
    Write-Host $progressBar -ForegroundColor Green -NoNewline
    Write-Host "] " -NoNewline
    Write-Host "$percent%" -ForegroundColor Yellow

    Write-Host "  Completed Tasks    : " -NoNewline
    Write-Host "$completed / $totalTasks" -ForegroundColor Green

    Write-Host "  In Progress        : " -NoNewline
    Write-Host "$inProgress" -ForegroundColor Cyan

    Write-Host "  Pending / Remaining: " -NoNewline
    Write-Host "$remainingTasks" -ForegroundColor Gray

    if ($failed -gt 0) {
        Write-Host "  Blocked / Failed   : " -NoNewline
        Write-Host "$failed" -ForegroundColor Red
    }

    Write-Host "  Estimated Time     : " -NoNewline
    Write-Host "~$etaHours hrs $etaMins mins" -ForegroundColor DarkCyan -NoNewline
    Write-Host " (assuming ~${AvgMinutesPerTask}m per task)" -ForegroundColor DarkGray
    Write-Host ""

    # Phase Breakdown Table
    Write-Host "  -----------------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "  Phase Breakdown:" -ForegroundColor Cyan
    Write-Host "  -----------------------------------------------------------------------" -ForegroundColor DarkGray

    foreach ($p in $phases) {
        $pPercent = if ($p.Total -gt 0) { [math]::Round(($p.Done / $p.Total) * 100) } else { 0 }
        $statusColor = switch ($p.Status) {
            "COMPLETED" { "Green" }
            "IN_PROGRESS" { "Yellow" }
            default { "DarkGray" }
        }

        $nameCol = $p.Name.PadRight(45)
        $ratioCol = "$($p.Done)/$($p.Total)".PadLeft(5)

        Write-Host "  $nameCol" -NoNewline
        Write-Host " [$ratioCol] " -NoNewline -ForegroundColor Gray
        Write-Host "$($pPercent.ToString().PadLeft(3))%" -NoNewline -ForegroundColor Yellow
        Write-Host "  $($p.Status)" -ForegroundColor $statusColor
    }

    Write-Host ""
    Write-Host "  -----------------------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "  Phase Dependency Relationships:" -ForegroundColor Cyan
    Write-Host "  -----------------------------------------------------------------------" -ForegroundColor DarkGray

    if ($dependencies.Count -gt 0) {
        foreach ($dep in $dependencies) {
            Write-Host "  * $dep" -ForegroundColor Gray
        }
    } else {
        Write-Host "  * No explicit phase dependencies." -ForegroundColor DarkGray
    }

    Write-Host ""
    Write-Host "  Press Ctrl+C to exit auto-refresh watch mode." -ForegroundColor DarkGray
    Write-Host "  To run live session: .\Start-EUshop-Hermes.ps1 -Resume" -ForegroundColor DarkCyan
    Write-Host "=========================================================================" -ForegroundColor Cyan
    Write-Host ""

    if (-not $Once) {
        Start-Sleep -Seconds $RefreshSeconds
    }
} while (-not $Once)

