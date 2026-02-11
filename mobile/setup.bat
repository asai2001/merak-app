@echo off
REM Setup script for Mobile App (React Native)

echo ========================================
echo Peacock Egg Detector - Mobile Setup
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
echo Installing mobile dependencies...
cd mobile
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install mobile dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo Mobile setup completed!
echo ========================================
echo.
echo Next steps:
echo 1. Run: npm start
echo 2. Scan QR code with Expo Go app (Android)
echo 3. Or press 'a' for Android, 'i' for iOS
echo.
pause
