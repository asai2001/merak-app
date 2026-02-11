@echo off
REM Setup script for Peacock Egg Fertility Detection Project

echo ========================================
echo Peacock Egg Detector - Setup Script
echo ========================================
echo.

echo [1/5] Checking Python version...
python --version
if %errorlevel% neq 0 (
    echo ERROR: Python not found. Please install Python 3.9 or higher.
    pause
    exit /b 1
)
echo.

echo [2/5] Creating virtual environment...
python -m venv venv
if %errorlevel% neq 0 (
    echo WARNING: Failed to create virtual environment. Installing to system Python.
) else (
    echo Activating virtual environment...
    call venv\Scripts\activate.bat
)
echo.

echo [3/5] Installing Python dependencies...
echo This may take a while, please be patient...
echo.

REM Install dependencies one by one for better error handling
echo Installing TensorFlow...
pip install tensorflow>=2.16.0 --quiet --no-warn-script-location
if %errorlevel% neq 0 (
    echo ERROR: Failed to install TensorFlow
    pause
    exit /b 1
)

echo Installing NumPy...
pip install numpy --quiet --no-warn-script-location

echo Installing Pandas...
pip install pandas --quiet --no-warn-script-location

echo Installing OpenCV...
pip install opencv-python --quiet --no-warn-script-location

echo Installing Matplotlib...
pip install matplotlib --quiet --no-warn-script-location

echo Installing Scikit-learn...
pip install scikit-learn --quiet --no-warn-script-location

echo Installing Pillow...
pip install Pillow --quiet --no-warn-script-location

echo Installing TensorFlow.js converter...
pip install tensorflowjs --quiet --no-warn-script-location

echo Installing additional packages...
pip install scipy seaborn tqdm --quiet --no-warn-script-location

echo.
echo [4/5] Verifying installations...
python -c "import tensorflow; print('TensorFlow:', tensorflow.__version__)"
python -c "import numpy; print('NumPy:', numpy.__version__)"
python -c "import cv2; print('OpenCV:', cv2.__version__)"
python -c "import matplotlib; print('Matplotlib:', matplotlib.__version__)"
python -c "import sklearn; print('Scikit-learn:', sklearn.__version__)"
echo.

echo [5/5] Checking dataset...
if not exist "dataset\fertil" (
    echo WARNING: dataset\fertil directory not found
)
if not exist "dataset\infertil" (
    echo WARNING: dataset\infertil directory not found
)

if exist "dataset\fertil" (
    echo Found dataset\fertil with:
    dir /b dataset\fertil | find /c ".jpg" images
)
if exist "dataset\infertil" (
    echo Found dataset\infertil with:
    dir /b dataset\infertil | find /c ".jpg" images
)

echo.
echo ========================================
echo Setup completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Verify your dataset in dataset\ folder
echo 2. Run: python src\train.py --data_dir ..\dataset --epochs 50
echo.
echo For more information, see README.md
echo.
pause
