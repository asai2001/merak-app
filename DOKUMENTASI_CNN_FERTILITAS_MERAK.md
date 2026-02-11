# IDENTIFIKASI FERTILITAS TELUR MERAK MENGGUNAKAN ALGORITMA CONVOLUTIONAL NEURAL NETWORK (CNN)

## Deskripsi Proyek

Proyek ini mengimplementasikan Convolutional Neural Network (CNN) untuk mengklasifikasikan fertilitas telur merak menjadi dua kelas:
- **Fertil**: Telur yang subur dan dapat berkembang menjadi embrio
- **Infertil**: Telur yang tidak subur dan tidak dapat berkembang

## Dataset

### Statistik Dataset
- **Total Gambar**: 917 gambar
- **Fertil**: 677 gambar (73.8%)
- **Infertil**: 240 gambar (26.2%)
- **Rasio Kelas**: 2.8:1

### Struktur Dataset
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

### Ketidakseimbangan Kelas
Dataset mengalami ketidakseimbangan (class imbalance) dengan rasio 2.8:1. Untuk mengatasi masalah ini:

1. **Class Weights**: Memberikan bobot lebih tinggi pada kelas minoritas (infertil)
   - Weight fertil: 0.67
   - Weight infertil: 1.91

2. **Data Augmentation**: Meningkatkan variasi data dengan:
   - Rotasi: ±20°
   - Shift horizontal & vertical: ±15%
   - Zoom: ±20%
   - Flip horizontal & vertikal
   - Shear: ±15%
   - Brightness: 0.7-1.3

## Arsitektur Model

### Model Custom CNN

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
- Global Average Pooling menggantikan Flatten untuk mengurangi parameter

### Model Pretrained (Opsional)

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

**Keuntungan:**
- Menggunakan fitur yang sudah dipelajari dari 1.2M+ gambar
- Convergence lebih cepat
- Potensi akurasi lebih tinggi untuk dataset kecil

## Konfigurasi Training

### Hyperparameter Optimal

| Parameter | Nilai | Penjelasan |
|-----------|-------|-----------|
| Learning Rate | 0.0001 | Learning rate kecil untuk stabilitas |
| Optimizer | Adam | Adaptive gradient descent |
| Batch Size | 32 | Balance antara speed dan memori |
| Epochs | 100 | Dengan early stopping |
| Validation Split | 20% | Untuk monitoring |
| Loss Function | Categorical Crossentropy | Untuk klasifikasi multi-kelas |

### Callbacks

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

### Data Augmentation

Augmentation dilakukan secara real-time saat training:

```python
ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.15,
    height_shift_range=0.15,
    horizontal_flip=True,
    vertical_flip=True,
    zoom_range=0.2,
    shear_range=0.15,
    brightness_range=[0.7, 1.3],
    fill_mode='nearest',
    validation_split=0.2
)
```

## Cara Penggunaan

### Training Model Custom CNN

```bash
cd backend
python src/train.py --data_dir dataset --epochs 100 --batch_size 32
```

### Training Model Pretrained

```bash
python src/train.py --data_dir dataset --epochs 100 --pretrained
```

### Parameter Tambahan

```bash
python src/train.py \
    --data_dir dataset \
    --epochs 100 \
    --batch_size 32 \
    --img_size 224 224 \
    --learning_rate 0.0001
```

## Evaluasi Model

### Metrics yang Dipantau

1. **Accuracy**: Persentase prediksi benar secara keseluruhan
2. **Precision**: Persentase prediksi positif yang benar
3. **Recall**: Persentase kasus positif yang terdeteksi
4. **Loss**: Fungsi loss categorical crossentropy

### Output Training

1. **Best Model**: `models/best_model.h5`
2. **Training History Plot**: `output/training_history.png`
3. **Model Summary**: Ditampilkan di console

## Arsitektur File

```
backend/
├── src/
│   ├── train.py          # Script training
│   ├── model.py          # Definisi arsitektur model
│   ├── data_loader.py    # Loading dan preprocessing data
│   ├── utils.py          # Utilities (callbacks, plotting)
│   ├── evaluate.py       # Evaluasi model
│   └── convert_to_tflite.py  # Konversi ke TFLite
├── dataset/
│   ├── fertil/          # 677 gambar
│   └── infertil/        # 240 gambar
├── models/              # Model terbaik disimpan
└── output/              # Plot dan metrics
```

## Strategi Mencapai Akurasi Tinggi

### 1. Penanganan Class Imbalance
- **Class Weights**: Memberikan bobot lebih tinggi ke kelas minoritas
- **Data Augmentation Agresif**: Meningkatkan variasi data kelas minoritas

### 2. Regularisasi
- **Dropout**: Mencegah overfitting pada fully connected layers
- **Batch Normalization**: Stabilisasi training
- **L2 Regularization**: Penalty pada weight besar

### 3. Optimasi Training
- **Learning Rate Scheduling**: Mengurangi LR saat plateau
- **Early Stopping**: Menghentikan training saat tidak ada improvement
- **Gradient Descent**: Adam optimizer untuk adaptasi per parameter

### 4. Arsitektur yang Efektif
- **Global Average Pooling**: Mengurangi parameter dan overfitting
- **Depth-wise Progression**: Kedalaman bertahap menangkap fitur kompleks
- **Batch Normalization**: Mempercepat convergence

### 5. Data Quality
- **Rescaling**: Normalisasi pixel ke [0, 1]
- **Image Size**: 224x224 (standar untuk pretrained models)
- **Augmentation Beragam**: Rotasi, zoom, flip, brightness, shear

## Hasil yang Diharapkan

Dengan dataset saat ini (917 gambar):

| Model | Target Accuracy | Estimasi Training Time |
|-------|---------------|----------------------|
| Custom CNN | 85-90% | 30-60 menit (GPU) |
| EfficientNetB0 | 90-95% | 45-90 menit (GPU) |

*Note: Hasil dapat bervariasi tergantung hardware dan random seed.*

## Optimasi Lanjutan

Jika akurasi belum memuaskan:

1. **K-Fold Cross Validation**: Validasi lebih robust
2. **Ensemble Methods**: Kombinasi beberapa model
3. **Hyperparameter Tuning**: Grid search atau Bayesian optimization
4. **Gather More Data**: Khususnya untuk kelas infertil
5. **Transfer Learning Fine-tuning**: Unfreeze beberapa layer terakhir EfficientNet

## Troubleshooting

### Overfitting
- Tambah dropout rate
- Tambah L2 regularization
- Kurangi kompleksitas model
- Tambah data augmentation

### Underfitting
- Tingkatkan learning rate
- Tambah epoch
- Tambah kompleksitas model
- Kurangi regularisasi

### Plateau
- Kurangi learning rate
- Coba optimizer berbeda
- Cek learning rate scheduler

## Requirements

```
tensorflow>=2.10.0
numpy>=1.21.0
matplotlib>=3.5.0
scikit-learn>=1.0.0
Pillow>=9.0.0
```

## Hardware yang Direkomendasikan

| Komponen | Minimum | Recommended |
|----------|----------|-------------|
| CPU | Intel i5 / AMD Ryzen 5 | Intel i7 / AMD Ryzen 7 |
| RAM | 8 GB | 16 GB |
| GPU | - | NVIDIA RTX 3060+ (CUDA 11.2+) |
| Storage | 10 GB SSD | 20 GB SSD |

## Referensi

1. **LeCun, Y., et al. (2015)**. "Deep learning." *Nature*, 521(7553), 436-444.
2. **He, K., et al. (2016)**. "Deep Residual Learning for Image Recognition." *CVPR*.
3. **Tan, M., & Le, Q. (2019)**. "EfficientNet: Rethinking Model Scaling for Convolutional Neural Networks." *ICML*.

## Kontribusi

Untuk meningkatkan akurasi model:
1. Tambah lebih banyak data, khususnya kelas infertil
2. Label data dengan lebih akurat
3. Eksperimen dengan arsitektur berbeda
4. Tuning hyperparameter secara sistematis

---

**Penulis**: AI Assistant  
**Tanggal**: 2026  
**Versi**: 1.0
