/** @type {import('next').NextConfig} */
import withMDX from '@next/mdx'

const withMDXConfig = withMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

/**
 * The 1.x docs are served on the main docs site under /v1, which proxies
 * that path to this deployment. See apps/docs/src/resources/versions.data.js
 * on the current branches.
 */
const basePath = "/v1";

const nextConfig = {
  basePath,
  env: { NEXT_PUBLIC_DOCS_BASE_PATH: basePath },
  // Exclude workspace source files and cache from build output
  outputFileTracingExcludes: {
    '*': [
      '.next/cache/**/*',
      '../../packages/core/src/**/*',
      '../../packages/core/node_modules/**/*',
      '../../packages/core/.next/**/*',
      '../../packages/core/scripts/**/*',
      '../../packages/core/tsconfig*.json',
      '../../packages/**/*.md',
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
      bodySizeLimit: '2mb',
    },
    // Optimize package imports for react-icons
    optimizePackageImports: ['react-icons'],
  },
  // Configure image optimization
  images: {
    loader: 'custom',
    loaderFile: './src/resources/imageLoader.js',
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Add redirects from /docs/slug to /slug
  async redirects() {
    return [
      // Links from before the move: every page now lives under /v1.
      {
        source: '/',
        destination: '/v1',
        basePath: false,
        permanent: false,
      },
      {
        source: '/:path((?!v1(?:/|$)).*)',
        destination: '/v1/:path',
        basePath: false,
        permanent: false,
      },
      {
        source: '/docs/:slug*',
        destination: '/:slug*',
        permanent: true,
      },
      {
        source: '/magic-portfolio/:slug*',
        destination: '/products/magic-portfolio/:slug*',
        permanent: true,
      },
      {
        source: '/magic-docs/:slug*',
        destination: '/products/magic-docs/:slug*',
        permanent: true,
      },
      {
        source: '/magic-bio/:slug*',
        destination: '/products/magic-bio/:slug*',
        permanent: true,
      },
      {
        source: '/magic-agent/:slug*',
        destination: '/products/magic-agent/:slug*',
        permanent: true,
      },
      {
        source: '/magic-convert/:slug*',
        destination: '/products/magic-convert/:slug*',
        permanent: true,
      },
      {
        source: '/magic-store/:slug*',
        destination: '/products/magic-store/:slug*',
        permanent: true,
      },
      {
        source: '/supabase-starter/:slug*',
        destination: '/products/supabase-starter/:slug*',
        permanent: true,
      },
    ];
  },
};

export default withMDXConfig(nextConfig);
