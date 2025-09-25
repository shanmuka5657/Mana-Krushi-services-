
import type {NextConfig} from 'next';

const withPWA = require('next-pwa')({
  dest: 'public',
  sw: 'sw.js', // Point to our custom service worker
  disable: process.env.NODE_ENV === 'development',
  fallbacks: {
    document: '/offline', // Fallback for document requests
  },
})

// Forcing a rebuild to solve chunk loading errors.
const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'yt3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default withPWA(nextConfig);
