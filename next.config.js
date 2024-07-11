/* eslint-env node */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    staticFolder: '/public',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3122/:path*', // Adjust this to your backend URL
      },
    ];
  },
};

module.exports = nextConfig;