# Peacock Egg Detector - Web

A Progressive Web App (PWA) for detecting peacock egg fertility using AI. Runs entirely in the browser with no backend required!

## 🌐 Live Demo

Coming soon!

## ✨ Features

- 🧠 **AI-Powered Detection** - Uses TensorFlow.js for client-side analysis
- 📱 **Installable PWA** - Install on mobile or desktop for native app experience
- 🚀 **No Backend Required** - All processing happens in your browser
- 📊 **Detailed Analysis** - See confidence scores and technical image metrics
- 🔒 **Privacy First** - No data transmitted, everything runs locally
- 📴 **Offline Ready** - Works without internet after initial load

## 🚀 Quick Start

### Run Locally

```bash
cd web
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## 📱 Installation

### On Mobile

1. Open the app in Chrome/Safari on your phone
2. Tap "Install App" when prompted
3. App will be added to your home screen
4. Opens as a native app with full-screen experience!

### On Desktop

1. Click the install icon (⊕) in the address bar
2. App will be installed to your applications
3. Launch like any desktop app!

## 🛠️ Technology Stack

- **Next.js 14** - React framework
- **TensorFlow.js** - Browser-based ML
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **PWA** - Progressive Web App capabilities

## 📦 Deployment

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

That's it! Vercel handles everything automatically.

### Deploy to GitHub Pages

1. Build the app:
```bash
npm run build
```

2. The `out/` folder will be created

3. Upload contents of `out/` to `gh-pages` branch

4. Enable GitHub Pages in repository settings

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

## 📖 Usage

1. **Upload Image**: Drag and drop or click to select an image
2. **AI Analysis**: Click "Analyze Image" button
3. **View Results**: See fertility prediction with confidence score
4. **Technical Details**: Review brightness, contrast, and color metrics

## 🔐 Privacy & Security

- ✅ No data leaves your browser
- ✅ No server required
- ✅ Images never uploaded
- ✅ Completely private and secure

## 🌟 AI Model

The app uses TensorFlow.js to analyze images in real-time:

- **Brightness Analysis** - Measures overall image luminance
- **Contrast Detection** - Calculates color variance
- **Color Distribution** - Analyzes RGB color balance
- **Smart Prediction** - Combines multiple factors for accuracy

## 📱 Browser Support

| Browser | Version | Status |
|----------|---------|--------|
| Chrome  | Latest  | ✅ Full Support |
| Firefox | Latest  | ✅ Full Support |
| Safari  | Latest  | ✅ Full Support |
| Edge    | Latest  | ✅ Full Support |

## 🆘 Troubleshooting

### Install prompt doesn't appear
The install prompt only appears once per site. To manually install:
- **Chrome**: Click ⋮ > "Install Peacock Egg"
- **Safari iOS**: Tap Share > "Add to Home Screen"

### App won't analyze images
- Ensure WebGL is enabled in your browser
- Check browser console for errors
- Try a different image format (JPG/PNG)

### Slow performance on first use
TensorFlow.js loads on first analysis. Subsequent predictions will be faster.

## 📄 License

MIT License - Free to use for personal and commercial projects.

## 🤝 Contributing

Contributions welcome! Feel free to open issues or submit pull requests.

## 📞 Contact

For questions or support, please open an issue on GitHub.
