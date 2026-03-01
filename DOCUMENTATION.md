# 🦚 Dokumentasi Lengkap Sistem Deteksi Fertilitas Telur Merak

Dokumen ini menjelaskan keseluruhan sistem aplikasi **Peacock Egg Detector**, mulai dari alur pelatihan model kecerdasan buatan (AI), arsitektur yang digunakan, desain struktur basis data (Database), hingga representasi visual berupa Flowchart dan Data Flow Diagram (DFD).

---

## 1. Algoritma & Arsitektur AI

Aplikasi ini menggunakan pendekatan **Deep Learning** berbasis **Convolutional Neural Network (CNN)** untuk membedakan citra (gambar) telur merak yang fertil (subur) dan infertil (tidak subur). Terdapat dua opsi arsitektur yang disediakan pada sisi *backend*:

1. **Custom CNN Architecture**: Model CNN yang dibangun dari awal *(from scratch)* khusus untuk dataset telur.
2. **Transfer Learning (EfficientNetB0)**: Memanfaatkan model pre-trained (yang sudah dilatih pada jutaan gambar ImageNet) dan dilakukan penyesuaian (*fine-tuning*) pada lapisan *(layer)* terakhir. Metode ini sangat disarankan untuk menangani dataset yang terbatas dan tidak seimbang (*imbalanced*).

### Flowchart Arsitektur CNN (Transfer Learning - EfficientNetB0)

Berikut adalah detail arsitektur model ketika menggunakan pendekatan *Transfer Learning* dari sekumpulan arsitektur *EfficientNetB0*.

```mermaid
flowchart TD
    %% Node Styling
    classDef input fill:#e1f5fe,stroke:#01579b,stroke-width:2px,color:#000
    classDef preTrained fill:#fff3e0,stroke:#e65100,stroke-width:2px,color:#000
    classDef customLayer fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px,color:#000
    classDef output fill:#fce4ec,stroke:#880e4f,stroke-width:2px,color:#000

    IN(["Input Image<br>224x224x3"])

    subgraph "EfficientNetB0 Base Model (Frozen/Fine-tuned Layers)"
        L1["Stem: Conv3x3 + BN + Swish"]
        L2["MBConv Blocks<br>Mobile Inverted Bottleneck Conv"]
        L3["Top: Conv1x1 + BN + Swish"]
    end

    subgraph "Custom Classification Head"
        GAP["Global Average Pooling 2D"]
        DO["Dropout Layer<br>Prevent Overfitting"]
        FC["Dense Layer / Fully Connected"]
        OUT(["Output Layer<br>Softmax - 2 Classes"])
    end

    IN --> L1
    L1 --> L2
    L2 --> L3
    L3 --> GAP
    GAP --> DO
    DO --> FC
    FC --> OUT

    class IN input
    class L1,L2,L3 preTrained
    class GAP,DO,FC customLayer
    class OUT output
```

**Penjelasan Arsitektur CNN (EfficientNetB0):**

1. **Input Image (224x224x3)**: Gambar telur yang diunggah oleh pengguna akan diubah ukurannya (*resize*) menjadi 224x224 piksel dengan 3 saluran warna (RGB) sebelum dimasukkan ke dalam model saraf.
2. **EfficientNetB0 Base Model**: Ini adalah fondasi utama pengekstraksi fitur *(Feature Extractor)*. Model ini sudah dilatih sebelumnya (*pre-trained*) pada dataset raksasa (ImageNet). Model ini sangat efisien dan mampu mengenali pola visual yang rumit mulai dari tepi, warna, tekstur, hingga bentuk-bentuk kompleks yang ada pada cangkang telur.
   * *Stem & MBConv Blocks*: Serangkaian lapisan konvolusi terbalik *(inverted bottleneck)* beralgoritma efisien yang bertugas mengekstrak fitur visual dari resolusi rendah hingga tinggi.
3. **Global Average Pooling 2D**: Lapisan ini berfungsi untuk meratakan (menyatukan) seluruh peta fitur (*feature maps*) keluaran dari EfficientNet menjadi satu bentuk vektor 1D dengan cara mengambil nilai rata-ratanya. Ini jauh lebih ringan dan mencegah *overfitting* ketimbang lapisan *Flatten* biasa.
4. **Dropout Layer**: Berfungsi untuk mematikan beberapa koneksi sel saraf secara acak selama proses *training* berlangsung. Hal ini krusial agar model tidak sekadar menghafal gambar telur saat *training* (*overfitting*), melainkan benar-benar belajar polanya.
5. **Dense Layer**: Lapisan saraf buatan kustom yang sepenuhnya terhubung *(Fully Connected Layer)* yang kita susun sendiri di ujung arsitektur. Matriks fitur diterjemahkan ke dalam probabilitas klasifikasi.
6. **Output Layer (Softmax)**: Lapis terakhir dalam model ini memiliki 2 sel saraf keluaran yang dipasangkan dengan fungsi aktivasi *Softmax*. Fungsi ini akan merubah angka matematis menjadi probabilitas persentase untuk 2 kelas prediksi akhir: **Fertil** (Subur) dan **Infertil** (Tidak Subur).

### Alur Pelatihan Model (Training Workflow)

Proses dari awal hingga model dapat dipakai di aplikasi web:

```mermaid
graph TD
    A[Pengumpulan Dataset] --> B[Pemilahan Kategori: Fertil & Infertil]
    B --> C[Data Preprocessing & Augmentation]
    C -->|Images 224x224| D[Split: Train 80% & Validation 20%]
    D --> E{Pilih Arsitektur}
    
    E -->|Custom CNN| F[Train Custom Model]
    E -->|Pre-trained| G[Transfer Learning EfficientNetB0]
    
    F --> H[Evaluasi Model]
    G --> H
    
    H -->|Akurasi Rendah| C
    H -->|Akurasi Baik| I[Simpan Model .h5]
    
    I --> J[Convert ke TFLite Mobile]
    I --> K[Convert ke TensorFlow.js]
    
    K --> L[Deploy Model ke Folder Web /public]
```

---

## 2. Entity Relationship Diagram (ERD) Basis Data

Aplikasi ini menggunakan **Supabase** (PostgreSQL) sebagai *Backend as a Service* (BaaS) yang mengatur Autentikasi dan Basis Data.

```mermaid
erDiagram
    %% Auth Tables (Internal Supabase)
    auth_users {
        uuid id PK
        varchar email
        jsonb raw_user_meta_data
        timestamp created_at
    }

    %% Public Tables
    profiles {
        uuid id PK "FK to auth.users.id"
        varchar full_name
        varchar email
        timestamp created_at
    }

    predictions {
        uuid id PK
        uuid user_id FK "FK to auth.users.id"
        text image_url
        varchar prediction "fertile / infertile"
        float confidence
        float fertile_prob
        float infertile_prob
        varchar model_used
        timestamp created_at
    }

    %% Relationships
    auth_users ||--|| profiles : "1 to 1 (Trigger On Insert/Update)"
    auth_users ||--o{ predictions : "1 to Many"
```

> **Keterangan DB:**
> * `auth.users` adalah tabel bawaan Supabase untuk mengelola login.
> * `profiles` disinkronkan langsung dengan `auth.users` menggunakan SQL *Trigger* otomatis.
> * `predictions` memanfaatkan *Row Level Security* (RLS) di mana pengguna hanya dapat melihat dan menghapus riwayat deteksi mereka sendiri.

---

## 3. Flowchart Aplikasi Web

Alur penggunaan aplikasi dari sisi pengguna (User Journey):

```mermaid
flowchart TD
    Start([Mulai Aplikasi]) --> CekAuth{Cek Sesi Login?}
    
    CekAuth -->|Belum Login| PageLogin[Halaman Login]
    PageLogin --> PilihanAuth{Pilih Masuk?}
    PilihanAuth -->|Daftar/Login| AuthProses[Autentikasi Supabase]
    PilihanAuth -->|Masuk sbg Tamu| GuestSession[Set Guest Session]
    
    AuthProses --> Beranda
    GuestSession --> Beranda
    CekAuth -->|Sudah Login| Beranda[Halaman Deteksi]
    
    Beranda --> InputMedia{Pilih Sumber Gambar}
    InputMedia -->|Kamera| AmbilFoto[Ambil Foto via HP/Webcam]
    InputMedia -->|Galeri| UploadFoto[Upload File Gambar]
    
    AmbilFoto --> ModelProses
    UploadFoto --> ModelProses
    
    ModelProses[Proses Ekstraksi & Prediksi AI di Browser via TFJS] --> TampilHasil[Tampilkan Hasil & Probabilitas]
    
    TampilHasil --> CekUserStatus{User / Guest?}
    CekUserStatus -->|User| SimpanDB[Simpan Riwayat ke Supabase]
    CekUserStatus -->|Guest| SkipSimpan[Riwayat Tidak Disimpan]
    
    SimpanDB --> End([Selesai])
    SkipSimpan --> End
```

### Penjelasan Flowchart:
1. **Pengecekan Autentikasi**: Saat aplikasi dibuka, sistem akan mengecek apakah pengguna memiliki sesi login yang aktif atau memilih mode Tamu (Guest).
2. **Proses Masuk**: Jika belum login, pengguna diarahkan ke halaman Login/Daftar. Pengguna bisa memilih membuat akun (data disimpan ke Supabase) atau masuk sebagai Tamu.
3. **Input Media**: Pada halaman Beranda (Deteksi), pengguna dapat memilih untuk mengambil foto langsung dari Kamera HP atau mengunggah gambar dari Galeri.
4. **Pemrosesan AI**: Gambar yang diinputkan akan diproses oleh model AI yang dijalankan langsung di browser menggunakan TensorFlow.js.
5. **Output & Penyimpanan**: Sistem akan menampilkan hasil (Fertil/Infertil) beserta persentase probabilitas. Jika pengguna login menggunakan akun, hasil ini akan disimpan ke *database* Supabase. Jika menggunakan mode Tamu, hasil hanya ditampilkan sementara dan tidak disimpan.

---

## 4. Data Flow Diagram (DFD)

Data Flow Diagram menggambarkan bagaimana data bergerak di dalam sistem aplikasi ini, mulai dari antarmuka web, pemrosesan kecerdasan buatan, hingga penyimpanan basis data.

### DFD Level 0 (Context Diagram)

Diagram konteks tingkat tinggi dari keseluruhan interaksi.

```mermaid
graph LR
    User([Pengguna]) -- "Data Diri & Kredensial" --> System((Peacock Egg \n Detector System))
    System -- "Status Autentikasi" --> User
    
    User -- "Gambar Telur (Kamera/Galeri)" --> System
    System -- "Hasil Prediksi (Fertil/Infertil)" --> User
    System -- "Daftar Riwayat Prediksi" --> User
```

**Penjelasan DFD Level 0:**
* **Entitas Pengguna** berinteraksi dengan satu kesatuan Sistem utama.
* Alur data masuk (*input*) berupa **Kredensial Login** dan **Gambar Telur Merak**.
* Alur data keluar (*output*) berupa **Status Autentikasi**, **Hasil Prediksi Fertilitas**, dan **Daftar Riwayat Prediksi** yang pernah dilakukan.

### DFD Level 1 (Rincian Proses Utama)

Rincian dari interaksi internal sistem ke berbagai modul data.

```mermaid
flowchart TD
    %% Entitas Eksternal
    User([Pengguna])
    
    %% Proses
    P1((1. Manajemen \n Akun & Sesi))
    P2((2. Pemrosesan \n AI & Prediksi))
    P3((3. Manajemen \n Riwayat))
    
    %% Data Stores
    D1[(D1: User Auth & Profiles)]
    D2[(D2: Model TF.js / TFLite)]
    D3[(D3: Predictions Database)]
    D4[(D4: Storage Bucket)]
    
    %% Alur Data
    User -- "Email, Password, Nama" --> P1
    P1 -- "Akses Diberikan/Guest" --> User
    P1 -- "Registrasi / Update" --> D1
    D1 -- "ID & Profil" --> P1
    
    User -- "Gambar Input" --> P2
    D2 -- "Weights & Biases (Model)" --> P2
    P2 -- "Inferensi / Hasil Analisis" --> User
    P2 -- "Hasil Analisis & Gambar Base64" --> P3
    
    P3 -- "Simpan ke DB" --> D3
    P3 -- "Query Seluruh Riwayat" --> D3
    D3 -- "Data Riwayat" --> P3
    P3 -- "Tampilkan Daftar Riwayat" --> User
    
    User -- "Instruksi Hapus Data" --> P3
    P3 -- "Delete Row" --> D3
```

**Penjelasan Proses DFD Level 1:**

* **Proses 1. (Manajemen Akun & Sesi):**
  * Menerima input data diri (email, nama, password) dari Pengguna.
  * Memvalidasi kredensial dan mencatat/mengambil data pengguna dari Data Store `D1` (Supabase Auth & Profiles).
  * Mengembalikan status sesi aktif (Akses Diberikan) atau sesi mode Tamu kepada Pengguna.

* **Proses 2. (Pemrosesan AI & Prediksi):**
  * Menerima input gambar telur dari Pengguna.
  * Memuat sekumpulan parameter jaringan saraf tiruan (Weights & Biases) dari Data Store `D2` (File Model TFJS/TFLite yang di-host statis).
  * Melakukan inferensi/prediksi secara *offline* di sisi klien (browser).
  * Menampilkan hasil prediksi ke layar Pengguna, dan mengirimkan paket data hasil beserta *thumbnail* gambar (Base64) ke Proses 3.

* **Proses 3. (Manajemen Riwayat):**
  * Menerima paket data hasil dari Proses 2.
  * Menyimpan data hasil prediksi tersebut ke dalam Data Store `D3` (Tabel Predictions).
  * Mengambil (*query*) seluruh baris riwayat yang dimiliki pengguna dari `D3` dan menampilkannya pada halaman Riwayat.
  * Menerima perintah/instruksi hapus (satuan atau hapus semua) dari Pengguna untuk menghapus (*delete*) baris tertentu pada `D3`.

---
**Catatan Penting Pengembangan:**
Aplikasi ini menjalankan **inferensi AI sepenuhnya di sisi klien (Browser)** menggunakan `TensorFlow.js`. Hal ini menjaga privasi data (gambar tidak melulu perlu dikirim ke server backend untuk dianalisis) dan memberikan hasil seketika (*real-time response*) tanpa beban server yang berlebihan. Server backend Supabase mutlak hanya digunakan untuk fungsi autentikasi dan penyimpanan riwayat (database log).
