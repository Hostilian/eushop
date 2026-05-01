@echo off
REM Automated API Test Suite for Windows
REM Tests all major endpoints and validates responses

setlocal enabledelayedexpansion

set API_URL=http://localhost:3001/api
set TOKEN=eyJzdWIiOiJ1c2VyLTEyMyIsImVtYWlsIjoic2VsbGVyMUBleGFtcGxlLmNvbSIsImV4cCI6OTk5OTk5OTk5OX0=
set PASS=0
set FAIL=0

echo ==================================================
echo EU Specialty Food Marketplace - API Test Suite
echo ==================================================
echo.

REM Check if API is running
echo Checking API connectivity...
curl -s %API_URL%/foods >nul 2>&1
if errorlevel 1 (
    echo [ERROR] API is not responding on %API_URL%
    echo Make sure you've run: demo-setup.bat
    exit /b 1
)
echo [OK] API is responding
echo.

REM ===== FOOD ENDPOINTS =====
echo === FOOD ENDPOINTS ===

echo Testing: List Foods (GET /foods)...
curl -s -o nul -w "HTTP %%{http_code}\n" %API_URL%/foods | find "200" >nul
if errorlevel 1 (
    echo [FAIL] Expected 200
    set /a FAIL+=1
) else (
    echo [PASS] HTTP 200
    set /a PASS+=1
)

echo Testing: Search Foods (GET /foods?query=chocolate)...
curl -s -o nul -w "HTTP %%{http_code}\n" "%API_URL%/foods?query=chocolate" | find "200" >nul
if errorlevel 1 (
    echo [FAIL] Expected 200
    set /a FAIL+=1
) else (
    echo [PASS] HTTP 200
    set /a PASS+=1
)

echo Testing: Filter by Country (GET /foods?country=BE)...
curl -s -o nul -w "HTTP %%{http_code}\n" "%API_URL%/foods?country=BE" | find "200" >nul
if errorlevel 1 (
    echo [FAIL] Expected 200
    set /a FAIL+=1
) else (
    echo [PASS] HTTP 200
    set /a PASS+=1
)

echo Testing: Get Trending Foods (GET /foods/trending)...
curl -s -o nul -w "HTTP %%{http_code}\n" "%API_URL%/foods/trending" | find "200" >nul
if errorlevel 1 (
    echo [FAIL] Expected 200
    set /a FAIL+=1
) else (
    echo [PASS] HTTP 200
    set /a PASS+=1
)

echo Testing: Get Food by ID (GET /foods/1)...
curl -s -o nul -w "HTTP %%{http_code}\n" %API_URL%/foods/1 | find "200" >nul
if errorlevel 1 (
    echo [FAIL] Expected 200
    set /a FAIL+=1
) else (
    echo [PASS] HTTP 200
    set /a PASS+=1
)

echo Testing: Get Invalid Food (GET /foods/99999)...
curl -s -o nul -w "HTTP %%{http_code}\n" %API_URL%/foods/99999 | find "404" >nul
if errorlevel 1 (
    echo [FAIL] Expected 404
    set /a FAIL+=1
) else (
    echo [PASS] HTTP 404
    set /a PASS+=1
)
echo.

REM ===== USER ENDPOINTS =====
echo === USER ENDPOINTS ===

echo Testing: Get User Profile (GET /users/1)...
curl -s -o nul -w "HTTP %%{http_code}\n" %API_URL%/users/1 | find "200" >nul
if errorlevel 1 (
    echo [FAIL] Expected 200
    set /a FAIL+=1
) else (
    echo [PASS] HTTP 200
    set /a PASS+=1
)

echo Testing: Get All Users (GET /users)...
curl -s -o nul -w "HTTP %%{http_code}\n" %API_URL%/users | find "200" >nul
if errorlevel 1 (
    echo [FAIL] Expected 200
    set /a FAIL+=1
) else (
    echo [PASS] HTTP 200
    set /a PASS+=1
)

echo Testing: Get Top Sellers (GET /users/sellers/top)...
curl -s -o nul -w "HTTP %%{http_code}\n" %API_URL%/users/sellers/top | find "200" >nul
if errorlevel 1 (
    echo [FAIL] Expected 200
    set /a FAIL+=1
) else (
    echo [PASS] HTTP 200
    set /a PASS+=1
)

echo Testing: Get Invalid User (GET /users/99999)...
curl -s -o nul -w "HTTP %%{http_code}\n" %API_URL%/users/99999 | find "404" >nul
if errorlevel 1 (
    echo [FAIL] Expected 404
    set /a FAIL+=1
) else (
    echo [PASS] HTTP 404
    set /a PASS+=1
)
echo.

REM ===== ERROR HANDLING =====
echo === ERROR HANDLING ===

echo Testing: Missing Auth Header (POST /foods) should return 401...
curl -s -o nul -w "HTTP %%{http_code}\n" -X POST %API_URL%/foods | find "401" >nul
if errorlevel 1 (
    echo [FAIL] Expected 401
    set /a FAIL+=1
) else (
    echo [PASS] HTTP 401
    set /a PASS+=1
)

echo Testing: Invalid Endpoint (GET /invalid)...
curl -s -o nul -w "HTTP %%{http_code}\n" %API_URL%/invalid | find "404" >nul
if errorlevel 1 (
    echo [FAIL] Expected 404
    set /a FAIL+=1
) else (
    echo [PASS] HTTP 404
    set /a PASS+=1
)
echo.

REM ===== SERVICE HEALTH =====
echo === SERVICE HEALTH ===

echo Checking PostgreSQL...
docker-compose exec -T postgres psql -U postgres -d eushop -tc "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo [FAIL] PostgreSQL not responding
    set /a FAIL+=1
) else (
    echo [OK] PostgreSQL is running
    set /a PASS+=1
)

echo Checking Redis...
docker-compose exec -T redis redis-cli ping >nul 2>&1
if errorlevel 1 (
    echo [FAIL] Redis not responding
    set /a FAIL+=1
) else (
    echo [OK] Redis is running
    set /a PASS+=1
)

echo Checking API Gateway...
curl -s %API_URL%/foods >nul 2>&1
if errorlevel 1 (
    echo [FAIL] API Gateway not responding
    set /a FAIL+=1
) else (
    echo [OK] API Gateway is running
    set /a PASS+=1
)

echo Checking Frontend...
curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo [FAIL] Frontend not responding
    set /a FAIL+=1
) else (
    echo [OK] Frontend is running
    set /a PASS+=1
)
echo.

REM ===== RESULTS =====
echo ==================================================
echo Test Results
echo ==================================================
echo Passed: %PASS%
echo Failed: %FAIL%
set /a TOTAL=%PASS%+%FAIL%
echo Total: %TOTAL%
echo.

if %FAIL% equ 0 (
    echo [SUCCESS] All tests passed!
    exit /b 0
) else (
    echo [ERROR] Some tests failed. Please review.
    exit /b 1
)
