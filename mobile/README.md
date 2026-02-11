# Mobile App - Peacock Egg Fertility Classification

Aplikasi mobile React Native untuk identifikasi fertilitas telur merak menggunakan TensorFlow Lite.

## Tech Stack

- **React Native 0.73+** - Framework mobile cross-platform
- **Expo** - Development toolkit
- **TensorFlow Lite** - Model inference on-device
- **Redux Toolkit** - State management
- **React Navigation** - Navigation

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy TFLite model ke folder assets:
```bash
cp ../backend/models/peacock_egg_classifier.tflite assets/models/
```

3. Start development server:
```bash
npm start
```

4. Run on Android:
```bash
npm run android
```

5. Run on iOS:
```bash
npm run ios
```

## Struktur Folder

```
mobile/
├── src/
│   ├── App.tsx              # Entry point
│   ├── AppNavigator.tsx     # Navigation configuration
│   ├── models/              # TypeScript type definitions
│   │   └── EggResult.ts     # Type untuk hasil prediksi
│   ├── screens/             # UI Screens
│   │   ├── HomeScreen.tsx   # Home page
│   │   ├── CameraScreen.tsx # Camera capture
│   │   ├── GalleryScreen.tsx # Gallery picker
│   │   ├── ResultScreen.tsx  # Result display
│   │   └── HistoryScreen.tsx # History view
│   ├── components/          # Reusable components
│   │   ├── Button.tsx       # Custom button
│   │   ├── Card.tsx         # Card component
│   │   └── Loading.tsx      # Loading indicator
│   ├── services/            # Services
│   │   ├── ImageService.ts  # Image picker & camera
│   │   ├── MLService.ts     # TFLite inference
│   │   └── StorageService.ts # AsyncStorage wrapper
│   ├── store/               # Redux store
│   │   ├── index.ts         # Store configuration
│   │   └── eggSlice.ts      # Egg detection slice
│   ├── utils/               # Utilities
│   │   ├── constants.ts     # Constants
│   │   └── imageUtils.ts    # Image processing
│   └── hooks/               # Custom hooks
│       └── useEggDetection.ts # Egg detection hook
├── assets/                  # Static assets
│   ├── images/              # Placeholder images
│   └── models/              # TFLite model
│       └── peacock_egg_classifier.tflite
└── package.json             # Dependencies
```

## Screens

### HomeScreen
Halaman utama dengan opsi:
- Ambil foto dari kamera
- Pilih dari galeri
- Lihat riwayat prediksi

### CameraScreen
Kamera untuk mengambil foto telur merak secara langsung.

### GalleryScreen
Memilih gambar dari galeri perangkat.

### ResultScreen
Menampilkan hasil prediksi:
- Gambar yang di-upload
- Prediksi (Fertile/Infertile)
- Confidence score

### HistoryScreen
Daftar riwayat prediksi yang tersimpan di local storage.

## Permissions

Aplikasi memerlukan permission berikut:
- Camera (untuk mengambil foto)
- Read/Write External Storage (untuk galeri)

## Build

### Android
```bash
npx expo build:android
```

### iOS
Memerlukan Mac dan Xcode:
```bash
npx expo build:ios
```
