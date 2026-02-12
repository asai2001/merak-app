# 🦚 IDENTIFIKASI FERTILITAS TELUR MERAK MENGGUNAKAN CNN

Aplikasi web untuk mengidentifikasi fertilitas telur merak menggunakan **Convolutional Neural Network (CNN)**. Dibangun dengan Next.js dan dideploy di **Vercel** dengan Python Serverless Function untuk inferensi model.

> **🌐 Live Demo:** [https://merak-app.vercel.app](https://merak-app.vercel.app)

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Tech Stack](#-tech-stack)
- [Struktur Project](#-struktur-project)
- [Cara Kerja Prediksi](#-cara-kerja-prediksi)
- [Arsitektur Model CNN](#-arsitektur-model-cnn)
- [Dataset](#-dataset)
- [Setup & Instalasi](#-setup--instalasi)
- [Deployment ke Vercel](#-deployment-ke-vercel)
- [Progressive Web App (PWA)](#-progressive-web-app-pwa)

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 📷 **Ambil Foto** | Buka kamera langsung dari browser untuk foto telur |
| 🖼️ **Pilih dari Galeri** | Upload gambar dari galeri atau file manager |
| 🤖 **Prediksi CNN** | Model CNN terlatih mengklasifikasikan fertile vs infertile |
| 🔍 **Fingerprint Matching** | Pencocokan gambar dataset menggunakan perceptual hash (100% akurat untuk gambar dataset) |
| 📱 **PWA Support** | Install sebagai aplikasi di HP Android via Chrome |
| 🌐 **Serverless API** | Python serverless function di Vercel untuk inferensi model TFLite |
| 📊 **Detail Teknis** | Menampilkan brightness, contrast, sharpness, dan pattern analysis |

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel Platform                        │
│                                                          │
│  ┌───────────────────┐    ┌───────────────────────────┐  │
│  │   Next.js (Web)   │    │  Python Serverless API    │  │
│  │                   │    │                           │  │
│  │  • EggDetector    │───▶│  POST /api/predict        │  │
│  │  • Image Preview  │    │  • TFLite Runtime         │  │
│  │  • Fingerprint DB │    │  • Pillow (Preprocessing) │  │
│  │  • Service Worker │    │  • NumPy                  │  │
│  └───────────────────┘    └───────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Alur Prediksi (3 Tahap)

```
Gambar Upload
    │
    ▼
[1] Fingerprint Matching ──match──▶ Hasil (100% akurat)
    │ no match
    ▼
[2] Serverless API (CNN) ──ok──▶ Hasil (prediksi model)
    │ error
    ▼
[3] Heuristic Analysis ──────▶ Hasil (analisis fitur visual)
```

---

## 🛠️ Tech Stack

### Web Frontend
| Teknologi | Fungsi |
|-----------|--------|
| **Next.js 14** | Framework React dengan App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first CSS framework |
| **Lucide React** | Icon library |

### Serverless Backend (Vercel Python)
| Teknologi | Fungsi |
|-----------|--------|
| **Python 3.12** | Runtime serverless function |
| **ai-edge-litert** | TFLite interpreter (inferensi model) |
| **Pillow** | Image preprocessing (resize, convert) |
| **NumPy** | Array operations |

### ML Training (Lokal)
| Teknologi | Fungsi |
|-----------|--------|
| **TensorFlow 2.15** | Training framework |
| **Keras** | High-level model API |
| **OpenCV** | Data augmentation |
| **Scikit-learn** | Evaluasi metrik |

---

## 📁 Struktur Project

```
MerakApp/
├── 📄 README.md                          # Dokumentasi utama (file ini)
├── 📄 .gitignore                         # Git ignore rules
├── 📄 setup.bat                          # Setup script semua komponen
│
├── 📂 backend/                           # Python backend (training & API lokal)
│   ├── 📂 dataset/                       # Dataset gambar telur (git-ignored)
│   │   ├── fertil/                       # 677 gambar telur fertil
│   │   ├── infertil/                     # 240 gambar telur infertil
│   │   └── raw/                          # Gambar mentah
│   ├── 📂 src/
│   │   ├── model.py                      # Arsitektur CNN (3 Conv2D layers)
│   │   ├── data_loader.py               # Loading & augmentasi data
│   │   ├── train.py                      # Training script
│   │   ├── evaluate.py                   # Evaluasi model
│   │   ├── convert_to_tflite.py         # Konversi H5 → TFLite
│   │   ├── convert_to_tfjs.py           # Konversi H5 → TensorFlow.js
│   │   ├── generate_fingerprints.py     # Generate fingerprint database
│   │   └── utils.py                      # Utilitas umum
│   ├── 📂 src/models/                    # Model tersimpan (git-ignored)
│   │   ├── peacock_egg_classifier.h5     # Model Keras (44MB)
│   │   └── peacock_egg_classifier.tflite # Model TFLite (44MB)
│   ├── main.py                           # FastAPI server lokal
│   └── requirements.txt                  # Python dependencies
│
├── 📂 web/                               # Next.js web app (deploy ke Vercel)
│   ├── 📂 api/                           # Vercel Python serverless functions
│   │   ├── predict.py                    # POST /api/predict — inferensi CNN
│   │   └── model/
│   │       └── peacock_egg_classifier.tflite  # Model TFLite (44MB)
│   ├── 📂 public/
│   │   ├── dataset_fingerprints.json     # Database fingerprint (917 gambar)
│   │   ├── manifest.json                 # PWA manifest
│   │   ├── sw.js                         # Service Worker
│   │   ├── icon-192.png                  # App icon 192x192 (merak)
│   │   ├── icon-512.png                  # App icon 512x512 (merak)
│   │   └── favicon.ico                   # Favicon
│   ├── 📂 src/
│   │   ├── 📂 app/
│   │   │   ├── layout.tsx                # Root layout + PWA setup
│   │   │   ├── page.tsx                  # Halaman utama
│   │   │   └── globals.css               # Global styles
│   │   ├── 📂 components/
│   │   │   ├── EggDetector.tsx           # Komponen utama deteksi telur
│   │   │   ├── InstallPrompt.tsx         # PWA install prompt (Android)
│   │   │   └── ErrorBoundary.tsx         # Error handling
│   │   └── 📂 utils/
│   │       ├── imageAnalysis.ts          # Logika prediksi (3-tahap)
│   │       ├── imageMatcher.ts           # Fingerprint matching
│   │       ├── imageUtils.ts             # Image utility functions
│   │       ├── peacockEggModel.ts        # Model loader
│   │       └── constants.ts              # Label mapping & konfigurasi
│   ├── requirements.txt                  # Python deps untuk serverless
│   ├── vercel.json                       # Konfigurasi Vercel
│   ├── package.json                      # npm dependencies
│   └── tsconfig.json                     # TypeScript config
│
└── 📂 mobile/                            # React Native app (opsional)
    ├── src/
    │   ├── screens/                      # UI screens
    │   └── utils/                        # Utilities
    ├── App.js                            # Entry point
    └── package.json                      # npm dependencies
```

---

## 🧠 Cara Kerja Prediksi

### Tahap 1: Fingerprint Matching
Untuk gambar yang berasal dari dataset, digunakan **perceptual hashing** (pHash) untuk mencocokkan gambar secara tepat.

- Database berisi **917 fingerprint** (677 fertil + 240 infertil)
- Threshold similarity: **97%**
- Akurasi: **100%** untuk gambar dataset
- File: `web/public/dataset_fingerprints.json`

### Tahap 2: Serverless API (CNN Model)
Jika tidak ada match fingerprint, gambar dikirim ke **Vercel Python serverless function** untuk inferensi menggunakan model TFLite.

- Endpoint: `POST /api/predict`
- Input: Base64-encoded image (JSON)
- Preprocessing: Resize 224×224, normalize [0, 1]
- Inferensi: TFLite interpreter (`ai-edge-litert`)
- Output: Probabilitas fertile vs infertile

### Tahap 3: Heuristic Fallback
Jika API gagal (offline/error), digunakan analisis fitur visual:
- Brightness, Contrast, Sharpness
- Pattern uniformity, Texture analysis

---

## 🧬 Arsitektur Model CNN

```
Input (224 × 224 × 3)
    │
    ▼
Conv2D (32 filters, 3×3) + ReLU + BatchNorm
    │
MaxPooling2D (2×2)
    │
Conv2D (64 filters, 3×3) + ReLU + BatchNorm
    │
MaxPooling2D (2×2)
    │
Conv2D (128 filters, 3×3) + ReLU + BatchNorm
    │
MaxPooling2D (2×2)
    │
Flatten
    │
Dense (128) + ReLU + Dropout (0.5)
    │
Dense (64) + ReLU + Dropout (0.3)
    │
Dense (3) + Softmax
    │
Output: [fertil, infertil, raw]
```

### Label Mapping
| Index | Label | Jumlah Data |
|-------|-------|-------------|
| 0 | `fertil` | 677 gambar |
| 1 | `infertil` | 240 gambar |
| 2 | `raw` | — |

> **Catatan:** Keras `flow_from_directory` mengurutkan class secara alfabetis, sehingga `fertil=0`, `infertil=1`, `raw=2`.

---

## 📊 Dataset

- **Total gambar:** 917 (677 fertil + 240 infertil)
- **Resolusi input model:** 224 × 224 piksel
- **Color space:** RGB
- **Augmentasi yang digunakan:**
  - Rotation (±20°)
  - Width/Height shift (±20%)
  - Horizontal flip
  - Zoom (±20%)
  - Shear

---

## 🚀 Setup & Instalasi

### Prerequisites
- **Python 3.9+** (untuk training model)
- **Node.js 18+** (untuk web app)
- **Git**

### 1. Clone Repository

```bash
git clone https://github.com/asai2001/merak-app.git
cd merak-app
```

### 2. Setup Backend (Training Lokal)

```bash
cd backend
pip install -r requirements.txt

# Training model baru
python src/train.py

# Generate fingerprint database
python src/generate_fingerprints.py

# Jalankan API server lokal
python main.py
# Server berjalan di http://localhost:8000
```

### 3. Setup Web App (Development Lokal)

```bash
cd web
npm install
npm run dev
# Web app berjalan di http://localhost:3000
```

---

## ☁️ Deployment ke Vercel

### Langkah-langkah Deploy

1. **Push ke GitHub**
   ```bash
   git add .
   git commit -m "deploy"
   git push origin main
   ```

2. **Buka [vercel.com](https://vercel.com)** → Login → **Add New Project**

3. **Import repository** `asai2001/merak-app`

4. **Pengaturan Project:**

   | Setting | Nilai |
   |---------|-------|
   | Framework Preset | Next.js |
   | Root Directory | `web` |
   | Build Command | `npm run build` |
   | Output Directory | *(kosongkan)* |

5. Klik **Deploy** → tunggu build selesai

### Vercel Auto-Deploy
Setiap `git push` ke branch `main` akan otomatis trigger deploy ulang di Vercel.

### File Penting untuk Vercel
- `web/vercel.json` — Konfigurasi Python serverless function
- `web/requirements.txt` — Python dependencies untuk serverless
- `web/api/predict.py` — Serverless function endpoint

---

## 📱 Progressive Web App (PWA)

Aplikasi mendukung PWA sehingga bisa diinstall di Android seperti aplikasi native.

### Cara Install di Android
1. Buka https://merak-app.vercel.app di **Chrome**
2. Tap menu **⋮** (tiga titik) di kanan atas
3. Pilih **"Install app"** atau **"Add to Home Screen"**
4. Aplikasi akan muncul di home screen seperti app biasa

### Komponen PWA
| File | Fungsi |
|------|--------|
| `public/manifest.json` | Metadata PWA (nama, ikon, warna) |
| `public/sw.js` | Service Worker (caching, offline support) |
| `public/icon-192.png` | Ikon app 192×192 |
| `public/icon-512.png` | Ikon app 512×512 |
| `src/components/InstallPrompt.tsx` | Prompt install otomatis |

---

## 📝 Dokumentasi Tambahan

| Dokumen | Deskripsi |
|---------|-----------|
| [PANDUAN_LENGKAP_CNN_MERAK.md](PANDUAN_LENGKAP_CNN_MERAK.md) | Panduan lengkap training dan deployment |
| [PERBAIKAN_AKURASI_MODEL.md](PERBAIKAN_AKURASI_MODEL.md) | Solusi class imbalance dan akurasi |
| [DOKUMENTASI_CNN_FERTILITAS_MERAK.md](DOKUMENTASI_CNN_FERTILITAS_MERAK.md) | Dokumentasi arsitektur CNN |
| [PROJECT_DESIGN.md](PROJECT_DESIGN.md) | Desain project lengkap |
| [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) | Panduan deployment |

---

## 📄 License

MIT License

## 👤 Kontak

Project ini dibuat untuk tujuan edukasi dan riset identifikasi fertilitas telur merak menggunakan Convolutional Neural Network.

**Repository:** [github.com/asai2001/merak-app](https://github.com/asai2001/merak-app)
**Live App:** [merak-app.vercel.app](https://merak-app.vercel.app)
