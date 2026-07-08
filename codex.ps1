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

if (-not (Test-Path $readmePath)) {
    Write-Error "Local keys list not found at $readmePath. Please run: python scripts/refresh_cache.py to fetch keys first."
    Exit 1
}

# 1. Parse keys from README.md
Write-Host "Parsing keys list from local cache..." -ForegroundColor Gray
$keys = @()
$content = Get-Content -Path $readmePath
foreach ($line in $content) {
    # Match: | `sk-...` | model-name | ...
    if ($line -match "\|\s*\x60(sk-[a-zA-Z0-9_]{30,60})\x60\s*\|\s*([a-zA-Z0-9._/-]+)") {
        $key = $Matches[1].Trim()
        $model = $Matches[2].Trim()
        $keys += [PSCustomObject]@{
            key   = $key
            model = $model
        }
    }
}

if ($keys.Count -eq 0) {
    Write-Error "Failed to parse any keys from $readmePath."
    Exit 1
}

# Shuffle keys to distribute traffic and avoid hitting same exhausted keys sequentially
$shuffledKeys = $keys | Sort-Object { Get-Random }

Write-Host "Parsed $($shuffledKeys.Count) keys. Iterating through keys to execute prompt..." -ForegroundColor Gray

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

    try {
        # Fast 4-second timeout to prevent waiting on dead gateways
        $response = Invoke-RestMethod -Uri "https://aiapiv2.pekpik.com/v1/chat/completions" `
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
