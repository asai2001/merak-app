@echo off
REM Master setup script for Peacock Egg Fertility Detection Project

echo ========================================
echo Peacock Egg Detector - Master Setup
echo ========================================
echo.
echo This script will set up all components:
echo   1. Backend (Python + TensorFlow)
echo   2. Mobile App (React Native + Expo)
echo   3. Web App (Next.js + TensorFlow.js)
echo.

set SETUP_ALL=1

if "%1"=="--backend" set SETUP_ALL=0
if "%1"=="--mobile" set SETUP_ALL=0
if "%1"=="--web" set SETUP_ALL=0

if "%SETUP_ALL%"=="1" (
    echo Setting up ALL components...
    echo.
) else if "%1"=="--backend" (
    echo Setting up BACKEND only...
    echo.
) else if "%1"=="--mobile" (
    echo Setting up MOBILE only...
    echo.
) else if "%1"=="--web" (
    echo Setting up WEB only...
    echo.
)

if "%SETUP_ALL%"=="1" goto :all
if "%1"=="--backend" goto :backend
if "%1"=="--mobile" goto :mobile
if "%1"=="--web" goto :web

:all
echo [1/3] Setting up Backend...
call backend\setup.bat
if %errorlevel% neq 0 (
    echo ERROR: Backend setup failed
    pause
    exit /b 1
)
echo.

echo [2/3] Setting up Mobile...
call mobile\setup.bat
if %errorlevel% neq 0 (
    echo ERROR: Mobile setup failed
    pause
    exit /b 1
)
echo.

echo [3/3] Setting up Web...
call web\setup.bat
if %errorlevel% neq 0 (
    echo ERROR: Web setup failed
    pause
    exit /b 1
)
echo.

goto :done

:backend
echo Setting up Backend...
call backend\setup.bat
goto :done

:mobile
echo Setting up Mobile...
call mobile\setup.bat
goto :done

:web
echo Setting up Web...
call web\setup.bat
goto :done

:done
echo ========================================
echo Setup completed successfully!
echo ========================================
echo.
echo Quick Start:
echo.
echo 1. Train Model:
echo    cd backend\src
echo    python train.py --data_dir ..\dataset --epochs 50
echo.
echo 2. Run Mobile App:
echo    cd mobile
echo    npm start
echo.
echo 3. Run Web App:
echo    cd web
echo    npm run dev
echo.
echo For more information, see README.md
echo.
pause
