from pathlib import Path

script = r'''#requires -Version 5.1
<#
One-time hard repair for EUshop:
- Updates Free Claude Code to the current official build.
- Removes the stale dual Anthropic authentication configuration.
- Installs/starts Ollama if needed.
- Selects a local Qwen coding model based on installed RAM.
- Configures FCC to use only the local model (no DeepSeek/API key).
- Tests Ollama and FCC before launching Claude Code.
- Enables automatic file edits and autonomous repository instructions.

Run from PowerShell:
  Set-ExecutionPolicy -Scope Process Bypass -Force
  & "$HOME\Downloads\Fix-EUshop-Claude-Local.ps1"
#>

[CmdletBinding()]
param(
    [string]$ProjectPath = "D:\CODING\eushop",
    [int]$FccPort = 8082
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$FccDir = Join-Path $HOME ".fcc"
$FccEnv = Join-Path $FccDir ".env"
$ClaudeDir = Join-Path $HOME ".claude"
$Gateway = "http://127.0.0.1:$FccPort"
$LocalModelName = "eushop-coder"

function Section([string]$Text) {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host " $Text" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
}

function Ok([string]$Text) {
    Write-Host "[OK] $Text" -ForegroundColor Green
}

function Info([string]$Text) {
    Write-Host "[INFO] $Text" -ForegroundColor Cyan
}

function Warn([string]$Text) {
    Write-Host "[WARN] $Text" -ForegroundColor Yellow
}

function Ensure-Directory([string]$Path) {
    if (-not (Test-Path -LiteralPath $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function Backup-Path([string]$Path) {
    if (Test-Path -LiteralPath $Path) {
        $Backup = "$Path.backup-$Timestamp"
        Copy-Item -LiteralPath $Path -Destination $Backup -Recurse -Force
        return $Backup
    }
    return $null
}

function Set-EnvFileValue {
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][string]$Name,
        [AllowEmptyString()][string]$Value
    )

    Ensure-Directory (Split-Path -Parent $Path)
    $Pattern = "^\s*" + [regex]::Escape($Name) + "\s*="
    $NewLine = "$Name=$Value"

    if (-not (Test-Path -LiteralPath $Path)) {
        Set-Content -LiteralPath $Path -Value $NewLine -Encoding UTF8
        return
    }

    $Lines = @(Get-Content -LiteralPath $Path)
    $Found = $false

    for ($i = 0; $i -lt $Lines.Count; $i++) {
        if ($Lines[$i] -match $Pattern) {
            $Lines[$i] = $NewLine
            $Found = $true
        }
    }

    if (-not $Found) {
        $Lines += $NewLine
    }

    Set-Content -LiteralPath $Path -Value $Lines -Encoding UTF8
}

function Remove-JsonProperty {
    param(
        [Parameter(Mandatory)]$Object,
        [Parameter(Mandatory)][string]$Name
    )

    if ($null -ne $Object -and $Object.PSObject.Properties.Name -contains $Name) {
        $Object.PSObject.Properties.Remove($Name)
    }
}

function Set-JsonProperty {
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

function Read-JsonFile([string]$Path) {
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
        Backup-Path $Path | Out-Null
        Warn "Invalid JSON was backed up and reset: $Path"
        return [PSCustomObject]@{}
    }
}

function Write-JsonFile {
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)]$Value
    )

    Ensure-Directory (Split-Path -Parent $Path)
    $Value |
        ConvertTo-Json -Depth 100 |
        Set-Content -LiteralPath $Path -Encoding UTF8
}

function Repair-ClaudeSettings([string]$Path) {
    Backup-Path $Path | Out-Null
    $Settings = Read-JsonFile $Path

    # Remove credential helpers and direct API keys that conflict with FCC.
    Remove-JsonProperty $Settings "apiKeyHelper"

    if ($Settings.PSObject.Properties.Name -contains "env" -and $null -ne $Settings.env) {
        $Names = @($Settings.env.PSObject.Properties.Name)
        foreach ($Name in $Names) {
            if (
                $Name -like "ANTHROPIC_*" -or
                $Name -eq "CLAUDE_CODE_OAUTH_TOKEN"
            ) {
                Remove-JsonProperty $Settings.env $Name
            }
        }
    }

    if (-not ($Settings.PSObject.Properties.Name -contains "permissions") -or $null -eq $Settings.permissions) {
        Set-JsonProperty $Settings "permissions" ([PSCustomObject]@{})
    }

    Set-JsonProperty $Settings.permissions "defaultMode" "acceptEdits"

    $Allow = @()
    if (
        $Settings.permissions.PSObject.Properties.Name -contains "allow" -and
        $null -ne $Settings.permissions.allow
    ) {
        $Allow = @($Settings.permissions.allow)
    }

    $Allow += @("Read", "Glob", "Grep", "Edit", "Write", "NotebookEdit")
    Set-JsonProperty $Settings.permissions "allow" @($Allow | Select-Object -Unique)

    $Deny = @()
    if (
        $Settings.permissions.PSObject.Properties.Name -contains "deny" -and
        $null -ne $Settings.permissions.deny
    ) {
        $Deny = @($Settings.permissions.deny)
    }

    $Deny += @(
        "Read(./.env)",
        "Read(./.env.*)",
        "Read(./**/.env)",
        "Read(./**/.env.*)",
        "Read(./**/*.pem)",
        "Read(./**/*.key)",
        "Read(./**/secrets/**)"
    )
    Set-JsonProperty $Settings.permissions "deny" @($Deny | Select-Object -Unique)

    Write-JsonFile $Path $Settings
}

function Stop-PortProcessSafely([int]$Port) {
    try {
        $Connections = @(
            Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        )
    }
    catch {
        $Connections = @()
    }

    foreach ($Connection in $Connections) {
        $Process = Get-CimInstance Win32_Process `
            -Filter "ProcessId=$($Connection.OwningProcess)" `
            -ErrorAction SilentlyContinue

        if ($null -eq $Process) {
            continue
        }

        $Description = "$($Process.Name) $($Process.CommandLine)"

        if ($Description -match "(?i)fcc-server|free[_-]claude[_-]code|uvicorn") {
            Info "Stopping old FCC process $($Process.ProcessId)"
            Stop-Process -Id $Process.ProcessId -Force -ErrorAction SilentlyContinue
        }
        else {
            throw "Port $Port is occupied by another program: $Description"
        }
    }

    Start-Sleep -Milliseconds 800
}

function Wait-Http {
    param(
        [Parameter(Mandatory)][string[]]$Urls,
        [int]$Attempts = 45
    )

    for ($Attempt = 1; $Attempt -le $Attempts; $Attempt++) {
        foreach ($Url in $Urls) {
            try {
                Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop |
                    Out-Null
                return $true
            }
            catch {
                # Continue checking.
            }
        }
        Start-Sleep -Seconds 1
    }

    return $false
}

function Resolve-Ollama {
    $Command = Get-Command "ollama" -ErrorAction SilentlyContinue
    if ($null -ne $Command) {
        return $Command.Source
    }

    $Candidates = @(
        (Join-Path $env:LOCALAPPDATA "Programs\Ollama\ollama.exe"),
        (Join-Path $env:ProgramFiles "Ollama\ollama.exe"),
        (Join-Path $env:ProgramFiles "Ollama\ollama app.exe")
    )

    foreach ($Candidate in $Candidates) {
        if (Test-Path -LiteralPath $Candidate) {
            return $Candidate
        }
    }

    return $null
}

function Start-Ollama([string]$OllamaExe) {
    if (Wait-Http -Urls @("http://127.0.0.1:11434/api/tags") -Attempts 1) {
        return
    }

    Info "Starting Ollama locally"
    Start-Process `
        -FilePath $OllamaExe `
        -ArgumentList @("serve") `
        -WindowStyle Hidden | Out-Null

    if (-not (Wait-Http -Urls @("http://127.0.0.1:11434/api/tags") -Attempts 40)) {
        throw "Ollama did not start on http://127.0.0.1:11434."
    }
}

function Test-OllamaModel([string]$Model) {
    $Body = @{
        model = $Model
        stream = $false
        messages = @(
            @{
                role = "user"
                content = "Reply exactly OK"
            }
        )
        options = @{
            temperature = 0
            num_predict = 8
        }
    } | ConvertTo-Json -Depth 10

    $Response = Invoke-RestMethod `
        -Method Post `
        -Uri "http://127.0.0.1:11434/api/chat" `
        -ContentType "application/json" `
        -Body $Body `
        -TimeoutSec 300

    if ($null -eq $Response.message -or [string]::IsNullOrWhiteSpace($Response.message.content)) {
        throw "Ollama returned no model response."
    }
}

function Start-Fcc {
    $Command = Get-Command "fcc-server" -ErrorAction Stop
    Ensure-Directory (Join-Path $FccDir "logs")

    $OutLog = Join-Path $FccDir "logs\local-fcc-stdout.log"
    $ErrLog = Join-Path $FccDir "logs\local-fcc-stderr.log"

    Start-Process `
        -FilePath $Command.Source `
        -WorkingDirectory $ProjectPath `
        -WindowStyle Hidden `
        -RedirectStandardOutput $OutLog `
        -RedirectStandardError $ErrLog | Out-Null

    if (-not (Wait-Http -Urls @("$Gateway/health", "$Gateway/admin", "$Gateway/") -Attempts 45)) {
        throw @"
FCC did not start.

Logs:
$OutLog
$ErrLog
"@
    }
}

function Test-Fcc {
    $Headers = @{
        "Authorization" = "Bearer fcc-no-auth"
        "x-api-key" = "fcc-no-auth"
        "anthropic-version" = "2023-06-01"
    }

    $Body = @{
        model = "ollama/$LocalModelName"
        max_tokens = 8
        messages = @(
            @{
                role = "user"
                content = "Reply exactly OK"
            }
        )
    } | ConvertTo-Json -Depth 10

    Invoke-RestMethod `
        -Method Post `
        -Uri "$Gateway/v1/messages" `
        -Headers $Headers `
        -ContentType "application/json" `
        -Body $Body `
        -TimeoutSec 300 | Out-Null
}

function Install-AutonomyInstructions {
    $ProjectClaudeDir = Join-Path $ProjectPath ".claude"
    Ensure-Directory $ProjectClaudeDir

    $Path = Join-Path $ProjectClaudeDir "CLAUDE.md"
    $Begin = "<!-- BEGIN EUSHOP AUTONOMOUS WORKFLOW -->"
    $End = "<!-- END EUSHOP AUTONOMOUS WORKFLOW -->"

    $Block = @"
$Begin
# EUshop autonomous workflow

Work directly on the repository instead of asking unnecessary questions.

- Inspect the implementation and repository conventions first.
- When a safe reasonable default exists, choose it and continue.
- Make the edits, run relevant local checks, and repair failures caused by the changes.
- Preserve existing work and use graceful degradation for optional services and integrations.
- Never expose or commit secrets.
- Stop before deployment, spending money, changing external accounts, deleting major data,
  rewriting shared Git history, force-pushing, or another irreversible production action
  unless the user explicitly authorizes that exact action.
- When an external credential is missing, complete all possible local work and report only
  the remaining external blocker.
$End
"@

    $Existing = ""
    if (Test-Path -LiteralPath $Path) {
        $Existing = Get-Content -LiteralPath $Path -Raw
    }

    $Pattern = "(?s)" + [regex]::Escape($Begin) + ".*?" + [regex]::Escape($End)

    if ($Existing -match $Pattern) {
        $Updated = [regex]::Replace($Existing, $Pattern, $Block)
    }
    elseif ([string]::IsNullOrWhiteSpace($Existing)) {
        $Updated = $Block
    }
    else {
        $Updated = $Existing.TrimEnd() + "`r`n`r`n" + $Block + "`r`n"
    }

    Set-Content -LiteralPath $Path -Value $Updated -Encoding UTF8
}

Section "Validating repository"

if (-not (Test-Path -LiteralPath $ProjectPath)) {
    throw "Repository not found: $ProjectPath"
}

Set-Location -LiteralPath $ProjectPath
Ensure-Directory $FccDir
Ensure-Directory $ClaudeDir
Ok "Repository found: $ProjectPath"

Section "Stopping the broken session"

Stop-PortProcessSafely $FccPort

Get-Process -Name "claude" -ErrorAction SilentlyContinue |
    Stop-Process -Force -ErrorAction SilentlyContinue

Ok "Old Claude/FCC processes stopped."

Section "Removing conflicting authentication"

$CredentialFiles = @(
    (Join-Path $ClaudeDir ".credentials.json"),
    (Join-Path $ClaudeDir "credentials.json")
)

foreach ($CredentialFile in $CredentialFiles) {
    if (Test-Path -LiteralPath $CredentialFile) {
        $Backup = "$CredentialFile.disabled-$Timestamp"
        Move-Item -LiteralPath $CredentialFile -Destination $Backup -Force
        Info "Disabled saved Claude credential: $Backup"
    }
}

$Variables = @(
    "ANTHROPIC_API_KEY",
    "ANTHROPIC_AUTH_TOKEN",
    "ANTHROPIC_BASE_URL",
    "CLAUDE_CODE_OAUTH_TOKEN"
)

foreach ($Name in $Variables) {
    Remove-Item "Env:$Name" -ErrorAction SilentlyContinue
    [Environment]::SetEnvironmentVariable(
        $Name,
        $null,
        [EnvironmentVariableTarget]::User
    )

    try {
        [Environment]::SetEnvironmentVariable(
            $Name,
            $null,
            [EnvironmentVariableTarget]::Machine
        )
    }
    catch {
        # Machine scope requires elevation; user/process scope is sufficient here.
    }
}

$SettingsFiles = @(
    (Join-Path $ClaudeDir "settings.json"),
    (Join-Path $ProjectPath ".claude\settings.json"),
    (Join-Path $ProjectPath ".claude\settings.local.json")
)

foreach ($SettingsFile in $SettingsFiles) {
    Repair-ClaudeSettings $SettingsFile
}

$StatePath = Join-Path $HOME ".claude.json"
Backup-Path $StatePath | Out-Null
$State = Read-JsonFile $StatePath
Set-JsonProperty $State "hasCompletedOnboarding" $true
Write-JsonFile $StatePath $State

Install-AutonomyInstructions
Ok "Direct Anthropic credentials and conflicting settings removed."
Ok "Automatic file edits enabled."

Section "Updating Free Claude Code"

$InstallerUrl = "https://raw.githubusercontent.com/Alishahryar1/free-claude-code/main/scripts/install.ps1"
$InstallerText = Invoke-RestMethod -Uri $InstallerUrl -TimeoutSec 120
& ([scriptblock]::Create([string]$InstallerText))

$PathEntries = @(
    (Join-Path $HOME ".local\bin"),
    (Join-Path $env:APPDATA "npm")
)

foreach ($Entry in $PathEntries) {
    if (Test-Path -LiteralPath $Entry) {
        $ExistingEntries = $env:Path -split [regex]::Escape([IO.Path]::PathSeparator)
        if ($ExistingEntries -notcontains $Entry) {
            $env:Path = "$Entry$([IO.Path]::PathSeparator)$env:Path"
        }
    }
}

$FccServer = Get-Command "fcc-server" -ErrorAction Stop
$FccClaude = Get-Command "fcc-claude" -ErrorAction Stop

$VersionText = (& $FccServer.Source --version 2>&1 | Out-String).Trim()
Ok "FCC updated: $VersionText"
Info "Launcher: $($FccClaude.Source)"

Section "Installing local no-key model"

$OllamaExe = Resolve-Ollama

if ($null -eq $OllamaExe) {
    $Winget = Get-Command "winget" -ErrorAction SilentlyContinue
    if ($null -eq $Winget) {
        throw "Ollama is not installed and winget is unavailable."
    }

    Info "Installing Ollama"
    & $Winget.Source install `
        --id Ollama.Ollama `
        --exact `
        --silent `
        --accept-package-agreements `
        --accept-source-agreements

    if ($LASTEXITCODE -ne 0) {
        throw "Ollama installation failed with exit code $LASTEXITCODE."
    }

    $OllamaExe = Resolve-Ollama
    if ($null -eq $OllamaExe) {
        throw "Ollama was installed but ollama.exe could not be located."
    }
}

Ok "Ollama: $OllamaExe"
Start-Ollama $OllamaExe

$RamBytes = (Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory
$RamGB = [math]::Floor($RamBytes / 1GB)

if ($RamGB -ge 32) {
    $BaseModel = "qwen2.5-coder:14b"
    $ContextSize = 32768
}
elseif ($RamGB -ge 12) {
    $BaseModel = "qwen2.5-coder:7b"
    $ContextSize = 24576
}
else {
    $BaseModel = "qwen2.5-coder:3b"
    $ContextSize = 16384
}

Info "Detected RAM: $RamGB GB"
Info "Selected local model: $BaseModel"

& $OllamaExe pull $BaseModel
if ($LASTEXITCODE -ne 0) {
    throw "Ollama could not pull $BaseModel."
}

$ModelFile = Join-Path $env:TEMP "eushop-ollama-Modelfile-$Timestamp"
@"
FROM $BaseModel
PARAMETER num_ctx $ContextSize
PARAMETER temperature 0.15
PARAMETER repeat_penalty 1.05
"@ | Set-Content -LiteralPath $ModelFile -Encoding UTF8

& $OllamaExe create $LocalModelName -f $ModelFile
$CreateExitCode = $LASTEXITCODE
Remove-Item -LiteralPath $ModelFile -Force -ErrorAction SilentlyContinue

if ($CreateExitCode -ne 0) {
    throw "Ollama could not create the $LocalModelName model."
}

Test-OllamaModel $LocalModelName
Ok "Local model completed a real response."

Section "Configuring FCC for Ollama only"

Backup-Path $FccEnv | Out-Null

$FccValues = [ordered]@{
    "MODEL" = "ollama/$LocalModelName"
    "MODEL_FABLE" = ""
    "MODEL_OPUS" = ""
    "MODEL_SONNET" = ""
    "MODEL_HAIKU" = ""
    "OLLAMA_BASE_URL" = "http://127.0.0.1:11434"
    "DEEPSEEK_API_KEY" = ""
    "ANTHROPIC_AUTH_TOKEN" = ""
    "ENABLE_MODEL_THINKING" = "false"
    "PROVIDER_MAX_CONCURRENCY" = "1"
    "HTTP_CONNECT_TIMEOUT" = "30"
    "HTTP_READ_TIMEOUT" = "600"
    "HTTP_WRITE_TIMEOUT" = "60"
    "FCC_OPEN_BROWSER" = "false"
    "HOST" = "127.0.0.1"
    "PORT" = "$FccPort"
}

foreach ($Pair in $FccValues.GetEnumerator()) {
    Set-EnvFileValue -Path $FccEnv -Name $Pair.Key -Value ([string]$Pair.Value)
}

Ok "DeepSeek disabled."
Ok "FCC model set to ollama/$LocalModelName."
Ok "FCC proxy authentication disabled for localhost."

Section "Starting and testing FCC"

Stop-PortProcessSafely $FccPort
Start-Fcc
Test-Fcc

Ok "A real request passed through FCC to Ollama."

Section "Creating permanent launcher"

$ToolsDir = Join-Path $ProjectPath ".tools"
Ensure-Directory $ToolsDir

$QuickLauncherPath = Join-Path $ToolsDir "Start-EUshop-Claude.ps1"
$QuickLauncher = @'
#requires -Version 5.1
param([Parameter(ValueFromRemainingArguments=$true)][string[]]$ClaudeArgs)

$ErrorActionPreference = "Stop"
$ProjectPath = "D:\CODING\eushop"
$Gateway = "http://127.0.0.1:8082"

function Test-Url([string]$Url) {
    try {
        Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop |
            Out-Null
        return $true
    }
    catch {
        return $false
    }
}

$Ollama = Get-Command "ollama" -ErrorAction SilentlyContinue
if ($null -eq $Ollama) {
    $Candidate = Join-Path $env:LOCALAPPDATA "Programs\Ollama\ollama.exe"
    if (Test-Path -LiteralPath $Candidate) {
        $Ollama = Get-Item $Candidate
    }
}

if (-not (Test-Url "http://127.0.0.1:11434/api/tags")) {
    if ($null -eq $Ollama) {
        throw "Ollama is not installed."
    }
    Start-Process -FilePath $Ollama.Source -ArgumentList @("serve") -WindowStyle Hidden |
        Out-Null
    Start-Sleep -Seconds 3
}

if (-not (Test-Url "$Gateway/health") -and -not (Test-Url "$Gateway/admin")) {
    $FccServer = Get-Command "fcc-server" -ErrorAction Stop
    Start-Process -FilePath $FccServer.Source -WorkingDirectory $ProjectPath -WindowStyle Hidden |
        Out-Null
    Start-Sleep -Seconds 3
}

Remove-Item Env:ANTHROPIC_API_KEY -ErrorAction SilentlyContinue
Remove-Item Env:ANTHROPIC_AUTH_TOKEN -ErrorAction SilentlyContinue
Remove-Item Env:ANTHROPIC_BASE_URL -ErrorAction SilentlyContinue
Remove-Item Env:CLAUDE_CODE_OAUTH_TOKEN -ErrorAction SilentlyContinue

Set-Location -LiteralPath $ProjectPath
$FccClaude = Get-Command "fcc-claude" -ErrorAction Stop
& $FccClaude.Source --permission-mode acceptEdits @ClaudeArgs
'@

Set-Content -LiteralPath $QuickLauncherPath -Value $QuickLauncher -Encoding UTF8

$CommandDir = Join-Path $HOME ".local\bin"
Ensure-Directory $CommandDir
$CmdPath = Join-Path $CommandDir "eushop-claude.cmd"

@"
@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$QuickLauncherPath" %*
"@ | Set-Content -LiteralPath $CmdPath -Encoding ASCII

Ok "Permanent command created: eushop-claude"

Section "Launching Claude Code"

Set-Location -LiteralPath $ProjectPath

# The updated FCC launcher strips inherited ANTHROPIC_* variables itself.
& $FccClaude.Source --permission-mode acceptEdits
'''

path = Path("/mnt/data/Fix-EUshop-Claude-Local.ps1")
path.write_text(script, encoding="utf-8")
print(f"Created {path} with {len(script.splitlines())} lines")
