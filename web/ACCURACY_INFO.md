# 🔍 Tentang Akurasi Prediksi

## ⚠️ Penting: Hasil Saat Ini

### Apa yang Anda Dapatkan Sekarang:

Aplikasi menggunakan **algorithm hybrid** yang menggabungkan:
- MobileNet (pre-trained deep learning model)
- Analisis computer vision (brightness, contrast, sharpness, pattern, texture)
- Rule-based classification

### Akurasi Saat Ini:
- 📊 **Akurasi: ~60-70%** (perkiraan)
- 🎯 **Untuk: Demo & Pembelajaran**
- ⚠️ **Bukan untuk: Keputusan produksi/percobaan nyata**

## 🎯 Cara Kerja Prediksi

### Faktor yang Dianalisis:

1. **Brightness (Kecerahan)**
   - Range ideal: 120-170 (telur subur)
   - Terlalu gelap/terang: kemungkinan tidak subur

2. **Contrast (Kontras)**
   - Range ideal: 40-70
   - Kontras yang baik menunjukkan struktur telur yang sehat

3. **Sharpness (Ketajaman)**
   - Deteksi tepi dan detail
   - Telur subur biasanya memiliki detail yang jelas

4. **Pattern (Pola Warna)**
   - Uniform: indikasi positif
   - Bervariasi: kemungkinan tidak sehat

5. **Texture (Tekstur)**
   - Smooth/Mod Rough: bagus
   - Very Rough/Rough: indikasi negatif

### Hasil 50/50?

Jika Anda mendapatkan hasil ~50% untuk semua kategori, ini berarti:
- Gambar memiliki fitur netral (tidak jelas fertile/infertile)
- Tidak ada faktor yang dominan
- Algorithm memutuskan secara acak di sekitar tengah

## 📈 Cara Meningkatkan Akurasi

### Untuk Hasil yang Lebih Akurat (80-90%):

#### Opsi 1: Train Custom Model (Recommended)

**Langkah:**

1. **Collect Dataset**
   ```
   Dataset yang dibutuhkan:
   - 500+ gambar telur subur (labeled "fertile")
   - 500+ gambar telur tidak subur (labeled "infertile")
   - Gambar harus diambil dengan kondisi lighting yang serupa
   - Resolusi: minimal 224x224 pixels
   ```

2. **Prepare Data**
   ```python
   # backend/prepare_data.py
   import tensorflow as tf
   from tensorflow.keras.preprocessing.image import ImageDataGenerator
   
   train_datagen = ImageDataGenerator(
       rescale=1./255,
       rotation_range=20,
       horizontal_flip=True
   )
   
   train_generator = train_datagen.flow_from_directory(
       'dataset/',
       target_size=(224, 224),
       batch_size=32,
       class_mode='categorical'
   )
   ```

3. **Train Custom CNN Model**
   ```python
   # backend/train_custom.py
   from tensorflow.keras.models import Sequential
   from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
   import tensorflowjs
   
   model = Sequential([
       Conv2D(32, (3,3), activation='relu', input_shape=(224,224,3)),
       MaxPooling2D(2,2),
       Conv2D(64, (3,3), activation='relu'),
       MaxPooling2D(2,2),
       Conv2D(128, (3,3), activation='relu'),
       MaxPooling2D(2,2),
       Flatten(),
       Dense(512, activation='relu'),
       Dropout(0.5),
       Dense(2, activation='softmax')  # Fertile vs Infertile
   ])
   
   model.compile(
       optimizer='adam',
       loss='categorical_crossentropy',
       metrics=['accuracy']
   )
   
   # Train model
   model.fit(
       train_generator,
       epochs=50,
       validation_data=val_generator
   )
   
   # Convert to TensorFlow.js
   tensorflowjs.converters.save_keras_model(
       model,
       'peacock_egg_custom_model'
   )
   ```

4. **Update Web App**
   ```typescript
   // web/src/utils/imageAnalysis.ts
   export async function analyzeImage(imageFile: File) {
     // Load custom trained model
     const model = await tf.loadLayersModel('/peacock_egg_custom_model/model.json')
     
     // Preprocess image
     const tensor = await preprocessImage(imageFile)
     
     // Predict
     const prediction = model.predict(tensor)
     
     // Return results
     return {
       prediction: prediction[0] > prediction[1] ? 'fertile' : 'infertile',
       confidence: Math.max(prediction[0], prediction[1]),
       // ...
     }
   }
   ```

#### Opsi 2: Fine-Tune Pre-trained Model

```python
# Use transfer learning from MobileNet
from tensorflow.keras.applications import MobileNetV2

base_model = MobileNetV2(
    weights='imagenet',
    include_top=False,
    input_shape=(224,224,3)
)

# Freeze base model
for layer in base_model.layers:
    layer.trainable = False

# Add custom layers
x = base_model.output
x = Flatten()(x)
x = Dense(256, activation='relu')(x)
x = Dropout(0.5)(x)
predictions = Dense(2, activation='softmax')(x)

model = Model(base_model.input, predictions)

model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

# Train on your peacock egg data
model.fit(
    train_generator,
    epochs=20
)
```

### Dataset Requirements

| Kualitas | Jumlah Gambar | Akurasi Target |
|-----------|---------------|-----------------|
| Minimal | 200 per kelas (400 total) | ~65% |
| Bagus | 500 per kelas (1000 total) | ~75% |
| Sangat Baik | 1000 per kelas (2000 total) | ~85%+ |
| Produksi | 2000+ per kelas | ~90%+ |

### Tips Dataset yang Baik:

✅ **DO:**
- Ambil gambar dengan lighting yang konsisten
- Termasuk berbagai angle dan posisi telur
- Label dengan benar (fertile/infertile)
- Gunakan resolusi tinggi (minimal 1024x1024)
- Tambah augmentasi (rotasi, flip, brightness)

❌ **DON'T:**
- Gunakan gambar yang sama berulang kali
- Label salah
- Lighting yang sangat berbeda antar gambar
- Gambar blur atau buram
- Terlalu sedikit variasi

## 📊 Perbandingan Pendekatan

| Pendekatan | Akurasi | Waktu Setup | Maintenance | Best For |
|-----------|---------|------------|--------------|-----------|
| **Rule-Based (Saat Ini)** | 60-70% | 0 menit | Mudah | Demo |
| **MobileNet Fine-tune** | 75-80% | 1-2 jam | Sedang | Produksi awal |
| **Custom CNN** | 85-90% | 4-8 jam | Tinggi | Produksi matang |
| **Ensemble (Multiple Models)** | 90%+ | 1-2 hari | Sangat tinggi | High-end |

## 🎯 Rekomendasi

### Untuk Sekarang:
- Gunakan aplikasi seperti adanya untuk **demo & learning**
- Jelaskan ke user bahwa ini **bukan pengganti tes fisik**
- Kumpulkan dataset untuk training di masa depan

### Untuk Produksi:
1. **Kumpulkan dataset** (minimal 1000 gambar per kelas)
2. **Train custom model** menggunakan script di atas
3. **Validate accuracy** dengan cross-validation
4. **Convert ke TF.js** untuk web deployment
5. **Deploy** dan monitor performance
6. **Iterate** - tambah data dan retrain untuk improvement

## 🔧 Implementasi Cepat (Jika Butuh Custom Model)

### Gunakan TFLite yang Sudah Ada

Jika Anda sudah punya model TFLite di `mobile/assets/peacock_egg_classifier.tflite`:

1. **Convert ke TensorFlow.js** (butuh backend Python sementara):
```bash
cd backend
python src/convert_to_tflite.py --convert_to_tfjs --tfjs_output ../web/public/peacock_egg_model_tfjs
```

2. **Update web app** untuk menggunakan model ini:
```typescript
// web/src/utils/imageAnalysis.ts
export async function analyzeImage(imageFile: File) {
  const model = await tf.loadGraphModel('/peacock_egg_model_tfjs/model.json')
  // Use model for prediction
}
```

3. **Deploy** aplikasi web

## 💡 Catatan Penting

- **Algorithm saat ini**: Heuristik + MobileNet feature extraction
- **Akurasi**: Tidak ideal untuk keputusan bisnis
- **Untuk penggunaan produksi**: WAJIB train custom model
- **Training time**: 2-6 jam tergantung dataset size
- **Model size**: 5-10MB setelah training
- **Improvement**: Terus tambah data dan retrain

## 📞 Bantuan

Jika butuh bantuan training custom model:
1. Kumpulkan dataset dulu
2. Siapkan struktur folder dataset
3. Jalankan training script
4. Validasi hasilnya

Lihat dokumentasi lengkap di `WEB_APP_DESIGN.md` dan `AI_ALGORITHM.md`.
