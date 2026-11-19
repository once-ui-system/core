#!/usr/bin/env node
/**
 * Once UI's MCP server, over stdio.
 *
 * It answers from the `ai/` folder of the package it ships in, so what an
 * agent reads matches the version installed: no network, nothing hosted.
 *
 *   {
 *     "mcpServers": {
 *       "once-ui": { "command": "npx", "args": ["-y", "-p", "@once-ui-system/core", "once-ui-mcp"] }
 *     }
 *   }
 *
 * Tools: search_components, get_component, get_type, get_task, get_rules and
 * validate_code (the checks of once-ui-validate-ai-code). The protocol is
 * JSON-RPC 2.0, one message per line, so it needs no SDK.
 */

const fs = require("node:fs");
const path = require("node:path");
const readline = require("node:readline");
const { validate, loadSpec, parseIconNames } = require("./validate-ai-code.cjs");

const ROOT = path.join(__dirname, "..");
const AI = path.join(ROOT, "ai");
const PROTOCOL_VERSIONS = ["2025-06-18", "2025-03-26", "2024-11-05"];

const read = (file) => fs.readFileSync(path.join(AI, file), "utf8");
const readJson = (file) => JSON.parse(read(file));
const version = () => JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8")).version;

let cache;
/** The harness files, read once, on first use. */
function harness() {
  if (cache) return cache;
  const spec = loadSpec();
  const manifest = readJson("manifest.json");
  const catalog = readJson("catalog.json").components ?? {};
  const gotchas = readJson("gotchas.json");
  const tasks = readJson("tasks/index.json").tasks ?? [];
  // Which entry point exports each name; everything else is the root.
  const importOf = new Map();
  for (const [entry, info] of Object.entries(manifest.imports ?? {})) {
    for (const name of info.exports ?? []) importOf.set(name, entry);
  }
  cache = { spec, manifest, catalog, gotchas, tasks, importOf, iconNames: parseIconNames(spec) };
  return cache;
}

function componentNames() {
  const { spec, catalog } = harness();
  return [...new Set([...Object.keys(spec.components ?? {}), ...Object.keys(catalog)])].sort();
}

/** The name as the spec spells it, matched without regard to case. */
function canonical(name, names) {
  const wanted = String(name ?? "")
    .trim()
    .toLowerCase();
  return names.find((n) => n.toLowerCase() === wanted) ?? null;
}

/** Names closest to a miss, for "did you mean". */
function closest(name, names, count = 5) {
  const wanted = String(name ?? "").toLowerCase();
  return names
    .map((n) => ({ n, score: similarity(wanted, n.toLowerCase()) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ n }) => n);
}

function similarity(a, b) {
  if (b.includes(a) || a.includes(b)) return 1;
  const grams = (s) =>
    new Set(Array.from({ length: Math.max(s.length - 1, 1) }, (_, i) => s.slice(i, i + 2)));
  const ga = grams(a);
  const gb = grams(b);
  let shared = 0;
  for (const g of ga) if (gb.has(g)) shared++;
  return (2 * shared) / (ga.size + gb.size);
}

function searchComponents({ query, limit = 8 }) {
  const { spec, catalog, importOf } = harness();
  const words = String(query ?? "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
  if (!words.length) throw new UserError('Pass a query, such as "date range picker" or "toast".');
  const scored = componentNames().map((name) => {
    const entry = spec.components?.[name] ?? {};
    const purpose = catalog[name]?.purpose ?? "";
    const lowerName = name.toLowerCase();
    const haystack =
      `${purpose} ${(entry.tags ?? []).join(" ")} ${entry.group ?? ""}`.toLowerCase();
    let score = 0;
    for (const word of words) {
      if (lowerName === word) score += 10;
      else if (lowerName.includes(word)) score += 5;
      if (new RegExp(`\\b${word}`).test(haystack)) score += 2;
    }
    return { name, score, purpose, from: importOf.get(name) ?? "@once-ui-system/core" };
  });
  const hits = scored
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, Math.min(Number(limit) || 8, 25));
  if (!hits.length)
    return `No component matches "${query}". Try other words, or get_task for a whole page.`;
  return hits.map((c) => `${c.name} (${c.from}): ${c.purpose || "no description"}`).join("\n");
}

function getComponent({ name }) {
  const { spec, catalog, gotchas, importOf } = harness();
  const names = componentNames();
  const found = canonical(name, names);
  if (!found) {
    throw new UserError(
      `There is no component "${name}". Closest: ${closest(name, names).join(", ")}.`,
    );
  }
  const entry = spec.components?.[found] ?? {};
  const from = importOf.get(found) ?? "@once-ui-system/core";
  const lines = [`# ${found}`, ""];
  if (catalog[found]?.purpose) lines.push(catalog[found].purpose, "");
  lines.push("```tsx", `import { ${found} } from "${from}";`, "```", "");
  const props = Object.entries(entry.props ?? {});
  if (props.length) {
    lines.push("## Props", "", "`!` marks a required prop; `= x` is the default.", "");
    for (const [prop, type] of props) lines.push(`- ${prop}: ${type}`);
    lines.push("");
  }
  const inherited = [...(entry.extends ?? []), ...(entry.mixins ?? [])];
  if (inherited.length) {
    lines.push(
      `Also takes the props of ${inherited.join(", ")}. get_type with one of those names lists them.`,
      "",
    );
  }
  if (entry.pairsWith?.length) lines.push(`Pairs with: ${entry.pairsWith.join(", ")}.`, "");
  const notes = Object.entries(gotchas).filter(
    ([key, g]) => g.components?.includes(found) || key.startsWith(`${found}.`),
  );
  if (notes.length) {
    lines.push("## Gotchas", "");
    for (const [, g] of notes) lines.push(`- ${g.rule}`);
  }
  return lines.join("\n").trim();
}

/** A type alias or mixin, resolved to what it allows. */
function getType({ name }) {
  const { spec } = harness();
  const pools = { ...(spec.types ?? {}), ...(spec.tokens ?? {}) };
  const mixins = spec.mixins ?? {};
  const all = [...Object.keys(pools), ...Object.keys(mixins)];
  if (/^iconname$/i.test(String(name).trim())) {
    return `# IconName\n\nThe icons the package ships (an app can register more with IconProvider):\n${[...harness().iconNames].sort().join(", ")}`;
  }
  const found = canonical(name, all);
  if (!found)
    throw new UserError(`There is no type "${name}". Closest: ${closest(name, all).join(", ")}.`);
  if (mixins[found]) {
    return [
      `# ${found}`,
      "",
      ...Object.entries(mixins[found]).map(([p, t]) => `- ${p}: ${t}`),
    ].join("\n");
  }
  const show = (value) =>
    typeof value === "string"
      ? value
      : Array.isArray(value)
        ? value.map((v) => JSON.stringify(v)).join(" | ")
        : JSON.stringify(value, null, 2);
  const lines = [`# ${found}`, "", show(pools[found])];
  // The aliases it is built from, one level down: `TShirtSizes` reads
  // `CondensedTShirtSizes | "xs" | "xl"`, which says little on its own.
  const parts = Object.keys(pools).filter(
    (other) => other !== found && new RegExp(`\\b${other}\\b`).test(show(pools[found])),
  );
  for (const part of parts) lines.push("", `${part}: ${show(pools[part])}`);
  return lines.join("\n");
}

function getTask({ task }) {
  const { tasks } = harness();
  const list = tasks.map((t) => {
    try {
      const info = readJson(t.file);
      return { id: t.id, title: info.title, description: info.description };
    } catch {
      return { id: t.id };
    }
  });
  const found =
    task &&
    canonical(
      task,
      list.map((t) => t.id),
    );
  if (!found) {
    const intro = task ? `There is no task "${task}". ` : "";
    return `${intro}Tasks (pass one as \`task\` for its components, recipe and worked example):\n${list
      .map(
        (t) =>
          `- ${t.id}${t.title ? `: ${t.title}` : ""}${t.description ? ` (${t.description})` : ""}`,
      )
      .join("\n")}`;
  }
  return read(`bundles/${found}.md`);
}

function getRules({ full = false }) {
  return read(full ? "rules.md" : "rules.compact.md");
}

function validateCode({ code, next }) {
  if (typeof code !== "string" || !code.trim())
    throw new UserError("Pass the code to check as `code`.");
  const { spec, iconNames } = harness();
  const isNext = typeof next === "boolean" ? next : /from\s+["']next(\/[\w-]+)?["']/.test(code);
  const issues = validate(code, spec, iconNames, { next: isNext });
  if (!issues.length) return "No mechanical issues found.";
  return [
    `${issues.length} issue${issues.length === 1 ? "" : "s"}:`,
    ...issues.map((issue) => `- [${issue.rule}] ${issue.message}`),
  ].join("\n");
}

class UserError extends Error {}

const TOOLS = [
  {
    name: "search_components",
    description:
      'Find Once UI components for a need, by name or purpose ("date range", "toast", "sidebar nav"). Returns names, the entry point to import from, and what each is for.',
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "What the component should do, or part of its name" },
        limit: { type: "number", description: "How many to return (default 8, at most 25)" },
      },
      required: ["query"],
    },
    run: searchComponents,
  },
  {
    name: "get_component",
    description:
      "A Once UI component's import, props with their types and defaults, what it pairs with, and its gotchas. Read this before using a component.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "The component, such as Button or DatePicker" },
      },
      required: ["name"],
    },
    run: getComponent,
  },
  {
    name: "get_type",
    description:
      "What a Once UI type or prop group allows: a token type (SpacingToken, TShirtSizes, Tone) or a mixin a component inherits (FlexProps, SpacingProps).",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"],
    },
    run: getType,
  },
  {
    name: "get_task",
    description:
      "A bundle for building a whole page (pricing, dashboard, settings, auth…): the components, recipes and a worked example. Without `task`, lists the tasks.",
    inputSchema: {
      type: "object",
      properties: { task: { type: "string", description: "A task id from the list" } },
    },
    run: getTask,
  },
  {
    name: "get_rules",
    description:
      "The rules generated Once UI code must follow: layout, spacing, tokens, imports. Compact by default; `full` for the long version with reasons.",
    inputSchema: {
      type: "object",
      properties: { full: { type: "boolean" } },
    },
    run: getRules,
  },
  {
    name: "validate_code",
    description:
      "Check Once UI code for mechanical mistakes: props that don't exist, 2.x names, literal colours, unknown icons, rules the docs state. Run it on code before handing it over.",
    inputSchema: {
      type: "object",
      properties: {
        code: { type: "string", description: "A TSX/JSX file's source" },
        next: {
          type: "boolean",
          description: "Whether the file is in a Next.js app (default: it imports from next)",
        },
      },
      required: ["code"],
    },
    run: validateCode,
  },
];

/** One JSON-RPC message in, its response out (null for a notification). */
function handle(message) {
  const { id, method, params = {} } = message ?? {};
  const isRequest = id !== undefined && id !== null;
  const result = (value) => (isRequest ? { jsonrpc: "2.0", id, result: value } : null);
  const error = (code, text) =>
    isRequest ? { jsonrpc: "2.0", id, error: { code, message: text } } : null;

  switch (method) {
    case "initialize": {
      const asked = params.protocolVersion;
      return result({
        protocolVersion: PROTOCOL_VERSIONS.includes(asked) ? asked : PROTOCOL_VERSIONS[0],
        capabilities: { tools: {} },
        serverInfo: { name: "once-ui", title: "Once UI", version: version() },
        instructions: `Once UI ${version()}. Before writing UI, call get_rules once, search_components for what you need, and get_component for each component you use. For a whole page, get_task. Run validate_code on the result.`,
      });
    }
    case "ping":
      return result({});
    case "tools/list":
      return result({
        tools: TOOLS.map(({ name, description, inputSchema }) => ({
          name,
          description,
          inputSchema,
        })),
      });
    case "tools/call": {
      const tool = TOOLS.find((t) => t.name === params.name);
      if (!tool) return error(-32602, `Unknown tool: ${params.name}`);
      try {
        return result({ content: [{ type: "text", text: tool.run(params.arguments ?? {}) }] });
      } catch (e) {
        const text = e instanceof UserError ? e.message : `Failed: ${e?.message ?? e}`;
        return result({ content: [{ type: "text", text }], isError: true });
      }
    }
    default:
      if (!isRequest) return null; // notifications/initialized and the like
      return error(-32601, `Method not found: ${method}`);
  }
}

function main() {
  const input = readline.createInterface({ input: process.stdin });
  const send = (response) => {
    if (response) process.stdout.write(`${JSON.stringify(response)}\n`);
  };
  input.on("line", (line) => {
    if (!line.trim()) return;
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
      return;
    }
    if (Array.isArray(message)) {
      const responses = message.map(handle).filter(Boolean);
      if (responses.length) send(responses);
    } else {
      send(handle(message));
    }
  });
}

// Importable for tests; the server runs only when this file is invoked directly.
if (require.main === module) main();

module.exports = { handle, TOOLS };
