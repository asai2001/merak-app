# Quick Start Guide

## Prerequisites

- Python 3.9 or higher
- Node.js 18 or higher
- Git (optional)

## One-Command Setup

Run the setup script from the project root:

```bash
# Setup all components (Backend + Mobile + Web)
setup.bat

# Setup specific component only
setup.bat --backend    # Python + TensorFlow
setup.bat --mobile     # React Native + Expo
setup.bat --web        # Next.js + TensorFlow.js
```

## Manual Setup

### 1. Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Mobile Setup

```bash
cd mobile
npm install
```

### 3. Web Setup

```bash
cd web
npm install
```

## Quick Start

### 1. Prepare Dataset

Make sure your dataset is in `backend/dataset/` with the following structure:

```
backend/dataset/
├── fertil/         # Fertile egg images
│   ├── image1.jpg
│   ├── image2.jpg
│   └── ...
└── infertil/       # Infertile egg images
    ├── image1.jpg
    ├── image2.jpg
    └── ...
```

**Current Dataset Status:**
- `dataset/fertil/`: Count your images
- `dataset/infertil/`: Count your images

### 2. Train Model

```bash
cd backend\src
python train.py --data_dir ..\dataset --epochs 50 --batch_size 32
```

**Options:**
- `--data_dir`: Path to dataset (default: ../dataset)
- `--epochs`: Number of training epochs (default: 50)
- `--batch_size`: Batch size (default: 32)
- `--learning_rate`: Learning rate (default: 0.001)

### 3. Evaluate Model

```bash
cd backend\src
python evaluate.py --model_path ../models/best_model.h5 --test_dir ../dataset
```

### 4. Convert Model

**For Mobile (TFLite):**
```bash
cd backend\src
python convert_to_tflite.py --model_path ../models/best_model.h5 --output_tflite ../models/peacock_egg_classifier.tflite
```

**For Web (TensorFlow.js):**
```bash
cd backend\src
python convert_to_tflite.py --model_path ../models/best_model.h5 --convert_to_tfjs --tfjs_output ../web/public/models/peacock_egg_classifier_tfjs
```

### 5. Run Apps

**Mobile App:**
```bash
cd mobile
npm start
```
Then scan QR code with Expo Go app or press 'a' for Android, 'i' for iOS.

**Web App:**
```bash
cd web
npm run dev
```
Open browser to http://localhost:3000

## Troubleshooting

### Python/Backend Issues

**ImportError: No module named 'tensorflow'**
```bash
pip install tensorflow
```

**CUDA/GPU Issues**
If you have CUDA issues, install CPU-only TensorFlow:
```bash
pip uninstall tensorflow
pip install tensorflow-cpu
```

### Node/Mobile Issues

**Expo not found**
```bash
npm install -g expo-cli
```

**Metro bundler issues**
```bash
cd mobile
npm start -- --clear
```

**iOS build issues**
Install Xcode from Mac App Store and ensure Xcode command line tools are installed:
```bash
xcode-select --install
```

### Web Issues

**Next.js build fails**
```bash
rm -rf .next node_modules
npm install
npm run dev
```

**TensorFlow.js not loading**
Ensure the model is converted to TensorFlow.js format and placed in `web/public/models/`.

## Development Workflow

```
1. Add/modify dataset
   ↓
2. Train model (backend/src/train.py)
   ↓
3. Evaluate model (backend/src/evaluate.py)
   ↓
4. Convert to TFLite/TFJS (backend/src/convert_to_tflite.py)
   ↓
5. Copy model to mobile/web
   ↓
6. Test on mobile/web
   ↓
7. Repeat if needed
```

## Useful Commands

```bash
# Explore dataset
python backend\notebooks\01_exploration.py

# Check Python packages
pip list | findstr tensorflow

# Check Node packages
npm list --depth=0

# Clean cache
# Python
pip cache purge
# Node
npm cache clean --force

# Test TensorFlow installation
python -c "import tensorflow as tf; print(tf.__version__, tf.config.list_physical_devices())"
```

## Getting Help

- Check [PROJECT_DESIGN.md](PROJECT_DESIGN.md) for detailed architecture
- Check individual README files: [backend/README.md](backend/README.md), [mobile/README.md](mobile/README.md), [web/README.md](web/README.md)
- Search issues on GitHub (if available)
- Check TensorFlow documentation: https://www.tensorflow.org/
