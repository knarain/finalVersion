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
  output: 'export',               // ✅ enables static export
  basePath: '/finalVersion',      // ✅ GitHub repo name
  assetPrefix: '/finalVersion/',  // ✅ ensures assets load correctly
}

export default nextConfig
