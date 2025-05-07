import type { NextConfig } from "next";

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
        port: '',
        pathname: '/maps/api/place/js/PhotoService.GetPhoto/**', // You can make this more or less specific
      },
    ],
  },
};

module.exports = nextConfig;

export default nextConfig;
