# 🔧 Solusi Perbaikan Akurasi Model

## Masalah

Model mengklasifikasikan gambar **infertil** sebagai **fertile** dengan confidence tinggi (74.7%).

### Akar Masalah

**Class Imbalance yang Parah**:
```
Fertil:   677 gambar (73.8%)
Infertil: 240 gambar (26.2%)
Rasio:    2.82:1
```

Model menjadi **bias ke kelas mayoritas (fertil)** karena:
1. Dataset tidak seimbang (2.82:1)
2. Model melihat contoh fertil jauh lebih banyak selama training
3. Model mengoptimalkan untuk akurasi overall, bukan untuk kelas minoritas

---

## 📊 Analisis Problem

### 1. Bias ke Kelas Fertil

Ketika dataset imbalance, model cenderung memprediksi kelas mayoritas karena:
- Mengurangi error overall
- Lebih mudah dilakukan karena mayoritas training samples adalah fertil

### 2. Evaluasi yang Menipu

Akurasi 90% bisa mencapai dengan memprediksi semua gambar sebagai fertil:
- Fertil (677): 100% benar (accuracy untuk fertil)
- Infertil (240): 0% benar (semua salah)
- Total: 677/917 = 73.8% accuracy
- Tapi ini **useless** karena tidak mendeteksi infertil sama sekali!

---

## ✅ Solusi

### Solusi 1: Tambah Data Infertil ⭐️⭐️⭐️⭐️⭐️ (Paling Penting!)

**Cara paling efektif**: Kumpulkan lebih banyak gambar telur infertil

**Target**: Minimal 500-700 gambar infertil

**Cara Mengumpulkan**:
1. Ambil foto dari berbagai angles dan kondisi pencahaya
2. Variasi ukuran telur yang berbeda
3. Ambil foto telur infertil dari beberapa hari berbeda
4. Gunakan kamera yang berbeda jika mungkin

**Rasio Ideal**:
- **Minimum**: 2:1 (fertil:infertil)
- **Better**: 1.5:1
- **Best**: 1:1 (balanced)

### Solusi 2: Class Weights Agresif ⭐️⭐️⭐️⭐️

Update training script untuk menggunakan class weights yang lebih agresif:

```bash
# Method balanced (default)
python src/train.py --class_weights balanced

# Method aggressive (rekomendasi untuk imbalance)
python src/train.py --class_weights aggressive

# Method inverse (paling agresif)
python src/train.py --class_weights inverse
```

**Perbedaan Method**:

| Method | Weight Fertil | Weight Infertil | Rasio |
|--------|--------------|----------------|--------|
| Balanced | 0.67 | 1.91 | 2.85:1 |
| Aggressive | 1.0 | 4.2 | 4.2:1 |
| Inverse | 0.36 | 1.0 | 2.78:1 |

**Rekomendasi**: Gunakan `aggressive` untuk dataset saat ini

### Solusi 3: Data Augmentation Targeted ⭐️⭐️⭐️

Augmentasi yang lebih agresif untuk kelas infertil:

```python
# Update di data_loader.py
train_datagen_infertil = ImageDataGenerator(
    rescale=1./255,
    rotation_range=30,        # Lebih tinggi untuk infertil
    width_shift_range=0.2,
    height_shift_range=0.2,
    horizontal_flip=True,
    vertical_flip=True,
    zoom_range=0.3,            # Lebih agresif
    shear_range=0.2,
    brightness_range=[0.6, 1.4],  # Lebih bervariasi
    fill_mode='nearest'
)
```

### Solusi 4: Model Pretrained ⭐️⭐️⭐️⭐️

Gunakan EfficientNetB0 pretrained yang sudah dilatih di ImageNet:

```bash
python src/train.py --pretrained --epochs 100 --class_weights aggressive
```

**Keuntungan**:
- Transfer learning dari 1.2M+ gambar
- Fitur yang lebih robust
- Convergence lebih cepat
- Better generalization

### Solusi 5: Oversampling Kelas Infertil ⭐️⭐️⭐️

Gunakan teknik oversampling untuk kelas minoritas:

```python
from imblearn.over_sampling import SMOTE

# Atau gunakan oversampling sederhana
import numpy as np

def oversample_dataset(X_train, y_train, target_ratio=1.5):
    """
    Oversample minority class
    """
    fertil_indices = np.where(y_train == 0)[0]
    infertil_indices = np.where(y_train == 1)[0]
    
    n_fertil = len(fertil_indices)
    n_infertil = len(infertil_indices)
    target_infertil = int(n_fertil / target_ratio)
    
    # Randomly sample infertil images to reach target
    oversampled_indices = np.random.choice(
        infertil_indices,
        size=target_infertil,
        replace=True
    )
    
    return oversampled_indices
```

### Solusi 6: Focal Loss ⭐️⭐️

Gunakan focal loss yang memberikan lebih banyak weight pada hard examples:

```python
from tensorflow.keras import backend as K

def focal_loss(gamma=2., alpha=0.25):
    def focal_loss_fixed(y_true, y_pred):
        y_true = K.cast(y_true, 'float32')
        y_pred = K.cast(y_pred, 'float32')
        
        pt_1 = y_true * y_pred + (1 - y_true) * (1 - y_pred)
        pt = K.clip(pt_1, K.epsilon(), 1 - K.epsilon())
        
        cross_entropy = -K.log(pt)
        weight = alpha * K.pow(1 - pt, gamma)
        loss = weight * cross_entropy
        
        return K.mean(loss)
    
    return focal_loss_fixed

# Use in model compilation
model.compile(
    optimizer=optimizer,
    loss=focal_loss(gamma=2.0, alpha=0.25),
    metrics=['accuracy', tf.keras.metrics.Precision(), tf.keras.metrics.Recall()]
)
```

---

## 🎯 Rekomendasi Action Plan

### Prioritas 1: Tambah Data Infertil (HARI INI)

**Action**: Kumpulkan minimal 200-300 gambar infertil tambahan

**Target**: 
- Saat ini: 240 infertil
- Target: 500+ infertil
- Hasil rasio: 677:500 = 1.35:1 (much better!)

**Cara Melakukannya**:
1. Ambil foto telur infertil dari berbagai kondisi
2. Variasi angle dan pencahaya
3. Organisaikan di folder `dataset/infertil/`

### Prioritas 2: Re-train dengan Pretrained Model (HARI INI)

```bash
cd backend

# Re-train dengan EfficientNetB0 + aggressive class weights
python src/train.py \
    --data_dir dataset \
    --epochs 100 \
    --pretrained \
    --class_weights aggressive
```

**Hasil yang Diharapkan**:
- Akurasi validation: 85-90%+
- Precision infertil: 80%+
- Recall infertil: 75%+

### Prioritas 3: Evaluasi Model

Setelah training selesai, evaluasi dengan dataset validation:

```python
from sklearn.metrics import classification_report, confusion_matrix

# Generate predictions on validation set
y_pred = model.predict(val_generator)
y_true = val_generator.classes

# Generate classification report
print(classification_report(y_true, y_pred, target_names=['fertil', 'infertil']))

# Check confusion matrix
cm = confusion_matrix(y_true, y_pred)
print("\nConfusion Matrix:")
print(cm)
```

**Metrics yang Penting**:
- **Precision infertil**: Berapa prediksi infertil yang benar?
- **Recall infertil**: Berapa infertil yang terdeteksi?
- **F1-Score infertil**: Balance antara precision dan recall

---

## 📈 Monitoring Training Progress

### Signs Training Baik

✅ Training accuracy dan validation accuracy meningkat bersamaan  
✅ Gap antara training dan validation < 5-10%  
✅ Precision dan recall untuk kedua kelas seimbang  
✅ F1-score infertil > 75%

### Signs Training Buruk

❌ Training accuracy tinggi tapi validation accuracy rendah (overfitting)  
❌ Gap antara training dan validation > 15%  
❌ Precision infertil sangat rendah (berarti model jarang prediksi infertil)  
❌ Recall infertil sangat rendah (berarti model melewatkan infertil)

### Signs Bias ke Fertil

❌ Precision fertil > 95% tapi recall infertil < 50%  
❌ Model memprediksi semua sebagai fertil  
❌ Confusion matrix menunjukkan banyak false negatives untuk infertil

---

## 🔧 Troubleshooting: Infertil Tidak Terdeteksi

### Scenario: Foto Infertil Ditebak Fertil

**Diagnosa**:
1. Cek dataset: Apakah gambar infertil yang similar ada di folder fertil?
2. Cek class weights: Apakah cukup agresif?
3. Cek augmentation: Apakah cukup bervariasi?

**Solution**:

#### Step 1: Verifikasi Dataset

```bash
cd backend/dataset

# Cek jumlah gambar
ls fertil/ | wc -l
ls infertil/ | wc -l

# Visual cek beberapa gambar untuk verifikasi
# Pastikan labeling benar!
```

#### Step 2: Gunakan Class Weights Agresif

```bash
# Method 1: Aggressive (rekomendasi)
python src/train.py --class_weights aggressive --pretrained --epochs 150

# Method 2: Inverse (paling agresif, bisa overfit)
python src/train.py --class_weights inverse --pretrained --epochs 100
```

#### Step 3: Increase Dropout Regularization

Update `model.py` untuk menambah dropout:

```python
# Di fully connected layers
layers.Dense(256, activation='relu', kernel_regularizer=regularizers.l2(0.01)),
layers.BatchNormalization(),
layers.Dropout(0.6),  # Increase from 0.5 to 0.6

layers.Dense(128, activation='relu', kernel_regularizer=regularizers.l2(0.01)),
layers.BatchNormalization(),
layers.Dropout(0.6),  # Increase from 0.5 to 0.6
```

#### Step 4: Reduce Learning Rate

Gunakan learning rate yang lebih kecil:

```bash
python src/train.py --learning_rate 0.00005 --pretrained --epochs 150
```

Learning rate yang lebih kecil membantu model belajar dengan lebih hati-hati.

---

## 📊 Evaluasi Model yang Baik

### Metrics untuk Dicek

1. **Overall Accuracy**: Harus > 85%
2. **Accuracy per Class**: Harus seimbang
   - Fertil accuracy: 85-95%
   - Infertil accuracy: 85-95%
3. **Confusion Matrix**:
   ```
                Pred
              Fertile  Infertile
   Actual 
   Fertil     [TP       FP]
   Infertil   [FN       TN]
   ```
   
   Ideal: Diagonal tinggi, off-diagonal rendah

4. **Precision-Recall Curve**: AUC harus dekat 1.0

### Contoh Hasil Baik

```
Classification Report:
              precision    recall  f1-score   support

fertil          0.88      0.90     0.89       542
infertil        0.86      0.82     0.84       192

accuracy                            0.87       734
macro avg       0.87      0.86     0.87       734
weighted avg    0.87      0.87     0.87       734

Confusion Matrix:
[[  489   53 ]
 [  34   158 ]]

Interpretasi:
- 542 fertil: 489 benar (90%), 53 salah (10%)
- 192 infertil: 158 benar (82%), 34 salah (18%)
- False positives (fertil yang ditebak infertil): 34 (low, bagus!)
- False negatives (infertil yang ditebak fertil): 34 (low, bagus!)
```

---

## 🎯 Success Criteria

Model dianggap berhasil jika:

✅ **Accuracy Overall**: > 85%  
✅ **Accuracy Infertil**: > 80% (penting untuk tidak melewatkan infertil)  
✅ **Precision Infertil**: > 75% (bila memprediksi infertil, sering benar)  
✅ **Recall Infertil**: > 75% (mendeteksi banyak infertil)  
✅ **F1-Score Infertil**: > 75%  
✅ **Overfitting Gap**: < 10% antara training dan validation  

---

## 📝 Checklist Training

### Before Training

- [ ] Dataset sudah diperiksa dan di-verify
- [ ] Labeling sudah dicek (fertil vs infertil)
- [ ] Class imbalance sudah di-analisis
- [ ] Class weights method dipilih (aggressive)
- [ ] Data augmentation sudah dioptimalkan

### During Training

- [ ] Training accuracy meningkat
- [ ] Validation accuracy meningkat
- [ ] Loss berkurang
- [ ] Tidak ada tanda overfitting
- [ ] Precision dan recall seimbang

### After Training

- [ ] Model disimpan di `models/best_model.h5`
- [ ] Training history plot dibuat
- [ ] Validation accuracy > 80%
- [ ] Infertil recall > 70%
- [ ] Confusion matrix dicek

---

## 🚀 Immediate Action Steps

### Hari Ini

1. ⏳ **Tambah 100-200 gambar infertil** (paling penting!)
2. ⏳ **Re-train model** dengan EfficientNetB0 + aggressive weights
3. ⏳ **Evaluasi hasil** dengan confusion matrix
4. ⏳ **Deploy model** jika hasil memuaskan

### Minggu Ini

5. ⏳ **Tambah lagi infertil images** (target 500+)
6. ⏳ **Experimen** dengan berbagai class weight methods
7. ⏳ **Implement** oversampling atau focal loss
8. ⏳ **Fine-tune** hyperparameters

### Bulan Ini

9. ⏳ **Target 700+ infertil images**
10. ⏳ **Ensemble models** untuk akurasi lebih tinggi
11. ⏳ **K-fold cross validation** untuk robust evaluation
12. ⏳ **Production deployment** dengan model terbaik

---

## 💡 Tips Tambahan

### 1. Data Collection

- Ambil gambar telur infertil dari berbagai hari berbeda
- Variasi kondisi pencahaya (terang, sedang, gelap)
- Ambil dari berbagai angles
- Gunakan kamera yang berbeda jika mungkin

### 2. Data Preprocessing

- Normalisasi brightness dan contrast
- Crop ke region of interest (telur saja)
- Resize ke ukuran yang konsisten (224x224)

### 3. Training Strategy

- Gunakan pretrained model (EfficientNetB0)
- Implement early stopping
- Gunakan learning rate scheduling
- Tambah dropout regularization
- L2 regularization pada dense layers

### 4. Evaluation

- Jangan hanya lihat accuracy overall
- Cek precision dan recall per kelas
- Lihat confusion matrix
- Test pada independent test set

---

**Status**: ⚠️  **Improvement Needed**  

**Next Step**: Tambah data infertil dan re-train dengan pretrained model + aggressive class weights
