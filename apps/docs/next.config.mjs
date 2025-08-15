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
  output: 'standalone',
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
  // Reduce webpack cache size
  webpack: (config, { dev, isServer }) => {
    // Only enable source maps in development
    if (!dev) {
      config.devtool = false;
    }
    
    // Optimize bundle size
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
    };
    
    // Disable persistent caching in production to reduce size
    if (!dev) {
      config.cache = false;
    }
    
    return config;
  },
  // Disable webpack cache in production
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  
  // Add redirects from /docs/slug to /slug
  async redirects() {
    return [
      {
        source: '/docs/:slug*',
        destination: '/:slug*',
        permanent: true,
      },
    ];
  },
};

export default withMDXConfig(nextConfig);
