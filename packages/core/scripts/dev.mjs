#!/usr/bin/env node
/**
 * `pnpm dev`: rebuild `dist/` as `src/` changes, for the workspace apps.
 *
 * `tsc --watch` re-emits the JS, which imports `./X.module.scss`; 3.0 ships
 * only the compiled `.module.css` (B5), so after every emit this re-runs the
 * asset copy and the CSS-module compile, which repoints those imports at the
 * CSS. A change to a `.scss` file triggers the compile on its own, since tsc
 * does not see it.
 */
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPTS = path.dirname(fileURLToPath(import.meta.url));
// `--root <dir>`: watch another workspace package instead (`@once-ui-system/fx`
// and `@once-ui-system/blocks` run `pnpm dev` through this script). They have
// no assets besides their Sass modules, so only core runs the asset copy.
const rootFlag = process.argv.indexOf("--root");
const ROOT = rootFlag > 0 ? path.resolve(process.argv[rootFlag + 1]) : path.resolve(SCRIPTS, "..");
const isCore = ROOT === path.resolve(SCRIPTS, "..");
const run = (script, ...args) =>
  spawnSync(process.execPath, [path.join(SCRIPTS, script), ...args], {
    cwd: ROOT,
    stdio: "inherit",
  });

let timer;
const restyle = () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    if (isCore) run("copy-files.cjs");
    run("compile-css-modules.cjs", "--root", ROOT);
  }, 100);
};

const tsc = spawn(
  process.execPath,
  [
    path.join(path.dirname(fileURLToPath(import.meta.resolve("typescript"))), "..", "bin", "tsc"),
    "--project",
    "tsconfig.build.json",
    "--watch",
    "--preserveWatchOutput",
  ],
  { cwd: ROOT, stdio: ["inherit", "pipe", "inherit"] },
);
tsc.stdout.on("data", (chunk) => {
  process.stdout.write(chunk);
  // tsc prints this after every compilation, with or without errors.
  if (/Watching for file changes/.test(String(chunk))) restyle();
});
tsc.on("exit", (code) => process.exit(code ?? 0));

fs.watch(path.join(ROOT, "src"), { recursive: true }, (_event, file) => {
  if (file && /\.(s?css|json)$/.test(file)) restyle();
});
