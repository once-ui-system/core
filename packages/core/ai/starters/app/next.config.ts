import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Without this, a server component that imports from the package root
    // ships about 110 kB of extra JavaScript on every route.
    optimizePackageImports: ["@once-ui-system/core"],
  },
};

export default nextConfig;
