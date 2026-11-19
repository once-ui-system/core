// Dashboard Overview benchmark: apps/dev's /bench/overview, a stand-in for the
// Databuddy Overview (KPI tiles with sparklines, a LineChart, seven tables).
// node run.cjs <label> [runs] [cpu]  -> median metrics, appended to results.jsonl
// Build and start apps/dev first (`next build && next start --port 3001`).
// VARIANT=<name> rewrites the page's CSS with a transform from variants.cjs.
const { chromium } = require("playwright");
const fs = require("fs");
const variant = process.argv[2] || "run";
const runs = Number(process.argv[3] || 5);
const cpu = Number(process.argv[4] || 4);
const URL = process.env.URL || "http://localhost:3001/bench/overview?load=6000&switch=600";
const transforms = require("./variants.cjs")[process.env.VARIANT] || ((css) => css);

const OBS = `
window.__m = { cls: 0, shifts: [], events: [] };
new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) { window.__m.cls += e.value; window.__m.shifts.push([Math.round(e.startTime), e.value, e.sources.map(s => s.node && (s.node.className || s.node.nodeName)).map(String).map(x=>x.slice(0,80))]); } }).observe({ type: "layout-shift", buffered: true });
new PerformanceObserver(l => { for (const e of l.getEntries()) if (e.interactionId) window.__m.events.push([e.name, e.duration]); }).observe({ type: "event", buffered: true, durationThreshold: 16 });
`;
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

(async () => {
  const browser = await chromium.launch();
  const out = [];
  for (let i = 0; i < runs; i++) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await ctx.addInitScript(OBS);
    await ctx.route(/\.css(\?|$)/, async (route) => {
      const res = await route.fetch();
      const body = transforms(await res.text());
      await route.fulfill({ response: res, body });
    });
    const p = await ctx.newPage();
    const cdp = await ctx.newCDPSession(p);
    await cdp.send("Performance.enable");
    if (cpu > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
    const metrics = async () => Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]));
    await p.goto(URL, { waitUntil: "load" });
    await p.waitForSelector("html[data-settled='1']", { timeout: 60000 });
    await p.waitForTimeout(800);
    const m1 = await metrics();
    const load = await p.evaluate(() => ({ cls: window.__m.cls, shifts: window.__m.shifts, nodes: document.getElementsByTagName("*").length }));
    await p.evaluate(() => { window.__m.events = []; });
    const b = await metrics();
    await p.click("#range-7d");
    await p.waitForSelector("html[data-settled='1']", { timeout: 60000 });
    await p.waitForTimeout(800);
    const a = await metrics();
    const ev = await p.evaluate(() => window.__m.events);
    out.push({
      styleMs: m1.RecalcStyleDuration * 1000,
      layoutMs: m1.LayoutDuration * 1000,
      scriptMs: m1.ScriptDuration * 1000,
      cls: load.cls,
      nodes: load.nodes,
      inp: ev.length ? Math.max(...ev.map((e) => e[1])) : 0,
      swStyle: (a.RecalcStyleDuration - b.RecalcStyleDuration) * 1000,
      swScript: (a.ScriptDuration - b.ScriptDuration) * 1000,
      swLayout: (a.LayoutDuration - b.LayoutDuration) * 1000,
      shifts: load.shifts,
    });
    await ctx.close();
  }
  await browser.close();
  const keys = ["styleMs", "layoutMs", "scriptMs", "cls", "nodes", "inp", "swStyle", "swScript", "swLayout"];
  const r = Object.fromEntries(keys.map((k) => [k, Math.round(med(out.map((o) => o[k])) * 1000) / 1000]));
  console.log(variant, `cpu${cpu}`, JSON.stringify(r));
  if (process.env.SHIFTS) console.log(JSON.stringify(out[0].shifts, null, 0));
  fs.appendFileSync(__dirname + "/results.jsonl", JSON.stringify({ variant, cpu, url: URL, ...r }) + "\n");
})();
