#!/usr/bin/env node
// Acceptance gates for one generated page (METHODOLOGY.md §3.3):
//   extract → typecheck (tsc --noEmit) → build (next build) → render (Chromium at 3 widths)
// Recorded, not gated: axe-core violations, screenshots, Once UI validate-ai-code (A/B).
//
// Library:  runGates(armLetter, code, outDir) → gates result object (also written to outDir/gates.json)
// CLI:      node runner/gates.mjs --arm A --page path/to/page.tsx --out dir

import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import { ROOT, WORK, armByLetter, config } from "./lib.mjs";

const CHROMIUM = process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const PORTS = { A: 3101, B: 3102, C: 3103, D: 3104 };
const AXE = fs.readFileSync(path.join(ROOT, "node_modules/axe-core/axe.min.js"), "utf8");
const INTERACTIONS = JSON.parse(fs.readFileSync(path.join(ROOT, "prompts/interactions.json"), "utf8")).tasks;
const INTERACTION_VIEWPORTS = ["phone", "desktop"];

// The task's scripted interaction (prompts/interactions.json), on the page as it is.
// Recorded for the rater, never gated.
async function interact(page, task, outDir, vp, ignored) {
  const spec = INTERACTIONS[String(task)];
  if (!spec || spec.action === "none") return { action: "none" };
  const locate = (t) =>
    t.selector
      ? page.locator(t.selector).first()
      : page.getByRole(t.role, t.name ? { name: new RegExp(t.name, "i") } : {}).first();
  let target = locate(spec.target);
  let found = (await target.count()) > 0 && (await target.isVisible().catch(() => false));
  if (!found && spec.fallback) {
    target = locate(spec.fallback);
    found = (await target.count()) > 0 && (await target.isVisible().catch(() => false));
  }
  const out = { action: spec.action, found, errors: [] };
  if (!found) return out;
  const onErr = (m) => {
    if (m.type() !== "error" || ignored.has(m.location()?.url ?? "")) return;
    out.errors.push(`console.error: ${m.text()}`);
  };
  const onPageErr = (e) => out.errors.push(`uncaught: ${e.message}`);
  page.on("console", onErr);
  page.on("pageerror", onPageErr);
  try {
    await target.scrollIntoViewIfNeeded({ timeout: 5000 });
    if (spec.action === "hover") await target.hover({ timeout: 5000 });
    else await target.click({ timeout: 5000 });
    await page.waitForTimeout(800);
    await page.screenshot({
      path: path.join(outDir, `screenshot-${vp.name}-interaction.jpg`),
      type: config.screenshot.type,
      quality: config.screenshot.quality,
    });
  } catch (e) {
    out.errors.push(`interaction failed: ${e.message.split("\n")[0]}`);
  } finally {
    page.off("console", onErr);
    page.off("pageerror", onPageErr);
  }
  return out;
}
const stripAnsi = (s) => s.replace(/\x1b\[[0-9;]*[A-Za-z]/g, "");

// Each arm gets its own working copy of its scaffold so arms can be gated in
// parallel. node_modules is hard-linked (Turbopack rejects symlinks that leave
// the project root).
function workdir(letter) {
  const arm = armByLetter(letter);
  const dir = path.join(WORK, "gate", arm.id);
  if (!fs.existsSync(path.join(dir, "node_modules"))) {
    fs.rmSync(dir, { recursive: true, force: true });
    const src = path.join(ROOT, "arms", arm.scaffold);
    fs.mkdirSync(dir, { recursive: true });
    for (const e of fs.readdirSync(src)) {
      if ([".next", "next-env.d.ts"].includes(e)) continue;
      const args = e === "node_modules" ? ["-al"] : ["-a"];
      spawnSync("cp", [...args, path.join(src, e), path.join(dir, e)], { stdio: "inherit" });
    }
  }
  return dir;
}

function run(cmd, args, cwd, timeoutMs = 300_000) {
  const t0 = Date.now();
  const r = spawnSync(cmd, args, {
    cwd,
    encoding: "utf8",
    timeout: timeoutMs,
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1", CI: "1", FORCE_COLOR: "0" },
  });
  return {
    ok: r.status === 0,
    code: r.status,
    ms: Date.now() - t0,
    output: stripAnsi(`${r.stdout ?? ""}${r.stderr ?? ""}`).trim(),
  };
}

async function waitForServer(url, ms = 30_000) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    try {
      // Any HTTP response means the server is up; a 500 from the page itself is
      // reported by the render gate, not mistaken for a server that never started.
      await fetch(url);
      return true;
    } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

async function renderGate(letter, dir, outDir, task) {
  const port = PORTS[letter];
  const origin = `http://127.0.0.1:${port}`;
  const server = spawn("npx", ["next", "start", "-p", String(port), "-H", "127.0.0.1"], {
    cwd: dir,
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    stdio: ["ignore", "pipe", "pipe"],
    detached: true,
  });
  let serverLog = "";
  server.stdout.on("data", (d) => (serverLog += d));
  server.stderr.on("data", (d) => (serverLog += d));
  const result = { ok: false, viewports: {}, errors: [], axe: null, interaction: {} };
  try {
    if (!(await waitForServer(origin))) {
      result.errors.push(`server did not start:\n${stripAnsi(serverLog).slice(-2000)}`);
      return result;
    }
    const browser = await chromium.launch({ executablePath: CHROMIUM });
    try {
      for (const vp of config.viewports) {
        const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
        const page = await ctx.newPage();
        const errs = [];
        // Ignored: the favicon request, and Next.js router *prefetches* of in-page
        // links (next/link prefetches placeholder hrefs like /terms in production;
        // a plain <a> would not request them, so their 404s say nothing about the page).
        const ignored = new Set();
        const isPrefetch = (req) => {
          const h = req.headers();
          return "next-router-prefetch" in h || "rsc" in h || /[?&]_rsc=/.test(req.url());
        };
        page.on("request", (req) => {
          if (isPrefetch(req) || new URL(req.url()).pathname === "/favicon.ico") ignored.add(req.url());
        });
        page.on("console", (m) => {
          if (m.type() !== "error") return;
          const url = m.location()?.url ?? "";
          if (ignored.has(url) || /\/favicon\.ico$/.test(url)) return;
          errs.push(`console.error: ${m.text()}`);
        });
        page.on("pageerror", (e) => errs.push(`uncaught: ${e.message}`));
        page.on("response", (r) => {
          const u = new URL(r.url());
          if (u.origin === origin && r.status() >= 400 && !ignored.has(r.url())) {
            errs.push(`HTTP ${r.status()} ${u.pathname}`);
          }
        });
        // `load` + a fixed settle, not `networkidle`: some pages (timers, streaming
        // indicators) never go network-idle. A navigation error is a render failure.
        try {
          await page.goto(origin, { waitUntil: "load", timeout: 30_000 });
        } catch (e) {
          errs.push(`navigation failed: ${e.message.split("\n")[0]}`);
          result.viewports[vp.name] = { errors: errs };
          result.errors.push(...errs.map((x) => `[${vp.width}px] ${x}`));
          await ctx.close();
          continue;
        }
        await page.waitForTimeout(1500);
        const dims = await page.evaluate(() => ({
          text: document.body.innerText.trim().length,
          height: document.documentElement.scrollHeight,
          width: document.documentElement.scrollWidth,
        }));
        if (dims.text < 40 || dims.height < 200) errs.push(`empty page: text=${dims.text} height=${dims.height}`);
        const shot = path.join(outDir, `screenshot-${vp.name}.jpg`);
        const capH = Math.min(dims.height, config.screenshot.max_height);
        await page.screenshot({
          path: shot,
          type: config.screenshot.type,
          quality: config.screenshot.quality,
          fullPage: true,
          clip: { x: 0, y: 0, width: vp.width, height: capH },
        });
        if (vp.name === "desktop") {
          await page.addScriptTag({ content: AXE });
          result.axe = await page.evaluate(async () => {
            // biome-ignore lint: axe is injected at runtime
            const r = await window.axe.run(document, { resultTypes: ["violations"] });
            return {
              rules: r.violations.length,
              nodes: r.violations.reduce((s, v) => s + v.nodes.length, 0),
              serious_or_critical: r.violations.filter((v) => ["serious", "critical"].includes(v.impact)).length,
              ids: r.violations.map((v) => `${v.id}:${v.impact}:${v.nodes.length}`),
            };
          });
        }
        result.viewports[vp.name] = { ...dims, horizontal_overflow: dims.width > vp.width, errors: [...errs] };
        result.errors.push(...errs.map((e) => `[${vp.width}px] ${e}`));
        // After the gate's own checks, so interaction-time errors never gate.
        if (task != null && INTERACTION_VIEWPORTS.includes(vp.name)) {
          result.interaction[vp.name] = await interact(page, task, outDir, vp, ignored);
        }
        await ctx.close();
      }
    } finally {
      await browser.close();
    }
    result.ok = result.errors.length === 0;
    return result;
  } finally {
    try {
      process.kill(-server.pid, "SIGTERM");
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
}

export async function runGates(letter, code, outDir, task = null) {
  fs.mkdirSync(outDir, { recursive: true });
  const dir = workdir(letter);
  const res = { arm: letter, passed: false, failed_gate: null, failure_output: null, gates: {} };
  const finish = () => {
    fs.writeFileSync(path.join(outDir, "gates.json"), JSON.stringify(res, null, 2));
    return res;
  };
  if (code == null) {
    Object.assign(res, { failed_gate: "extract", failure_output: "No fenced code block found in the reply." });
    return finish();
  }
  fs.writeFileSync(path.join(dir, "app/page.tsx"), code);
  fs.rmSync(path.join(dir, ".next"), { recursive: true, force: true });

  if (["A", "B"].includes(letter)) {
    const v = run("node", ["node_modules/@once-ui-system/core/scripts/validate-ai-code.js", "app/page.tsx"], dir, 60_000);
    // The validator changes between releases (rc.0 adds rules), so record which one
    // produced the count; counts are not comparable across validator versions.
    const pkg = JSON.parse(fs.readFileSync(path.join(dir, "node_modules/@once-ui-system/core/package.json"), "utf8"));
    const script = fs.readFileSync(path.join(dir, "node_modules/@once-ui-system/core/scripts/validate-ai-code.js"));
    res.validate_ai_code = {
      exit: v.code,
      output: v.output.slice(0, 8000),
      validator: { package_version: pkg.version, script_sha256: createHash("sha256").update(script).digest("hex").slice(0, 16) },
    };
  }

  const tsc = run("npx", ["tsc", "--noEmit", "--pretty", "false"], dir);
  res.gates.typecheck = { ok: tsc.ok, ms: tsc.ms };
  if (!tsc.ok) {
    Object.assign(res, { failed_gate: "typecheck", failure_output: tsc.output });
    return finish();
  }
  const build = run("npx", ["next", "build"], dir, 600_000);
  res.gates.build = { ok: build.ok, ms: build.ms };
  if (!build.ok) {
    // Keep the part of the log that carries the error, not the banner.
    const out = build.output;
    const i = out.search(/(Failed to compile|Error:|error TS|Type error|Build error)/);
    Object.assign(res, { failed_gate: "build", failure_output: i > 0 ? out.slice(i) : out });
    return finish();
  }
  const render = await renderGate(letter, dir, outDir, task);
  res.gates.render = render;
  if (!render.ok) {
    Object.assign(res, { failed_gate: "render", failure_output: render.errors.join("\n") });
    return finish();
  }
  res.passed = true;
  return finish();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (k) => process.argv[process.argv.indexOf(`--${k}`) + 1];
  const letter = arg("arm");
  const page = arg("page");
  const out = arg("out");
  const task = process.argv.includes("--task") ? Number(arg("task")) : null;
  const r = await runGates(letter, fs.readFileSync(page, "utf8"), out, task);
  console.log(
    JSON.stringify({ passed: r.passed, failed_gate: r.failed_gate, axe: r.gates.render?.axe, interaction: r.gates.render?.interaction }, null, 2),
  );
  if (!r.passed) console.log(r.failure_output?.slice(0, 3000));
}
