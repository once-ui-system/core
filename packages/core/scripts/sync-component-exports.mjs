#!/usr/bin/env node
/**
 * Writes one `exports` entry per public component into package.json:
 * `@once-ui-system/core/components/Button` imports that one built file.
 *
 * Public means re-exported by `src/components/index.ts`, so this never makes
 * an internal module (a context, a shared style) importable, which is why 3.0
 * dropped the old `./components/*` wildcard. Next 16 builds with Turbopack,
 * which ignores `optimizePackageImports`, so a server component that imports a
 * client component from the root ships every client component; these paths
 * are how a page ships only what it uses.
 *
 * Usage:  node scripts/sync-component-exports.mjs [--check]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const PKG = path.join(ROOT, "package.json");

/**
 * The component modules the barrel re-exports whole (`export * from`), in its
 * order. A module it takes one name from (ScrollLock) also holds internals.
 */
export function publicComponentModules() {
  const barrel = fs.readFileSync(path.join(ROOT, "src/components/index.ts"), "utf8");
  return [...barrel.matchAll(/^export \* from "\.\/([A-Za-z]\w*)\.js";$/gm)].map((m) => m[1]);
}

export function componentExports() {
  return Object.fromEntries(
    publicComponentModules().map((name) => [
      `./components/${name}`,
      { types: `./dist/components/${name}.d.ts`, default: `./dist/components/${name}.js` },
    ]),
  );
}

function sync({ check }) {
  const text = fs.readFileSync(PKG, "utf8");
  const pkg = JSON.parse(text);
  const exports = {};
  for (const [key, value] of Object.entries(pkg.exports)) {
    if (key.startsWith("./components/")) continue;
    exports[key] = value;
    // Right after the root, so the map reads root, components, then the rest.
    if (key === ".") Object.assign(exports, componentExports());
  }
  const next = `${JSON.stringify({ ...pkg, exports }, null, 2)}\n`;
  if (next === text) return;
  if (check) {
    console.error(
      "package.json exports are out of date: run node scripts/sync-component-exports.mjs",
    );
    process.exit(1);
  }
  fs.writeFileSync(PKG, next);
}

if (process.argv[1] === fileURLToPath(import.meta.url))
  sync({ check: process.argv.includes("--check") });
