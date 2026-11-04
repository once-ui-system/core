#!/usr/bin/env node
// Design arena: blind pairwise judging of accepted apps, like model arenas.
//
//   node runner/arena.mjs --results results/<run> [--arms A,S,C,D,M,K,T] [--tasks 1,3]
//                         [--budget-usd 15] [--dry-run]
//   node runner/arena.mjs --results results/<run> --fit        # ratings only, no API
//
// For every task, every run index r, and every pair of arms whose run r was
// accepted, one judge call sees both apps' screenshots (desktop of every route
// and named view, phone of the first route), in a seeded random order, with no
// arm names, and picks the more sophisticated, intentional design
// (prompts/arena.md). Verdicts go to <results>/arena/verdicts.json (resumable).
// --fit fits Bradley-Terry strengths (ties count half) and reports them on an
// Elo scale (anchor: mean 1000) with a bootstrap 95% range, to
// <results>/arena/ratings.json.

import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { ROOT, armById, config, quantile, rng, routesOf, shotName, taskById, tasks, views } from "./lib.mjs";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const resultsDir = path.resolve(arg("results", "results/bench-v1"));
const arenaDir = path.join(resultsDir, "arena");
const verdictsPath = path.join(arenaDir, "verdicts.json");
fs.mkdirSync(arenaDir, { recursive: true });
const verdicts = fs.existsSync(verdictsPath) ? JSON.parse(fs.readFileSync(verdictsPath, "utf8")) : [];
const armFilter = arg("arms") ? new Set(arg("arms").split(",").map((l) => config.arms[l].id)) : null;
const taskFilter = arg("tasks") ? new Set(arg("tasks").split(",").map(Number)) : null;
const budgetUsd = Number(arg("budget-usd", Infinity));
const P = config.pricing_usd_per_mtok;

// The accepted attempt's gate folder for one run, or null.
function accepted(task, armId, run) {
  const dir = path.join(resultsDir, "raw", `t${String(task).padStart(2, "0")}`, armId, `run${run}`);
  const state = path.join(dir, "run.json");
  if (!fs.existsSync(state)) return null;
  const s = JSON.parse(fs.readFileSync(state, "utf8"));
  return s.status === "accepted" ? path.join(dir, `attempt-${s.accepted_attempt}`) : null;
}

// What the judge sees of one app, in a fixed order.
function shots(task, dir) {
  const t = taskById(task);
  const list = routesOf(t).map((r) => ({ file: shotName(r, "desktop"), label: `${r} at 1440 px` }));
  list.push({ file: shotName(routesOf(t)[0], "phone"), label: `${routesOf(t)[0]} at 375 px` });
  for (const v of views[String(task)] ?? []) list.push({ file: `view-${v.name}-desktop.jpg`, label: `${v.route ?? "/"} (${v.name}) at 1440 px` });
  return list.filter((s) => fs.existsSync(path.join(dir, s.file)));
}

function pairs() {
  const out = [];
  for (const t of tasks) {
    if (taskFilter && !taskFilter.has(t.id)) continue;
    const taskDir = path.join(resultsDir, "raw", `t${String(t.id).padStart(2, "0")}`);
    if (!fs.existsSync(taskDir)) continue;
    const arms = fs.readdirSync(taskDir).filter((a) => !armFilter || armFilter.has(a)).sort();
    const runs = new Set(arms.flatMap((a) => fs.readdirSync(path.join(taskDir, a)).map((r) => Number(r.replace("run", "")))));
    for (const run of [...runs].sort()) {
      for (let i = 0; i < arms.length; i++) {
        for (let j = i + 1; j < arms.length; j++) {
          const a = accepted(t.id, arms[i], run);
          const b = accepted(t.id, arms[j], run);
          if (a && b) out.push({ id: `t${t.id}-r${run}-${arms[i]}-${arms[j]}`, task: t.id, run, arms: [arms[i], arms[j]], dirs: [a, b] });
        }
      }
    }
  }
  return out;
}

async function judge() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set.");
    process.exit(2);
  }
  const client = new Anthropic(process.env.ANTHROPIC_WORKSPACE_ID ? { defaultHeaders: { "anthropic-workspace-id": process.env.ANTHROPIC_WORKSPACE_ID } } : {});
  const template = fs.readFileSync(path.join(ROOT, "prompts/arena.md"), "utf8");
  const todo = pairs().filter((p) => !verdicts.some((v) => v.id === p.id));
  console.log(`${todo.length} pairs to judge`);
  if (process.argv.includes("--dry-run")) return;
  let spent = 0;
  for (const p of todo) {
    if (spent >= budgetUsd) {
      console.error(`budget stop: $${spent.toFixed(2)} of $${budgetUsd}`);
      process.exitCode = 3;
      break;
    }
    // Seeded per pair, so a rerun shows the same order.
    const flip = rng([...p.id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7))() < 0.5;
    const order = flip ? [1, 0] : [0, 1];
    const content = [];
    order.forEach((k, slot) => {
      for (const s of shots(p.task, p.dirs[k])) {
        content.push({ type: "text", text: `App ${slot + 1}, ${s.label}:` });
        content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: fs.readFileSync(path.join(p.dirs[k], s.file)).toString("base64") } });
      }
    });
    content.push({ type: "text", text: template.replace("{{TASK}}", taskById(p.task).prompt.split("\n\nUse this data")[0]) });
    const res = await client.messages.create({
      model: config.rater.model,
      max_tokens: 1000,
      thinking: config.rater.thinking,
      output_config: { effort: config.rater.effort },
      messages: [{ role: "user", content }],
    });
    spent += ((res.usage.input_tokens + (res.usage.cache_read_input_tokens ?? 0) + (res.usage.cache_creation_input_tokens ?? 0)) * P.input + res.usage.output_tokens * P.output) / 1e6;
    const text = res.content.filter((b) => b.type === "text").map((b) => b.text).join("");
    let v;
    try {
      v = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
    } catch {
      console.error(`${p.id}: unparsable verdict, skipped`);
      continue;
    }
    // Map the blind slot back to the arm.
    const winner = v.winner === "tie" ? "tie" : p.arms[order[Number(v.winner) - 1]];
    verdicts.push({ id: p.id, task: p.task, run: p.run, arms: p.arms, shown_first: p.arms[order[0]], winner, margin: v.margin, reason: v.reason, usage: res.usage });
    fs.writeFileSync(verdictsPath, JSON.stringify(verdicts, null, 2));
    console.log(`${p.id}: ${winner} (${v.margin})`);
  }
  console.log(`spent: $${spent.toFixed(2)}`);
}

// Bradley-Terry by minorization-maximization; ties count half a win each way.
function bradleyTerry(games, players) {
  const w = Object.fromEntries(players.map((p) => [p, 0]));
  const n = {};
  for (const g of games) {
    const [a, b] = g.arms;
    if (g.winner === "tie") {
      w[a] += 0.5;
      w[b] += 0.5;
    } else w[g.winner] += 1;
    const k = [a, b].sort().join("|");
    n[k] = (n[k] ?? 0) + 1;
  }
  let s = Object.fromEntries(players.map((p) => [p, 1]));
  for (let it = 0; it < 500; it++) {
    const next = {};
    for (const i of players) {
      let den = 0;
      for (const j of players) {
        if (i === j) continue;
        const c = n[[i, j].sort().join("|")] ?? 0;
        if (c) den += c / (s[i] + s[j]);
      }
      next[i] = den ? Math.max(w[i], 0.1) / den : s[i];
    }
    const mean = Object.values(next).reduce((x, y) => x + Math.log(y), 0) / players.length;
    for (const i of players) next[i] /= Math.exp(mean);
    s = next;
  }
  return Object.fromEntries(players.map((p) => [p, 1000 + (400 * Math.log10(s[p]))]));
}

function fit() {
  const games = verdicts.filter((v) => (!taskFilter || taskFilter.has(v.task)) && (!armFilter || v.arms.every((a) => armFilter.has(a))));
  const players = [...new Set(games.flatMap((g) => g.arms))].sort();
  if (!players.length) return console.log("no verdicts yet");
  const point = bradleyTerry(games, players);
  const rand = rng(config.statistics.bootstrap_seed);
  const boots = Object.fromEntries(players.map((p) => [p, []]));
  for (let b = 0; b < 1000; b++) {
    const sample = games.map(() => games[Math.floor(rand() * games.length)]);
    const r = bradleyTerry(sample, players);
    for (const p of players) boots[p].push(r[p]);
  }
  const record = Object.fromEntries(players.map((p) => [p, { wins: 0, losses: 0, ties: 0 }]));
  for (const g of games) {
    if (g.winner === "tie") g.arms.forEach((a) => record[a].ties++);
    else g.arms.forEach((a) => (a === g.winner ? record[a].wins++ : record[a].losses++));
  }
  const ratings = players
    .map((p) => ({
      arm: p,
      letter: armById(p).letter,
      elo: Math.round(point[p]),
      low: Math.round(quantile(boots[p], 0.025)),
      high: Math.round(quantile(boots[p], 0.975)),
      ...record[p],
    }))
    .sort((a, b) => b.elo - a.elo);
  const firstShown = games.filter((g) => g.winner !== "tie" && g.winner === g.shown_first).length;
  const decided = games.filter((g) => g.winner !== "tie").length;
  const out = { games: games.length, position_bias_first_wins: decided ? firstShown / decided : null, ratings };
  fs.writeFileSync(path.join(arenaDir, "ratings.json"), JSON.stringify(out, null, 2));
  console.table(ratings);
  console.log(`games ${games.length}; first-shown app won ${Math.round((out.position_bias_first_wins ?? 0) * 100)}% of decided games`);
}

if (process.argv.includes("--fit")) fit();
else await judge();
