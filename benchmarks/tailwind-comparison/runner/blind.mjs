#!/usr/bin/env node
// Blinded rating packets (METHODOLOGY.md §4.5).
//
//   node runner/blind.mjs --results results/pilot            → results/pilot/blind/<id>/{phone,tablet,desktop}.jpg
//                                                               + work/blind-key-<name>.json (sealed until rating is done)
//   node runner/blind.mjs --results results/pilot --unseal   → joins work/ratings-raw.json with the key
//                                                               → results/pilot/ratings.json + blind-key.json
//
// IDs come from a seeded shuffle, so the order carries no arm information.

import fs from "node:fs";
import path from "node:path";
import { ROOT, WORK, armById, config, listFiles, rng, tasks } from "./lib.mjs";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const resultsDir = path.resolve(arg("results", "results/pilot"));
const name = path.basename(resultsDir);
const keyPath = path.join(WORK, `blind-key-${name}.json`);
const INTERACTIONS = JSON.parse(fs.readFileSync(path.join(ROOT, "prompts/interactions.json"), "utf8")).tasks;

if (process.argv.includes("--unseal")) {
  const key = JSON.parse(fs.readFileSync(keyPath, "utf8"));
  const raw = JSON.parse(fs.readFileSync(arg("ratings", path.join(WORK, `ratings-raw-${name}.json`)), "utf8"));
  const out = raw.map((r) => ({ ...key[r.id], ...r }));
  fs.writeFileSync(path.join(resultsDir, "ratings.json"), JSON.stringify(out, null, 2));
  fs.writeFileSync(path.join(resultsDir, "blind-key.json"), JSON.stringify(key, null, 2));
  console.log(`unsealed ${out.length} ratings`);
  process.exit(0);
}

const runs = listFiles(path.join(resultsDir, "raw"))
  .filter((f) => f.endsWith("run.json"))
  .map((f) => path.dirname(f))
  .filter((d) => JSON.parse(fs.readFileSync(path.join(resultsDir, "raw", d, "run.json"), "utf8")).status === "accepted");

const r = rng(config.statistics.bootstrap_seed + 1);
const order = runs.map((d) => [r(), d]).sort((a, b) => a[0] - b[0]).map(([, d]) => d);
const key = {};
const blindDir = path.join(resultsDir, "blind");
fs.rmSync(blindDir, { recursive: true, force: true });
order.forEach((d, i) => {
  const id = `R${String(i + 1).padStart(3, "0")}`;
  const [t, armId, run] = d.split(path.sep);
  const state = JSON.parse(fs.readFileSync(path.join(resultsDir, "raw", d, "run.json"), "utf8"));
  const src = path.join(resultsDir, "raw", d, `attempt-${state.accepted_attempt}`);
  fs.mkdirSync(path.join(blindDir, id), { recursive: true });
  for (const vp of config.viewports) {
    fs.copyFileSync(path.join(src, `screenshot-${vp.name}.jpg`), path.join(blindDir, id, `${vp.name}.jpg`));
  }
  const task = Number(t.slice(1));
  const taskText = tasks.find((x) => x.id === task).prompt;
  fs.writeFileSync(path.join(blindDir, id, "task.txt"), taskText);
  // Interaction screenshots (prompts/interactions.json), when the gate took them.
  const gates = JSON.parse(fs.readFileSync(path.join(resultsDir, "raw", d, `attempt-${state.accepted_attempt}.gates.json`), "utf8"));
  const spec = INTERACTIONS[String(task)];
  const shots = [];
  for (const vp of ["phone", "desktop"]) {
    const f = path.join(src, `screenshot-${vp}-interaction.jpg`);
    if (fs.existsSync(f)) {
      fs.copyFileSync(f, path.join(blindDir, id, `${vp}-interaction.jpg`));
      shots.push(vp);
    }
  }
  let interaction = "";
  if (spec && spec.action !== "none") {
    const found = Object.values(gates.gates?.render?.interaction ?? {}).some((x) => x.found);
    interaction = found && shots.length
      ? `There are also ${shots.length} screenshots (${shots.join(" and ")}) of the visible window after one scripted interaction: ${spec.describe}`
      : `A scripted interaction was attempted but the page had no matching control: ${spec.describe}`;
  }
  const prompt = fs
    .readFileSync(path.join(ROOT, "prompts/rater.md"), "utf8")
    .replace("{{TASK}}", taskText)
    .replace("{{INTERACTION}}", interaction)
    .replace("{{ID}}", id);
  fs.writeFileSync(path.join(blindDir, id, "prompt.md"), prompt);
  key[id] = { task, arm: armById(armId).letter, run: Number(run.slice(3)) };
});
fs.writeFileSync(keyPath, JSON.stringify(key, null, 2));
console.log(`${order.length} packets in ${path.relative(process.cwd(), blindDir)}; key sealed in ${path.relative(process.cwd(), keyPath)}`);
