import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

// MDX posts in src/content/blog are compiled by @next/mdx (see src/mdx-components.tsx).
const withMDX = createMDX({});

export default withMDX(nextConfig);
