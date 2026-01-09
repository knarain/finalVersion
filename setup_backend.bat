@echo off
REM Backend Setup Script for Windows
REM Usage: setup_backend.bat

echo ================================
echo Backend Setup ^& Fix
echo ================================
echo.

REM Check if we're in the right directory
if not exist "backend\setup_database.php" (
    echo X Error: setup_database.php not found
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

echo Step 1: Running database setup...
php backend\setup_database.php

if %errorlevel% neq 0 (
    echo X Database setup failed
    pause
    exit /b 1
)

echo.
echo Step 2: Clearing cache...
if exist "backend\writable\cache" (
    rmdir /s /q "backend\writable\cache"
    mkdir "backend\writable\cache"
    echo. > "backend\writable\cache\.gitkeep"
    echo Cache cleared
)

echo.
echo Step 3: Testing API connection...
timeout /t 1 /nobreak

REM Test if curl is available
where curl >nul 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%A in ('curl -s -o nul -w "%%{http_code}" http://localhost:8000/api/roles') do (
        set HTTP_CODE=%%A
    )
    
    if "!HTTP_CODE!"=="200" (
        echo. OK - API responding correctly ^(HTTP 200^)
    ) else if "!HTTP_CODE!"=="000" (
        echo. WARNING - Backend server not running
        echo Start with: cd backend ^&^& php -S localhost:8000
    ) else (
        echo. WARNING - API returned HTTP !HTTP_CODE!
        echo Check logs in: backend\writable\logs\
    )
) else (
    echo. curl not installed, skipping API test
)

echo.
echo ================================
echo Setup Complete!
echo ================================
echo.
echo Next steps:
echo 1. Start backend server ^(if not running^):
echo    cd backend ^&^& php -S localhost:8000
echo.
echo 2. Test endpoints:
echo    curl http://localhost:8000/api/roles
echo.
echo 3. Start frontend:
echo    npm run dev
echo.
echo Issues? Check:
echo - backend\writable\logs\ for error messages
echo - BACKEND_FIX_GUIDE.md for detailed troubleshooting
echo.
pause
