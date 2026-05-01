@echo off
setlocal enabledelayedexpansion

REM Colors and formatting
for /F %%A in ('copy /Z "%~f0" nul') do set "BS=%%A"

cls
echo ========================================
echo EU Specialty Food Marketplace - Demo Setup
echo ========================================
echo.

REM Check prerequisites
echo Checking prerequisites...
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Docker is not installed
    exit /b 1
)

where pnpm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    where npm >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo Error: npm/pnpm is not installed
        exit /b 1
    )
)

where mvn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Maven is not installed
    exit /b 1
)
echo [OK] All prerequisites installed
echo.

REM Setup environment
echo Setting up environment...
if exist .env.example (
    copy .env.example .env.local >nul 2>nul
) else (
    echo No .env.example found
)

if exist services\api-gateway\.env.example (
    copy services\api-gateway\.env.example services\api-gateway\.env >nul 2>nul
) else (
    echo No API Gateway .env.example found
)

REM Create necessary directories
for %%D in (entity repository service controller dto) do (
    if not exist "services\core-service\src\main\java\com\eushop\core\%%D" (
        mkdir "services\core-service\src\main\java\com\eushop\core\%%D"
    )
)

echo [OK] Environment configured
echo.

REM Install dependencies
echo Installing Node dependencies...
where pnpm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    call pnpm install
) else (
    call npm install
)
echo [OK] Node dependencies installed
echo.

REM Start Docker services
echo Starting Docker containers...
call docker-compose up -d
timeout /t 5 /nobreak
echo [OK] Docker containers started
echo.

REM Run database migrations
echo Running database migrations...
where pnpm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    call pnpm db:migrate
) else (
    call npm run db:migrate
)
timeout /t 2 /nobreak
echo [OK] Database migrations complete
echo.

REM Seed database
echo Seeding database...
where pnpm >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    call pnpm db:seed
) else (
    call npm run db:seed
)
timeout /t 2 /nobreak
echo [OK] Database seeded
echo.

REM Build Spring Boot
echo Building Spring Boot Core Service...
cd services\core-service
call mvn clean package -DskipTests -q
cd ..\..
echo [OK] Spring Boot built
echo.

REM Show summary
cls
echo ========================================
echo Demo Setup Complete!
echo ========================================
echo.

echo Services Starting:
echo   * Frontend:       http://localhost:3000
echo   * API Gateway:    http://localhost:3001/api
echo   * Core Service:   http://localhost:8080/api
echo   * PostgreSQL:     localhost:5432
echo   * Redis:          localhost:6379
echo.

echo To start development:
echo   pnpm dev
echo.

echo Demo Credentials:
echo   Email:    seller1@example.com
echo   Password: password123
echo.

echo Next Steps:
echo   1. Run: pnpm dev
echo   2. Open: http://localhost:3000
echo   3. Sign up or login with demo credentials
echo   4. Browse foods and explore the marketplace
echo.

echo Documentation:
echo   * DEVELOPMENT.md - Full development guide
echo   * PHASE-2-IMPLEMENTATION.md - Architecture overview
echo   * API.md - API endpoint reference
echo   * DEMO-GUIDE.md - Demo walkthrough
echo.

pause
