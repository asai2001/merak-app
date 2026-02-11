# Langkah Selanjutnya - Peacock Egg Fertility Detection

## Status Project

**Dataset Status:**
- Fertil: 677 gambar
- Infertil: 240 gambar

## 1. Setup Semua Komponen

### Opsi A - Setup Otomatis (Recommended)
```bash
setup.bat
```

### Opsi B - Setup Manual

#### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

#### Mobile Setup
```bash
cd mobile
npm install
```

#### Web Setup
```bash
cd web
npm install
```

## 2. Train Model

```bash
cd backend\src
python train.py --data_dir ..\dataset --epochs 50 --batch_size 32
```

**Parameters:**
- `--data_dir`: Path dataset (default: ../dataset)
- `--epochs`: Jumlah epoch training (default: 50)
- `--batch_size`: Ukuran batch (default: 32)
- `--learning_rate`: Learning rate (default: 0.001)

## 3. Convert Model

### Untuk Mobile (TFLite)
```bash
python convert_to_tflite.py --model_path ..\models\best_model.h5 --output_tflite ..\models\peacock_egg_classifier.tflite
```

Copy model ke mobile:
```bash
copy ..\models\peacock_egg_classifier.tflite ..\..\mobile\assets\
```

### Untuk Web (TensorFlow.js)
```bash
python convert_to_tflite.py --model_path ..\models\best_model.h5 --convert_to_tfjs --tfjs_output ..\..\web\public\models\peacock_egg_classifier_tfjs
```

## 4. Running Aplikasi

### Mobile App
```bash
cd mobile
npm start
```
- Scan QR code dengan Expo Go
- Atau tekan 'a' untuk Android, 'i' untuk iOS

### Web App
```bash
cd web
npm run dev
```
- Buka browser di http://localhost:3000

## Alur Kerja Development

```
1. Setup Environment
   ↓
2. Prepare Dataset (done)
   ↓
3. Train Model
   ↓
4. Evaluate Model
   ↓
5. Convert Model (TFLite/TFJS)
   ↓
6. Deploy ke Mobile/Web
   ↓
7. Test Aplikasi
   ↓
8. Iterate jika perlu
```

## Evaluasi Model (Optional)

```bash
cd backend\src
python evaluate.py --model_path ..\models\best_model.h5 --test_dir ..\dataset
```

## Troubleshooting

### Backend Issues
```bash
# Jika ada issue dengan TensorFlow GPU
pip uninstall tensorflow
pip install tensorflow-cpu
```

### Mobile Issues
```bash
# Clear Metro cache
cd mobile
npm start -- --clear
```

### Web Issues
```bash
# Clear Next.js cache
cd web
rm -rf .next node_modules
npm install
npm run dev
```

## Useful Commands

```bash
# Cek instalasi Python/TensorFlow
python -c "import tensorflow as tf; print(tf.__version__)"

# Cek instalasi Node/Expo
node --version
npm --version
npx expo --version

# Lihat semua package
pip list
npm list --depth=0
```

## Target Metrics

- Accuracy: > 90%
- Precision: > 85%
- Recall: > 85%
- F1 Score: > 85%

## Dokumentasi Lengkap

- [README.md](README.md) - Overview project
- [QUICKSTART.md](QUICKSTART.md) - Panduan lengkap setup
- [PROJECT_DESIGN.md](PROJECT_DESIGN.md) - Detail arsitektur
