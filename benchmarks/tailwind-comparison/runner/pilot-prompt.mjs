#!/usr/bin/env node
// Pilot fallback (METHODOLOGY.md §7): prints the exact prompt a Claude Code
// subagent receives for one run, and prepares the run folder.
//
//   node runner/pilot-prompt.mjs --arm A --task 3 --run 1            → initial prompt
//   node runner/pilot-prompt.mjs --arm A --task 3 --run 1 --repair 1 → repair prompt for attempt 1
//
// The preamble is identical for every arm except the two paths. The task
// prompt below it is byte-identical to what generate-api.mjs sends.

import fs from "node:fs";
import path from "node:path";
import { RESULTS, WORK, armByLetter, buildPrompt, buildRepairPrompt } from "./lib.mjs";

export function runDir(resultsDir, letter, task, run) {
  return path.join(resultsDir, "raw", `t${String(task).padStart(2, "0")}`, armByLetter(letter).id, `run${run}`);
}

function preamble(letter, outFile) {
  const sandbox = path.join(WORK, "sandbox", armByLetter(letter).id);
  return [
    `Benchmark generation run. Rules: your working folder is ${sandbox}. Paths below such as \`project/\` and \`docs/\` are relative to it. Read files only inside that folder (Read, Glob, Grep). Do not read anything outside it, do not run shell commands, and do not use any other tool, skill or connector.`,
    `Deliver the page by writing the complete file to ${outFile} with the Write tool (instead of replying with a code block), then reply with the single word: done.`,
    "",
  ].join("\n");
}

export function initialPrompt(letter, task, outFile) {
  const { system, user } = buildPrompt(letter, task);
  return `${preamble(letter, outFile)}\n${system}\n\n${user}`;
}

export function repairPrompt(gate, output, outFile) {
  return `${buildRepairPrompt(gate, output)}\n\nAs before: write the complete corrected file to ${outFile} with the Write tool (no shell commands), then reply with the single word: done.`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (k) => {
    const i = process.argv.indexOf(`--${k}`);
    return i > 0 ? process.argv[i + 1] : undefined;
  };
  const letter = arg("arm");
  const task = Number(arg("task"));
  const run = Number(arg("run"));
  const resultsDir = path.resolve(arg("results") ?? path.join(RESULTS, "pilot"));
  const dir = runDir(resultsDir, letter, task, run);
  fs.mkdirSync(dir, { recursive: true });
  const repair = arg("repair");
  if (repair) {
    const prev = JSON.parse(fs.readFileSync(path.join(dir, `attempt-${repair - 1}.gates.json`), "utf8"));
    process.stdout.write(repairPrompt(prev.failed_gate, prev.failure_output, path.join(dir, `attempt-${repair}.tsx`)));
  } else {
    const p = initialPrompt(letter, task, path.join(dir, "attempt-0.tsx"));
    fs.writeFileSync(path.join(dir, "prompt.txt"), p);
    process.stdout.write(p);
  }
}
