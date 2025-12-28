import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  
  // For GitHub Pages deployment at subdomain (e.g., rack-research.example.com)
  // If deploying to a path like github.io/rack-research, uncomment basePath:
  basePath: '/rack-research',
  
  // Generate trailing slashes for cleaner static URLs
  trailingSlash: true,
  
  // Images need to be optimized at build time for static export
  images: {
    unoptimized: true,
  },
}

export default nextConfig
