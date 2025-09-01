// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "out", // 👈 enables static export
  images: {
    unoptimized: true, // 👈 disables Next image optimizer (works for static hosting)
  },
}

export default nextConfig
