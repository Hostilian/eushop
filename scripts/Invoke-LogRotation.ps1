#Requires -Version 5.1
<#
.SYNOPSIS
    EUshop Production Log Manager & Log Rotation Service
.DESCRIPTION
    Structured JSON & plain-text logging with ISO 8601 timestamps, log levels, PID tracking,
    correlation IDs, secret redactor, and file size rotation (5MB cap, 10 file retention).
#>

param(
    [string]$ProjectPath = "D:\CODING\eushop",
    [string]$LogName = "unattended-runner.log",
    [int]$MaxSizeBytes = 5242880, # 5 MB
    [int]$MaxFiles = 10
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = "SilentlyContinue"

$LogDir = Join-Path $ProjectPath ".agent-state\logs"
if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

$LogPath = Join-Path $LogDir $LogName

function Redact-Secrets([string]$text) {
    if (-not $text) { return "" }
    # Redact common key patterns
    $redacted = $text -replace '(?i)(api[_-]?key|secret|password|bearer\s+|token)["\s:=]+([a-zA-Z0-9_\-\.]{8,})', '$1: [REDACTED]'
    $redacted = $redacted -replace 'sk-[a-zA-Z0-9]{20,}', 'sk-[REDACTED]'
    return $redacted
}

function Invoke-RotateLogs {
    param([string]$targetLog)

    if (-not (Test-Path -LiteralPath $targetLog)) { return }

    $file = Get-Item -LiteralPath $targetLog
    if ($file.Length -lt $MaxSizeBytes) { return }

    # Rotate files: log.9 -> delete, log.8 -> log.9, ..., log -> log.1
    for ($i = $MaxFiles - 1; $i -ge 1; $i--) {
        $oldFile = "$targetLog.$i"
        $newFile = "$targetLog.$($i + 1)"
        if (Test-Path -LiteralPath $oldFile) {
            if ($i + 1 -gt $MaxFiles) {
                Remove-Item -LiteralPath $oldFile -Force -ErrorAction SilentlyContinue
            } else {
                Move-Item -LiteralPath $oldFile -Destination $newFile -Force -ErrorAction SilentlyContinue
            }
        }
    }

    $firstArchive = "$targetLog.1"
    Move-Item -LiteralPath $targetLog -Destination $firstArchive -Force -ErrorAction SilentlyContinue
    New-Item -ItemType File -Path $targetLog -Force | Out-Null
}

function Write-StructuredLog {
    param(
        [string]$Message,
        [string]$Level = "INFO",
        [string]$Service = "eushop-unattended",
        [string]$CorrelationId = "",
        [string]$Provider = "",
        [int]$DurationMs = 0
    )

    Invoke-RotateLogs -targetLog $LogPath

    $ts = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    $safeMsg = Redact-Secrets $Message

    $logEntry = [ordered]@{
        timestamp      = $ts
        level          = $Level.ToUpper()
        service        = $Service
        pid            = $PID
        correlation_id = if ($CorrelationId) { $CorrelationId } else { [Guid]::NewGuid().ToString("N").Substring(0, 8) }
        provider       = $Provider
        duration_ms    = $DurationMs
        message        = $safeMsg
    }

    $jsonLine = $logEntry | ConvertTo-Json -Compress
    Add-Content -LiteralPath $LogPath -Value $jsonLine -ErrorAction SilentlyContinue

    $color = switch ($Level.ToUpper()) {
        "ERROR"   { "Red" }
        "WARN"    { "Yellow" }
        "SUCCESS" { "Green" }
        "OK"      { "Green" }
        default   { "Cyan" }
    }

    Write-Host "[$ts][$Level][$Service][PID:$PID] $safeMsg" -ForegroundColor $color
}

# Export functions for dot-sourcing
Export-ModuleMember -Function Write-StructuredLog, Invoke-RotateLogs, Redact-Secrets -ErrorAction SilentlyContinue
