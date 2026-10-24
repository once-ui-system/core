import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Keeps the package-root import from adding about 110 kB to every route.
    optimizePackageImports: ["@once-ui-system/core"],
  },
};

export default nextConfig;
