#!/usr/bin/env node
// Gates every un-gated attempt in a results folder (pilot or full run) and
// maintains each run's run.json (status, attempts, accepted attempt).
//
//   node runner/pilot-gate.mjs --results results/pilot [--arm A] [--concurrency 4]
//
// Attempts of one arm run sequentially (one scaffold working copy per arm);
// different arms run in parallel.

import fs from "node:fs";
import path from "node:path";
import { config, armById, listFiles } from "./lib.mjs";
import { runGates } from "./gates.mjs";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const resultsDir = path.resolve(arg("results", "results/pilot"));
const onlyArm = arg("arm");

const runs = listFiles(path.join(resultsDir, "raw"))
  .filter((f) => f.endsWith("prompt.txt"))
  .map((f) => path.join(resultsDir, "raw", path.dirname(f)));

export function runState(dir) {
  const attempts = fs
    .readdirSync(dir)
    .map((f) => /^attempt-(\d+)\.tsx$/.exec(f)?.[1])
    .filter((n) => n != null)
    .map(Number)
    .sort((a, b) => a - b);
  const gated = attempts.map((n) => {
    const g = path.join(dir, `attempt-${n}.gates.json`);
    return fs.existsSync(g) ? JSON.parse(fs.readFileSync(g, "utf8")) : null;
  });
  const acceptedIdx = gated.findIndex((g) => g?.passed);
  const last = gated.at(-1);
  let status = "pending";
  if (acceptedIdx >= 0) status = "accepted";
  else if (last && attempts.length > config.repair_rounds) status = "failed";
  else if (last) status = "needs_repair";
  else if (attempts.length) status = "needs_gate";
  return {
    status,
    attempts: attempts.length,
    accepted_attempt: acceptedIdx >= 0 ? attempts[acceptedIdx] : null,
    repair_rounds: acceptedIdx >= 0 ? attempts[acceptedIdx] : null,
    gates: gated.map((g, i) => ({ attempt: attempts[i], passed: g?.passed ?? null, failed_gate: g?.failed_gate ?? null })),
  };
}

async function gateRun(dir) {
  const armId = path.basename(path.dirname(dir));
  const { letter } = armById(armId);
  const state = runState(dir);
  if (state.status === "needs_gate") {
    const n = state.attempts - 1;
    const code = fs.readFileSync(path.join(dir, `attempt-${n}.tsx`), "utf8");
    const out = path.join(dir, `attempt-${n}`);
    const t0 = Date.now();
    const r = await runGates(letter, code, out);
    fs.renameSync(path.join(out, "gates.json"), path.join(dir, `attempt-${n}.gates.json`));
    if (!fs.readdirSync(out).length) fs.rmdirSync(out);
    console.log(
      `${path.relative(resultsDir, dir).padEnd(34)} attempt ${n}: ${r.passed ? "PASS" : `FAIL (${r.failed_gate})`} ${((Date.now() - t0) / 1000).toFixed(0)}s`,
    );
  }
  const next = runState(dir);
  fs.writeFileSync(path.join(dir, "run.json"), JSON.stringify(next, null, 2));
  return next;
}

const byArm = {};
for (const dir of runs) {
  const armId = path.basename(path.dirname(dir));
  if (onlyArm && armById(armId).letter !== onlyArm) continue;
  (byArm[armId] ??= []).push(dir);
}
await Promise.all(
  Object.values(byArm).map(async (dirs) => {
    for (const d of dirs) await gateRun(d);
  }),
);
const summary = runs.map((d) => ({ run: path.relative(resultsDir, d), ...runState(d) }));
const counts = summary.reduce((m, s) => ({ ...m, [s.status]: (m[s.status] ?? 0) + 1 }), {});
console.log(JSON.stringify(counts));
for (const s of summary.filter((s) => s.status === "needs_repair")) console.log(`needs_repair ${s.run} (next attempt ${s.attempts})`);
