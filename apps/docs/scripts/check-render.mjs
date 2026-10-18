#!/usr/bin/env node
/**
 * Fails when a docs page throws or logs an error in a browser.
 *
 * `check:examples` proves an example typechecks; it can't prove it runs. A
 * preview can compile and still throw the moment someone uses it — the bare
 * EmojiPicker preview had no `onSelect` and threw on every emoji clicked —,
 * a date picker seeded with the build's clock can fail hydration for every
 * later visitor, or a link can prefetch a redirect to another origin and log a CORS error on
 * every page, as the footer's `/changelog` did.
 *
 * So this opens every page in the sitemap of a running build, scrolls it,
 * presses the buttons, tabs, switches and checkboxes in its previews, and
 * fails on what throws, errors in the console or answers 4xx/5xx. Console
 * warnings are listed but don't fail it: a production build logs no React
 * warnings, so what's left is the browser's own advice.
 *
 *   pnpm build && pnpm start &
 *   node scripts/check-render.mjs                 # every page
 *   node scripts/check-render.mjs components/tag  # pages matching a filter
 *
 * BASE_URL picks the server (default http://localhost:3000). CHROME_PATH
 * picks the browser; without it the installed Google Chrome is used, which
 * GitHub's runners have.
 */
import { chromium } from "playwright-core";

const base = process.env.BASE_URL || "http://localhost:3000";
const filter = process.argv.slice(2).find((a) => !a.startsWith("--"));
const WORKERS = Number(process.env.WORKERS) || 6;
const CLICKS_PER_PAGE = 40;

/**
 * Noise that says nothing about the docs: analytics that only exist on
 * Vercel, third-party embeds' own errors, and the headless GPU fallback.
 */
const IGNORE = [
  /\/_vercel\/(insights|speed-insights)\//,
  /youtube\.com|googleapis\.com|googlevideo\.com|doubleclick\.net/,
  /WebGL|WebGPU|GroupMarkerNotSet|swiftshader/i,
];
const ignored = (text) => IGNORE.some((re) => re.test(text));

// Controls inside live previews (CodeBlock's `overlay-background` pane), not
// the page's own copy buttons and code tabs, which are most of the rest.
const INTERACTIVE =
  "main .overlay-background :is(button, [role=button], [role=tab], [role=switch], [role=checkbox], [role=radio], input[type=checkbox], input[type=radio])";

const sitemap = await fetch(`${base}/sitemap.xml`).then((r) => {
  if (!r.ok) throw new Error(`${base}/sitemap.xml: ${r.status}`);
  return r.text();
});
let paths = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
if (filter) paths = paths.filter((p) => p.includes(filter));

const browser = await chromium.launch(
  process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" },
);

const problems = [];
const warnings = [];
let clicks = 0;

async function visit(context, path) {
  const page = await context.newPage();
  let step = "load";
  const report = (message, list = problems) => {
    if (!ignored(message)) list.push({ path, step, message: message.slice(0, 500) });
  };
  page.on("console", (m) => {
    if (m.type() !== "error" && m.type() !== "warning") return;
    // A failed request logs only "Failed to load resource", with no URL; the
    // request handlers below say which, and drop other sites' failures.
    if (/^Failed to load resource/.test(m.text())) return;
    // An embed's own console says nothing about the docs, and its text often
    // names no URL (YouTube's player logs a compute-pressure permissions
    // violation now and then), so the script that logged it is checked too.
    if (ignored(m.location()?.url ?? "")) return;
    report(`${m.type()}: ${m.text()}`, m.type() === "warning" ? warnings : problems);
  });
  page.on("pageerror", (e) => report(`threw: ${e.message}`));
  page.on("response", (r) => {
    if (r.status() >= 400 && new URL(r.url()).origin === new URL(base).origin) {
      report(`${r.status()}: ${r.url()}`);
    }
  });
  page.on("requestfailed", (r) => {
    if (
      new URL(r.url()).origin === new URL(base).origin &&
      !/ERR_ABORTED/.test(r.failure()?.errorText ?? "")
    ) {
      report(`request failed (${r.failure()?.errorText}): ${r.url()}`);
    }
  });
  page.on("dialog", (d) => d.dismiss().catch(() => {}));

  try {
    const response = await page.goto(base + path, { waitUntil: "load", timeout: 45000 });
    await page.waitForLoadState("networkidle", { timeout: 3000 }).catch(() => {});
    if (!response?.ok()) report(`page answered ${response?.status()}`);
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 700) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 50));
      }
    });

    for (const handle of (await page.$$(INTERACTIVE)).slice(0, CLICKS_PER_PAGE)) {
      // A click that navigated away ends the page's turn.
      if (new URL(page.url()).pathname !== path) break;
      try {
        if (!(await handle.isVisible())) continue;
        const name = await handle.evaluate((el) =>
          (el.getAttribute("aria-label") || el.textContent || el.tagName).trim().slice(0, 40),
        );
        step = `clicking "${name}"`;
        await handle.click({ timeout: 400, noWaitAfter: true });
        clicks++;
        await page.waitForTimeout(60);
        await page.keyboard.press("Escape");
      } catch {
        // Covered, detached or animating away: not this check's business.
      }
    }
    step = "settling";
    await page.waitForTimeout(400);
  } catch (e) {
    report(`could not load: ${e.message.split("\n")[0]}`);
  }
  await page.close();
}

const queue = [...paths];
await Promise.all(
  Array.from({ length: WORKERS }, async () => {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    // Pages are prerendered at build time. A visitor arrives a day and some
    // minutes later, so anything rendered from the clock — a date picker
    // seeded with `new Date()` — has to wait for the client, or hydration
    // fails. Checking right after a build would never see it.
    await context.clock.setFixedTime(Date.now() + (25 * 60 + 7) * 60 * 1000);
    for (let path = queue.shift(); path; path = queue.shift()) await visit(context, path);
    await context.close();
  }),
);
await browser.close();

const print = (p) => console.log(`${p.path} (${p.step})\n  ${p.message}\n`);
if (warnings.length) console.log("Warnings (not failing):\n");
warnings.forEach(print);
if (problems.length) console.log("Problems:\n");
problems.forEach(print);
console.log(
  `${paths.length} pages opened, ${clicks} controls pressed, ${problems.length} problems, ${warnings.length} warnings.`,
);
process.exit(problems.length ? 1 : 0);
