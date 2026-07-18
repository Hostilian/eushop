[CmdletBinding()]
param(
    [string]$ProjectPath = "D:\CODING\eushop",
    [int]$FccFailureThreshold = 2,
    [int]$FccCooldownMinutes = 120,
    [int]$ChatGptCooldownMinutes = 30,
    [int]$ApiCooldownMinutes = 30,
    [int]$GeminiCooldownMinutes = 30,
    [bool]$AllowApiKeyFallback = $true
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Continue"

function Write-AgentLog {
    param(
        [string]$Message,
        [ValidateSet("INFO", "WARN", "ERROR", "SUCCESS")]
        [string]$Level = "INFO"
    )

    $Line = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')][$Level] $Message"
    Add-Content -LiteralPath $script:MainLogPath -Value $Line

    switch ($Level) {
        "WARN"    { Write-Host $Line -ForegroundColor Yellow }
        "ERROR"   { Write-Host $Line -ForegroundColor Red }
        "SUCCESS" { Write-Host $Line -ForegroundColor Green }
        default   { Write-Host $Line }
    }
}

function New-ProviderState {
    return [PSCustomObject]@{
        fccFailures = 0
        fccUntil = $null

        chatgptFailures = 0
        chatgptUntil = $null

        apiFailures = 0
        apiUntil = $null

        geminiFailures = 0
        geminiUntil = $null

        lastProvider = $null
        lastSuccess = $null
        lastFailure = $null
    }
}

function Save-ProviderState {
    param([Parameter(Mandatory = $true)][object]$State)

    $Encoding = New-Object System.Text.UTF8Encoding($false)

    [System.IO.File]::WriteAllText(
        $script:ProviderStatePath,
        ($State | ConvertTo-Json -Depth 20),
        $Encoding
    )
}

function Load-ProviderState {
    if (-not (Test-Path -LiteralPath $script:ProviderStatePath)) {
        return New-ProviderState
    }

    try {
        $State = Get-Content `
            -LiteralPath $script:ProviderStatePath `
            -Raw |
            ConvertFrom-Json
    }
    catch {
        Write-AgentLog "Provider state was unreadable; recreating it." "WARN"
        return New-ProviderState
    }

    $Defaults = New-ProviderState

    foreach ($Property in $Defaults.PSObject.Properties.Name) {
        if (-not $State.PSObject.Properties[$Property]) {
            $State | Add-Member `
                -MemberType NoteProperty `
                -Name $Property `
                -Value $Defaults.$Property
        }
    }

    return $State
}

function Test-CircuitOpen {
    param($Until)

    if (-not $Until) {
        return $false
    }

    try {
        return (
            Get-Date
        ) -lt (
            [DateTimeOffset]::Parse([string]$Until)
        ).LocalDateTime
    }
    catch {
        return $false
    }
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

function Get-CodexLoginStatus {
    $PreviousPreference = $ErrorActionPreference

    try {
        $ErrorActionPreference = "Continue"
        $Text = (& codex login status 2>&1 | Out-String).Trim()
        $ExitCode = $LASTEXITCODE

        return [PSCustomObject]@{
            Text = $Text
            ExitCode = $ExitCode
        }
    }
    finally {
        $ErrorActionPreference = $PreviousPreference
    }
}

function Invoke-FccProvider {
    param(
        [string]$Prompt,
        [string]$LogPath
    )

    $Output = @()
    $ExitCode = 1

    try {
        $Output = $Prompt |
            & fcc-work 2>&1 |
            Tee-Object -FilePath $LogPath

        $ExitCode = if ($null -eq $LASTEXITCODE) {
            0
        }
        else {
            $LASTEXITCODE
        }
    }
    catch {
        $Text = $_ | Out-String
        $Output += $Text
        Add-Content -LiteralPath $LogPath -Value $Text
    }

    return [PSCustomObject]@{
        Provider = "fcc"
        ExitCode = $ExitCode
        Text = ($Output | Out-String)
    }
}

function Invoke-CodexChatGptProvider {
    param(
        [string]$Prompt,
        [string]$LogPath
    )

    $Status = Get-CodexLoginStatus

    if ($Status.Text -notmatch "Logged in using ChatGPT") {
        $Message = "ChatGPT Codex login unavailable: $($Status.Text)"
        Set-Content -LiteralPath $LogPath -Value $Message

        return [PSCustomObject]@{
            Provider = "codex-chatgpt"
            ExitCode = 2
            Text = $Message
        }
    }

    # OPENAI_API_KEY and all other keys remain untouched.
    # If CODEX_API_KEY is already defined, Codex exec may intentionally use it.
    # The provider selector therefore routes an existing CODEX_API_KEY through
    # the explicit codex-api provider instead of this provider.
    $Output = @()
    $ExitCode = 1

    try {
        $Output = $Prompt |
            & codex exec `
                --dangerously-bypass-approvals-and-sandbox `
                -C $ProjectPath `
                - `
                2>&1 |
            Tee-Object -FilePath $LogPath

        $ExitCode = if ($null -eq $LASTEXITCODE) {
            0
        }
        else {
            $LASTEXITCODE
        }
    }
    catch {
        $Text = $_ | Out-String
        $Output += $Text
        Add-Content -LiteralPath $LogPath -Value $Text
    }

    return [PSCustomObject]@{
        Provider = "codex-chatgpt"
        ExitCode = $ExitCode
        Text = ($Output | Out-String)
    }
}

function Invoke-CodexApiProvider {
    param(
        [string]$Prompt,
        [string]$LogPath
    )

    $ApiKey = $null

    if (-not [string]::IsNullOrWhiteSpace($env:CODEX_API_KEY)) {
        $ApiKey = $env:CODEX_API_KEY
    }
    elseif (-not [string]::IsNullOrWhiteSpace($env:OPENAI_API_KEY)) {
        $ApiKey = $env:OPENAI_API_KEY
    }

    if (-not $ApiKey) {
        $Message = "Codex API fallback has no CODEX_API_KEY or OPENAI_API_KEY."
        Set-Content -LiteralPath $LogPath -Value $Message

        return [PSCustomObject]@{
            Provider = "codex-api"
            ExitCode = 2
            Text = $Message
        }
    }

    # Preserve the exact existing process value. If only OPENAI_API_KEY exists,
    # map it temporarily to CODEX_API_KEY for this codex exec invocation.
    # No User- or Machine-level key is modified or deleted.
    $HadProcessCodexKey = Test-Path Env:CODEX_API_KEY
    $OriginalProcessCodexKey = $env:CODEX_API_KEY

    $Output = @()
    $ExitCode = 1

    try {
        $env:CODEX_API_KEY = $ApiKey

        $Output = $Prompt |
            & codex exec `
                --dangerously-bypass-approvals-and-sandbox `
                -C $ProjectPath `
                - `
                2>&1 |
            Tee-Object -FilePath $LogPath

        $ExitCode = if ($null -eq $LASTEXITCODE) {
            0
        }
        else {
            $LASTEXITCODE
        }
    }
    catch {
        $Text = $_ | Out-String
        $Output += $Text
        Add-Content -LiteralPath $LogPath -Value $Text
    }
    finally {
        if ($HadProcessCodexKey) {
            $env:CODEX_API_KEY = $OriginalProcessCodexKey
        }
        else {
            Remove-Item Env:CODEX_API_KEY -ErrorAction SilentlyContinue
        }
    }

    return [PSCustomObject]@{
        Provider = "codex-api"
        ExitCode = $ExitCode
        Text = ($Output | Out-String)
    }
}

function Invoke-GeminiProvider {
    param(
        [string]$Prompt,
        [string]$LogPath
    )

    $Output = @()
    $ExitCode = 1

    try {
        $Output = & gemini `
            --approval-mode=yolo `
            --skip-trust `
            --output-format=text `
            -p $Prompt `
            2>&1 |
            Tee-Object -FilePath $LogPath

        $ExitCode = if ($null -eq $LASTEXITCODE) {
            0
        }
        else {
            $LASTEXITCODE
        }
    }
    catch {
        $Text = $_ | Out-String
        $Output += $Text
        Add-Content -LiteralPath $LogPath -Value $Text
    }

    return [PSCustomObject]@{
        Provider = "gemini"
        ExitCode = $ExitCode
        Text = ($Output | Out-String)
    }
}

function Save-OfflineCheckpoint {
    param([int]$Sequence)

    $Path = Join-Path $script:LogDirectory (
        "offline-{0:D5}-{1}.log" -f `
            $Sequence,
            (Get-Date -Format "yyyyMMdd-HHmmss")
    )

    @(
        "Offline graceful-degradation checkpoint"
        "Generated: $((Get-Date).ToString('o'))"
        ""
        "Branch:"
        (& git branch --show-current 2>&1 | Out-String)
        ""
        "HEAD:"
        (& git rev-parse HEAD 2>&1 | Out-String)
        ""
        "Status:"
        (& git status --short --branch 2>&1 | Out-String)
        ""
        "Diff check:"
        (& git diff --check 2>&1 | Out-String)
        ""
        "Recovery checkpoint tail:"
        $(
            if (Test-Path -LiteralPath $script:RecoveryStatePath) {
                Get-Content `
                    -LiteralPath $script:RecoveryStatePath `
                    -Tail 100 |
                    Out-String
            }
            else {
                "RECOVERY_STATE.md not found."
            }
        )
    ) | Set-Content -LiteralPath $Path -Encoding UTF8

    Write-AgentLog "All AI providers are cooling down; saved $Path" "WARN"
}

if (-not (Test-Path -LiteralPath $ProjectPath -PathType Container)) {
    throw "Project missing: $ProjectPath"
}

Set-Location -LiteralPath $ProjectPath

$ClaudeDirectory = Join-Path $ProjectPath ".claude"
$script:LogDirectory = Join-Path $ClaudeDirectory "agent-failover-logs"
$script:ProviderStatePath = Join-Path $ClaudeDirectory "provider-state.json"
$script:RecoveryStatePath = Join-Path $ClaudeDirectory "RECOVERY_STATE.md"
$CompletePath = Join-Path $ClaudeDirectory "AUTONOMOUS_COMPLETE"
$StopPath = Join-Path $ClaudeDirectory "AUTONOMOUS_STOP"
$LockPath = Join-Path $ClaudeDirectory "AGENT_FAILOVER.lock"

New-Item -ItemType Directory -Path $script:LogDirectory -Force | Out-Null

$script:MainLogPath = Join-Path $script:LogDirectory (
    "orchestrator-" +
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
            throw "Another failover runner is active with PID $ExistingPid."
        }
    }

    Remove-Item `
        -LiteralPath $LockPath `
        -Force `
        -ErrorAction SilentlyContinue
}

Set-Content -LiteralPath $LockPath -Value $PID -NoNewline

$MissionPrompt = @"
Continue the EUshop repository recovery, historical-version catalogue, navigation, unified integration, validation, and improvement mission autonomously.

First read CLAUDE.md, .claude/AUTONOMY.md, and .claude/RECOVERY_STATE.md. Inspect Git branch, HEAD, status, recent commits, worktrees, recovery directories, reports, and existing artifacts. Resume the first unfinished checkpoint and do not repeat verified work.

Work continuously and checkpoint frequently. When a command, test, dependency, tool, network request, provider, subagent, or method fails, record it, choose a safe fallback, and continue independent work. Do not ask for routine approval or ask what to do next. Keep main untouched. Never force-push, deploy, delete history, expose secrets, or alter external accounts. Create .claude/AUTONOMOUS_COMPLETE only when every acceptance criterion is genuinely complete. Stop cleanly if .claude/AUTONOMOUS_STOP exists.

The active model provider may change. Git and repository checkpoint files are the source of truth.
"@

$Sequence = 0

try {
    Write-AgentLog "Failover started."
    Write-AgentLog "Order: FCC -> Codex ChatGPT -> Codex API key -> Gemini -> offline."
    Write-AgentLog "API keys are preserved. API-key fallback enabled: $AllowApiKeyFallback"
    Write-AgentLog "API-key fallback may incur charges." "WARN"

    while ($true) {
        if (Test-Path -LiteralPath $StopPath) {
            Write-AgentLog "Stop marker found." "WARN"
            break
        }

        if (Test-Path -LiteralPath $CompletePath) {
            Write-AgentLog "Completion marker found." "SUCCESS"
            Get-Content -LiteralPath $CompletePath
            break
        }

        $Sequence++
        $State = Load-ProviderState
        $Provider = $null

        $FccAvailable = $null -ne (
            Get-Command fcc-work -ErrorAction SilentlyContinue
        )

        $CodexAvailable = $null -ne (
            Get-Command codex -ErrorAction SilentlyContinue
        )

        $GeminiAvailable = $null -ne (
            Get-Command gemini -ErrorAction SilentlyContinue
        )

        $CodexStatus = $null

        if ($CodexAvailable) {
            $CodexStatus = Get-CodexLoginStatus
        }

        $HasChatGptLogin = (
            $CodexStatus -and
            $CodexStatus.Text -match "Logged in using ChatGPT"
        )

        $HasExplicitCodexKey = -not [string]::IsNullOrWhiteSpace(
            $env:CODEX_API_KEY
        )

        $HasApiFallbackKey = (
            $AllowApiKeyFallback -and
            (
                $HasExplicitCodexKey -or
                -not [string]::IsNullOrWhiteSpace($env:OPENAI_API_KEY)
            )
        )

        if (
            $FccAvailable -and
            -not (Test-CircuitOpen -Until $State.fccUntil)
        ) {
            $Provider = "fcc"
        }
        elseif (
            $CodexAvailable -and
            $HasChatGptLogin -and
            -not $HasExplicitCodexKey -and
            -not (Test-CircuitOpen -Until $State.chatgptUntil)
        ) {
            $Provider = "codex-chatgpt"
        }
        elseif (
            $CodexAvailable -and
            $HasApiFallbackKey -and
            -not (Test-CircuitOpen -Until $State.apiUntil)
        ) {
            $Provider = "codex-api"
        }
        elseif (
            $GeminiAvailable -and
            -not (Test-CircuitOpen -Until $State.geminiUntil)
        ) {
            $Provider = "gemini"
        }

        if (-not $Provider) {
            Save-OfflineCheckpoint -Sequence $Sequence

            $SleepSeconds = 1800 + (
                Get-Random -Minimum 0 -Maximum 181
            )

            Write-AgentLog "No provider available; sleeping $SleepSeconds seconds." "WARN"
            Start-Sleep -Seconds $SleepSeconds
            continue
        }

        $InvocationLog = Join-Path $script:LogDirectory (
            "{0}-{1:D5}-{2}.log" -f `
                $Provider,
                $Sequence,
                (Get-Date -Format "yyyyMMdd-HHmmss")
        )

        Write-AgentLog "Starting provider: $Provider"

        switch ($Provider) {
            "fcc" {
                $Result = Invoke-FccProvider `
                    -Prompt $MissionPrompt `
                    -LogPath $InvocationLog
            }

            "codex-chatgpt" {
                $Result = Invoke-CodexChatGptProvider `
                    -Prompt $MissionPrompt `
                    -LogPath $InvocationLog
            }

            "codex-api" {
                $Result = Invoke-CodexApiProvider `
                    -Prompt $MissionPrompt `
                    -LogPath $InvocationLog
            }

            "gemini" {
                $Result = Invoke-GeminiProvider `
                    -Prompt $MissionPrompt `
                    -LogPath $InvocationLog
            }
        }

        $Text = [string]$Result.Text

        $RateLimited = $Text -match (
            "(?i)(HTTP\s*429|Too Many Requests|rate[_ -]?limit|" +
            "quota.*exceed|usage limit|provider rate limit)"
        )

        $AuthenticationFailure = $Text -match (
            "(?i)(HTTP\s*401|unauthorized|invalid api key|" +
            "not logged in|authentication failed)"
        )

        $TemporaryFailure = $Text -match (
            "(?i)(timeout|temporar|service unavailable|HTTP\s*5\d\d|" +
            "ECONN|ETIMEDOUT|connection reset|overloaded)"
        )

        if (Test-Path -LiteralPath $CompletePath) {
            Write-AgentLog "$Provider created the completion marker." "SUCCESS"
            continue
        }

        $Succeeded = (
            $Result.ExitCode -eq 0 -and
            -not $RateLimited -and
            -not $AuthenticationFailure -and
            -not $TemporaryFailure
        )

        if ($Succeeded) {
            $State.lastProvider = $Provider
            $State.lastSuccess = (Get-Date).ToString("o")

            switch ($Provider) {
                "fcc" {
                    $State.fccFailures = 0
                    $State.fccUntil = $null
                }

                "codex-chatgpt" {
                    $State.chatgptFailures = 0
                    $State.chatgptUntil = $null
                }

                "codex-api" {
                    $State.apiFailures = 0
                    $State.apiUntil = $null
                }

                "gemini" {
                    $State.geminiFailures = 0
                    $State.geminiUntil = $null
                }
            }

            Save-ProviderState -State $State
            Write-AgentLog "$Provider ended normally; continuing." "SUCCESS"
            Start-Sleep -Seconds 10
            continue
        }

        $State.lastProvider = $Provider
        $State.lastFailure = (Get-Date).ToString("o")

        switch ($Provider) {
            "fcc" {
                $State.fccFailures = [int]$State.fccFailures + 1

                if (
                    $RateLimited -and
                    [int]$State.fccFailures -ge $FccFailureThreshold
                ) {
                    $State.fccUntil = (
                        Get-Date
                    ).AddMinutes(
                        $FccCooldownMinutes
                    ).ToString("o")

                    Write-AgentLog "FCC circuit opened for $FccCooldownMinutes minutes." "WARN"
                }
                else {
                    Write-AgentLog "FCC failed; retry or failover follows." "WARN"
                }
            }

            "codex-chatgpt" {
                $State.chatgptFailures = [int]$State.chatgptFailures + 1
                $State.chatgptUntil = (
                    Get-Date
                ).AddMinutes(
                    $ChatGptCooldownMinutes
                ).ToString("o")

                Write-AgentLog "ChatGPT Codex cooling for $ChatGptCooldownMinutes minutes." "WARN"
            }

            "codex-api" {
                $State.apiFailures = [int]$State.apiFailures + 1
                $State.apiUntil = (
                    Get-Date
                ).AddMinutes(
                    $ApiCooldownMinutes
                ).ToString("o")

                Write-AgentLog "Codex API fallback cooling for $ApiCooldownMinutes minutes." "WARN"
            }

            "gemini" {
                $State.geminiFailures = [int]$State.geminiFailures + 1
                $State.geminiUntil = (
                    Get-Date
                ).AddMinutes(
                    $GeminiCooldownMinutes
                ).ToString("o")

                Write-AgentLog "Gemini cooling for $GeminiCooldownMinutes minutes." "WARN"
            }
        }

        Save-ProviderState -State $State
        Write-AgentLog "Provider output: $InvocationLog"

        Start-Sleep -Seconds (
            10 + (Get-Random -Minimum 0 -Maximum 21)
        )
    }
}
finally {
    Remove-Item `
        -LiteralPath $LockPath `
        -Force `
        -ErrorAction SilentlyContinue

    Write-AgentLog "Failover runner stopped."
}