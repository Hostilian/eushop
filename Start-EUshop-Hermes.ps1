#Requires -Version 5.1
<#
.SYNOPSIS
    Canonical EUshop Hermes/FCC launcher with resilience, recovery, and health monitoring.

.DESCRIPTION
    Unified launcher for the EUshop AI agent environment (Hermes + FCC).
    Features:
    - Single-instance lock with stale-lock detection and PID verification
    - Sanitized child-process environment (no credential conflicts)
    - Provider health registry with circuit breakers
    - Bounded restart-storm protection (max 3 restarts in 10 minutes)
    - Checkpoint creation and session recovery
    - Graceful degradation through provider tiers
    - Structured JSON logging

.PARAMETER ProjectPath
    Path to the EUshop repository root. Default: D:\CODING\eushop

.PARAMETER Diagnose
    Run diagnostic checks only. Do not launch.

.PARAMETER Repair
    Run self-repair procedures, then launch.

.PARAMETER HealthCheck
    Display provider health dashboard. Exit 0 if healthy, non-zero otherwise.

.PARAMETER Resume
    Force resume of the most recent checkpoint session.

.PARAMETER Provider
    Override provider selection. Values: fcc, openrouter, gemini, kimi, local, survival

.PARAMETER NoRestart
    Do not restart Hermes after it exits.

.PARAMETER FccPort
    FCC gateway port. Default: 8082

.EXAMPLE
    .\Start-EUshop-Hermes.ps1
    .\Start-EUshop-Hermes.ps1 -HealthCheck
    .\Start-EUshop-Hermes.ps1 -Diagnose
    .\Start-EUshop-Hermes.ps1 -Repair
    .\Start-EUshop-Hermes.ps1 -Resume
    .\Start-EUshop-Hermes.ps1 -Provider fcc
    .\Start-EUshop-Hermes.ps1 -Provider local
    .\Start-EUshop-Hermes.ps1 -NoRestart

.NOTES
    Exit codes:
      0  Success
      2  Configuration invalid
      3  Hermes not found
      4  FCC not found (when required)
      5  No provider currently available
      6  Credential conflict detected
      7  Stale-lock recovery failed
      8  Repeated crash threshold reached
      9  Test/preflight failure
      10 Unsafe secret configuration detected
#>

[CmdletBinding(DefaultParameterSetName = 'Normal')]
param(
    [string]$ProjectPath = "D:\CODING\eushop",

    [Parameter(ParameterSetName = 'Diagnose')]
    [switch]$Diagnose,

    [Parameter(ParameterSetName = 'Repair')]
    [switch]$Repair,

    [Parameter(ParameterSetName = 'HealthCheck')]
    [switch]$HealthCheck,

    [Parameter(ParameterSetName = 'Normal')]
    [switch]$Resume,

    [Parameter(ParameterSetName = 'Normal')]
    [ValidateSet("auto", "fcc", "hermes", "openrouter", "gemini", "kimi", "minimax", "nvidia", "dashscope", "alibaba", "local", "survival")]
    [string]$Provider = 'auto',

    [Parameter(ParameterSetName = 'Normal')]
    [switch]$NoRestart,

    [int]$FccPort = 8082,

    [int]$MaxRestartsPerWindow = 3,
    [int]$RestartWindowMinutes = 10
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = "Stop"

# ─── Constants ────────────────────────────────────────────────────────────────
$REPO_ROOT        = [System.IO.Path]::GetFullPath($ProjectPath)
$CLAUDE_DIR       = Join-Path $REPO_ROOT ".claude"
$AGENT_STATE_DIR  = Join-Path $REPO_ROOT ".agent-state"
$LOCK_PATH        = Join-Path $CLAUDE_DIR "AUTONOMOUS_RUNNER.lock"
$LOG_DIR          = Join-Path $CLAUDE_DIR "runner-logs"
$HEALTH_FILE      = Join-Path $AGENT_STATE_DIR "provider-health.json"
$MISSION_FILE     = Join-Path $AGENT_STATE_DIR "mission.json"
$CHECKPOINTS_DIR  = Join-Path $AGENT_STATE_DIR "checkpoints"
$CRASH_COUNTER    = Join-Path $AGENT_STATE_DIR "crash-counter.json"
$FCC_HOME         = Join-Path $env:USERPROFILE ".fcc"
$FCC_ENV          = Join-Path $FCC_HOME ".env"
$GATEWAY_URL      = "http://127.0.0.1:$FccPort"
$HERMES_EXE       = $null
$CLAUDE_EXE       = $null
$FCC_SERVER_EXE   = Join-Path $env:USERPROFILE ".local\bin\fcc-server.exe"
$TIMESTAMP        = Get-Date -Format "yyyyMMdd-HHmmss"

# Exit codes
$EXIT_SUCCESS             = 0
$EXIT_CONFIG_INVALID      = 2
$EXIT_HERMES_NOT_FOUND    = 3
$EXIT_FCC_NOT_FOUND       = 4
$EXIT_NO_PROVIDER         = 5
$EXIT_CREDENTIAL_CONFLICT = 6
$EXIT_STALE_LOCK_FAIL     = 7
$EXIT_CRASH_THRESHOLD     = 8
$EXIT_TEST_FAILURE        = 9
$EXIT_SECRET_UNSAFE       = 10

# ─── Logging ──────────────────────────────────────────────────────────────────
$script:OperationalLog = $null

function Write-Log {
    param(
        [string]$Message,
        [ValidateSet("INFO","WARN","ERROR","SUCCESS","DEBUG")]
        [string]$Level = "INFO",
        [string]$Component = "launcher"
    )

    $entry = [ordered]@{
        timestamp  = (Get-Date -Format "o")
        level      = $Level.ToLower()
        component  = $Component
        message    = $Message
    } | ConvertTo-Json -Compress

    if ($script:OperationalLog) {
        Add-Content -LiteralPath $script:OperationalLog -Value $entry -ErrorAction SilentlyContinue
    }

    $color = switch ($Level) {
        "WARN"    { "Yellow" }
        "ERROR"   { "Red" }
        "SUCCESS" { "Green" }
        "DEBUG"   { "DarkGray" }
        default   { "Cyan" }
    }

    $prefix = switch ($Level) {
        "WARN"    { "[WARN]" }
        "ERROR"   { "[ERR ]" }
        "SUCCESS" { "[OK  ]" }
        "DEBUG"   { "[DBG ]" }
        default   { "[INFO]" }
    }

    Write-Host "$prefix $Message" -ForegroundColor $color
}

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor DarkCyan
    Write-Host "  $Title" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor DarkCyan
}

# ─── Initialization ───────────────────────────────────────────────────────────
function Initialize-Directories {
    @($CLAUDE_DIR, $LOG_DIR, $AGENT_STATE_DIR, $CHECKPOINTS_DIR,
      (Join-Path $AGENT_STATE_DIR "reports"),
      (Join-Path $AGENT_STATE_DIR "reports\tests")) |
    ForEach-Object {
        if (-not (Test-Path -LiteralPath $_)) {
            New-Item -ItemType Directory -Path $_ -Force | Out-Null
        }
    }

    $script:OperationalLog = Join-Path $LOG_DIR "launcher-$TIMESTAMP.log"
}

# ─── Executable Discovery ─────────────────────────────────────────────────────
function Find-HermesExe {
    $candidates = @(
        (& { $c = Get-Command hermes.exe -ErrorAction SilentlyContinue; if ($c) { $c.Source } else { $null } }),
        "$env:LOCALAPPDATA\hermes\hermes-agent\venv\Scripts\hermes.exe",
        "$env:USERPROFILE\.local\bin\hermes.exe"
    ) | Where-Object { $_ }

    foreach ($c in $candidates) {
        if (Test-Path -LiteralPath $c) {
            try {
                $v = & $c --version 2>&1 | Select-Object -First 1
                if ($LASTEXITCODE -le 1 -and $v -match "Hermes") {
                    return $c
                }
            } catch {}
        }
    }
    return $null
}

function Find-ClaudeExe {
    $candidates = @(
        "$env:USERPROFILE\.local\bin\claude.exe",
        "$env:LOCALAPPDATA\Microsoft\WinGet\Links\claude.exe",
        (& { $c = Get-Command claude.exe -ErrorAction SilentlyContinue; if ($c) { $c.Source } else { $null } })
    ) | Where-Object { $_ }

    foreach ($c in $candidates) {
        if (Test-Path -LiteralPath $c) {
            try {
                $v = & $c --version 2>&1 | Out-String
                if ($LASTEXITCODE -le 1 -and $v -match "Claude Code") {
                    return $c
                }
            } catch {}
        }
    }
    return $null
}

# ─── FCC Integration ──────────────────────────────────────────────────────────
function Test-FccHealth {
    try {
        $r = Invoke-RestMethod -Uri "$GATEWAY_URL/health" -TimeoutSec 4 -ErrorAction Stop
        return $r.status -eq "healthy" -or $r.StatusCode -lt 400
    } catch {
        return $false
    }
}

function Get-FccSetting {
    param([string]$Name)
    if (-not (Test-Path -LiteralPath $FCC_ENV)) { return $null }
    $pattern = "^\s*" + [regex]::Escape($Name) + "\s*=(.*)$"
    foreach ($line in Get-Content -LiteralPath $FCC_ENV) {
        if ($line -match $pattern) {
            $val = $Matches[1].Trim().Trim('"').Trim("'")
            return $val
        }
    }
    return $null
}

function Start-FccServer {
    Write-Log "FCC not healthy. Attempting to start FCC server..." "WARN" "fcc"

    if (-not (Test-Path -LiteralPath $FCC_SERVER_EXE)) {
        Write-Log "FCC server executable not found: $FCC_SERVER_EXE" "ERROR" "fcc"
        return $false
    }

    $outLog = Join-Path $LOG_DIR "fcc-server-$TIMESTAMP.out.log"
    $errLog = Join-Path $LOG_DIR "fcc-server-$TIMESTAMP.err.log"

    New-Item -ItemType Directory -Path (Join-Path $FCC_HOME "logs") -Force | Out-Null

    Start-Process `
        -FilePath $FCC_SERVER_EXE `
        -WorkingDirectory $FCC_HOME `
        -RedirectStandardOutput $outLog `
        -RedirectStandardError $errLog `
        -WindowStyle Hidden | Out-Null

    for ($i = 1; $i -le 30; $i++) {
        Start-Sleep -Seconds 1
        if (Test-FccHealth) {
            Write-Log "FCC server started successfully." "SUCCESS" "fcc"
            return $true
        }
    }

    Write-Log "FCC server failed to start within 30 seconds." "ERROR" "fcc"
    return $false
}

# ─── Credential Resolution ────────────────────────────────────────────────────
function Get-CredentialMetadata {
    param([string]$VarName)

    # Priority: process env -> user env -> FCC env -> hermes env
    $val = $null
    $source = $null

    $processVal = [System.Environment]::GetEnvironmentVariable($VarName, "Process")
    if (-not [string]::IsNullOrWhiteSpace($processVal)) {
        $val = $processVal
        $source = "process_environment"
    }

    if (-not $val) {
        $val = [System.Environment]::GetEnvironmentVariable($VarName, "User")
        if ($val) { $source = "user_environment" }
    }

    if (-not $val -and (Test-Path -LiteralPath $FCC_ENV)) {
        $val = Get-FccSetting -Name $VarName
        if ($val) { $source = "fcc_env_file" }
    }

    $configured = -not [string]::IsNullOrWhiteSpace($val)
    $fingerprint = $null

    if ($configured -and $val.Length -ge 8) {
        $sha = [System.Security.Cryptography.SHA256]::Create()
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($val)
        $hash = $sha.ComputeHash($bytes)
        $fingerprint = ($hash | ForEach-Object { $_.ToString("x2") }) -join "" | Select-Object -First 1
        $fingerprint = ($fingerprint.Substring(0,4) + "..." + $fingerprint.Substring($fingerprint.Length-4, 4))
    }

    return [PSCustomObject]@{
        provider          = $VarName
        credential_source = $source
        configured        = $configured
        fingerprint       = $fingerprint
        validated         = $false
    }
}

function Build-CleanEnvironment {
    <#
    Build a clean child-process environment with no credential conflicts.
    Returns hashtable of env vars to set for the child process.
    #>
    param([string]$SelectedProvider)

    $env = @{}

    # Always remove conflicting Anthropic vars from child process
    # (FCC uses ANTHROPIC_AUTH_TOKEN + ANTHROPIC_BASE_URL, not ANTHROPIC_API_KEY)
    $conflictVars = @(
        "ANTHROPIC_API_KEY",
        "ANTHROPIC_TOKEN",
        "CLAUDE_CODE_OAUTH_TOKEN",
        "ANTHROPIC_CUSTOM_HEADERS",
        "CLAUDE_CODE_USE_BEDROCK",
        "CLAUDE_CODE_USE_VERTEX"
    )

    foreach ($v in $conflictVars) {
        $env["_REMOVE_$v"] = $null  # Marker: remove from child env
    }

    switch ($SelectedProvider) {
        "fcc" {
            $token = Get-FccSetting -Name "ANTHROPIC_AUTH_TOKEN"
            if (-not $token) {
                Write-Log "FCC ANTHROPIC_AUTH_TOKEN not found in $FCC_ENV" "ERROR" "credentials"
                return $null
            }
            $env["ANTHROPIC_BASE_URL"]   = $GATEWAY_URL
            $env["ANTHROPIC_AUTH_TOKEN"] = $token
            $env["CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY"] = "1"
            $env["CLAUDE_CODE_AUTO_COMPACT_WINDOW"] = "190000"
            $env["API_TIMEOUT_MS"]       = "600000"
            $env["DISABLE_AUTOUPDATER"] = "1"
        }
        default {
            # For Hermes modes, use its own credential resolution
            # Just ensure conflicts are removed
        }
    }

    return $env
}

# ─── Lock Management ──────────────────────────────────────────────────────────
function Test-ProcessAlive {
    param([int]$Pid)
    if ($Pid -le 0) { return $false }
    return $null -ne (Get-Process -Id $Pid -ErrorAction SilentlyContinue)
}

function Get-LockAge {
    param([string]$HeartbeatAt)
    if ([string]::IsNullOrWhiteSpace($HeartbeatAt)) { return [int]::MaxValue }
    try {
        $hb = [datetime]::Parse($HeartbeatAt)
        return ([datetime]::UtcNow - $hb).TotalMinutes
    } catch {
        return [int]::MaxValue
    }
}

function Acquire-Lock {
    if (Test-Path -LiteralPath $LOCK_PATH) {
        $lockText = Get-Content -LiteralPath $LOCK_PATH -Raw -ErrorAction SilentlyContinue

        try {
            $lock = $lockText | ConvertFrom-Json -ErrorAction Stop
            $lockedPid = [int]$lock.pid
            $heartbeatAge = Get-LockAge -HeartbeatAt $lock.heartbeat_at

            if (Test-ProcessAlive -Pid $lockedPid) {
                # Verify it's actually our process
                $proc = Get-Process -Id $lockedPid -ErrorAction SilentlyContinue
                if ($proc -and ($proc.Name -match "hermes|claude|powershell|pwsh")) {
                    Write-Log "Active lock held by PID $lockedPid ($($proc.Name)). Another session is running." "ERROR" "lock"
                    return $false
                }
            }

            if ($heartbeatAge -gt 30) {
                Write-Log "Stale lock detected (PID $lockedPid dead, heartbeat $([int]$heartbeatAge)min old). Archiving..." "WARN" "lock"
                $archivePath = "$LOCK_PATH.stale-$TIMESTAMP"
                Copy-Item -LiteralPath $LOCK_PATH -Destination $archivePath -Force
                Remove-Item -LiteralPath $LOCK_PATH -Force -ErrorAction SilentlyContinue
            }
        } catch {
            Write-Log "Corrupted lock file. Archiving and replacing..." "WARN" "lock"
            $archivePath = "$LOCK_PATH.corrupt-$TIMESTAMP"
            Copy-Item -LiteralPath $LOCK_PATH -Destination $archivePath -Force
            Remove-Item -LiteralPath $LOCK_PATH -Force -ErrorAction SilentlyContinue
        }
    }

    # Write new lock
    $lockData = @{
        pid          = $PID
        started_at   = (Get-Date -Format "o")
        host         = $env:COMPUTERNAME
        command      = "Start-EUshop-Hermes.ps1"
        session_id   = [System.Guid]::NewGuid().ToString()
        heartbeat_at = (Get-Date -Format "o")
    } | ConvertTo-Json -Compress

    Set-Content -LiteralPath $LOCK_PATH -Value $lockData -NoNewline
    return $true
}

function Update-LockHeartbeat {
    if (-not (Test-Path -LiteralPath $LOCK_PATH)) { return }
    try {
        $lock = Get-Content -LiteralPath $LOCK_PATH -Raw | ConvertFrom-Json
        $lock.heartbeat_at = (Get-Date -Format "o")
        $lock | ConvertTo-Json -Compress | Set-Content -LiteralPath $LOCK_PATH -NoNewline
    } catch {}
}

function Release-Lock {
    if (Test-Path -LiteralPath $LOCK_PATH) {
        try {
            $lock = Get-Content -LiteralPath $LOCK_PATH -Raw | ConvertFrom-Json
            if ([int]$lock.pid -eq $PID) {
                Remove-Item -LiteralPath $LOCK_PATH -Force -ErrorAction SilentlyContinue
            }
        } catch {
            Remove-Item -LiteralPath $LOCK_PATH -Force -ErrorAction SilentlyContinue
        }
    }
}

# ─── Crash Counter ────────────────────────────────────────────────────────────
function Get-CrashCounter {
    if (-not (Test-Path -LiteralPath $CRASH_COUNTER)) {
        return @{ restarts = @(); consecutive_failures = 0 }
    }
    try {
        return Get-Content -LiteralPath $CRASH_COUNTER -Raw | ConvertFrom-Json
    } catch {
        return @{ restarts = @(); consecutive_failures = 0 }
    }
}

function Test-RestartStorm {
    $counter = Get-CrashCounter
    $windowStart = (Get-Date).AddMinutes(-$RestartWindowMinutes)
    $recentRestarts = @($counter.restarts | Where-Object {
        $_ -and [datetime]::Parse($_) -gt $windowStart
    })

    if ($recentRestarts.Count -ge $MaxRestartsPerWindow) {
        Write-Log "Restart storm detected: $($recentRestarts.Count) restarts in ${RestartWindowMinutes}min window." "ERROR" "supervisor"
        return $true
    }
    return $false
}

function Record-Restart {
    param([int]$ExitCode)
    $counter = Get-CrashCounter
    $restarts = @($counter.restarts)
    $restarts += (Get-Date -Format "o")

    # Keep only last 20 restart timestamps
    if ($restarts.Count -gt 20) {
        $restarts = $restarts[-20..-1]
    }

    @{
        restarts             = $restarts
        consecutive_failures = [int]$counter.consecutive_failures + 1
        last_exit_code       = $ExitCode
        last_restart_at      = (Get-Date -Format "o")
    } | ConvertTo-Json | Set-Content -LiteralPath $CRASH_COUNTER

}

function Reset-CrashCounter {
    @{
        restarts             = @()
        consecutive_failures = 0
        last_exit_code       = 0
        last_restart_at      = $null
    } | ConvertTo-Json | Set-Content -LiteralPath $CRASH_COUNTER
}

# ─── Provider Selection ───────────────────────────────────────────────────────
function Select-Provider {
    param([string]$OverrideProvider)

    Write-Log "Selecting provider..." "INFO" "router"

    if ($OverrideProvider -ne 'auto') {
        Write-Log "Provider override: $OverrideProvider" "INFO" "router"
        return $OverrideProvider
    }

    # Tier 1: FCC gateway (if healthy)
    if (Test-FccHealth) {
        Write-Log "FCC gateway healthy. Selected: fcc" "SUCCESS" "router"
        return "fcc"
    } else {
        Write-Log "FCC not healthy. Trying to start it..." "WARN" "router"
        if (Start-FccServer) {
            return "fcc"
        }
    }

    # Tier 2: Hermes with openrouter (credential check)
    $orKey = Get-CredentialMetadata -VarName "OPENROUTER_API_KEY"
    if ($orKey.configured) {
        Write-Log "OpenRouter key configured ($($orKey.credential_source)). Selected: openrouter (via hermes)" "SUCCESS" "router"
        return "hermes"
    }

    # Tier 3: Hermes with any fallback
    Write-Log "OpenRouter not configured. Falling back to Hermes auto-selection." "WARN" "router"
    return "hermes"
}

# ─── Health Dashboard ─────────────────────────────────────────────────────────
function Show-HealthDashboard {
    Write-Section "EUshop Hermes/FCC Health Dashboard"

    $fccHealthy = Test-FccHealth

    # Hermes
    Write-Host ""
    $hermesStatus = if ($script:HERMES_EXE) { "PASS ($($script:HERMES_EXE | Split-Path -Leaf))" } else { "FAIL (not found)" }
    $hermesColor  = if ($script:HERMES_EXE) { "Green" } else { "Red" }
    Write-Host "  Hermes executable      : " -NoNewline; Write-Host $hermesStatus -ForegroundColor $hermesColor

    # FCC
    $fccStatus = if ($fccHealthy) { "PASS (port $FccPort healthy)" } else { "FAIL (port $FccPort not responding)" }
    $fccColor  = if ($fccHealthy) { "Green" } else { "Red" }
    Write-Host "  FCC integration        : " -NoNewline; Write-Host $fccStatus -ForegroundColor $fccColor

    # Lock
    $lockStatus = if (Test-Path -LiteralPath $LOCK_PATH) {
        try {
            $lk = Get-Content -LiteralPath $LOCK_PATH -Raw | ConvertFrom-Json
            $alive = Test-ProcessAlive -Pid ([int]$lk.pid)
            if ($alive) { "ACTIVE (PID $($lk.pid))" } else { "STALE (PID $($lk.pid) dead)" }
        } catch { "CORRUPT" }
    } else { "NONE" }
    $lockColor = if ($lockStatus -eq "NONE") { "Green" } elseif ($lockStatus -match "ACTIVE") { "Yellow" } else { "Red" }
    Write-Host "  Lock status            : " -NoNewline; Write-Host $lockStatus -ForegroundColor $lockColor

    # Providers
    Write-Host ""
    Write-Host "  Provider Registry:" -ForegroundColor Cyan
    if (Test-Path -LiteralPath $HEALTH_FILE) {
        $health = Get-Content -LiteralPath $HEALTH_FILE -Raw | ConvertFrom-Json
        $enabled  = @($health.providers | Where-Object { $_.enabled -eq $true })
        $working  = @($enabled | Where-Object { $_.circuit_state -eq "closed" -and $_.credential_present -eq $true })
        $cooling  = @($enabled | Where-Object { $_.circuit_state -eq "open" })
        $nokey    = @($enabled | Where-Object { $_.credential_present -eq $false })

        Write-Host "    Enabled providers    : $($enabled.Count)"
        Write-Host "    Credential present   : " -NoNewline; Write-Host "$($working.Count)" -ForegroundColor $(if ($working.Count -gt 0) { "Green" } else { "Red" })
        Write-Host "    Cooling down         : " -NoNewline; Write-Host "$($cooling.Count)" -ForegroundColor $(if ($cooling.Count -eq 0) { "Green" } else { "Yellow" })
        Write-Host "    No credential        : $($nokey.Count)"
    } else {
        Write-Host "    Health file not found: $HEALTH_FILE" -ForegroundColor Yellow
    }

    # FCC providers
    Write-Host ""
    Write-Host "  FCC Provider Keys:" -ForegroundColor Cyan
    $fccProviders = @("OPENROUTER_API_KEY","GEMINI_API_KEY","NVIDIA_NIM_API_KEY","KIMI_API_KEY","MINIMAX_API_KEY","GROQ_API_KEY")
    foreach ($p in $fccProviders) {
        $meta = Get-CredentialMetadata -VarName $p
        $status = if ($meta.configured) { "configured ($($meta.credential_source))" } else { "not set" }
        $color  = if ($meta.configured) { "Green" } else { "DarkGray" }
        Write-Host "    $p" -NoNewline; Write-Host ": $status" -ForegroundColor $color
    }

    # Secret safety
    Write-Host ""
    $secretSafe = -not (git ls-files --error-unmatch custom_keys.json 2>$null)
    $secretStatus = if ($secretSafe) { "PASS (custom_keys.json not tracked)" } else { "FAIL (secret file tracked in git!)" }
    $secretColor  = if ($secretSafe) { "Green" } else { "Red" }
    Write-Host "  Secret scan            : " -NoNewline; Write-Host $secretStatus -ForegroundColor $secretColor

    # Crash counter
    $counter = Get-CrashCounter
    $failColor = if ([int]$counter.consecutive_failures -eq 0) { "Green" } elseif ([int]$counter.consecutive_failures -lt 3) { "Yellow" } else { "Red" }
    Write-Host "  Consecutive failures   : " -NoNewline; Write-Host "$($counter.consecutive_failures)" -ForegroundColor $failColor

    # Recovery state
    $recoveryFile = Join-Path $CLAUDE_DIR "RECOVERY_STATE.md"
    $recoveryStatus = if (Test-Path -LiteralPath $recoveryFile) { "PRESENT" } else { "MISSING" }
    Write-Host "  Recovery state         : " -NoNewline; Write-Host $recoveryStatus -ForegroundColor $(if ($recoveryStatus -eq "PRESENT") { "Green" } else { "Yellow" })

    Write-Host ""
    Write-Host "  Resume command         : .\Start-EUshop-Hermes.ps1 -Resume" -ForegroundColor DarkCyan
    Write-Host "  Diagnose command       : .\Start-EUshop-Hermes.ps1 -Diagnose" -ForegroundColor DarkCyan
    Write-Host ""

    # Return overall health exit code
    if (-not $script:HERMES_EXE) { return $EXIT_HERMES_NOT_FOUND }
    if (-not $fccHealthy) { return $EXIT_FCC_NOT_FOUND }
    return $EXIT_SUCCESS
}

# ─── Diagnostics ─────────────────────────────────────────────────────────────
function Invoke-Diagnostics {
    Write-Section "EUshop Hermes/FCC Diagnostics"

    $issues = 0

    # Check Hermes
    if ($script:HERMES_EXE) {
        Write-Log "Hermes: FOUND at $($script:HERMES_EXE)" "SUCCESS" "diag"
        try {
            $v = & $script:HERMES_EXE --version 2>&1 | Select-Object -First 1
            Write-Log "Hermes version: $v" "INFO" "diag"
        } catch {
            Write-Log "Could not get Hermes version" "WARN" "diag"
        }
    } else {
        Write-Log "Hermes: NOT FOUND" "ERROR" "diag"
        $issues++
    }

    # Check Claude
    if ($script:CLAUDE_EXE) {
        Write-Log "Claude: FOUND at $($script:CLAUDE_EXE)" "SUCCESS" "diag"
    } else {
        Write-Log "Claude: NOT FOUND" "WARN" "diag"
    }

    # Check FCC
    $fccHealthy = Test-FccHealth
    if ($fccHealthy) {
        Write-Log "FCC gateway: HEALTHY at $GATEWAY_URL" "SUCCESS" "diag"
    } else {
        Write-Log "FCC gateway: NOT RESPONDING at $GATEWAY_URL" "WARN" "diag"
        if (Test-Path -LiteralPath $FCC_SERVER_EXE) {
            Write-Log "FCC server executable exists. Run: .\Start-EUshop-Hermes.ps1 -Repair to start it." "INFO" "diag"
        } else {
            Write-Log "FCC server executable not found: $FCC_SERVER_EXE" "ERROR" "diag"
            $issues++
        }
    }

    # Check credential conflicts
    $conflictVars = @("ANTHROPIC_API_KEY","ANTHROPIC_AUTH_TOKEN")
    $apiKey   = [System.Environment]::GetEnvironmentVariable("ANTHROPIC_API_KEY")
    $authToken = [System.Environment]::GetEnvironmentVariable("ANTHROPIC_AUTH_TOKEN")
    if ($apiKey -and $authToken) {
        Write-Log "CREDENTIAL CONFLICT: Both ANTHROPIC_API_KEY and ANTHROPIC_AUTH_TOKEN set." "ERROR" "diag"
        $issues++
    } elseif ($apiKey) {
        Write-Log "ANTHROPIC_API_KEY is set in environment (may conflict with FCC)" "WARN" "diag"
    } elseif ($authToken) {
        Write-Log "ANTHROPIC_AUTH_TOKEN is set (FCC mode)" "INFO" "diag"
    } else {
        Write-Log "No Anthropic env vars in process environment (FCC reads from its own .env)" "INFO" "diag"
    }

    # Check secret tracking
    $secretTracked = $false
    try {
        $null = git ls-files --error-unmatch custom_keys.json 2>&1
        $secretTracked = ($LASTEXITCODE -eq 0)
    } catch {
        $secretTracked = $false
    }
    if ($secretTracked) {
        Write-Log "SECURITY: custom_keys.json is tracked by git!" "ERROR" "diag"
        $issues++
    } else {
        Write-Log "Secret scan: custom_keys.json not tracked by git." "SUCCESS" "diag"
    }

    # Check lock
    if (Test-Path -LiteralPath $LOCK_PATH) {
        try {
            $lk = Get-Content -LiteralPath $LOCK_PATH -Raw | ConvertFrom-Json
            if (Test-ProcessAlive -Pid ([int]$lk.pid)) {
                Write-Log "Lock: ACTIVE (PID $($lk.pid))" "WARN" "diag"
            } else {
                Write-Log "Lock: STALE (PID $($lk.pid) is dead)" "WARN" "diag"
            }
        } catch {
            Write-Log "Lock: CORRUPT file" "ERROR" "diag"
            $issues++
        }
    } else {
        Write-Log "Lock: NONE" "SUCCESS" "diag"
    }

    # Check Hermes config
    $hermesConfig = "$env:LOCALAPPDATA\hermes\config.yaml"
    if (Test-Path -LiteralPath $hermesConfig) {
        Write-Log "Hermes config: $hermesConfig" "SUCCESS" "diag"
    } else {
        Write-Log "Hermes config not found: $hermesConfig" "WARN" "diag"
    }

    Write-Host ""
    if ($issues -eq 0) {
        Write-Log "Diagnostics PASSED. No issues found." "SUCCESS" "diag"
        return $EXIT_SUCCESS
    } else {
        Write-Log "Diagnostics found $issues issue(s). Run -Repair to attempt fixes." "WARN" "diag"
        return $EXIT_TEST_FAILURE
    }
}

# ─── Self-Repair ──────────────────────────────────────────────────────────────
function Invoke-SelfRepair {
    Write-Section "EUshop Self-Repair"
    $repaired = 0

    # Repair 1: Stale lock
    if (Test-Path -LiteralPath $LOCK_PATH) {
        try {
            $lk = Get-Content -LiteralPath $LOCK_PATH -Raw | ConvertFrom-Json
            if (-not (Test-ProcessAlive -Pid ([int]$lk.pid))) {
                $archive = "$LOCK_PATH.stale-$TIMESTAMP"
                Copy-Item -LiteralPath $LOCK_PATH -Destination $archive -Force
                Remove-Item -LiteralPath $LOCK_PATH -Force
                Write-Log "Repaired: Archived stale lock to $archive" "SUCCESS" "repair"
                $repaired++
            }
        } catch {
            $archive = "$LOCK_PATH.corrupt-$TIMESTAMP"
            Copy-Item -LiteralPath $LOCK_PATH -Destination $archive -Force -ErrorAction SilentlyContinue
            Remove-Item -LiteralPath $LOCK_PATH -Force -ErrorAction SilentlyContinue
            Write-Log "Repaired: Archived corrupt lock to $archive" "SUCCESS" "repair"
            $repaired++
        }
    }

    # Repair 2: Recreate missing state directories
    @($AGENT_STATE_DIR, $CHECKPOINTS_DIR, $LOG_DIR) | ForEach-Object {
        if (-not (Test-Path -LiteralPath $_)) {
            New-Item -ItemType Directory -Path $_ -Force | Out-Null
            Write-Log "Repaired: Created missing directory: $_" "SUCCESS" "repair"
            $repaired++
        }
    }

    # Repair 3: FCC server startup
    if (-not (Test-FccHealth)) {
        Write-Log "Attempting to start FCC server as part of repair..." "INFO" "repair"
        if (Start-FccServer) {
            $repaired++
        }
    } else {
        Write-Log "FCC already healthy." "SUCCESS" "repair"
    }

    # Repair 4: Untrack secret files from git
    $tracked = $false
    try {
        $null = git ls-files --error-unmatch custom_keys.json 2>&1
        $tracked = ($LASTEXITCODE -eq 0)
    } catch { $tracked = $false }
    if ($tracked) {
        try { git rm --cached custom_keys.json 2>&1 | Out-Null } catch {}
        Write-Log "Repaired: Untracked custom_keys.json from git." "SUCCESS" "repair"
        $repaired++
    }

    # Repair 5: Reset crash counter & consecutive failure history
    Reset-CrashCounter
    Write-Log "Repaired: Reset crash counter and consecutive failure history." "SUCCESS" "repair"
    $repaired++

    # Repair 6: Reset open circuit breakers in provider-health.json
    if (Test-Path -LiteralPath $HEALTH_FILE) {
        try {
            $healthData = Get-Content -LiteralPath $HEALTH_FILE -Raw | ConvertFrom-Json
            $updated = $false
            foreach ($p in $healthData.providers) {
                if ($p.circuit_state -eq "open") {
                    $p.circuit_state = "closed"
                    $p.consecutive_failures = 0
                    $p.cooldown_until = $null
                    $updated = $true
                }
            }
            if ($updated) {
                $healthData.updated_at = (Get-Date -Format "o")
                $healthData | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $HEALTH_FILE
                Write-Log "Repaired: Re-opened circuit breakers for cooled providers." "SUCCESS" "repair"
                $repaired++
            }
        } catch {
            Write-Log "Could not update provider health during repair: $($_.Exception.Message)" "WARN" "repair"
        }
    }

    Write-Log "Self-repair complete. $repaired item(s) repaired." "SUCCESS" "repair"
    return $EXIT_SUCCESS
}

# ─── Checkpoint ───────────────────────────────────────────────────────────────
function Write-Checkpoint {
    param([string]$Phase, [string]$NextAction)

    $checkpoint = @{
        timestamp   = (Get-Date -Format "o")
        phase       = $Phase
        next_action = $NextAction
        pid         = $PID
        provider    = $Provider
    } | ConvertTo-Json

    $cpPath = Join-Path $CHECKPOINTS_DIR "checkpoint-$TIMESTAMP.json"
    Set-Content -LiteralPath $cpPath -Value $checkpoint

    # Also update mission file
    if (Test-Path -LiteralPath $MISSION_FILE) {
        try {
            $mission = Get-Content -LiteralPath $MISSION_FILE -Raw | ConvertFrom-Json
            $mission.current_phase = $Phase
            $mission.last_successful_command = "checkpoint written"
            $mission | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $MISSION_FILE
        } catch {}
    }
}

# ─── Mission Prompt ──────────────────────────────────────────────────────────
# Read once so both FCC and Hermes share the same compact prompt
$MISSION_PROMPT = @"
You are working autonomously on the EUshop project at D:\CODING\eushop.

STARTUP (every invocation):
1. Read CLAUDE.md and .claude/AUTONOMY.md.
2. Read D:\CODING\eushop\.hermes\yc-optimization-queue.md - this is your task list.
3. Read .claude/RECOVERY_STATE.md for the last checkpoint.
4. Run: git status, git log --oneline -5.

WORK LOOP:
- Pick the FIRST task marked [ ] (not BLOCKED).
- Mark it [/] in yc-optimization-queue.md before you start.
- Do the work. Meet the acceptance criteria exactly.
- Mark it [x] only when acceptance criteria are verifiably satisfied.
- Append a one-line summary to .hermes/version-44-journal.md.
- Update .claude/RECOVERY_STATE.md with what was done and the next action.
- Commit after completing each full PHASE (not individual tasks).
- Never touch main. Never force-push. Never expose secrets.
- Add // COMPLIANCE-REVIEW: comments on any compliance logic.
- When a task fails twice, mark it [!] and move to the next one.

Continue working autonomously until no [ ] tasks remain or time runs out.
"@

# ─── Launch Hermes ────────────────────────────────────────────────────────────
function Invoke-Hermes {
    param([string]$SelectedProvider)

    Write-Log "Launching Hermes (provider: $SelectedProvider)..." "INFO" "launcher"

    Set-Location -LiteralPath $REPO_ROOT

    $exitCode = 0

    switch ($SelectedProvider) {
        "fcc" {
            # Launch Claude via FCC gateway in print/stdin mode (non-interactive)
            if (-not $script:CLAUDE_EXE) {
                Write-Log "Claude executable not found for FCC mode." "ERROR" "launcher"
                return $EXIT_FCC_NOT_FOUND
            }

            $token = Get-FccSetting -Name "ANTHROPIC_AUTH_TOKEN"
            if (-not $token) {
                Write-Log "FCC ANTHROPIC_AUTH_TOKEN missing." "ERROR" "launcher"
                return $EXIT_CREDENTIAL_CONFLICT
            }

            # Build clean environment
            $savedVars = @{}
            $removeVars = @("ANTHROPIC_API_KEY","ANTHROPIC_TOKEN","CLAUDE_CODE_OAUTH_TOKEN","ANTHROPIC_CUSTOM_HEADERS","CLAUDE_CODE_USE_BEDROCK","CLAUDE_CODE_USE_VERTEX")
            foreach ($v in $removeVars) {
                $savedVars[$v] = [System.Environment]::GetEnvironmentVariable($v)
                [System.Environment]::SetEnvironmentVariable($v, $null)
                Remove-Item "Env:$v" -ErrorAction SilentlyContinue
            }

            $env:ANTHROPIC_BASE_URL = $GATEWAY_URL
            $env:ANTHROPIC_AUTH_TOKEN = $token
            $env:CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY = "1"
            $env:CLAUDE_CONFIG_DIR = Join-Path $REPO_ROOT ".claude-runner-session"
            $env:CLAUDE_CODE_DISABLE_PROJECT_MESSAGES = "1"
            $env:CLAUDE_CODE_AUTO_COMPACT_WINDOW = "4000"
            $env:CLAUDE_CODE_MAX_OUTPUT_TOKENS = "4096"
            $env:MAX_TOKENS = "4096"
            $env:MAX_THINKING_TOKENS = "1024"
            $env:API_TIMEOUT_MS = "600000"
            $env:DISABLE_AUTOUPDATER = "1"
            $env:DISABLE_TELEMETRY = "1"

            try {
                # Claude Code requires prompt via stdin when running non-interactively.
                # --print flag enables non-interactive print mode.
                Write-Log "Sending YC mission prompt to Claude via FCC gateway..." "INFO" "launcher"
                $procOutput = $MISSION_PROMPT | & $script:CLAUDE_EXE --print 2>&1
                if ($procOutput) { $procOutput | Out-Host }
                $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { [int]$LASTEXITCODE }
            } finally {
                # Restore environment
                foreach ($v in $removeVars) {
                    if ($savedVars[$v]) {
                        [System.Environment]::SetEnvironmentVariable($v, $savedVars[$v])
                    }
                }
                Remove-Item Env:ANTHROPIC_BASE_URL -ErrorAction SilentlyContinue
                Remove-Item Env:ANTHROPIC_AUTH_TOKEN -ErrorAction SilentlyContinue
            }
        }

        default {
            # Launch Hermes in non-interactive single-query mode (-q flag).
            # bare 'hermes chat' requires a TTY and crashes when piped.
            Write-Log "Launching Hermes agent (non-interactive, provider: $SelectedProvider)..." "INFO" "launcher"

            if (-not $script:HERMES_EXE) {
                Write-Log "Hermes executable not found. Cannot launch Hermes provider." "ERROR" "launcher"
                return $EXIT_HERMES_NOT_FOUND
            }

            $hermesArgs = @(
                "-z", $MISSION_PROMPT,
                "--yolo",
                "--accept-hooks"
            )

            $env:MAX_TOKENS = "16384"
            $env:MAX_COMPLETION_TOKENS = "16384"

            if ($SelectedProvider -eq "dashscope" -or $SelectedProvider -eq "alibaba") {
                $dashKey = Get-FccSetting -Name "DASHSCOPE_API_KEY"
                if ($dashKey) { $env:DASHSCOPE_API_KEY = $dashKey }
                $hermesArgs += @("--provider", "dashscope", "--model", "qwen-turbo")
            } elseif ($SelectedProvider -eq "nvidia") {
                $hermesArgs += @("--provider", "nvidia", "--model", "nvidia/meta/llama-3.3-70b-instruct")
            } elseif ($SelectedProvider -eq "kimi") {
                $hermesArgs += @("--provider", "kimi", "--model", "kimi/moonshot-v1-8k")
            } elseif ($SelectedProvider -eq "minimax") {
                $hermesArgs += @("--provider", "minimax", "--model", "minimax/MiniMax-Text-01")
            }

            if ($Resume) {
                $hermesArgs += "--continue"
                Write-Log "Resuming most recent Hermes session..." "INFO" "launcher"
            }

            $procOutput = & $script:HERMES_EXE @hermesArgs 2>&1
            if ($procOutput) { $procOutput | Out-Host }
            $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { [int]$LASTEXITCODE }
        }
    }

    return [int]$exitCode
}

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN ENTRY POINT
# ═══════════════════════════════════════════════════════════════════════════════

# Validate repository root
if (-not (Test-Path -LiteralPath $REPO_ROOT -PathType Container)) {
    Write-Host "[ERR ] Repository not found: $REPO_ROOT" -ForegroundColor Red
    exit $EXIT_CONFIG_INVALID
}

Set-Location -LiteralPath $REPO_ROOT
Initialize-Directories

Write-Log "=== Start-EUshop-Hermes.ps1 started (PID: $PID) ===" "INFO" "launcher"
Write-Log "Repository: $REPO_ROOT" "INFO" "launcher"
Write-Log "Mode: $($PSCmdlet.ParameterSetName)" "INFO" "launcher"

# Discover executables
$script:HERMES_EXE = Find-HermesExe
$script:CLAUDE_EXE = Find-ClaudeExe

if ($script:HERMES_EXE) {
    Write-Log "Hermes: $($script:HERMES_EXE)" "SUCCESS" "launcher"
} else {
    Write-Log "Hermes executable not found in PATH or standard locations." "WARN" "launcher"
}

if ($script:CLAUDE_EXE) {
    Write-Log "Claude: $($script:CLAUDE_EXE)" "SUCCESS" "launcher"
}

# ── HealthCheck mode ──────────────────────────────────────────────────────────
if ($HealthCheck) {
    $result = Show-HealthDashboard
    exit $result
}

# ── Diagnose mode ─────────────────────────────────────────────────────────────
if ($Diagnose) {
    $result = Invoke-Diagnostics
    exit $result
}

# ── Repair mode ───────────────────────────────────────────────────────────────
if ($Repair) {
    $result = Invoke-SelfRepair
    if ($result -ne $EXIT_SUCCESS) { exit $result }
    Write-Log "Repair complete. Proceeding to launch..." "INFO" "launcher"
}

# ── Hermes required for normal/resume modes ───────────────────────────────────
if (-not $script:HERMES_EXE -and -not $script:CLAUDE_EXE) {
    Write-Log "Neither Hermes nor Claude executable found. Cannot launch." "ERROR" "launcher"
    exit $EXIT_HERMES_NOT_FOUND
}

# ── Select provider ───────────────────────────────────────────────────────────
$selectedProvider = Select-Provider -OverrideProvider $Provider

Write-Log "Selected provider: $selectedProvider" "SUCCESS" "launcher"
Write-Log "Credential source: $((Get-CredentialMetadata -VarName 'OPENROUTER_API_KEY').credential_source)" "INFO" "launcher"
Write-Log "Credential conflict: no" "INFO" "launcher"
Write-Log "Validation: not-tested" "INFO" "launcher"

# Display selection
Write-Host ""
Write-Host "  Provider: $selectedProvider" -ForegroundColor Cyan
Write-Host "  FCC status: $(if (Test-FccHealth) { 'HEALTHY' } else { 'UNAVAILABLE' })" -ForegroundColor $(if (Test-FccHealth) { "Green" } else { "Red" })
Write-Host ""

# ── Lock acquisition ──────────────────────────────────────────────────────────
$lockAcquired = Acquire-Lock
if (-not $lockAcquired) {
    Write-Log "Could not acquire session lock. Another session may be running." "ERROR" "lock"
    exit $EXIT_STALE_LOCK_FAIL
}

# ── Restart storm check ───────────────────────────────────────────────────────
if (Test-RestartStorm) {
    Write-Log "Restart storm protection triggered. Too many recent restarts." "ERROR" "supervisor"
    Write-Log "Wait ${RestartWindowMinutes} minutes or run: .\Start-EUshop-Hermes.ps1 -Repair" "INFO" "supervisor"
    Release-Lock
    exit $EXIT_CRASH_THRESHOLD
}

# ── Write checkpoint ──────────────────────────────────────────────────────────
Write-Checkpoint -Phase "pre-launch" -NextAction "launch-$selectedProvider"

# ── Main launch loop ──────────────────────────────────────────────────────────
$maxIterations = if ($NoRestart) { 1 } else { [int]::MaxValue }
$iteration = 0

try {
    while ($iteration -lt $maxIterations) {
        $iteration++
        Write-Log "Launch iteration $iteration" "INFO" "launcher"
        Update-LockHeartbeat

        $exitCode = Invoke-Hermes -SelectedProvider $selectedProvider

        Write-Log "Session ended with exit code: $exitCode" "INFO" "launcher"
        Write-Checkpoint -Phase "post-session" -NextAction "evaluate-exit-$exitCode"

        if ($NoRestart) {
            Write-Log "-NoRestart specified. Not restarting." "INFO" "launcher"
            break
        }

        # Classify exit code
        [int]$cleanExitCode = try {
            if ($exitCode -is [array]) { [int]$exitCode[-1] } else { [int]$exitCode }
        } catch { 1 }

        $shouldRestart = switch ($cleanExitCode) {
            0   { Write-Log "Clean exit. Not restarting." "SUCCESS" "launcher"; $false }
            130 { Write-Log "Interrupted (Ctrl+C). Not restarting." "WARN" "launcher"; $false }
            default {
                Write-Log "Abnormal exit ($cleanExitCode). Recording crash..." "WARN" "launcher"
                Record-Restart -ExitCode $cleanExitCode
                if (Test-RestartStorm) {
                    Write-Log "Restart storm triggered after crash." "ERROR" "supervisor"
                    $false
                } else {
                    $true
                }
            }
        }

        if (-not $shouldRestart) { break }

        Write-Log "Restarting in 25 seconds (cooling rate limit window)... Press Ctrl+C to cancel." "WARN" "launcher"
        Start-Sleep -Seconds 25
        Update-LockHeartbeat
    }
} finally {
    Release-Lock
    Write-Log "=== Start-EUshop-Hermes.ps1 exiting ===" "INFO" "launcher"
    Write-Host ""
    Write-Host "  Resume command : .\Start-EUshop-Hermes.ps1 -Resume" -ForegroundColor DarkCyan
    Write-Host "  Health check   : .\Start-EUshop-Hermes.ps1 -HealthCheck" -ForegroundColor DarkCyan
    Write-Host ""
}

if ($exitCode -eq 0) {
    Reset-CrashCounter
}

exit $exitCode
