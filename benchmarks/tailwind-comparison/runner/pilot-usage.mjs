#!/usr/bin/env node
// Pilot fallback (METHODOLOGY.md §7): exact Claude token usage and a
// contamination audit, read from Claude Code subagent transcripts.
//
//   node runner/pilot-usage.mjs --results results/pilot --agents work/pilot-agents.json \
//        --transcripts ~/.claude/projects/<project>/<session>/subagents
//
// Writes <run>/usage.json for every run in the agents map. Agent ids stay in work/
// (session-internal); only derived numbers are committed.

import fs from "node:fs";
import path from "node:path";
import { WORK, armById, proxyTokens } from "./lib.mjs";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const resultsDir = path.resolve(arg("results", "results/pilot"));
const agents = JSON.parse(fs.readFileSync(arg("agents", path.join(WORK, "pilot-agents.json")), "utf8"));
const transcripts = arg("transcripts");
if (!transcripts) throw new Error("--transcripts <dir> is required");

function readTranscript(id) {
  const file = path.join(transcripts, `agent-${id}.jsonl`);
  return fs
    .readFileSync(file, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

// One API call is logged as several lines (one per content block) that share a
// message id; usage on earlier lines is partial (streaming). Keep the last line's
// usage per message id.
export function summarise(lines, { sandbox, runDir }) {
  const calls = new Map();
  const tools = [];
  const attempts = [];
  const visible = [];
  let attempt = 0;
  for (const l of lines) {
    const m = l.message;
    if (!m) continue;
    if (l.type === "user") {
      const text = typeof m.content === "string" ? m.content : (m.content ?? []).map((b) => b.text ?? "").join("");
      if (/Your page failed the /.test(text)) attempt++;
      continue;
    }
    if (l.type !== "assistant") continue;
    if (m.id && m.usage) calls.set(m.id, { attempt: calls.get(m.id)?.attempt ?? attempt, model: m.model, usage: m.usage });
    // Transcripts record output usage as of the start of the stream (a message that
    // writes a whole page shows ~5 output tokens), so output is measured from the
    // generated content itself: text + tool-call JSON. Thinking is redacted in the
    // transcript (empty text), so its tokens are not visible; blocks are counted.
    for (const b of Array.isArray(m.content) ? m.content : []) {
      const v = (visible[attempt] ??= { text: "", thinking_blocks: 0 });
      if (b.type === "text") v.text += b.text;
      if (b.type === "tool_use") v.text += `${b.name}${JSON.stringify(b.input)}`;
      if (b.type === "thinking") v.thinking_blocks++;
    }
    for (const b of Array.isArray(m.content) ? m.content : []) {
      if (b.type !== "tool_use") continue;
      const p = b.input?.file_path ?? b.input?.path ?? b.input?.pattern ?? null;
      tools.push({ attempt, name: b.name, path: p, input: b.name === "Write" ? undefined : b.input });
    }
  }
  for (const c of calls.values()) {
    const u = c.usage;
    const a = (attempts[c.attempt] ??= {
      attempt: c.attempt,
      calls: 0,
      output_tokens: 0,
      thinking_tokens: 0,
      input_total: 0,
      input_uncached: 0,
      cache_creation: 0,
      cache_read: 0,
    });
    a.calls++;
    a.output_tokens += u.output_tokens ?? 0;
    a.thinking_tokens += u.output_tokens_details?.thinking_tokens ?? 0;
    a.input_uncached += u.input_tokens ?? 0;
    a.cache_creation += u.cache_creation_input_tokens ?? 0;
    a.cache_read += u.cache_read_input_tokens ?? 0;
    a.input_total += (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0);
  }
  for (const a of attempts) {
    if (!a) continue;
    const v = visible[a.attempt] ?? { text: "", thinking_blocks: 0 };
    const t = proxyTokens(v.text);
    a.visible_output_tokens_o200k = t.o200k;
    a.visible_output_tokens_claudeLegacy = t.claudeLegacy;
    a.thinking_blocks = v.thinking_blocks;
    delete a.output_tokens; // not trustworthy in transcripts (see above)
    delete a.thinking_tokens;
  }
  // Audit: reads only inside the sandbox, writes only to this run's attempt files,
  // no other tools (the hand-back call that ends a subagent is allowed).
  const violations = [];
  const inside = (p, root) => p && path.resolve(p).startsWith(`${root}${path.sep}`);
  for (const t of tools) {
    if (["Read", "Glob", "Grep"].includes(t.name)) {
      const target = t.name === "Read" ? t.path : (t.input?.path ?? null);
      if (t.name !== "Read" && !target) {
        // Glob/Grep without a path search the session cwd (the repository).
        violations.push(`${t.name} without path (searches the repository): ${JSON.stringify(t.input)}`);
      } else if (!inside(target, sandbox) && path.resolve(target) !== sandbox && !inside(target, runDir)) {
        // (Reading back this run's own attempt files is allowed.)
        violations.push(`${t.name} outside sandbox: ${target}`);
      } else if (t.name === "Glob" && path.isAbsolute(t.input?.pattern ?? "") && !inside(t.input.pattern, sandbox)) {
        violations.push(`Glob pattern outside sandbox: ${t.input.pattern}`);
      }
    } else if (t.name === "Write" || t.name === "Edit") {
      if (!inside(t.path, runDir)) violations.push(`Write outside run folder: ${t.path}`);
    } else if (t.name !== "SubagentHandback") {
      violations.push(`disallowed tool: ${t.name}`);
    }
  }
  return {
    model: [...new Set([...calls.values()].map((c) => c.model))],
    attempts,
    tool_calls: tools.map(({ attempt, name, path: p }) => ({
      attempt,
      name,
      path: p && path.isAbsolute(p) ? path.relative(sandbox, p) || "." : p,
    })),
    audit: { ok: violations.length === 0, violations },
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const baselineId = agents._baseline_empty_agent;
  const baseline = baselineId ? summarise(readTranscript(baselineId), { sandbox: "/nonexistent", runDir: "/nonexistent" }) : null;
  // Input tokens of one call that carries only Claude Code's own context
  // (system prompt, tool schemas, repo instructions, hand-back reminder).
  const overheadPerCall = baseline ? baseline.attempts[0].input_total : null;
  fs.writeFileSync(
    path.join(resultsDir, "pilot-overhead.json"),
    JSON.stringify(
      {
        note: "Input tokens of the first call of an agent whose whole task was 'Reply with exactly the word: ok'. Subtracted once per API call to approximate input tokens net of Claude Code's own context.",
        model: baseline?.model,
        input_tokens_per_call: overheadPerCall,
        output_tokens: baseline?.attempts[0].output_tokens,
      },
      null,
      2,
    ),
  );
  for (const [key, id] of Object.entries(agents)) {
    if (key.startsWith("_")) continue;
    const [task, armId, run] = key.split("/");
    const runDir = path.join(resultsDir, "raw", task, armId, run);
    const sandbox = path.join(WORK, "sandbox", armId);
    let lines;
    try {
      lines = readTranscript(id);
    } catch {
      console.warn(`missing transcript for ${key}`);
      continue;
    }
    const s = summarise(lines, { sandbox, runDir });
    for (const a of s.attempts) {
      if (a && overheadPerCall) a.input_net_of_overhead = a.input_total - a.calls * overheadPerCall;
    }
    s.arm = armById(armId).letter;
    fs.writeFileSync(path.join(runDir, "usage.json"), JSON.stringify(s, null, 2));
    const out = s.attempts.reduce((n, a) => n + (a?.visible_output_tokens_o200k ?? 0), 0);
    console.log(`${key.padEnd(30)} calls=${s.attempts.reduce((n, a) => n + (a?.calls ?? 0), 0)} out=${out} audit=${s.audit.ok ? "ok" : s.audit.violations.join("; ")}`);
  }
}
