#!/usr/bin/env node
// Screenshots every live demo on a running docs site, plus the block pages in
// viewport-sized tiles, so two builds can be compared shot by shot.
//
//   node capture.mjs --url http://localhost:3300 --out out/head [--pages /components/button,...]
//
// A demo is the preview box of a CodeBlock. Its id is the page, the width and a
// hash of the demo's code, so a demo keeps its id when the prose around it
// changes and gets a new one when its code changes. compare.mjs pairs shots by id.

import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { chromium } from "playwright";
import { PNG } from "pngjs";

const { values: args } = parseArgs({
  options: {
    url: { type: "string", default: "http://localhost:3300" },
    out: { type: "string", default: "out/head" },
    pages: { type: "string" },
    workers: { type: "string", default: "4" },
  },
});

const BASE_URL = args.url.replace(/\/$/, "");
const OUT = path.resolve(args.out);
const DEMO_WIDTH = 1280;
const BLOCK_WIDTHS = [1280, 390];
const TILE_HEIGHT = 1200;
const ANIMATION_PROBE_MS = 400;
// The preview box CodeBlock renders above its code.
const DEMO_SELECTOR = '[tabindex="-1"].overlay-background';
// Pages with no live demos, or whose content is not about how a component looks.
const SKIP = /^\/(api|changelog|roadmap|index$)/;

// Same instant, same random numbers and no remote requests on every capture.
const FIXED_TIME = new Date("2026-01-15T12:00:00Z");
// Playwright's clock.setFixedTime slows every setTimeout to a crawl, so Date
// is frozen here instead. Timers and animation frames keep running.
const INIT_SCRIPT = `(() => {
  const RealDate = Date;
  const fixed = ${FIXED_TIME.getTime()};
  class FixedDate extends RealDate {
    constructor(...a) { super(...(a.length ? a : [fixed])); }
    static now() { return fixed; }
  }
  globalThis.Date = FixedDate;
  let seed = 1234567;
  Math.random = () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  try { localStorage.setItem("data-theme", "dark"); } catch {}
})();`;
const FREEZE_CSS = `*, *::before, *::after {
  animation-delay: 0s !important; animation-duration: 0s !important;
  animation-iteration-count: 1 !important; transition: none !important;
  caret-color: transparent !important; scroll-behavior: auto !important;
}
nextjs-portal, [data-nextjs-toast] { display: none !important; }
/* Canvas effects (MatrixFx, WeatherFx, …) draw their first frame whenever
   the observer and the frame loop get to it, so a shot catches it or not by
   timing; ParticleFx places its dots by Math.random in mount order. Their
   box stays; only the drawing is hidden. */
canvas, [data-fx-particle] { visibility: hidden !important; }`;

const log = (...parts) => process.env.VISUAL_DEBUG && console.error(new Date().toISOString().slice(11, 19), ...parts);
const sha = (text) => createHash("sha1").update(text).digest("hex").slice(0, 10);
const slug = (page) => page.replace(/^\//, "").replace(/\//g, "_") || "home";

async function listPages(context) {
  if (args.pages) return args.pages.split(",").map((p) => p.trim());
  const page = await context.newPage();
  const res = await page.goto(`${BASE_URL}/sitemap.xml`);
  const xml = res?.ok() ? await res.text() : "";
  const pages = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  if (pages.length === 0) throw new Error(`No pages in ${BASE_URL}/sitemap.xml; pass --pages`);
  // The block pages are not in the sitemap; their sidebar links them all.
  await page.goto(`${BASE_URL}/blocks/quickStart`, { waitUntil: "domcontentloaded" });
  const blocks = await page.evaluate(() =>
    [...document.querySelectorAll('a[href^="/blocks/"]')].map((a) => a.getAttribute("href")),
  );
  await page.close();
  return [...new Set([...pages, ...blocks])].filter((p) => !SKIP.test(p)).sort();
}

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.images]
        .filter((img) => !img.complete)
        .map((img) => new Promise((r) => { img.onload = img.onerror = r; setTimeout(r, 3000); })),
    );
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
}

/** Polls `probe` in the page until it returns the same value for `quietMs`. */
async function waitForStable(page, probe, arg, { quietMs = 600, timeoutMs = 15_000 } = {}) {
  const deadline = Date.now() + timeoutMs;
  let last = await page.evaluate(probe, arg);
  let since = Date.now();
  while (Date.now() < deadline) {
    await page.waitForTimeout(150);
    const now = await page.evaluate(probe, arg);
    if (now !== last) {
      last = now;
      since = Date.now();
    } else if (Date.now() - since >= quietMs) break;
  }
  return last;
}

async function openPage(context, route, width) {
  const page = await context.newPage();
  log("open", route, width);
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`${BASE_URL}${route}`, { waitUntil: "networkidle", timeout: 60_000 });
  await page.addStyleTag({ content: FREEZE_CSS });
  await settle(page);
  return page;
}

async function captureDemos(context, route, shots) {
  const page = await openPage(context, route, DEMO_WIDTH);
  // CodeBlock loads its body lazily, so demos keep appearing after load.
  await waitForStable(page, (selector) => document.querySelectorAll(selector).length, DEMO_SELECTOR);
  // Each preview box with the code shown under it (empty for code-less demos).
  const demos = await page.evaluate((selector) =>
    [...document.querySelectorAll(selector)].map(
      (box) => box.parentElement?.parentElement?.querySelector("pre")?.textContent ?? "",
    ),
    DEMO_SELECTOR,
  );
  const seen = new Map();
  for (const [index, code] of demos.entries()) {
    const key = sha(code || `${route}#nocode`);
    const n = (seen.get(key) ?? 0) + 1;
    seen.set(key, n);
    const id = `${slug(route)}@${DEMO_WIDTH}__${key}${n > 1 ? `-${n}` : ""}`;
    // Located by position at shot time: a demo may remount after hydration.
    const box = page.locator(DEMO_SELECTOR).nth(index);
    try {
      await box.scrollIntoViewIfNeeded({ timeout: 5000 });
      await page.waitForTimeout(150);
      await settle(page);
      const file = `${id}.png`;
      const options = { animations: "disabled", caret: "hide", timeout: 15_000 };
      const first = await box.screenshot({ ...options, path: path.join(OUT, file) });
      // A demo that changes on its own (canvas effects, timers, autoplay) is
      // marked animated; compare.mjs does not count it.
      await page.waitForTimeout(ANIMATION_PROBE_MS);
      const animated = !first.equals(await box.screenshot(options));
      shots.push({ id, page: route, width: DEMO_WIDTH, kind: "demo", code: code.slice(0, 400), file, animated });
    } catch (error) {
      shots.push({ id, page: route, width: DEMO_WIDTH, kind: "demo", error: String(error).slice(0, 300) });
    }
  }
  await page.close();
  return demos.length;
}

async function captureTiles(context, route, shots) {
  for (const width of BLOCK_WIDTHS) {
    const page = await openPage(context, route, width);
    // Scroll through once so lazy and reveal-on-scroll sections render.
    await page.evaluate(async () => {
      for (const img of document.querySelectorAll('img[loading="lazy"]')) img.loading = "eager";
      for (let y = 0; y < document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
    // Charts and other lazy chunks load when scrolled into view.
    await page.waitForLoadState("networkidle").catch(() => {});
    const height = await waitForStable(page, () => document.documentElement.scrollHeight);
    log("scrolled", route, width, height);
    await settle(page);
    const options = { fullPage: true, animations: "disabled", caret: "hide", timeout: 60_000 };
    const full = PNG.sync.read(await page.screenshot(options));
    await page.waitForTimeout(ANIMATION_PROBE_MS);
    const again = PNG.sync.read(await page.screenshot(options));
    for (let top = 0, n = 0; top < full.height; top += TILE_HEIGHT, n += 1) {
      const h = Math.min(TILE_HEIGHT, full.height - top);
      const tile = new PNG({ width: full.width, height: h });
      PNG.bitblt(full, tile, 0, top, full.width, h, 0, 0);
      const animated =
        again.width !== full.width ||
        again.height !== full.height ||
        Buffer.compare(
          full.data.subarray(top * full.width * 4, (top + h) * full.width * 4),
          again.data.subarray(top * full.width * 4, (top + h) * full.width * 4),
        ) !== 0;
      const id = `${slug(route)}@${width}__tile${String(n).padStart(2, "0")}`;
      const file = `${id}.png`;
      await writeFile(path.join(OUT, file), PNG.sync.write(tile));
      shots.push({ id, page: route, width, kind: "tile", file, pageHeight: height, animated });
    }
    await page.close();
  }
}

const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
});
const context = await browser.newContext({
  colorScheme: "dark",
  reducedMotion: "reduce",
  deviceScaleFactor: 1,
  timezoneId: "UTC",
  locale: "en-US",
});
await context.addInitScript(INIT_SCRIPT);
await context.route("**/*", (route) => {
  const url = new URL(route.request().url());
  return url.origin === new URL(BASE_URL).origin ? route.continue() : route.abort();
});

await mkdir(OUT, { recursive: true });
const pages = await listPages(context);
const shots = [];
const queue = [...pages];
const started = Date.now();
await Promise.all(
  Array.from({ length: Number(args.workers) }, async () => {
    for (let route = queue.shift(); route; route = queue.shift()) {
      try {
        if (route.startsWith("/blocks/")) await captureTiles(context, route, shots);
        else await captureDemos(context, route, shots);
      } catch (error) {
        shots.push({ id: `${slug(route)}__page`, page: route, kind: "page", error: String(error).slice(0, 300) });
      }
    }
  }),
);
await browser.close();

shots.sort((a, b) => a.id.localeCompare(b.id));
await writeFile(
  path.join(OUT, "manifest.json"),
  JSON.stringify({ url: BASE_URL, capturedAt: new Date().toISOString(), pages, shots }, null, 1),
);
const failed = shots.filter((s) => s.error).length;
console.log(
  `Captured ${shots.length - failed} shots from ${pages.length} pages in ${Math.round((Date.now() - started) / 1000)} s` +
    (failed ? ` (${failed} failed, see manifest.json)` : ""),
);
// Crashed renderers can outlive browser.close() and keep stdout open.
process.exit(0);
