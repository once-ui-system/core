import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["@once-ui-system/core"],
  },
};

export default nextConfig;
