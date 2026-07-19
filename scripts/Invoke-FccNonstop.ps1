[CmdletBinding()]
param(
    [string]$ProjectPath = "D:\CODING\eushop",
    [int]$MaximumBackoffSeconds = 900
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Continue"

function Write-RunnerLog {
    param(
        [string]$Message,
        [ValidateSet("INFO", "WARN", "ERROR", "SUCCESS")]
        [string]$Level = "INFO"
    )

    $Now = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $Line = "[$Now][$Level] $Message"

    Add-Content -LiteralPath $script:RunnerLogPath -Value $Line

    switch ($Level) {
        "WARN"    { Write-Host $Line -ForegroundColor Yellow }
        "ERROR"   { Write-Host $Line -ForegroundColor Red }
        "SUCCESS" { Write-Host $Line -ForegroundColor Green }
        default   { Write-Host $Line }
    }
}

function Get-BackoffSeconds {
    param(
        [int]$FailureNumber,
        [int]$MaximumSeconds
    )

    $Exponent = [Math]::Min(
        [Math]::Max($FailureNumber - 1, 0),
        8
    )

    $Seconds = [int](30 * [Math]::Pow(2, $Exponent))
    return [Math]::Min($Seconds, $MaximumSeconds)
}

function Test-ProcessAlive {
    param([int]$ProcessId)

    if ($ProcessId -le 0) {
        return $false
    }

    return $null -ne (
        Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
    )
}

if (-not (Test-Path -LiteralPath $ProjectPath -PathType Container)) {
    throw "Project path does not exist: $ProjectPath"
}

Set-Location -LiteralPath $ProjectPath

$ClaudeDirectory = Join-Path $ProjectPath ".claude"
$LogDirectory = Join-Path $ClaudeDirectory "runner-logs"
$CompletePath = Join-Path $ClaudeDirectory "AUTONOMOUS_COMPLETE"
# AUTONOMOUS_STOP is intentionally NOT used as a hard stop in nonstop mode.
# The loop runs until Ctrl+C or the process is killed.
$LockPath = Join-Path $ClaudeDirectory "AUTONOMOUS_RUNNER.lock"

New-Item -ItemType Directory -Path $LogDirectory -Force | Out-Null

$script:RunnerLogPath = Join-Path $LogDirectory (
    "runner-stdin-" +
    (Get-Date -Format "yyyyMMdd-HHmmss") +
    ".log"
)

if (Test-Path -LiteralPath $LockPath) {
    $ExistingText = Get-Content `
        -LiteralPath $LockPath `
        -Raw `
        -ErrorAction SilentlyContinue

    $ExistingPid = 0

    if (
        $ExistingText -and
        [int]::TryParse(
            ($ExistingText -replace "\D", ""),
            [ref]$ExistingPid
        )
    ) {
        if (Test-ProcessAlive -ProcessId $ExistingPid) {
            throw "Another autonomous runner is active with PID $ExistingPid."
        }
    }

    Remove-Item `
        -LiteralPath $LockPath `
        -Force `
        -ErrorAction SilentlyContinue
}

Set-Content -LiteralPath $LockPath -Value $PID -NoNewline

# Repository files hold the durable mission and checkpoint.
# Keep this prompt compact so each invocation spends context on actual work.
$ResumePrompt = @"
Resume the EUshop recovery, historical-version catalogue, navigation, and unified-integration mission autonomously.

Mandatory startup:
1. Read CLAUDE.md.
2. Read .claude/AUTONOMY.md.
3. Read .claude/RECOVERY_STATE.md.
4. Inspect Git status, branch, HEAD, recent commits, worktrees, recovery folders, and existing artifacts.
5. Resume the exact first unfinished checkpoint. Do not recreate verified backups or repeat completed work.

Operate continuously with graceful degradation:
- Do not ask for routine approval or ask the user what to do next.
- When one command, test, dependency, tool, network request, or method fails, record it in .claude/RECOVERY_STATE.md, choose a fallback, and continue independent work.
- Use simple shell commands and one fixed recovery-directory path.
- Preserve completed work and update the checkpoint frequently.
- Keep main untouched.
- Never force-push, deploy, expose secrets, spend money, delete history, or alter external accounts.
- Create .claude/AUTONOMOUS_COMPLETE only after every mission acceptance criterion is actually satisfied.
- If .claude/AUTONOMOUS_STOP exists, checkpoint and stop cleanly.

Before this invocation ends, update .claude/RECOVERY_STATE.md with completed work, failures, fallbacks, and the exact next action.
"@

$InvocationNumber = 0
$ConsecutiveFailures = 0

try {
    Write-RunnerLog "STDIN-based autonomous watchdog started."
    Write-RunnerLog "fcc-work arguments are intentionally avoided because its CMD wrapper discards them."
    Write-RunnerLog "Press Ctrl+C or kill the process to stop (nonstop mode - stop marker is ignored)."

    while ($true) {
        # Nonstop mode: do not break on AUTONOMOUS_STOP or AUTONOMOUS_COMPLETE.
        # The loop only exits on Ctrl+C or explicit process kill.
        if (Test-Path -LiteralPath $CompletePath) {
            Write-RunnerLog "Completion marker found; mission may be done, but continuing to loop per nonstop policy." "SUCCESS"
        }

        $InvocationNumber++

        $InvocationLog = Join-Path $LogDirectory (
            "stdin-invocation-{0:D5}-{1}.log" -f `
                $InvocationNumber,
                (Get-Date -Format "yyyyMMdd-HHmmss")
        )

        if (-not (Get-Command fcc-work -ErrorAction SilentlyContinue)) {
            $ConsecutiveFailures++
            $Delay = Get-BackoffSeconds `
                -FailureNumber $ConsecutiveFailures `
                -MaximumSeconds $MaximumBackoffSeconds

            Write-RunnerLog `
                "fcc-work is unavailable. Retrying in $Delay seconds." `
                "ERROR"

            Start-Sleep -Seconds $Delay
            continue
        }

        Write-RunnerLog "Starting FCC invocation $InvocationNumber through stdin."

        $Output = @()
        $ExitCode = 1

        try {
            # Critical compatibility behavior:
            # fcc-work.cmd ignores command-line arguments, but redirected stdin
            # reaches Start-FCC-Work.ps1 and supplies Claude's print-mode prompt.
            $Output = $ResumePrompt |
                & fcc-work 2>&1 |
                Tee-Object -FilePath $InvocationLog

            if ($null -eq $LASTEXITCODE) {
                $ExitCode = 0
            }
            else {
                $ExitCode = $LASTEXITCODE
            }
        }
        catch {
            $ExceptionText = $_ | Out-String
            $Output += $ExceptionText
            Add-Content -LiteralPath $InvocationLog -Value $ExceptionText
            $ExitCode = 1
        }

        $Text = $Output | Out-String

        $RateLimited = $Text -match `
            "(?i)(HTTP\s*429|Too Many Requests|rate[_ -]?limit|provider rate limit)"

        $TemporaryFailure = $Text -match `
            "(?i)(timeout|temporar|service unavailable|HTTP\s*5\d\d|ECONN|ETIMEDOUT|connection reset|connection refused)"

        $AuthenticationFailure = $Text -match `
            "(?i)(HTTP\s*401|unauthorized|invalid api key|authentication failed)"

        $InputFailure = $Text -match `
            "(?i)Input must be provided either through stdin or as a prompt argument"

        if (Test-Path -LiteralPath $CompletePath) {
            Write-RunnerLog "Claude created the completion marker; looping for next invocation." "SUCCESS"
        }

        if ($InputFailure) {
            Write-RunnerLog `
                "stdin not received by FCC launcher (see $InvocationLog); will retry after backoff." `
                "WARN"
            # Do NOT break — graceful degradation keeps retrying.
        }

        if ($RateLimited) {
            $ConsecutiveFailures++
            Write-RunnerLog `
                "Provider rate limit detected; repository state is preserved." `
                "WARN"
        }
        elseif ($TemporaryFailure) {
            $ConsecutiveFailures++
            Write-RunnerLog "Temporary provider or network failure detected." "WARN"
        }
        elseif ($AuthenticationFailure) {
            $ConsecutiveFailures++
            Write-RunnerLog `
                "FCC authentication failed. Retrying without switching providers." `
                "ERROR"
        }
        elseif ($ExitCode -ne 0) {
            $ConsecutiveFailures++
            Write-RunnerLog `
                "FCC exited with code $ExitCode. See $InvocationLog" `
                "ERROR"
        }
        else {
            $ConsecutiveFailures = 0
            Write-RunnerLog `
                "Invocation $InvocationNumber ended normally; continuing from checkpoint."
        }

        if ($ConsecutiveFailures -gt 0) {
            $Delay = Get-BackoffSeconds `
                -FailureNumber $ConsecutiveFailures `
                -MaximumSeconds $MaximumBackoffSeconds

            Write-RunnerLog `
                "Retrying in $Delay seconds. Consecutive failures: $ConsecutiveFailures" `
                "WARN"

            Start-Sleep -Seconds $Delay
        }
        else {
            Start-Sleep -Seconds 5
        }
    }
}
finally {
    Remove-Item `
        -LiteralPath $LockPath `
        -Force `
        -ErrorAction SilentlyContinue

    Write-RunnerLog "STDIN-based autonomous watchdog stopped."
}