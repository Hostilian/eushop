/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // basePath must match the GitHub repository name for GitHub Pages to work correctly.
  // Override with NEXT_PUBLIC_BASE_PATH env var for local development (set to '' for localhost).
  basePath: process.env.NEXT_PUBLIC_BASE_PATH !== undefined
    ? process.env.NEXT_PUBLIC_BASE_PATH
    : '/eushop',
  // trailingSlash ensures /page -> /page/index.html, required for GitHub Pages static hosting
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    NEXT_PUBLIC_AUTH0_DOMAIN: process.env.NEXT_PUBLIC_AUTH0_DOMAIN,
    NEXT_PUBLIC_AUTH0_CLIENT_ID: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
  },
};

module.exports = nextConfig;

