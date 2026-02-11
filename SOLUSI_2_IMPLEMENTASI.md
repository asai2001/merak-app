# ✅ Solusi 2 Implementasi: EfficientNetB0 + Aggressive Class Weights

## Solusi yang Diterapkan

### 1. Backend Updates
✅ **Model EfficientNetB0 dengan Fine-Tuning** - Unfreeze 20 layer terakhir untuk belajar dataset spesifik  
✅ **Aggressive Class Weights** - Weight infertil 4.2x lebih tinggi dari fertil  
✅ **Enhanced Dense Layers** - Tambah dropout (0.6, 0.5, 0.4)  
✅ **Improved Regularization** - L2 regularization ditingkat (0.002)  
✅ **Training Monitoring** - Deteksi imbalance dan berikan rekomendasi

### 2. Frontend Updates
✅ **Improved Heuristics** - Scoring system yang lebih presisi  
✅ **Fertility Indicators** - Menampilkan indikator fertility visual  
✅ **Reduced Randomness** - Prediksi lebih konsisten  
✅ **Score-Based Confidence** - Confidence disesuaikan berdasarkan fertility score total

---

## 🔧 Backend Changes

### File: `backend/src/model.py`

**Perubahan**:
- Tambah `fine_tune_layers` parameter ke `create_pretrained_model`
- Update arsitektur dense layers:
  - Dense(512) + Dropout(0.6)
  - Dense(256) + Dropout(0.5)
  - Dense(128) + Dropout(0.4)
- L2 regularization ditingkat ke 0.002 untuk dense layers pertama

### File: `backend/src/data_loader.py`

**Perubahan**:
- Tambah `get_class_weights()` method baru dengan 3 opsi:
  - `balanced`: weight standar (inverse frequency)
  - `aggressive`: infertil weight = 4.2x fertil weight
  - `inverse`: infertil weight 2.78x fertil weight
- Tambah `get_class_mapping()` untuk analisis imbalance
- Tampilkan warning jika rasio > 2.0

**Class Weights Comparison**:

| Method | Weight Fertil | Weight Infertil | Rasio |
|--------|--------------|----------------|--------|
| Balanced | 0.67 | 1.91 | 2.85:1 |
| Aggressive | 1.0 | 4.2 | 4.2:1 |
| Inverse | 0.36 | 1.0 | 2.78:1 |

### File: `backend/src/train.py`

**Perubahan**:
- Tambah `fine_tune_layers` parameter (default: 20)
- Tambah `--class_weights` argumen parser
- Implement fine-tuning logic: unfreeze 20 layer terakhir dari EfficientNetB0
- Tambah analisis otomatis:
  - Cek class balance ratio
  - Tampilkan rekomendasi jika imbalance parah
  - Display final metrics:
    - Best training accuracy
    - Best validation accuracy
    - Overfitting gap
    - Per-class metrics
  - Berikan rekomendasi jika accuracy < 70%

---

## 🎯 Frontend Changes

### File: `web/src/utils/imageAnalysis.ts`

**Perubahan**:
1. Tambah `calculateFertilityIndicators()` function:
   - Hitung fertility indicators untuk setiap feature
   - Normalisasi ke range -1.0 hingga 1.0

2. Update `makePredictionWithFeatures()`:
   - Gunakan `calculateFertilityIndicators()` hasil
   - Implement score-based confidence adjustment:
     - Total score < 0.3: kurangi confidence
     - Total score 0.3-0.5: sedikit kurangi
     - Total score > 0.5: sedikit tambah
     - Total score > 1.0: tambah tapi cap di 0.9

3. Update `analyzeWithCustomModel()` dan `analyzeWithMobileNet()`:
   - Tambah fertility indicators ke result

4. Update `PredictionResult` interface:
   - Tambah `fertilityIndicators` field

**Scoring System**:

| Feature | Max Score | Fertil Indikator | Infertil Indikator |
|---------|-----------|-------------------|---------------------|
| Brightness | 0.25 | 110-160 | < 90 atau > 180 |
| Contrast | 0.25 | 35-75 | < 25 atau > 85 |
| Sharpness | 0.2 | 0.025-0.075 | < 0.015 atau > 0.1 |
| Pattern | 0.3 | Uniform | Varied |
| Texture | 0.2 | Smooth/Moderately Rough | Very Smooth atau Rough |
| **TOTAL** | **1.2** | **> 0.5 = Fertil** | **< 0.5 = Infertil** |

### File: `web/src/app/page.tsx`

**Perubahan**:
1. Tambah `fertilityIndicators` state:
   ```typescript
   const [fertilityIndicators, setFertilityIndicators] = useState<{
     brightness: number
     contrast: number
     sharpness: number
     pattern: number
     texture: number
     total: number
   } | null>(null)
   ```

2. Update `analyzeImageHandler`:
   - Capture fertility indicators dari result
   - Pass ke state untuk display

3. Tambah "Fertility Indicators" section di UI:
   - Tampilkan progress bar untuk setiap indicator
   - Warna berdasarkan score:
     - Positif (> 0): Hijau (mendukung fertility)
     - Negatif (< 0): Merah (tidak mendukung fertility)
     - Netral (~0): Abu-abu
   - Tampilkan total fertility score
   - Interpretasi score level (Strong, Weak, Very Weak)

4. Tambah confidence warning:
   - Jika total score < 0.3: "Weak fertility indicators"
   - Jika total score > 0.8: "Strong fertility indicators"
   - Rekomendasi penggunaan model custom untuk hasil terbaik

---

## 📊 Expected Results

### Training dengan Solusi 2

```bash
# Command yang disarankan
python src/train.py \
    --data_dir dataset \
    --epochs 150 \
    --pretrained \
    --class_weights aggressive \
    --fine_tune 20
```

**Hasil yang Diharapkan**:
- Overall Validation Accuracy: 80-85%
- Fertil Accuracy: 85-90%
- Infertil Accuracy: 75-85%
- Overfitting Gap: < 10%
- Infertil Recall: > 70%

### Frontend Analysis

Untuk gambar **fertile** yang baik:
- Total Fertility Score: 0.6-1.2
- Brightness: 110-160 ✓
- Contrast: 35-75 ✓
- Sharpness: 0.025-0.075 ✓
- Pattern: Uniform ✓
- Texture: Smooth/Moderately Rough ✓

Untuk gambar **infertil** yang baik:
- Total Fertility Score: -0.2 hingga -1.0
- Brightness: < 90 atau > 180
- Contrast: < 25 atau > 85
- Sharpness: < 0.015 atau > 0.1
- Pattern: Varied
- Texture: Very Smooth atau Rough

---

## 🚀 Cara Cepat Deploy

### 1. Training Model (Backend)

```bash
cd backend

# Pastikan dataset sudah diperiksa
python check_setup.py

# Train dengan solusi 2 (rekomendasi)
python src/train.py \
    --data_dir dataset \
    --epochs 150 \
    --pretrained \
    --class_weights aggressive \
    --fine_tune 20
```

### 2. Konversi ke TensorFlow.js

```bash
# Convert untuk deployment
python src/convert_to_tfjs.py --format tfjs
```

### 3. Copy Model ke Frontend

```bash
# Windows
xcopy /E /I models\tfjs ..\web\public\model\tfjs

# Linux/Mac
cp -r models/tfjs ../web/public/model/
```

### 4. Deploy Frontend

```bash
cd web

# Development test
npm run dev

# Build untuk production
GITHUB_PAGES=true npm run build

# Deploy ke GitHub Pages
npm run deploy
```

---

## 📈 Monitoring Akurasi

### Saat Training

Perhatikan metrics berikut:

```bash
# Perhatikan output training:
=== Class Balance Analysis ===
Fertil images:   677 (73.8%)
Infertil images: 240 (26.2%)
Total images:    917
Class ratio:     677/240 = 2.82:1
⚠️  WARNING: Severe class imbalance detected!
=== Creating model ===
=== Starting Training ===

# Perhatikan final metrics:
Final Metrics:
  Best Training Accuracy: 85-95%
  Best Validation Accuracy: 80-85%
  Overfitting Gap: 5-10%

# Jika infertil recall < 60%:
⚠️  WARNING: Infertil recall is low!
  ⚠️  Model masih melewatkan infertil class.
  ⚠️  Action: Tambah data infertil atau gunakan lebih agresif class weights.
```

### Saat Deployment

Perhatikan indikator fertility di web:

**Untuk Fertil** (Total Score > 0.5):
- ✓ Brightness: 110-160
- ✓ Contrast: 35-75
- ✓ Sharpness: 0.025-0.075
- ✓ Pattern: Uniform
- ✓ Texture: Smooth/Moderately Rough
- **Result**: CONFIDEN ✓

**Untuk Infertil** (Total Score < 0.5):
- ✓ Brightness: < 90 atau > 180
- ✓ Contrast: < 25 atau > 85
- ✓ Sharpness: < 0.015 atau > 0.1
- ✓ Pattern: Varied
- ✓ Texture: Very Smooth atau Rough
- **Result**: INFERTIL ✓

---

## 🎯 Success Criteria

Backend Training:
✅ Validation accuracy > 80%
✅ Infertil recall > 70%
✅ Overfitting gap < 10%
✅ Model tersimpan di `models/best_model.h5`

Frontend Analysis:
✅ Fertil indicators ditampilkan
✅ Score visual bars berwarna hijau/merah
✅ Total fertility score ditampilkan
✅ Confidence sesuai dengan fertility score
✅ Warning jika confidence rendah

---

## 🔍 Testing Guide

### Test Backend

1. Test dengan berbagai gambar fertil:
   - Upload 5-10 gambar fertil berbeda
   - Semua seharusnya diklasifikasikan sebagai fertil
   - Confidence sekitar 80-95%

2. Test dengan berbagai gambar infertil:
   - Upload 5-10 gambar infertil berbeda
   - Target: 70-80% benar
   - Seharusnya bisa mendeteksi paling tidak 50% dengan benar

3. Cek training logs:
   - Precision infertil sebaik mungkin
   - Recall infertil sebaik mungkin
   - Gap antara training dan validation minimal

### Test Frontend

1. Buka `http://localhost:3000`

2. Upload gambar fertil:
   - Cek total fertility score
   - Pastikan > 0.5
   - Cek semua indicators (hijau)
   - Confidence harus > 60%

3. Upload gambar infertil:
   - Cek total fertility score
   - Pastikan < 0.5
   - Sebagian indicators harus merah
   - Confidence untuk infertil sekitar 30-50%

---

## 📊 Troubleshooting

### Masalah: Model masih bias ke fertil

**Solutions**:
1. Gunakan method class weights yang lebih agresif: `--class_weights aggressive`
2. Tambah epoch: `--epochs 200`
3. Tambah dropout rate di model
4. Gunakan learning rate yang lebih kecil: `--learning_rate 0.00005`

### Masalah: Infertil tidak terdeteksi sama sekali

**Solutions**:
1. Tambah lebih banyak data infertil (penting!)
2. Gunakan oversampling untuk kelas infertil
3. Implement focal loss
4. Gunakan ensemble methods

### Masalah: Overfitting

**Symptoms**: Training accuracy tinggi tapi validation rendah

**Solutions**:
1. Tambah dropout
2. Kurangi model complexity
3. Tambah regularisasi
4. Tambah data augmentation
5. Gunakan early stopping dengan patience yang lebih besar

### Masalah: Web analysis tidak akurat

**Solutions**:
1. Pastikan model sudah diload dengan benar
2. Cek fertility indicators score
3. Debug dengan gambar yang di-label dengan benar
4. Adjust scoring thresholds jika perlu

---

## 📝 Catatan Penting

### Class Imbalance

**Dengan dataset saat ini (677 fertil vs 240 infertil)**:
- Model akan cenderung bias ke kelas fertil
- Untuk menyeimbangkan, gunakan:
  - **Aggressive class weights**: Infertil weight = 4.2x fertil weight
  - **Data augmentation**: Augmentasi agresif untuk kedua kelas
  - **Fine-tuning**: Unfreeze pretrained layers
  - **Oversampling**: Duplicate infertil images

### Rekomendasi Jangka Panjang

1. **Short Term** (1-2 minggu):
   - Tambah data infertil ke minimal 500-700 gambar
   - Train dengan EfficientNetB0 + aggressive weights
   - Deploy dan kumpulkan feedback

2. **Medium Term** (1-2 bulan):
   - Tambah lebih data infertil (target 1000+)
   - Implement ensemble methods
   - Hyperparameter tuning

3. **Long Term** (3-6 bulan):
   - Kumpulkan 2000+ gambar per kelas
   - Train multiple models dan ensemble
   - Implement active learning

---

## 🚀 Deployment Checklist

### Backend
- [ ] Model trained dengan EfficientNetB0
- [ ] Class weights: aggressive
- [ ] Fine-tune: 20 layers
- [ ] Validation accuracy > 80%
- [ ] Model converted to TensorFlow.js
- [ ] Model copied to frontend

### Frontend
- [ ] TensorFlow.js integration working
- [ ] Fertility indicators displayed
- [ ] Score-based confidence
- [ ] Testing dengan gambar fertil dan infertil
- [ ] Deployed ke GitHub Pages/Vercel

---

**Status**: ✅ **READY TO IMPLEMENT**

Langkah-langkah di atas akan:
1. Mengatasi masalah class imbalance
2. Meningkatkan akurasi infertil detection
3. Menampilkan indikator fertility visual
4. Membuat analisis lebih transparan
5. Memungkun feedback untuk improvement
