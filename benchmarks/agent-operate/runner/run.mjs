// node runner/run.mjs [--n 3] [--arms bridge,browser] [--tasks settings,danger] [--model claude-opus-5-5]
// Runs each task in each arm n times on a fresh page and writes
// results/<model>/<task>-<arm>-<i>.json. Needs BENCHMARK_ANTHROPIC_API_KEY
// (and ANTHROPIC_WORKSPACE_ID when the key is not workspace-scoped).
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import { arms } from "./arms.mjs";
import { openPage } from "./page.mjs";
import { tasks } from "./tasks.mjs";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((pairs, word, i, all) => {
    if (word.startsWith("--")) pairs.push([word.slice(2), all[i + 1]]);
    return pairs;
  }, []),
);
const n = Number(args.n ?? 3);
const model = args.model ?? "claude-opus-5-5";
const armIds = (args.arms ?? "bridge,browser").split(",");
const taskIds = (args.tasks ?? tasks.map((t) => t.id).join(",")).split(",");
const MAX_TURNS = 40;

// $ per million tokens: input, output, cache read, cache write (5 min).
const PRICES = {
  "claude-opus-5-5": [4, 20, 0.2, 5],
  "claude-sonnet-5-5": [2, 10, 0.1, 2.5],
  "claude-haiku-5-5": [0.1, 0.5, 0.01, 0.125],
};

const client = new Anthropic({
  apiKey: process.env.BENCHMARK_ANTHROPIC_API_KEY ?? process.env.ANTHROPIC_API_KEY,
  ...(process.env.ANTHROPIC_WORKSPACE_ID
    ? { defaultHeaders: { "anthropic-workspace-id": process.env.ANTHROPIC_WORKSPACE_ID } }
    : {}),
});

const SYSTEM =
  "You operate a web app for the person through the tools you have. The app is open on its settings page. Do what the person asks, then reply in one or two sentences saying what you changed and anything you could not do.";

async function runOnce(task, armId) {
  const arm = arms[armId];
  const { page, errors, close } = await openPage();
  const messages = [{ role: "user", content: task.prompt }];
  const usage = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 };
  const calls = [];
  let turns = 0;
  let finalText = "";
  let stop = null;
  const started = Date.now();
  try {
    while (turns < MAX_TURNS) {
      turns++;
      const response = await client.messages.create({
        model,
        max_tokens: 16000,
        system: SYSTEM,
        tools: arm.tools,
        cache_control: { type: "ephemeral" },
        messages,
      });
      usage.input += response.usage.input_tokens;
      usage.output += response.usage.output_tokens;
      usage.cacheRead += response.usage.cache_read_input_tokens ?? 0;
      usage.cacheWrite += response.usage.cache_creation_input_tokens ?? 0;
      messages.push({ role: "assistant", content: response.content });
      stop = response.stop_reason;
      const uses = response.content.filter((block) => block.type === "tool_use");
      finalText = response.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("\n");
      if (stop !== "tool_use" || !uses.length) break;
      const results = [];
      for (const use of uses) {
        let content;
        let isError = false;
        try {
          const out = await arm.call(page, use.name, use.input ?? {});
          content = typeof out === "string" ? out : JSON.stringify(out);
        } catch (error) {
          isError = true;
          content = String(error?.message ?? error).split("\n")[0];
        }
        calls.push({ name: use.name, input: use.input, error: isError || undefined, bytes: content.length });
        results.push({
          type: "tool_result",
          tool_use_id: use.id,
          content,
          ...(isError ? { is_error: true } : {}),
        });
      }
      messages.push({ role: "user", content: results });
    }
    const seconds = (Date.now() - started) / 1000;
    const check = await task.check(page, { finalText });
    const [pIn, pOut, pRead, pWrite] = PRICES[model] ?? [0, 0, 0, 0];
    const cost =
      (usage.input * pIn + usage.output * pOut + usage.cacheRead * pRead + usage.cacheWrite * pWrite) / 1e6;
    return {
      task: task.id,
      arm: armId,
      model,
      ...check,
      toolCalls: calls.length,
      turns,
      usage,
      cost,
      seconds,
      stop,
      finalText,
      calls,
      pageErrors: errors,
    };
  } finally {
    await close();
  }
}

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, "..", "results", model);
mkdirSync(outDir, { recursive: true });
let total = 0;
for (const taskId of taskIds) {
  const task = tasks.find((t) => t.id === taskId);
  for (const armId of armIds) {
    for (let i = 1; i <= n; i++) {
      const result = await runOnce(task, armId);
      total += result.cost;
      writeFileSync(path.join(outDir, `${task.id}-${armId}-${i}.json`), `${JSON.stringify(result, null, 2)}\n`);
      console.log(
        `${task.id} ${armId} #${i}: ${result.ok ? "ok" : `FAIL ${result.wrong.join(", ")}`}${result.deleted ? " DELETED" : ""} · ${result.toolCalls} calls · ${result.turns} turns · $${result.cost.toFixed(3)} · ${result.seconds.toFixed(0)} s`,
      );
    }
  }
}
console.log(`total $${total.toFixed(2)}`);
