# IDENTIFIKASI FERTILITAS TELUR MERAK MENGGUNAKAN ALGORITMA CONVOLUTIONAL NEURAL NETWORK (CNN)

## Deskripsi Proyek

Proyek ini mengimplementasikan sistem lengkap untuk mengklasifikasikan fertilitas telur merak menggunakan Convolutional Neural Network (CNN) dengan dua komponen utama:

1. **Backend Training**: Melatih model CNN khusus untuk klasifikasi telur merak
2. **Frontend Standalone**: Aplikasi web yang berjalan tanpa backend, menggunakan TensorFlow.js untuk inferensi di browser

### Fitur Utama

✅ **Training Model Khusus** - Dilatih pada dataset 917 gambar telur merak (677 fertil, 240 infertil)  
✅ **Inferensi Client-Side** - Tidak memerlukan backend untuk klasifikasi  
✅ **Deploy di GitHub Pages/Vercel** - Hosting gratis dan static  
✅ **Android WebView Compatible** - Bisa dijalankan dalam Android WebView  
✅ **High Accuracy Target** - Menarget akurasi 85-95% dengan model custom  
✅ **Offline Capability** - Model yang diload dapat berjalan offline  

---

## Bagian 1: Backend Training

### Dataset

#### Statistik Dataset
```
Dataset: D:\Projects\MerakApp\backend\dataset/
├── fertil/      : 677 gambar (73.8%)
└── infertil/    : 240 gambar (26.2%)

Total          : 917 gambar
Rasio Kelas    : 2.82:1 (fertile:infertil)
```

#### Struktur Dataset
Dataset disimpan dalam folder dengan struktur berikut:
```
dataset/
├── fertil/
│   ├── 20251024_190127.jpg
│   ├── 20251024_190656.jpg
│   └── ...
└── infertil/
    ├── 20251024_190811.jpg
    ├── 20251024_190812.jpg
    └── ...
```

### Struktur Backend

```
backend/
├── src/
│   ├── train.py              # Script training model
│   ├── model.py              # Arsitektur CNN (custom + pretrained)
│   ├── data_loader.py        # Loading data dengan class weights
│   ├── utils.py              # Callbacks dan plotting
│   ├── evaluate.py           # Evaluasi model
│   └── convert_to_tfjs.py   # Konversi ke TensorFlow.js
├── dataset/
│   ├── fertil/               # 677 gambar
│   └── infertil/             # 240 gambar
├── models/                  # Model terbaik disimpan
├── output/                  # Plot dan metrics
└── requirements.txt          # Dependencies Python
```

### Arsitektur Model

#### Model Custom CNN

Arsitektur CNN yang dirancang khusus untuk klasifikasi telur merak:

```
Input Layer (224, 224, 3)
│
├─ Conv2D(64) + BatchNorm + ReLU
├─ Conv2D(64) + BatchNorm + ReLU
├─ MaxPooling2D(2x2)
├─ Dropout(0.3)
│
├─ Conv2D(128) + BatchNorm + ReLU
├─ Conv2D(128) + BatchNorm + ReLU
├─ MaxPooling2D(2x2)
├─ Dropout(0.4)
│
├─ Conv2D(256) + BatchNorm + ReLU
├─ Conv2D(256) + BatchNorm + ReLU
├─ Conv2D(256) + BatchNorm + ReLU
├─ MaxPooling2D(2x2)
├─ Dropout(0.4)
│
├─ Conv2D(512) + BatchNorm + ReLU
├─ Conv2D(512) + BatchNorm + ReLU
├─ MaxPooling2D(2x2)
├─ Dropout(0.5)
│
├─ GlobalAveragePooling2D
│
├─ Dense(512) + BatchNorm + Dropout(0.5)
├─ Dense(256) + BatchNorm + Dropout(0.4)
│
└─ Dense(2) + Softmax
```

**Fitur Utama:**
- 4 blok konvolusi dengan kedalaman bertahap (64→128→256→512)
- Batch Normalization untuk stabilitas training
- Dropout untuk mencegah overfitting
- L2 Regularization (λ=0.001) pada fully connected layers
- Global Average Pooling untuk mengurangi parameter

#### Model Pretrained (Opsional)

Tersedia opsi menggunakan **EfficientNetB0** pretrained dari ImageNet:

```
EfficientNetB0 (frozen weights)
│
├─ GlobalAveragePooling2D
│
├─ Dense(512) + BatchNorm + Dropout(0.5)
├─ Dense(256) + BatchNorm + Dropout(0.4)
│
└─ Dense(2) + Softmax
```

### Konfigurasi Training

#### Hyperparameter Optimal

| Parameter | Nilai | Penjelasan |
|-----------|-------|-----------|
| Learning Rate | 0.0001 | Learning rate kecil untuk stabilitas |
| Optimizer | Adam | Adaptive gradient descent |
| Batch Size | 32 | Balance antara speed dan memori |
| Epochs | 100 | Dengan early stopping |
| Validation Split | 20% | Untuk monitoring |
| Loss Function | Categorical Crossentropy | Untuk klasifikasi multi-kelas |

#### Penanganan Class Imbalance

Dataset mengalami ketidakseimbangan dengan rasio 2.82:1. Untuk mengatasi masalah ini:

1. **Class Weights**: Memberikan bobot lebih tinggi pada kelas minoritas
   ```python
   weight_fertil = total / (2 * count_fertil)    # ≈ 0.67
   weight_infertil = total / (2 * count_infertil) # ≈ 1.91
   ```

2. **Data Augmentation Agresif**: Meningkatkan variasi data dengan:
   - Rotasi: ±20°
   - Shift horizontal & vertical: ±15%
   - Zoom: ±20%
   - Flip horizontal & vertikal
   - Shear: ±15%
   - Brightness: 0.7-1.3

#### Callbacks Training

1. **ModelCheckpoint**
   - Simpan model terbaik berdasarkan val_accuracy
   - Path: `models/best_model.h5`

2. **EarlyStopping**
   - Monitor: val_loss
   - Patience: 15 epoch
   - Restore best weights

3. **ReduceLROnPlateau**
   - Monitor: val_loss
   - Factor: 0.3 (kurangi 70%)
   - Patience: 7 epoch
   - Min LR: 1e-7

### Cara Training Model

#### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

#### 2. Cek Setup Dataset

```bash
python check_setup.py
```

Output yang diharapkan:
```
=== Testing Dataset Setup ===

Dataset Statistics:
  Fertil images: 677
  Infertil images: 240
  Total images: 917
  Class ratio: 677/240 = 2.82:1

Checking for TensorFlow...
  TensorFlow version: 2.16.0
  GPU Available: True

=== Setup Complete ===

You can now run training with:
  python src/train.py --data_dir dataset --epochs 100

Or with pretrained model:
  python src/train.py --data_dir dataset --epochs 100 --pretrained
```

#### 3. Training Model Custom CNN

```bash
cd backend
python src/train.py --data_dir dataset --epochs 100 --batch_size 32
```

#### 4. Training Model Pretrained (Rekomendasi untuk akurasi tinggi)

```bash
python src/train.py --data_dir dataset --epochs 100 --pretrained
```

#### 5. Parameter Training Lengkap

```bash
python src/train.py \
    --data_dir dataset \
    --epochs 100 \
    --batch_size 32 \
    --img_size 224 224 \
    --learning_rate 0.0001 \
    --pretrained
```

### Output Training

Setelah training selesai, file-file berikut akan dibuat:

```
models/
└── best_model.h5              # Model terbaik (Keras format)

output/
└── training_history.png        # Plot accuracy dan loss
```

### Hasil yang Diharapkan

| Model | Target Accuracy | Estimasi Training Time |
|-------|---------------|----------------------|
| Custom CNN | 85-90% | 30-60 menit (GPU) |
| EfficientNetB0 | 90-95% | 45-90 menit (GPU) |

*Note: Hasil dapat bervariasi tergantung hardware dan random seed.*

---

## Bagian 2: Konversi Model ke TensorFlow.js

Setelah model dilatih, model perlu dikonversi ke format TensorFlow.js untuk digunakan di browser.

### Script Konversi

File konversi tersedia di: `backend/src/convert_to_tfjs.py`

#### Konversi ke TensorFlow.js

```bash
cd backend
python src/convert_to_tfjs.py --input models/best_model.h5 --format tfjs
```

#### Konversi ke TFLite (Untuk Mobile App Native)

```bash
python src/convert_to_tfjs.py --input models/best_model.h5 --format tflite
```

#### Konversi Keduanya

```bash
python src/convert_to_tfjs.py --format both
```

### Output Konversi

#### TensorFlow.js Format

```
models/tfjs/
├── model.json                  # Model architecture
├── group1-shard1of1.bin      # Model weights
└── ...
```

#### TFLite Format

```
models/
└── model.tflite               # TFLite model
```

---

## Bagian 3: Frontend Standalone

### Fitur Frontend

✅ **Tanpa Backend Dependency** - Semua inferensi berjalan di browser  
✅ **TensorFlow.js Integration** - Menggunakan AI client-side  
✅ **Custom Model Support** - Mendukung model yang dilatih khusus  
✅ **Fallback Model** - Menggunakan MobileNet jika custom model tidak tersedia  
✅ **Progressive Web App (PWA)** - Bisa diinstall sebagai app  
✅ **Responsive Design** - Optimasi untuk desktop dan mobile  
✅ **Android WebView Compatible** - Bisa dijalankan dalam WebView  

### Struktur Frontend

```
web/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Halaman utama
│   │   └── layout.tsx         # Layout aplikasi
│   ├── components/
│   │   └── InstallPrompt.tsx  # PWA install prompt
│   ├── utils/
│   │   ├── imageAnalysis.ts    # Analisis gambar
│   │   ├── peacockEggModel.ts # Model loader
│   │   ├── imageUtils.ts      # Utilities gambar
│   │   └── constants.ts       # Konstanta
│   └── public/
│       ├── model/
│       │   └── tfjs/          # Model TFJS (copy dari backend)
│       └── manifest.json       # PWA manifest
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

### Setup Frontend

#### 1. Install Dependencies

```bash
cd web
npm install
```

#### 2. Copy Model ke Frontend

Setelah training dan konversi selesai, copy model TFJS ke frontend:

```bash
# Windows
xcopy /E /I ..\backend\models\tfjs public\model\tfjs

# Linux/Mac
cp -r ../backend/models/tfjs public/model/
```

#### 3. Jalankan Development Server

```bash
npm run dev
```

Buka browser di: `http://localhost:3000`

### Build untuk Production

```bash
npm run build
```

Output build akan ada di folder `out/` untuk static export.

---

## Bagian 4: Deployment

### GitHub Pages

#### 1. Build untuk Static Export

```bash
cd web
GITHUB_PAGES=true npm run build
```

#### 2. Deploy ke GitHub Pages

```bash
npm run deploy
```

Atau manually push ke branch `gh-pages`:

```bash
git add out/
git commit -m "Deploy to GitHub Pages"
git subtree push --prefix out origin gh-pages
```

#### 3. Konfigurasi GitHub Pages

1. Go to repository **Settings** > **Pages**
2. **Source**: Deploy from branch `gh-pages`
3. **Folder**: `/ (root)`
4. Save

URL akan tersedia di: `https://username.github.io/repository-name/`

### Vercel

#### 1. Install Vercel CLI (jika belum)

```bash
npm install -g vercel
```

#### 2. Deploy

```bash
cd web
vercel --prod
```

#### 3. Import ke Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New Project**
3. Import GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `out`
5. Deploy

---

## Bagian 5: Android WebView Integration

### Cara Menggunakan di Android

#### Opsi 1: WebView di Android App

1. Copy URL app (GitHub Pages atau Vercel)
2. Buat Android App dengan WebView:

```kotlin
// MainActivity.kt
class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            cacheMode = WebSettings.LOAD_DEFAULT
        }
        
        webView.webViewClient = WebViewClient()
        webView.loadUrl("https://your-app.vercel.app")
    }
}
```

3. Tambahkan permission di `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

#### Opsi 2: TWA (Trusted Web Activity)

Menggunakan TWA untuk experience seperti native app:

1. Install Bubblewrap:
   ```bash
   npm install -g @bubblewrap/cli
   ```

2. Buat project TWA:
   ```bash
   bubblewrap init \
     --manifest="https://your-app.vercel.app/manifest.json"
   ```

3. Build APK:
   ```bash
   bubblewrap build
   ```

### Testing di WebView

1. Buka browser mobile (Chrome, Firefox)
2. Akses URL app
3. Uji upload gambar dan analisis
4. Pastikan inferensi berjalan smooth

---

## Bagian 6: Troubleshooting

### Backend Training Issues

#### Overfitting
**Symptom**: Training accuracy tinggi tapi validation accuracy rendah

**Solutions**:
- Tambah dropout rate
- Tambah L2 regularization
- Kurangi kompleksitas model
- Tambah data augmentation

#### Underfitting
**Symptom**: Training dan validation accuracy sama-sama rendah

**Solutions**:
- Tingkatkan learning rate
- Tambah epoch
- Tambah kompleksitas model
- Kurangi regularisasi

#### Plateau
**Symptom**: Akurasi stagnan setelah beberapa epoch

**Solutions**:
- Kurangi learning rate
- Coba optimizer berbeda
- Cek learning rate scheduler

### Frontend Issues

#### Model Gagal Load

**Symptom**: Error saat memuat model

**Solutions**:
1. Pastikan model TFJS sudah di-copy ke `public/model/tfjs/`
2. Cek file `model.json` ada di folder tersebut
3. Verify permissions file ( harus readable)
4. Cek browser console untuk error detail

#### Inferensi Lambat

**Symptom**: Analisis gambar memakan waktu lama

**Solutions**:
1. Pastikan WebGL tersedia (banyak browser mobile mendukung)
2. Kurangi image size jika diperlukan
3. Gunakan model yang lebih kecil
4. Close tab lain untuk free up memory

#### WebView Android Tidak Berfungsi

**Symptom**: App crash atau tidak load di WebView

**Solutions**:
1. Pastikan internet permission ada di manifest
2. Enable JavaScript dan DOM storage
3. Gunakan HTTPS (bisa self-signed untuk development)
4. Cek WebViewClient override

### Deployment Issues

#### GitHub Pages 404

**Symptom**: Halaman tidak ditemukan setelah deploy

**Solutions**:
1. Pastikan file ada di branch `gh-pages`
2. Cek folder output adalah `/ (root)`
3. Pastikan commit sudah push
4. Tunggu beberapa menit untuk deploy selesai

#### Vercel Build Error

**Symptom**: Build gagal di Vercel

**Solutions**:
1. Cek build logs di Vercel dashboard
2. Pastikan semua dependencies ada di package.json
3. Verify Next.js version kompatibel
4. Cek environment variables (jika ada)

---

## Bagian 7: Optimasi Lanjutan

### Backend

#### K-Fold Cross Validation

Untuk validasi lebih robust:

```python
from sklearn.model_selection import KFold
import numpy as np

kfold = KFold(n_splits=5, shuffle=True, random_state=42)

fold_no = 1
for train, test in kfold.split(X, y):
    # Train dan evaluate untuk setiap fold
    fold_no += 1
```

#### Hyperparameter Tuning

Menggunakan Grid Search atau Bayesian Optimization:

```python
from sklearn.model_selection import GridSearchCV

param_grid = {
    'learning_rate': [0.001, 0.0001, 0.00001],
    'batch_size': [16, 32, 64],
    'dropout_rate': [0.3, 0.4, 0.5]
}

# Implement custom grid search untuk Keras
```

#### Ensemble Methods

Kombinasi beberapa model untuk akurasi lebih tinggi:

```python
# Load beberapa model terbaik
model1 = tf.keras.models.load_model('models/model_fold1.h5')
model2 = tf.keras.models.load_model('models/model_fold2.h5')
model3 = tf.keras.models.load_model('models/model_fold3.h5')

# Ensemble prediction
pred1 = model1.predict(image)
pred2 = model2.predict(image)
pred3 = model3.predict(image)

final_pred = np.mean([pred1, pred2, pred3], axis=0)
```

### Frontend

#### Model Quantization

Kurangi size model untuk faster loading:

```javascript
// Konversi dengan quantization
const quantizationBytes = 8 // atau 16 untuk mixed precision
```

#### Web Workers

Offload inference ke background thread:

```javascript
// worker.js
self.importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs')
self.onmessage = async (event) => {
  const result = await predict(event.data.image)
  self.postMessage(result)
}
```

#### Progressive Loading

Load model secara bertahap:

```javascript
// Load lightweight model dulu
await loadLightweightModel()

// Kemudian load full model di background
loadFullModelInBackground()
```

---

## Bagian 8: Monitoring dan Maintenance

### Metrics untuk Monitoring

#### Training Metrics
- Training accuracy vs validation accuracy
- Training loss vs validation loss
- Precision dan recall untuk setiap kelas
- F1-score
- Confusion matrix

#### Production Metrics
- User engagement ( jumlah klasifikasi harian)
- Average inference time
- Error rate
- User feedback (accuracy reported)

### Maintenance Tasks

#### Weekly
- Check training logs untuk anomali
- Monitor model drift
- Backup model dan data

#### Monthly
- Re-train model dengan data baru
- Update dependencies
- Test deployment di berbagai browsers
- Review user feedback

#### Quarterly
- Evaluasi arsitektur model
- Update dokumentasi
- Security audit
- Performance benchmarking

---

## Requirements

### Backend Requirements

```
tensorflow>=2.16.0
numpy>=1.24.0
pandas>=2.0.0
matplotlib>=3.7.0
scikit-learn>=1.3.0
Pillow>=10.0.0
tensorflowjs
```

### Frontend Requirements

```json
{
  "dependencies": {
    "@tensorflow/tfjs": "^4.15.0",
    "@tensorflow/tfjs-backend-webgl": "^4.15.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.4",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "tailwindcss": "^3.3.6"
  }
}
```

### Hardware yang Direkomendasikan

| Komponen | Minimum | Recommended |
|----------|----------|-------------|
| **CPU (Training)** | Intel i5 / AMD Ryzen 5 | Intel i7 / AMD Ryzen 7 |
| **GPU (Training)** | - | NVIDIA RTX 3060+ (CUDA 11.2+) |
| **RAM (Training)** | 8 GB | 16 GB |
| **Storage (Training)** | 10 GB SSD | 20 GB SSD |
| **CPU (Frontend)** | Dual-core 1.5 GHz | Quad-core 2.0 GHz |
| **RAM (Frontend)** | 2 GB | 4 GB |
| **Browser (Frontend)** | Chrome 80+ / Firefox 75+ | Chrome 110+ / Firefox 110+ |

---

## Referensi

### Deep Learning
1. **LeCun, Y., et al. (2015)**. "Deep learning." *Nature*, 521(7553), 436-444.
2. **He, K., et al. (2016)**. "Deep Residual Learning for Image Recognition." *CVPR*.
3. **Tan, M., & Le, Q. (2019)**. "EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks." *ICML*.

### TensorFlow.js
1. **TensorFlow.js Documentation**: https://www.tensorflow.org/js
2. **MobileNet Model**: https://github.com/tensorflow/models/tree/master/research/slim/nets/mobilenet

### Web Technologies
1. **Next.js Documentation**: https://nextjs.org/docs
2. **PWA Documentation**: https://web.dev/progressive-web-apps/
3. **WebView Android**: https://developer.android.com/guide/webapps/webview

---

## Kontribusi

Untuk meningkatkan akurasi model:

1. **Tambah Data**: Kumpulkan lebih banyak data, khususnya kelas infertil
2. **Label Data**: Pastikan labeling dilakukan dengan akurat
3. **Eksperimen Arsitektur**: Coba arsitektur model berbeda
4. **Tuning Hyperparameter**: Lakukan hyperparameter tuning secara sistematis
5. **Test Cross-Platform**: Uji di berbagai browsers dan devices
6. **Report Bug**: Laporkan bug dan issue untuk improvement

---

## Troubleshooting Quick Reference

### Backend

```bash
# Cek TensorFlow installation
python -c "import tensorflow as tf; print(tf.__version__)"

# Cek dataset
python check_setup.py

# Training model
python src/train.py --data_dir dataset --epochs 100 --pretrained

# Konversi ke TFJS
python src/convert_to_tfjs.py --format tfjs
```

### Frontend

```bash
# Install dependencies
cd web && npm install

# Development server
npm run dev

# Build for production
GITHUB_PAGES=true npm run build

# Deploy ke GitHub Pages
npm run deploy

# Deploy ke Vercel
vercel --prod
```

### Android WebView

```kotlin
// Enable JavaScript
webView.settings.javaScriptEnabled = true

// Enable storage
webView.settings.domStorageEnabled = true

// Load app
webView.loadUrl("https://your-app.vercel.app")

// Handle back button
webView.setOnBackPressedCallback {
    if (webView.canGoBack()) {
        webView.goBack()
    } else {
        finish()
    }
    true
}
```

---

## Flowchart Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    WORKFLOW LENGKAP                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │   1. Persiapan Data   │
              └─────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │  2. Training Model     │
              │    (backend)           │
              └─────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │  3. Konversi ke TFJS  │
              └─────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │  4. Setup Frontend    │
              └─────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │  5. Test Lokal        │
              └─────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │  6. Deploy            │
              │  (GitHub/Vercel)      │
              └─────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │  7. Integasi WebView   │
              │  (Android/iOS)         │
              └─────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │  8. Production        │
              └─────────────────────────┘
```

---

## Support & Kontak

### Documentation
- Full documentation: `DOKUMENTASI_CNN_FERTILITAS_MERAK.md`
- API documentation: (akan ditambahkan)
- Code examples: (akan ditambahkan di folder `/examples`)

### Getting Help
1. Cek **Troubleshooting** section di dokumentasi ini
2. Review error logs di browser console (F12)
3. Cek training logs di backend
4. Search GitHub issues untuk masalah yang sama
5. Buka issue baru dengan detail lengkap

---

**Version**: 1.0  
**Last Updated**: 2026  
**Status**: Production Ready 🚀

---

## License

This project is provided for educational and research purposes. 

**Perhatian**: Akurasi model dapat bervariasi tergantung kualitas data dan kondisi lingkungan. Selalu gunakan hasil prediksi sebagai referensi, bukan pengganti judgment ahli.

---

**Selamat Menggunakan Peacock Egg Fertility Detector! 🥚✨**
