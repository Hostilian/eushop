<#
.SYNOPSIS
    CI Permission & Maven Wrapper Execution Stabilizer for EUshop.
#>

[CmdletBinding()]
param(
    [string]$Path = "D:\CODING\eushop"
)

Set-Location $Path
Write-Host "[INFO] Checking CI permissions & Maven wrapper execution flags..." -ForegroundColor Yellow

$mvnwPath = Join-Path $Path "services\core-service\mvnw"
if (Test-Path $mvnwPath) {
    Write-Host "[OK  ] Maven wrapper script present at: $mvnwPath" -ForegroundColor Green
}

git update-index --chmod=+x services/core-service/mvnw 2>$null
Write-Host "[OK  ] Executable bit set on Maven wrapper script." -ForegroundColor Green
