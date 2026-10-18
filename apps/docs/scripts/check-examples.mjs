#!/usr/bin/env node
/**
 * Typecheck every example on the docs site against the real components.
 *
 * A docs page shows each example twice: the live `preview={…}` JSX, which the
 * page renders, and the `code:` string, which readers copy. Neither is ever
 * compiled by `tsc`: the preview lives inside MDX and the code is a string. So
 * a renamed prop or a wrong value stays on the page until someone pastes it
 * and their build breaks. Agents learn from these pages too.
 *
 * This pulls both out of every page under src/content, wraps each in a small
 * TSX module, and typechecks them in memory against the built package — the
 * same types a reader installs. Names an example uses without declaring (the
 * `items` array, an `onChange` handler) become `any`, so what is left is what
 * matters: unknown components, unknown props, and values a prop doesn't take.
 *
 * Usage: node scripts/check-examples.mjs [--json] [page-filter]
 */
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const contentDir = path.join(root, "src", "content");
const virtualDir = path.join(root, "src", "__examples__");

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const filter = args.find((a) => !a.startsWith("--"));

// ─── The names a page can use ───────────────────────────────────────────────

/**
 * The previews render through `src/product/mdx.tsx`, so the names in scope are
 * exactly what it imports. Reading its import statements keeps this list from
 * drifting: add a component there and it is in scope here.
 */
function scopeImports() {
  const source = readFileSync(path.join(root, "src", "product", "mdx.tsx"), "utf8");
  const file = ts.createSourceFile(
    "mdx.tsx",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const byName = new Map();
  for (const stmt of file.statements) {
    if (!ts.isImportDeclaration(stmt) || stmt.importClause?.isTypeOnly) continue;
    const from = stmt.moduleSpecifier.text;
    if (!from.startsWith("@once-ui-system") && !from.startsWith("@/product")) continue;
    const bindings = stmt.importClause?.namedBindings;
    if (!bindings || !ts.isNamedImports(bindings)) continue;
    for (const el of bindings.elements) {
      if (el.isTypeOnly) continue;
      byName.set(el.name.text, { from, imported: (el.propertyName ?? el.name).text });
    }
  }
  // Aliases the MDX map adds on top of its imports.
  byName.set("ServerFlex", { from: "@once-ui-system/core", imported: "ClientFlex" });
  byName.set("ServerGrid", { from: "@once-ui-system/core", imported: "ClientGrid" });
  return byName;
}

const SCOPE = scopeImports();

/**
 * What a reader can import: every name each public entry point of the package
 * exports, plus the components only reachable on `./components/*`. A copied
 * snippet without import lines gets them from here, as the reader's editor
 * would add them; the preview scope above is the narrower thing the page has.
 */
function packageExports() {
  const pkgDir = path.resolve(root, "..", "..", "packages", "core");
  const pkg = JSON.parse(readFileSync(path.join(pkgDir, "package.json"), "utf8"));
  const entries = [];
  for (const [key, value] of Object.entries(pkg.exports)) {
    const types = typeof value === "string" ? value : value.types;
    if (!types?.endsWith(".d.ts") || key.includes("*")) continue;
    entries.push([
      `@once-ui-system/core${key === "." ? "" : key.slice(1)}`,
      path.join(pkgDir, types),
    ]);
  }
  const componentsDir = path.join(pkgDir, "dist", "components");
  for (const f of readdirSync(componentsDir)) {
    if (f.endsWith(".d.ts") && f !== "index.d.ts") {
      entries.push([
        `@once-ui-system/core/components/${f.slice(0, -5)}`,
        path.join(componentsDir, f),
      ]);
    }
  }
  const program = ts.createProgram(
    entries.map(([, f]) => f),
    {
      skipLibCheck: true,
      noEmit: true,
      jsx: ts.JsxEmit.ReactJSX,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      module: ts.ModuleKind.ESNext,
    },
  );
  const checker = program.getTypeChecker();
  const byName = new Map();
  // Barrels first, so a name both a barrel and a deep path export comes from
  // the barrel, the import a reader would write.
  for (const [specifier, file] of entries) {
    const source = program.getSourceFile(file);
    const symbol = source && checker.getSymbolAtLocation(source);
    if (!symbol) continue;
    for (const exp of checker.getExportsOfModule(symbol)) {
      if (!byName.has(exp.name)) byName.set(exp.name, { from: specifier, imported: exp.name });
    }
  }
  return byName;
}

const EXPORTS = packageExports();

const REACT_NAMES = new Set([
  "useState",
  "useEffect",
  "useRef",
  "useMemo",
  "useCallback",
  "useReducer",
  "useId",
  "useContext",
  "useLayoutEffect",
  "useTransition",
  "useDeferredValue",
  "Fragment",
  "Suspense",
]);

// ─── Pulling examples out of MDX ────────────────────────────────────────────

/** Index just past the brace that closes the one at `open`. */
function matchBrace(text, open) {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"' || ch === "'") {
      // JSX attribute strings and JS strings; neither spans a brace we care about.
      const end = text.indexOf(ch, i + 1);
      if (end === -1) return -1;
      i = end;
      continue;
    }
    if (ch === "`") {
      i = endOfTemplate(text, i);
      if (i === -1) return -1;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return i + 1;
    }
  }
  return -1;
}

/** Index of the backtick closing the template literal opened at `open`. */
function endOfTemplate(text, open) {
  for (let i = open + 1; i < text.length; i++) {
    if (text[i] === "\\") {
      i++;
      continue;
    }
    if (text[i] === "`") return i;
    if (text[i] === "$" && text[i + 1] === "{") {
      const close = matchBrace(text, i + 1);
      if (close === -1) return -1;
      i = close - 1;
    }
  }
  return -1;
}

function lineOf(text, index) {
  let line = 1;
  for (let i = 0; i < index; i++) if (text[i] === "\n") line++;
  return line;
}

/**
 * Text inside markdown code fences and inline code is prose about code, not
 * code the page runs; blank it out (keeping offsets) before scanning.
 */
function maskMarkdownCode(text) {
  return text.replace(/^```[\s\S]*?^```/gm, (m) => m.replace(/[^\n]/g, " "));
}

/** Both kinds of example on one page. */
function extract(text) {
  const masked = maskMarkdownCode(text);
  const out = [];

  for (const m of masked.matchAll(/\bpreview=\{/g)) {
    const open = m.index + m[0].length - 1;
    const close = matchBrace(masked, open);
    if (close === -1) continue;
    out.push({
      kind: "preview",
      line: lineOf(text, m.index),
      source: text.slice(open + 1, close - 1),
    });
  }

  // `code:` entries of a CodeBlock's `codes` array, with their language.
  for (const m of masked.matchAll(/\bcode:\s*`/g)) {
    const open = m.index + m[0].length - 1;
    const close = endOfTemplate(masked, open);
    if (close === -1) continue;
    const raw = text.slice(open + 1, close);
    if (raw.includes("${")) continue; // built from values, not copyable as is
    const after = masked.slice(close, close + 200);
    const language = /language:\s*["'`](\w+)/.exec(after)?.[1] ?? "tsx";
    if (!["tsx", "jsx", "ts", "typescript", "javascript", "js"].includes(language)) continue;
    out.push({
      kind: "code",
      line: lineOf(text, m.index),
      language,
      // Template literal escapes, as the page renders them.
      source: raw.replace(/\\`/g, "`").replace(/\\\$/g, "$").replace(/\\\\/g, "\\"),
    });
  }
  return out;
}

/**
 * The harness agents read instead of these pages (`packages/core/ai`) and the
 * READMEs teach by example too, in markdown fences. A wrong prop there costs
 * more than on a page: an agent copies it without looking.
 */
const repo = path.resolve(root, "..", "..");
const AGENT_DOCS = [
  "packages/core/ai/rules.md",
  "packages/core/ai/rules.compact.md",
  "packages/core/ai/recipes.md",
  "packages/core/ai/layouts.md",
  "packages/core/README.md",
  "packages/core/AGENTS.md",
  "README.md",
];

/**
 * Inline code that is a tag — `<Row s={{ direction: "column" }}>` — is a claim
 * about a prop as much as a fenced example is. Each is checked as a fragment.
 */
function extractInline(text) {
  const out = [];
  const masked = text.replace(/^```[\s\S]*?^```/gm, (m) => m.replace(/[^\n]/g, " "));
  for (const m of masked.matchAll(/`(<[A-Z][^`\n]*)`/g)) {
    out.push({ kind: "inline", line: lineOf(text, m.index), source: m[1] });
  }
  return out;
}

/** ```tsx fences in a markdown file. */
function extractFences(text) {
  const out = [];
  for (const m of text.matchAll(
    /^```(tsx|jsx|ts|typescript|js|javascript)[^\n]*\n([\s\S]*?)^```/gm,
  )) {
    out.push({ kind: "code", line: lineOf(text, m.index), language: m[1], source: m[2] });
  }
  return out;
}

// ─── Turning an example into a module ───────────────────────────────────────

/**
 * One block can hold several files, each opened by a path comment —
 * `// app/api/og/fetch/route.ts`. Each is its own module, or two route files
 * exporting `GET` collide.
 */
function splitFiles(example) {
  if (example.kind !== "code") return [example];
  const marker = /^\/\/\s*\S+\.(?:tsx?|jsx?|mjs)\s*$/;
  const lines = example.source.split("\n");
  const starts = lines.flatMap((l, i) => (marker.test(l.trim()) ? [i] : []));
  if (starts.length < 2) return [example];
  if (starts[0] !== 0 && lines.slice(0, starts[0]).some((l) => l.trim())) starts.unshift(0);
  return starts.map((start, n) => ({
    ...example,
    source: lines.slice(start, starts[n + 1] ?? lines.length).join("\n"),
  }));
}

const parse = (code) =>
  ts.createSourceFile("x.tsx", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

const hasParseErrors = (code) => parse(code).parseDiagnostics.length > 0;

/**
 * A copyable snippet comes in three shapes: a whole module (imports, a
 * component), bare JSX, or a few statements followed by JSX — the hook a
 * Dialog needs, then the Dialog. Find the split that parses.
 */
function toModule(code) {
  let text = code.replace(/^\s*["']use client["'];?\s*$/m, "");
  const asModule = parse(text);
  const imports = [];

  // Imports stay at module level whatever the shape.
  const importRanges = asModule.statements
    .filter((s) => ts.isImportDeclaration(s))
    .map((s) => [s.getStart(asModule), s.getEnd()]);
  if (importRanges.length && asModule.parseDiagnostics.length === 0) {
    for (const [s, e] of importRanges) imports.push(text.slice(s, e));
    let rest = "";
    let last = 0;
    for (const [s, e] of importRanges) {
      rest += text.slice(last, s);
      last = e;
    }
    rest += text.slice(last);
    text = rest;
  }

  const trimmed = text.trim();
  if (!trimmed) return { imports, body: "" };

  const wrapJsx = (jsx) => `export function __Example() {\n  return (<>\n${jsx}\n</>);\n}`;
  const wrapBoth = (stmts, jsx) =>
    `export function __Example() {\n${stmts}\n  return (<>\n${jsx}\n</>);\n}`;

  // Bare JSX.
  if (trimmed.startsWith("<") && !hasParseErrors(wrapJsx(trimmed))) {
    return { imports, body: wrapJsx(trimmed) };
  }

  // The inside of a component: hooks, then `return (…)`.
  if (/^return\b/m.test(trimmed)) {
    const asBody = `export function __Example() {\n${trimmed}\n}`;
    if (!hasParseErrors(asBody)) return { imports, body: asBody };
  }

  // A module that declares things and has no loose JSX.
  const mod = parse(trimmed);
  const loose = mod.statements.some(
    (s) =>
      ts.isExpressionStatement(s) &&
      (ts.isJsxElement(s.expression) ||
        ts.isJsxSelfClosingElement(s.expression) ||
        ts.isJsxFragment(s.expression)),
  );
  if (mod.parseDiagnostics.length === 0 && !loose) {
    const declaresSomething = mod.statements.some((s) => !ts.isExpressionStatement(s));
    if (declaresSomething) {
      return { imports, body: trimmed };
    }
  }

  // Statements, then JSX from the first line that starts a tag.
  const textLines = trimmed.split("\n");
  for (let i = 1; i < textLines.length; i++) {
    if (!textLines[i].startsWith("<")) continue;
    const stmts = textLines.slice(0, i).join("\n");
    const jsx = textLines.slice(i).join("\n");
    const wrapped = wrapBoth(stmts, jsx);
    if (!hasParseErrors(wrapped)) {
      return { imports, body: wrapped };
    }
  }

  // Last resort: whatever parses inside a function.
  const asBody = `export function __Example() {\n${trimmed}\n}`;
  if (!hasParseErrors(asBody)) return { imports, body: asBody };

  // A fragment: opening tags with comments, `items={[...]}` placeholders, a
  // closing tag left off. The props on each tag are still claims about the
  // API, so check the tags one by one.
  const tags = openingTags(trimmed);
  if (tags.length) {
    return { imports, body: wrapJsx(tags.join("\n")), fragmentary: true };
  }
  return { imports, body: trimmed, unparsable: true };
}

/**
 * Every `<Component …>` in a snippet, closed as `<Component … />`, with
 * elided values (`{[...]}`, `{fn(...)}`) swapped for `any`.
 */
function openingTags(text) {
  const tags = [];
  for (const m of text.matchAll(/(?<![\w$>])<([A-Z][\w.]*)/g)) {
    let i = m.index + m[0].length;
    let end = -1;
    while (i < text.length) {
      const ch = text[i];
      if (ch === '"' || ch === "'") {
        const close = text.indexOf(ch, i + 1);
        if (close === -1) break;
        i = close + 1;
        continue;
      }
      if (ch === "{") {
        const close = matchBrace(text, i);
        if (close === -1) break;
        i = close;
        continue;
      }
      if (ch === ">" || (ch === "\n" && /^\s*\/\//.test(text.slice(i + 1)))) {
        end = i;
        break;
      }
      if (ch === "/" && text[i + 1] === "/") {
        end = i;
        break;
      }
      i++;
    }
    if (end === -1) continue;
    let attrs = text.slice(m.index + m[0].length, end).replace(/\/\s*$/, "");
    attrs = attrs.replace(/=\{((?:[^{}]|\{[^{}]*\})*)\}/g, (all, inner) =>
      /\.\.\.\s*[\])}]|^\s*\.\.\.\s*$/.test(inner) ? "={undefined as any}" : all,
    );
    tags.push(`<${m[1]}${attrs} />`);
  }
  return tags.filter((t) => !hasParseErrors(`const x = (<>${t}</>);`));
}

/** Names used in `code` that nothing declares. */
function freeNames(code) {
  const file = parse(code);
  const used = new Set();
  const visit = (node) => {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tag = node.tagName;
      if (ts.isIdentifier(tag) && /^[A-Z]/.test(tag.text)) used.add(tag.text);
      if (ts.isPropertyAccessExpression(tag) && ts.isIdentifier(tag.expression))
        used.add(tag.expression.text);
    }
    if (ts.isIdentifier(node)) used.add(node.text);
    ts.forEachChild(node, visit);
  };
  visit(file);
  return used;
}

const DOM_GLOBALS = new Set([
  "open",
  "close",
  "name",
  "status",
  "event",
  "length",
  "origin",
  "parent",
  "top",
  "self",
  "stop",
  "print",
  "focus",
  "blur",
  "scroll",
  "history",
  "screen",
  "external",
  "content",
  "frames",
]);

/** Names a snippet declares itself: variables, functions, parameters, types. */
function boundNames(code) {
  const file = parse(code);
  const bound = new Set();
  const bind = (name) => {
    if (!name) return;
    if (ts.isIdentifier(name)) bound.add(name.text);
    else if (ts.isObjectBindingPattern(name) || ts.isArrayBindingPattern(name))
      for (const el of name.elements) if (!ts.isOmittedExpression(el)) bind(el.name);
  };
  const visit = (node) => {
    if (
      ts.isVariableDeclaration(node) ||
      ts.isParameter(node) ||
      ts.isFunctionDeclaration(node) ||
      ts.isClassDeclaration(node) ||
      ts.isInterfaceDeclaration(node) ||
      ts.isTypeAliasDeclaration(node) ||
      ts.isEnumDeclaration(node)
    )
      bind(node.name);
    ts.forEachChild(node, visit);
  };
  visit(file);
  return bound;
}

function buildFile(example) {
  const shaped =
    example.kind === "preview"
      ? (() => {
          const src = example.source.trim();
          const jsx = src.startsWith("<") ? src : `{${src}}`;
          return {
            imports: [],
            body: `export function __Example() {\n  return (<>\n${jsx}\n</>);\n}`,
          };
        })()
      : toModule(example.source);

  const header = [];
  const declared = new Set();
  for (const imp of shaped.imports) {
    const f = parse(imp);
    f.forEachChild((s) => {
      if (!ts.isImportDeclaration(s)) return;
      const c = s.importClause;
      if (c?.name) declared.add(c.name.text);
      const b = c?.namedBindings;
      if (b && ts.isNamedImports(b)) for (const el of b.elements) declared.add(el.name.text);
      if (b && ts.isNamespaceImport(b)) declared.add(b.name.text);
    });
  }

  // Snippets often import only the one thing they are about and leave the
  // layout primitives around it implied; the reader's editor adds those. So
  // names from the package resolve whether or not the snippet imports them —
  // an import of a name the package does not export still fails.
  const names = freeNames(shaped.body);
  const bound = boundNames(shaped.body);
  const byModule = new Map();
  const reactNames = [];
  for (const name of names) {
    if (declared.has(name)) continue;
    if (REACT_NAMES.has(name)) {
      reactNames.push(name);
      continue;
    }
    const scoped =
      example.kind === "preview" ? SCOPE.get(name) : (SCOPE.get(name) ?? EXPORTS.get(name));
    if (scoped && !bound.has(name)) {
      const list = byModule.get(scoped.from) ?? [];
      list.push(scoped.imported === name ? name : `${scoped.imported} as ${name}`);
      byModule.set(scoped.from, list);
    }
  }
  // `open`, `close`, `name` are window globals, so an example's own `open`
  // state would otherwise typecheck against `window.open`.
  const shadowed = [...names].filter(
    (n) => DOM_GLOBALS.has(n) && !bound.has(n) && !declared.has(n),
  );
  if (reactNames.length) header.push(`import { ${reactNames.join(", ")} } from "react";`);
  for (const [from, list] of byModule) header.push(`import { ${list.join(", ")} } from "${from}";`);

  return {
    text: `${[...shaped.imports, ...header].join("\n")}\n${shaped.body}\n${shadowed
      .map((n) => `declare const ${n}: any;`)
      .join("\n")}\nexport {};\n`,
    unparsable: shaped.unparsable,
    fragmentary: shaped.fragmentary,
  };
}

// ─── Typechecking in memory ─────────────────────────────────────────────────

function compilerOptions() {
  const configPath = path.join(root, "tsconfig.json");
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
  return { ...parsed.options, noEmit: true, incremental: false, skipLibCheck: true };
}

function check(files) {
  const options = compilerOptions();
  const host = ts.createCompilerHost(options);
  const original = {
    getSourceFile: host.getSourceFile,
    fileExists: host.fileExists,
    readFile: host.readFile,
  };
  host.fileExists = (f) => files.has(path.resolve(f)) || original.fileExists(f);
  host.readFile = (f) => files.get(path.resolve(f))?.text ?? original.readFile(f);
  host.getSourceFile = (f, lang, ...rest) => {
    const v = files.get(path.resolve(f));
    if (v) return ts.createSourceFile(f, v.text, lang, true, ts.ScriptKind.TSX);
    return original.getSourceFile(f, lang, ...rest);
  };
  // The docs register their own icons by augmenting IconLibraryOverrides;
  // the previews render with them, so they are in the program too.
  const roots = [...files.keys(), path.join(root, "src", "resources", "icons.ts")];
  const program = ts.createProgram(roots, options, host);
  const byFile = new Map();
  for (const d of ts.getPreEmitDiagnostics(program)) {
    if (!d.file) continue;
    const key = path.resolve(d.file.fileName);
    if (!files.has(key)) continue;
    const list = byFile.get(key) ?? [];
    list.push(d);
    byFile.set(key, list);
  }
  return byFile;
}

/** Undeclared lowercase names an example leans on: `items`, `handleSubmit`. */
const UNKNOWN_NAME = new Set([2304, 2552, 18004]);

/**
 * A snippet that imports the reader's own files (`./Pricing`, `@/resources`),
 * a stylesheet or another library can't resolve here, and isn't wrong for it.
 * Only `@once-ui-system/core` imports are held to resolving.
 */
const MODULE_ERRORS = new Set([2307, 2305, 2614, 2724, 2882, 5097]);
function outsidePackage(d) {
  if (!MODULE_ERRORS.has(d.code)) return false;
  const text = ts.flattenDiagnosticMessageText(d.messageText, "\n");
  const module = /['"]([^'"]+)['"]/.exec(text)?.[1] ?? "";
  if (d.code === 5097) return true;
  if (/\.(s?css)$/.test(module)) return true;
  return !module.startsWith("@once-ui-system/core");
}

/**
 * `import { Meta } from "@/modules"` is how Once UI was installed before it
 * was a package. A snippet still importing a package export from an app alias
 * teaches the old layout.
 */
function legacyImports(text) {
  const out = [];
  for (const s of parse(text).statements) {
    if (!ts.isImportDeclaration(s)) continue;
    const from = s.moduleSpecifier.text;
    if (from.startsWith(".") || from.startsWith("@once-ui-system/") || from === "react") continue;
    if (!from.startsWith("@/") && !from.includes("once-ui")) continue;
    const b = s.importClause?.namedBindings;
    if (!b || !ts.isNamedImports(b)) continue;
    const names = b.elements
      .map((e) => (e.propertyName ?? e.name).text)
      .filter((n) => EXPORTS.has(n));
    for (const n of names) {
      out.push(`imports ${n} from "${from}"; it comes from "${EXPORTS.get(n).from}"`);
    }
  }
  return out;
}

/** Missing required props and children: expected once a tag is cut loose. */
const FRAGMENT_EXEMPT = new Set([2741, 2739]);

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

  const files = new Map();
  const sources = [
    ...pages.map((page) => ({
      rel: path.relative(contentDir, page),
      file: page,
      read: (text) => [...extract(text), ...extractInline(text)],
    })),
    ...AGENT_DOCS.map((rel) => ({
      rel,
      file: path.join(repo, rel),
      read: (text) => [...extractFences(text), ...extractInline(text)],
    })),
    // Gotchas are JSON, but their rules quote tags the same way.
    {
      rel: "packages/core/ai/gotchas.json",
      file: path.join(repo, "packages/core/ai/gotchas.json"),
      read: extractInline,
    },
  ];
  for (const { rel, file, read } of sources) {
    if (filter && !rel.includes(filter)) continue;
    const text = readFileSync(file, "utf8");
    read(text)
      .flatMap(splitFiles)
      .forEach((example, i) => {
        const built = buildFile(example);
        const name = path.join(virtualDir, `${rel.replace(/[\\/.]/g, "_")}__${i}.tsx`);
        files.set(path.resolve(name), {
          ...example,
          page: rel,
          text: built.text,
          unparsable: built.unparsable,
          fragmentary: built.fragmentary,
        });
      });
  }

  // The first pass finds names the examples assume exist; declare them `any`
  // and check again.
  let diags = check(files);
  for (const [file, list] of diags) {
    const missing = new Set();
    for (const d of list) {
      if (!UNKNOWN_NAME.has(d.code)) continue;
      const name = /'([^']+)'/.exec(ts.flattenDiagnosticMessageText(d.messageText, "\n"))?.[1];
      // A lowercase name is the example's data or handler. A capitalised one
      // TypeScript has no near match for is the reader's own component —
      // `<FileTile />`, `<YourContent />` — so it takes anything. A near miss
      // (TS2552, "did you mean OgCard?") stays an error.
      if (name && (!/^[A-Z]/.test(name) || d.code === 2304 || d.code === 18004)) missing.add(name);
    }
    if (!missing.size) continue;
    const entry = files.get(file);
    const decls = [...missing]
      .map((n) =>
        /^[A-Z]/.test(n)
          ? `declare const ${n}: any;\ntype ${n} = any;`
          : `declare const ${n}: any;`,
      )
      .join("\n");
    entry.text = `${entry.text}\n${decls}\n`;
  }
  diags = check(files);

  const problems = [];
  const skipped = [];
  for (const [file, entry] of files) {
    for (const imp of legacyImports(entry.text)) {
      problems.push({ page: entry.page, line: entry.line, kind: entry.kind, message: imp, at: "" });
    }
    // Signatures and shapes written for reading (`radius: xs | s | m`) are
    // prose in a code font. They are counted, not checked.
    if (entry.unparsable) {
      skipped.push({ page: entry.page, line: entry.line });
      continue;
    }
    for (const d of diags.get(file) ?? []) {
      // A tag lifted out of a fragment lost its children and maybe props the
      // page elided on purpose; only what it does say is checked.
      if ((entry.fragmentary || entry.kind === "inline") && FRAGMENT_EXEMPT.has(d.code)) continue;
      if (outsidePackage(d)) continue;
      // Previews render on the server, and a server component can't hand a
      // function to a client one, so a live preview leaves its required
      // callbacks off. The copyable code beside it is where they belong.
      // MDX is JavaScript, with no `as const`: a value mapped out of an
      // array literal arrives widened to `string`. That is the checker's
      // blind spot, not the page's.
      if (
        entry.kind === "preview" &&
        d.code === 2322 &&
        /^Type '(string|number)' is not assignable/.test(
          ts.flattenDiagnosticMessageText(d.messageText, "\n"),
        )
      )
        continue;
      if (
        entry.kind === "preview" &&
        d.code === 2741 &&
        /^Property 'on[A-Z]/.test(ts.flattenDiagnosticMessageText(d.messageText, "\n"))
      )
        continue;
      const message = ts.flattenDiagnosticMessageText(d.messageText, "\n");
      const { line } = d.file.getLineAndCharacterOfPosition(d.start ?? 0);
      const snippetLine = d.file.text.split("\n")[line]?.trim();
      problems.push({
        page: entry.page,
        line: entry.line,
        kind: entry.kind,
        code: d.code,
        message,
        at: snippetLine,
      });
    }
  }

  if (asJson) {
    process.stdout.write(
      `${JSON.stringify({ examples: files.size, skipped, problems }, null, 2)}\n`,
    );
  } else {
    for (const p of problems) {
      // The last line of a chain names the prop; the first only the element.
      const reason = p.message.split("\n").at(-1).trim();
      console.log(`${p.page}:${p.line} [${p.kind}] ${p.code ? `TS${p.code} ` : ""}${reason}`);
      if (p.at) console.log(`    ${p.at.slice(0, 160)}`);
    }
    console.log(
      `\n${files.size - skipped.length} examples checked (${skipped.length} illustrative snippets skipped), ${problems.length} problems.`,
    );
  }
  process.exitCode = problems.length ? 1 : 0;
}

run();
