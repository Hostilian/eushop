<#
 .SYNOPSIS
   EUshop All Versions and Application Views Local Launcher
 .DESCRIPTION
   Launches all historical version views and flagship application routes on http://localhost:3002.
#>

$BaseUrl = "http://localhost:3002"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "          EUshop - Launching ALL Historical Versions and Views    " -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "[INFO] Opening all version routes on $BaseUrl..." -ForegroundColor Green

$versionRoutes = @(
    "/versions",
    "/?v=v243",
    "/v177/",
    "/v132/",
    "/v122/",
    "/v121/",
    "/atlas",
    "/?v=v66",
    "/?v=v55",
    "/?v=v44",
    "/?v=v1",
    "/?v=v2",
    "/become-seller/?v=v3",
    "/admin/dashboard/?v=v4",
    "/docs/?v=v5",
    "/map",
    "/cart",
    "/allergen-filter",
    "/admin/moderation",
    "/disputes"
)

foreach ($route in $versionRoutes) {
    $url = "$BaseUrl$route"
    Write-Host "  -> Opening Version View: $url" -ForegroundColor Gray
    Start-Process $url
    Start-Sleep -Milliseconds 200
}

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "[OK] All version views and flagship routes opened in browser." -ForegroundColor Green
