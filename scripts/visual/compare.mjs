#!/usr/bin/env node
// Compares two captures from capture.mjs shot by shot and writes a report.
//
//   node compare.mjs --base out/base --head out/head [--noise out/head-2] [--base-noise out/base-2] --report out/report
//
// A shot capture.mjs saw change on its own (marked `animated`) is not
// counted, nor is a pixel that only moved by one pixel (sub-pixel layout). --noise is a second capture of the head build: a shot that differs
// between the two head captures loads unstably, so it is not counted either. Exits 3 when a stable shot changed.

import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const { values: args } = parseArgs({
  options: {
    base: { type: "string", default: "out/base" },
    head: { type: "string", default: "out/head" },
    noise: { type: "string" },
    "base-noise": { type: "string" },
    report: { type: "string", default: "out/report" },
    // Changed pixels a shot may have before it counts as changed. Pixelmatch
    // already ignores anti-aliasing; this absorbs a stray sub-pixel row.
    tolerance: { type: "string", default: "20" },
  },
});

const TOLERANCE = Number(args.tolerance);
const readManifest = async (dir) => JSON.parse(await readFile(path.join(dir, "manifest.json"), "utf8"));
const readPng = async (dir, file) => PNG.sync.read(await readFile(path.join(dir, file)));

// Two RGBA pixels that read as the same colour.
const close = (p, i, q, j) =>
  Math.abs(p[i] - q[j]) + Math.abs(p[i + 1] - q[j + 1]) + Math.abs(p[i + 2] - q[j + 2]) <= 48;

/** True when the pixel at (x, y) of `p` also appears within one pixel of (x, y) in `q`. */
function nearby(p, q, width, height, x, y) {
  const i = (y * width + x) * 4;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      if (close(p, i, q, (ny * width + nx) * 4)) return true;
    }
  }
  return false;
}

/**
 * Changed pixels between two same-size shots. A pixel whose colour is found
 * within one pixel in the other shot (both ways) is not counted: text or a
 * border landing a sub-pixel apart between two runners, not a visual change.
 */
function diff(a, b) {
  if (a.width !== b.width || a.height !== b.height) return { sizeChanged: true, pixels: Infinity };
  const { width, height } = a;
  const out = new PNG({ width, height });
  const raw = pixelmatch(a.data, b.data, out.data, width, height, { threshold: 0.1, diffMask: true });
  if (raw === 0) return { sizeChanged: false, pixels: 0, out };
  let pixels = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      if (out.data[i + 3] === 0) continue;
      if (nearby(a.data, b.data, width, height, x, y) && nearby(b.data, a.data, width, height, x, y)) {
        out.data[i + 3] = 0;
      } else {
        pixels++;
      }
    }
  }
  return { sizeChanged: false, pixels, out };
}

const base = await readManifest(args.base);
const head = await readManifest(args.head);
const noise = args.noise ? await readManifest(args.noise) : null;
const baseById = new Map(base.shots.filter((s) => s.file).map((s) => [s.id, s]));
const noiseById = new Map((noise?.shots ?? []).filter((s) => s.file).map((s) => [s.id, s]));
const baseNoise = args["base-noise"] ? await readManifest(args["base-noise"]) : null;
const baseNoiseById = new Map((baseNoise?.shots ?? []).filter((s) => s.file).map((s) => [s.id, s]));

/** True when a second capture of the same build (in `dir`) does not match `png`. */
async function unstable(png, again, dir) {
  if (!again) return false;
  const n = diff(png, await readPng(dir, again.file));
  return n.sizeChanged || n.pixels > TOLERANCE;
}
const headIds = new Set(head.shots.map((s) => s.id));

await mkdir(path.join(args.report, "img"), { recursive: true });
const results = [];
for (const shot of head.shots) {
  if (!shot.file) {
    results.push({ shot, status: "error" });
    continue;
  }
  const before = baseById.get(shot.id);
  if (!before) {
    results.push({ shot, status: "new" });
    continue;
  }
  if (shot.animated || before.animated) {
    results.push({ shot, status: "unstable" });
    continue;
  }
  const [a, b] = await Promise.all([readPng(args.base, before.file), readPng(args.head, shot.file)]);
  const d = diff(a, b);
  if (!d.sizeChanged && d.pixels <= TOLERANCE) {
    results.push({ shot, status: "same", pixels: d.pixels });
    continue;
  }
  if (
    (await unstable(b, noiseById.get(shot.id), args.noise)) ||
    (await unstable(a, baseNoiseById.get(shot.id), args["base-noise"]))
  ) {
    results.push({ shot, status: "unstable", pixels: d.pixels });
    continue;
  }
  const name = shot.file.replace(/\.png$/, "");
  await copyFile(path.join(args.base, before.file), path.join(args.report, "img", `${name}.before.png`));
  await copyFile(path.join(args.head, shot.file), path.join(args.report, "img", `${name}.after.png`));
  if (d.out) await writeFile(path.join(args.report, "img", `${name}.diff.png`), PNG.sync.write(d.out));
  results.push({
    shot,
    status: "changed",
    pixels: d.pixels,
    size: d.sizeChanged ? `${a.width}×${a.height} → ${b.width}×${b.height}` : undefined,
    ratio: d.sizeChanged ? undefined : d.pixels / (a.width * a.height),
    name,
  });
}
const removed = base.shots.filter((s) => s.file && !headIds.has(s.id));

const count = (status) => results.filter((r) => r.status === status).length;
const changed = results.filter((r) => r.status === "changed");
const escape = (text) => String(text).replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);
const describe = (r) =>
  r.size ? `size ${r.size}` : `${r.pixels} px (${(r.ratio * 100).toFixed(2)}%)`;

const summary = [
  `### Visual check: ${changed.length ? `${changed.length} changed` : "no visual change"}`,
  "",
  `${count("same")} same, ${changed.length} changed, ${count("new")} new, ${removed.length} gone, ${count("unstable")} unstable (animated, or differ between two captures of the same build; not counted), ${count("error")} not captured.`,
  ...(changed.length
    ? [
        "",
        "| Shot | Page | Change |",
        "|---|---|---|",
        ...changed.slice(0, 60).map((r) => `| \`${r.shot.id}\` | ${r.shot.page} | ${describe(r)} |`),
        ...(changed.length > 60 ? [`| … ${changed.length - 60} more | | |`] : []),
        "",
        "Before/after/diff images are in the `visual-report` artifact (open `index.html`).",
        "If the change is intended, add the `visual-change` label to the pull request.",
      ]
    : []),
].join("\n");

const html = `<!doctype html><meta charset="utf-8"><title>Visual check</title>
<style>body{font:14px system-ui;background:#111;color:#eee;margin:24px}img{max-width:100%;border:1px solid #333;background:#000}
.row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:8px 0 32px}h2{font-size:15px;margin:0}code{color:#9cf}pre{white-space:pre-wrap;color:#aaa;font-size:12px}</style>
<h1>Visual check</h1><p>${escape(summary.split("\n")[2])}</p>
${changed
  .map(
    (r) => `<h2><code>${escape(r.shot.id)}</code> on <a href="${escape(head.url + r.shot.page)}">${escape(r.shot.page)}</a>: ${escape(describe(r))}</h2>
${r.shot.code ? `<pre>${escape(r.shot.code)}</pre>` : ""}
<div class="row"><figure>Before<img src="img/${r.name}.before.png"></figure><figure>After<img src="img/${r.name}.after.png"></figure>${r.size ? "" : `<figure>Diff<img src="img/${r.name}.diff.png"></figure>`}</div>`,
  )
  .join("\n")}`;

await writeFile(path.join(args.report, "index.html"), html);
await writeFile(path.join(args.report, "summary.md"), `${summary}\n`);
await writeFile(
  path.join(args.report, "results.json"),
  JSON.stringify(
    { results: results.map(({ shot, ...r }) => ({ id: shot.id, page: shot.page, ...r })), removed: removed.map((s) => s.id) },
    null,
    1,
  ),
);
console.log(summary);
process.exit(changed.length ? 3 : 0);
