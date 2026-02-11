# Deployment Guide

This guide explains how to deploy the Peacock Egg Detector web app to various platforms.

## 🚀 Quick Deploy Options

### Option 1: Vercel (Recommended - Fastest)

Vercel provides the easiest deployment experience with automatic HTTPS and CDN.

#### Steps:

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
cd web
vercel
```

4. **Answer the prompts:**
   - Set up and deploy? → **Yes**
   - Which scope? → Select your account
   - Link to existing project? → **No**
   - Project name → `peacock-egg-detector` (or any name)
   - Build command → `npm run build`
   - Output directory → `out`

5. **Production deploy**
```bash
vercel --prod
```

**✅ Done!** Your app is live at `https://peacock-egg-detector.vercel.app`

---

### Option 2: GitHub Pages

GitHub Pages provides free hosting with your GitHub repository.

#### Prerequisites:
- GitHub account
- Repository with your code

#### Steps:

1. **Update package.json scripts** (if not already done):
```json
{
  "scripts": {
    "export": "next build",
    "deploy": "gh-pages -d out -b gh-pages"
  }
}
```

2. **Install gh-pages package**:
```bash
cd web
npm install --save-dev gh-pages
```

3. **Set up GitHub repository**:
   - Create a new repository on GitHub
   - Initialize git in your project:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/peacock-egg-detector.git
git push -u origin main
```

4. **Build and deploy**:
```bash
# For GitHub Pages
npm run export

# Deploy using gh-pages
npm run deploy
```

5. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under **Source**, select **gh-pages** branch
   - Click **Save**

6. **Wait for deployment**
   - GitHub will take 1-2 minutes to deploy
   - Access at: `https://YOUR_USERNAME.github.io/peacock-egg-detector/`

---

### Option 3: Netlify

Netlify provides continuous deployment from Git.

#### Steps:

1. **Install Netlify CLI**:
```bash
npm install -g netlify-cli
```

2. **Login**:
```bash
netlify login
```

3. **Initialize site**:
```bash
cd web
netlify init
```

4. **Build**:
```bash
npm run build
```

5. **Deploy**:
```bash
netlify deploy --prod
```

---

## 🔧 Configuration for Different Platforms

### Vercel Configuration
Already configured in `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "out",
  "framework": "nextjs"
}
```

### GitHub Pages Configuration
Set environment variable:
```bash
export GITHUB_PAGES=true
npm run build
```

Or set it in your CI/CD pipeline.

---

## 🌍 Custom Domain Setup

### On Vercel:
1. Go to project dashboard
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Update DNS records as instructed

### On GitHub Pages:
1. Create `CNAME` file in `public/` folder with your domain
2. Update DNS settings with your domain provider

---

## 🔄 Automatic Deployments

### Vercel:
- Connect your GitHub repository
- Auto-deploy on every push to `main` branch
- Preview deployments for every PR

### Netlify:
- Connect GitHub repository
- Auto-deploy on every push
- Deploy previews for branches

### GitHub Actions (GitHub Pages):
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        cache-dependency-path: web/package.json
    
    - name: Install dependencies
      run: |
        cd web
        npm ci
    
    - name: Build
      run: |
        cd web
        export GITHUB_PAGES=true
        npm run build
    
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./web/out
        destination_dir: /
```

---

## 📊 Performance Tips

### Before Deploying:
1. **Build the app**:
```bash
cd web
npm run build
```

2. **Check build size**:
```bash
ls -lh out/
```

3. **Test locally**:
```bash
npm start
```

### Optimization:
- Images are already optimized (disabled unoptimized images)
- Code splitting is automatic with Next.js
- Service worker caches static assets
- TensorFlow.js is lazy-loaded

---

## 🔍 Troubleshooting

### Build Fails on GitHub Pages

**Issue**: `Error: Module not found`

**Solution**: Make sure all dependencies are in `package.json`:
```bash
cd web
npm install
```

### 404 Errors After Deploy

**Vercel**: Check `vercel.json` configuration

**GitHub Pages**: Check `basePath` in `next.config.js`:
```javascript
basePath: '/your-repo-name'
```

### Service Worker Not Working

**Issue**: PWA features not working

**Solution**: 
1. Verify HTTPS is enabled
2. Check `public/sw.js` exists
3. Clear browser cache

### TensorFlow.js Not Loading

**Issue**: AI analysis not working

**Solution**:
1. Check browser console for errors
2. Ensure WebGL is enabled
3. Try a different browser

---

## 📝 Environment Variables

No environment variables required for this app! Everything runs client-side.

If you want to add analytics or other services, you can use:

```bash
# Vercel
vercel env add ANALYTICS_ID

# Netlify
netlify env:set ANALYTICS_ID your-id
```

---

## 🎯 Next Steps

After deploying:

1. **Test your app**:
   - Open on mobile device
   - Try PWA installation
   - Test image upload and analysis

2. **Monitor analytics** (if added):
   - Check Vercel/Netlify dashboard
   - Review user engagement

3. **Get feedback**:
   - Share with users
   - Collect bug reports
   - Improve based on usage

---

## 🆘 Support

If you encounter issues:

1. Check the [FAQ](#-troubleshooting)
2. Review [GitHub Issues](../../issues)
3. Open a new issue with details

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [GitHub Pages Guide](https://pages.github.com/)
- [Netlify Documentation](https://docs.netlify.com/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)
