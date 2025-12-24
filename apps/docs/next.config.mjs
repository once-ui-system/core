/** @type {import('next').NextConfig} */
import withMDX from '@next/mdx'

const withMDXConfig = withMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

const nextConfig = {
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
