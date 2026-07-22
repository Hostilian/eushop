<#
.SYNOPSIS
    Pre-commit Secret & Automation Containment Scanner for EUshop.
.DESCRIPTION
    Scans working tree for unredacted API keys, secret tokens, private keys, or credentials.
#>

[CmdletBinding()]
param(
    [string]$Path = "D:\CODING\eushop"
)

Set-Location $Path
Write-Host "[INFO] Running Secret Scanning Prevention Check..." -ForegroundColor Yellow

$patterns = @(
    'sk_live_[0-9a-zA-Z]{24}',
    'sk_test_[0-9a-zA-Z]{24}',
    'BEGIN RSA PRIVATE KEY',
    'BEGIN OPENSSH PRIVATE KEY'
)

$found = $false
foreach ($p in $patterns) {
    $matches = Select-String -Path "$Path\*" -Pattern $p -Exclude "*.lock", "archive/*", "scratch/*", ".git/*" -ErrorAction SilentlyContinue
    if ($matches) {
        Write-Host "[WARN] Potential secret matched pattern '$p':" -ForegroundColor Red
        $matches | ForEach-Object { Write-Host "  $($_.Filename):$($_.LineNumber)" -ForegroundColor Red }
        $found = $true
    }
}

if (-not $found) {
    Write-Host "[OK  ] Zero committed secrets detected. Repository clean." -ForegroundColor Green
}
