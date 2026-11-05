import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@once-ui-system/core", "@once-ui-system/fx", "@once-ui-system/blocks"],
  reactStrictMode: true,
  turbopack: {},
  webpack: (config) => {
    return config;
  },
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;
