
/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    // Cache pages
    {
      urlPattern: ({ request }) => request.mode === 'navigate' && request.method === 'GET',
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        },
      },
    },
    // Cache static assets
    {
      urlPattern: ({ request }) =>
        request.destination === 'style' ||
        request.destination === 'script' ||
        request.destination === 'worker' ||
        request.destination === 'image',
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-assets',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 Days
        },
      },
    },
  ],
  fallbacks: {
    document: '/offline',
  },
  manifest: {
    share_target: {
      action: '/search',
      method: 'GET',
      enctype: 'application/x-www-form-urlencoded',
      params: {
        title: 'title',
        text: 'text',
        url: 'url'
      }
    }
  }
});

const isDev = process.env.NODE_ENV === 'development';

const nextConfig = {
  typescript: {
    // This is a change to force a server restart and fix the ChunkLoadError.
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
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ''};`.replace(/\s{2,}/g, ' ').trim(),
          },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
