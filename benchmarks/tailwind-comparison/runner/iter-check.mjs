#!/usr/bin/env node
// Iterative track (METHODOLOGY.md §11, 2026-11-10): the one command a
// generating agent may run. It puts the files the agent wrote under
// <run>/files/ into the arm's project, runs the same gates as the single-shot
// track (typecheck, next build, render every route at every width, the task's
// interaction and named views) plus the adherence check, and prints the result
// with the screenshot paths so the agent can look at its own pages.
//
//   node runner/iter-check.mjs <run folder>            (agent: at most MAX_CHECKS)
//   node runner/iter-check.mjs <run folder> --final    (harness: scores the final files)

import fs from "node:fs";
import path from "node:path";

const dir = path.resolve(process.argv[2] ?? "");
const final = process.argv.includes("--final");
const meta = JSON.parse(fs.readFileSync(path.join(dir, "run-meta.json"), "utf8"));
// The run's task set travels with the run, so the agent's command needs no env.
if (meta.tasks) process.env.BENCH_TASKS = meta.tasks;
const { runGates } = await import("./gates.mjs");
const { MAX_CHECKS, adherence } = await import("./adherence.mjs");
const { WORK, armByLetter, listFiles } = await import("./lib.mjs");
const filesDir = path.join(dir, "files");
const checksDir = path.join(dir, "checks");
fs.mkdirSync(checksDir, { recursive: true });
const done = fs.readdirSync(checksDir).filter((f) => /^\d+$/.test(f)).length;
if (!final && done >= MAX_CHECKS) {
  console.log(`No checks left: you have used all ${MAX_CHECKS}. Finish now and reply with the single word: done.`);
  process.exit(0);
}

// One project working copy per arm (gates.mjs), and at most SLOTS checks
// building at once on the machine: wait for both.
const SLOTS = 3;
async function acquire(file) {
  for (;;) {
    try {
      fs.writeFileSync(file, String(process.pid), { flag: "wx" });
      return true;
    } catch {
      const holder = Number(fs.readFileSync(file, "utf8"));
      try {
        process.kill(holder, 0);
        return false;
      } catch {
        fs.rmSync(file, { force: true });
      }
    }
  }
}
const lockDir = path.join(WORK, "gate");
fs.mkdirSync(lockDir, { recursive: true });
const armLock = path.join(lockDir, `${armByLetter(meta.letter).id}.lock`);
let slotLock = null;
let held = false;
const release = () => {
  if (slotLock) fs.rmSync(slotLock, { force: true });
  if (held) fs.rmSync(armLock, { force: true });
  slotLock = null;
  held = false;
};
while (!(await acquire(armLock))) await new Promise((r) => setTimeout(r, 2000));
held = true;
process.on("exit", release);
while (!slotLock) {
  for (let i = 0; i < SLOTS && !slotLock; i++) {
    const f = path.join(lockDir, `slot-${i}.lock`);
    if (await acquire(f)) slotLock = f;
  }
  if (!slotLock) await new Promise((r) => setTimeout(r, 2000));
}

const files = {};
for (const f of listFiles(filesDir)) files[f] = fs.readFileSync(path.join(filesDir, f), "utf8");
const n = final ? "final" : String(done + 1);
const out = path.join(checksDir, n);
fs.rmSync(out, { recursive: true, force: true });
const t0 = Date.now();
const res = Object.keys(files).length
  ? await runGates(meta.letter, files, out, meta.task)
  : { passed: false, failed_gate: "extract", failure_output: `No files found under ${filesDir}.` };
const adh = adherence(meta.letter, filesDir);
const summary = {
  check: n,
  at: new Date().toISOString(),
  ms: Date.now() - t0,
  files: Object.keys(files),
  passed: Boolean(res.passed) && adh.ok,
  gates_passed: Boolean(res.passed),
  failed_gate: res.failed_gate ?? (adh.ok ? null : "adherence"),
  adherence: adh,
};
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "summary.json"), JSON.stringify(summary, null, 2));
release();
slotLock = null;

if (final) {
  console.log(JSON.stringify({ passed: summary.passed, failed_gate: summary.failed_gate, adherence: adh }, null, 2));
  process.exit(0);
}

const lines = [`Check ${n} of ${MAX_CHECKS}: ${summary.passed ? "PASSED" : `FAILED (${summary.failed_gate})`}`];
if (!res.passed && res.failure_output) {
  const o = res.failure_output;
  lines.push("", o.length > 4000 ? `${o.slice(0, 4000)}\n…[truncated]` : o);
}
lines.push("", `Stack adherence: ${adh.ok ? "ok" : "not met"} (components from the stack: ${adh.share == null ? "n/a" : `${Math.round(adh.share * 100)}%`}, raw colour literals: ${adh.colours}, custom stylesheet lines: ${adh.cssLines})`);
for (const r of adh.reasons) lines.push(`- ${r}`);
const shots = fs.existsSync(out) ? fs.readdirSync(out).filter((f) => /\.(jpe?g|png)$/.test(f)).sort() : [];
if (shots.length) {
  lines.push("", "Screenshots (open them with Read to see your pages):");
  for (const s of shots) lines.push(path.join(out, s));
}
const axe = res.gates?.render?.axe;
if (axe) lines.push("", `Accessibility (axe) on /: ${JSON.stringify(axe).slice(0, 600)}`);
lines.push("", `${MAX_CHECKS - done - 1} checks left.`);
console.log(lines.join("\n"));
