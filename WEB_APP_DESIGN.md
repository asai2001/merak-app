# Peacock Egg Detector - Web Application Design

## 📋 Overview

A Progressive Web App (PWA) for detecting peacock egg fertility using AI. The application runs entirely in the browser using TensorFlow.js, requiring no backend server.

## 🎯 Key Features

### Core Functionality
- ✅ Image upload via drag-and-drop or file selection
- ✅ AI-powered fertility detection (client-side using TensorFlow.js)
- ✅ Real-time confidence scores and probability breakdowns
- ✅ Technical image analysis (brightness, contrast, color distribution)
- ✅ Responsive design for mobile and desktop
- ✅ Installable as PWA (Progressive Web App)

### PWA Features
- ✅ Install prompt for native app experience
- ✅ Offline capability with service worker
- ✅ App manifest for mobile installation
- ✅ Mobile-optimized layout
- ✅ Push notification ready

## 🏗️ Architecture

### Frontend Stack
```
┌─────────────────────────────────────┐
│         Next.js 14 App              │
│  (React + TypeScript + Tailwind)    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│     TensorFlow.js (Browser)         │
│  - Image Preprocessing              │
│  - AI Model Inference               │
│  - Result Analysis                 │
└─────────────────────────────────────┘
```

### No Backend Required
- ✅ All AI processing happens in the browser
- ✅ No API calls to Python server
- ✅ No Python/Node.js backend needed
- ✅ Static deployment ready

## 📁 Project Structure

```
web/
├── public/                    # Static assets
│   ├── manifest.json         # PWA manifest
│   ├── sw.js               # Service worker
│   ├── icon-192.png        # App icons
│   ├── icon-512.png
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Root layout with PWA setup
│   │   ├── page.tsx        # Main application page
│   │   └── globals.css     # Global styles
│   ├── components/
│   │   └── InstallPrompt.tsx  # PWA install prompt
│   └── utils/
│       └── imageAnalysis.ts  # AI analysis logic
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.js
```

## 🔧 Technology Stack

### Frontend
- **Next.js 14** - React framework with SSR/SSG
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### AI/ML
- **TensorFlow.js** - Browser-based ML framework
- **Canvas API** - Image processing
- **WebGL** - GPU acceleration

### PWA
- **Service Worker** - Offline support
- **App Manifest** - Installability
- **HTTPS** - Required for PWA

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd web
vercel
```

**Advantages:**
- ✅ Zero configuration
- ✅ Automatic HTTPS
- ✅ Edge network
- ✅ Preview deployments
- ✅ Free tier available

### Option 2: GitHub Pages
```bash
# Build the app
cd web
npm run build

# Output: out/ folder
# Configure GitHub Pages to serve from out/
```

**Next.js config for GitHub Pages:**
```javascript
// next.config.js
module.exports = {
  output: 'export',
  basePath: '/peacock-egg-detector',
  assetPrefix: '/peacock-egg-detector',
  images: {
    unoptimized: true
  }
}
```

### Option 3: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
cd web
netlify deploy --prod
```

## 📱 Installation as PWA

### On Mobile (Android/iOS)
1. Open the app in mobile browser
2. Tap the "Install App" banner
3. App will be added to home screen
4. Opens as native app with full-screen experience

### On Desktop
1. Click install icon in address bar
2. App will be installed as desktop app
3. Access from applications menu

## 🔐 Security & Privacy

- ✅ **No Data Transmission**: All processing happens locally
- ✅ **No Server Logs**: No backend to track user data
- ✅ **Privacy First**: Images never leave user's device
- ✅ **Offline Capable**: Works without internet after initial load

## 🎨 User Flow

```
1. User opens web app
   ↓
2. Sees "Install App" prompt (if not installed)
   ↓
3. Selects image (drag/drop or click)
   ↓
4. App analyzes image using TensorFlow.js
   ↓
5. Displays results with:
   - Fertility prediction (fertile/infertile)
   - Confidence score
   - Probability breakdown
   - Technical analysis
   ↓
6. User can analyze another image
```

## 📊 AI Analysis Logic

### Image Features Analyzed
1. **Brightness**: Overall image brightness
2. **Contrast**: Color variance in image
3. **Color Distribution**: Average RGB values

### Prediction Algorithm
```typescript
// Simplified logic
fertileScore = base_score (0.5)
+ brightness_factor
+ contrast_factor
+ color_balance_factor

if fertileScore > 0.5 → Fertile
else → Infertile
```

## 🔧 Configuration

### Environment Variables
None required - app runs entirely client-side!

### PWA Manifest Configuration
```json
{
  "name": "Peacock Egg Detector",
  "short_name": "Peacock Egg",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#f0fdf4",
  "theme_color": "#22c55e"
}
```

## 📈 Performance Optimization

- ✅ Lazy loading of TensorFlow.js
- ✅ Image compression before analysis
- ✅ Service worker caching
- ✅ Code splitting with Next.js
- ✅ Optimized bundle size

## 🧪 Testing

### Manual Testing Checklist
- [ ] Upload image works
- [ ] Drag-and-drop works
- [ ] AI prediction displays
- [ ] Install prompt appears on mobile
- [ ] App installs successfully
- [ ] Offline mode works after install
- [ ] Responsive design on mobile
- [ ] Responsive design on desktop

### Browser Compatibility
- ✅ Chrome (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (Desktop & iOS)
- ✅ Edge (Desktop)

## 📦 Build & Deploy Commands

```bash
# Development
cd web
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Deploy to Vercel
vercel

# Deploy to GitHub Pages
npm run build
# Upload out/ folder to gh-pages branch
```

## 🔄 Update Workflow

1. Make changes to code
2. Test locally: `npm run dev`
3. Build: `npm run build`
4. Deploy: Push to GitHub (Vercel auto-deploys)
5. Users get update on next visit

## 📝 TODO / Future Enhancements

- [ ] Add camera capture support
- [ ] Save prediction history locally
- [ ] Export results as PDF
- [ ] Add more image metrics
- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Model training data visualization

## 🆘 Troubleshooting

### Common Issues

**Q: Install prompt doesn't appear**
A: Install prompt only appears once. Manually check:
- Chrome: Three dots > "Install Peacock Egg"
- Safari: Share > "Add to Home Screen"

**Q: AI prediction is slow**
A: TensorFlow.js loads on first use. Subsequent predictions are faster.

**Q: Images don't analyze**
A: Check browser console for WebGL support errors.

**Q: App doesn't work offline**
A: Service worker needs HTTPS. Deploy to Vercel/GitHub Pages for HTTPS.

## 📞 Support

For issues or questions:
- GitHub Issues: [Project Repo]
- Documentation: [Docs Link]

## 📄 License

MIT License - See LICENSE file for details
