# IDENTIFIKASI FERTILITAS TELUR MERAK MENGGUNAKAN CNN

Project aplikasi multi-platform untuk mengidentifikasi fertilitas telur merak menggunakan Convolutional Neural Network (CNN).

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 18+

### One-Command Setup
```bash
# Setup semua komponen
setup.bat

# Setup komponen tertentu saja
setup.bat --backend    # Python + TensorFlow
setup.bat --mobile     # React Native + Expo
setup.bat --web        # Next.js
```

### Manual Setup
Lihat [QUICKSTART.md](QUICKSTART.md) untuk panduan lengkap setup.

## Platform

- **Mobile** (React Native + TFLite) - Android & iOS
- **Web** (Next.js + TensorFlow.js) - Semua browser modern

## Tech Stack

### Backend
- Python 3.9+
- TensorFlow 2.15+
- Keras
- NumPy, Pandas, OpenCV
- Scikit-learn

### Mobile
- React Native 0.73+
- Expo
- TensorFlow Lite
- Redux Toolkit
- React Navigation

### Web
- Next.js 14+
- React 18+
- TypeScript
- TensorFlow.js
- Tailwind CSS
- Zustand

## Project Structure

```
MerakApp/
├── backend/           # Python backend untuk training model
│   ├── dataset/       # Dataset gambar telur merak
│   ├── models/        # Model yang disimpan (.h5, .tflite)
│   ├── notebooks/     # Jupyter notebooks
│   ├── scripts/       # Python scripts
│   └── src/          # Source code training
│       ├── model.py           # Arsitektur CNN
│       ├── data_loader.py     # Data loading
│       ├── train.py           # Training script
│       ├── evaluate.py        # Evaluasi script
│       ├── convert_to_tflite.py # Konversi ke TFLite
│       └── utils.py           # Utilities
├── mobile/           # React Native app
│   ├── src/
│   │   ├── screens/    # UI screens
│   │   ├── components/ # Reusable components
│   │   ├── services/   # Services (image, ML, storage)
│   │   ├── store/      # Redux store
│   │   ├── utils/      # Utilities
│   │   └── hooks/      # Custom hooks
│   └── assets/        # TFLite model
└── web/              # Next.js web app
    ├── src/
    │   ├── app/       # Next.js pages
    │   ├── components/ # React components
    │   ├── services/   # Services (image, ML)
    │   ├── store/     # Zustand store
    │   ├── utils/     # Utilities
    │   └── hooks/     # Custom hooks
    └── public/       # TensorFlow.js model
```

## Quick Start

### 1. Setup Backend

```bash
cd backend
pip install -r requirements.txt
```

### 2. Prepare Dataset

Kumpulkan gambar telur merak dan organisaikan:
- `backend/dataset/fertile/` - Gambar telur fertile
- `backend/dataset/infertile/` - Gambar telur infertile

### 3. Train Model

```bash
cd backend/src
python train.py --data_dir ../dataset --epochs 50
```

### 4. Convert Model to TFLite & TFJS

```bash
# Convert ke TFLite untuk mobile
python convert_to_tflite.py --model_path ../models/best_model.h5

# Convert ke TensorFlow.js untuk web
python convert_to_tflite.py --convert_to_tfjs
```

### 5. Setup Mobile

```bash
cd mobile
npm install
npm start
```

### 6. Setup Web

```bash
cd web
npm install
npm run dev
```

## Documentation

### Primary Documentation
- 📖 **[PANDUAN LENGKAP CNN MERAK](PANDUAN_LENGKAP_CNN_MERAK.md)** - Panduan lengkap training, deployment, dan troubleshooting
- 🔧 **[PERBAIKAN AKURASI MODEL](PERBAIKAN_AKURASI_MODEL.md)** - Solusi untuk class imbalance dan akurasi rendah

### Component Documentation
- [Backend README](backend/README.md)
- [Mobile README](mobile/README.md)
- [Web README](web/README.md)
- [Project Design Document](PROJECT_DESIGN.md)

### Quick Start
- 🚀 **[DEPLOYMENT_GUIDE](DEPLOYMENT_GUIDE.md)** - Panduan deployment cepat

## Model Architecture

CNN baseline architecture:
- 3 Conv2D layers (32, 64, 128 filters)
- MaxPooling2D layers
- Dropout for regularization
- Dense layers (128, 64 neurons)
- Output layer (2 classes: fertile, infertile)

## Model Metrics

Target metrics:
- Accuracy: > 90%
- Precision: > 85%
- Recall: > 85%
- F1 Score: > 85%

## Features

### Mobile App
- Camera capture
- Gallery picker
- On-device inference (TFLite)
- Local storage history
- Offline support

### Web App
- Drag & drop upload
- Image preview
- Browser-based inference (TensorFlow.js)
- LocalStorage history
- Responsive design

## Future Enhancements

- Batch prediction
- Export laporan PDF
- Cloud sync
- Multi-language support
- Real-time camera inference
- PWA support
- Admin panel

## License

MIT License

## Contact

Project ini dibuat untuk tujuan edukasi dan riset identifikasi fertilitas telur merak.
