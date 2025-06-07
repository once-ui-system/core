/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@once-ui-system/core'],
  reactStrictMode: true,
  webpack: (config) => {
    return config;
  }
};

module.exports = nextConfig;
