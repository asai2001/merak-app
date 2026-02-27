# 🦚 Dokumentasi Lengkap Sistem Deteksi Fertilitas Telur Merak

Dokumen ini menjelaskan keseluruhan sistem aplikasi **Peacock Egg Detector**, mulai dari alur pelatihan model kecerdasan buatan (AI), arsitektur yang digunakan, desain struktur basis data (Database), hingga representasi visual berupa Flowchart dan Data Flow Diagram (DFD).

---

## 1. Algoritma & Arsitektur AI

Aplikasi ini menggunakan pendekatan **Deep Learning** berbasis **Convolutional Neural Network (CNN)** untuk membedakan citra (gambar) telur merak yang fertil (subur) dan infertil (tidak subur). Terdapat dua opsi arsitektur yang disediakan pada sisi *backend*:

1. **Custom CNN Architecture**: Model CNN yang dibangun dari awal *(from scratch)* khusus untuk dataset telur.
2. **Transfer Learning (EfficientNetB0)**: Memanfaatkan model pre-trained (yang sudah dilatih pada jutaan gambar ImageNet) dan dilakukan penyesuaian (*fine-tuning*) pada lapisan *(layer)* terakhir. Metode ini sangat disarankan untuk menangani dataset yang terbatas dan tidak seimbang (*imbalanced*).

### Arsitektur Model (Contoh: Transfer Learning)

```text
[ Input Image 224x224x3 ]
          ↓
[ EfficientNetB0 Base (Pre-trained) ] --> Ekstraksi Fitur Kompleks (Tekstur, Pola)
          ↓
[ Global Average Pooling 2D ]
          ↓
[ Dense Layer (Fully Connected) ]
          ↓
[ Output Layer (Softmax/Sigmoid) ] --> 2 Class (Fertil / Infertil)
```

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
