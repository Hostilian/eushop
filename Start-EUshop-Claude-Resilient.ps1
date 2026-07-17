#requires -Version 5.1
<#
EUshop Claude Code + Free Claude Code resilient launcher

What it does:
- Removes conflicting Anthropic credentials from the current process and user profile.
- Removes ANTHROPIC_API_KEY from Claude settings that can recreate the warning.
- Disables the broken DeepSeek credential without deleting backups.
- Detects configured non-DeepSeek FCC providers.
- Tries each configured provider/model until one passes a real gateway request.
- Prefers OpenRouter's free model router when an OpenRouter key is configured.
- Uses an already-installed local Ollama model as the final no-cloud fallback.
- Configures Claude Code to accept file edits automatically.
- Adds EUshop repository instructions to work autonomously and use graceful degradation.
- Launches Claude through the FCC gateway without using the conflicting fcc-claude wrapper.

Important:
- No program can guarantee uninterrupted service if every provider is unavailable,
  rate-limited, out of quota, or has an invalid key.
- This script never invents, downloads, or prints API keys.
- It does not deploy, force-push, merge, spend money, or delete major data.
#>

[CmdletBinding()]
param(
    [string]$ProjectPath = "D:\CODING\eushop",
    [int]$FccPort = 8082
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = "Stop"

$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$FccHome = Join-Path $HOME ".fcc"
$FccEnvPath = Join-Path $FccHome ".env"
$FccLogDir = Join-Path $FccHome "logs"
$GatewayBaseUrl = "http://127.0.0.1:$FccPort"
$GatewayToken = "freecc"

function Write-Section {
    param([Parameter(Mandatory)][string]$Text)

    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host " $Text" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
}

function Write-Ok {
    param([Parameter(Mandatory)][string]$Text)
    Write-Host "[OK] $Text" -ForegroundColor Green
}

function Write-Info {
    param([Parameter(Mandatory)][string]$Text)
    Write-Host "[INFO] $Text" -ForegroundColor Cyan
}

function Write-Warn {
    param([Parameter(Mandatory)][string]$Text)
    Write-Host "[WARN] $Text" -ForegroundColor Yellow
}

function Backup-File {
    param([Parameter(Mandatory)][string]$Path)

    if (Test-Path -LiteralPath $Path) {
        $BackupPath = "$Path.backup-$Timestamp"
        Copy-Item -LiteralPath $Path -Destination $BackupPath -Force
        return $BackupPath
    }

    return $null
}

function Ensure-Directory {
    param([Parameter(Mandatory)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function Get-DotEnvValue {
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][string]$Key
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        return ""
    }

    $Pattern = "^\s*" + [Regex]::Escape($Key) + "\s*="
    $Line = Get-Content -LiteralPath $Path |
        Where-Object { $_ -match $Pattern } |
        Select-Object -First 1

    if ($null -eq $Line) {
        return ""
    }

    $Value = ($Line -replace $Pattern, "").Trim()

    if (
        ($Value.StartsWith('"') -and $Value.EndsWith('"')) -or
        ($Value.StartsWith("'") -and $Value.EndsWith("'"))
    ) {
        if ($Value.Length -ge 2) {
            $Value = $Value.Substring(1, $Value.Length - 2)
        }
    }

    return $Value.Trim()
}

function Set-DotEnvValue {
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][string]$Key,
        [AllowEmptyString()][string]$Value
    )

    Ensure-Directory -Path (Split-Path -Parent $Path)

    $NewLine = "$Key=$Value"
    $Pattern = "^\s*" + [Regex]::Escape($Key) + "\s*="

    if (-not (Test-Path -LiteralPath $Path)) {
        Set-Content -LiteralPath $Path -Value $NewLine -Encoding UTF8
        return
    }

    $Lines = @(Get-Content -LiteralPath $Path)
    $Found = $false

    for ($Index = 0; $Index -lt $Lines.Count; $Index++) {
        if ($Lines[$Index] -match $Pattern) {
            $Lines[$Index] = $NewLine
            $Found = $true
        }
    }

    if (-not $Found) {
        $Lines += $NewLine
    }

    Set-Content -LiteralPath $Path -Value $Lines -Encoding UTF8
}

function Get-FirstAvailableSecret {
    param([Parameter(Mandatory)][string]$Name)

    $FromFile = Get-DotEnvValue -Path $FccEnvPath -Key $Name
    if (-not [string]::IsNullOrWhiteSpace($FromFile)) {
        return $FromFile
    }

    foreach ($Scope in @(
        [EnvironmentVariableTarget]::Process,
        [EnvironmentVariableTarget]::User
    )) {
        $Value = [Environment]::GetEnvironmentVariable($Name, $Scope)
        if (-not [string]::IsNullOrWhiteSpace($Value)) {
            return $Value
        }
    }

    return ""
}

function Set-ObjectProperty {
    param(
        [Parameter(Mandatory)]$Object,
        [Parameter(Mandatory)][string]$Name,
        [AllowNull()]$Value
    )

    if ($Object.PSObject.Properties.Name -contains $Name) {
        $Object.$Name = $Value
    }
    else {
        $Object | Add-Member -NotePropertyName $Name -NotePropertyValue $Value
    }
}

function Remove-ObjectProperty {
    param(
        [Parameter(Mandatory)]$Object,
        [Parameter(Mandatory)][string]$Name
    )

    if ($Object.PSObject.Properties.Name -contains $Name) {
        $Object.PSObject.Properties.Remove($Name)
    }
}

function Read-JsonObject {
    param([Parameter(Mandatory)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path)) {
        return [PSCustomObject]@{}
    }

    try {
        $Raw = Get-Content -LiteralPath $Path -Raw
        if ([string]::IsNullOrWhiteSpace($Raw)) {
            return [PSCustomObject]@{}
        }

        return $Raw | ConvertFrom-Json
    }
    catch {
        Backup-File -Path $Path | Out-Null
        Write-Warn "Invalid JSON was backed up and replaced: $Path"
        return [PSCustomObject]@{}
    }
}

function Write-JsonObject {
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)]$Object
    )

    Ensure-Directory -Path (Split-Path -Parent $Path)

    $Object |
        ConvertTo-Json -Depth 100 |
        Set-Content -LiteralPath $Path -Encoding UTF8
}

function Repair-ClaudeJsonSettings {
    param([Parameter(Mandatory)][string]$Path)

    $Settings = Read-JsonObject -Path $Path

    # Remove only the direct Anthropic API key. The custom launcher supplies
    # the FCC gateway URL and bearer token in the child process.
    if ($Settings.PSObject.Properties.Name -contains "env") {
        $EnvObject = $Settings.env
        if ($null -ne $EnvObject) {
            Remove-ObjectProperty -Object $EnvObject -Name "ANTHROPIC_API_KEY"
            Remove-ObjectProperty -Object $EnvObject -Name "CLAUDE_CODE_OAUTH_TOKEN"
        }
    }

    if (-not ($Settings.PSObject.Properties.Name -contains "permissions") -or $null -eq $Settings.permissions) {
        Set-ObjectProperty -Object $Settings -Name "permissions" -Value ([PSCustomObject]@{})
    }

    $Permissions = $Settings.permissions

    # Automatically accept file edits. This is deliberately safer than
    # bypassPermissions, which would approve every shell action.
    Set-ObjectProperty -Object $Permissions -Name "defaultMode" -Value "acceptEdits"
    Set-ObjectProperty -Object $Permissions -Name "ask" -Value @()

    $ExistingAllow = @()
    if ($Permissions.PSObject.Properties.Name -contains "allow" -and $null -ne $Permissions.allow) {
        $ExistingAllow = @($Permissions.allow)
    }

    $RequiredAllow = @(
        "Read",
        "Glob",
        "Grep",
        "Edit",
        "Write",
        "NotebookEdit"
    )

    $MergedAllow = @(
        @($ExistingAllow + $RequiredAllow) |
            Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) } |
            Select-Object -Unique
    )
    Set-ObjectProperty -Object $Permissions -Name "allow" -Value $MergedAllow

    $ExistingDeny = @()
    if ($Permissions.PSObject.Properties.Name -contains "deny" -and $null -ne $Permissions.deny) {
        $ExistingDeny = @($Permissions.deny)
    }

    $SecretDeny = @(
        "Read(./.env)",
        "Read(./.env.*)",
        "Read(./**/.env)",
        "Read(./**/.env.*)",
        "Read(./secrets/**)",
        "Read(./**/secrets/**)",
        "Read(./**/*.pem)",
        "Read(./**/*.key)"
    )

    $MergedDeny = @(
        @($ExistingDeny + $SecretDeny) |
            Where-Object { -not [string]::IsNullOrWhiteSpace([string]$_) } |
            Select-Object -Unique
    )
    Set-ObjectProperty -Object $Permissions -Name "deny" -Value $MergedDeny

    Write-JsonObject -Path $Path -Object $Settings
}

function Repair-ClaudeState {
    $ClaudeStatePath = Join-Path $HOME ".claude.json"
    $State = Read-JsonObject -Path $ClaudeStatePath
    Set-ObjectProperty -Object $State -Name "hasCompletedOnboarding" -Value $true
    Write-JsonObject -Path $ClaudeStatePath -Object $State
}

function Add-AutonomyInstructions {
    $ClaudeDirectory = Join-Path $ProjectPath ".claude"
    $InstructionPath = Join-Path $ClaudeDirectory "CLAUDE.md"
    Ensure-Directory -Path $ClaudeDirectory

    $BeginMarker = "<!-- BEGIN EUSHOP AUTONOMOUS EDITING -->"
    $EndMarker = "<!-- END EUSHOP AUTONOMOUS EDITING -->"

    $ManagedBlock = @"
$BeginMarker
# EUshop autonomous repository workflow

Work autonomously inside this repository.

- Inspect the existing implementation before changing it.
- Do not ask preference or confirmation questions when a safe, reasonable default exists.
- Make the edits, run relevant local tests or checks, fix failures caused by the changes, and summarize the result.
- Preserve existing work and repository conventions.
- Prefer small, reviewable changes and graceful degradation when an API, model, optional dependency, integration, network service, or configuration value is unavailable.
- Never print, expose, overwrite, or commit secrets.
- Do not deploy, purchase services, spend money, change external accounts, delete major data, force-push, rewrite shared history, or merge directly to the protected main branch unless the user explicitly authorizes that exact irreversible action.
- When blocked only by a missing secret or external account permission, complete every local change that does not require it and clearly identify the remaining blocker.
$EndMarker
"@

    $Existing = ""
    if (Test-Path -LiteralPath $InstructionPath) {
        $Existing = Get-Content -LiteralPath $InstructionPath -Raw
    }

    $EscapedBegin = [Regex]::Escape($BeginMarker)
    $EscapedEnd = [Regex]::Escape($EndMarker)
    $Pattern = "(?s)$EscapedBegin.*?$EscapedEnd"

    if ($Existing -match $Pattern) {
        $Updated = [Regex]::Replace($Existing, $Pattern, $ManagedBlock)
    }
    elseif ([string]::IsNullOrWhiteSpace($Existing)) {
        $Updated = $ManagedBlock
    }
    else {
        $Updated = $Existing.TrimEnd() + "`r`n`r`n" + $ManagedBlock + "`r`n"
    }

    Set-Content -LiteralPath $InstructionPath -Value $Updated -Encoding UTF8
}

function Remove-ConflictingCredentials {
    $Names = @(
        "ANTHROPIC_API_KEY",
        "CLAUDE_CODE_OAUTH_TOKEN"
    )

    foreach ($Name in $Names) {
        Remove-Item "Env:$Name" -ErrorAction SilentlyContinue
        [Environment]::SetEnvironmentVariable(
            $Name,
            $null,
            [EnvironmentVariableTarget]::User
        )
    }

    # Clear inherited gateway variables. The custom launcher sets exactly the
    # required values immediately before starting Claude.
    foreach ($Name in @("ANTHROPIC_AUTH_TOKEN", "ANTHROPIC_BASE_URL")) {
        Remove-Item "Env:$Name" -ErrorAction SilentlyContinue
        [Environment]::SetEnvironmentVariable(
            $Name,
            $null,
            [EnvironmentVariableTarget]::User
        )
    }
}

function Get-FccListenerProcess {
    try {
        $Connection = Get-NetTCPConnection `
            -LocalPort $FccPort `
            -State Listen `
            -ErrorAction SilentlyContinue |
            Select-Object -First 1

        if ($null -eq $Connection) {
            return $null
        }

        return Get-CimInstance Win32_Process `
            -Filter "ProcessId = $($Connection.OwningProcess)" `
            -ErrorAction SilentlyContinue
    }
    catch {
        return $null
    }
}

function Stop-FccServerSafely {
    $ProcessInfo = Get-FccListenerProcess
    if ($null -eq $ProcessInfo) {
        return
    }

    $CommandLine = [string]$ProcessInfo.CommandLine
    $Name = [string]$ProcessInfo.Name

    $LooksLikeFcc = (
        $CommandLine -match "(?i)fcc-server|free[_-]claude[_-]code|uvicorn.*8082" -or
        $Name -match "(?i)fcc-server"
    )

    if (-not $LooksLikeFcc) {
        throw @"
Port $FccPort is owned by another process and was not stopped.

Process: $Name
Command: $CommandLine
"@
    }

    Stop-Process -Id $ProcessInfo.ProcessId -Force -ErrorAction Stop
    Start-Sleep -Milliseconds 800
}

function Wait-FccServer {
    param([int]$Attempts = 40)

    for ($Attempt = 1; $Attempt -le $Attempts; $Attempt++) {
        foreach ($Uri in @(
            "$GatewayBaseUrl/health",
            "$GatewayBaseUrl/admin"
        )) {
            try {
                Invoke-WebRequest `
                    -Uri $Uri `
                    -UseBasicParsing `
                    -TimeoutSec 2 `
                    -ErrorAction Stop | Out-Null

                return $true
            }
            catch {
                # Try the next health URI.
            }
        }

        Start-Sleep -Seconds 1
    }

    return $false
}

function Start-FccServer {
    $Command = Get-Command "fcc-server" -ErrorAction SilentlyContinue
    if ($null -eq $Command) {
        throw "fcc-server was not found in PATH."
    }

    Ensure-Directory -Path $FccLogDir

    $StdOut = Join-Path $FccLogDir "eushop-fcc-stdout.log"
    $StdErr = Join-Path $FccLogDir "eushop-fcc-stderr.log"

    Start-Process `
        -FilePath $Command.Source `
        -WorkingDirectory $ProjectPath `
        -WindowStyle Hidden `
        -RedirectStandardOutput $StdOut `
        -RedirectStandardError $StdErr | Out-Null

    if (-not (Wait-FccServer)) {
        throw @"
FCC did not become healthy.

Read:
$StdOut
$StdErr
"@
    }
}

function Restart-FccServer {
    Stop-FccServerSafely
    Start-FccServer
}

function Test-FccGatewayModel {
    param([Parameter(Mandatory)][string]$Model)

    $Headers = @{
        "Authorization"     = "Bearer $GatewayToken"
        "x-api-key"        = $GatewayToken
        "anthropic-version" = "2023-06-01"
    }

    $Body = @{
        model = $Model
        max_tokens = 8
        messages = @(
            @{
                role = "user"
                content = "Reply exactly OK"
            }
        )
    } | ConvertTo-Json -Depth 10

    try {
        $Response = Invoke-RestMethod `
            -Method Post `
            -Uri "$GatewayBaseUrl/v1/messages" `
            -Headers $Headers `
            -ContentType "application/json" `
            -Body $Body `
            -TimeoutSec 45 `
            -ErrorAction Stop

        return $null -ne $Response
    }
    catch {
        $Message = $_.Exception.Message
        Write-Warn "Model test failed for $Model"
        Write-Host "       $Message" -ForegroundColor DarkYellow
        return $false
    }
}

function Get-OllamaCandidate {
    $OllamaCommand = Get-Command "ollama" -ErrorAction SilentlyContinue
    if ($null -eq $OllamaCommand) {
        return $null
    }

    try {
        $Tags = Invoke-RestMethod `
            -Uri "http://127.0.0.1:11434/api/tags" `
            -TimeoutSec 4 `
            -ErrorAction Stop

        $Names = @($Tags.models | ForEach-Object { [string]$_.name })
        if ($Names.Count -eq 0) {
            return $null
        }

        $PreferredPatterns = @(
            "(?i)qwen.*coder",
            "(?i)devstral",
            "(?i)codestral",
            "(?i)starcoder",
            "(?i)codellama",
            "(?i)llama3",
            "(?i)qwen"
        )

        foreach ($Pattern in $PreferredPatterns) {
            $Match = $Names | Where-Object { $_ -match $Pattern } | Select-Object -First 1
            if (-not [string]::IsNullOrWhiteSpace($Match)) {
                return [PSCustomObject]@{
                    Name = "Local Ollama: $Match"
                    Provider = "ollama"
                    KeyName = ""
                    Model = "ollama/$Match"
                }
            }
        }

        $First = $Names | Select-Object -First 1
        return [PSCustomObject]@{
            Name = "Local Ollama: $First"
            Provider = "ollama"
            KeyName = ""
            Model = "ollama/$First"
        }
    }
    catch {
        return $null
    }
}

function Get-ConfiguredCandidates {
    # OpenRouter is first because openrouter/free routes each request to a
    # currently available free model supporting the required capabilities.
    $Definitions = @(
        [PSCustomObject]@{
            Name = "OpenRouter free model router"
            Provider = "open_router"
            KeyName = "OPENROUTER_API_KEY"
            Model = "open_router/openrouter/free"
        },
        [PSCustomObject]@{
            Name = "NVIDIA NIM Nemotron"
            Provider = "nvidia_nim"
            KeyName = "NVIDIA_NIM_API_KEY"
            Model = "nvidia_nim/nvidia/nemotron-3-super-120b-a12b"
        },
        [PSCustomObject]@{
            Name = "Google Gemini Flash"
            Provider = "gemini"
            KeyName = "GEMINI_API_KEY"
            Model = "gemini/models/gemini-3.1-flash-lite"
        },
        [PSCustomObject]@{
            Name = "Mistral Devstral"
            Provider = "mistral"
            KeyName = "MISTRAL_API_KEY"
            Model = "mistral/devstral-small-latest"
        },
        [PSCustomObject]@{
            Name = "Mistral Codestral"
            Provider = "mistral_codestral"
            KeyName = "CODESTRAL_API_KEY"
            Model = "mistral_codestral/codestral-latest"
        },
        [PSCustomObject]@{
            Name = "OpenCode Codex"
            Provider = "opencode"
            KeyName = "OPENCODE_API_KEY"
            Model = "opencode/gpt-5.3-codex"
        },
        [PSCustomObject]@{
            Name = "GitHub Models GPT-4.1"
            Provider = "github_models"
            KeyName = "GITHUB_MODELS_TOKEN"
            Model = "github_models/openai/gpt-4.1"
        },
        [PSCustomObject]@{
            Name = "Z.ai GLM"
            Provider = "zai"
            KeyName = "ZAI_API_KEY"
            Model = "zai/glm-5.2"
        },
        [PSCustomObject]@{
            Name = "Kimi"
            Provider = "kimi"
            KeyName = "KIMI_API_KEY"
            Model = "kimi/kimi-k2.5"
        },
        [PSCustomObject]@{
            Name = "Cerebras"
            Provider = "cerebras"
            KeyName = "CEREBRAS_API_KEY"
            Model = "cerebras/gpt-oss-120b"
        },
        [PSCustomObject]@{
            Name = "Groq"
            Provider = "groq"
            KeyName = "GROQ_API_KEY"
            Model = "groq/llama-3.3-70b-versatile"
        },
        [PSCustomObject]@{
            Name = "Fireworks"
            Provider = "fireworks"
            KeyName = "FIREWORKS_API_KEY"
            Model = "fireworks/accounts/fireworks/models/llama-v3p3-70b-instruct"
        }
    )

    $Configured = @()

    foreach ($Definition in $Definitions) {
        $Secret = Get-FirstAvailableSecret -Name $Definition.KeyName
        if ([string]::IsNullOrWhiteSpace($Secret)) {
            continue
        }

        # Copy a key from the process/user environment into FCC's managed env
        # only when FCC does not already contain it.
        if ([string]::IsNullOrWhiteSpace((Get-DotEnvValue -Path $FccEnvPath -Key $Definition.KeyName))) {
            Set-DotEnvValue -Path $FccEnvPath -Key $Definition.KeyName -Value $Secret
        }

        $Configured += $Definition
    }

    $Ollama = Get-OllamaCandidate
    if ($null -ne $Ollama) {
        $Configured += $Ollama
    }

    return @($Configured)
}

function Configure-FccModel {
    param([Parameter(Mandatory)][string]$Model)

    # Use the tested model for every Claude tier. OpenRouter's free router
    # performs request-level model selection when it is the selected model.
    foreach ($Key in @(
        "MODEL",
        "MODEL_FABLE",
        "MODEL_OPUS",
        "MODEL_SONNET",
        "MODEL_HAIKU"
    )) {
        Set-DotEnvValue -Path $FccEnvPath -Key $Key -Value $Model
    }

    Set-DotEnvValue -Path $FccEnvPath -Key "ANTHROPIC_AUTH_TOKEN" -Value $GatewayToken
    Set-DotEnvValue -Path $FccEnvPath -Key "FCC_OPEN_BROWSER" -Value "false"
    Set-DotEnvValue -Path $FccEnvPath -Key "HTTP_CONNECT_TIMEOUT" -Value "20"
    Set-DotEnvValue -Path $FccEnvPath -Key "HTTP_READ_TIMEOUT" -Value "300"
    Set-DotEnvValue -Path $FccEnvPath -Key "HTTP_WRITE_TIMEOUT" -Value "30"
    Set-DotEnvValue -Path $FccEnvPath -Key "PROVIDER_MAX_CONCURRENCY" -Value "2"
}

function Launch-ClaudeThroughGateway {
    $ClaudeCommand = Get-Command "claude" -ErrorAction SilentlyContinue
    if ($null -eq $ClaudeCommand) {
        throw "Claude Code command 'claude' was not found in PATH."
    }

    # Set only the gateway credential path. Explicitly remove direct API auth
    # so Claude does not see both ANTHROPIC_AUTH_TOKEN and ANTHROPIC_API_KEY.
    Remove-Item Env:ANTHROPIC_API_KEY -ErrorAction SilentlyContinue
    Remove-Item Env:CLAUDE_CODE_OAUTH_TOKEN -ErrorAction SilentlyContinue

    $env:ANTHROPIC_BASE_URL = $GatewayBaseUrl
    $env:ANTHROPIC_AUTH_TOKEN = $GatewayToken
    $env:CLAUDE_CODE_ENABLE_GATEWAY_MODEL_DISCOVERY = "1"
    $env:CLAUDE_CODE_AUTO_COMPACT_WINDOW = "190000"
    $env:DISABLE_FEEDBACK_COMMAND = "1"
    $env:DISABLE_ERROR_REPORTING = "1"
    $env:DISABLE_TELEMETRY = "1"

    Set-Location -LiteralPath $ProjectPath

    Write-Host ""
    Write-Host "Starting Claude Code in automatic edit mode..." -ForegroundColor Green
    Write-Host "Project: $ProjectPath"
    Write-Host "Gateway: $GatewayBaseUrl"
    Write-Host ""

    & $ClaudeCommand.Source --permission-mode acceptEdits
}

Write-Section "EUshop resilient Claude Code setup"

if (-not (Test-Path -LiteralPath $ProjectPath)) {
    throw "Project directory was not found: $ProjectPath"
}

if (-not (Test-Path -LiteralPath $FccEnvPath)) {
    throw @"
FCC configuration was not found:

$FccEnvPath

Install Free Claude Code first, start fcc-server once, and then run this script.
"@
}

Ensure-Directory -Path $FccLogDir
Set-Location -LiteralPath $ProjectPath

$FccBackup = Backup-File -Path $FccEnvPath
if ($null -ne $FccBackup) {
    Write-Info "FCC configuration backup: $FccBackup"
}

Write-Section "Repairing authentication and edit behavior"

Remove-ConflictingCredentials
Repair-ClaudeState

$UserClaudeSettings = Join-Path $HOME ".claude\settings.json"
$ProjectClaudeSettings = Join-Path $ProjectPath ".claude\settings.local.json"

foreach ($SettingsPath in @($UserClaudeSettings, $ProjectClaudeSettings)) {
    Backup-File -Path $SettingsPath | Out-Null
    Repair-ClaudeJsonSettings -Path $SettingsPath
}

Add-AutonomyInstructions

# The old token is invalid and must not remain an eligible route.
Set-DotEnvValue -Path $FccEnvPath -Key "DEEPSEEK_API_KEY" -Value ""
Set-DotEnvValue -Path $FccEnvPath -Key "ANTHROPIC_AUTH_TOKEN" -Value $GatewayToken
Set-DotEnvValue -Path $FccEnvPath -Key "FCC_OPEN_BROWSER" -Value "false"

Write-Ok "Conflicting direct Anthropic credentials removed."
Write-Ok "Claude onboarding/login prompt disabled."
Write-Ok "Automatic file-edit mode configured."
Write-Ok "EUshop autonomous workflow instructions installed."
Write-Ok "Broken DeepSeek credential disabled."

Write-Section "Finding a working model"

$Candidates = Get-ConfiguredCandidates

if ($Candidates.Count -eq 0) {
    Start-Process "$GatewayBaseUrl/admin"

    throw @"
No usable non-DeepSeek provider was found.

Configure at least one of these in the FCC Admin UI:
- OPENROUTER_API_KEY
- NVIDIA_NIM_API_KEY
- GEMINI_API_KEY
- MISTRAL_API_KEY
- CODESTRAL_API_KEY
- OPENCODE_API_KEY
- GITHUB_MODELS_TOKEN
- ZAI_API_KEY
- KIMI_API_KEY
- CEREBRAS_API_KEY
- GROQ_API_KEY
- FIREWORKS_API_KEY

Alternatively, start Ollama with an already-downloaded coding model.

The Admin UI has been opened. This script will not ask for or print a secret.
"@
}

Write-Info "Configured fallback candidates: $($Candidates.Count)"

$Selected = $null

foreach ($Candidate in $Candidates) {
    Write-Info "Trying $($Candidate.Name)"
    Configure-FccModel -Model $Candidate.Model

    try {
        Restart-FccServer
    }
    catch {
        Write-Warn "FCC restart failed while trying $($Candidate.Name)"
        Write-Host "       $($_.Exception.Message)" -ForegroundColor DarkYellow
        continue
    }

    if (Test-FccGatewayModel -Model $Candidate.Model) {
        $Selected = $Candidate
        break
    }
}

if ($null -eq $Selected) {
    Start-Process "$GatewayBaseUrl/admin"

    throw @"
Every configured non-DeepSeek provider failed its real gateway test.

Possible causes:
- invalid or expired key
- provider outage
- free-tier quota or rate limit
- model unavailable for the account or region
- local Ollama is not running

FCC logs:
$(Join-Path $FccLogDir "eushop-fcc-stdout.log")
$(Join-Path $FccLogDir "eushop-fcc-stderr.log")

The Admin UI has been opened.
"@
}

Write-Ok "Selected: $($Selected.Name)"
Write-Ok "Model: $($Selected.Model)"
Write-Ok "A real request through FCC succeeded."

Write-Section "Launching Claude Code"
Launch-ClaudeThroughGateway
