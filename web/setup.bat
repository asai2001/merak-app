@echo off
REM Setup script for Web App (Next.js)

echo ========================================
echo Peacock Egg Detector - Web Setup
echo ========================================
echo.

echo Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Installing web dependencies...
cd web
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install web dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo Web setup completed!
echo ========================================
echo.
echo Next steps:
echo 1. Run: npm run dev
echo 2. Open browser to http://localhost:3000
echo.
pause
