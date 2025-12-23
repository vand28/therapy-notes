/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Enable if you need image optimization
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig

