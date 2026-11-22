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
 * Tools: search_components, get_component, get_type, get_task, get_rules,
 * validate_code (the checks of once-ui-validate-ai-code) and get_brand (the
 * app's own brand, read from its files). The protocol is
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

/* ------------------------------------------------------------------ brand */

const CONFIG_FILES = [
  "src/resources/once-ui.config.js",
  "src/resources/once-ui.config.ts",
  "src/resources/once-ui.config.mjs",
  "once-ui.config.js",
  "once-ui.config.ts",
  "once-ui.config.mjs",
];

/** Logo, icon and mascot files the brand kit and Stack write, in the order an agent wants them. */
const BRAND_FILES = [
  "public/trademarks/icon-light.svg",
  "public/trademarks/icon-dark.svg",
  "public/trademarks/wordmark-light.svg",
  "public/trademarks/wordmark-dark.svg",
  "public/brand/mark-brand.svg",
  "public/brand/mark-black.svg",
  "public/brand/mark-white.svg",
  "public/brand/lockup-light.svg",
  "public/brand/lockup-dark.svg",
  "assets/mark-brand.svg",
  "assets/wordmark-brand.svg",
  "assets/lockup-light.svg",
  "assets/lockup-dark.svg",
  "src/app/icon.svg",
  "src/app/favicon.ico",
  "src/app/apple-icon.png",
];

const MASCOT_FILES = [
  "src/components/AppMascot.tsx",
  "src/components/AppMascot.jsx",
  "src/app/components/AppMascot.tsx",
];

const STYLE_KEYS = [
  "theme",
  "defaultTheme",
  "neutral",
  "brand",
  "brandSeed",
  "accent",
  "accentSeed",
  "solid",
  "solidStyle",
  "border",
  "surface",
  "pageBackground",
  "surfaceBackground",
  "scaling",
];

const HEX = /^#[0-9a-f]{6}$/i;

/** The body of `const <name> = { … }`, braces balanced, or null. */
function objectBody(source, name) {
  const start = source.search(new RegExp(`(?:const|let|var)\\s+${name}\\s*(?::[^=]+)?=\\s*\\{`));
  if (start === -1) return null;
  const open = source.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}" && --depth === 0) return source.slice(open + 1, i);
  }
  return null;
}

/** `key: "value"` pairs at the top level of an object body (strings only). */
function stringFields(body, keys) {
  const out = {};
  if (!body) return out;
  for (const key of keys) {
    const match = body.match(
      new RegExp(`(?:^|[\\s,{])["']?${key}["']?\\s*:\\s*(["'\`])([^"'\`\\n]*)\\1`),
    );
    if (match) out[key] = match[2];
  }
  return out;
}

/** The family each font variant loads: `const heading = Space_Grotesk({` → "Space Grotesk". */
function configFonts(source) {
  const families = {};
  const re =
    /const\s+(\w+)\s*=\s*([A-Z][A-Za-z0-9_]*)\s*\(\s*\{[^}]*variable:\s*["']--font-(\w+)["']/g;
  for (let m = re.exec(source); m; m = re.exec(source)) {
    families[m[3]] = m[2].replace(/_/g, " ");
  }
  return families;
}

/** The JSON the kit writes into `src/brand/brand.ts`, without the mark's paths. */
function kitIdentity(source) {
  const at = source.search(/export\s+const\s+brand\b[^=]*=\s*\{/);
  if (at === -1) return null;
  const open = source.indexOf("{", at);
  const close = source.lastIndexOf("}");
  try {
    const identity = JSON.parse(source.slice(open, close + 1));
    const { mark, wordmark, ...rest } = identity;
    return { ...rest, hasMark: Boolean(mark), hasWordmark: Boolean(wordmark) };
  } catch {
    return null;
  }
}

function firstExisting(dir, files) {
  return files.find((file) => fs.existsSync(path.join(dir, file))) ?? null;
}

function getBrand({ dir } = {}) {
  const root = path.resolve(String(dir || process.cwd()));
  if (!fs.existsSync(root)) throw new UserError(`There is no folder ${root}.`);
  const readIn = (file) => fs.readFileSync(path.join(root, file), "utf8");

  const configFile = firstExisting(root, CONFIG_FILES);
  const config = configFile ? readIn(configFile) : "";
  const style = stringFields(objectBody(config, "style"), STYLE_KEYS);
  const schema = stringFields(objectBody(config, "schema"), ["name", "description"]);
  const fonts = configFonts(config);
  const kitFile = firstExisting(root, ["src/brand/brand.ts", "src/brand/brand.js"]);
  const kit = kitFile ? kitIdentity(readIn(kitFile)) : null;
  const files = BRAND_FILES.filter((file) => fs.existsSync(path.join(root, file)));
  const mascotFile = firstExisting(root, MASCOT_FILES);
  const mascotSeed = mascotFile
    ? readIn(mascotFile).match(/MASCOT_SEED\s*=\s*["']([^"']+)["']/)?.[1]
    : null;

  if (!configFile && !kit && !files.length) {
    throw new UserError(
      `No brand found in ${root}: no once-ui.config, no src/brand/brand.ts, no logo files in public/trademarks. Pass \`dir\` as the app's root, or make a brand at https://once-ui.com/brand-kit.`,
    );
  }

  const name = kit?.name ?? schema.name ?? null;
  const hex = kit?.brand ?? (HEX.test(style.brandSeed ?? "") ? style.brandSeed : null);
  const lines = [`# Brand${name ? `: ${name}` : ""}`, ""];
  if (kit?.tagline) lines.push(kit.tagline, "");

  lines.push("## Colour", "");
  if (style.brand)
    lines.push(
      `- brand scheme: ${style.brand}${style.brandSeed ? ` (seed ${style.brandSeed})` : ""}`,
    );
  if (style.accent)
    lines.push(
      `- accent scheme: ${style.accent}${style.accentSeed ? ` (seed ${style.accentSeed})` : ""}`,
    );
  if (style.neutral) lines.push(`- neutral: ${style.neutral}`);
  if (hex)
    lines.push(`- brand colour: ${hex}${kit?.partner ? `, glow partner ${kit.partner}` : ""}`);
  for (const key of [
    "theme",
    "defaultTheme",
    "solid",
    "solidStyle",
    "border",
    "surface",
    "pageBackground",
    "surfaceBackground",
  ]) {
    if (style[key]) lines.push(`- ${key}: ${style[key]}`);
  }
  if (kit?.brand && style.brand && style.brand !== "custom") {
    lines.push(
      "",
      `The config uses the nearest scheme (${style.brand}), not the exact colour. For ${kit.brand} itself, set \`brand: "custom", brandSeed: "${kit.brand}"\` in \`style\`.`,
    );
  }
  lines.push("");

  const families = { ...fonts };
  if (kit?.font && !families.heading) families.heading = kit.font;
  if (Object.keys(families).length) {
    lines.push("## Type", "");
    for (const [variant, family] of Object.entries(families)) lines.push(`- ${variant}: ${family}`);
    lines.push("");
  }

  lines.push("## Logo and icons", "");
  if (files.length) for (const file of files) lines.push(`- ${file}`);
  else lines.push("- none in public/trademarks or public/brand");
  const light = files.find((f) => f.endsWith("icon-light.svg"));
  const dark = files.find((f) => f.endsWith("icon-dark.svg"));
  const wordLight = files.find((f) => f.endsWith("wordmark-light.svg"));
  const wordDark = files.find((f) => f.endsWith("wordmark-dark.svg"));
  const src = (file) => `/${file.replace(/^public\//, "")}`;
  if (light && dark) {
    const word =
      wordLight && wordDark
        ? ` wordmark={{ light: "${src(wordLight)}", dark: "${src(wordDark)}" }}`
        : "";
    lines.push(
      "",
      "```tsx",
      `<Logo icon={{ light: "${src(light)}", dark: "${src(dark)}" }}${word} href="/" />`,
      "```",
    );
  } else if (name) {
    lines.push("", "```tsx", `<Logo text=${JSON.stringify(name)} monogram href="/" />`, "```");
  }
  lines.push("");

  if (mascotFile) {
    lines.push(
      "## Mascot",
      "",
      `- \`<AppMascot />\` from ${mascotFile}${mascotSeed ? ` (seed ${mascotSeed})` : ""}. Use it as an EmptyState's \`visual\`; never draw another.`,
      "",
    );
  }

  lines.push(
    "## Using it",
    "",
    '- Colour comes from tokens only: `brand-*` for the product\'s own colour (`onBackground="brand-medium"`, `background="brand-alpha-weak"`, `tone="brand"` on Button and Tag), `accent-*` for the second colour. Never write the hex in a component.',
    "- Change the brand in `style` (and `fonts`) in the config, not per component.",
    "- The logo is `<Logo>` with the files above; never an `Icon` and `Text` side by side.",
    "",
    `Read from ${root}${configFile ? ` (${configFile}${kitFile ? `, ${kitFile}` : ""})` : kitFile ? ` (${kitFile})` : ""}.`,
  );
  return lines.join("\n").trim();
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
  {
    name: "get_brand",
    description:
      "The app's own brand, read from its files: brand and accent schemes, exact colour, fonts, the logo files with the <Logo> to render them, and the mascot. Call it before choosing colours, a logo or type, so the UI uses the brand instead of inventing one.",
    inputSchema: {
      type: "object",
      properties: {
        dir: {
          type: "string",
          description: "The app's root folder (default: the folder the server runs in)",
        },
      },
    },
    run: getBrand,
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
        instructions: `Once UI ${version()}. Before writing UI, call get_rules once, search_components for what you need, and get_component for each component you use. For a whole page, get_task. In an app, call get_brand before picking colours, type or a logo. Run validate_code on the result.`,
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
