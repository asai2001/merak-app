/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Support for static export (GitHub Pages)
  output: process.env.GITHUB_PAGES ? 'export' : undefined,
  
  // Base path for GitHub Pages
  basePath: process.env.GITHUB_PAGES ? '/peacock-egg-detector' : '',
  
  // Asset prefix for GitHub Pages
  assetPrefix: process.env.GITHUB_PAGES ? '/peacock-egg-detector' : '',
  
  // Images optimization disabled for static export
  images: {
    unoptimized: true,
  },
  
  // Webpack configuration
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false, crypto: false }
    return config
  },
}

module.exports = nextConfig
