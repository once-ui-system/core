// Shared helpers for the benchmark runner.
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { countTokens as legacyClaudeCount } from "@anthropic-ai/tokenizer";
import { getEncoding } from "js-tiktoken";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const WORK = path.join(ROOT, "work");
export const RESULTS = path.join(ROOT, "results");
export const config = JSON.parse(fs.readFileSync(path.join(ROOT, "config.json"), "utf8"));
export const tasks = JSON.parse(fs.readFileSync(path.join(ROOT, "prompts/tasks.json"), "utf8")).tasks;
const stacks = JSON.parse(fs.readFileSync(path.join(ROOT, "prompts/stacks.json"), "utf8"));

// An API key that isn't scoped to one workspace must name the workspace on every
// request: ANTHROPIC_WORKSPACE_ID is sent as the `anthropic-workspace-id` header.
// A single-workspace key needs neither.
export function createClient() {
  const workspace = process.env.ANTHROPIC_WORKSPACE_ID;
  return new Anthropic(workspace ? { defaultHeaders: { "anthropic-workspace-id": workspace } } : {});
}

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
  const task = tasks.find((t) => t.id === taskId);
  const user = fs
    .readFileSync(path.join(ROOT, "prompts/user.md"), "utf8")
    .replace("{{STACK}}", stacks[armLetter])
    .replace("{{TASK}}", task.prompt);
  const system = fs.readFileSync(path.join(ROOT, "prompts/system.md"), "utf8").trim();
  return { system, user };
}

export function buildRepairPrompt(gate, output) {
  const clipped = output.length > 4000 ? `${output.slice(0, 4000)}\n…[truncated]` : output;
  return fs
    .readFileSync(path.join(ROOT, "prompts/repair.md"), "utf8")
    .replace("{{GATE}}", gate)
    .replace("{{OUTPUT}}", clipped);
}

// The page is the last ```tsx (or ```ts / ```jsx / bare ```) block of the reply.
export function extractCode(reply) {
  const blocks = [...reply.matchAll(/```(?:tsx|ts|jsx|typescript)?[^\n]*\n([\s\S]*?)```/g)];
  return blocks.length ? `${blocks.at(-1)[1].trimEnd()}\n` : null;
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
