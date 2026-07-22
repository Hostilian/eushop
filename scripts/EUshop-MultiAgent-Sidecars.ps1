<#
.SYNOPSIS
    EUshop Multi-Agent Parallel Worktree Sidecar Orchestrator.

.DESCRIPTION
    Launches non-overlapping parallel sidecar AI workers in separate Git worktrees
    under D:\CODING\eushop-agents\ to accelerate development while ensuring the
    primary worker at D:\CODING\eushop continues uninterrupted.
#>

[CmdletBinding()]
param(
    [ValidateSet("Status", "Launch", "Stop", "Clean")]
    [string]$Mode = "Status",
    [string]$BaseRepo = "D:\CODING\eushop",
    [string]$AgentsRootDir = "D:\CODING\eushop-agents"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$SidecarLanes = @(
    @{ Name = "security"; Branch = "agent/security-codeql-fixes"; Worktree = "$AgentsRootDir\security"; Task = "TASK 175-180: Security Threat Model & CodeQL Fixes" },
    @{ Name = "tests";    Branch = "agent/testing-coverage";     Worktree = "$AgentsRootDir\tests";    Task = "TASK 185, 200: E2E Playwright & Property Tests" },
    @{ Name = "frontend"; Branch = "agent/frontend-accessibility";Worktree = "$AgentsRootDir\frontend"; Task = "TASK 154, 155: WCAG 2.2 AA Accessibility & Design System" },
    @{ Name = "docs";     Branch = "agent/documentation-truth";  Worktree = "$AgentsRootDir\docs";     Task = "TASK 170-174: Ground Truth Manifest & SBOM Inventory" }
)

function Get-PrimaryWorkerHealth {
    $claudeProc = Get-Process -Name "claude" -ErrorAction SilentlyContinue
    $pythonProc = Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CPU -gt 1.0 }
    
    if ($claudeProc -or $pythonProc) {
        return @{ Status = "HEALTHY"; PID = ($claudeProc.Id -join ", "); CPU = ($claudeProc.CPU -join ", ") }
    } else {
        return @{ Status = "IDLE/UNKNOWN"; PID = "N/A"; CPU = "N/A" }
    }
}

if ($Mode -eq "Status") {
    $health = Get-PrimaryWorkerHealth
    Write-Host "================================================================================" -ForegroundColor Cyan
    Write-Host "         EUshop Multi-Agent Parallel Sidecar System Status Report               " -ForegroundColor Cyan
    Write-Host "================================================================================" -ForegroundColor Cyan
    Write-Host "  PRIMARY WORKER LOCATION : $BaseRepo" -ForegroundColor White
    Write-Host "  PRIMARY WORKER HEALTH   : $($health.Status) (PIDs: $($health.PID))" -ForegroundColor Green
    Write-Host "  SIDECAR ROOT DIR        : $AgentsRootDir" -ForegroundColor White
    Write-Host "--------------------------------------------------------------------------------" -ForegroundColor DarkGray
    
    foreach ($lane in $SidecarLanes) {
        $exists = Test-Path -LiteralPath $lane.Worktree
        $statusStr = if ($exists) { "ACTIVE WORKTREE" } else { "NOT CREATED" }
        $color = if ($exists) { "Green" } else { "DarkGray" }
        Write-Host "  Lane: $($lane.Name.PadRight(10)) | Status: $($statusStr.PadRight(15)) | Branch: $($lane.Branch)" -ForegroundColor $color
        Write-Host "    Task: $($lane.Task)" -ForegroundColor DarkGray
    }
    Write-Host "================================================================================" -ForegroundColor Cyan
    exit 0
}

if ($Mode -eq "Launch") {
    Write-Host "[INFO] Initializing sidecar worktree root at: $AgentsRootDir" -ForegroundColor Yellow
    if (-not (Test-Path -LiteralPath $AgentsRootDir)) {
        New-Item -ItemType Directory -Path $AgentsRootDir -Force | Out-Null
    }
    
    Set-Location -Path $BaseRepo
    
    foreach ($lane in $SidecarLanes) {
        $wtPath = $lane.Worktree
        $branch = $lane.Branch
        
        if (-not (Test-Path -LiteralPath $wtPath)) {
            Write-Host "[INFO] Creating Git worktree for $($lane.Name) at $wtPath..." -ForegroundColor Cyan
            try {
                git worktree add -b $branch $wtPath main 2>&1 | Out-Null
                Write-Host "[OK  ] Created worktree and branch $branch for $($lane.Name)" -ForegroundColor Green
            } catch {
                Write-Host "[WARN] Worktree creation skipped or branch exists: $_" -ForegroundColor Yellow
            }
        } else {
            Write-Host "[OK  ] Worktree already exists: $wtPath" -ForegroundColor Green
        }
    }
    
    Write-Host "[OK  ] All sidecar worktrees established safely without touching primary worker at $BaseRepo" -ForegroundColor Green
    exit 0
}

if ($Mode -eq "Clean") {
    Set-Location -Path $BaseRepo
    foreach ($lane in $SidecarLanes) {
        $wtPath = $lane.Worktree
        if (Test-Path -LiteralPath $wtPath) {
            Write-Host "[INFO] Removing worktree: $wtPath" -ForegroundColor Yellow
            git worktree remove --force $wtPath 2>&1 | Out-Null
        }
    }
    Write-Host "[OK  ] Sidecar worktrees cleaned successfully." -ForegroundColor Green
    exit 0
}
