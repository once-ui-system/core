/** @type {import('next').NextConfig} */
import withMDX from "@next/mdx";
import {
  movedPageRedirects,
  prefixMoveRedirects,
  retiredPageRedirects,
  retiredSectionRedirects,
} from "./src/resources/redirects.js";
import { currentVersion, versionRewrites } from "./src/resources/versions.data.js";

const withMDXConfig = withMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
});

const nextConfig = {
  // A version other than the stable one is served under its path on the
  // stable site (docs.once-ui.com/beta), which mounts it with the rewrites
  // below. See src/resources/versions.data.js.
  basePath: currentVersion.path || undefined,
  env: { NEXT_PUBLIC_DOCS_BASE_PATH: currentVersion.path },
  async rewrites() {
    return { beforeFiles: versionRewrites() };
  },
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
    ...(currentVersion.path && {
      loader: "custom",
      loaderFile: "./src/resources/imageLoader.js",
    }),
    formats: ["image/avif", "image/webp"],
    // Next 16 only accepts a local src without a query string unless this is
    // set, and setting it replaces that default, so the first entry restates
    // it. The second lets the live OgCard demos load their images through the
    // OG proxy route (`/api/og/proxy?url=…`), which next/image otherwise
    // refuses.
    localPatterns: [{ pathname: "**", search: "" }, { pathname: "/api/og/proxy" }],
    // Only the remote images the docs show. Any https host would let anyone
    // make the optimizer fetch and decode their file. OG demos go through
    // the local /api/og/proxy pattern above.
    remotePatterns: [
      // Noto emoji used by the Reactions demos.
      { protocol: "https", hostname: "fonts.gstatic.com", pathname: "/s/e/notoemoji/**" },
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
