#!/usr/bin/env node
// Snapshots the official agent docs (llms.txt and the Markdown pages it links)
// of the systems that ship no docs package: MUI, Chakra UI, Mantine.
//
//   node runner/fetch-docs.mjs [--out work/docs-src]
//
// Writes <out>/<system>/ (llms.txt with links rewritten to local paths, and the
// pages) plus <out>/manifest.json (fetch time, source URLs, sha256 per file).
// The docs are not versioned in git upstream, so a run pins the snapshot by its
// manifest hash: setup.mjs copies the snapshot into each arm's sandbox and
// records the hash in work/context-manifest.json. Keep the snapshot tarball
// with the results (results/<run>/docs-src.tgz) so a rerun can reuse it.

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { ROOT, listFiles } from "./lib.mjs";

const outIdx = process.argv.indexOf("--out");
const OUT = path.resolve(outIdx > 0 ? process.argv[outIdx + 1] : path.join(ROOT, "work/docs-src"));

async function get(url) {
  for (let i = 0; ; i++) {
    try {
      const r = await fetch(url, { redirect: "follow" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.text();
    } catch (e) {
      if (i >= 3) throw new Error(`${url}: ${e.message}`);
      await new Promise((res) => setTimeout(res, 1000 * 2 ** i));
    }
  }
}

async function pool(items, n, fn) {
  const out = [];
  let next = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

function write(rel, text) {
  const p = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text);
}

// An llms.txt index whose links point at .md pages: fetch every page, store it
// under `pages/`, and rewrite the index to the local paths.
async function indexWithPages(system, indexUrl, toLocal, { prefix = "" } = {}) {
  // Root-relative links (MUI X uses /x/...md) resolve against the index's origin.
  const index = (await get(indexUrl)).replace(/\]\((\/[^)\s]+\.md)\)/g, (m, u) => `](${new URL(u, indexUrl).href})`);
  const urls = [...new Set([...index.matchAll(/\((https:\/\/[^)\s]+\.md)\)/g)].map((m) => m[1]))];
  const failed = [];
  await pool(urls, 12, async (u) => {
    try {
      write(path.join(system, toLocal(u)), await get(u));
    } catch (e) {
      failed.push(e.message);
    }
  });
  const local = index.replace(/\((https:\/\/[^)\s]+\.md)\)/g, (m, u) =>
    failed.some((f) => f.startsWith(u)) ? m : `(${toLocal(u).replace(new RegExp(`^${prefix}`), "")})`,
  );
  return { index: local, pages: urls.length - failed.length, failed };
}

// Split a concatenated docs file on its top-level "# " headings, outside code fences.
function splitTopLevel(text) {
  const parts = [];
  let cur = null;
  let fence = false;
  for (const line of text.replace(/^<SYSTEM>.*<\/SYSTEM>\s*/s, "").split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    if (!fence && /^# \S/.test(line)) {
      cur = { title: line.slice(2).trim(), lines: [line] };
      parts.push(cur);
    } else if (cur) cur.lines.push(line);
  }
  return parts.map((p) => ({ title: p.title, text: `${p.lines.join("\n").trim()}\n` }));
}
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

fs.rmSync(OUT, { recursive: true, force: true });
const sources = {};

// --- MUI: Material UI index + MUI X index (charts, data grid, pickers) --------
{
  const toLocal = (u) => u.replace(/^https:\/\/mui\.com\//, "");
  const core = await indexWithPages("mui", "https://mui.com/material-ui/llms.txt", toLocal);
  const x = await indexWithPages("mui", "https://mui.com/x/llms.txt", toLocal);
  write("mui/llms.txt", core.index);
  write("mui/x-llms.txt", x.index);
  sources.mui = { index: ["https://mui.com/material-ui/llms.txt", "https://mui.com/x/llms.txt"], pages: core.pages + x.pages, failed: [...core.failed, ...x.failed] };
}

// --- Mantine: one index, pages under /llms/ -----------------------------------
{
  const toLocal = (u) => u.replace(/^https:\/\/mantine\.dev\/llms\//, "pages/");
  const m = await indexWithPages("mantine", "https://mantine.dev/llms.txt", toLocal);
  write("mantine/llms.txt", m.index.replace(/^.*llms-full\.txt.*$/m, "- (The consolidated llms-full.txt is not included: every page it holds is under pages/.)"));
  sources.mantine = { index: ["https://mantine.dev/llms.txt"], pages: m.pages, failed: m.failed };
}

// --- Chakra UI: per-area concatenated files, split into one page each ----------
{
  const areas = ["components", "charts", "styling", "theming"];
  const lines = ["# Chakra UI v3 documentation (local copy)", "", "> Chakra UI is an accessible component system for building products with speed", ""];
  let pages = 0;
  for (const area of areas) {
    const text = await get(`https://chakra-ui.com/llms-${area}.txt`);
    const seen = new Map();
    lines.push(`## ${area[0].toUpperCase()}${area.slice(1)}`, "");
    for (const p of splitTopLevel(text)) {
      // Some areas list a topic twice (theming has a tokens and a customization
      // page per topic); keep both, numbered.
      const base = slug(p.title) || "page";
      const n = (seen.get(base) ?? 0) + 1;
      seen.set(base, n);
      const rel = `${area}/${base}${n > 1 ? `-${n}` : ""}.md`;
      write(path.join("chakra", rel), p.text);
      lines.push(`- [${p.title}](${rel})`);
      pages++;
    }
    lines.push("");
  }
  // The Next.js App Router installation guide lives in the full file only.
  const full = await get("https://chakra-ui.com/llms-full.txt");
  const install = splitTopLevel(full).filter((p) => p.title === "Installation");
  install.forEach((p, i) => write(`chakra/installation${i ? `-${i + 1}` : ""}.md`, p.text));
  lines.splice(4, 0, "- [Installation (Next.js setup, already done)](installation.md)", "");
  write("chakra/llms.txt", `${lines.join("\n").trim()}\n`);
  sources.chakra = { index: areas.map((a) => `https://chakra-ui.com/llms-${a}.txt`), pages: pages + install.length, failed: [] };
}

const files = listFiles(OUT).map((rel) => ({ path: rel, sha256: createHash("sha256").update(fs.readFileSync(path.join(OUT, rel))).digest("hex") }));
const manifest = { fetched: new Date().toISOString(), sources, files: files.length };
manifest.sha256 = createHash("sha256").update(JSON.stringify(files)).digest("hex");
fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify({ ...manifest, list: files }, null, 2));
for (const [s, v] of Object.entries(sources)) console.log(`${s.padEnd(8)} pages=${v.pages} failed=${v.failed.length}`);
console.log(`snapshot ${manifest.sha256.slice(0, 16)} -> ${path.relative(ROOT, OUT)}`);
