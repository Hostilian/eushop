<#
 .SYNOPSIS
   EUshop Local HTTP Development Launcher
 .DESCRIPTION
   Launches all EUshop version pages via the local HTTP server on http://localhost:3002.
#>

$BaseUrl = "http://localhost:3002"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "          EUshop - Launching Web Application on Localhost        " -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "[INFO] Opening HTTP routes on $BaseUrl..." -ForegroundColor Green

$routes = @(
    "/versions",
    "/",
    "/map",
    "/atlas",
    "/cart",
    "/become-seller",
    "/allergen-filter",
    "/admin/moderation",
    "/admin/dashboard",
    "/disputes",
    "/docs"
)

foreach ($route in $routes) {
    $url = "$BaseUrl$route"
    Write-Host "  -> Opening: $url" -ForegroundColor Gray
    Start-Process $url
    Start-Sleep -Milliseconds 300
}

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "[OK] All requested HTTP views opened in browser." -ForegroundColor Green
