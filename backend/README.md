# Backend - Peacock Egg Fertility Classification

Backend untuk training dan konversi model CNN untuk identifikasi fertilitas telur merak.

## Struktur Folder

```
backend/
├── dataset/           # Dataset gambar telur merak
│   ├── fertile/       # Gambar telur fertile
│   ├── infertile/     # Gambar telur infertile
│   └── raw/          # Gambar original
├── models/           # Model yang disimpan
│   └── *.h5          # Model Keras
│   └── *.tflite      # TFLite model untuk mobile
├── notebooks/        # Jupyter notebooks untuk eksplorasi
├── scripts/          # Script standalone
├── src/              # Source code
│   ├── model.py      # Arsitektur model CNN
│   ├── data_loader.py # Loading dan preprocessing data
│   ├── train.py      # Training script
│   ├── evaluate.py   # Evaluasi model
│   ├── convert_to_tflite.py # Konversi ke TFLite
│   └── utils.py      # Utility functions
├── output/           # Output training (plot, metrics)
└── requirements.txt  # Dependencies Python
```

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Persiapkan dataset:
   - Kumpulkan gambar telur merak
   - Organisasikan ke folder `dataset/fertile/` dan `dataset/infertile/`
   - Target: 500-1000 gambar per class

## Training Model

```bash
cd backend/src
python train.py --data_dir ../dataset --epochs 50 --batch_size 32
```

Options:
- `--data_dir`: Path ke dataset (default: ../dataset)
- `--epochs`: Jumlah epochs (default: 50)
- `--batch_size`: Batch size (default: 32)
- `--learning_rate`: Learning rate (default: 0.001)

## Evaluasi Model

```bash
cd backend/src
python evaluate.py --model_path ../models/best_model.h5 --test_dir ../dataset
```

## Konversi ke TFLite

```bash
cd backend/src
python convert_to_tflite.py --model_path ../models/best_model.h5 --output_tflite ../models/peacock_egg_classifier.tflite --quantization float16
```

Opsional: Convert ke TensorFlow.js untuk web:
```bash
python convert_to_tflite.py --model_path ../models/best_model.h5 --convert_to_tfjs --tfjs_output ../web/public/models/peacock_egg_classifier_tfjs
```

## Jupyter Notebooks

Gunakan Jupyter notebooks untuk eksplorasi data dan eksperimen model:

```bash
jupyter notebook
```

Notebooks yang tersedia:
- `01_exploration.ipynb` - Eksplorasi data
- `02_preprocessing.ipynb` - Preprocessing data
- `03_training.ipynb` - Training model
- `04_evaluation.ipynb` - Evaluasi model
