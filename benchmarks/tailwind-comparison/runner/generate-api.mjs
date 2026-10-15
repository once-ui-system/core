#!/usr/bin/env node
// Full-run generator (METHODOLOGY.md §2–§3): Messages API, identical tools for
// every arm (list_dir/read_file rooted at the arm's sandbox), gates after every
// attempt, capped repair loop in the same conversation. Exact usage per call.
//
//   ANTHROPIC_API_KEY=… node runner/generate-api.mjs --out results/full [--tasks all|3,6,9]
//        [--arms A,B,C,D] [--runs 3] [--dry-run]
//
// Resumable: a run whose run.json says accepted/failed is skipped.

import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { runGates } from "./gates.mjs";
import { WORK, armByLetter, buildPrompt, buildRepairPrompt, config, extractCode, extractFiles, isMulti, taskById, tasks } from "./lib.mjs";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? (process.argv[i + 1]?.startsWith("--") ? true : process.argv[i + 1]) : d;
};
const outDir = path.resolve(arg("out", "results/full"));
const taskIds = arg("tasks", "all") === "all" ? tasks.map((t) => t.id) : String(arg("tasks")).split(",").map(Number);
const arms = String(arg("arms", "A,B,C,D")).split(",");
const runs = Number(arg("runs", config.runs_per_task));
const dryRun = process.argv.includes("--dry-run");

const TOOLS = [
  {
    name: "list_dir",
    description: "List the files and folders in a directory of the workspace. Paths are relative to the workspace root; use \".\" for the root.",
    input_schema: { type: "object", properties: { path: { type: "string" } }, required: ["path"] },
  },
  {
    name: "read_file",
    description: "Read a text file from the workspace. Paths are relative to the workspace root.",
    input_schema: { type: "object", properties: { path: { type: "string" } }, required: ["path"] },
  },
];

function toolResult(sandbox, name, input) {
  const p = path.resolve(sandbox, String(input?.path ?? "."));
  if (p !== sandbox && !p.startsWith(`${sandbox}${path.sep}`)) return { error: "path is outside the workspace" };
  if (!fs.existsSync(p)) return { error: `no such file or directory: ${input.path}` };
  if (name === "list_dir") {
    if (!fs.statSync(p).isDirectory()) return { error: "not a directory" };
    return {
      text: fs
        .readdirSync(p, { withFileTypes: true })
        .map((e) => (e.isDirectory() ? `${e.name}/` : e.name))
        .sort()
        .join("\n"),
    };
  }
  if (fs.statSync(p).isDirectory()) return { error: "is a directory; use list_dir" };
  let text = fs.readFileSync(p, "utf8");
  const max = config.generation.read_file_max_chars;
  if (text.length > max) text = `${text.slice(0, max)}\n…[truncated at ${max} characters]`;
  return { text };
}

async function runOne(client, letter, task, run) {
  const arm = armByLetter(letter);
  const dir = path.join(outDir, "raw", `t${String(task).padStart(2, "0")}`, arm.id, `run${run}`);
  fs.mkdirSync(dir, { recursive: true });
  const statePath = path.join(dir, "run.json");
  if (fs.existsSync(statePath) && ["accepted", "failed"].includes(JSON.parse(fs.readFileSync(statePath, "utf8")).status)) return;

  const sandbox = path.join(WORK, "sandbox", arm.id);
  const multi = isMulti(taskById(task));
  const { system, user } = buildPrompt(letter, task);
  fs.writeFileSync(path.join(dir, "prompt.txt"), `${system}\n\n${user}`);
  const messages = [{ role: "user", content: user }];
  const calls = [];
  const toolLog = [];
  let status = "failed";
  let accepted = null;

  for (let attempt = 0; attempt <= config.repair_rounds; attempt++) {
    let toolCalls = 0;
    let reply = "";
    for (;;) {
      const req = {
        model: config.model,
        system,
        messages,
        tools: TOOLS,
        max_tokens: config.generation.max_tokens,
        thinking: config.generation.thinking,
        output_config: { effort: config.generation.effort },
      };
      let res;
      for (let i = 0; ; i++) {
        try {
          res = await client.messages.create(req);
          break;
        } catch (e) {
          // Infrastructure failure: retry the call (logged); model output is never voided.
          if (i >= 4) throw e;
          calls.push({ attempt, infra_error: String(e?.message ?? e) });
          await new Promise((r) => setTimeout(r, 2000 * 2 ** i));
        }
      }
      calls.push({ attempt, id: res.id, model: res.model, stop_reason: res.stop_reason, usage: res.usage });
      messages.push({ role: "assistant", content: res.content });
      const uses = res.content.filter((b) => b.type === "tool_use");
      if (!uses.length || toolCalls >= config.generation.max_tool_calls_per_attempt) {
        reply = res.content.filter((b) => b.type === "text").map((b) => b.text).join("\n");
        if (uses.length) {
          // Cap reached: answer the pending calls with an error and ask for the file.
          messages.push({
            role: "user",
            content: [
              ...uses.map((u) => ({ type: "tool_result", tool_use_id: u.id, is_error: true, content: "tool-call limit reached" })),
              { type: "text", text: "Tool-call limit reached. Reply now with the complete file." },
            ],
          });
          continue;
        }
        break;
      }
      const results = uses.map((u) => {
        toolCalls++;
        const r = toolResult(sandbox, u.name, u.input);
        toolLog.push({ attempt, name: u.name, path: u.input?.path, chars: r.text?.length ?? 0, error: r.error });
        return { type: "tool_result", tool_use_id: u.id, content: r.text ?? r.error, is_error: Boolean(r.error) };
      });
      messages.push({ role: "user", content: results });
    }
    fs.writeFileSync(path.join(dir, `attempt-${attempt}.reply.md`), reply);
    let code;
    if (multi) {
      // attempt-N.files/ mirrors the paths the model wrote; attempt-N.files.json lists them.
      const { files, rejected } = extractFiles(reply);
      code = files;
      if (files) {
        for (const [f, src] of Object.entries(files)) {
          const p = path.join(dir, `attempt-${attempt}.files`, f);
          fs.mkdirSync(path.dirname(p), { recursive: true });
          fs.writeFileSync(p, src);
        }
      }
      fs.writeFileSync(path.join(dir, `attempt-${attempt}.files.json`), JSON.stringify({ files: Object.keys(files ?? {}), rejected }, null, 2));
    } else {
      code = extractCode(reply);
      if (code) fs.writeFileSync(path.join(dir, `attempt-${attempt}.tsx`), code);
    }
    const g = await runGates(letter, code, path.join(dir, `attempt-${attempt}`), task);
    fs.renameSync(path.join(dir, `attempt-${attempt}`, "gates.json"), path.join(dir, `attempt-${attempt}.gates.json`));
    if (g.passed) {
      status = "accepted";
      accepted = attempt;
      break;
    }
    if (attempt < config.repair_rounds) messages.push({ role: "user", content: buildRepairPrompt(g.failed_gate, g.failure_output, multi) });
  }

  const byAttempt = [];
  for (const c of calls.filter((c) => c.usage)) {
    const a = (byAttempt[c.attempt] ??= { attempt: c.attempt, calls: 0, input_tokens: 0, output_tokens: 0 });
    a.calls++;
    a.input_tokens += c.usage.input_tokens + (c.usage.cache_creation_input_tokens ?? 0) + (c.usage.cache_read_input_tokens ?? 0);
    a.output_tokens += c.usage.output_tokens;
  }
  fs.writeFileSync(path.join(dir, "usage.json"), JSON.stringify({ exact: true, attempts: byAttempt, calls, tool_calls: toolLog }, null, 2));
  fs.writeFileSync(path.join(dir, "transcript.json"), JSON.stringify({ system, messages }, null, 2));
  fs.writeFileSync(statePath, JSON.stringify({ status, accepted_attempt: accepted, repair_rounds: accepted, attempts: byAttempt.length }, null, 2));
  console.log(`t${task} ${arm.id} run${run}: ${status}${accepted != null ? ` (repairs ${accepted})` : ""}`);
}

if (dryRun) {
  const { system, user } = buildPrompt(arms[0], taskIds[0]);
  console.log(JSON.stringify({ model: config.model, generation: config.generation, tools: TOOLS, system, user }, null, 2));
  console.log(`\nwould run ${taskIds.length} tasks × ${arms.length} arms × ${runs} runs = ${taskIds.length * arms.length * runs}`);
  process.exit(0);
}
// --mock: self-test of the loop, tools, extraction, gates and bookkeeping with a
// scripted client (no API calls). Writes to work/mock-results; never to results/.
function mockClient() {
  let n = 0;
  const page = `import { Column, Heading, Text } from "@once-ui-system/core";\nexport default function Page() {\n  return (\n    <Column as="main" fillWidth padding="40" gap="16">\n      <Heading>Mock page for the runner self-test</Heading>\n      <Text>This page only checks that the generation loop and the gates work end to end.</Text>\n    </Column>\n  );\n}\n`;
  const usage = { input_tokens: 100, output_tokens: 10 };
  // A multi-file task gets a two-route app: a shared component and two pages.
  const reply = isMulti(taskById(taskIds[0]))
    ? [
        "```tsx components/Panel.tsx\nimport { Column, Text } from \"@once-ui-system/core\";\nexport function Panel({ label }: { label: string }) {\n  return (\n    <Column padding=\"24\" gap=\"8\" border radius=\"l\">\n      <Text>{label}: a panel shared by both routes of the runner self-test app.</Text>\n    </Column>\n  );\n}\n```",
        "```tsx app/page.tsx\n" + page.replace("<Text>", "<Panel label=\"Home\" />\n      <Text>").replace('import { Column', 'import { Panel } from "@/components/Panel";\nimport { Column') + "```",
        "```tsx app/settings/page.tsx\n" + page.replace("<Text>", "<Panel label=\"Settings\" />\n      <Text>").replace('import { Column', 'import { Panel } from "@/components/Panel";\nimport { Column') + "```",
      ].join("\n\n")
    : "```tsx\n" + page + "```";
  return {
    messages: {
      create: async () =>
        n++ % 2 === 0
          ? { id: `mock${n}`, model: "mock", stop_reason: "tool_use", usage, content: [{ type: "tool_use", id: `tu${n}`, name: "read_file", input: { path: "project/app/layout.tsx" } }] }
          : { id: `mock${n}`, model: "mock", stop_reason: "end_turn", usage, content: [{ type: "text", text: reply }] },
    },
  };
}
if (process.argv.includes("--mock")) {
  if (!outDir.includes(`${path.sep}work${path.sep}`)) throw new Error("--mock must write under work/");
  await runOne(mockClient(), arms[0], taskIds[0], 1);
  process.exit(0);
}
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY is not set. The full run needs exact API usage counts; see METHODOLOGY.md §6.");
  process.exit(2);
}
const client = new Anthropic({
  // v2 asks for 32k max_tokens; an explicit timeout lets non-streaming calls that long through the SDK guard.
  timeout: 20 * 60 * 1000,
  ...(process.env.ANTHROPIC_WORKSPACE_ID ? { defaultHeaders: { "anthropic-workspace-id": process.env.ANTHROPIC_WORKSPACE_ID } } : {}),
});
// Arms run in parallel (one gate working copy each); runs within an arm are sequential.
await Promise.all(
  arms.map(async (letter) => {
    for (const task of taskIds) for (let run = 1; run <= runs; run++) await runOne(client, letter, task, run);
  }),
);
