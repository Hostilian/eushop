# EUshop Real-Time Progress Reporter
# Displays task completion percentage, visual progress bar, active task, PID health, and branch state.

[CmdletBinding()]
param(
    [string]$ProjectPath = "D:\CODING\eushop",
    [switch]$Watch
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "SilentlyContinue"

function Get-EUshopProgress {
    $QueueFile = Join-Path $ProjectPath ".hermes\version-44-queue.md"
    $LockFile  = Join-Path $ProjectPath ".claude\AGENT_FAILOVER.lock"
    $WdLock    = Join-Path $ProjectPath ".agent-state\watchdog.pid"
    $LogDir    = Join-Path $ProjectPath ".claude\agent-failover-logs-v3"

    $TotalTasks = 23
    $CompletedTasks = 0
    $TaskDetails = @()

    if (Test-Path $QueueFile) {
        $Lines = Get-Content $QueueFile -Encoding UTF8
        foreach ($line in $Lines) {
            if ($line -match '- \[x\] TASK (\d+)') {
                $tId = [int]$Matches[1]
                $CompletedTasks++
                $TaskDetails += [PSCustomObject]@{ Id = $tId; Line = $line; Status = "DONE" }
            } elseif ($line -match '- \[/\] TASK (\d+)') {
                $tId = [int]$Matches[1]
                $TaskDetails += [PSCustomObject]@{ Id = $tId; Line = $line; Status = "IN_PROGRESS" }
            } elseif ($line -match '- \[ \] TASK (\d+)') {
                $tId = [int]$Matches[1]
                $TaskDetails += [PSCustomObject]@{ Id = $tId; Line = $line; Status = "QUEUED" }
            }
        }
    }

    $GitBranch = (git -C $ProjectPath branch --show-current 2>$null).Trim()
    $GitCommit = (git -C $ProjectPath rev-parse --short HEAD 2>$null).Trim()

    $Percentage = [math]::Round(($CompletedTasks / $TotalTasks) * 100, 1)
    $FilledBlocks = [math]::Round(($CompletedTasks / $TotalTasks) * 25)
    $EmptyBlocks  = 25 - $FilledBlocks
    $ProgressBar  = ("#" * $FilledBlocks) + ("-" * $EmptyBlocks)

    Write-Host ""
    Write-Host "================================================================================" -ForegroundColor Cyan
    Write-Host "            EUshop Autonomous Mission - Real-Time Progress Dashboard           " -ForegroundColor Yellow
    Write-Host "================================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  PROGRESS: " -NoNewline
    Write-Host "[$ProgressBar] " -ForegroundColor Green -NoNewline
    Write-Host "$Percentage% " -ForegroundColor Yellow -NoNewline
    Write-Host "($CompletedTasks / $TotalTasks Tasks Completed)" -ForegroundColor White
    Write-Host ""

    $OrchPid  = if (Test-Path $LockFile) { Get-Content $LockFile -Raw } else { $null }
    $OrchProc = if ($OrchPid) { Get-Process -Id ([int]$OrchPid) -ErrorAction SilentlyContinue } else { $null }
    $OrchStatus = if ($OrchProc) { "RUNNING (PID $OrchPid)" } else { "STOPPED" }
    $OrchColor  = if ($OrchProc) { "Green" } else { "Red" }

    $WdPid  = if (Test-Path $WdLock) { Get-Content $WdLock -Raw } else { $null }
    $WdProc = if ($WdPid) { Get-Process -Id ([int]$WdPid) -ErrorAction SilentlyContinue } else { $null }
    $WdStatus = if ($WdProc) { "RUNNING (PID $WdPid)" } else { "STOPPED" }
    $WdColor  = if ($WdProc) { "Green" } else { "Red" }

    $Agents   = Get-Process -Name "claude","codex","hermes","fcc" -ErrorAction SilentlyContinue
    $AgentStr = if ($Agents) { ($Agents | ForEach-Object { "$($_.Name)[$($_.Id)]" }) -join ", " } else { "none" }

    Write-Host "SYSTEM HEALTH:" -ForegroundColor Cyan
    Write-Host "  * Orchestrator Runner : " -NoNewline; Write-Host $OrchStatus -ForegroundColor $OrchColor
    Write-Host "  * Self-Healing Watchdog: " -NoNewline; Write-Host $WdStatus -ForegroundColor $WdColor
    Write-Host "  * Active AI Agent      : " -NoNewline; Write-Host $AgentStr -ForegroundColor White
    Write-Host "  * Current Git Branch   : " -NoNewline; Write-Host "$GitBranch ($GitCommit)" -ForegroundColor Yellow
    Write-Host ""

    Write-Host "TASK BREAKDOWN ($CompletedTasks/$TotalTasks):" -ForegroundColor Cyan
    foreach ($item in ($TaskDetails | Sort-Object Id)) {
        $numStr = "{0,2}" -f $item.Id
        $title = $item.Line -replace '^\s*-\s*\[.\]\s*', ''
        if ($item.Status -eq "DONE") {
            Write-Host "  [X] Task $numStr : $title" -ForegroundColor Green
        } elseif ($item.Status -eq "IN_PROGRESS") {
            Write-Host "  [/] Task $numStr : $title (ACTIVE)" -ForegroundColor Yellow
        } else {
            Write-Host "  [ ] Task $numStr : $title" -ForegroundColor Gray
        }
    }

    $LatestLog = Get-ChildItem $LogDir -File 2>$null | Sort-Object LastWriteTime -Descending | Select-Object -First 1
    if ($LatestLog) {
        Write-Host ""
        Write-Host "AGENT LOG TAIL ($($LatestLog.Name)):" -ForegroundColor Cyan
        Get-Content $LatestLog.FullName -Tail 5 | ForEach-Object {
            Write-Host "  | $_" -ForegroundColor Gray
        }
    }

    Write-Host ""
    Write-Host "================================================================================" -ForegroundColor Cyan
}

if ($Watch) {
    while ($true) {
        Clear-Host
        Get-EUshopProgress
        Write-Host "Auto-refreshing every 5s... Press Ctrl+C to exit." -ForegroundColor DarkGray
        Start-Sleep -Seconds 5
    }
} else {
    Get-EUshopProgress
}
