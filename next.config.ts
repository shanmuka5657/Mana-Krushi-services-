
import type {NextConfig} from 'next';

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
    ],
  },
  webpack: (config, { isServer }) => {
    // Aliasing for leaflet compatibility with Next.js
    config.resolve.alias['leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'] = 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
    config.resolve.alias['leaflet/dist/leaflet.css'] = 'leaflet/dist/leaflet.css';
    return config;
  },
};

export default nextConfig;
