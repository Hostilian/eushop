#requires -Version 5.1
<#
.SYNOPSIS
    EUshop YC-Optimization Mission Launcher

.DESCRIPTION
    Starts FCC (Claude Code via fcc-work) AND Hermes in parallel, both pointed
    at the YC-optimization task queue (.hermes/yc-optimization-queue.md).
    Handles authentication errors, provider fallback, crash restart with
    exponential backoff, and clean Ctrl+C shutdown.

    Run modes:
      FCC       - FCC only (Claude Code via fcc-work stdin loop)
      Hermes    - Hermes agent only
      Both      - FCC + Hermes in parallel (default)
      FixAuth   - Repair OpenRouter/FCC auth then launch Both
      Status    - Show current task progress and provider health
#>

[CmdletBinding()]
param(
    [ValidateSet("FCC", "Hermes", "Both", "FixAuth", "Status")]
    [string]$Mode = "Both",

    [string]$ProjectPath = "D:\CODING\eushop",
    [int]$FccPort = 8082,
    [int]$MaxBackoffSeconds = 900
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = "Continue"

$Timestamp  = Get-Date -Format "yyyyMMdd-HHmmss"
$FccHome    = Join-Path $HOME ".fcc"
$FccEnvPath = Join-Path $FccHome ".env"
$LogDir     = Join-Path $ProjectPath "logs\yc-mission"
$QueuePath  = Join-Path $ProjectPath ".hermes\yc-optimization-queue.md"
$JournalPath = Join-Path $ProjectPath ".hermes\version-44-journal.md"

$script:FccPid     = $null
$script:HermesPid  = $null
$script:Stop       = $false

# ──────────────────────────── helpers ────────────────────────────

function Write-Log {
    param(
        [string]$Msg,
        [ValidateSet("INFO","OK","WARN","ERROR","SECTION")]
        [string]$Level = "INFO"
    )
    $Now  = Get-Date -Format "HH:mm:ss"
    $Line = "[$Now][$Level] $Msg"
    $Color = switch ($Level) {
        "OK"      { "Green" }
        "WARN"    { "Yellow" }
        "ERROR"   { "Red" }
        "SECTION" { "Cyan" }
        default   { "White" }
    }
    Write-Host $Line -ForegroundColor $Color
    if ($LogDir -and (Test-Path $LogDir -ErrorAction SilentlyContinue)) {
        Add-Content -LiteralPath (Join-Path $LogDir "launcher-$Timestamp.log") -Value $Line -ErrorAction SilentlyContinue
    }
}

function Get-DotEnvValue {
    param([string]$Key)
    if (-not (Test-Path -LiteralPath $FccEnvPath)) { return "" }
    $line = (Get-Content $FccEnvPath | Where-Object { $_ -match "^\s*$([Regex]::Escape($Key))\s*=" } | Select-Object -First 1)
    if (-not $line) { return "" }
    return ($line -replace "^\s*$([Regex]::Escape($Key))\s*=", "").Trim().Trim('"').Trim("'")
}

function Set-DotEnvValue {
    param([string]$Key, [string]$Value)
    $pattern = "^\s*$([Regex]::Escape($Key))\s*="
    if (-not (Test-Path -LiteralPath $FccEnvPath)) {
        Add-Content $FccEnvPath "$Key=$Value"
        return
    }
    $lines = @(Get-Content $FccEnvPath)
    $found = $false
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -match $pattern) { $lines[$i] = "$Key=$Value"; $found = $true }
    }
    if (-not $found) { $lines += "$Key=$Value" }
    Set-Content -LiteralPath $FccEnvPath -Value $lines -Encoding UTF8
}

function Get-Backoff {
    param([int]$Failures, [int]$Max = $MaxBackoffSeconds)
    $secs = [int](30 * [Math]::Pow(2, [Math]::Min($Failures - 1, 8)))
    return [Math]::Min($secs, $Max)
}

function Test-ProcessAlive {
    param([int]$Id)
    return ($Id -gt 0) -and ($null -ne (Get-Process -Id $Id -ErrorAction SilentlyContinue))
}

# ──────────────────────────── auth repair ────────────────────────

function Repair-OpenRouterKey {
    $key = Get-DotEnvValue -Key "OPENROUTER_API_KEY"

    # Valid OpenRouter keys start with sk-or-v1-
    if ($key -match "^sk-or-v1-") {
        Write-Log "OpenRouter key looks valid." "OK"
        return $true
    }

    Write-Log "OpenRouter key is missing or malformed: '$key'" "WARN"
    Write-Log "Please get a free key at https://openrouter.ai/keys" "WARN"
    Write-Log "Then run: Set-DotEnvValue -Key OPENROUTER_API_KEY -Value sk-or-v1-YOUR_KEY" "WARN"

    # Try other configured providers as fallback
    $fallbacks = @(
        @{ Key = "GROQ_API_KEY";     Model = "groq/llama-3.3-70b-versatile" },
        @{ Key = "CEREBRAS_API_KEY"; Model = "cerebras/gpt-oss-120b" },
        @{ Key = "MISTRAL_API_KEY";  Model = "mistral/devstral-small-latest" },
        @{ Key = "GITHUB_MODELS_TOKEN"; Model = "github_models/openai/gpt-4.1" },
        @{ Key = "KIMI_API_KEY";     Model = "kimi/kimi-k2.5" }
    )

    foreach ($f in $fallbacks) {
        $v = Get-DotEnvValue -Key $f.Key
        if (-not [string]::IsNullOrWhiteSpace($v)) {
            Write-Log "Falling back to $($f.Key) -> $($f.Model)" "OK"
            foreach ($tier in @("MODEL","MODEL_OPUS","MODEL_SONNET","MODEL_HAIKU","MODEL_FABLE")) {
                Set-DotEnvValue -Key $tier -Value $f.Model
            }
            return $true
        }
    }

    Write-Log "No working provider found. FCC will not start." "ERROR"
    return $false
}

function Repair-FccBaseUrl {
    $url = Get-DotEnvValue -Key "ANTHROPIC_BASE_URL"
    $expected = "http://127.0.0.1:$FccPort"
    if ($url -ne $expected) {
        Write-Log "Fixing ANTHROPIC_BASE_URL: '$url' -> '$expected'" "WARN"
        Set-DotEnvValue -Key "ANTHROPIC_BASE_URL" -Value $expected
    }
}

# ──────────────────────────── queue status ───────────────────────

function Show-QueueStatus {
    Write-Log "=== YC-Optimization Task Queue ===" "SECTION"
    if (-not (Test-Path -LiteralPath $QueuePath)) {
        Write-Log "Queue not found: $QueuePath" "ERROR"
        return
    }
    $lines = Get-Content $QueuePath
    $done  = @($lines | Where-Object { $_ -match "^\s*-\s*\[x\]" }).Count
    $todo  = @($lines | Where-Object { $_ -match "^\s*-\s*\[ \]" }).Count
    $fail  = @($lines | Where-Object { $_ -match "^\s*-\s*\[!\]" }).Count
    $wip   = @($lines | Where-Object { $_ -match "^\s*-\s*\[/\]" }).Count

    Write-Log "Done: $done  Todo: $todo  In-progress: $wip  Failed: $fail" "INFO"

    $next = $lines | Where-Object { $_ -match "^\s*-\s*\[ \]" } | Select-Object -First 1
    if ($next) { Write-Log "Next: $($next.Trim())" "INFO" }

    if (Test-Path -LiteralPath $JournalPath) {
        Write-Log "--- Last 5 journal entries ---" "INFO"
        Get-Content $JournalPath | Select-Object -Last 5 | ForEach-Object { Write-Host "  $_" }
    }
}

# ──────────────────────────── FCC loop ───────────────────────────

function Start-FccLoop {
    Write-Log "=== Starting FCC agent loop ===" "SECTION"

    if (-not (Get-Command "fcc-work" -ErrorAction SilentlyContinue)) {
        Write-Log "fcc-work not found in PATH — FCC loop cannot start." "ERROR"
        return
    }

    $runnerScript = Join-Path $ProjectPath "scripts\Invoke-FccNonstop.ps1"
    if (-not (Test-Path -LiteralPath $runnerScript)) {
        Write-Log "scripts\Invoke-FccNonstop.ps1 not found." "ERROR"
        return
    }

    $fccLog = Join-Path $LogDir "fcc-loop-$Timestamp.log"

    $proc = Start-Process `
        -FilePath "powershell.exe" `
        -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $runnerScript, "-ProjectPath", $ProjectPath `
        -WorkingDirectory $ProjectPath `
        -RedirectStandardOutput $fccLog `
        -RedirectStandardError  ($fccLog -replace "\.log$", "-err.log") `
        -PassThru `
        -WindowStyle Normal

    $script:FccPid = $proc.Id
    Write-Log "FCC loop started (PID $($proc.Id)). Log: $fccLog" "OK"
}

# ──────────────────────────── Hermes loop ────────────────────────
# Delegates to the existing, battle-tested Start-EUshop-Hermes.ps1
# which has proper Find-HermesExe with multiple candidate paths,
# circuit breakers, crash counters, and provider health registry.

function Start-HermesLoop {
    Write-Log "=== Starting Hermes agent loop ===" "SECTION"

    $hermesLauncher = Join-Path $ProjectPath "Start-EUshop-Hermes.ps1"
    if (-not (Test-Path -LiteralPath $hermesLauncher)) {
        Write-Log "Start-EUshop-Hermes.ps1 not found at: $hermesLauncher" "ERROR"
        return
    }

    $hermesLog = Join-Path $LogDir "hermes-loop-$Timestamp.log"
    $failures = 0

    while (-not $script:Stop) {
        $failures++
        Write-Log "Hermes invocation #$failures..." "INFO"
        try {
            # -NoRestart so it exits cleanly after one session;
            # this loop provides the restart-with-backoff wrapper.
            & powershell.exe -NoProfile -ExecutionPolicy Bypass `
                -File $hermesLauncher `
                -ProjectPath $ProjectPath `
                -NoRestart `
                2>&1 | Tee-Object -Append -FilePath $hermesLog

            # Successful session resets backoff
            $failures = 0
            if (-not $script:Stop) { Start-Sleep -Seconds 10 }
        }
        catch {
            $delay = Get-Backoff -Failures $failures
            Write-Log "Hermes session error: $($_.Exception.Message). Retrying in $delay s." "WARN"
            if (-not $script:Stop) { Start-Sleep -Seconds $delay }
        }
    }

    Write-Log "Hermes loop stopped." "INFO"
}

# ──────────────────────────── watchdog ───────────────────────────

function Watch-Agents {
    Write-Log "Watching FCC (PID $script:FccPid). Press Ctrl+C to stop." "INFO"
    try {
        while (-not $script:Stop) {
            if ($script:FccPid -and -not (Test-ProcessAlive -Id $script:FccPid)) {
                Write-Log "FCC process exited unexpectedly. Restarting..." "WARN"
                Start-FccLoop
            }
            Start-Sleep -Seconds 15
        }
    }
    finally {
        Write-Log "Shutting down agents..." "WARN"
        if ($script:FccPid -and (Test-ProcessAlive -Id $script:FccPid)) {
            Stop-Process -Id $script:FccPid -Force -ErrorAction SilentlyContinue
            Write-Log "FCC process stopped." "OK"
        }
    }
}

# ──────────────────────────── main ───────────────────────────────

if (-not (Test-Path -LiteralPath $ProjectPath)) {
    throw "Project directory not found: $ProjectPath"
}

New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
Set-Location -LiteralPath $ProjectPath

Write-Log "EUshop YC-Optimization Mission Launcher" "SECTION"
Write-Log "Mode: $Mode | Project: $ProjectPath" "INFO"

switch ($Mode) {

    "Status" {
        Show-QueueStatus
        exit 0
    }

    "FixAuth" {
        Write-Log "=== Repairing FCC authentication ===" "SECTION"
        Repair-FccBaseUrl
        $ok = Repair-OpenRouterKey
        if (-not $ok) {
            Write-Log "Auth repair incomplete. Add a valid OPENROUTER_API_KEY to $FccEnvPath" "ERROR"
            exit 1
        }
        Write-Log "Auth repaired. Falling through to Both mode." "OK"
        # fall through to Both
        $Mode = "Both"
    }
}

# Remove conflicting direct Anthropic credentials from current session
Remove-Item Env:ANTHROPIC_API_KEY         -ErrorAction SilentlyContinue
Remove-Item Env:CLAUDE_CODE_OAUTH_TOKEN   -ErrorAction SilentlyContinue
$env:ANTHROPIC_BASE_URL   = "http://127.0.0.1:$FccPort"
$env:ANTHROPIC_AUTH_TOKEN = "freecc"
$env:DISABLE_TELEMETRY    = "1"
$env:DISABLE_ERROR_REPORTING = "1"

Show-QueueStatus

# Register Ctrl+C handler
[Console]::TreatControlCAsInput = $false
$null = Register-EngineEvent PowerShell.Exiting -Action {
    $script:Stop = $true
}
try { [System.Console]::CancelKeyPress += { $script:Stop = $true } } catch {}

switch ($Mode) {

    "FCC" {
        Start-FccLoop
        Watch-Agents
    }

    "Hermes" {
        Start-HermesLoop
    }

    { $_ -in "Both", "FixAuth" } {
        # Start FCC in a background subprocess first
        Start-FccLoop

        # Launch Hermes loop in a proper background job.
        # Use the call operator (&) not dot-source (.) so parameters work correctly.
        $hermesLauncher = Join-Path $ProjectPath "Start-EUshop-Hermes.ps1"
        $hermesLog      = Join-Path $LogDir "hermes-loop-$Timestamp.log"

        $hermesJob = Start-Job -ScriptBlock {
            param([string]$Launcher, [string]$Proj, [string]$HLog, [int]$MaxBack)
            $failures = 0
            while ($true) {
                $failures++
                try {
                    & powershell.exe -NoProfile -ExecutionPolicy Bypass `
                        -File $Launcher `
                        -ProjectPath $Proj `
                        -NoRestart `
                        2>&1 | Tee-Object -Append -FilePath $HLog
                    $failures = 0
                    Start-Sleep -Seconds 10
                } catch {
                    $delay = [Math]::Min([int](30 * [Math]::Pow(2, [Math]::Min($failures-1,8))), $MaxBack)
                    Start-Sleep -Seconds $delay
                }
            }
        } -ArgumentList $hermesLauncher, $ProjectPath, $hermesLog, $MaxBackoffSeconds

        Write-Log "Hermes job started (ID: $($hermesJob.Id)). Log: $hermesLog" "OK"

        # Watch FCC in the foreground; Hermes runs as background job
        Watch-Agents

        # Clean up Hermes job on Ctrl+C / exit
        if ($hermesJob) {
            Stop-Job  $hermesJob -ErrorAction SilentlyContinue
            Remove-Job $hermesJob -ErrorAction SilentlyContinue
            Write-Log "Hermes job stopped." "OK"
        }
    }
}

Write-Log "Mission launcher exited." "INFO"
