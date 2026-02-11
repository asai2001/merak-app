# 🚀 Quick Deployment Guide

## Setup Cepat (5 Menit)

### 1. Training Model (Backend)

```bash
cd backend

# Cek dataset
python check_setup.py

# Training model (pilih salah satu)
# Opsi A: Custom CNN (target 85-90%)
python src/train.py --data_dir dataset --epochs 100

# Opsi B: EfficientNetB0 (rekomendasi, target 90-95%)
python src/train.py --data_dir dataset --epochs 100 --pretrained
```

### 2. Konversi Model ke TensorFlow.js

```bash
# Convert model untuk web
python src/convert_to_tfjs.py --format tfjs

# Copy model ke frontend
# Windows
xcopy /E /I models\tfjs ..\web\public\model\tfjs

# Linux/Mac
cp -r models/tfjs ../web/public/model/
```

### 3. Build & Deploy Frontend

```bash
cd web

# Install dependencies (first time only)
npm install

# Development (testing)
npm run dev

# Production build
GITHUB_PAGES=true npm run build
```

### 4. Deploy

#### GitHub Pages (Free Hosting)

```bash
# Deploy ke GitHub Pages
npm run deploy
```

URL: `https://username.github.io/repository-name/`

#### Vercel (Fast Deployment)

```bash
# Install Vercel CLI (first time only)
npm install -g vercel

# Deploy
vercel --prod
```

URL: `https://your-app.vercel.app`

---

## Test Application

### 1. Browser Test

1. Open: `http://localhost:3000` (dev) or deploy URL (production)
2. Upload image telur merak
3. Wait for AI analysis
4. Check result

### 2. Android WebView Test

```kotlin
// MainActivity.kt
webView.settings.javaScriptEnabled = true
webView.settings.domStorageEnabled = true
webView.loadUrl("https://your-app.vercel.app")
```

---

## Deployment Checklist

### Backend ✓

- [ ] Dataset siap di `backend/dataset/`
- [ ] Python dependencies terinstall (`pip install -r requirements.txt`)
- [ ] Model dilatih (`python src/train.py`)
- [ ] Model dikonversi (`python src/convert_to_tfjs.py`)
- [ ] Model dicopy ke frontend

### Frontend ✓

- [ ] Node.js terinstall
- [ ] Dependencies terinstall (`npm install`)
- [ ] Model TFJS ada di `public/model/tfjs/`
- [ ] Build berhasil (`npm run build`)
- [ ] Output ada di `out/`

### Deployment ✓

- [ ] GitHub Pages terkonfigurasi (source: gh-pages branch)
- [ ] Vercel project tercreate (opsional)
- [ ] Production build berhasil
- [ ] App dapat diakses via URL

### Testing ✓

- [ ] Test di desktop browser (Chrome/Firefox)
- [ ] Test di mobile browser
- [ ] Test di Android WebView
- [ ] Upload image berjalan
- [ ] AI inference berjalan
- [ ] Result ditampilkan dengan benar

---

## Common Issues & Solutions

### Model Not Found (Web)

**Error**: "Failed to load model"  

**Solution**:
```bash
# Cek model ada di folder yang benar
ls web/public/model/tfjs/

# Harus ada file:
# - model.json
# - group1-shard*.bin
```

### Build Error

**Error**: Build gagal dengan error TypeScript  

**Solution**:
```bash
# Clear cache dan reinstall
cd web
rm -rf .next node_modules
npm install
npm run build
```

### GitHub Pages 404

**Error**: Halaman tidak ditemukan setelah deploy  

**Solution**:
```bash
# Cek branch gh-pages
git branch -a

# Pastikan file ada di branch
git show gh-pages:index.html

# Re-deploy jika file tidak ada
npm run deploy
```

### Slow Inference

**Error**: Analisis gambar terlalu lambat  

**Solution**:
1. Pastikan WebGL tersedia (banyak browser mobile support)
2. Kurangi image size jika diperlukan
3. Close tab lain untuk free up memory
4. Use browser terbaru (Chrome 110+, Firefox 110+)

---

## Performance Optimization

### Backend Training

**Tips untuk training lebih cepat**:
- Gunakan GPU jika tersedia (NVIDIA RTX 3060+)
- Kurangi batch size jika memory kurang
- Gunakan EfficientNetB0 untuk faster convergence
- Gunakan fewer epochs jika model sudah stabil

### Frontend Inference

**Tips untuk inferensi lebih cepat**:
1. Use model yang lebih kecil jika akurasi tidak prioritas
2. Enable WebGL acceleration
3. Load model sekali, reuse untuk multiple predictions
4. Implement Web Workers untuk non-blocking UI

### Deployment

**Tips untuk deployment lebih cepat**:
1. Use Vercel untuk edge caching
2. Implement CDN untuk model files
3. Use static hosting untuk fastest load times
4. Enable compression (gzip/brotli)

---

## URLs After Deployment

### GitHub Pages

Format: `https://username.github.io/repository-name/`

Example: `https://john-doe.github.io/peacock-egg-detector/`

### Vercel

Format: `https://your-app.vercel.app`

Example: `https://peacock-egg-detector.vercel.app`

### Custom Domain

Bisa menggunakan custom domain di kedua platform:
1. Buy domain (Namecheap, GoDaddy, dll)
2. Configure DNS ke hosting provider
3. Update app settings

---

## Monitoring & Updates

### Monitoring Metrics

#### App Performance
- Page load time
- First contentful paint (FCP)
- Time to interactive (TTI)
- Inference time per image

#### AI Performance
- Average confidence score
- Prediction distribution (fertile vs infertile)
- Error rate (user feedback)

### Update Workflow

#### Model Updates

1. Train model baru dengan data yang lebih banyak
2. Convert ke TensorFlow.js
3. Copy ke frontend
4. Test di staging environment
5. Deploy ke production

#### App Updates

1. Update dependencies (`npm update`)
2. Test semua features
3. Build new version
4. Deploy to production

---

## Additional Resources

### Full Documentation

- 📖 [PANDUAN LENGKAP CNN MERAK](PANDUAN_LENGKAP_CNN_MERAK.md) - Panduan lengkap

### Platform Guides

- **GitHub Pages**: https://pages.github.com/
- **Vercel**: https://vercel.com/docs
- **Next.js**: https://nextjs.org/docs
- **TensorFlow.js**: https://www.tensorflow.org/js

### Training Resources

- **TensorFlow Documentation**: https://www.tensorflow.org/guide
- **Keras Documentation**: https://keras.io/
- **Transfer Learning Guide**: https://www.tensorflow.org/tutorials/images/transfer_learning

---

## Support

### Quick Help

For quick answers, check:
1. **Troubleshooting** section in [PANDUAN LENGKAP CNN MERAK](PANDUAN_LENGKAP_CNN_MERAK.md)
2. Console browser logs (F12)
3. Terminal output (backend logs)

### Advanced Support

For complex issues:
1. Check full documentation
2. Review GitHub issues
3. Create new issue with details

---

## Success Criteria

Deployment dianggap berhasil jika:

✅ **Frontend**: App dapat diakses via URL (GitHub Pages/Vercel)  
✅ **Model**: Model TFJS berhasil load dan ready  
✅ **Inference**: Gambar dapat diupload dan dianalisis  
✅ **Result**: Hasil klasifikasi ditampilkan dengan confidence score  
✅ **Performance**: Inference time < 500ms di browser modern  
✅ **Mobile**: App berjalan smooth di mobile browser  
✅ **WebView**: App kompatibel dengan Android WebView  

---

**Ready to deploy? 🚀**

Ikuti steps di atas dan app akan live dalam 5-10 menit!
