[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [ValidateSet("Mission", "Override", "Status", "Show")]
    [string]$Mode = "Mission",

    [Parameter(Position = 1)]
    [string]$Goal,

    [string[]]$SuccessCriteria = @(),

    [string]$Branch = "version-44",

    [switch]$RunNow
)

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
$ErrorActionPreference = "Stop"

$Repo = "D:\CODING\eushop"
$ClaudeDir = Join-Path $Repo ".claude"
$PromptPath = Join-Path $ClaudeDir "ORCHESTRATOR_PROMPT.md"
$RecoveryPath = Join-Path $ClaudeDir "RECOVERY_STATE.md"
$BackupDir = Join-Path $ClaudeDir "mission-backups"
$OrchestratorPath = Join-Path $Repo "scripts\EUshop-Agent-Orchestrator.ps1"
$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$Now = Get-Date -Format "yyyy-MM-ddTHH:mm:ssK"

function Assert-EUshopRepository {
    if (-not (Test-Path -LiteralPath $Repo -PathType Container)) {
        throw "Repository directory not found: $Repo"
    }

    if (-not (Test-Path -LiteralPath (Join-Path $Repo ".git"))) {
        throw "Not a Git repository: $Repo"
    }

    New-Item -ItemType Directory -Path $ClaudeDir -Force | Out-Null
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    Set-Location -LiteralPath $Repo
}

function Backup-AgentFile {
    param(
        [Parameter(Mandatory)]
        [string]$Path
    )

    if (Test-Path -LiteralPath $Path) {
        $Name = [System.IO.Path]::GetFileNameWithoutExtension($Path)
        $Extension = [System.IO.Path]::GetExtension($Path)
        $Destination = Join-Path $BackupDir "$Name-$Stamp$Extension"
        Copy-Item -LiteralPath $Path -Destination $Destination -Force
        Write-Host "[BACKUP] $Destination" -ForegroundColor DarkYellow
    }
}

function Format-Bullets {
    param([string[]]$Items)

    if (-not $Items -or $Items.Count -eq 0) {
        return "- Complete the requested goal fully and verify the resulting user journey."
    }

    return (($Items | ForEach-Object { "- $_" }) -join [Environment]::NewLine)
}

function Set-LiveGoal {
    param(
        [Parameter(Mandatory)]
        [string]$GoalText,

        [Parameter(Mandatory)]
        [string]$TargetBranch,

        [string[]]$Criteria
    )

    if (-not (Test-Path -LiteralPath $PromptPath)) {
        throw "Base mission file not found: $PromptPath"
    }

    Backup-AgentFile -Path $PromptPath

    $ExistingPrompt = Get-Content -LiteralPath $PromptPath -Raw

    # Remove the previous managed live-goal block while preserving the base mission.
    $Pattern = '(?s)<!-- BEGIN LIVE USER GOAL -->.*?<!-- END LIVE USER GOAL -->\s*'
    $BasePrompt = [regex]::Replace($ExistingPrompt, $Pattern, "").TrimStart()

    $CriteriaText = Format-Bullets -Items $Criteria

    $LiveBlock = @"
<!-- BEGIN LIVE USER GOAL -->
# LIVE USER GOAL — $Now

This block overrides lower-priority unfinished work but does not override safety,
secret protection, preservation of existing work, truthful reporting, or the
prohibition on force-pushing and irreversible production actions.

## Goal

$GoalText

## Target branch

Work on ``$TargetBranch`` or a safe child branch. Preserve all existing
uncommitted work. Do not merge into ``main``.

## Success criteria

$CriteriaText

## Autonomous execution loop

Continue in small recoverable work units:

1. Read the repository rules and current recovery state.
2. Inspect the exact current implementation before editing.
3. Select the highest-impact unblocked task supporting this goal.
4. Implement it directly.
5. Run the narrowest relevant lint, type, build, or test command.
6. Repair errors introduced by the change before adding unrelated work.
7. Inspect the diff and run ``git diff --check``.
8. Update ``.claude/RECOVERY_STATE.md`` and the ``.hermes`` checkpoint files.
9. Commit stable, focused progress on a non-main branch.
10. Continue with the next READY task without asking for routine approval.

When a provider or tool fails:

- classify and record the failure;
- use bounded retries only;
- open a circuit breaker for repeated failures;
- switch to the next authorized provider or local deterministic workflow;
- continue independent tasks;
- never wait forever or repeat the same failed operation indefinitely.

Before any unavoidable stop, leave valid source code, preserve commits, update
all recovery files, and write exact continuation steps.

<!-- END LIVE USER GOAL -->

"@

    Set-Content -LiteralPath $PromptPath -Value ($LiveBlock + $BasePrompt) -Encoding UTF8
    Write-Host "[OK] Persistent live goal updated:" -ForegroundColor Green
    Write-Host "     $PromptPath"
}

function Add-UrgentOverride {
    param(
        [Parameter(Mandatory)]
        [string]$GoalText,

        [Parameter(Mandatory)]
        [string]$TargetBranch,

        [string[]]$Criteria
    )

    Backup-AgentFile -Path $RecoveryPath

    $ExistingRecovery = ""
    if (Test-Path -LiteralPath $RecoveryPath) {
        $ExistingRecovery = Get-Content -LiteralPath $RecoveryPath -Raw
    }

    $CriteriaText = Format-Bullets -Items $Criteria

    $Override = @"
## URGENT USER OVERRIDE — $Now

Pause lower-priority work at the next safe checkpoint and prioritize this goal:

$GoalText

Target branch: ``$TargetBranch`` or a safe child branch. Keep ``main`` untouched.

Completion checks:

$CriteriaText

Execution rules:

- Preserve all existing changes and stable commits.
- Implement directly; do not return only a plan.
- Use small validated work units and update recovery state after each unit.
- Do not loop endlessly on failed providers or commands.
- Continue independent local work when an integration is unavailable.
- Before ending, leave exact continuation steps and the next three executable tasks.

---

"@

    Set-Content -LiteralPath $RecoveryPath -Value ($Override + $ExistingRecovery) -Encoding UTF8
    Write-Host "[OK] Urgent override added:" -ForegroundColor Green
    Write-Host "     $RecoveryPath"
}

function Invoke-FccNow {
    param(
        [Parameter(Mandatory)]
        [string]$GoalText,

        [Parameter(Mandatory)]
        [string]$TargetBranch,

        [string[]]$Criteria
    )

    $Fcc = Get-Command "fcc-work" -ErrorAction SilentlyContinue | Select-Object -First 1
    if (-not $Fcc) {
        Write-Warning "fcc-work is not available in this PowerShell session."
        return
    }

    $CriteriaText = Format-Bullets -Items $Criteria

    $Instruction = @"
Work inside D:\CODING\eushop.

Read these sources of truth before editing:

- .claude/ORCHESTRATOR_PROMPT.md
- .claude/RECOVERY_STATE.md
- .hermes/version-44-state.json
- .hermes/version-44-queue.md
- .hermes/version-44-journal.md
- .hermes/version-44-failures.md

Immediate goal:

$GoalText

Target branch: $TargetBranch or a safe child branch. Keep main untouched.

Success criteria:

$CriteriaText

Execute directly. Work in small validated units. Preserve all existing work.
Use bounded retries and provider failover. When remote AI is unavailable,
continue with local tools, compiler output, tests, repository search, and
deterministic implementation. Update recovery files and commit stable progress.
Do not return only a plan.
"@

    Write-Host "[START] Sending the current goal to fcc-work..." -ForegroundColor Cyan
    $Instruction | & $Fcc.Name
}

Assert-EUshopRepository

switch ($Mode) {
    "Status" {
        if (Test-Path -LiteralPath $OrchestratorPath) {
            & $OrchestratorPath -Mode Status
        }
        else {
            throw "Orchestrator script not found: $OrchestratorPath"
        }
        exit
    }

    "Show" {
        Write-Host "`n=== Active prompt header ===" -ForegroundColor Cyan
        if (Test-Path -LiteralPath $PromptPath) {
            Get-Content -LiteralPath $PromptPath -TotalCount 90
        }

        Write-Host "`n=== Latest recovery state ===" -ForegroundColor Cyan
        if (Test-Path -LiteralPath $RecoveryPath) {
            Get-Content -LiteralPath $RecoveryPath -Tail 100
        }

        Write-Host "`n=== Git state ===" -ForegroundColor Cyan
        & git status --short
        & git branch --show-current
        & git log --oneline --decorate -8
        exit
    }

    "Mission" {
        if ([string]::IsNullOrWhiteSpace($Goal)) {
            throw "Provide -Goal for Mission mode."
        }

        Set-LiveGoal -GoalText $Goal -TargetBranch $Branch -Criteria $SuccessCriteria
    }

    "Override" {
        if ([string]::IsNullOrWhiteSpace($Goal)) {
            throw "Provide -Goal for Override mode."
        }

        Set-LiveGoal -GoalText $Goal -TargetBranch $Branch -Criteria $SuccessCriteria
        Add-UrgentOverride -GoalText $Goal -TargetBranch $Branch -Criteria $SuccessCriteria
    }
}

if ($RunNow) {
    Invoke-FccNow -GoalText $Goal -TargetBranch $Branch -Criteria $SuccessCriteria
}
else {
    Write-Host ""
    Write-Host "The active orchestrator will read this goal on its next invocation." -ForegroundColor Cyan
    Write-Host "Use -RunNow to also send it immediately to fcc-work."
}
