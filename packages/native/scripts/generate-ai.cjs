/**
 * Generates the agent harness under ai/: a slice per component, the catalog,
 * the manifest and one Markdown bundle per task, read from the source and
 * from the hand-written files beside them (rules.md, gotchas.json,
 * catalog.seed.json, tasks/, examples/). It follows core's harness
 * (packages/core/ai), so an agent that builds the web app and the phone app
 * from one prompt reads the same shapes for both.
 *
 * `--check` writes nothing and fails when a generated file is out of date.
 */

const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "src");
const AI = path.join(ROOT, "ai");
const AGENTS = path.join(ROOT, "AGENTS.md");
const WEB_CATALOG = path.join(ROOT, "..", "core", "ai", "catalog.json");
const PACKAGE = "@once-ui-system/native";
const CHECK = process.argv.includes("--check");

// Exports that are helpers for building components, not something a screen
// uses. They stay exported; the harness leaves them out.
const EXCLUDE = new Set([
  "createTheme",
  "defaultSettings",
  "flexStyle",
  "NO_INSETS",
  "resolveTokens",
  "responsiveProps",
  "spacingStyle",
  "tokens",
  "touchSlop",
]);

// Names every React Native developer knows; a bundle names them without
// defining them.
const KNOWN = new Set([
  "React",
  "ReactNode",
  "ReactElement",
  "ComponentType",
  "ViewStyle",
  "TextStyle",
  "ImageStyle",
  "StyleProp",
  "ImageSourcePropType",
  "GestureResponderEvent",
  "Record",
  "Partial",
  "Pick",
  "Omit",
  "Exclude",
  "Array",
  "Promise",
]);

// The components nearly every screen uses: every bundle carries them, and
// screen.md (for a screen no task matches) is them and the rules.
const COMMON = [
  "Column",
  "Row",
  "Text",
  "Heading",
  "Button",
  "IconButton",
  "Icon",
  "Line",
  "Card",
  "Skeleton",
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(AI, file), "utf8"));
}

function collapse(text) {
  return text.replace(/\s+/g, " ").replace(/\(\s+/g, "(").replace(/\s+\)/g, ")").trim();
}

/** The first sentence of a JSDoc comment, without the "Core's `X`:" lead. */
function firstSentence(text) {
  const flat = collapse(text);
  const sentence = flat.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? flat;
  return sentence
    .replace(/^Core's `[^`]+`(?: [^:]*)?:\s*/, "")
    .replace(/^./, (c) => c.toUpperCase());
}

function isOwnSource(fileName) {
  const normal = path.normalize(fileName);
  return (
    normal.startsWith(SRC + path.sep) && !normal.includes(`${path.sep}node_modules${path.sep}`)
  );
}

function createProgram() {
  const configFile = ts.findConfigFile(ROOT, ts.sys.fileExists, "tsconfig.json");
  const config = ts.readConfigFile(configFile, ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, ROOT);
  return ts.createProgram([path.join(SRC, "index.ts")], { ...parsed.options, noEmit: true });
}

function extract() {
  const program = createProgram();
  const checker = program.getTypeChecker();
  const index = program.getSourceFile(path.join(SRC, "index.ts"));
  const exports = checker.getExportsOfModule(checker.getSymbolAtLocation(index));

  // Every top-level type alias and interface in the source, by name, so a
  // type a prop names can be defined even when it is not exported.
  const declared = new Map();
  for (const sf of program.getSourceFiles()) {
    if (!isOwnSource(sf.fileName)) continue;
    for (const st of sf.statements) {
      if (
        (ts.isTypeAliasDeclaration(st) || ts.isInterfaceDeclaration(st)) &&
        !declared.has(st.name.text)
      )
        declared.set(st.name.text, st);
    }
  }

  const components = {};
  const hooks = {};
  const mixins = {};

  for (const exported of exports) {
    const name = exported.getName();
    if (EXCLUDE.has(name)) continue;
    const symbol =
      exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
    if (!(symbol.flags & (ts.SymbolFlags.Function | ts.SymbolFlags.Variable))) continue;
    const decl = symbol.valueDeclaration;
    if (!decl || !isOwnSource(decl.getSourceFile().fileName)) continue;
    const type = checker.getTypeOfSymbolAtLocation(symbol, decl);
    const signature = type.getCallSignatures()[0];
    if (!signature) continue;

    if (/^use[A-Z]/.test(name)) {
      hooks[name] = collapse(
        checker.signatureToString(signature, undefined, ts.TypeFormatFlags.NoTruncation),
      );
      continue;
    }
    if (!/^[A-Z]/.test(name)) continue;
    const param = signature.getParameters()[0];
    const propsType = param ? checker.getTypeOfSymbolAtLocation(param, decl) : undefined;
    const propsName = `${name}Props`;
    const defaults = defaultsOf(decl);
    const props = {};
    const own = new Set();
    // React Native's own props a component passes through (onPress from
    // PressableProps, keyboardType from TextInputProps): named, not listed.
    const native = new Set();
    for (const prop of propsType ? checker.getPropertiesOfType(propsType) : []) {
      const propDecl = prop.valueDeclaration ?? prop.declarations?.[0];
      if (!propDecl) continue;
      if (!isOwnSource(propDecl.getSourceFile().fileName)) continue;
      if (prop.getName() === "ref" || prop.getName() === "key") continue;
      const owner = ownerOf(propDecl, propsName);
      const entry = propEntry(prop, propDecl, defaults);
      if (owner === propsName) {
        props[prop.getName()] = entry;
      } else {
        mixins[owner] ??= {};
        mixins[owner][prop.getName()] = { ...entry, default: undefined };
        own.add(owner);
        // A default the component sets on a mixin prop still belongs to it.
        if (defaults[prop.getName()] !== undefined) props[prop.getName()] = entry;
      }
    }
    nativeBases(propsName, native);
    for (const owner of own) nativeBases(owner, native);
    const doc = ts.displayPartsToString(symbol.getDocumentationComment(checker));
    components[name] = {
      name,
      doc: doc ? firstSentence(doc) : undefined,
      file: path.relative(SRC, decl.getSourceFile().fileName).replace(/\\/g, "/"),
      props,
      mixins: [...own].sort(),
      native: [...native].sort(),
    };
  }

  /** React Native props interfaces an own interface extends, directly or through another. */
  function nativeBases(name, found, seen = new Set()) {
    const node = declared.get(name);
    if (!node || seen.has(name) || !ts.isInterfaceDeclaration(node)) return;
    seen.add(name);
    for (const clause of node.heritageClauses ?? [])
      for (const type of clause.types)
        for (const [word] of type.getText().matchAll(/\b[A-Z][A-Za-z]*Props\b/g)) {
          if (declared.has(word)) nativeBases(word, found, seen);
          else found.add(word.replace(/^RN/, ""));
        }
  }

  /** The interface or type a prop is declared in. */
  function ownerOf(node, fallback) {
    const parent = node.parent;
    if (ts.isInterfaceDeclaration(parent)) return parent.name.text;
    if (ts.isTypeLiteralNode(parent) && ts.isTypeAliasDeclaration(parent.parent))
      return parent.parent.name.text;
    return fallback;
  }

  function propEntry(prop, node, defaults) {
    const typeText = node.type
      ? collapse(node.type.getText())
      : collapse(
          checker.typeToString(
            checker.getTypeOfSymbol(prop),
            undefined,
            ts.TypeFormatFlags.NoTruncation,
          ),
        );
    const doc = ts.displayPartsToString(prop.getDocumentationComment(checker));
    return {
      type: typeText,
      required: !(prop.flags & ts.SymbolFlags.Optional),
      default: defaults[prop.getName()],
      doc: doc ? firstSentence(doc) : undefined,
    };
  }

  /** Defaults from the component's destructured props. */
  function defaultsOf(decl) {
    let fn = decl;
    if (ts.isVariableDeclaration(decl)) {
      let init = decl.initializer;
      while (
        init &&
        (ts.isAsExpression(init) || ts.isParenthesizedExpression(init) || ts.isCallExpression(init))
      )
        init = ts.isCallExpression(init) ? init.arguments[0] : init.expression;
      fn = init;
    }
    const defaults = {};
    if (!fn || !("parameters" in fn) || !fn.parameters.length) return defaults;
    let pattern = fn.parameters[0].name;
    if (ts.isIdentifier(pattern) && fn.body && ts.isBlock(fn.body)) {
      for (const st of fn.body.statements) {
        if (!ts.isVariableStatement(st)) continue;
        for (const d of st.declarationList.declarations) {
          if (
            ts.isObjectBindingPattern(d.name) &&
            d.initializer &&
            d.initializer.getText() === pattern.text
          )
            pattern = d.name;
        }
      }
    }
    if (!ts.isObjectBindingPattern(pattern)) return defaults;
    for (const element of pattern.elements) {
      if (!element.initializer || element.dotDotDotToken) continue;
      const key = (element.propertyName ?? element.name).getText();
      const text = collapse(element.initializer.getText());
      if (text.length <= 40) defaults[key] = text;
    }
    return defaults;
  }

  /** A type's definition, for the Types section. */
  function define(name) {
    const node = declared.get(name);
    if (!node) return undefined;
    if (ts.isInterfaceDeclaration(node)) {
      const component = name.replace(/Props$/, "");
      if (name.endsWith("Props") && components[component]) return `${component} props`;
      if (mixins[name]) return `the ${name} mixin above`;
      if (!node.members.length) return "{} (an app augments it to register its own icon names)";
      const members = node.members.map((m) => collapse(m.getText()).replace(/;$/, ""));
      return `{ ${members.join("; ")} }`;
    }
    const text = collapse(node.type.getText()).replace(/^\|\s*/, "");
    // The built-in icon set is `keyof typeof` its data; the bundle lists the names.
    if (/^keyof typeof /.test(text)) return "one of the names listed under Icons";
    return text;
  }

  return { components, hooks, mixins, define, declared };
}

function iconNames() {
  const data = fs.readFileSync(path.join(SRC, "icons", "data.ts"), "utf8");
  return [...data.matchAll(/^ {2}"?([A-Za-z0-9]+)"?: \{/gm)].map((m) => m[1]);
}

/** Names of the source's types a list of type texts uses, with their own names in turn. */
function typesFor(texts, spec) {
  const found = new Map();
  const queue = [...texts];
  while (queue.length) {
    const text = queue.shift();
    for (const [word] of text.matchAll(/[A-Za-z_][A-Za-z0-9_]*/g)) {
      if (found.has(word) || KNOWN.has(word) || !spec.declared.has(word)) continue;
      const definition = spec.define(word);
      if (definition === undefined) continue;
      found.set(word, definition);
      queue.push(definition);
    }
  }
  return Object.fromEntries([...found].sort(([a], [b]) => a.localeCompare(b)));
}

function propTexts(props) {
  return Object.values(props).map((p) => p.type);
}

function slice(component, spec, catalog) {
  const mixinTexts = component.mixins.flatMap((m) => propTexts(spec.mixins[m]));
  return {
    name: component.name,
    importFrom: PACKAGE,
    purpose: catalog[component.name]?.purpose,
    mixins: component.mixins,
    reactNative: component.native.length ? component.native : undefined,
    props: Object.fromEntries(Object.entries(component.props).map(([k, p]) => [k, propString(p)])),
    resolvedMixins: Object.fromEntries(
      component.mixins.map((m) => [
        m,
        Object.fromEntries(Object.entries(spec.mixins[m]).map(([k, p]) => [k, propString(p)])),
      ]),
    ),
    types: typesFor([...propTexts(component.props), ...mixinTexts], spec),
  };
}

function propString(p) {
  return `${p.required ? "!" : ""}${p.type}${p.default !== undefined ? ` = ${p.default}` : ""}`;
}

/** Prop lines in core's bundle style: consecutive props of one type share a line. */
function propLines(props) {
  const lines = [];
  let group = [];
  const flush = () => {
    if (!group.length) return;
    const [first] = group;
    const names = group.map(([k, p]) => `${k}${p.required ? "" : "?"}`).join(", ");
    const doc = group.length === 1 && first[1].doc ? ` — ${first[1].doc}` : "";
    lines.push(
      `- ${names}: ${first[1].type}${first[1].default !== undefined ? ` = ${first[1].default}` : ""}${doc}`,
    );
    group = [];
  };
  for (const entry of Object.entries(props)) {
    const [, p] = entry;
    const last = group[group.length - 1]?.[1];
    if (
      last &&
      (last.type !== p.type ||
        last.default !== undefined ||
        p.default !== undefined ||
        last.doc ||
        p.doc)
    )
      flush();
    group.push(entry);
  }
  flush();
  return lines;
}

function bundleMarkdown(task, spec, catalog, gotchas, rules, icons) {
  const names = [...task.components, ...COMMON.filter((c) => !task.components.includes(c))];
  const missing = names.filter((n) => !spec.components[n]);
  if (missing.length) throw new Error(`${task.id}: no component ${missing.join(", ")}`);
  const mixinNames = [...new Set(names.flatMap((n) => spec.components[n].mixins))].sort();
  const texts = [
    ...names.flatMap((n) => propTexts(spec.components[n].props)),
    ...mixinNames.flatMap((m) => propTexts(spec.mixins[m])),
  ];
  const types = typesFor(texts, spec);
  const out = [];
  out.push(`# ${task.title} (${PACKAGE})`, "", task.description, "");
  out.push(
    "This file is complete for this task: the rules (all of `rules.md`), the props of every component below, their mixins and types, the hooks, every gotcha for this task, the quality bar and a gold example. Write the screen from it; reading the rules, catalog, gotchas or examples again only adds cost. Open `components/<Name>.json` only for a component not listed here, and then every one you need in a single step.",
    "",
  );
  out.push("## Rules", "", rules.trim(), "");
  out.push("## Components", "");
  for (const name of names) {
    const c = spec.components[name];
    out.push(`### ${name}`);
    const purpose = catalog[name]?.purpose;
    if (purpose) out.push(purpose);
    if (c.mixins.length) out.push(`Mixins: ${c.mixins.join(", ")}.`);
    if (c.native.length) out.push(`Also takes React Native's ${c.native.join(" and ")}.`);
    out.push(...propLines(c.props), "");
  }
  out.push("## Hooks", "");
  for (const [name, signature] of Object.entries(spec.hooks))
    out.push(`- \`${name}\`: \`${signature}\``);
  out.push("");
  if (mixinNames.length) {
    out.push("## Mixins", "");
    for (const m of mixinNames) out.push(`### ${m}`, ...propLines(spec.mixins[m]), "");
  }
  out.push("## Types", "", "```ts");
  for (const [name, definition] of Object.entries(types)) out.push(`type ${name} = ${definition}`);
  out.push("```", "");
  if (Object.values(types).some((d) => d.includes("listed under Icons"))) {
    out.push("## Icons", "", icons.join(", "), "");
  }
  const taskGotchas = task.gotchas ?? [];
  if (taskGotchas.length) {
    out.push("## Gotchas", "");
    for (const id of taskGotchas) {
      if (!gotchas[id]) throw new Error(`${task.id}: no gotcha ${id}`);
      out.push(`- ${gotchas[id].rule}`);
    }
    out.push("");
  }
  if (task.quality) {
    out.push("## Quality bar", "");
    for (const line of Object.values(task.quality)) out.push(`- ${line}`);
    out.push("");
  }
  if (task.example) {
    const example = fs.readFileSync(path.join(AI, task.example), "utf8");
    out.push(`## Gold example (\`${task.example}\`)`, "", "```tsx", example.trim(), "```", "");
  }
  return `${out.join("\n").trim()}\n`;
}

function agentsTable(tasks) {
  const rows = tasks.map((t) => `| \`ai/bundles/${t.id}.md\` | ${t.title}: ${t.description} |`);
  return [
    "<!-- tasks:start -->",
    "| Bundle | For |",
    "|---|---|",
    ...rows,
    "<!-- tasks:end -->",
  ].join("\n");
}

function main() {
  const spec = extract();
  const seed = readJson("catalog.seed.json");
  const gotchas = readJson("gotchas.json");
  const rules = fs.readFileSync(path.join(AI, "rules.md"), "utf8").replace(/^# .*\n+/, "");
  const icons = iconNames();
  const version = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8")).version;

  // A purpose comes from catalog.seed.json, then the component's own JSDoc,
  // then core's catalog (the same component on the web).
  const web = JSON.parse(fs.readFileSync(WEB_CATALOG, "utf8")).components;
  const catalog = {};
  const missing = [];
  for (const name of Object.keys(spec.components).sort()) {
    const purpose = seed.components?.[name] ?? spec.components[name].doc ?? web[name]?.purpose;
    if (!purpose) missing.push(name);
    catalog[name] = { purpose };
  }
  if (missing.length)
    throw new Error(`No purpose for ${missing.join(", ")}: add a catalog.seed.json entry`);

  const files = new Map();
  const json = (value) => `${JSON.stringify(value, null, 1)}\n`;
  for (const component of Object.values(spec.components))
    files.set(`ai/components/${component.name}.json`, json(slice(component, spec, catalog)));
  files.set(
    "ai/catalog.json",
    `{\n "version": ${JSON.stringify(version)},\n "importFrom": "${PACKAGE}",\n "hooks": ${JSON.stringify(Object.keys(spec.hooks))},\n "iconNames": ${JSON.stringify(icons)},\n "components": {\n${Object.entries(
      catalog,
    )
      .map(([name, entry]) => `  ${JSON.stringify(name)}: ${JSON.stringify(entry)}`)
      .join(",\n")}\n }\n}\n`,
  );

  const index = readJson("tasks/index.json");
  const tasks = index.tasks.map((t) => ({ ...readJson(t.file), id: t.id }));
  for (const task of tasks)
    files.set(
      `ai/bundles/${task.id}.md`,
      bundleMarkdown(task, spec, catalog, gotchas, rules, icons),
    );
  const base = {
    id: "screen",
    title: "Any other screen",
    description:
      "The rules and the components nearly every screen uses, with their types. Read it with the `components/<Name>.json` slices your screen adds, in one step",
    components: [],
    gotchas: Object.keys(gotchas),
  };
  files.set("ai/bundles/screen.md", bundleMarkdown(base, spec, catalog, gotchas, rules, icons));

  files.set(
    "ai/manifest.json",
    json({
      version,
      package: PACKAGE,
      web: "@once-ui-system/core: the same component names and props for the web app; its harness is node_modules/@once-ui-system/core/AGENTS.md",
      files: {
        agents: "AGENTS.md",
        rules: "ai/rules.md",
        catalog: "ai/catalog.json",
        gotchas: "ai/gotchas.json",
        components: "ai/components/{Name}.json",
        bundle: "ai/bundles/{id}.md",
        examples: "ai/examples/",
      },
      tasks: [
        ...tasks.map((t) => ({ id: t.id, title: t.title, bundle: `ai/bundles/${t.id}.md` })),
        { id: "screen", title: base.title, bundle: "ai/bundles/screen.md" },
      ],
    }),
  );

  const agents = fs.readFileSync(AGENTS, "utf8");
  files.set(
    "AGENTS.md",
    agents.replace(/<!-- tasks:start -->[\s\S]*<!-- tasks:end -->/, agentsTable([...tasks, base])),
  );

  // Slices for components that no longer exist go too.
  const componentsDir = path.join(AI, "components");
  const stale = (
    fs.existsSync(componentsDir) ? fs.readdirSync(componentsDir, { withFileTypes: true }) : []
  )
    .map((d) => `ai/components/${d.name}`)
    .filter((f) => !files.has(f));

  if (CHECK) {
    const outdated = [...files].filter(([file, text]) => {
      const target = path.join(ROOT, file);
      return !fs.existsSync(target) || fs.readFileSync(target, "utf8") !== text;
    });
    const problems = [...outdated.map(([f]) => f), ...stale];
    if (problems.length) {
      console.error(`Out of date (run pnpm generate:ai):\n${problems.join("\n")}`);
      process.exit(1);
    }
    console.log(`ai/ is up to date (${files.size} files)`);
    return;
  }
  for (const file of stale) fs.rmSync(path.join(ROOT, file));
  for (const [file, text] of files) {
    fs.mkdirSync(path.dirname(path.join(ROOT, file)), { recursive: true });
    fs.writeFileSync(path.join(ROOT, file), text);
  }
  console.log(`Wrote ${files.size} files`);
}

main();
