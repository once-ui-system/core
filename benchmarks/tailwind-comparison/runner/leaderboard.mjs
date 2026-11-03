#!/usr/bin/env node
// Once UI Bench leaderboard: one row per system, one column per score.
//
//   node runner/leaderboard.mjs --results results/bench-v1 [--results results/other ...]
//        [--tasks 1,3,5,8,9] [--name lite] [--out results/bench-v1/leaderboard-lite]
//
// Reads every run under each --results folder (generation, gates, ratings.json
// from blind.mjs --unseal, arena/ratings.json from arena.mjs --fit) and writes
// <out>.json (per arm and per arm x task) and <out>.md. No API calls.
//
// Scores per arm (medians are of per-task medians, so every task weighs the same):
//   pass@1        share of runs whose first reply passed every gate
//   accepted      share of runs accepted within the repair rounds
//   quality       blinded rater mean over all axes, 1-5 scaled to 0-100
//   intentional   the rater's intentionality axis, 1-5
//   cost          list-price USD per run, uncached (what the API bill shows)
//   tokens        total tokens per run (input + output, every call)
//   q_per_usd     quality / cost
//   arena         Elo from the pairwise arena (with its 95% range)
//   style         distinct font sizes / colours / spacing values per route, and 4 px grid share
//   axe_serious   serious or critical axe rule violations per route

import fs from "node:fs";
import path from "node:path";
import { armById, config, listFiles, median } from "./lib.mjs";

const all = (k) => process.argv.flatMap((a, i) => (a === `--${k}` ? [process.argv[i + 1]] : []));
const arg = (k, d) => all(k)[0] ?? d;
const resultDirs = all("results").map((d) => path.resolve(d));
if (!resultDirs.length) {
  console.error("--results is required");
  process.exit(1);
}
const taskFilter = arg("tasks") ? new Set(arg("tasks").split(",").map(Number)) : null;
const outBase = path.resolve(arg("out", path.join(resultDirs[0], `leaderboard${arg("name") ? `-${arg("name")}` : ""}`)));
const P = config.pricing_usd_per_mtok;
const NAMES = { A: "Once UI", S: "Once UI Stack", C: "shadcn/ui", D: "Tailwind (no library)", M: "MUI", K: "Chakra UI", T: "Mantine", B: "Once UI (no docs)" };
const AXES = ["polish", "completeness", "responsiveness", "restraint", "coherence", "intentionality"];
const round = (x, d = 2) => (x == null || Number.isNaN(x) ? null : Math.round(x * 10 ** d) / 10 ** d);
const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

const runs = [];
for (const dir of resultDirs) {
  const ratings = fs.existsSync(path.join(dir, "ratings.json")) ? JSON.parse(fs.readFileSync(path.join(dir, "ratings.json"), "utf8")) : [];
  for (const f of listFiles(path.join(dir, "raw")).filter((f) => f.endsWith("run.json"))) {
    const runDir = path.join(dir, "raw", path.dirname(f));
    const [t, armId, r] = path.dirname(f).split(path.sep);
    const task = Number(t.slice(1));
    if (taskFilter && !taskFilter.has(task)) continue;
    const state = JSON.parse(fs.readFileSync(path.join(runDir, "run.json"), "utf8"));
    const usagePath = path.join(runDir, "usage.json");
    const usage = fs.existsSync(usagePath) ? JSON.parse(fs.readFileSync(usagePath, "utf8")) : { calls: [] };
    let input = 0;
    let output = 0;
    for (const c of usage.calls.filter((c) => c.usage)) {
      input += c.usage.input_tokens + (c.usage.cache_creation_input_tokens ?? 0) + (c.usage.cache_read_input_tokens ?? 0);
      output += c.usage.output_tokens;
    }
    const letter = armById(armId).letter;
    const run = Number(r.slice(3));
    const row = {
      dir: path.relative(process.cwd(), runDir),
      task,
      arm: letter,
      run,
      status: state.status,
      pass1: state.status === "accepted" && state.accepted_attempt === 0,
      accepted: state.status === "accepted",
      cost: (input * P.input + output * P.output) / 1e6,
      tokens: input + output,
      calls: usage.calls.filter((c) => c.usage).length,
    };
    if (row.accepted) {
      const g = JSON.parse(fs.readFileSync(path.join(runDir, `attempt-${state.accepted_attempt}.gates.json`), "utf8"));
      const render = g.gates?.render ?? {};
      const styles = Object.values(render.style ?? {});
      if (styles.length) {
        row.style = Object.fromEntries(
          ["distinct_fontSize", "distinct_color", "distinct_background", "distinct_radius", "distinct_shadow", "distinct_spacing", "spacing_on_4px_grid"].map((k) => [
            k,
            mean(styles.map((s) => s[k]).filter((v) => v != null)),
          ]),
        );
      }
      const weights = Object.values(render.weight ?? {}).filter((w) => !w.error);
      if (weights.length) row.weight = Object.fromEntries(["js_kb", "css_kb", "fcp_ms", "cls", "long_task_ms"].map((k) => [k, mean(weights.map((w) => w[k]).filter((x) => x != null))]));
      const axes = [render.axe, ...Object.values(render.routes ?? {}).map((x) => x.axe)].filter(Boolean);
      row.axe_serious = mean(axes.map((a) => a.serious_or_critical));
      if (render.brand) row.brand = render.brand;
      const files = JSON.parse(fs.readFileSync(path.join(runDir, `attempt-${state.accepted_attempt}.files.json`), "utf8")).files;
      row.code_lines = files.reduce((s, f) => s + fs.readFileSync(path.join(runDir, `attempt-${state.accepted_attempt}.files`, f), "utf8").split("\n").length, 0);
      const rating = ratings.find((x) => x.task === task && x.arm === letter && x.run === run);
      if (rating) {
        row.rating = Object.fromEntries(AXES.filter((a) => rating[a] != null).map((a) => [a, rating[a]]));
        row.quality = ((mean(Object.values(row.rating)) - 1) / 4) * 100;
      }
    }
    runs.push(row);
  }
}

const arena = resultDirs
  .map((d) => path.join(d, "arena/ratings.json"))
  .filter((p) => fs.existsSync(p))
  .map((p) => JSON.parse(fs.readFileSync(p, "utf8")))[0];

// Per arm x task medians, then per arm the median over its tasks.
const arms = [...new Set(runs.map((r) => r.arm))];
const taskIds = [...new Set(runs.map((r) => r.task))].sort((a, b) => a - b);
const perTask = [];
for (const arm of arms) {
  for (const task of taskIds) {
    const rs = runs.filter((r) => r.arm === arm && r.task === task);
    if (!rs.length) continue;
    const acc = rs.filter((r) => r.accepted);
    perTask.push({
      arm,
      task,
      runs: rs.length,
      pass1: rs.filter((r) => r.pass1).length / rs.length,
      accepted: acc.length / rs.length,
      cost: median(rs.map((r) => r.cost)),
      tokens: median(rs.map((r) => r.tokens)),
      calls: median(rs.map((r) => r.calls)),
      quality: median(acc.map((r) => r.quality).filter((q) => q != null)),
      intentionality: median(acc.map((r) => r.rating?.intentionality).filter((q) => q != null)),
      code_lines: median(acc.map((r) => r.code_lines)),
      distinct_fontSize: median(acc.map((r) => r.style?.distinct_fontSize).filter((v) => v != null)),
      distinct_color: median(acc.map((r) => r.style?.distinct_color).filter((v) => v != null)),
      distinct_spacing: median(acc.map((r) => r.style?.distinct_spacing).filter((v) => v != null)),
      spacing_on_4px_grid: median(acc.map((r) => r.style?.spacing_on_4px_grid).filter((v) => v != null)),
      axe_serious: median(acc.map((r) => r.axe_serious).filter((v) => v != null)),
      js_kb: median(acc.map((r) => r.weight?.js_kb).filter((v) => v != null)),
      css_kb: median(acc.map((r) => r.weight?.css_kb).filter((v) => v != null)),
      cls: median(acc.map((r) => r.weight?.cls).filter((v) => v != null)),
      long_task_ms: median(acc.map((r) => r.weight?.long_task_ms).filter((v) => v != null)),
    });
  }
}
const board = arms
  .map((arm) => {
    const ts = perTask.filter((t) => t.arm === arm);
    const m = (k) => median(ts.map((t) => t[k]).filter((v) => v != null));
    const rs = runs.filter((r) => r.arm === arm);
    const a = arena?.ratings.find((x) => x.letter === arm);
    const quality = m("quality");
    const cost = m("cost");
    return {
      arm,
      system: NAMES[arm] ?? arm,
      tasks: ts.length,
      runs: rs.length,
      pass1: round(rs.filter((r) => r.pass1).length / rs.length, 3),
      accepted: round(rs.filter((r) => r.accepted).length / rs.length, 3),
      quality: round(quality, 1),
      intentionality: round(m("intentionality"), 2),
      cost_usd: round(cost, 3),
      tokens: Math.round(m("tokens") ?? 0),
      quality_per_usd: quality != null && cost ? round(quality / cost, 1) : null,
      arena_elo: a?.elo ?? null,
      arena_range: a ? [a.low, a.high] : null,
      distinct_font_sizes: round(m("distinct_fontSize"), 1),
      distinct_colors: round(m("distinct_color"), 1),
      distinct_spacing: round(m("distinct_spacing"), 1),
      spacing_on_4px_grid: round(m("spacing_on_4px_grid"), 3),
      axe_serious_per_route: round(m("axe_serious"), 2),
      code_lines: Math.round(m("code_lines") ?? 0),
      js_kb_gzip: round(m("js_kb"), 1),
      css_kb_gzip: round(m("css_kb"), 1),
      cls: round(m("cls"), 3),
      long_task_ms: round(m("long_task_ms"), 0),
    };
  })
  .sort((x, y) => (y.arena_elo ?? -1) - (x.arena_elo ?? -1) || (y.quality ?? -1) - (x.quality ?? -1));

const spend = runs.reduce((s, r) => s + r.cost, 0);
const out = { generated: new Date().toISOString(), results: resultDirs.map((d) => path.relative(process.cwd(), d)), tasks: taskIds, spend_usd: round(spend, 2), arena: arena ? { games: arena.games, position_bias_first_wins: arena.position_bias_first_wins } : null, board, per_task: perTask, runs };
fs.mkdirSync(path.dirname(outBase), { recursive: true });
fs.writeFileSync(`${outBase}.json`, JSON.stringify(out, null, 2));

const pct = (x) => (x == null ? "–" : `${Math.round(x * 100)}%`);
const v = (x) => (x == null ? "–" : String(x));
const lines = [
  `# Once UI Bench leaderboard`,
  "",
  `Tasks ${taskIds.join(", ")} · ${runs.length} runs · generation spend $${round(spend, 2)} (list price, uncached) · internal, not for public claims`,
  "",
  "| System | Arena Elo | Quality | Intentionality | Pass@1 | Accepted | Cost/run | Quality per $ | Tokens/run | Font sizes | Colours | Spacing values | 4px grid | axe serious/route | JS KB gz | CSS KB gz | CLS |",
  "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  ...board.map(
    (b) =>
      `| ${b.system} | ${b.arena_elo != null ? `${b.arena_elo} (${b.arena_range.join("–")})` : "–"} | ${v(b.quality)} | ${v(b.intentionality)} | ${pct(b.pass1)} | ${pct(b.accepted)} | ${b.cost_usd != null ? `$${b.cost_usd.toFixed(2)}` : "–"} | ${v(b.quality_per_usd)} | ${b.tokens ? `${Math.round(b.tokens / 1000)}k` : "–"} | ${v(b.distinct_font_sizes)} | ${v(b.distinct_colors)} | ${v(b.distinct_spacing)} | ${pct(b.spacing_on_4px_grid)} | ${v(b.axe_serious_per_route)} | ${v(b.js_kb_gzip)} | ${v(b.css_kb_gzip)} | ${v(b.cls)} |`,
  ),
];
fs.writeFileSync(`${outBase}.md`, `${lines.join("\n")}\n`);
console.log(lines.join("\n"));
