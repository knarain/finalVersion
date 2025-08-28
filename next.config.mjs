/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: 'standalone',          // needed for Node.js deployment
  experimental: {
    outputFileTracingRoot: __dirname,
  },
};

export default nextConfig;
