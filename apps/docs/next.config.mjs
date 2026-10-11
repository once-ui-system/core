/** @type {import('next').NextConfig} */
import withMDX from "@next/mdx";
import {
  movedPageRedirects,
  prefixMoveRedirects,
  retiredPageRedirects,
  retiredSectionRedirects,
} from "./src/resources/redirects.js";

const withMDXConfig = withMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

const nextConfig = {
  // Exclude workspace source files and cache from build output
  outputFileTracingExcludes: {
    "*": [
      ".next/cache/**/*",
      "../../packages/core/src/**/*",
      "../../packages/core/node_modules/**/*",
      "../../packages/core/.next/**/*",
      "../../packages/core/scripts/**/*",
      "../../packages/core/tsconfig*.json",
      "../../packages/**/*.md",
    ],
  },
  sassOptions: {
    compiler: "modern",
    silenceDeprecations: ["legacy-js-api"],
  },
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  transpilePackages: ["next-mdx-remote", "@once-ui-system/core"],
  experimental: {
    serverMinification: true,
    serverActions: {
      bodySizeLimit: "2mb",
    },
    // Optimize package imports for react-icons
    optimizePackageImports: ["react-icons"],
  },
  // Configure image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    // Next 16 only accepts a local src without a query string unless this is
    // set, and setting it replaces that default, so the first entry restates
    // it. The second lets the live OgCard demos load their images through the
    // OG proxy route (`/api/og/proxy?url=…`), which next/image otherwise
    // refuses.
    localPatterns: [{ pathname: "**", search: "" }, { pathname: "/api/og/proxy" }],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // Add redirects from /docs/slug to /slug
  async redirects() {
    return [
      // Pages that moved within the docs. See src/resources/redirects.js.
      ...movedPageRedirects,
      // Whole sections that moved. See prefixMoves.
      ...prefixMoveRedirects,
      // Pages retired in favour of an off-site canonical source.
      ...retiredPageRedirects,
      // Retired product quick-starts. See retiredSections.
      ...retiredSectionRedirects,
      {
        source: "/docs/:slug*",
        destination: "/:slug*",
        permanent: true,
      },
    ];
  },
};

export default withMDXConfig(nextConfig);
