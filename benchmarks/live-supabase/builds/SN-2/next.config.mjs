import mdx from "@next/mdx";

const withMDX = mdx({
  extension: /\.mdx?$/,
  options: {},
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  transpilePackages: ["next-mdx-remote"],
  sassOptions: {
    compiler: "modern",
    silenceDeprecations: ["legacy-js-api"],
  },
  images: {
    // OgCard shows link-preview images through /api/og/proxy?url=…, and
    // Next 16 optimizes a local src with a query string only when a pattern
    // allows it.
    localPatterns: [{ pathname: "/api/og/proxy" }, { pathname: "/**", search: "" }],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default withMDX(nextConfig);