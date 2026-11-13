#!/usr/bin/env node
// Iterative track (METHODOLOGY.md §11, 2026-11-10): prepares a run folder and
// prints the agent's prompt, or scores a finished run.
//
//   node runner/iter-run.mjs prompt   --arm A --task 201 --run 1 --results results/bench-v5-iter
//   node runner/iter-run.mjs finalize --arm A --task 201 --run 1 --results results/bench-v5-iter
//
// finalize gates the files as they are when the agent says done
// (iter-check --final) and writes them in the single-shot layout (attempt-0.*,
// run.json), so blind.mjs, rate-api.mjs and leaderboard.mjs read them unchanged.
// A run is accepted only if it passes every gate and the adherence check.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { ROOT, WORK, armByLetter, buildPrompt, listFiles } from "./lib.mjs";
import { MAX_CHECKS } from "./adherence.mjs";

const arg = (k) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : undefined;
};
const mode = process.argv[2];
const letter = arg("arm");
const task = Number(arg("task"));
const run = Number(arg("run"));
const resultsDir = path.resolve(arg("results"));
const dir = path.join(resultsDir, "raw", `t${String(task).padStart(2, "0")}`, armByLetter(letter).id, `run${run}`);

if (mode === "prompt") {
  fs.mkdirSync(path.join(dir, "files"), { recursive: true });
  fs.writeFileSync(path.join(dir, "run-meta.json"), JSON.stringify({ letter, task, run, tasks: process.env.BENCH_TASKS ?? null }, null, 2));
  const sandbox = path.join(WORK, "sandbox", armByLetter(letter).id);
  const check = `node ${path.join(ROOT, "runner/iter-check.mjs")} ${dir}`;
  const { system, user } = buildPrompt(letter, task);
  const brief = user.replace(
    /- Reply with every file, each in its own fenced code block[^\n]*/,
    `- Write every file of the app under \`${path.join(dir, "files")}/\`, at the same path it has in the project (for example \`${path.join(dir, "files", letter === "S" ? "src/app/page.tsx" : "app/page.tsx")}\`).`,
  );
  const preamble = [
    `Benchmark generation run (iterative track). Your working folder is ${sandbox}. Paths below such as \`project/\` and \`docs/\` are relative to it. You may read files inside that folder and inside ${dir}, and write files only inside ${path.join(dir, "files")} (Read, Write, Edit, Glob, Grep).`,
    `The one shell command you may run (Bash) is: \`${check}\``,
    `It puts your files into the project, runs the type-check and \`next build\`, renders every route at phone, tablet and desktop width with the brief's interaction, checks how much of the UI comes from the stack, and prints the result with the paths of the screenshots, which you can open with Read. A check can take several minutes, so give the Bash call a 10-minute timeout. You can run it at most ${MAX_CHECKS} times. Use it the way you would while building a real app: to fix errors, and to look at your pages and improve them.`,
    "Do not run any other command, and do not use any other tool, skill or connector.",
    "When you are finished, reply with the single word: done. The files as they are when you reply are what gets scored, whether or not your last check passed.",
    "",
  ].join("\n");
  const p = `${preamble}\n${system}\n\n${brief}`;
  fs.writeFileSync(path.join(dir, "prompt.txt"), p);
  process.stdout.write(`${dir}/prompt.txt\n`);
} else if (mode === "finalize") {
  const r = spawnSync("node", [path.join(ROOT, "runner/iter-check.mjs"), dir, "--final"], { encoding: "utf8", env: { ...process.env } });
  if (r.status !== 0) throw new Error(`final check failed to run:\n${r.stdout}\n${r.stderr}`);
  const fin = path.join(dir, "checks", "final");
  const summary = JSON.parse(fs.readFileSync(path.join(fin, "summary.json"), "utf8"));
  const gates = fs.existsSync(path.join(fin, "gates.json")) ? JSON.parse(fs.readFileSync(path.join(fin, "gates.json"), "utf8")) : { passed: false, failed_gate: summary.failed_gate };
  gates.adherence = summary.adherence;
  gates.gates_passed = gates.passed;
  gates.passed = summary.passed;
  if (!summary.passed) gates.failed_gate = summary.failed_gate;
  const files = listFiles(path.join(dir, "files"));
  fs.rmSync(path.join(dir, "attempt-0.files"), { recursive: true, force: true });
  fs.rmSync(path.join(dir, "attempt-0"), { recursive: true, force: true });
  fs.mkdirSync(path.join(dir, "attempt-0"), { recursive: true });
  let reply = "";
  for (const f of files) {
    const src = fs.readFileSync(path.join(dir, "files", f), "utf8");
    const p = path.join(dir, "attempt-0.files", f);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, src);
    reply += `\`\`\`${path.extname(f).slice(1)} ${f}\n${src}${src.endsWith("\n") ? "" : "\n"}\`\`\`\n\n`;
  }
  fs.writeFileSync(path.join(dir, "attempt-0.tsx"), reply);
  fs.writeFileSync(path.join(dir, "attempt-0.files.json"), JSON.stringify({ files, rejected: [] }, null, 2));
  fs.writeFileSync(path.join(dir, "attempt-0.gates.json"), JSON.stringify(gates, null, 2));
  for (const f of fs.readdirSync(fin).filter((f) => /\.(jpe?g|png)$/.test(f))) fs.copyFileSync(path.join(fin, f), path.join(dir, "attempt-0", f));
  const checks = fs.readdirSync(path.join(dir, "checks")).filter((f) => /^\d+$/.test(f)).sort((a, b) => a - b);
  const firstCheck = checks.length ? JSON.parse(fs.readFileSync(path.join(dir, "checks", checks[0], "summary.json"), "utf8")) : null;
  const state = {
    status: summary.passed ? "accepted" : "failed",
    attempts: 1,
    accepted_attempt: summary.passed ? 0 : null,
    repair_rounds: summary.passed ? 0 : null,
    gates: [{ attempt: 0, passed: summary.passed, failed_gate: summary.failed_gate }],
    track: "iterative",
    checks_used: checks.length,
    first_check_passed: firstCheck?.passed ?? null,
    checks: checks.map((c) => {
      const s = JSON.parse(fs.readFileSync(path.join(dir, "checks", c, "summary.json"), "utf8"));
      return { check: Number(c), at: s.at, passed: s.passed, failed_gate: s.failed_gate };
    }),
  };
  fs.writeFileSync(path.join(dir, "run.json"), JSON.stringify(state, null, 2));
  console.log(`${path.relative(resultsDir, dir)}: ${state.status}${summary.passed ? "" : ` (${summary.failed_gate})`}, ${checks.length} checks`);
}
