const fs = require("node:fs");
const path = require("node:path");

// Copies the non-TypeScript assets the compiled JS imports into `dist/`: the
// plain stylesheets (`CodeHighlight.css`, `Gauge.module.css`…) and the emoji
// data. Nothing else:
//
// - Sass stays out. `compile-css-modules.cjs` compiles every `.module.scss`
//   from `src/` straight into `dist/` as `.module.css`, so the `.scss`
//   sources (and the `breakpoints.scss` they `@use`) are not shipped (3.0, B5).
// - The harness (`ai/`, `agent/`), the CLIs (`scripts/`), README and AGENTS.md
//   ship from the package root, where `files`, `exports` and `bin` point.
//   A second copy under `dist/` was unreachable and doubled their size in the
//   tarball (3.0, B6).
// - No `dist/package.json`. The package is published from its root; bundlers
//   and Node read the nearest package.json for a module, and a second one in
//   `dist/` would hide the root's `type` and `sideEffects` from every file in it.

// `.md`: src/icons/ATTRIBUTION.md, the icon licences, ships beside the icons.
const COPIED = new Set([".css", ".json", ".md"]);

function copyAssets(src, dest) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__tests__" || entry.name === "test") continue;
      copyAssets(srcPath, destPath);
    } else if (COPIED.has(path.extname(entry.name).toLowerCase())) {
      fs.mkdirSync(dest, { recursive: true });
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const srcDir = path.resolve(__dirname, "../src");
const destDir = path.resolve(__dirname, "../dist");

const staleManifest = path.resolve(destDir, "package.json");
if (fs.existsSync(staleManifest)) fs.rmSync(staleManifest);

console.log("Copying stylesheets and data into dist...");
copyAssets(srcDir, destDir);
console.log("Files copied successfully!");
