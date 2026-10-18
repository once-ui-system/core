/**
 * Bundles demo-src/ for the browser through react-native-web, so the preview
 * components can be seen without a simulator: open demo/index.html, add
 * `?theme=light` for the light theme. It is the same component code a native
 * app runs; only View/Text/Pressable come from react-native-web.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
mkdirSync(join(ROOT, "demo"), { recursive: true });
const svgRoot = join(createRequire(import.meta.url).resolve("react-native-svg/package.json"), "..");

await build({
  entryPoints: [join(ROOT, "demo-src/index.tsx")],
  outfile: join(ROOT, "demo/demo.js"),
  bundle: true,
  jsx: "automatic",
  format: "iife",
  // react-native-svg's web build draws plain <svg>; it has no image assets to look up here.
  alias: {
    "react-native": join(ROOT, "scripts/web/react-native.js"),
    "react-native-svg": join(svgRoot, "lib/module/ReactNativeSVG.web.js"),
    "@react-native/assets-registry/registry": join(ROOT, "scripts/web/assets-registry.js"),
  },
  resolveExtensions: [".web.js", ".web.tsx", ".web.ts", ".tsx", ".ts", ".jsx", ".js", ".json"],
  // react-native-web's animations read Node's `global`.
  define: { "process.env.NODE_ENV": '"production"', global: "globalThis" },
  logLevel: "warning",
});

writeFileSync(
  join(ROOT, "demo/index.html"),
  `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Once UI native preview</title>
<style>html,body,#root{height:100%;margin:0}#root{display:flex;flex-direction:column}</style>
</head><body><div id="root"></div><script src="demo.js"></script></body></html>
`,
);
console.log("demo/index.html ready");
