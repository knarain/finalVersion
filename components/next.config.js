// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",  // needed for static export
  basePath: "/finalVersion",  // matches repo name
  images: {
    unoptimized: true, // disable next/image optimization for GitHub Pages
  },
};

module.exports = nextConfig;
