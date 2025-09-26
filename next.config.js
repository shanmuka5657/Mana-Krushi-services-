
/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
        networkTimeoutSeconds: 10,
      },
    },
  ],
  fallbacks: {
    document: '/offline',
  },
});


const nextConfig = {
  typescript: {
    // I am making this change to force a server restart and fix the ChunkLoadError.
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
  experimental: {
    allowedDevOrigins: [
      "https://*.cluster-va5f6x3wzzh4stde63ddr3qgge.cloudworkstations.dev",
      "https://9000-firebase-studio-1757177149716.cluster-va5f6x3wzzh4stde63ddr3qgge.cloudworkstations.dev",
      "https://6000-firebase-studio-1757177149716.cluster-va5f6x3wzzh4stde63ddr3qgge.cloudworkstations.dev"
    ],
  }
};

module.exports = withPWA(nextConfig);
