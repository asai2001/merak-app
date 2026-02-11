# IDENTIFIKASI FERTILITAS TELUR MERAK MENGGUNAKAN CNN
# Project Design Document

## 1. Overview

Project ini adalah aplikasi multi-platform untuk mengidentifikasi fertilitas telur merak menggunakan Convolutional Neural Network (CNN). Aplikasi ini terdiri dari:

1. **Aplikasi Mobile (React Native)** - Platform utama untuk penggunaan di smartphone (Android & iOS)
2. **Aplikasi Web (React/Next.js)** - Platform pendukung untuk penggunaan di browser

Aplikasi akan memungkinkan pengguna untuk mengupload atau mengambil foto telur merak dan mendapatkan prediksi apakah telur tersebut fertile atau infertile beserta confidence score.

## 2. Tech Stack

### Backend / Model Training
- **Python 3.9+**
- **TensorFlow 2.15+ / Keras**
- **NumPy**
- **Pandas**
- **OpenCV**
- **Matplotlib** (untuk visualisasi)
- **Scikit-learn** (untuk metrik evaluasi)

### Mobile Application (React Native)
- **React Native 0.73+** (JavaScript/TypeScript)
- **TensorFlow Lite React Native** (tflite-react-native)
- **react-native-image-picker** (untuk mengambil gambar)
- **react-native-camera** atau **expo-camera** (untuk akses kamera)
- **@react-native-async-storage/async-storage** (local storage)
- **Redux Toolkit** atau **Context API** (state management)
- **React Navigation** (navigation)

### Web Application (React/Next.js)
- **React 18+** atau **Next.js 14+** (TypeScript)
- **TensorFlow.js** (untuk inference di browser)
- **Tailwind CSS** atau **styled-components** (styling)
- **Zustand** atau **Redux Toolkit** (state management)

### Tools Tambahan
- **Jupyter Notebook** (untuk eksperimen model)
- **Git** (version control)
- **Postman** (untuk testing API jika perlu)
- **Expo** (React Native development toolkit)

## 3. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                  MOBILE APP (React Native)                  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Camera    │  │   Gallery   │  │   Result    │         │
│  │   Screen    │  │   Screen    │  │   Screen    │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         └────────────────┼────────────────┘                 │
│                          │                                  │
│                 ┌────────▼────────┐                        │
│                 │  Image Handler  │                        │
│                 │  & Preprocessor │                        │
│                 └────────┬────────┘                        │
│                          │                                  │
│                 ┌────────▼────────┐                        │
│                 │  TFLite Model   │                        │
│                 │  (Inference)    │                        │
│                 └────────┬────────┘                        │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │

┌──────────────────────────┼──────────────────────────────────┐
│                  WEB APP (React/Next.js)                     │
├──────────────────────────┼──────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Upload    │  │   Gallery   │  │   Result    │         │
│  │   Screen    │  │   Screen    │  │   Screen    │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         └────────────────┼────────────────┘                 │
│                          │                                  │
│                 ┌────────▼────────┐                        │
│                 │  Image Handler  │                        │
│                 │  & Preprocessor │                        │
│                 └────────┬────────┘                        │
│                          │                                  │
│                 ┌────────▼────────┐                        │
│                 │ TensorFlow.js  │                        │
│                 │  (Inference)    │                        │
│                 └────────┬────────┘                        │
│                          │                                  │
└──────────────────────────┼──────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │  .tflite /   │
                    │  tfjs model  │
                    └─────────────┘

┌─────────────────────────────────────────────────────────────┐
│                MODEL TRAINING (Python)                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Data      │  │  Model      │  │   Model     │         │
│  │ Collection  │  │  Training   │  │ Evaluation  │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         ▼                ▼                ▼                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Dataset/   │  │  models/    │  │  metrics/   │         │
│  │  images/    │  │  *.h5       │  │  *.csv      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## 4. Struktur Folder Project

```
MerakApp/
│
├── backend/                          # Python untuk training model
│   ├── dataset/
│   │   ├── fertile/                  # Gambar telur fertile
│   │   ├── infertile/                # Gambar telur infertile
│   │   └── raw/                      # Gambar original
│   ├── models/                       # Model yang disimpan
│   │   ├── best_model.h5              # Model terbaik (HDF5)
│   │   └── peacock_egg_classifier.tflite # TFLite model
│   ├── notebooks/                    # Jupyter notebooks
│   │   ├── 01_exploration.ipynb      # Eksplorasi data
│   │   ├── 02_preprocessing.ipynb    # Preprocessing
│   │   ├── 03_training.ipynb         # Training model
│   │   └── 04_evaluation.ipynb       # Evaluasi model
│   ├── scripts/                      # Python scripts
│   │   ├── preprocess.py             # Script preprocessing
│   │   ├── train.py                  # Script training
│   │   ├── evaluate.py               # Script evaluasi
│   │   └── convert_to_tflite.py      # Konversi ke TFLite
│   ├── src/                          # Source code
│   │   ├── data_loader.py            # Loading data
│   │   ├── model.py                  # Arsitektur CNN
│   │   ├── train.py                  # Training loop
│   │   ├── evaluate.py               # Evaluasi
│   │   └── utils.py                  # Utility functions
│   ├── requirements.txt              # Python dependencies
│   └── README.md                     # Backend documentation
│
└── mobile/                           # React Native app
    ├── src/
    │   ├── App.tsx                   # Entry point
    │   ├── AppNavigator.tsx          # Navigation configuration
    │   ├── models/                   # Data models
    │   │   └── EggResult.ts          # Type definitions
    │   ├── screens/                  # UI Screens
    │   │   ├── HomeScreen.tsx        # Home
    │   │   ├── CameraScreen.tsx      # Kamera
    │   │   ├── GalleryScreen.tsx     # Gallery
    │   │   ├── ResultScreen.tsx      # Hasil prediksi
    │   │   └── HistoryScreen.tsx     # Riwayat prediksi
    │   ├── components/               # Reusable components
    │   │   ├── Button.tsx
    │   │   ├── Card.tsx
    │   │   └── Loading.tsx
    │   ├── services/                 # Services
    │   │   ├── ImageService.ts       # Image picker & camera
    │   │   ├── MLService.ts          # TFLite inference
    │   │   └── StorageService.ts     # AsyncStorage wrapper
    │   ├── store/                    # State management (Redux/Zustand)
    │   │   ├── index.ts
    │   │   └── eggSlice.ts
    │   ├── utils/                    # Utilities
    │   │   ├── constants.ts          # Constants
    │   │   └── imageUtils.ts         # Image processing utilities
    │   └── hooks/                    # Custom hooks
    │       └── useEggDetection.ts
    ├── assets/
    │   ├── images/                   # Placeholder images
    │   └── models/                   # TFLite model
    │       └── peacock_egg_classifier.tflite
    ├── android/
    ├── ios/
    ├── package.json                  # React Native dependencies
    └── README.md                     # Mobile documentation
│
└── web/                              # React/Next.js web app
    ├── src/
    │   ├── app/                      # Next.js app directory (atau src/)
    │   │   ├── page.tsx              # Home page
    │   │   ├── layout.tsx            # Root layout
    │   │   └── globals.css           # Global styles
    │   ├── components/               # React components
    │   │   ├── Navbar.tsx
    │   │   ├── Hero.tsx
    │   │   ├── UploadSection.tsx
    │   │   ├── ResultDisplay.tsx
    │   │   └── HistorySection.tsx
    │   ├── services/
    │   │   ├── ImageService.ts       # Image handling
    │   │   └── MLService.ts          # TensorFlow.js inference
    │   ├── store/                    # State management
    │   │   └── useEggStore.ts        # Zustand store
    │   ├── utils/
    │   │   ├── constants.ts
    │   │   └── imageUtils.ts
    │   └── hooks/
    │       └── useEggDetection.ts
    ├── public/
    │   └── models/                   # TensorFlow.js model
    │       └── peacock_egg_classifier_tfjs/
    ├── package.json                  # Web dependencies
    ├── next.config.js                # Next.js config
    └── README.md                     # Web documentation
```

## 5. Flow Alur Kerja

### 5.1 Alur Training Model (Python)
```
1. Data Collection
   └── Kumpulkan gambar telur merak (fertile & infertile)

2. Data Organization
   └── Pisahkan gambar ke folder fertile/ dan infertile/

3. Data Preprocessing
   ├─ Resize gambar ke ukuran target (224x224)
   ├─ Normalisasi pixel values (0-1)
   └─ Data augmentation (rotate, flip, brightness, etc.)

4. Split Dataset
   ├─ Training set (70-80%)
   ├─ Validation set (10-15%)
   └─ Test set (10-15%)

5. Model Architecture Design
   └─ Bangun CNN layers (Conv2D, MaxPooling, Dense, etc.)

6. Model Training
   ├─ Compile model dengan optimizer & loss function
   ├─ Train dengan training data
   ├─ Validasi dengan validation data
   └─ Simpan best model

7. Model Evaluation
   ├─ Test dengan test data
   ├─ Hitung metrik (accuracy, precision, recall, F1)
   └─ Confusion matrix & classification report

8. Model Conversion
   └─ Convert .h5 ke .tflite untuk deployment

9. Deployment
   └─ Copy .tflite ke Flutter app assets
```

### 5.2 Alur Aplikasi Mobile (React Native)
```
1. User membuka aplikasi
   └─ Tampilan Home dengan 2 opsi: Kamera / Gallery

2. User memilih opsi
   ├─ KAMERA:
   │   ├─ Request camera permission
   │   ├─ Buka kamera device (react-native-camera/expo-camera)
   │   ├─ Ambil foto telur
   │   └─ Lanjut ke preprocessing
   └─ GALLERY:
       ├─ Request gallery permission
       ├─ Buka galeri (react-native-image-picker)
       ├─ Pilih foto telur
       └─ Lanjut ke preprocessing

3. Preprocessing Image
   ├─ Resize ke 224x224 (react-native-image-resizer)
   ├─ Normalisasi pixel values
   └─ Convert ke tensor format untuk TFLite

4. Model Inference
   ├─ Load TFLite model (tflite-react-native)
   ├─ Jalankan inference pada gambar tensor
   └─ Dapatkan probabilitas (fertile/infertile)

5. Display Result
   ├─ Tampilkan gambar yang di-upload
   ├─ Tampilkan hasil prediksi
   ├─ Tampilkan confidence score
   └─ Tampilkan penjelasan singkat

6. Save History
   └─ Simpan hasil ke AsyncStorage

7. User dapat:
   ├─ Kembali ke Home
   ├─ Lihat History
   └─ Foto ulang
```

### 5.3 Alur Aplikasi Web (React/Next.js)
```
1. User membuka website
   └─ Tampilan Home dengan opsi: Upload Image

2. User memilih opsi
   ├─ UPLOAD IMAGE:
   │   ├─ Klik tombol upload atau drag & drop
   │   ├─ Pilih file dari komputer
   │   └─ Preview image
   └─ PASTE/DRAG & DROP:
       ├─ Drag file ke upload area
       └─ Preview image

3. Preprocessing Image
   ├─ Resize canvas ke 224x224
   ├─ Extract pixel data
   ├─ Normalisasi pixel values (0-1)
   └─ Convert ke tensor format untuk TensorFlow.js

4. Model Inference
   ├─ Load TensorFlow.js model
   ├─ Jalankan inference pada image tensor
   └─ Dapatkan probabilitas (fertile/infertile)

5. Display Result
   ├─ Tampilkan gambar yang di-upload
   ├─ Tampilkan hasil prediksi
   ├─ Tampilkan confidence score
   └─ Tampilkan penjelasan singkat

6. Save History (Local Storage)
   └─ Simpan hasil ke browser localStorage

7. User dapat:
   ├─ Upload gambar lain
   ├─ Lihat History
   └─ Bagikan hasil
```

## 6. Langkah-langkah Implementasi

### Phase 1: Setup & Data Collection (Week 1)
- [ ] Setup environment Python, React Native, dan Next.js
- [ ] Setup Expo (opsional) untuk React Native development
- [ ] Buat struktur folder untuk backend, mobile, dan web
- [ ] Kumpulkan dataset telur merak
- [ ] Organisasikan gambar ke folder fertile/infertile
- [ ] Target: 500-1000 gambar per class

### Phase 2: Data Exploration & Preprocessing (Week 2)
- [ ] Exploratory Data Analysis (EDA)
- [ ] Implementasi image augmentation
- [ ] Implementasi data loader
- [ ] Split dataset (train/val/test)
- [ ] Visualisasi data

### Phase 3: Model Development (Week 3-4)
- [ ] Desain arsitektur CNN
- [ ] Implementasi model
- [ ] Training initial model
- [ ] Hyperparameter tuning
- [ ] Training final model

### Phase 4: Model Evaluation & Optimization (Week 5)
- [ ] Evaluasi model dengan test set
- [ ] Hitung metrik evaluasi
- [ ] Confusion matrix analysis
- [ ] Convert model ke TFLite
- [ ] Test TFLite model inference

### Phase 5: React Native App Development (Week 6-8)
- [ ] Setup React Native project (Expo atau CLI)
- [ ] Install dependencies (tflite-react-native, image-picker, camera, etc.)
- [ ] Setup navigation (React Navigation)
- [ ] Implementasi screens (Home, Camera, Gallery, Result, History)
- [ ] Implementasi state management (Redux/Zustand)
- [ ] Integrasi TFLite model
- [ ] Implementasi image preprocessing
- [ ] Implementasi inference logic dengan tflite-react-native
- [ ] Implementasi AsyncStorage untuk history
- [ ] UI/UX improvements
- [ ] Testing di Android dan iOS (jika memungkinkan)

### Phase 6: Web App Development (Week 6-8)
- [ ] Setup Next.js project
- [ ] Install dependencies (TensorFlow.js, Tailwind CSS)
- [ ] Implementasi pages (Home, Upload, Result, History)
- [ ] Implementasi state management (Zustand)
- [ ] Convert TFLite model ke TensorFlow.js format
- [ ] Integrasi TensorFlow.js model
- [ ] Implementasi image preprocessing di browser
- [ ] Implementasi inference logic
- [ ] Implementasi localStorage untuk history
- [ ] UI/UX improvements
- [ ] Responsive design testing

### Phase 7: Testing & Refinement (Week 9-10)
- [ ] Unit testing (React Native & Web)
- [ ] Integration testing
- [ ] Uji coba dengan real data telur merak
- [ ] Cross-browser testing untuk web
- [ ] Device testing untuk mobile
- [ ] Bug fixing
- [ ] Performance optimization
- [ ] Accessibility testing

### Phase 8: Deployment (Week 11-12)
- [ ] Build APK/AAB untuk Android
- [ ] Build IPA untuk iOS (jika ada Mac & Apple Developer account)
- [ ] Build production build untuk Next.js (Vercel/Netlify)
- [ ] Prepare app store listing (Play Store)
- [ ] Test pada berbagai devices dan browsers
- [ ] Deploy ke Play Store
- [ ] Deploy web app ke Vercel/Netlify
- [ ] Documentation final

## 7. Spesifikasi Model CNN

### Arsitektur Model (Baseline)
```
Input Layer: (224, 224, 3)

Conv2D (32 filters, 3x3, ReLU)
MaxPooling2D (2x2)
Dropout (0.25)

Conv2D (64 filters, 3x3, ReLU)
MaxPooling2D (2x2)
Dropout (0.25)

Conv2D (128 filters, 3x3, ReLU)
MaxPooling2D (2x2)
Dropout (0.25)

Flatten

Dense (128, ReLU)
Dropout (0.5)

Dense (64, ReLU)
Dropout (0.5)

Output Dense (2, Softmax) [fertile, infertile]
```

### Hyperparameters
- **Optimizer**: Adam (learning_rate=0.001)
- **Loss Function**: Categorical Crossentropy
- **Batch Size**: 32
- **Epochs**: 50 dengan Early Stopping
- **Image Size**: 224x224
- **Data Augmentation**:
  - Rotation: 15 degrees
  - Width/Height shift: 0.1
  - Horizontal flip
  - Zoom: 0.1
  - Brightness: 0.2

### Metrik Evaluasi
- **Accuracy**: > 90%
- **Precision**: > 85%
- **Recall**: > 85%
- **F1 Score**: > 85%

## 8. Spesifikasi API (Jika Diperlukan)

### Endpoint Model Update (Opsional)
```
POST /api/model/update
Headers: Content-Type: application/octet-stream
Body: TFLite model file
Response: { success: true, version: "1.0.0" }
```

### Endpoint Upload untuk Cloud Inference (Opsional)
```
POST /api/predict
Headers: Content-Type: multipart/form-data
Body: image file
Response: {
  prediction: "fertile",
  confidence: 0.95,
  probabilities: {
    fertile: 0.95,
    infertile: 0.05
  }
}
```

### TensorFlow.js Model Conversion
Untuk web app, TFLite model perlu di-convert ke format TensorFlow.js:

```bash
# Install TensorFlow.js converter
pip install tensorflowjs

# Convert TFLite ke TFJS
tensorflowjs_converter \
  --input_format=tf_lite \
  --output_format=tfjs_graph_model \
  models/peacock_egg_classifier.tflite \
  web/public/models/peacock_egg_classifier_tfjs/
```

File hasil convert:
- `model.json` - Model architecture & weights metadata
- `group1-shard*.bin` - Binary weights files

## 9. UI/UX Outline

### Mobile - Home Screen
- Logo/Nama Aplikasi
- Subtitle: "Identifikasi Fertilitas Telur Merak"
- Button: "Ambil Foto" (Camera)
- Button: "Pilih dari Galeri" (Gallery)
- Button: "Riwayat" (History)
- Info text singkat

### Web - Home Screen
- Navbar dengan logo & navigation links
- Hero section dengan judul & deskripsi
- Upload area (drag & drop atau click to browse)
- Button: "Lihat Riwayat" (History)
- Features/Cards section
- Footer

### Camera Screen
- Camera preview
- Capture button
- Cancel button
- Guide frame overlay

### Gallery Screen
- Grid view gambar
- Select image
- Preview selected image
- Confirm button

### Result Screen
- Uploaded image preview
- Result badge (Fertile/Infertile)
- Confidence score (percentage)
- Progress bar
- Brief explanation
- Buttons: "Kembali", "Foto Ulang"

### History Screen
- List of previous predictions
- Date & time
- Thumbnail image
- Result & confidence
- Delete option

## 10. Dependencies

### Python (requirements.txt)
```
tensorflow==2.15.0
numpy==1.24.3
pandas==2.0.3
opencv-python==4.8.1.78
matplotlib==3.7.2
scikit-learn==1.3.0
keras==2.15.0
Pillow==10.0.0
jupyter==1.0.0
tensorflowjs (untuk convert ke TensorFlow.js)
```

### React Native (package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-native": "^0.73.0",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/native-stack": "^6.9.17",
    "react-native-screens": "^3.27.0",
    "react-native-safe-area-context": "^4.8.2",
    "@tensorflow/tfjs-react-native": "^1.0.0",
    "react-native-fs": "^2.20.0",
    "expo-camera": "^14.0.0",
    "expo-image-picker": "^14.7.0",
    "@react-native-async-storage/async-storage": "^1.19.3",
    "react-native-image-resizer": "^3.0.6",
    "@reduxjs/toolkit": "^2.0.1",
    "react-redux": "^9.0.4",
    "@expo/vector-icons": "^13.0.0"
  }
}
```

### Web (package.json)
```json
{
  "dependencies": {
    "next": "^14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tensorflow/tfjs": "^4.15.0",
    "@tensorflow/tfjs-backend-webgl": "^4.15.0",
    "zustand": "^4.4.7",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.5",
    "@types/react": "^18.2.45",
    "typescript": "^5.3.3",
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

## 11. Risk & Mitigation

| Risiko | Mitigasi |
|--------|----------|
| Dataset terlalu sedikit | Data augmentation, transfer learning |
| Model overfitting | Regularization, early stopping, cross-validation |
| Device tidak support TensorFlow Lite | Minimum device requirements, fallback ke API |
| Performa inference lambat | Model quantization, model optimization |
| UI/UX tidak user-friendly | User testing, iterative design |
| Browser tidak support WebGL | Fallback ke WASM backend untuk TensorFlow.js |
| Cross-platform inconsistencies | Share core logic between platforms, extensive testing |
| iOS deployment complexity | Gunakan Expo EAS untuk build process |

## 12. Future Enhancements

- [ ] Batch prediction (multiple eggs)
- [ ] Export laporan ke PDF
- [ ] Integration dengan cloud untuk continuous learning
- [ ] Multi-language support
- [ ] Dark mode
- [ ] User authentication & cloud sync (Firebase/Supabase)
- [ ] Advanced metrics dashboard
- [ ] Model versioning & A/B testing
- [ ] Support untuk spesies telur lain
- [ ] Video frame analysis
- [ ] Real-time camera inference di mobile
- [ ] PWA (Progressive Web App) untuk web
- [ ] API backend service untuk inference di cloud
- [ ] Admin panel untuk managing dataset dan model

## 13. Timeline Summary

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Setup & Data | Week 1 | Dataset collected & organized |
| Preprocessing | Week 2 | Preprocessed data & visualizations |
| Model Development | Week 3-4 | Trained CNN model |
| Evaluation & Optimization | Week 5 | Optimized TFLite & TFJS models |
| React Native App Development | Week 6-8 | Functional React Native app |
| Web App Development | Week 6-8 | Functional React/Next.js web app |
| Testing & Refinement | Week 9-10 | Tested & optimized apps |
| Deployment | Week 11-12 | Deployed mobile & web apps & documentation |

---

**Total Duration**: 12 Weeks (3 Months)
**Team Size**: 1-2 Developers
**Difficulty**: Intermediate-Advanced

**Platform Support**:
- Mobile: Android + iOS (via React Native)
- Web: All modern browsers (via Next.js + TensorFlow.js)
