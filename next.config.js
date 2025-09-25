
/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false,
});

const nextConfig = {
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
  experimental: {
    allowedDevOrigins: [
      "https://*.cluster-va5f6x3wzzh4stde63ddr3qgge.cloudworkstations.dev",
      "https://9000-firebase-studio-1757177149716.cluster-va5f6x3wzzh4stde63ddr3qgge.cloudworkstations.dev",
      "https://6000-firebase-studio-1757177149716.cluster-va5f6x3wzzh4stde63ddr3qgge.cloudworkstations.dev"
    ],
  }
};

module.exports = withPWA(nextConfig);
