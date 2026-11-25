// Bundles the settings gold example with the built core (packages/core/dist)
// into one static page: page/out/index.html. Build core first.
import { existsSync, mkdirSync, symlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "../../../node_modules/esbuild/lib/main.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const core = path.resolve(here, "../../../packages/core");
const out = path.join(here, "out");
mkdirSync(out, { recursive: true });

// The page and the example import "@once-ui-system/core": this repo's build.
const link = path.join(here, "../node_modules/@once-ui-system/core");
if (!existsSync(link)) {
  mkdirSync(path.dirname(link), { recursive: true });
  symlinkSync(path.relative(path.dirname(link), core), link);
}

await build({
  entryPoints: [path.join(here, "entry.tsx")],
  bundle: true,
  format: "esm",
  outdir: out,
  jsx: "automatic",
  minify: true,
  nodePaths: [path.join(here, "../node_modules"), path.join(core, "node_modules"), path.resolve(here, "../../../node_modules")],
  loader: { ".woff2": "file", ".svg": "file", ".png": "file" },
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warning",
});

writeFileSync(
  path.join(out, "index.html"),
  `<!doctype html><html data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Settings</title><link rel="stylesheet" href="entry.css"></head><body><div id="root"></div><script type="module" src="entry.js"></script></body></html>`,
);
console.log("page/out/index.html");
