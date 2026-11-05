#!/usr/bin/env node
/**
 * Check every props table on the docs site against the generated spec.
 *
 * `<PropsTable component="Badge">` reads names, types and defaults from
 * `@once-ui-system/core/ai/spec.json`, so those rows cannot drift. What can:
 *
 * - `describe` prose keyed to a prop the component no longer has, which the
 *   table drops without a word, so the page loses a description silently;
 * - `exclude` naming a prop that is not there;
 * - hand-written `content` rows: a prop that does not exist, or a type or
 *   default the code no longer has;
 * - a page that writes its table by hand for a component the spec knows,
 *   which is how drift starts.
 *
 * Usage: node scripts/check-props.mjs [--json] [--notes] [page-filter]
 */
import { readdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const contentDir = path.join(root, "src", "content");
const require = createRequire(import.meta.url);
const spec = require("@once-ui-system/core/ai/spec.json");

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const filter = args.find((a) => !a.startsWith("--"));

const components = spec.components;
const mixins = spec.mixins ?? {};
const aliases = spec.types ?? {};

// ─── Reading tables out of MDX ──────────────────────────────────────────────

/** Each `<PropsTable … />` on a page, parsed as JSX. */
function tables(text) {
  const out = [];
  for (const m of text.matchAll(/<PropsTable\b/g)) {
    const end = closeOf(text, m.index);
    if (end === -1) continue;
    const source = text.slice(m.index, end);
    const file = ts.createSourceFile(
      "t.tsx",
      `const x = (${source});`,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    let element;
    const find = (n) => {
      if (!element && ts.isJsxSelfClosingElement(n)) element = n;
      ts.forEachChild(n, find);
    };
    find(file);
    if (!element) continue;
    const before = text.slice(0, m.index);
    const heading =
      [...before.matchAll(/^#+\s+(.+)$/gm)].at(-1)?.[1].replace(/`/g, "").trim() ?? "";
    out.push({ line: before.split("\n").length, heading, attrs: attributes(element) });
  }
  return out;
}

/** Index just past the `/>` that closes the tag opened at `start`. */
function closeOf(text, start) {
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"' || ch === "'" || ch === "`") {
      const close = text.indexOf(ch, i + 1);
      if (close === -1) return -1;
      i = close;
    } else if (ch === "{") depth++;
    else if (ch === "}") depth--;
    else if (ch === "/" && text[i + 1] === ">" && depth === 0) return i + 2;
  }
  return -1;
}

/** Attribute values as plain data, where they are literals. */
function attributes(element) {
  const out = {};
  for (const attr of element.attributes.properties) {
    if (!ts.isJsxAttribute(attr)) continue;
    const name = attr.name.getText();
    const init = attr.initializer;
    if (!init) out[name] = true;
    else if (ts.isStringLiteral(init)) out[name] = init.text;
    else if (ts.isJsxExpression(init) && init.expression) out[name] = literal(init.expression);
  }
  return out;
}

const UNKNOWN = Symbol("unknown");

function literal(node) {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(literal);
  if (ts.isObjectLiteralExpression(node)) {
    const out = {};
    for (const p of node.properties) {
      if (ts.isPropertyAssignment(p) || ts.isShorthandPropertyAssignment(p)) {
        const key = p.name.getText().replace(/^["']|["']$/g, "");
        out[key] = ts.isPropertyAssignment(p) ? literal(p.initializer) : UNKNOWN;
      }
    }
    return out;
  }
  return UNKNOWN; // JSX, a template with a value: prose, not data
}

// ─── Spec rows ──────────────────────────────────────────────────────────────

/** `"a" | "b" = a` into its parts, the way PropsTable reads it. */
function parseSpec(raw) {
  let rest = raw;
  const required = rest.startsWith("!");
  if (required) rest = rest.slice(1);
  let def;
  const split = rest.lastIndexOf(" = ");
  if (split !== -1) {
    def = rest.slice(split + 3).trim();
    rest = rest.slice(0, split);
  }
  return { type: rest.trim(), def, required };
}

/** Every prop a component takes: its own, its mixins', and what it extends. */
function allProps(name, seen = new Set()) {
  if (seen.has(name)) return {};
  seen.add(name);
  const entry = components[name];
  if (!entry) return {};
  const props = {};
  const ext = Array.isArray(entry.extends) ? entry.extends : entry.extends ? [entry.extends] : [];
  for (const base of ext) Object.assign(props, allProps(base, seen));
  for (const m of entry.mixins ?? []) Object.assign(props, mixins[m] ?? {});
  Object.assign(props, entry.props ?? {});
  return props;
}

/** The literal members of a type, if it is a union of them (aliases expanded). */
function members(type) {
  const alias = aliases[type];
  if (Array.isArray(alias)) return alias.map((m) => String(m).replace(/^"|"$/g, ""));
  const parts = splitUnion(type);
  if (parts.length < 2) return null;
  const out = [];
  for (const p of parts) {
    const expanded = members(p);
    if (expanded) out.push(...expanded);
    else out.push(p.replace(/^"|"$/g, ""));
  }
  return out;
}

function splitUnion(type) {
  const out = [];
  let depth = 0;
  let quote = null;
  let start = 0;
  for (let i = 0; i < type.length; i++) {
    const ch = type[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if ("<{([".includes(ch)) depth++;
    else if (">})]".includes(ch)) depth--;
    else if (ch === "|" && depth === 0) {
      out.push(type.slice(start, i).trim());
      start = i + 1;
    }
  }
  out.push(type.slice(start).trim());
  return out.filter(Boolean);
}

/** Defaults written as `"m"`, `'m'`, `m` or `-` compare equal. */
const normDefault = (d) =>
  d === undefined || d === null || d === "-" || d === "" || d === "undefined"
    ? undefined
    : String(d)
        .trim()
        .replace(/^["'`]|["'`]$/g, "");

// ─── Checks ─────────────────────────────────────────────────────────────────

/** `github: "components/Badge.tsx"` → `Badge`, when the spec knows it. */
function pageComponent(text) {
  const github = /^github:\s*"([^"]+)"/m.exec(text)?.[1];
  const base = github && path.basename(github).replace(/\.(tsx?|jsx?)$/, "");
  return base && components[base] ? base : undefined;
}

const UNIVERSAL = new Set(["children", "className", "style", "ref", "id", "key"]);

/**
 * DOM attributes. In 3.0 a component passes them through to its element
 * (`aria-label`, a native `onChange`, `name`), and the spec, which leaves
 * out what the DOM supplies, does not list them: a hand-written row for one
 * is fine.
 */
const isDomAttribute = (name) =>
  /^(aria|data)-/.test(name) || /^on[A-Z]/.test(name) || name === "name";

function checkRow(row, props, owner, report) {
  if (!Array.isArray(row) || typeof row[0] !== "string") return;
  const [name, type, def] = row;
  // The spec leaves out what every element takes; a row for one is fine.
  if (name.startsWith("...") || UNIVERSAL.has(name)) return;
  const raw = props[name];
  if (raw === undefined && isDomAttribute(name)) return;
  if (raw === undefined) {
    report(`documents \`${name}\`, which ${owner} does not take`);
    return;
  }
  const actual = parseSpec(raw);

  const writtenDefault = normDefault(def === UNKNOWN ? undefined : def);
  const realDefault = normDefault(actual.def);
  // Only two defaults that disagree. A default the spec doesn't record is
  // often real, set in the body rather than the signature (`weight` falls
  // back to `strong` in Heading), so its absence proves nothing.
  if (
    def !== UNKNOWN &&
    writtenDefault !== undefined &&
    realDefault !== undefined &&
    writtenDefault.replace(/["']/g, "") !== realDefault.replace(/["']/g, "")
  ) {
    report(
      `\`${name}\` default is written as ${JSON.stringify(writtenDefault)}; the code has ${JSON.stringify(realDefault)}`,
    );
  }

  // Only a list of literal values is compared: that is where drift bites
  // (a size added, a variant renamed). Free-form type text is left alone.
  const written = Array.isArray(type) ? type.filter((t) => typeof t === "string") : null;
  const real = members(actual.type);
  if (written && real && written.length === (Array.isArray(type) ? type.length : 0)) {
    const missing = real.filter((m) => !written.includes(m) && !written.includes(`"${m}"`));
    const extra = written.filter((w) => !real.includes(w.replace(/^"|"$/g, "")));
    // Written as a type name inside a list ("TShirtSizes", "boolean") rather
    // than literals: too loose to compare.
    const looksLiteral = written.every((w) => !/^[A-Z]|^(string|number|boolean)$/.test(w));
    if (looksLiteral && extra.length) {
      report(
        `\`${name}\` lists ${extra.map((e) => `"${e}"`).join(", ")}, which ${owner} does not accept`,
      );
    }
    if (looksLiteral && missing.length && !extra.length) {
      report(`\`${name}\` leaves out ${missing.map((e) => `"${e}"`).join(", ")}`);
    }
  }
}

function run() {
  const pages = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".mdx")) pages.push(full);
    }
  };
  walk(contentDir);

  const problems = [];
  const notes = [];
  const documented = new Set();

  for (const page of pages) {
    const rel = path.relative(contentDir, page);
    const text = readFileSync(page, "utf8");
    for (const m of text.matchAll(/component="([A-Za-z]+)"/g)) documented.add(m[1]);
    if (filter && !rel.includes(filter)) continue;

    const ownComponent = pageComponent(text);
    const found = tables(text);
    const firstHand = found.findIndex((t) => !t.attrs.component && !t.attrs.mixin);

    found.forEach((table, index) => {
      const { line, attrs } = table;
      const report = (message) => problems.push({ page: rel, line, message });

      if (attrs.component || attrs.mixin) {
        const props = attrs.component ? allProps(attrs.component) : (mixins[attrs.mixin] ?? {});
        const owner = attrs.component ?? attrs.mixin;
        if (attrs.component && !components[attrs.component]) {
          report(`\`${attrs.component}\` is not in ai/spec.json`);
          return;
        }
        const own = attrs.component ? (components[attrs.component].props ?? {}) : props;
        const extra = new Set(
          (Array.isArray(attrs.content) ? attrs.content : []).map((r) => Array.isArray(r) && r[0]),
        );
        if (attrs.describe && attrs.describe !== UNKNOWN) {
          for (const key of Object.keys(attrs.describe)) {
            if (!(key in own) && !extra.has(key)) {
              report(
                key in props
                  ? `describes \`${key}\`, an inherited prop the table does not list; add it to \`content\` or drop the prose`
                  : `describes \`${key}\`, which ${owner} does not take — the prose is never shown`,
              );
            }
          }
        }
        for (const key of Array.isArray(attrs.exclude) ? attrs.exclude : []) {
          if (!(key in own)) report(`excludes \`${key}\`, which ${owner} does not take`);
        }
        for (const row of Array.isArray(attrs.content) ? attrs.content : []) {
          // An override of a generated row, or an extra row: both are claims.
          if (Array.isArray(row) && typeof row[0] === "string" && row[0] in props) {
            checkRow(row, props, owner, report);
          }
        }
        return;
      }

      // A hand-written table belongs to the component its section is named
      // after (`### ThemeInit`), or, under an API heading, to the page's own.
      const rows = Array.isArray(attrs.content) ? attrs.content : [];
      const heading = table.heading;
      const owner = components[heading]
        ? heading
        : /api|props|reference/i.test(heading) && index === firstHand
          ? ownComponent
          : undefined;
      // Which component a hand table describes is a guess from its heading,
      // and a guess shouldn't fail a build: these print as notes.
      if (!owner) return;
      // A section can also hold the shape of an item or a config object
      // (`### Kbar`, then the fields of a KbarItem). Only a table whose rows
      // are mostly the owner's props is about the owner.
      const named = rows.filter(
        (r) => Array.isArray(r) && typeof r[0] === "string" && !r[0].startsWith("..."),
      );
      const known = allProps(owner);
      if (named.filter((r) => r[0] in known || UNIVERSAL.has(r[0])).length * 2 < named.length)
        return;
      const note = (message) => notes.push({ page: rel, line, message });
      note(
        `hand-written; ${owner} is in ai/spec.json, so <PropsTable component="${owner}" /> would keep it in step`,
      );
      const props = allProps(owner);
      for (const row of rows) checkRow(row, props, owner, note);
    });
  }

  // Components the spec has and no page tables.
  const undocumented = Object.keys(components)
    .filter((name) => !documented.has(name))
    .sort();

  if (asJson) {
    process.stdout.write(`${JSON.stringify({ problems, notes, undocumented }, null, 2)}\n`);
  } else {
    for (const p of problems) console.log(`${p.page}:${p.line} ${p.message}`);
    if (args.includes("--notes")) {
      for (const p of notes) console.log(`note ${p.page}:${p.line} ${p.message}`);
    }
    console.log(
      `\n${problems.length} problems, ${notes.length} notes (--notes to list). ${undocumented.length} spec components have no <PropsTable component> on any page${
        undocumented.length ? `: ${undocumented.join(", ")}` : ""
      }.`,
    );
  }
  process.exitCode = problems.length ? 1 : 0;
}

run();
