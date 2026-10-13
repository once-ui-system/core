#!/usr/bin/env node
// Aggregates a results folder into tables (METHODOLOGY.md §5).
//
//   node runner/report.mjs --results results/pilot [--json results/pilot/summary.json]
//
// Prints markdown tables to stdout and writes a machine-readable summary.
// Pilot token figures: "visible output" = proxy count of everything the model
// generated except redacted thinking; "input net" = exact Claude input tokens
// minus the measured per-call Claude Code overhead (see pilot-overhead.json).

import fs from "node:fs";
import path from "node:path";
import { armById, config, listFiles, median, quantile, rng, tasks } from "./lib.mjs";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const resultsDir = path.resolve(arg("results", "results/pilot"));
const readJSON = (p) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : null);

// ---- collect -------------------------------------------------------------------
const rows = [];
for (const f of listFiles(path.join(resultsDir, "raw")).filter((f) => f.endsWith("prompt.txt"))) {
  const dir = path.join(resultsDir, "raw", path.dirname(f));
  const [t, armId, run] = path.dirname(f).split(path.sep);
  const { letter } = armById(armId);
  const state = readJSON(path.join(dir, "run.json"));
  const usage = readJSON(path.join(dir, "usage.json"));
  const metrics = readJSON(path.join(dir, "metrics.json"));
  const acc = state?.accepted_attempt;
  // Tokens up to and including the accepted attempt (or all attempts if failed).
  const upto = (a) => (acc == null ? true : a.attempt <= acc);
  const att = (usage?.attempts ?? []).filter(Boolean).filter(upto);
  const sum = (k) => att.reduce((s, a) => s + (a[k] ?? 0), 0);
  const allAtt = (usage?.attempts ?? []).filter(Boolean);
  const readsDocs = (usage?.tool_calls ?? []).filter((c) => (c.name === "Read" || c.name === "read_file") && c.path?.startsWith("docs/")).length;
  const gates = [0, 1, 2, 3].map((n) => readJSON(path.join(dir, `attempt-${n}.gates.json`))).filter(Boolean);
  const accGates = acc != null ? gates[acc] : null;
  rows.push({
    task: Number(t.slice(1)),
    arm: letter,
    run: Number(run.slice(3)),
    status: state?.status ?? "pending",
    first_pass: gates[0]?.passed ?? null,
    first_failed_gate: gates[0]?.failed_gate ?? null,
    repairs: acc,
    calls: sum("calls"),
    // Full run (exact API usage) vs pilot (proxy output, exact input net of overhead).
    out_visible: usage?.exact ? sum("output_tokens") : sum("visible_output_tokens_o200k"),
    out_visible_legacy: sum("visible_output_tokens_claudeLegacy"),
    input_total: sum("input_total"),
    input_net: usage?.exact ? sum("input_tokens") : sum("input_net_of_overhead"),
    total_net: usage?.exact
      ? sum("input_tokens") + sum("output_tokens")
      : sum("input_net_of_overhead") + sum("visible_output_tokens_o200k"),
    total_net_all_attempts: allAtt.reduce(
      (s, a) =>
        s +
        (usage?.exact
          ? a.input_tokens + a.output_tokens
          : (a.input_net_of_overhead ?? 0) + (a.visible_output_tokens_o200k ?? 0)),
      0,
    ),
    docs_reads: readsDocs,
    code_lines: metrics?.normalised.lines ?? null,
    code_chars: metrics?.normalised.chars ?? null,
    code_bytes: metrics?.normalised.bytes ?? null,
    code_tokens: metrics?.normalised.tokens_exact ?? metrics?.normalised.tokens_o200k ?? null,
    code_tokens_exact: metrics?.normalised.tokens_exact != null,
    code_tokens_legacy: metrics?.normalised.tokens_claudeLegacy ?? null,
    raw_lines: metrics?.raw.lines ?? null,
    vendored_lines: metrics?.vendored?.lines ?? null,
    vendored_tokens: metrics?.vendored?.tokens_exact ?? metrics?.vendored?.tokens_o200k ?? null,
    ...cost(usage, acc),
    vendored_files: metrics?.vendored?.files.length ?? null,
    components: metrics?.components?.length ?? null,
    axe_rules: accGates?.gates.render?.axe?.rules ?? null,
    axe_serious: accGates?.gates.render?.axe?.serious_or_critical ?? null,
    overflow_phone: accGates?.gates.render?.viewports?.phone?.horizontal_overflow ?? null,
    validate_issues: accGates?.validate_ai_code ? countValidate(accGates.validate_ai_code.output) : null,
    validator: accGates?.validate_ai_code?.validator?.script_sha256 ?? "pilot (2.1 RC tree d070802)",
  });
}

// Secondary metric (METHODOLOGY.md §4.1a): what the run would cost at list prices
// if every call's re-sent prefix (the previous call's input + output) were a cache
// read, next to the uncached cost the pre-registered metrics describe. Exact
// (API) runs only; the pilot's transcripts already include Claude Code's caching.
function cost(usage, acc) {
  if (!usage?.exact) return { cost_uncached_usd: null, cost_cached_usd: null };
  const P = config.pricing_usd_per_mtok;
  const calls = usage.calls.filter((c) => c.usage && (acc == null || c.attempt <= acc));
  let prev = 0;
  let uncached = 0;
  let cached = 0;
  for (const c of calls) {
    const input = c.usage.input_tokens + (c.usage.cache_creation_input_tokens ?? 0) + (c.usage.cache_read_input_tokens ?? 0);
    const out = c.usage.output_tokens;
    const hit = Math.min(prev, input);
    uncached += (input * P.input + out * P.output) / 1e6;
    cached += (hit * P.cache_read + (input - hit) * P.cache_write_5m + out * P.output) / 1e6;
    prev = input + out;
  }
  return { cost_uncached_usd: uncached, cost_cached_usd: cached };
}

function countValidate(out) {
  const m = /(\d+)\s+(?:issue|problem|warning|error)/i.exec(out);
  if (m) return Number(m[1]);
  return /no issues|✓|passed/i.test(out) ? 0 : null;
}

const ratings = readJSON(path.join(resultsDir, "ratings.json")); // [{task, arm, run, polish, ...}]
if (ratings) {
  for (const r of ratings) {
    const row = rows.find((x) => x.task === r.task && x.arm === r.arm && x.run === r.run);
    if (row) Object.assign(row, { polish: r.polish, completeness: r.completeness, responsiveness: r.responsiveness, restraint: r.restraint });
  }
}

// ---- aggregate -------------------------------------------------------------------
const ARMS = ["A", "B", "C", "D"];
const taskIds = [...new Set(rows.map((r) => r.task))].sort((a, b) => a - b);
const accepted = (t, a) => rows.filter((r) => r.task === t && r.arm === a && r.status === "accepted");
const cell = (t, a, k) => {
  const xs = accepted(t, a).map((r) => r[k]).filter((x) => x != null);
  return xs.length ? { median: median(xs), q1: quantile(xs, 0.25), q3: quantile(xs, 0.75), n: xs.length } : null;
};

function bootstrapMedianCI(xs, seed = config.statistics.bootstrap_seed, B = config.statistics.bootstrap_resamples) {
  if (xs.length < 2) return null;
  const r = rng(seed);
  const meds = [];
  for (let b = 0; b < B; b++) meds.push(median(xs.map(() => xs[Math.floor(r() * xs.length)])));
  const alpha = (1 - config.statistics.ci) / 2;
  return [quantile(meds, alpha), quantile(meds, 1 - alpha)];
}

function compare(x, y, k, exclude = []) {
  const per = taskIds
    .filter((t) => !exclude.includes(t))
    .map((t) => {
      const cx = cell(t, x, k);
      const cy = cell(t, y, k);
      return cx && cy ? { task: t, reduction: 1 - cx.median / cy.median } : null;
    })
    .filter(Boolean);
  const rs = per.map((p) => p.reduction);
  return {
    pair: `${x} vs ${y}`,
    metric: k,
    tasks_compared: rs.length,
    median_reduction: median(rs),
    min: rs.length ? Math.min(...rs) : null,
    max: rs.length ? Math.max(...rs) : null,
    q1: quantile(rs, 0.25),
    q3: quantile(rs, 0.75),
    tasks_favouring_x: rs.filter((r) => r > 0).length,
    ci95: bootstrapMedianCI(rs),
    per_task: per,
  };
}

const METRICS = ["out_visible", "total_net", "code_tokens", "code_lines", "code_bytes", "cost_cached_usd"];
const pairs = [config.primary_comparison, ...config.secondary_comparisons];
const comparisons = pairs.flatMap(([x, y]) => METRICS.map((k) => compare(x, y, k)));
const sensitivity = METRICS.map((k) => compare(...config.primary_comparison, k, config.sensitivity_exclude_tasks));

const passRate = Object.fromEntries(
  ARMS.map((a) => {
    const rs = rows.filter((r) => r.arm === a);
    return [
      a,
      {
        runs: rs.length,
        accepted: rs.filter((r) => r.status === "accepted").length,
        first_attempt: rs.filter((r) => r.first_pass).length,
        failed: rs.filter((r) => r.status === "failed").length,
        pending: rs.filter((r) => !["accepted", "failed"].includes(r.status)).length,
        median_repairs: median(rs.filter((r) => r.repairs != null).map((r) => r.repairs)),
        first_failed_gates: rs.filter((r) => r.first_failed_gate).map((r) => r.first_failed_gate),
      },
    ];
  }),
);

const validators = [...new Set(rows.filter((r) => r.validate_issues != null).map((r) => r.validator))];
const summary = { generated: new Date().toISOString(), rows, passRate, comparisons, sensitivity, validators };
fs.writeFileSync(arg("json", path.join(resultsDir, "summary.json")), JSON.stringify(summary, null, 2));

// ---- markdown ---------------------------------------------------------------------
const pct = (x) => (x == null ? "–" : `${Math.round(x * 100)}%`);
const num = (x) =>
  x == null ? "–" : Math.abs(x) < 10 && !Number.isInteger(x) ? x.toFixed(Math.abs(x) < 1 ? 4 : 2) : Math.round(x).toLocaleString("en-US");
const iqr = (c) => (c ? `${num(c.median)} (${num(c.q1)}–${num(c.q3)})` : "–");
const NAMES = { A: "A Once UI + harness", B: "B Once UI, memory", C: "C Tailwind + shadcn/ui + docs", D: "D Tailwind, memory" };
const LABEL = {
  out_visible: "Visible output tokens (proxy)",
  total_net: "Total tokens, net of Claude Code overhead (exact input + proxy output)",
  input_net: "Input tokens, net of overhead (exact)",
  code_tokens: "Code tokens, normalised (exact count_tokens where measured, else proxy o200k)",
  code_tokens_legacy: "Code tokens, normalised (proxy legacy-Claude)",
  code_lines: "Code lines, normalised",
  code_bytes: "Code bytes, normalised",
  calls: "API calls per run",
  docs_reads: "Docs files read per run",
  repairs: "Repair rounds to acceptance",
  vendored_lines: "Vendored component lines (C)",
  cost_uncached_usd: "Cost per run, USD, list prices, no caching (exact runs only)",
  cost_cached_usd: "Cost per run, USD, list prices, prefix caching assumed (secondary; exact runs only)",
  components: "Distinct library components imported",
  axe_rules: "axe violation rules (1440 px)",
};

const lines = [];
lines.push("### Gate pass rate\n");
lines.push("| Arm | Runs | Accepted (≤3 repairs) | Passed first attempt | Failed | Pending | First-attempt failures by gate |");
lines.push("|---|---|---|---|---|---|---|");
for (const a of ARMS) {
  const p = passRate[a];
  const g = p.first_failed_gates.reduce((m, x) => ({ ...m, [x]: (m[x] ?? 0) + 1 }), {});
  lines.push(`| ${NAMES[a]} | ${p.runs} | ${p.accepted} | ${p.first_attempt} | ${p.failed} | ${p.pending} | ${Object.entries(g).map(([k, v]) => `${k} ${v}`).join(", ") || "–"} |`);
}
for (const k of Object.keys(LABEL)) {
  lines.push(`\n### ${LABEL[k]}: median (IQR) over accepted runs\n`);
  lines.push(`| Task | ${ARMS.map((a) => NAMES[a]).join(" | ")} |`);
  lines.push(`|---|${ARMS.map(() => "---").join("|")}|`);
  for (const t of taskIds) {
    const title = tasks.find((x) => x.id === t).title;
    lines.push(`| ${t}. ${title} | ${ARMS.map((a) => iqr(cell(t, a, k))).join(" | ")} |`);
  }
}
lines.push("\n### Reductions (per-task median reduction of X relative to Y; positive = X smaller)\n");
lines.push("| Pair | Metric | Tasks | Median | Range | Tasks where X < Y | 95% bootstrap CI |");
lines.push("|---|---|---|---|---|---|---|");
for (const c of [...comparisons, ...sensitivity.map((s) => ({ ...s, pair: `${s.pair} (excl. ${config.sensitivity_exclude_tasks.join(", ")})` }))]) {
  lines.push(
    `| ${c.pair} | ${LABEL[c.metric]} | ${c.tasks_compared} | ${pct(c.median_reduction)} | ${pct(c.min)} to ${pct(c.max)} | ${c.tasks_favouring_x}/${c.tasks_compared} | ${c.ci95 ? `${pct(c.ci95[0])} to ${pct(c.ci95[1])}` : "n/a (< 2 tasks)"} |`,
  );
}
// Pre-registered claim conditions (METHODOLOGY.md §5.1) for the primary pair.
{
  const [X, Y] = config.primary_comparison;
  const pr = (a) => passRate[a].accepted / Math.max(1, passRate[a].runs);
  const axes = ["polish", "completeness", "responsiveness", "restraint"];
  const medAxis = (a, k) => median(rows.filter((r) => r.arm === a && r[k] != null).map((r) => r[k]));
  const ratingOk = ratings ? axes.every((k) => medAxis(X, k) >= medAxis(Y, k) - 0.5) : null;
  lines.push(`\n### Claim conditions, ${X} vs ${Y} (METHODOLOGY.md §5.1)\n`);
  lines.push("| Metric | 1. CI lower bound > 0 | 2. X < Y on ≥ 9 tasks | 3. holds without tasks 1, 5, 8 | 4. pass rate within 10 pp | 5. ratings within 0.5 | Claim allowed |");
  lines.push("|---|---|---|---|---|---|---|");
  for (const k of METRICS.filter((m) => m !== "cost_cached_usd")) {
    const c = comparisons.find((x) => x.pair === `${X} vs ${Y}` && x.metric === k);
    const sens = sensitivity.find((x) => x.metric === k);
    const c1 = c.ci95 ? c.ci95[0] > 0 : false;
    const c2 = c.tasks_favouring_x >= 9;
    const c3 = (sens.median_reduction ?? 0) > 0;
    const c4 = pr(X) >= pr(Y) - 0.1;
    const c5 = ratingOk;
    const yes = (b) => (b == null ? "n/a" : b ? "yes" : "**no**");
    lines.push(`| ${LABEL[k]} | ${yes(c1)} | ${yes(c2)} (${c.tasks_favouring_x}/${c.tasks_compared}) | ${yes(c3)} | ${yes(c4)} | ${yes(c5)} | ${c1 && c2 && c3 && c4 && c5 ? "**yes**" : "no"} |`);
  }
}
if (ratings) {
  lines.push("\n### Blinded rating (1–5): median over accepted runs, pooled across tasks\n");
  lines.push("| Arm | Polish | Completeness | Responsiveness | Restraint |");
  lines.push("|---|---|---|---|---|");
  for (const a of ARMS) {
    const rs = rows.filter((r) => r.arm === a && r.polish != null);
    const m = (k) => median(rs.map((r) => r[k]));
    lines.push(`| ${NAMES[a]} | ${m("polish") ?? "–"} | ${m("completeness") ?? "–"} | ${m("responsiveness") ?? "–"} | ${m("restraint") ?? "–"} |`);
  }
}
if (validators.length) {
  lines.push(
    `\n_Once UI \`validate-ai-code\` issue counts (in summary.json) come from validator ${validators.join(", ")}. They are not comparable across runs that used different validator versions._`,
  );
}
console.log(lines.join("\n"));
