import { createRequire } from "node:module";
import { join } from "node:path";
import { defineConfig } from "vitest/config";

const svgRoot = join(createRequire(import.meta.url).resolve("react-native-svg/package.json"), "..");

// Components render through react-native-web, which implements the same
// primitives (View, Text, Pressable, TextInput) on the DOM; react-native-svg
// picks its `.web.js` build, which draws plain <svg>.
export default defineConfig({
  resolve: {
    alias: [
      { find: /^react-native$/, replacement: "react-native-web" },
      {
        find: /^@react-native\/assets-registry\/registry$/,
        replacement: join(__dirname, "scripts/web/assets-registry.js"),
      },
      {
        find: /^react-native-svg$/,
        replacement: join(svgRoot, "lib/module/ReactNativeSVG.web.js"),
      },
    ],
    extensions: [
      ".web.js",
      ".web.ts",
      ".web.tsx",
      ".mjs",
      ".js",
      ".mts",
      ".ts",
      ".jsx",
      ".tsx",
      ".json",
    ],
  },
  test: {
    environment: "jsdom",
    include: ["test/**/*.test.{ts,tsx}"],
    server: { deps: { inline: ["react-native-svg"] } },
  },
});
