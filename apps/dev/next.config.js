/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@once-ui-system/core'],
  reactStrictMode: true,
  turbopack: { },
  webpack: (config) => {
    return config;
  }
};

module.exports = nextConfig;
