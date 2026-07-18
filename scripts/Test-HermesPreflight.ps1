#Requires -Version 5.1
param(
    [string]$ProjectPath = "D:\CODING\eushop",
    [int]$FccPort = 8082,
    [switch]$FailFast
)
Set-StrictMode -Version 2.0
$ErrorActionPreference = "Continue"
$REPO_ROOT  = [System.IO.Path]::GetFullPath($ProjectPath)
$FCC_HOME   = Join-Path $env:USERPROFILE ".fcc"
$FCC_ENV    = Join-Path $FCC_HOME ".env"
$GATEWAY    = "http://127.0.0.1:$FccPort"
$passed  = 0
$warned  = 0
$failed  = 0
$results = [System.Collections.Generic.List[hashtable]]::new()

function Test-Check {
    param([string]$Name, [scriptblock]$Check, [string]$Severity = "ERROR")
    $result = @{ name = $Name; severity = $Severity; status = "SKIP"; detail = "" }
    try {
        $output = & $Check
        $status = if ($output -is [bool]) { $output } else { [bool]$output }
        if ($status) {
            $result.status = "PASS"; $script:passed++
            Write-Host "  [PASS] $Name" -ForegroundColor Green
        } else {
            $result.status = if ($Severity -eq "WARN" -or $Severity -eq "INFO") { "WARN" } else { "FAIL" }
            if ($result.status -eq "WARN") { $script:warned++ } else { $script:failed++ }
            $icon = if ($result.status -eq "WARN") { "[WARN]" } else { "[FAIL]" }
            $color = if ($result.status -eq "WARN") { "Yellow" } else { "Red" }
            Write-Host "  $icon $Name" -ForegroundColor $color
            if ($FailFast -and $Severity -eq "CRITICAL") { Write-Host "  Critical. Aborting." -ForegroundColor Red; exit 9 }
        }
    } catch {
        $result.status = "ERROR"; $result.detail = $_.Exception.Message; $script:failed++
        Write-Host "  [ERR ] $Name : $($_.Exception.Message)" -ForegroundColor Red
    }
    $results.Add($result) | Out-Null
}

function Get-FccSetting([string]$Name) {
    if (-not (Test-Path -LiteralPath $FCC_ENV)) { return $null }
    $pattern = "^\s*" + [regex]::Escape($Name) + "\s*=(.*)$"
    foreach ($line in Get-Content -LiteralPath $FCC_ENV) {
        if ($line -match $pattern) { return $Matches[1].Trim().Trim('"').Trim("'") }
    }
    return $null
}

Write-Host ""
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  EUshop Hermes/FCC Preflight Test Suite" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor DarkGray
Write-Host ""

# --- Repository ---
Write-Host "Repository" -ForegroundColor DarkCyan
Test-Check "Repository exists" { Test-Path -LiteralPath $REPO_ROOT -PathType Container } "CRITICAL"
Test-Check "Git repository" { Test-Path -LiteralPath (Join-Path $REPO_ROOT ".git") -PathType Container } "ERROR"
Test-Check "PowerShell version >= 5.1" { $PSVersionTable.PSVersion.Major -ge 5 } "CRITICAL"

# --- Executables ---
Write-Host ""
Write-Host "Executables" -ForegroundColor DarkCyan
Test-Check "Hermes executable in PATH" { $null -ne (Get-Command hermes.exe -ErrorAction SilentlyContinue) } "ERROR"
Test-Check "Hermes version check" {
    $exeCmd = Get-Command hermes.exe -ErrorAction SilentlyContinue
    if (-not $exeCmd) { return $false }
    $v = & $exeCmd.Source --version 2>&1 | Out-String
    $v -match "Hermes"
} "ERROR"
Test-Check "Claude executable in PATH" { $null -ne (Get-Command claude.exe -ErrorAction SilentlyContinue) } "WARN"
Test-Check "FCC server executable exists" { Test-Path -LiteralPath (Join-Path $env:USERPROFILE ".local\bin\fcc-server.exe") } "WARN"
Test-Check "FCC work launcher exists" { Test-Path -LiteralPath (Join-Path $env:USERPROFILE ".local\bin\fcc-work.cmd") } "WARN"

# --- Configuration ---
Write-Host ""
Write-Host "Configuration" -ForegroundColor DarkCyan
Test-Check "Hermes config.yaml exists" { Test-Path -LiteralPath (Join-Path $env:LOCALAPPDATA "hermes\config.yaml") } "WARN"
Test-Check "FCC .env file exists" { Test-Path -LiteralPath $FCC_ENV } "WARN"
Test-Check "FCC ANTHROPIC_AUTH_TOKEN present" {
    $token = Get-FccSetting -Name "ANTHROPIC_AUTH_TOKEN"
    -not [string]::IsNullOrWhiteSpace($token) -and $token.Length -gt 4
} "WARN"
Test-Check "No duplicate provider IDs" {
    $hf = Join-Path $REPO_ROOT ".agent-state\provider-health.json"
    if (-not (Test-Path -LiteralPath $hf)) { return $true }
    $h = Get-Content -LiteralPath $hf -Raw | ConvertFrom-Json
    $ids = @($h.providers | Select-Object -ExpandProperty id)
    $ids.Count -eq ($ids | Sort-Object -Unique).Count
} "ERROR"

# --- Security ---
Write-Host ""
Write-Host "Security" -ForegroundColor DarkCyan
Test-Check "custom_keys.json not git-tracked" { -not (git ls-files --error-unmatch custom_keys.json 2>$null) } "CRITICAL"
Test-Check ".env.local not git-tracked" { -not (git ls-files --error-unmatch .env.local 2>$null) } "CRITICAL"
Test-Check "data/validated_keys.json not git-tracked" { -not (git ls-files --error-unmatch data/validated_keys.json 2>$null) } "WARN"
Test-Check "No ANTHROPIC_API_KEY in process env" { [string]::IsNullOrWhiteSpace($env:ANTHROPIC_API_KEY) } "WARN"
Test-Check "CLAUDE.md has no raw API keys" {
    $f = Join-Path $REPO_ROOT "CLAUDE.md"
    if (-not (Test-Path -LiteralPath $f)) { return $true }
    $c = Get-Content -LiteralPath $f -Raw
    -not ($c -match 'sk-ant-[a-zA-Z0-9]{20,}|sk-or-[a-zA-Z0-9]{20,}|AIza[a-zA-Z0-9_\-]{30,}')
} "CRITICAL"

# --- Providers ---
Write-Host ""
Write-Host "Providers" -ForegroundColor DarkCyan
Test-Check "FCC gateway reachable" {
    try { $r = Invoke-RestMethod -Uri "$GATEWAY/health" -TimeoutSec 4 -ErrorAction Stop; $r.status -eq "healthy" } catch { $false }
} "WARN"
Test-Check "OpenRouter key in FCC env" {
    $k = Get-FccSetting -Name "OPENROUTER_API_KEY"
    -not [string]::IsNullOrWhiteSpace($k) -and $k.Length -gt 8
} "WARN"
Test-Check "At least 2 providers configured" {
    $hf = Join-Path $REPO_ROOT ".agent-state\provider-health.json"
    if (-not (Test-Path -LiteralPath $hf)) { return $false }
    $h = Get-Content -LiteralPath $hf -Raw | ConvertFrom-Json
    @($h.providers | Where-Object { $_.enabled -and $_.credential_present }).Count -ge 2
} "WARN"

# --- Paths ---
Write-Host ""
Write-Host "Windows paths" -ForegroundColor DarkCyan
Test-Check "No accidental nul file" { -not (Test-Path -LiteralPath (Join-Path $REPO_ROOT "nul")) } "INFO"
Test-Check "No accidental backtick dir" {
    $bt = [char]96; $n = "The content you provided for " + $bt + "apps"
    -not (Test-Path -LiteralPath (Join-Path $REPO_ROOT $n) -PathType Container)
} "INFO"
Test-Check "Launcher script exists" { Test-Path -LiteralPath (Join-Path $REPO_ROOT "Start-EUshop-Hermes.ps1") } "ERROR"
Test-Check "Health script exists" { Test-Path -LiteralPath (Join-Path $REPO_ROOT "scripts\Get-HermesHealth.ps1") } "WARN"

# --- Summary ---
$total = $passed + $warned + $failed
Write-Host ""
Write-Host "-------------------------------------------------------" -ForegroundColor DarkGray
$color = if ($failed -gt 0) { "Red" } elseif ($warned -gt 0) { "Yellow" } else { "Green" }
Write-Host ("  Results: " + $passed + "/" + $total + " passed, " + $warned + " warnings, " + $failed + " failures") -ForegroundColor $color

$reportDir = Join-Path $REPO_ROOT ".agent-state\reports\tests"
if (-not (Test-Path -LiteralPath $reportDir)) { New-Item -ItemType Directory -Path $reportDir -Force | Out-Null }
$ts = Get-Date -Format "yyyyMMdd-HHmmss"
$reportPath = Join-Path $reportDir ("preflight-" + $ts + ".json")
@{ timestamp=(Get-Date -Format "o"); passed=$passed; warned=$warned; failed=$failed; total=$total } |
    ConvertTo-Json | Set-Content -LiteralPath $reportPath

Write-Host ("  Report: " + $reportPath)
Write-Host ""

if ($failed -gt 0) { exit 2 }
if ($warned -gt 0) { exit 1 }
exit 0
