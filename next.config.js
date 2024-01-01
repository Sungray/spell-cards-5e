/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    instrumentation: true,
  },
}

module.exports = nextConfig
