# EUshop Resilient Agent Orchestrator v3
#
# Modes:
#   Install (default) - installs this script into the repository and starts it
#   Run               - runs the provider failover loop
#   Status            - displays active process, provider inventory and cooldowns
#   Stop              - asks the runner to stop and terminates it if necessary
#
# Provider order:
#   1. FCC / NIM
#   2. Codex using ChatGPT login
#   3. Codex using CODEX_API_KEY or OPENAI_API_KEY
#   4. Gemini CLI using its existing login or GEMINI_API_KEY
#   5. GitHub Copilot CLI, when installed and authenticated
#   6. Aider + OpenRouter free router
#   7. Aider + Gemini experimental/free model
#   8. Aider + Groq
#   9. Aider + Cohere
#  10. Aider + other detected provider keys
#  11. Aider + local Ollama
#  12. Offline Git/checkpoint maintenance
#
# Important:
# - User- and Machine-level API keys are never modified or deleted.
# - A provider invocation gets a temporary process-scoped environment.
# - The original process environment is restored after every invocation.
# - Metered API fallbacks are enabled by default because the user requested
#   maximum graceful degradation. They can incur provider charges.
# - The runner never force-pushes, deploys, deletes history or modifies main.

[CmdletBinding()]
param(
    [ValidateSet("Install", "Run", "Status", "Stop")]
    [string]$Mode = "Install",

    [string]$ProjectPath = "D:\CODING\eushop",

    [int]$FccFailureThreshold = 2,
    [int]$FccCooldownMinutes = 120,
    [int]$DefaultCooldownMinutes = 30,

    # Integers deliberately avoid Windows PowerShell's Boolean argument
    # conversion problem across powershell.exe -File boundaries.
    [ValidateSet(0, 1)]
    [int]$EnableMeteredFallback = 1,

    [ValidateSet(0, 1)]
    [int]$AutoInstallAider = 1
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Write-Utf8NoBom {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$Content
    )

    $Parent = Split-Path -Parent $Path

    if ($Parent -and -not (Test-Path -LiteralPath $Parent)) {
        New-Item -ItemType Directory -Path $Parent -Force | Out-Null
    }

    $Encoding = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $Encoding)
}

function Get-EffectiveEnvironmentValue {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    foreach ($Target in @("Process", "User", "Machine")) {
        try {
            $Value = [Environment]::GetEnvironmentVariable($Name, $Target)

            if (-not [string]::IsNullOrWhiteSpace($Value)) {
                return $Value
            }
        }
        catch {
            # A restricted environment may not permit reading every scope.
        }
    }

    return $null
}

function Test-EnvironmentValue {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    return -not [string]::IsNullOrWhiteSpace(
        (Get-EffectiveEnvironmentValue -Name $Name)
    )
}

function Resolve-CommandPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    $Command = Get-Command $Name -ErrorAction SilentlyContinue

    if ($Command) {
        if ($Command.Path) {
            return $Command.Path
        }

        if ($Command.Source) {
            return $Command.Source
        }

        return $Command.Name
    }

    $Candidates = @()

    switch ($Name) {
        "aider" {
            $Candidates += "$env:USERPROFILE\.local\bin\aider.exe"
            $Candidates += "$env:USERPROFILE\.local\bin\aider.cmd"
            $Candidates += Get-ChildItem `
                -Path "$env:APPDATA\Python\Python*\Scripts\aider.exe" `
                -File `
                -ErrorAction SilentlyContinue |
                Select-Object -ExpandProperty FullName
        }

        "aider-install" {
            $Candidates += "$env:USERPROFILE\.local\bin\aider-install.exe"
            $Candidates += Get-ChildItem `
                -Path "$env:APPDATA\Python\Python*\Scripts\aider-install.exe" `
                -File `
                -ErrorAction SilentlyContinue |
                Select-Object -ExpandProperty FullName
        }
    }

    foreach ($Candidate in @($Candidates)) {
        if (
            $Candidate -and
            (Test-Path -LiteralPath $Candidate -PathType Leaf)
        ) {
            return [string]$Candidate
        }
    }

    return $null
}

function Stop-RunnerFromLock {
    param(
        [Parameter(Mandatory = $true)]
        [string]$LockPath
    )

    if (-not (Test-Path -LiteralPath $LockPath)) {
        return
    }

    $RawPid = Get-Content `
        -LiteralPath $LockPath `
        -Raw `
        -ErrorAction SilentlyContinue

    $RunnerPid = 0

    if (
        $RawPid -and
        [int]::TryParse(
            ($RawPid -replace "\D", ""),
            [ref]$RunnerPid
        )
    ) {
        $Process = Get-CimInstance `
            -ClassName Win32_Process `
            -Filter "ProcessId = $RunnerPid" `
            -ErrorAction SilentlyContinue

        if (
            $Process -and
            $Process.CommandLine -match
                "(Invoke-FccNonstop|Invoke-AgentFailover|EUshop-Agent-Orchestrator)"
        ) {
            Write-Host "Stopping old runner PID $RunnerPid..." `
                -ForegroundColor Yellow

            & taskkill.exe /PID $RunnerPid /T /F | Out-Host
            Start-Sleep -Seconds 2
        }
    }

    Remove-Item `
        -LiteralPath $LockPath `
        -Force `
        -ErrorAction SilentlyContinue
}

function Get-CodexLoginStatusText {
    $CodexPath = Resolve-CommandPath -Name "codex"

    if (-not $CodexPath) {
        return "Codex is not installed."
    }

    $PreviousPreference = $ErrorActionPreference

    try {
        # Some Windows Codex builds emit successful status text on stderr.
        $ErrorActionPreference = "Continue"
        return (
            & $CodexPath login status 2>&1 |
            Out-String
        ).Trim()
    }
    catch {
        return ($_ | Out-String).Trim()
    }
    finally {
        $ErrorActionPreference = $PreviousPreference
    }
}

function Install-AiderIfNeeded {
    param(
        [int]$Enabled
    )

    $Existing = Resolve-CommandPath -Name "aider"

    if ($Existing) {
        return $Existing
    }

    if ($Enabled -ne 1) {
        return $null
    }

    $PythonPath = Resolve-CommandPath -Name "python"

    if (-not $PythonPath) {
        Write-Host "Python was not found; Aider fallbacks will be skipped." `
            -ForegroundColor Yellow

        return $null
    }

    Write-Host "Installing Aider through the documented aider-install package..." `
        -ForegroundColor Yellow

    $PreviousPreference = $ErrorActionPreference

    try {
        $ErrorActionPreference = "Continue"

        & $PythonPath -m pip install --user --upgrade aider-install

        $InstallerPath = Resolve-CommandPath -Name "aider-install"

        if ($InstallerPath) {
            & $InstallerPath
        }
    }
    catch {
        Write-Host "Aider installation failed; continuing without it." `
            -ForegroundColor Yellow
    }
    finally {
        $ErrorActionPreference = $PreviousPreference
    }

    return Resolve-CommandPath -Name "aider"
}

function New-ProviderDefinition {
    param(
        [string]$Id,
        [string]$Kind,
        [string]$Command,
        [string[]]$KeyNames,
        [string]$Model,
        [string]$Tier,
        [bool]$Metered,
        [bool]$Enabled
    )

    return [ordered]@{
        id = $Id
        kind = $Kind
        command = $Command
        keyNames = @($KeyNames)
        model = $Model
        tier = $Tier
        metered = $Metered
        enabled = $Enabled
    }
}

function Get-ProviderInventory {
    param(
        [Parameter(Mandatory = $true)]
        [object]$Configuration
    )

    $Rows = foreach ($Provider in $Configuration.providers) {
        $KeyFound = $false
        $KeyNameFound = $null

        foreach ($KeyName in @($Provider.keyNames)) {
            if (Test-EnvironmentValue -Name $KeyName) {
                $KeyFound = $true
                $KeyNameFound = $KeyName
                break
            }
        }

        $CommandAvailable = $false

        if ($Provider.command) {
            $ConfiguredPath = $Configuration.commandPaths.PSObject.Properties[
                [string]$Provider.command
            ]

            if ($ConfiguredPath -and $ConfiguredPath.Value) {
                $CommandAvailable = Test-Path `
                    -LiteralPath $ConfiguredPath.Value `
                    -PathType Leaf
            }

            if (-not $CommandAvailable) {
                $CommandAvailable = $null -ne (
                    Resolve-CommandPath -Name $Provider.command
                )
            }
        }
        else {
            $CommandAvailable = $true
        }

        [PSCustomObject]@{
            Order = [array]::IndexOf($Configuration.providers, $Provider) + 1
            Provider = $Provider.id
            Tier = $Provider.tier
            Enabled = [bool]$Provider.enabled
            Command = if ($CommandAvailable) { "available" } else { "missing" }
            Credential = if (@($Provider.keyNames).Count -eq 0) {
                "cached/login/local"
            }
            elseif ($KeyFound) {
                "present: $KeyNameFound"
            }
            else {
                "not detected"
            }
            Model = if ($Provider.model) { $Provider.model } else { "auto" }
        }
    }

    return $Rows
}

function Install-Orchestrator {
    if (-not (Test-Path -LiteralPath $ProjectPath -PathType Container)) {
        throw "EUshop repository not found: $ProjectPath"
    }

    Set-Location -LiteralPath $ProjectPath

    if (-not (Test-Path -LiteralPath ".git")) {
        throw "The project path is not a Git repository: $ProjectPath"
    }

    $ClaudeDirectory = Join-Path $ProjectPath ".claude"
    $ScriptsDirectory = Join-Path $ProjectPath "scripts"
    $InstalledPath = Join-Path $ScriptsDirectory "EUshop-Agent-Orchestrator.ps1"
    $ConfigurationPath = Join-Path $ClaudeDirectory "agent-failover-config.json"
    $ProviderStatePath = Join-Path $ClaudeDirectory "provider-state-v3.json"
    $PromptPath = Join-Path $ClaudeDirectory "ORCHESTRATOR_PROMPT.md"
    $StopPath = Join-Path $ClaudeDirectory "AUTONOMOUS_STOP"
    $Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

    New-Item -ItemType Directory -Path $ClaudeDirectory -Force | Out-Null
    New-Item -ItemType Directory -Path $ScriptsDirectory -Force | Out-Null

    Stop-RunnerFromLock `
        -LockPath (Join-Path $ClaudeDirectory "AUTONOMOUS_RUNNER.lock")

    Stop-RunnerFromLock `
        -LockPath (Join-Path $ClaudeDirectory "AGENT_FAILOVER.lock")

    if (
        (Test-Path -LiteralPath $InstalledPath) -and
        ($PSCommandPath -ne $InstalledPath)
    ) {
        Copy-Item `
            -LiteralPath $InstalledPath `
            -Destination "$InstalledPath.backup-$Timestamp" `
            -Force
    }

    if (Test-Path -LiteralPath $ConfigurationPath) {
        Copy-Item `
            -LiteralPath $ConfigurationPath `
            -Destination "$ConfigurationPath.backup-$Timestamp" `
            -Force
    }

    if (Test-Path -LiteralPath $ProviderStatePath) {
        Copy-Item `
            -LiteralPath $ProviderStatePath `
            -Destination "$ProviderStatePath.backup-$Timestamp" `
            -Force
    }

    if ($PSCommandPath -ne $InstalledPath) {
        Copy-Item `
            -LiteralPath $PSCommandPath `
            -Destination $InstalledPath `
            -Force
    }

    $FreeAiderKeys = @(
        "OPENROUTER_API_KEY",
        "GEMINI_API_KEY",
        "GROQ_API_KEY",
        "COHERE_API_KEY"
    )

    $AnyAiderKey = $false

    foreach ($KeyName in $FreeAiderKeys) {
        if (Test-EnvironmentValue -Name $KeyName) {
            $AnyAiderKey = $true
            break
        }
    }

    $AiderPath = Resolve-CommandPath -Name "aider"

    if (-not $AiderPath -and $AnyAiderKey) {
        $AiderPath = Install-AiderIfNeeded -Enabled $AutoInstallAider
    }

    $CommandPaths = [ordered]@{
        "fcc-work" = Resolve-CommandPath -Name "fcc-work"
        "codex" = Resolve-CommandPath -Name "codex"
        "gemini" = Resolve-CommandPath -Name "gemini"
        "copilot" = Resolve-CommandPath -Name "copilot"
        "aider" = $AiderPath
        "ollama" = Resolve-CommandPath -Name "ollama"
    }

    $OllamaModel = Get-EffectiveEnvironmentValue `
        -Name "EUSHOP_OLLAMA_MODEL"

    $Providers = @(
        (New-ProviderDefinition `
            -Id "fcc" `
            -Kind "fcc" `
            -Command "fcc-work" `
            -KeyNames @() `
            -Model $null `
            -Tier "primary/free-wrapper" `
            -Metered $false `
            -Enabled $true),

        (New-ProviderDefinition `
            -Id "codex-chatgpt" `
            -Kind "codex-chatgpt" `
            -Command "codex" `
            -KeyNames @() `
            -Model $null `
            -Tier "subscription" `
            -Metered $false `
            -Enabled $true),

        (New-ProviderDefinition `
            -Id "codex-api" `
            -Kind "codex-api" `
            -Command "codex" `
            -KeyNames @("CODEX_API_KEY", "OPENAI_API_KEY") `
            -Model $null `
            -Tier "metered-api" `
            -Metered $true `
            -Enabled ($EnableMeteredFallback -eq 1)),

        (New-ProviderDefinition `
            -Id "gemini-cli" `
            -Kind "gemini-cli" `
            -Command "gemini" `
            -KeyNames @("GEMINI_API_KEY", "GOOGLE_API_KEY") `
            -Model $null `
            -Tier "oauth-or-api/free-tier-possible" `
            -Metered $false `
            -Enabled $true),

        (New-ProviderDefinition `
            -Id "copilot-cli" `
            -Kind "copilot-cli" `
            -Command "copilot" `
            -KeyNames @() `
            -Model $null `
            -Tier "subscription-or-free-plan" `
            -Metered $false `
            -Enabled $true),

        (New-ProviderDefinition `
            -Id "openrouter-free-aider" `
            -Kind "aider-key" `
            -Command "aider" `
            -KeyNames @("OPENROUTER_API_KEY") `
            -Model "openrouter/openrouter/free" `
            -Tier "free-api" `
            -Metered $false `
            -Enabled $true),

        (New-ProviderDefinition `
            -Id "gemini-exp-aider" `
            -Kind "aider-key" `
            -Command "aider" `
            -KeyNames @("GEMINI_API_KEY") `
            -Model "gemini-exp" `
            -Tier "free-api-with-limits" `
            -Metered $false `
            -Enabled $true),

        (New-ProviderDefinition `
            -Id "groq-aider" `
            -Kind "aider-key" `
            -Command "aider" `
            -KeyNames @("GROQ_API_KEY") `
            -Model $null `
            -Tier "free-api-with-limits" `
            -Metered $false `
            -Enabled $true),

        (New-ProviderDefinition `
            -Id "cohere-aider" `
            -Kind "aider-key" `
            -Command "aider" `
            -KeyNames @("COHERE_API_KEY") `
            -Model $null `
            -Tier "free-api-with-limits" `
            -Metered $false `
            -Enabled $true),

        (New-ProviderDefinition `
            -Id "ollama-local-aider" `
            -Kind "aider-ollama" `
            -Command "aider" `
            -KeyNames @() `
            -Model $OllamaModel `
            -Tier "local/offline" `
            -Metered $false `
            -Enabled $true),

        (New-ProviderDefinition `
            -Id "deepseek-aider" `
            -Kind "aider-key" `
            -Command "aider" `
            -KeyNames @("DEEPSEEK_API_KEY") `
            -Model "deepseek/deepseek-chat" `
            -Tier "metered-or-credit-dependent" `
            -Metered $true `
            -Enabled ($EnableMeteredFallback -eq 1)),

        (New-ProviderDefinition `
            -Id "anthropic-aider" `
            -Kind "aider-key" `
            -Command "aider" `
            -KeyNames @("ANTHROPIC_API_KEY") `
            -Model $null `
            -Tier "metered-api" `
            -Metered $true `
            -Enabled ($EnableMeteredFallback -eq 1)),

        (New-ProviderDefinition `
            -Id "xai-aider" `
            -Kind "aider-key" `
            -Command "aider" `
            -KeyNames @("XAI_API_KEY") `
            -Model $null `
            -Tier "metered-or-credit-dependent" `
            -Metered $true `
            -Enabled ($EnableMeteredFallback -eq 1)),

        (New-ProviderDefinition `
            -Id "mistral-aider" `
            -Kind "aider-key" `
            -Command "aider" `
            -KeyNames @("MISTRAL_API_KEY", "CODESTRAL_API_KEY") `
            -Model $null `
            -Tier "metered-or-credit-dependent" `
            -Metered $true `
            -Enabled ($EnableMeteredFallback -eq 1)),

        (New-ProviderDefinition `
            -Id "cerebras-aider" `
            -Kind "aider-key" `
            -Command "aider" `
            -KeyNames @("CEREBRAS_API_KEY") `
            -Model $null `
            -Tier "free-trial-or-metered" `
            -Metered $true `
            -Enabled ($EnableMeteredFallback -eq 1)),

        (New-ProviderDefinition `
            -Id "sambanova-aider" `
            -Kind "aider-key" `
            -Command "aider" `
            -KeyNames @("SAMBANOVA_API_KEY") `
            -Model $null `
            -Tier "free-trial-or-metered" `
            -Metered $true `
            -Enabled ($EnableMeteredFallback -eq 1)),

        (New-ProviderDefinition `
            -Id "nvidia-nim-aider" `
            -Kind "aider-key" `
            -Command "aider" `
            -KeyNames @("NVIDIA_NIM_API_KEY") `
            -Model $null `
            -Tier "free-credits-or-metered" `
            -Metered $true `
            -Enabled ($EnableMeteredFallback -eq 1)),

        (New-ProviderDefinition `
            -Id "fireworks-aider" `
            -Kind "aider-key" `
            -Command "aider" `
            -KeyNames @(
                "FIREWORKS_API_KEY",
                "FIREWORKS_AI_API_KEY",
                "FIREWORKSAI_API_KEY"
            ) `
            -Model $null `
            -Tier "free-trial-or-metered" `
            -Metered $true `
            -Enabled ($EnableMeteredFallback -eq 1)),

        (New-ProviderDefinition `
            -Id "together-aider" `
            -Kind "aider-key" `
            -Command "aider" `
            -KeyNames @("TOGETHERAI_API_KEY") `
            -Model $null `
            -Tier "free-trial-or-metered" `
            -Metered $true `
            -Enabled ($EnableMeteredFallback -eq 1)),

        (New-ProviderDefinition `
            -Id "moonshot-aider" `
            -Kind "aider-key" `
            -Command "aider" `
            -KeyNames @("MOONSHOT_API_KEY") `
            -Model $null `
            -Tier "metered-or-credit-dependent" `
            -Metered $true `
            -Enabled ($EnableMeteredFallback -eq 1))
    )

    $Configuration = [ordered]@{
        version = 3
        projectPath = $ProjectPath
        fccFailureThreshold = $FccFailureThreshold
        fccCooldownMinutes = $FccCooldownMinutes
        defaultCooldownMinutes = $DefaultCooldownMinutes
        enableMeteredFallback = ($EnableMeteredFallback -eq 1)
        commandPaths = $CommandPaths
        providers = $Providers
        knownProviderKeyNames = @(
            "OPENAI_API_KEY",
            "CODEX_API_KEY",
            "ANTHROPIC_API_KEY",
            "ANTHROPIC_AUTH_TOKEN",
            "GEMINI_API_KEY",
            "GOOGLE_API_KEY",
            "OPENROUTER_API_KEY",
            "GROQ_API_KEY",
            "COHERE_API_KEY",
            "DEEPSEEK_API_KEY",
            "XAI_API_KEY",
            "MISTRAL_API_KEY",
            "CODESTRAL_API_KEY",
            "CEREBRAS_API_KEY",
            "SAMBANOVA_API_KEY",
            "NVIDIA_NIM_API_KEY",
            "FIREWORKS_API_KEY",
            "FIREWORKS_AI_API_KEY",
            "FIREWORKSAI_API_KEY",
            "TOGETHERAI_API_KEY",
            "MOONSHOT_API_KEY",
            "HUGGINGFACE_API_KEY",
            "REPLICATE_API_KEY",
            "DASHSCOPE_API_KEY",
            "PERPLEXITYAI_API_KEY",
            "AZURE_OPENAI_API_KEY"
        )
    }

    Write-Utf8NoBom `
        -Path $ConfigurationPath `
        -Content ($Configuration | ConvertTo-Json -Depth 30)

    $State = [ordered]@{
        version = 3
        providers = @()
        lastProvider = $null
        lastSuccess = $null
        lastFailure = $null
    }

    Write-Utf8NoBom `
        -Path $ProviderStatePath `
        -Content ($State | ConvertTo-Json -Depth 20)

    $Prompt = @"
# EUshop autonomous continuation mission

Continue the existing EUshop repository archaeology, historical-version
recovery, version catalogue, navigation, unified integration, validation,
truthfulness audit and professional improvement mission.

At the beginning of every invocation:

1. Read `CLAUDE.md`.
2. Read `.claude/AUTONOMY.md`.
3. Read `.claude/RECOVERY_STATE.md`.
4. Inspect the current branch, HEAD, status, recent commits, worktrees,
   recovery directories, reports and generated artifacts.
5. Resume the exact first unfinished checkpoint.
6. Do not recreate verified backups or repeat completed work.

Continuity rules:

- Work autonomously for as long as the invocation permits.
- Update `.claude/RECOVERY_STATE.md` frequently and before ending.
- If a command, tool, dependency, test, provider, network request or method
  fails, classify the failure, checkpoint it, choose a safe fallback and
  continue with independent work.
- Prefer small, verifiable and idempotent steps.
- Do not ask for routine approval or ask the user what to do next.
- Preserve and commit coherent progress on a non-main branch.
- Keep `main` untouched.
- Never force-push, deploy, delete history, reveal secrets, spend money
  deliberately, or modify external accounts.
- API-provider usage may already be authorized by the orchestrator, but never
  print, copy, expose or commit an API key.
- Create `.claude/AUTONOMOUS_COMPLETE` only after every acceptance criterion
  from the main mission is genuinely complete.
- If `.claude/AUTONOMOUS_STOP` exists, checkpoint and stop cleanly.

The active model provider may change between invocations. Git state,
repository files and checkpoint files are the source of truth.
"@

    Write-Utf8NoBom -Path $PromptPath -Content $Prompt

    Remove-Item `
        -LiteralPath $StopPath `
        -Force `
        -ErrorAction SilentlyContinue

    Write-Host ""
    Write-Host "=== EUshop resilient orchestrator installed ===" `
        -ForegroundColor Green

    Write-Host "Installed script: $InstalledPath" -ForegroundColor Cyan
    Write-Host "Configuration:    $ConfigurationPath" -ForegroundColor Cyan
    Write-Host "Provider state:   $ProviderStatePath" -ForegroundColor Cyan
    Write-Host "Prompt:           $PromptPath" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "Provider inventory:" -ForegroundColor Cyan

    Get-ProviderInventory -Configuration (
        Get-Content -LiteralPath $ConfigurationPath -Raw |
        ConvertFrom-Json
    ) | Format-Table -AutoSize

    Write-Host ""
    Write-Host "Codex status: $(Get-CodexLoginStatusText)" `
        -ForegroundColor Cyan

    if ($EnableMeteredFallback -eq 1) {
        Write-Host ""
        Write-Host "Metered API fallback is enabled and may incur charges." `
            -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "Starting the orchestrator..." -ForegroundColor Green

    & powershell.exe `
        -NoLogo `
        -NoProfile `
        -ExecutionPolicy Bypass `
        -File $InstalledPath `
        -Mode Run `
        -ProjectPath $ProjectPath
}

function Save-EnvironmentSnapshot {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Names
    )

    $Snapshot = @{}

    foreach ($Name in $Names) {
        $Exists = Test-Path "Env:$Name"

        $Snapshot[$Name] = [PSCustomObject]@{
            Exists = $Exists
            Value = if ($Exists) {
                [Environment]::GetEnvironmentVariable($Name, "Process")
            }
            else {
                $null
            }
        }
    }

    return $Snapshot
}

function Restore-EnvironmentSnapshot {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Snapshot
    )

    foreach ($Name in $Snapshot.Keys) {
        if ($Snapshot[$Name].Exists) {
            [Environment]::SetEnvironmentVariable(
                $Name,
                [string]$Snapshot[$Name].Value,
                "Process"
            )
        }
        else {
            Remove-Item "Env:$Name" -ErrorAction SilentlyContinue
        }
    }
}

function Invoke-WithScopedEnvironment {
    param(
        [Parameter(Mandatory = $true)]
        [hashtable]$Overrides,

        [Parameter(Mandatory = $true)]
        [scriptblock]$Action
    )

    $Names = @($Overrides.Keys)
    $Snapshot = Save-EnvironmentSnapshot -Names $Names

    try {
        foreach ($Name in $Names) {
            $Value = $Overrides[$Name]

            if ($null -eq $Value) {
                Remove-Item "Env:$Name" -ErrorAction SilentlyContinue
            }
            else {
                [Environment]::SetEnvironmentVariable(
                    $Name,
                    [string]$Value,
                    "Process"
                )
            }
        }

        return & $Action
    }
    finally {
        Restore-EnvironmentSnapshot -Snapshot $Snapshot
    }
}

function Write-AgentLog {
    param(
        [string]$Message,

        [ValidateSet("INFO", "WARN", "ERROR", "SUCCESS")]
        [string]$Level = "INFO"
    )

    $Line = "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')][$Level] $Message"
    Add-Content -LiteralPath $script:MainLogPath -Value $Line

    switch ($Level) {
        "WARN" {
            Write-Host $Line -ForegroundColor Yellow
        }

        "ERROR" {
            Write-Host $Line -ForegroundColor Red
        }

        "SUCCESS" {
            Write-Host $Line -ForegroundColor Green
        }

        default {
            Write-Host $Line
        }
    }
}

function Load-Configuration {
    return Get-Content `
        -LiteralPath $script:ConfigurationPath `
        -Raw |
        ConvertFrom-Json
}

function Load-ProviderState {
    try {
        return Get-Content `
            -LiteralPath $script:ProviderStatePath `
            -Raw |
            ConvertFrom-Json
    }
    catch {
        return [PSCustomObject]@{
            version = 3
            providers = @()
            lastProvider = $null
            lastSuccess = $null
            lastFailure = $null
        }
    }
}

function Save-ProviderState {
    param(
        [Parameter(Mandatory = $true)]
        [object]$State
    )

    Write-Utf8NoBom `
        -Path $script:ProviderStatePath `
        -Content ($State | ConvertTo-Json -Depth 20)
}

function Get-OrCreateProviderState {
    param(
        [Parameter(Mandatory = $true)]
        [object]$State,

        [Parameter(Mandatory = $true)]
        [string]$Id
    )

    $Existing = @(
        $State.providers |
        Where-Object { $_.id -eq $Id }
    ) | Select-Object -First 1

    if ($Existing) {
        return $Existing
    }

    $NewState = [PSCustomObject]@{
        id = $Id
        failures = 0
        circuitUntil = $null
        lastResult = $null
    }

    $State.providers = @($State.providers) + $NewState
    return $NewState
}

function Test-CircuitOpen {
    param(
        $Until
    )

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

function Get-ConfiguredCommandPath {
    param(
        [Parameter(Mandatory = $true)]
        [object]$Configuration,

        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    $Property = $Configuration.commandPaths.PSObject.Properties[$Name]

    if (
        $Property -and
        $Property.Value -and
        (Test-Path -LiteralPath $Property.Value -PathType Leaf)
    ) {
        return [string]$Property.Value
    }

    return Resolve-CommandPath -Name $Name
}

function Get-ProviderKey {
    param(
        [Parameter(Mandatory = $true)]
        [object]$Provider
    )

    foreach ($Name in @($Provider.keyNames)) {
        $Value = Get-EffectiveEnvironmentValue -Name $Name

        if (-not [string]::IsNullOrWhiteSpace($Value)) {
            return [PSCustomObject]@{
                Name = $Name
                Value = $Value
            }
        }
    }

    return $null
}

function Invoke-CapturedCommand {
    param(
        [Parameter(Mandatory = $true)]
        [scriptblock]$Action,

        [Parameter(Mandatory = $true)]
        [string]$LogPath
    )

    $PreviousPreference = $ErrorActionPreference
    $Output = @()
    $ExitCode = 1

    try {
        $ErrorActionPreference = "Continue"

        $Output = & $Action 2>&1 |
            Tee-Object -FilePath $LogPath

        if ($null -eq $LASTEXITCODE) {
            $ExitCode = 0
        }
        else {
            $ExitCode = $LASTEXITCODE
        }
    }
    catch {
        $Text = $_ | Out-String
        $Output += $Text
        Add-Content -LiteralPath $LogPath -Value $Text
        $ExitCode = 1
    }
    finally {
        $ErrorActionPreference = $PreviousPreference
    }

    return [PSCustomObject]@{
        ExitCode = $ExitCode
        Text = ($Output | Out-String)
    }
}

function Get-IsolatedAiderEnvironment {
    param(
        [Parameter(Mandatory = $true)]
        [object]$Configuration,

        [string]$SelectedKeyName,

        [string]$SelectedKeyValue
    )

    $Overrides = @{}

    foreach ($Name in @($Configuration.knownProviderKeyNames)) {
        $Overrides[[string]$Name] = $null
    }

    if (
        $SelectedKeyName -and
        -not [string]::IsNullOrWhiteSpace($SelectedKeyValue)
    ) {
        $Overrides[$SelectedKeyName] = $SelectedKeyValue
    }

    $Overrides["AIDER_ANALYTICS"] = "false"
    $Overrides["AIDER_CHECK_UPDATE"] = "false"
    $Overrides["AIDER_YES_ALWAYS"] = "true"

    return $Overrides
}

function Get-OllamaModel {
    param(
        [string]$OllamaPath,
        [string]$ConfiguredModel
    )

    if (-not [string]::IsNullOrWhiteSpace($ConfiguredModel)) {
        return $ConfiguredModel
    }

    if (-not $OllamaPath) {
        return $null
    }

    $PreviousPreference = $ErrorActionPreference

    try {
        $ErrorActionPreference = "Continue"

        $Lines = & $OllamaPath list 2>$null |
            Select-Object -Skip 1

        $Names = foreach ($Line in $Lines) {
            $Text = [string]$Line

            if (-not [string]::IsNullOrWhiteSpace($Text)) {
                ($Text -split "\s+")[0]
            }
        }

        $Preferred = @(
            $Names |
            Where-Object {
                $_ -match "(?i)(coder|qwen|deepseek|codestral|starcoder)"
            }
        ) | Select-Object -First 1

        if ($Preferred) {
            return $Preferred
        }

        return @($Names) | Select-Object -First 1
    }
    finally {
        $ErrorActionPreference = $PreviousPreference
    }
}

function Invoke-Provider {
    param(
        [Parameter(Mandatory = $true)]
        [object]$Provider,

        [Parameter(Mandatory = $true)]
        [object]$Configuration,

        [Parameter(Mandatory = $true)]
        [string]$Prompt,

        [Parameter(Mandatory = $true)]
        [string]$LogPath
    )

    switch ([string]$Provider.kind) {
        "fcc" {
            $Path = Get-ConfiguredCommandPath `
                -Configuration $Configuration `
                -Name "fcc-work"

            return Invoke-CapturedCommand `
                -LogPath $LogPath `
                -Action {
                    $Prompt | & $Path
                }
        }

        "codex-chatgpt" {
            $Path = Get-ConfiguredCommandPath `
                -Configuration $Configuration `
                -Name "codex"

            $Overrides = @{
                CODEX_API_KEY = $null
                OPENAI_API_KEY = $null
                OPENAI_BASE_URL = $null
            }

            return Invoke-WithScopedEnvironment `
                -Overrides $Overrides `
                -Action {
                    Invoke-CapturedCommand `
                        -LogPath $LogPath `
                        -Action {
                            $Prompt |
                                & $Path exec `
                                    --dangerously-bypass-approvals-and-sandbox `
                                    -C $ProjectPath `
                                    -
                        }
                }
        }

        "codex-api" {
            $Path = Get-ConfiguredCommandPath `
                -Configuration $Configuration `
                -Name "codex"

            $Credential = Get-ProviderKey -Provider $Provider

            if (-not $Credential) {
                return [PSCustomObject]@{
                    ExitCode = 2
                    Text = "No Codex API key was detected."
                }
            }

            $ApiHome = Join-Path $ProjectPath ".claude\codex-api-home"
            New-Item -ItemType Directory -Path $ApiHome -Force | Out-Null

            $Overrides = @{
                CODEX_API_KEY = $Credential.Value
                CODEX_HOME = $ApiHome
            }

            return Invoke-WithScopedEnvironment `
                -Overrides $Overrides `
                -Action {
                    Invoke-CapturedCommand `
                        -LogPath $LogPath `
                        -Action {
                            $Prompt |
                                & $Path exec `
                                    --dangerously-bypass-approvals-and-sandbox `
                                    -C $ProjectPath `
                                    -
                        }
                }
        }

        "gemini-cli" {
            $Path = Get-ConfiguredCommandPath `
                -Configuration $Configuration `
                -Name "gemini"

            $Credential = Get-ProviderKey -Provider $Provider
            $Overrides = @{
                GEMINI_CLI_TRUST_WORKSPACE = "true"
            }

            if ($Credential) {
                $Overrides[$Credential.Name] = $Credential.Value
            }

            return Invoke-WithScopedEnvironment `
                -Overrides $Overrides `
                -Action {
                    Invoke-CapturedCommand `
                        -LogPath $LogPath `
                        -Action {
                            & $Path `
                                --approval-mode=yolo `
                                --skip-trust `
                                --sandbox=false `
                                --output-format=text `
                                -p $Prompt
                        }
                }
        }

        "copilot-cli" {
            $Path = Get-ConfiguredCommandPath `
                -Configuration $Configuration `
                -Name "copilot"

            return Invoke-CapturedCommand `
                -LogPath $LogPath `
                -Action {
                    & $Path `
                        --autopilot `
                        --yolo `
                        --max-autopilot-continues 20 `
                        -p $Prompt
                }
        }

        "aider-key" {
            $Path = Get-ConfiguredCommandPath `
                -Configuration $Configuration `
                -Name "aider"

            $Credential = Get-ProviderKey -Provider $Provider

            if (-not $Credential) {
                return [PSCustomObject]@{
                    ExitCode = 2
                    Text = "No credential detected for $($Provider.id)."
                }
            }

            $Overrides = Get-IsolatedAiderEnvironment `
                -Configuration $Configuration `
                -SelectedKeyName $Credential.Name `
                -SelectedKeyValue $Credential.Value

            $Arguments = @(
                "--message-file",
                $script:PromptPath,
                "--yes-always",
                "--no-pretty",
                "--no-stream",
                "--disable-playwright",
                "--read",
                (Join-Path $ProjectPath "CLAUDE.md"),
                "--read",
                (Join-Path $ProjectPath ".claude\AUTONOMY.md"),
                "--read",
                (Join-Path $ProjectPath ".claude\RECOVERY_STATE.md")
            )

            if (-not [string]::IsNullOrWhiteSpace($Provider.model)) {
                $Arguments += @("--model", [string]$Provider.model)
            }

            return Invoke-WithScopedEnvironment `
                -Overrides $Overrides `
                -Action {
                    Invoke-CapturedCommand `
                        -LogPath $LogPath `
                        -Action {
                            & $Path @Arguments
                        }
                }
        }

        "aider-ollama" {
            $AiderPath = Get-ConfiguredCommandPath `
                -Configuration $Configuration `
                -Name "aider"

            $OllamaPath = Get-ConfiguredCommandPath `
                -Configuration $Configuration `
                -Name "ollama"

            $Model = Get-OllamaModel `
                -OllamaPath $OllamaPath `
                -ConfiguredModel ([string]$Provider.model)

            if (-not $Model) {
                return [PSCustomObject]@{
                    ExitCode = 2
                    Text = "No local Ollama model was detected."
                }
            }

            $Overrides = Get-IsolatedAiderEnvironment `
                -Configuration $Configuration

            $Overrides["OLLAMA_API_BASE"] = "http://127.0.0.1:11434"

            return Invoke-WithScopedEnvironment `
                -Overrides $Overrides `
                -Action {
                    Invoke-CapturedCommand `
                        -LogPath $LogPath `
                        -Action {
                            & $AiderPath `
                                --model "ollama_chat/$Model" `
                                --message-file $script:PromptPath `
                                --yes-always `
                                --no-pretty `
                                --no-stream `
                                --disable-playwright `
                                --read (Join-Path $ProjectPath "CLAUDE.md") `
                                --read (Join-Path $ProjectPath ".claude\AUTONOMY.md") `
                                --read (
                                    Join-Path `
                                        $ProjectPath `
                                        ".claude\RECOVERY_STATE.md"
                                )
                        }
                }
        }

        default {
            return [PSCustomObject]@{
                ExitCode = 2
                Text = "Unsupported provider kind: $($Provider.kind)"
            }
        }
    }
}

function Test-ProviderAvailable {
    param(
        [Parameter(Mandatory = $true)]
        [object]$Provider,

        [Parameter(Mandatory = $true)]
        [object]$Configuration
    )

    if (-not [bool]$Provider.enabled) {
        return $false
    }

    $CommandPath = Get-ConfiguredCommandPath `
        -Configuration $Configuration `
        -Name ([string]$Provider.command)

    if (-not $CommandPath) {
        return $false
    }

    switch ([string]$Provider.kind) {
        "codex-chatgpt" {
            return (Get-CodexLoginStatusText) -match
                "Logged in using ChatGPT"
        }

        "codex-api" {
            return $null -ne (Get-ProviderKey -Provider $Provider)
        }

        "aider-key" {
            return $null -ne (Get-ProviderKey -Provider $Provider)
        }

        "aider-ollama" {
            $OllamaPath = Get-ConfiguredCommandPath `
                -Configuration $Configuration `
                -Name "ollama"

            return $null -ne $OllamaPath
        }

        default {
            return $true
        }
    }
}

function Save-OfflineCheckpoint {
    param(
        [int]$Sequence
    )

    $Path = Join-Path $script:LogDirectory (
        "offline-{0:D5}-{1}.log" -f `
            $Sequence,
            (Get-Date -Format "yyyyMMdd-HHmmss")
    )

    $Lines = @(
        "Offline graceful-degradation checkpoint",
        "Generated: $((Get-Date).ToString('o'))",
        "",
        "Branch:",
        (& git branch --show-current 2>&1 | Out-String),
        "",
        "HEAD:",
        (& git rev-parse HEAD 2>&1 | Out-String),
        "",
        "Status:",
        (& git status --short --branch 2>&1 | Out-String),
        "",
        "Diff check:",
        (& git diff --check 2>&1 | Out-String),
        "",
        "Recovery checkpoint tail:"
    )

    if (Test-Path -LiteralPath $script:RecoveryStatePath) {
        $Lines += (
            Get-Content `
                -LiteralPath $script:RecoveryStatePath `
                -Tail 100 |
                Out-String
        )
    }
    else {
        $Lines += "RECOVERY_STATE.md was not found."
    }

    $Lines | Set-Content -LiteralPath $Path -Encoding UTF8

    Write-AgentLog `
        -Message "No AI provider is currently usable; saved $Path" `
        -Level "WARN"
}

function Run-Orchestrator {
    if (-not (Test-Path -LiteralPath $ProjectPath -PathType Container)) {
        throw "EUshop repository not found: $ProjectPath"
    }

    Set-Location -LiteralPath $ProjectPath

    $ClaudeDirectory = Join-Path $ProjectPath ".claude"
    $script:ConfigurationPath = Join-Path `
        $ClaudeDirectory `
        "agent-failover-config.json"

    $script:ProviderStatePath = Join-Path `
        $ClaudeDirectory `
        "provider-state-v3.json"

    $script:PromptPath = Join-Path `
        $ClaudeDirectory `
        "ORCHESTRATOR_PROMPT.md"

    $script:RecoveryStatePath = Join-Path `
        $ClaudeDirectory `
        "RECOVERY_STATE.md"

    $script:LogDirectory = Join-Path `
        $ClaudeDirectory `
        "agent-failover-logs-v3"

    $CompletePath = Join-Path `
        $ClaudeDirectory `
        "AUTONOMOUS_COMPLETE"

    $StopPath = Join-Path `
        $ClaudeDirectory `
        "AUTONOMOUS_STOP"

    $LockPath = Join-Path `
        $ClaudeDirectory `
        "AGENT_FAILOVER.lock"

    New-Item `
        -ItemType Directory `
        -Path $script:LogDirectory `
        -Force |
        Out-Null

    $script:MainLogPath = Join-Path $script:LogDirectory (
        "orchestrator-{0}.log" -f (
            Get-Date -Format "yyyyMMdd-HHmmss"
        )
    )

    if (-not (Test-Path -LiteralPath $script:ConfigurationPath)) {
        throw "Provider configuration is missing. Run Install mode first."
    }

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
            if (
                Get-Process `
                    -Id $ExistingPid `
                    -ErrorAction SilentlyContinue
            ) {
                throw "Another failover runner is active with PID $ExistingPid."
            }
        }

        Remove-Item `
            -LiteralPath $LockPath `
            -Force `
            -ErrorAction SilentlyContinue
    }

    Set-Content -LiteralPath $LockPath -Value $PID -NoNewline

    $Configuration = Load-Configuration
    $Prompt = Get-Content -LiteralPath $script:PromptPath -Raw
    $Sequence = 0

    try {
        Write-AgentLog "EUshop resilient provider orchestrator started."
        $EnabledProviderOrder = @(
            $Configuration.providers |
            Where-Object { $_.enabled } |
            ForEach-Object { $_.id }
        ) -join " -> "

        Write-AgentLog ("Order: " + $EnabledProviderOrder)

        Write-AgentLog `
            -Message (
                "Metered fallback enabled: " +
                [string]$Configuration.enableMeteredFallback
            ) `
            -Level "WARN"

        while ($true) {
            if (Test-Path -LiteralPath $StopPath) {
                Write-AgentLog "Stop marker detected." "WARN"
                break
            }

            if (Test-Path -LiteralPath $CompletePath) {
                Write-AgentLog "Mission completion marker detected." "SUCCESS"
                Get-Content `
                    -LiteralPath $CompletePath `
                    -ErrorAction SilentlyContinue
                break
            }

            $Sequence++
            $State = Load-ProviderState
            $SelectedProvider = $null

            foreach ($Provider in $Configuration.providers) {
                $ProviderState = Get-OrCreateProviderState `
                    -State $State `
                    -Id ([string]$Provider.id)

                if (
                    -not (Test-CircuitOpen -Until $ProviderState.circuitUntil) -and
                    (Test-ProviderAvailable `
                        -Provider $Provider `
                        -Configuration $Configuration)
                ) {
                    $SelectedProvider = $Provider
                    break
                }
            }

            if (-not $SelectedProvider) {
                Save-ProviderState -State $State
                Save-OfflineCheckpoint -Sequence $Sequence

                $SleepSeconds = 1800 + (
                    Get-Random -Minimum 0 -Maximum 181
                )

                Write-AgentLog `
                    "All providers are unavailable or cooling down. Sleeping $SleepSeconds seconds." `
                    "WARN"

                Start-Sleep -Seconds $SleepSeconds
                continue
            }

            $ProviderState = Get-OrCreateProviderState `
                -State $State `
                -Id ([string]$SelectedProvider.id)

            $InvocationLog = Join-Path $script:LogDirectory (
                "{0}-{1:D5}-{2}.log" -f `
                    $SelectedProvider.id,
                    $Sequence,
                    (Get-Date -Format "yyyyMMdd-HHmmss")
            )

            Write-AgentLog "Starting provider: $($SelectedProvider.id)"

            $Result = Invoke-Provider `
                -Provider $SelectedProvider `
                -Configuration $Configuration `
                -Prompt $Prompt `
                -LogPath $InvocationLog

            $Text = [string]$Result.Text

            $RateLimited = $Text -match (
                "(?i)(HTTP\s*429|Too Many Requests|rate[_ -]?limit|" +
                "quota.*exceed|usage limit|provider rate limit)"
            )

            $AuthenticationFailure = $Text -match (
                "(?i)(HTTP\s*401|unauthorized|invalid api key|" +
                "not logged in|authentication failed|forbidden)"
            )

            $TemporaryFailure = $Text -match (
                "(?i)(timeout|temporar|service unavailable|HTTP\s*5\d\d|" +
                "ECONN|ETIMEDOUT|connection reset|connection refused|" +
                "overloaded)"
            )

            if (Test-Path -LiteralPath $CompletePath) {
                Write-AgentLog `
                    "$($SelectedProvider.id) created the completion marker." `
                    "SUCCESS"

                continue
            }

            $Succeeded = (
                $Result.ExitCode -eq 0 -and
                -not $RateLimited -and
                -not $AuthenticationFailure -and
                -not $TemporaryFailure
            )

            $State.lastProvider = [string]$SelectedProvider.id

            if ($Succeeded) {
                $ProviderState.failures = 0
                $ProviderState.circuitUntil = $null
                $ProviderState.lastResult = "success"
                $State.lastSuccess = (Get-Date).ToString("o")

                Save-ProviderState -State $State

                Write-AgentLog `
                    "$($SelectedProvider.id) ended normally; continuing from checkpoint." `
                    "SUCCESS"

                Start-Sleep -Seconds 10
                continue
            }

            $ProviderState.failures = [int]$ProviderState.failures + 1
            $ProviderState.lastResult = "failure"
            $State.lastFailure = (Get-Date).ToString("o")

            $Cooldown = [int]$Configuration.defaultCooldownMinutes

            if (
                $SelectedProvider.id -eq "fcc" -and
                [int]$ProviderState.failures -ge
                    [int]$Configuration.fccFailureThreshold
            ) {
                $Cooldown = [int]$Configuration.fccCooldownMinutes
            }

            $ProviderState.circuitUntil = (
                Get-Date
            ).AddMinutes(
                $Cooldown
            ).ToString("o")

            Save-ProviderState -State $State

            if ($RateLimited) {
                Write-AgentLog `
                    "$($SelectedProvider.id) is rate-limited; circuit opened for $Cooldown minutes." `
                    "WARN"
            }
            elseif ($AuthenticationFailure) {
                Write-AgentLog `
                    "$($SelectedProvider.id) authentication failed; circuit opened for $Cooldown minutes." `
                    "WARN"
            }
            else {
                Write-AgentLog `
                    "$($SelectedProvider.id) failed with exit code $($Result.ExitCode); circuit opened for $Cooldown minutes." `
                    "WARN"
            }

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

        Write-AgentLog "EUshop resilient provider orchestrator stopped."
    }
}

function Show-OrchestratorStatus {
    $ClaudeDirectory = Join-Path $ProjectPath ".claude"
    $ConfigurationPath = Join-Path `
        $ClaudeDirectory `
        "agent-failover-config.json"

    $StatePath = Join-Path `
        $ClaudeDirectory `
        "provider-state-v3.json"

    $LockPath = Join-Path `
        $ClaudeDirectory `
        "AGENT_FAILOVER.lock"

    Write-Host ""
    Write-Host "=== EUshop orchestrator status ===" -ForegroundColor Cyan

    if (Test-Path -LiteralPath $LockPath) {
        $RunnerPid = [int](
            Get-Content -LiteralPath $LockPath -Raw
        )

        $Process = Get-Process `
            -Id $RunnerPid `
            -ErrorAction SilentlyContinue

        if ($Process) {
            Write-Host "Runner active: PID $RunnerPid" -ForegroundColor Green
        }
        else {
            Write-Host "Stale lock: PID $RunnerPid is not active" `
                -ForegroundColor Yellow
        }
    }
    else {
        Write-Host "Runner is not active." -ForegroundColor Yellow
    }

    if (Test-Path -LiteralPath $ConfigurationPath) {
        $Configuration = Get-Content `
            -LiteralPath $ConfigurationPath `
            -Raw |
            ConvertFrom-Json

        Write-Host ""
        Get-ProviderInventory -Configuration $Configuration |
            Format-Table -AutoSize
    }

    if (Test-Path -LiteralPath $StatePath) {
        Write-Host ""
        Write-Host "Circuit state:" -ForegroundColor Cyan

        $State = Get-Content `
            -LiteralPath $StatePath `
            -Raw |
            ConvertFrom-Json

        @($State.providers) |
            Select-Object id, failures, circuitUntil, lastResult |
            Format-Table -AutoSize

        Write-Host "Last provider: $($State.lastProvider)"
        Write-Host "Last success:  $($State.lastSuccess)"
        Write-Host "Last failure:  $($State.lastFailure)"
    }
}

function Stop-Orchestrator {
    $ClaudeDirectory = Join-Path $ProjectPath ".claude"
    $StopPath = Join-Path $ClaudeDirectory "AUTONOMOUS_STOP"
    $LockPath = Join-Path $ClaudeDirectory "AGENT_FAILOVER.lock"

    New-Item -ItemType File -Path $StopPath -Force | Out-Null
    Write-Host "Stop marker created." -ForegroundColor Yellow

    Start-Sleep -Seconds 3
    Stop-RunnerFromLock -LockPath $LockPath
}

switch ($Mode) {
    "Install" {
        Install-Orchestrator
    }

    "Run" {
        Run-Orchestrator
    }

    "Status" {
        Show-OrchestratorStatus
    }

    "Stop" {
        Stop-Orchestrator
    }
}
