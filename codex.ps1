<#
.SYNOPSIS
    Queries the multi-model AI gateway (Pekpik) using the scraped keys.
.DESCRIPTION
    Parses `free-llm-api-keys-main/README.md` and tries each parsed API key until 
    one succeeds, providing robust execution even when most keys are rate-limited.
.PARAMETER Prompt
    The natural language request or prompt to send to the model.
.PARAMETER Limit
    Maximum number of keys to try before giving up. Defaults to 25.
.EXAMPLE
    .\codex.ps1 "command to find all files ending in .json recursively"
#>
param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$Prompt,

    [Parameter(Mandatory=$false, Position=1)]
    [int]$Limit = 25
)

$PSScriptRoot = Split-Path -Parent -Path $MyInvocation.MyCommand.Definition
$readmePath = Join-Path $PSScriptRoot "free-llm-api-keys-main\README.md"
$customKeysPath = Join-Path $PSScriptRoot "custom_keys.json"

if (-not (Test-Path $readmePath) -and -not (Test-Path $customKeysPath)) {
    Write-Error "Keys list not found. Please run: python scripts/refresh_cache.py or create custom_keys.json first."
    Exit 1
}

$keys = @()

# 1. Parse custom keys from custom_keys.json
if (Test-Path $customKeysPath) {
    try {
        $customContent = Get-Content -Raw -Path $customKeysPath | ConvertFrom-Json
        foreach ($item in $customContent) {
            if ($item.key) {
                $keys += [PSCustomObject]@{
                    key      = $item.key
                    model    = if ($item.model) { $item.model } else { "gemini-2.5-flash" }
                    base_url = if ($item.base_url) { $item.base_url } else { "https://aiapiv2.pekpik.com/v1" }
                    custom   = $true
                }
            }
        }
    } catch {
        Write-Warning "Failed to parse custom keys from $customKeysPath"
    }
}

# 2. Parse keys from README.md
if (Test-Path $readmePath) {
    Write-Host "Parsing keys list from local cache..." -ForegroundColor Gray
    $content = Get-Content -Path $readmePath
    foreach ($line in $content) {
        # Match: | `sk-...` | model-name | ...
        if ($line -match "\|\s*\x60(sk-[a-zA-Z0-9_]{30,60})\x60\s*\|\s*([a-zA-Z0-9._/-]+)") {
            $key = $Matches[1].Trim()
            $model = $Matches[2].Trim()
            # Avoid duplicate keys
            $exists = $false
            foreach ($k in $keys) {
                if ($k.key -eq $key -and $k.model -eq $model) {
                    $exists = $true
                    break
                }
            }
            if (-not $exists) {
                $keys += [PSCustomObject]@{
                    key      = $key
                    model    = $model
                    base_url = "https://aiapiv2.pekpik.com/v1"
                    custom   = $false
                }
            }
        }
    }
}

if ($keys.Count -eq 0) {
    Write-Error "Failed to parse any keys."
    Exit 1
}

# Prioritize custom keys and shuffle public keys
$customKeysList = @()
$publicKeysList = @()

foreach ($k in $keys) {
    if ($k.custom) {
        $customKeysList += $k
    } else {
        $publicKeysList += $k
    }
}

$shuffledPublicKeys = $publicKeysList | Sort-Object { Get-Random }
$shuffledKeys = $customKeysList + $shuffledPublicKeys

Write-Host "Parsed $($shuffledKeys.Count) keys ($($customKeysList.Count) custom). Iterating through keys to execute prompt..." -ForegroundColor Gray

$tryCount = 0
$success = $false

foreach ($k in $shuffledKeys) {
    if ($tryCount -ge $Limit) {
        Write-Warning "Reached limit of $Limit attempts."
        break
    }
    
    $tryCount++
    $shortKey = $k.key.Substring(0, 10) + "..." + $k.key.Substring($k.key.Length - 6)
    Write-Host "[$tryCount/$Limit] Attempting model '$($k.model)' using key '$shortKey'..." -ForegroundColor Cyan

    $body = @{
        model = $k.model
        messages = @(
            @{ role = "user"; content = $Prompt }
        )
    } | ConvertTo-Json -Depth 10

    $headers = @{
        Authorization = "Bearer $($k.key)"
    }

    $baseUrl = if ($k.base_url) { $k.base_url.TrimEnd('/') } else { "https://aiapiv2.pekpik.com/v1" }

    try {
        # Fast 4-second timeout to prevent waiting on dead gateways
        $response = Invoke-RestMethod -Uri "$baseUrl/chat/completions" `
            -Method Post `
            -Headers $headers `
            -ContentType "application/json; charset=utf-8" `
            -Body $body `
            -TimeoutSec 4
            
        $content = $response.choices[0].message.content
        if ($content) {
            Write-Host "`n[OK] Success! Response from model '$($k.model)':" -ForegroundColor Green
            Write-Host $content
            $success = $true
            break
        }
    } catch {
        $status = $_.Exception.Message
        if ($_.Exception.Response) {
            try {
                $stream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($stream)
                $errBody = $reader.ReadToEnd()
                if ($errBody.Trim()) {
                    $status = $errBody.Trim()
                }
            } catch {}
        }
        Write-Host " -> Failed: $status" -ForegroundColor DarkYellow
    }
}

if (-not $success) {
    Write-Error "All $tryCount attempted keys returned errors or rate-limits. Please run: python scripts/refresh_cache.py to grab a fresh batch."
    Exit 1
}

