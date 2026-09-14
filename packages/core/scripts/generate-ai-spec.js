/**
 * Generates ai/spec.json — a compressed, machine-readable description of every
 * exported component: own props (with types and defaults), shared prop mixins
 * (encoded once), and token aliases.
 *
 * Compression strategy:
 * - Props declared in src/interfaces.ts are grouped into "mixins" and emitted
 *   once; components only reference mixin names.
 * - Props inherited from React/DOM typings (node_modules) are omitted.
 * - Wrapper components (e.g. Row extends ComponentProps<typeof Flex>) get an
 *   "extends" reference instead of repeating the base component's props.
 * - Each prop is a single string: "type", "type = default", or "!type" (required).
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SRC = path.join(ROOT, "src");
const OUT_DIR = path.join(ROOT, "ai");
const OUT_FILE = path.join(OUT_DIR, "spec.json");

// The three subpath barrels are listed separately because they are no longer
// re-exported from the root: their implementations pull in recharts, prismjs
// and compressorjs, which a bundler resolves whenever it walks the root
// barrel. Without them here an agent would never learn these components exist,
// so each carries the specifier to import it from.
const BARRELS = [
  { file: path.join(SRC, "components", "index.ts"), group: "components" },
  { file: path.join(SRC, "modules", "index.ts"), group: "modules" },
  {
    file: path.join(SRC, "modules", "data", "index.ts"),
    group: "data",
    importFrom: "@once-ui-system/core/data",
  },
  {
    file: path.join(SRC, "modules", "code", "index.ts"),
    group: "code",
    importFrom: "@once-ui-system/core/code",
  },
  {
    file: path.join(SRC, "modules", "media", "index.ts"),
    group: "media",
    importFrom: "@once-ui-system/core/media",
  },
];

// Internal/low-level exports that AI should not use directly
const EXCLUDE = new Set([
  "ServerFlex",
  "ClientFlex",
  "ServerGrid",
  "ClientGrid",
  "ElementType",
  "FocusTrap",
  "ScrollLock",
  "ThemeInit",
  "ArrowNavigation",
  "Meta",
]);

// Token aliases worth defining once in the spec (read from types.ts source)
const TOKEN_ALIASES = [
  "SpacingToken",
  "StaticSpacingToken",
  "ResponsiveSpacingToken",
  "TShirtSizes",
  "ColorScheme",
  "ColorWeight",
  "Colors",
  "RadiusSize",
  "ShadowSize",
  "TextVariant",
  "TextType",
  "TextWeight",
  "TextSize",
  "gridSize",
  "opacity",
  "flex",
  "CSSUnit",
];

function loadTsConfig(ts) {
  const configPath = path.join(ROOT, "tsconfig.json");
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, ROOT);
  return parsed.options;
}

function isInNodeModules(decl) {
  return decl.getSourceFile().fileName.includes("node_modules");
}

function normalize(p) {
  return p.replace(/\\/g, "/");
}

/** Strip quotes from string literal default values */
function cleanDefault(text) {
  // A multi-line object default kept its source newlines and indentation,
  // which made the output depend on the checkout's line endings: the same
  // `pattern` default read `{\r\n  display: false ... }` when generated on a
  // CRLF checkout and `{\n  ... }` on an LF one, so the committed artifacts
  // flip-flopped between machines. Collapse it the way `typeText` does.
  const t = text
    .replace(/\s*\r?\n\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (/^["'].*["']$/.test(t)) return t.slice(1, -1);
  return t;
}

/** Compact a type-node source text: collapse whitespace, strip leading pipe */
function typeText(node) {
  if (!node) return "unknown";
  return node
    .getText()
    .replace(/\s*\n\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/^\|\s*/, "");
}

/**
 * Resolve the type aliases that props refer to by name.
 *
 * A prop typed `TShirtSizes = m` tells a reader — human or model — nothing
 * about which sizes exist, and guessing is how wrong values get written. Any
 * alias that resolves to a union of string literals is therefore listed with
 * its members, so the values are in the spec rather than a type name that
 * only helps if you already have the source open.
 */
function collectTypeAliases(ts, program, checker, seedBlob, components) {
  /** Every type alias and interface declared in src, by name. */
  const declared = new Map();
  for (const file of program.getSourceFiles()) {
    const own = !file.isDeclarationFile && normalize(file.fileName).startsWith(SRC);
    // A vendored type is indexed too, but only a string union of it is ever
    // emitted — `Placement` comes from floating-ui and its twelve values are
    // exactly what a caller needs; React's object types are not.
    const vendored = file.fileName.includes("node_modules");
    if (!own && !vendored) continue;
    ts.forEachChild(file, (node) => {
      if (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) {
        const name = node.name.getText();
        // A name declared in both src and node_modules resolves to ours:
        // recharts also ships a `DotsProps`, and its shape is not the one a
        // caller of `<Background dots={...} />` needs.
        const seen = declared.get(name);
        if (!seen || (own && !seen.own)) declared.set(name, { node, own });
      }
    });
  }

  /** A union renders as its members; a non-literal member prints its type text. */
  const unionMembers = (node) => {
    const symbol = checker.getSymbolAtLocation(node.name);
    if (!symbol) return null;
    const type = checker.getDeclaredTypeOfSymbol(symbol);
    if (!type.isUnion()) return null;
    const members = type.types.map((t) =>
      t.isStringLiteral() ? t.value : checker.typeToString(t),
    );
    return [...new Set(members)];
  };

  /**
   * An object type renders as its fields, like a mixin.
   *
   * Resolved through the checker rather than read off the syntax, so a type
   * built with `Omit<...>` (`SelectOptionType`) or one that extends another
   * (`ButtonOption`) comes out with the fields it actually has rather than
   * nothing at all. Index signatures come with it: `DataPoint`'s whole point
   * is `[key: string]`, and reading only property signatures dropped it and
   * left the shape looking like it holds one optional label.
   */
  const objectShape = (node) => {
    const symbol = checker.getSymbolAtLocation(node.name);
    if (!symbol) return null;
    const type = checker.getDeclaredTypeOfSymbol(symbol);
    if (type.isUnion()) return null;

    const shape = {};
    for (const index of checker.getIndexInfosOfType(type) ?? []) {
      shape[`[key: ${checker.typeToString(index.keyType)}]`] = checker.typeToString(index.type);
    }
    for (const prop of checker.getPropertiesOfType(type)) {
      const decl = prop.valueDeclaration ?? (prop.declarations && prop.declarations[0]);
      if (!decl || isInNodeModules(decl)) continue; // React/DOM inherited noise
      const t =
        (ts.isPropertySignature(decl) || ts.isPropertyDeclaration(decl)) && decl.type
          ? typeText(decl.type)
          : checker.typeToString(checker.getTypeOfSymbol(prop));
      const optional = (prop.flags & ts.SymbolFlags.Optional) !== 0;
      shape[prop.getName()] = optional ? t : `!${t}`;
    }
    // Past this, the type is a component's whole prop surface rather than a
    // value shape — `SelectOptionType` resolves to 101 fields because Option
    // extends Flex. Inlining that is useless; the alias text is not, because
    // it names the component whose props the spec already documents.
    const keys = Object.keys(shape);
    if (keys.length && keys.length <= 40) return shape;

    if (ts.isTypeAliasDeclaration(node) && node.type) {
      // `AllFlexProps = FlexProps & StyleProps & ...` says everything in one
      // line. `FlexBreakpointProps = BreakpointProps<AllFlexProps, 'gap' | ...>`
      // does not: its text is sixty lines of union members and section
      // comments. The mapped type's own keys are the same information in the
      // form the question actually takes — which props accept a breakpoint
      // object — so emit those instead of the declaration text.
      const text = node.type
        .getText()
        .replace(/\/\/.*$/gm, "")
        .replace(/\s+/g, " ")
        .trim();
      if (text.length <= 120) return text;
      const mapped = checker.getPropertiesOfType(type).map((p) => p.getName());
      if (mapped.length && mapped.length <= 80) return mapped;
      return text;
    }

    // An interface over the cap is one that extends a component's props —
    // `StylePanelRootProps extends Omit<ComponentProps<typeof Column>, ...>`.
    // Its own two members are the whole reason a caller names it; the
    // inherited hundred are already documented on that component. So fall
    // back to what the interface itself declares rather than dropping the
    // type and leaving `StylePanelRootProps["value"]` pointing at nothing.
    if (ts.isInterfaceDeclaration(node)) {
      const own = {};
      for (const member of node.members) {
        if (!ts.isPropertySignature(member) || !member.name) continue;
        const t = member.type ? typeText(member.type) : "unknown";
        own[member.name.getText()] = member.questionToken ? t : `!${t}`;
      }
      if (Object.keys(own).length) return own;
    }
    return null;
  };

  // Resolve to a fixed point: a shape's own fields name further types, and
  // those are exactly the ones an agent needs next. Without this pass
  // `series: SeriesConfig | SeriesConfig[]` named a type the spec never
  // defined, which is how a chart API came out unusable even once its props
  // resolved.
  const types = {};
  let blob = seedBlob;
  for (let pass = 0; pass < 6; pass++) {
    const before = Object.keys(types).length;
    for (const [name, { node, own }] of declared) {
      if (types[name]) continue;
      if (!new RegExp(`\\b${name}\\b`).test(blob)) continue;

      // `ButtonProps` is a component's own surface, already in `components`.
      // Say so rather than inlining it twice or dropping it silently.
      const component = /Props$/.test(name) ? name.replace(/Props$/, "") : null;
      if (component && components[component]) {
        types[name] = `${component} props`;
        continue;
      }

      const union = unionMembers(node);
      const resolved = union ?? (own ? objectShape(node) : null);
      if (!resolved) continue;
      types[name] = resolved;
      blob += "\n" + JSON.stringify(resolved);
    }
    if (Object.keys(types).length === before) break;
  }
  return Object.fromEntries(Object.entries(types).sort(([a], [b]) => a.localeCompare(b)));
}

/**
 * Every prop type in the spec, as one string to scan type names out of.
 *
 * This used to collect capitalised identifiers only, which silently dropped
 * `curveType` and anything else not starting with a capital.
 */
function typeNamesUsed(components, mixins) {
  const parts = [];
  for (const component of Object.values(components)) {
    parts.push(...Object.values(component.props ?? {}).map(String));
  }
  for (const mixin of Object.values(mixins)) {
    parts.push(...Object.values(mixin ?? {}).map(String));
  }
  return parts.join("\n");
}

async function main() {
  const ts = await import("typescript");
  const options = loadTsConfig(ts);
  const rootNames = BARRELS.map((b) => b.file).filter(fs.existsSync);
  const program = ts.createProgram(rootNames, options);
  const checker = program.getTypeChecker();

  const interfacesFile = normalize(path.join(SRC, "interfaces.ts"));

  const mixinsUsed = new Map(); // mixinName -> Map<propName, propString>
  const components = {};
  const warnings = [];

  /** Resolve the function node (arrow/function expr) implementing a component */
  function getComponentFunction(decl) {
    if (ts.isFunctionDeclaration(decl)) return decl;
    if (ts.isVariableDeclaration(decl) && decl.initializer) {
      let init = decl.initializer;
      // unwrap forwardRef(...) / memo(forwardRef(...))
      while (ts.isCallExpression(init)) {
        const arg = init.arguments[0];
        if (!arg) return undefined;
        init = arg;
      }
      if (ts.isArrowFunction(init) || ts.isFunctionExpression(init)) return init;
    }
    return undefined;
  }

  /** Extract destructuring defaults from a component function's first param */
  /** The variable/function declaration exporting `name` from `sf`, if any. */
  function findComponentDecl(sf, name) {
    for (const st of sf.statements) {
      if (ts.isVariableStatement(st)) {
        for (const d of st.declarationList.declarations) {
          if (ts.isIdentifier(d.name) && d.name.getText() === name) return d;
        }
      } else if (ts.isFunctionDeclaration(st) && st.name && st.name.getText() === name) {
        return st;
      }
    }
    return undefined;
  }

  function getDefaults(fn) {
    const defaults = {};
    if (!fn || !fn.parameters.length) return defaults;
    const param = fn.parameters[0];
    if (!ts.isObjectBindingPattern(param.name)) return defaults;
    for (const el of param.name.elements) {
      if (el.initializer && ts.isIdentifier(el.propertyName ?? el.name)) {
        const key = (el.propertyName ?? el.name).getText();
        defaults[key] = cleanDefault(el.initializer.getText());
      }
    }
    return defaults;
  }

  /** Get the props type for a component declaration */
  function getPropsType(decl) {
    // forwardRef<Ref, Props>(...)
    if (
      ts.isVariableDeclaration(decl) &&
      decl.initializer &&
      ts.isCallExpression(decl.initializer)
    ) {
      const call = decl.initializer;
      if (call.typeArguments && call.typeArguments.length >= 2) {
        return checker.getTypeFromTypeNode(call.typeArguments[1]);
      }
    }
    // Object.assign(Component, parts) — a compound component such as
    // StylePanel, whose props are the props of the component it wraps. Without
    // this the export resolves to an intersection with no call signature the
    // branches above recognise, and the component drops out of the spec
    // silently: the docs still build, and only an agent reading the spec
    // notices it is gone.
    if (
      ts.isVariableDeclaration(decl) &&
      decl.initializer &&
      ts.isCallExpression(decl.initializer)
    ) {
      const call = decl.initializer;
      if (call.expression.getText() === "Object.assign" && call.arguments.length) {
        const base = checker.getSymbolAtLocation(call.arguments[0]);
        const baseDecl = base?.valueDeclaration ?? base?.declarations?.[0];
        if (baseDecl) {
          const resolved = getPropsType(baseDecl);
          if (resolved) return resolved;
        }
      }
    }

    // const X: React.FC<Props> = ...
    if (ts.isVariableDeclaration(decl) && decl.type && ts.isTypeReferenceNode(decl.type)) {
      const typeName = decl.type.typeName.getText();
      if (
        /(^|\.)(FC|FunctionComponent)$/.test(typeName) &&
        decl.type.typeArguments &&
        decl.type.typeArguments.length >= 1
      ) {
        return checker.getTypeFromTypeNode(decl.type.typeArguments[0]);
      }
    }
    const fn = getComponentFunction(decl);
    if (fn && fn.parameters.length && fn.parameters[0].type) {
      return checker.getTypeFromTypeNode(fn.parameters[0].type);
    }
    return undefined;
  }

  /** Build the prop string: "type", "type = default", "!type" (required) */
  function propString(propSymbol, decl, defaults) {
    const name = propSymbol.getName();
    let type = "unknown";
    if ((ts.isPropertySignature(decl) || ts.isPropertyDeclaration(decl)) && decl.type) {
      type = typeText(decl.type);
    } else {
      type = checker.typeToString(checker.getTypeOfSymbol(propSymbol));
    }
    const optional = (propSymbol.flags & ts.SymbolFlags.Optional) !== 0;
    let out = optional ? type : `!${type}`;
    if (defaults && defaults[name] !== undefined) {
      out += ` = ${defaults[name]}`;
    }
    return out;
  }

  function processExport(name, symbol, group, importFrom) {
    if (EXCLUDE.has(name)) return;
    if (!/^[A-Z]/.test(name)) return; // components only

    let target = symbol;
    if (target.flags & ts.SymbolFlags.Alias) {
      target = checker.getAliasedSymbol(target);
    }
    const decl = target.valueDeclaration ?? (target.declarations && target.declarations[0]);
    if (!decl) return;
    if (!ts.isVariableDeclaration(decl) && !ts.isFunctionDeclaration(decl)) return;

    const propsType = getPropsType(decl);
    if (!propsType) {
      warnings.push(`No props type resolved for ${name}; skipped`);
      return;
    }

    // For union props (e.g. ButtonProps | AnchorProps) merge member properties
    const typesToScan = propsType.isUnion() ? propsType.types : [propsType];
    const seen = new Map(); // propName -> symbol
    for (const t of typesToScan) {
      for (const p of checker.getPropertiesOfType(t)) {
        if (!seen.has(p.getName())) seen.set(p.getName(), p);
      }
    }

    const ownFile = normalize(decl.getSourceFile().fileName);

    // A component split across `X.tsx` (a lazy shell guarding an optional peer)
    // and `X.impl.tsx` (the real thing) is one component to a consumer. The
    // shell only forwards props, so both the types and the defaults live next
    // door — read them from there and let the shell override.
    const implFile = ownFile.replace(/\.tsx$/, ".impl.tsx");
    const implSf = program.getSourceFile(implFile);
    const implDecl = implSf ? findComponentDecl(implSf, name) : undefined;
    const implDefaults = implDecl ? getDefaults(getComponentFunction(implDecl)) : {};

    const fn = getComponentFunction(decl);
    const defaults = { ...implDefaults, ...getDefaults(fn) };
    const mixins = new Set();
    const extendsComponents = new Set();
    const props = {};

    for (const [propName, propSym] of seen) {
      const pDecl = propSym.valueDeclaration ?? (propSym.declarations && propSym.declarations[0]);
      if (!pDecl) continue;
      if (isInNodeModules(pDecl)) continue; // React/DOM inherited noise

      const declFile = normalize(pDecl.getSourceFile().fileName);

      // `src/interfaces.ts` holds the shared style mixins; a module folder's
      // own `interfaces.ts` (data/, code/) holds what that module's components
      // share. Both are mixins. Only the global one used to be recognised, so
      // ChartProps came out as a phantom `extends: ["interfaces"]`.
      if (declFile === interfacesFile || path.basename(declFile) === "interfaces.ts") {
        // shared mixin prop: attribute to parent interface, emit once globally
        const parent =
          pDecl.parent && ts.isInterfaceDeclaration(pDecl.parent)
            ? pDecl.parent.name.getText()
            : null;
        if (parent) {
          mixins.add(parent);
          if (!mixinsUsed.has(parent)) mixinsUsed.set(parent, new Map());
          if (!mixinsUsed.get(parent).has(propName)) {
            mixinsUsed.get(parent).set(propName, propString(propSym, pDecl, {}));
          }
          // keep component-level default override visible
          if (defaults[propName] !== undefined) {
            props[propName] = propString(propSym, pDecl, defaults);
          }
          continue;
        }
      }

      if (declFile === implFile) {
        props[propName] = propString(propSym, pDecl, defaults);
        continue;
      }

      if (declFile !== ownFile && declFile.includes("/src/")) {
        // declared in another component's file → wrapper relationship
        const base = path.basename(declFile).replace(/\.(tsx|ts)$/, "");
        extendsComponents.add(base);
        continue;
      }

      props[propName] = propString(propSym, pDecl, defaults);
    }

    const entry = { group };
    if (importFrom) entry.importFrom = importFrom;
    if (extendsComponents.size) entry.extends = [...extendsComponents];
    if (mixins.size) entry.mixins = [...mixins].sort();
    if (Object.keys(props).length) entry.props = props;
    components[name] = entry;
  }

  for (const barrel of BARRELS) {
    if (!fs.existsSync(barrel.file)) continue;
    const sf = program.getSourceFile(barrel.file);
    if (!sf) continue;
    const moduleSymbol = checker.getSymbolAtLocation(sf);
    if (!moduleSymbol) continue;
    for (const exp of checker.getExportsOfModule(moduleSymbol)) {
      processExport(exp.getName(), exp, barrel.group, barrel.importFrom);
    }
  }

  // Emit interfaces.ts types referenced by name in prop strings (e.g. FlexBreakpointProps)
  const interfacesSf = program.getSourceFile(path.join(SRC, "interfaces.ts"));
  if (interfacesSf) {
    const declared = new Map();
    interfacesSf.forEachChild((node) => {
      if (ts.isInterfaceDeclaration(node)) declared.set(node.name.getText(), node);
    });
    const allPropStrings = [];
    for (const c of Object.values(components)) {
      if (c.props) allPropStrings.push(...Object.values(c.props));
    }
    for (const m of mixinsUsed.values()) {
      allPropStrings.push(...m.values());
    }
    const blob = allPropStrings.join("\n");
    for (const [ifaceName, node] of declared) {
      if (mixinsUsed.has(ifaceName)) continue;
      if (!new RegExp(`\\b${ifaceName}\\b`).test(blob)) continue;
      const propsMap = new Map();
      for (const member of node.members) {
        if (!ts.isPropertySignature(member) || !member.name) continue;
        const pName = member.name.getText();
        const optional = !!member.questionToken;
        const t = typeText(member.type);
        propsMap.set(pName, optional ? t : `!${t}`);
      }
      mixinsUsed.set(ifaceName, propsMap);
    }
  }

  // Token aliases from types.ts (compact source text)
  const tokens = {};
  const typesSf = program.getSourceFile(path.join(SRC, "types.ts"));
  if (typesSf) {
    typesSf.forEachChild((node) => {
      if (ts.isTypeAliasDeclaration(node) && TOKEN_ALIASES.includes(node.name.getText())) {
        tokens[node.name.getText()] = typeText(node.type);
      }
    });
  }

  // IconName erases to string (Record<string, IconType>) — emit actual keys from icons.ts
  const iconsSf = program.getSourceFile(path.join(SRC, "icons.ts"));
  if (iconsSf) {
    iconsSf.forEachChild((node) => {
      if (!ts.isVariableStatement(node)) return;
      for (const decl of node.declarationList.declarations) {
        if (decl.name.getText() !== "iconLibrary" || !decl.initializer) continue;
        if (!ts.isObjectLiteralExpression(decl.initializer)) continue;
        const names = decl.initializer.properties
          .map((p) => (p.name ? p.name.getText() : null))
          .filter(Boolean);
        tokens.IconName = names.map((n) => `"${n}"`).join(" | ");
      }
    });
  }

  const mixins = {};
  for (const [name, propsMap] of [...mixinsUsed.entries()].sort()) {
    mixins[name] = Object.fromEntries(propsMap);
  }

  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
  // `IconName` reaches the spec as an opaque type name, so an agent had no way
  // to know which icons exist and guessed — which is how the shipped examples
  // ended up asking for "email", "loading" and "github", none of which were
  // registered, each rendering nothing. The vocabulary is listed explicitly.
  const iconNames = Object.keys(
    JSON.parse(fs.readFileSync(path.join(__dirname, "icon-manifest.json"), "utf8")),
  ).sort();

  const types = collectTypeAliases(
    ts,
    program,
    checker,
    typeNamesUsed(components, mixins),
    components,
  );

  const spec = {
    name: pkg.name,
    version: pkg.version,
    generated: new Date().toISOString().split("T")[0],
    format:
      "props are 'type', 'type = default', or '!type' (required). Components with 'mixins' also accept all props of those mixins. 'extends' means all props of that component are accepted. In 'types', an array lists a union's allowed values, an object gives a shape's fields in the same notation as props, and a string is the type as written — usually pointing at a component whose props are already listed.",
    tokens,
    mixins,
    iconNames,
    types,
    components,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(spec, null, 1));

  emitArtifacts(spec, pkg.version);

  const count = Object.keys(components).length;
  console.log(`AI spec generated: ${count} components -> ${path.relative(ROOT, OUT_FILE)}`);
  if (warnings.length) {
    console.log(`Warnings (${warnings.length}):`);
    for (const w of warnings) console.log(`  - ${w}`);
  }
}

/** Post-process Row/Column and emit sliced agent artifacts */
function emitArtifacts(spec, version) {
  const shorthands = {
    fill: { replaces: "fillWidth fillHeight", on: ["Row", "Column", "Flex", "Grid"] },
    fit: { replaces: "fitWidth fitHeight", on: ["Row", "Column", "Flex", "Grid"] },
    center: { replaces: 'horizontal="center" vertical="center"', on: ["Row", "Column", "Flex"] },
    layout: {
      Column: { preferOver: 'Flex direction="column"' },
      Row: { preferOver: 'Flex direction="row"' },
      Flex: { useWhen: "direction changes at breakpoints only" },
    },
  };

  if (spec.components.Row) {
    spec.components.Row.preset = { direction: "row" };
    spec.components.Row.preferOver = 'Flex with direction="row"';
  }
  if (spec.components.Column) {
    spec.components.Column.preset = { direction: "column" };
    spec.components.Column.preferOver = 'Flex with direction="column"';
  }
  spec.shorthands = shorthands;

  fs.writeFileSync(OUT_FILE, JSON.stringify(spec, null, 1));

  const seedPath = path.join(OUT_DIR, "catalog.seed.json");
  const seed = fs.existsSync(seedPath) ? JSON.parse(fs.readFileSync(seedPath, "utf8")) : {};

  const catalog = { version, generated: spec.generated, components: {} };
  for (const [name, entry] of Object.entries(spec.components)) {
    const meta = seed[name] || {};
    catalog.components[name] = {
      group: entry.group,
      extends: entry.extends,
      purpose: meta.purpose || `${name} component`,
      tags: meta.tags || [entry.group],
      ...(meta.avoid ? { avoid: meta.avoid } : {}),
      ...(meta.preferOver ? { preferOver: meta.preferOver } : {}),
      ...(meta.pairsWith ? { pairsWith: meta.pairsWith } : {}),
    };
  }
  fs.writeFileSync(path.join(OUT_DIR, "catalog.json"), JSON.stringify(catalog, null, 1));

  const componentsDir = path.join(OUT_DIR, "components");
  fs.mkdirSync(componentsDir, { recursive: true });
  for (const [name, entry] of Object.entries(spec.components)) {
    const slice = {
      name,
      ...entry,
      mixinsRef: entry.mixins || [],
      tokensRef: Object.keys(entry.mixins || []).length ? "see spec.json mixins" : undefined,
    };
    if (slice.mixins) {
      slice.resolvedMixins = {};
      for (const mixin of slice.mixins) {
        if (spec.mixins[mixin]) slice.resolvedMixins[mixin] = spec.mixins[mixin];
      }
    }
    fs.writeFileSync(path.join(componentsDir, `${name}.json`), JSON.stringify(slice, null, 1));
  }

  const manifest = {
    version,
    generated: spec.generated,
    files: {
      spec: "spec.json",
      catalog: "catalog.json",
      rules: "rules.compact.md",
      rulesFull: "rules.md",
      recipes: "recipes.md",
      layouts: "layouts.md",
      gotchas: "gotchas.json",
      tasks: "tasks/index.json",
      examples: "examples/",
      blocks: "examples/blocks/manifest.json",
      components: "components/",
    },
    bootstrap: ["rules.compact.md", "catalog.json"],
    resolve: "tasks/index.json",
  };
  fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 1));

  syncDocsPublic();
  console.log(`AI artifacts: catalog + ${Object.keys(spec.components).length} component slices`);
}

function syncDocsPublic() {
  const docsAi = path.join(ROOT, "../../apps/docs/public/ai");
  if (!fs.existsSync(path.dirname(docsAi))) return;
  copyDir(OUT_DIR, docsAi);
  console.log(`Synced AI artifacts -> ${path.relative(ROOT, docsAi)}`);
}

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
