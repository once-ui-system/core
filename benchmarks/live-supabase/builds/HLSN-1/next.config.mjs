/** @type {import('next').NextConfig} */
const nextConfig = {
  // next-mdx-remote ships ESM that Next compiles with the app.
  transpilePackages: ["next-mdx-remote"],
  sassOptions: {
    compiler: "modern",
    silenceDeprecations: ["legacy-js-api"],
  },
};

export default nextConfig;
