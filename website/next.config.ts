import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  
  // For GitHub Pages deployment at subdomain (e.g., rack-research.example.com)
  // basePath is only used for production builds (GitHub Pages deployment)
  // In development, we don't use basePath to keep localhost URLs simple
  basePath: process.env.NODE_ENV === 'production' ? '/rack-research' : '',
  
  // Generate trailing slashes for cleaner static URLs
  trailingSlash: true,
  
  // Images need to be optimized at build time for static export
  images: {
    unoptimized: true,
  },
}

export default nextConfig
