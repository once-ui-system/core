#!/usr/bin/env node
/**
 * The bundle-size gate: what each entry point costs an app that imports it.
 *
 * Every JS entry in package.json `exports` (".", "./data", "./components/Button"…)
 * and the two stylesheets are bundled the way an app's bundler would: minified,
 * with the package's own dependencies in and its peers (react, next, recharts,
 * maplibre-gl…) out, CSS modules included. What a lazy `import()` loads is
 * split off and left out, as an app's bundler would, so the number is what
 * the page loads up front. Each is measured gzipped and
 * compared with bundle-size.json. CI fails when one grows past its recorded
 * size by more than 5% and 512 bytes, so a shrink or a small change never
 * fails, and a component that suddenly pulls in half the library does.
 *
 * Run after `pnpm build`:
 *   node scripts/bundle-size.mjs            check against bundle-size.json
 *   node scripts/bundle-size.mjs --update   record the current sizes
 *
 * A deliberate growth is recorded with --update in the same PR, so the diff
 * of bundle-size.json shows what got bigger.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { builtinModules } from "node:module";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { build } from "esbuild";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BUDGET = join(ROOT, "bundle-size.json");
const TOLERANCE = { ratio: 0.05, bytes: 512 };

const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));

/** Peers and Node builtins stay out, as an app's bundler resolves them itself. */
const external = [
  ...Object.keys(pkg.peerDependencies ?? {}).flatMap((name) => [name, `${name}/*`]),
  "react/*",
  ...builtinModules.flatMap((m) => [m, `node:${m}`]),
];

/** `{ entry: file }` for every export whose import is a JS file in dist. */
export function entries(exportsField = pkg.exports) {
  const out = {};
  for (const [key, value] of Object.entries(exportsField)) {
    const file = typeof value === "string" ? value : (value?.import ?? value?.default);
    if (typeof file === "string" && !key.includes("*") && /\.(js|css)$/.test(file)) out[key] = file;
  }
  return out;
}

async function measure(file) {
  const path = join(ROOT, file);
  if (!existsSync(path)) throw new Error(`${file} is missing: run \`pnpm build\` first`);
  if (file.endsWith(".css")) return gzipSync(readFileSync(path)).length;
  const result = await build({
    entryPoints: [path],
    bundle: true,
    minify: true,
    format: "esm",
    platform: "browser",
    target: "es2022",
    write: false,
    outdir: "out",
    absWorkingDir: ROOT,
    splitting: true,
    metafile: true,
    external,
    logLevel: "silent",
    define: { "process.env.NODE_ENV": '"production"' },
  });
  // The entry and the chunks it imports statically, with the CSS of their
  // modules: what reaches the user before anything lazy is asked for.
  const outputs = result.metafile.outputs;
  const eager = new Set();
  const visit = (out) => {
    if (eager.has(out) || !outputs[out]) return;
    eager.add(out);
    if (outputs[out].cssBundle) eager.add(outputs[out].cssBundle);
    for (const dep of outputs[out].imports) if (dep.kind === "import-statement") visit(dep.path);
  };
  // A lazy import's chunk is an entry point too: start from this entry's own.
  const entry = relative(ROOT, path);
  for (const [out, meta] of Object.entries(outputs)) if (meta.entryPoint === entry) visit(out);
  return result.outputFiles
    .filter((out) => eager.has(relative(ROOT, out.path)))
    .reduce((sum, out) => sum + gzipSync(out.contents).length, 0);
}

export function over(size, recorded) {
  return size > recorded * (1 + TOLERANCE.ratio) && size - recorded > TOLERANCE.bytes;
}

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

async function main() {
  const update = process.argv.includes("--update");
  const recorded = existsSync(BUDGET) ? JSON.parse(readFileSync(BUDGET, "utf8")) : {};
  const sizes = {};
  for (const [entry, file] of Object.entries(entries())) sizes[entry] = await measure(file);

  if (update) {
    writeFileSync(BUDGET, `${JSON.stringify(sizes, null, 2)}\n`);
    console.log(`bundle-size: recorded ${Object.keys(sizes).length} entries in bundle-size.json`);
    return;
  }

  const grown = [];
  const fresh = [];
  for (const [entry, size] of Object.entries(sizes)) {
    if (!(entry in recorded)) fresh.push(entry);
    else if (over(size, recorded[entry]))
      grown.push(`${entry}: ${kb(recorded[entry])} -> ${kb(size)}`);
  }
  const gone = Object.keys(recorded).filter((entry) => !(entry in sizes));
  const biggest = Object.entries(sizes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([entry, size]) => `  ${entry.padEnd(32)} ${kb(size)}`);
  console.log(
    `bundle-size: ${Object.keys(sizes).length} entries, gzipped. Largest:\n${biggest.join("\n")}`,
  );

  const problems = [
    ...grown.map((line) => `grew past its recorded size: ${line}`),
    ...fresh.map((entry) => `has no recorded size: ${entry}`),
    ...gone.map((entry) => `is recorded but no longer exported: ${entry}`),
  ];
  if (problems.length) {
    console.error(
      `\n${problems.join("\n")}\n\nIf this is intended, run \`node scripts/bundle-size.mjs --update\` in packages/core and commit bundle-size.json.`,
    );
    process.exit(1);
  }
  console.log("bundle-size: every entry is within 5% (and 512 B) of bundle-size.json");
}

const invokedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (invokedDirectly) await main();
