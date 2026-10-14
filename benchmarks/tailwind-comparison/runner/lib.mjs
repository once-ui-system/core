// Shared helpers for the benchmark runner.
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { countTokens as legacyClaudeCount } from "@anthropic-ai/tokenizer";
import { getEncoding } from "js-tiktoken";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const WORK = path.join(ROOT, "work");
export const RESULTS = path.join(ROOT, "results");
export const config = JSON.parse(fs.readFileSync(path.join(ROOT, "config.json"), "utf8"));
// BENCH_TASKS picks another task set (the v2 app-scale tasks); every script
// that reads tasks honours it, so one run uses one set throughout.
export const TASKS_FILE = path.resolve(ROOT, process.env.BENCH_TASKS ?? "prompts/tasks.json");
const taskSet = JSON.parse(fs.readFileSync(TASKS_FILE, "utf8"));
export const tasks = taskSet.tasks;
// Scripted interactions are keyed by task id, so they belong to their task
// set: the 12 single-page tasks keep prompts/interactions.json, another set
// carries its own under `interactions` (none if it has none).
export const interactions = process.env.BENCH_TASKS
  ? (taskSet.interactions ?? {})
  : JSON.parse(fs.readFileSync(path.join(ROOT, "prompts/interactions.json"), "utf8")).tasks;
export const taskById = (id) => tasks.find((t) => t.id === id);
// A multi-file task's reply is several files; a single-file task's is app/page.tsx.
export const isMulti = (task) => task?.output === "multi";
export const routesOf = (task) => task?.routes ?? ["/"];
// "/" keeps the single-page names (screenshot-desktop.jpg); other routes add a
// slug (screenshot-settings-billing-desktop.jpg).
export const routeSlug = (route) => route.replace(/^\/+|\/+$/g, "").replace(/[^\w-]+/g, "-");
export const shotName = (route, vp) => `screenshot-${routeSlug(route) ? `${routeSlug(route)}-` : ""}${vp}.jpg`;
const stacks = JSON.parse(fs.readFileSync(path.join(ROOT, "prompts/stacks.json"), "utf8"));

export function listFiles(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => {
      const p = path.join(dir, e.name);
      return e.isDirectory() ? listFiles(p, base) : [path.relative(base, p)];
    })
    .sort();
}

export const sha256File = (p) => createHash("sha256").update(fs.readFileSync(p)).digest("hex");

// PROXY tokenizers — used only where exact Claude counts (API usage fields or
// the count_tokens endpoint) are unavailable. Neither is the tokenizer of a
// current Claude model; both are reported so the reader can see whether an
// arm-to-arm ratio depends on the tokenizer.
//   o200k:        OpenAI o200k_base BPE (js-tiktoken)
//   claudeLegacy: Anthropic's published pre-Claude-3 tokenizer (@anthropic-ai/tokenizer)
let enc;
export function proxyTokens(text) {
  enc ??= getEncoding("o200k_base");
  return { o200k: enc.encode(text).length, claudeLegacy: legacyClaudeCount(text) };
}

export function buildPrompt(armLetter, taskId) {
  const task = taskById(taskId);
  const user = fs
    .readFileSync(path.join(ROOT, isMulti(task) ? "prompts/user-multi.md" : "prompts/user.md"), "utf8")
    .replace("{{STACK}}", stacks[armLetter])
    .replace("{{TASK}}", task.prompt)
    .replace("{{ROUTES}}", routesOf(task).map((r) => `\`${r}\``).join(", "));
  const system = fs.readFileSync(path.join(ROOT, "prompts/system.md"), "utf8").trim();
  return { system, user };
}

export function buildRepairPrompt(gate, output, multi = false) {
  const clipped = output.length > 4000 ? `${output.slice(0, 4000)}\n…[truncated]` : output;
  return fs
    .readFileSync(path.join(ROOT, multi ? "prompts/repair-multi.md" : "prompts/repair.md"), "utf8")
    .replace("{{GATE}}", gate)
    .replace("{{OUTPUT}}", clipped);
}

// The page is the last ```tsx (or ```ts / ```jsx / bare ```) block of the reply.
export function extractCode(reply) {
  const blocks = [...reply.matchAll(/```(?:tsx|ts|jsx|typescript)?[^\n]*\n([\s\S]*?)```/g)];
  return blocks.length ? `${blocks.at(-1)[1].trimEnd()}\n` : null;
}

// Multi-file replies: every fenced block whose info string names a path,
// ```tsx app/settings/page.tsx. A later block for the same path replaces an
// earlier one. Paths must stay inside app/, components/ or lib/; anything else
// (an absolute path, `..`, another folder) is reported, not written.
const FILE_PATH = /^(?:app|components|lib)\/[\w@()[\].\/-]+\.(?:tsx|ts|css)$/;
export function extractFiles(reply) {
  const files = {};
  const rejected = [];
  for (const m of reply.matchAll(/```[\w-]*[ \t]+(?:(?:title|file)=)?["']?([^\s"'`]+)["']?[^\n]*\n([\s\S]*?)```/g)) {
    const p = path.posix.normalize(m[1].replace(/^\.\//, ""));
    if (!FILE_PATH.test(p) || p.split("/").includes("..")) rejected.push(m[1]);
    else files[p] = `${m[2].trimEnd()}\n`;
  }
  return { files: Object.keys(files).length ? files : null, rejected };
}

// The code of one attempt as {path: source}: attempt-N.files/ for a
// multi-file task, attempt-N.tsx (as app/page.tsx) for a single page.
export function attemptFiles(runDir, attempt) {
  const manifest = path.join(runDir, `attempt-${attempt}.files.json`);
  if (fs.existsSync(manifest)) {
    const { files } = JSON.parse(fs.readFileSync(manifest, "utf8"));
    return Object.fromEntries(
      files.map((f) => [f, fs.readFileSync(path.join(runDir, `attempt-${attempt}.files`, f), "utf8")]),
    );
  }
  return { "app/page.tsx": fs.readFileSync(path.join(runDir, `attempt-${attempt}.tsx`), "utf8") };
}

export const armByLetter = (l) => ({ letter: l, ...config.arms[l] });
export const armById = (id) => {
  const [letter, arm] = Object.entries(config.arms).find(([, a]) => a.id === id);
  return { letter, ...arm };
};

export function median(xs) {
  const s = [...xs].sort((a, b) => a - b);
  if (!s.length) return null;
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// Linear-interpolated quantile (type 7, the R / NumPy default).
export function quantile(xs, q) {
  const s = [...xs].sort((a, b) => a - b);
  if (!s.length) return null;
  const pos = (s.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
}

// Deterministic PRNG for bootstrap and blinding (mulberry32).
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
