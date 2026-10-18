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
// 3.0 (F8, F10): the effects and the blocks are packages of their own, built
// on core. An agent still has to find them, so the spec documents them beside
// core's components, each with the package as its `importFrom`. In the
// workspace their sources sit next to core's.
const FX_SRC = path.join(ROOT, "..", "fx", "src");
const BLOCKS_SRC = path.join(ROOT, "..", "blocks", "src");
const SOURCE_ROOTS = [SRC, FX_SRC, BLOCKS_SRC];
const OUT_DIR = path.join(ROOT, "ai");
const OUT_FILE = path.join(OUT_DIR, "spec.json");

// The subpath barrels are listed separately because they are not re-exported
// from the root: `data`, `code` and `media` pull in recharts, prismjs and
// compressorjs, which a bundler resolves whenever it walks the root barrel,
// and `emoji` its dataset. `media` also holds the players, Scrubber and
// CompareImage (3.0). Without them here an agent would never learn these
// components exist, so each carries the specifier to import it from.
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
  // 3.0: EmojiPicker carries ~270 KB of emoji data, so it has a subpath of
  // its own and is not on the root barrel.
  {
    file: path.join(SRC, "modules", "emoji", "index.ts"),
    group: "emoji",
    importFrom: "@once-ui-system/core/emoji",
  },
  // The hooks are root exports, but no barrel above reaches them, so an
  // agent never learned `useHotkeys` or `useInViewport` existed except from
  // prose in the rules.
  { file: path.join(SRC, "hooks", "index.ts"), group: "hooks" },
  // The providers and their hooks are root exports too. Without this an
  // agent knew `ThemeProvider` only from the layouts and never saw
  // `useToast`, `useTheme` or `useStyle` with a signature.
  { file: path.join(SRC, "contexts", "index.ts"), group: "contexts" },
  // 2.1's entry points. `/mdx` renders code through `/code`, so it is a
  // subpath of its own; `/next` holds the Next.js adapters and the OG route
  // handlers; `/config` is `defineConfig` with no component code behind it,
  // for an app's `once-ui.config` (the root exports it too).
  {
    file: path.join(SRC, "modules", "mdx", "index.ts"),
    group: "mdx",
    importFrom: "@once-ui-system/core/mdx",
  },
  {
    file: path.join(SRC, "next", "index.ts"),
    group: "next",
    importFrom: "@once-ui-system/core/next",
  },
  {
    file: path.join(SRC, "config.ts"),
    group: "config",
    importFrom: "@once-ui-system/core/config",
  },
  { file: path.join(FX_SRC, "index.ts"), group: "fx", importFrom: "@once-ui-system/fx" },
  {
    file: path.join(BLOCKS_SRC, "index.ts"),
    group: "blocks",
    importFrom: "@once-ui-system/blocks",
  },
];

/**
 * Every entry point an app imports from, for the manifest's `imports`. The
 * exports of each subpath are filled in from the spec, so the table cannot
 * name something the entry does not have. `peer` is the optional peer the
 * app installs for it; `install` is the package itself, for an entry that is
 * not part of core.
 */
const ENTRY_POINTS = [
  {
    specifier: "@once-ui-system/core",
    use: "Components, hooks, providers, defineConfig and types: everything not listed below",
  },
  {
    specifier: "@once-ui-system/core/data",
    use: "Charts, gauges and chart chrome",
    peer: "recharts",
  },
  { specifier: "@once-ui-system/core/code", use: "CodeBlock", peer: "prismjs" },
  {
    specifier: "@once-ui-system/core/media",
    use: "Media components off the root: MediaAudioPlayer, MediaVideoPlayer, Scrubber, CompareImage, and MediaUpload (which needs compressorjs)",
    peer: "compressorjs",
  },
  {
    specifier: "@once-ui-system/core/emoji",
    use: "EmojiPicker, with its emoji dataset off the root",
  },
  {
    specifier: "@once-ui-system/core/mdx",
    use: "MDX content through Once UI: mdxComponents for next-mdx-remote or @next/mdx, createMdxComponents(overrides) to replace elements or register tags, and the Mdx* elements to wrap",
    peer: "prismjs",
  },
  {
    specifier: "@once-ui-system/core/next",
    use: "Next.js apps: LayoutProvider with next/link and next/image (the root one renders plain <a> and <img>), and the OG route handlers for app/api/og/*/route.ts",
    peer: "next",
  },
  {
    specifier: "@once-ui-system/core/config",
    use: "defineConfig and the OnceUIConfig types with no component code behind them, for once-ui.config (the root exports them too)",
  },
  {
    specifier: "@once-ui-system/fx",
    use: "The effects (RevealFx, CountFx, TypeFx, MatrixFx, Effect and the other *Fx): a package of its own, built on core",
    install: "@once-ui-system/fx",
  },
  {
    specifier: "@once-ui-system/blocks",
    use: "Compositions: Banner, Book, LogoCloud, ScrollToTop, StylePanel and StyleOverlay: a package of its own, built on core",
    install: "@once-ui-system/blocks",
  },
];

// Lower-case exports that are plumbing rather than API: the HOC and context
// hook behind the excluded ArrowNavigation, a test reset, and the function
// `Meta.generate` already documents.
const FUNCTION_EXCLUDE = new Set([
  "withArrowNavigation",
  "useArrowNavigationContext",
  "resetScrollLockState",
  "createMetadata",
]);

// Internal/low-level exports that AI should not use directly. `ThemeInit`,
// `Meta`, `FocusTrap` and `ScrollLock` used to be listed here as well, which
// left an agent with no slice for the script that prevents a theme flash, the
// metadata helper every page uses, or the two primitives an overlay is built
// from — all four are public, documented API.
const EXCLUDE = new Set([
  "ServerFlex",
  "ClientFlex",
  "ServerGrid",
  "ClientGrid",
  "ElementType",
  "ArrowNavigation",
  // Deprecated alias of ParticleFx, kept for 2.x consumers; not for new code.
  "Particle",
]);

// Token aliases worth defining once in the spec (read from types.ts source)
const TOKEN_ALIASES = [
  "SpacingToken",
  "StaticSpacingToken",
  "ResponsiveSpacingToken",
  "TShirtSizes",
  "FieldSize",
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
  // fx and blocks import `@once-ui-system/core`, which resolves to core's
  // `dist` through the workspace link, and the build runs this script after
  // `dist` is cleaned. Read core's sources instead, so a prop the effects
  // inherit (`extends Flex`) is the same declaration core's components share.
  const paths = { ...parsed.options.paths, "@once-ui-system/core": [path.join(SRC, "index.ts")] };
  return { ...parsed.options, paths };
}

function isInNodeModules(decl) {
  return decl.getSourceFile().fileName.includes("node_modules");
}

function normalize(p) {
  return p.replace(/\\/g, "/");
}

/**
 * Is a source file one of the package's own? TypeScript names files with
 * forward slashes on every platform; `SRC` comes from `path.join`, which uses
 * backslashes on Windows, and a drive letter can come back in either case.
 * Compared as they were, no file was "own" on Windows, so a build there wrote
 * a spec with no `types` — and the validator's checks that read them went
 * quiet.
 */
function isOwnSource(fileName, src = SRC, platform = process.platform) {
  const file = normalize(fileName);
  const root = `${normalize(src).replace(/\/$/, "")}/`;
  return platform === "win32"
    ? file.toLowerCase().startsWith(root.toLowerCase())
    : file.startsWith(root);
}

/** One of the documented packages' sources: core's, fx's or blocks'. */
const isDocumentedSource = (fileName) => SOURCE_ROOTS.some((src) => isOwnSource(fileName, src));

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
  // An empty string stays visible: `string = ` read as a missing default.
  if (/^(?:""|'')$/.test(t)) return '""';
  if (/^["'].*["']$/.test(t)) return t.slice(1, -1);
  return t;
}

/** Compact a type-node source text: collapse whitespace, strip leading pipe */
function typeText(node) {
  if (!node) return "unknown";
  return atDefaults(node, node.getText())
    .replace(/\s*\n\s*/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/^\|\s*/, "");
}

/**
 * A member of a generic declaration reads at its defaults: `ChartProps<T =
 * DataPoint>`'s `data: T[]` is documented as `DataPoint[]`, the shape a caller
 * who passes no row type gets, rather than a `T` the spec never defines.
 */
function atDefaults(node, text) {
  for (let n = node.parent; n; n = n.parent) {
    // Interfaces and type aliases only: a generic function keeps its own `<T>` signature.
    if (!n.typeParameters?.length || "parameters" in n || !("members" in n || "type" in n))
      continue;
    // A bare parameter (`as?: T`) is any of its constraint, not just the default.
    const bare = n.typeParameters.find((p) => p.name.getText() === text.trim());
    if (bare?.constraint) return bare.constraint.getText();
    let out = text;
    for (const p of n.typeParameters) {
      if (!p.default) continue;
      out = out.replace(new RegExp(`\\b${p.name.getText()}\\b`, "g"), p.default.getText());
    }
    return out;
  }
  return text;
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
    const own = !file.isDeclarationFile && isDocumentedSource(file.fileName);
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
    // A union this long is a key list like `keyof JSX.IntrinsicElements`
    // (MdxTag): its text says what it is in a few words, where its members
    // would be every HTML tag. TextVariant, the longest real vocabulary, has 100.
    if (members.length > 150 && ts.isTypeAliasDeclaration(node) && node.type) {
      return typeText(node.type);
    }
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
    // A short generic alias over its parameter (`SeriesKey<T> = Extract<keyof
    // T, string>`) has no shape of its own until applied: its text is the answer.
    if (
      ts.isTypeAliasDeclaration(node) &&
      node.typeParameters?.length &&
      node.type &&
      !ts.isMappedTypeNode(node.type) &&
      !ts.isTypeLiteralNode(node.type)
    ) {
      const text = typeText(node.type);
      if (text.length <= 120) return text;
    }

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

    // A generic mapped type (`CheckedConfig<T>`, behind `defineConfig`) has
    // no fields until it is applied, and its text is type-level machinery in
    // terms of `T`. The parameter it constrains (`OnceUIConfig`) is what a
    // caller needs, and that resolves on its own.
    if (ts.isTypeAliasDeclaration(node) && node.typeParameters?.length && !keys.length) {
      return null;
    }

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
      // `Icon` in a prop's text is the component. Next's metadata types,
      // which `/next` brings into the program, declare an `Icon` of their own.
      if (components[name]) continue;
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
function typeNamesUsed(components, mixins, functions = {}) {
  const parts = [];
  for (const component of Object.values(components)) {
    parts.push(...Object.values(component.props ?? {}).map(String));
    if (component.returns) parts.push(component.returns);
  }
  for (const mixin of Object.values(mixins)) {
    parts.push(...Object.values(mixin ?? {}).map(String));
  }
  // A function's options type (`UseHotkeysOptions`, `OgFetchRouteOptions`)
  // is as much a part of its API as a component's prop types are of its.
  for (const fn of Object.values(functions)) {
    parts.push(fn.signature ?? fn.type ?? "");
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
  // componentName -> Map<base, { propName: propString }>: the props a
  // component takes from another file's declarations, kept so a base that is
  // no public component (internal/controlChrome.ts, the internal
  // InteractiveDetails, ServerFlex) can be listed inline instead of named.
  const inherited = new Map();
  const functions = {};
  const entryTypes = new Map(); // importFrom -> Set<type name>
  const warnings = [];

  /**
   * A declaration's initializer without `as` casts, `satisfies` and
   * parentheses: `forwardRef(...) as unknown as Signature` is still a
   * forwardRef call, and without this it resolved no props and dropped out
   * of the spec.
   */
  function initializerOf(decl) {
    let init = decl.initializer;
    while (
      init &&
      (ts.isAsExpression(init) ||
        ts.isParenthesizedExpression(init) ||
        (ts.isSatisfiesExpression && ts.isSatisfiesExpression(init)))
    ) {
      init = init.expression;
    }
    return init;
  }

  /** Resolve the function node (arrow/function expr) implementing a component */
  function getComponentFunction(decl) {
    if (ts.isFunctionDeclaration(decl)) return decl;
    if (ts.isVariableDeclaration(decl) && decl.initializer) {
      let init = decl.initializer;
      // `Impl as unknown as Signature`: the function is Impl's.
      if (ts.isAsExpression(init)) {
        while (ts.isAsExpression(init) || ts.isParenthesizedExpression(init))
          init = init.expression;
        if (ts.isIdentifier(init)) {
          const base = checker.getSymbolAtLocation(init);
          const baseDecl = base?.valueDeclaration ?? base?.declarations?.[0];
          return baseDecl && baseDecl !== decl ? getComponentFunction(baseDecl) : undefined;
        }
      }
      init = initializerOf(decl);
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

  /**
   * An exported object of helpers rather than a component — `Meta` is
   * `{ generate: generateMetadata }` — is documented by its call: the first
   * member that is a function with a typed argument, whose argument stands in
   * for props. Without this it resolved no props type and was dropped.
   */
  function helperCall(decl) {
    if (!ts.isVariableDeclaration(decl) || !decl.initializer) return undefined;
    if (!ts.isObjectLiteralExpression(decl.initializer)) return undefined;
    for (const member of decl.initializer.properties) {
      let fn;
      if (ts.isMethodDeclaration(member)) {
        fn = member;
      } else if (ts.isPropertyAssignment(member) || ts.isShorthandPropertyAssignment(member)) {
        const value = ts.isPropertyAssignment(member) ? member.initializer : undefined;
        if (value && (ts.isArrowFunction(value) || ts.isFunctionExpression(value))) {
          fn = value;
        } else {
          const symbol = value
            ? checker.getSymbolAtLocation(value)
            : checker.getShorthandAssignmentValueSymbol(member);
          const target =
            symbol && symbol.flags & ts.SymbolFlags.Alias
              ? checker.getAliasedSymbol(symbol)
              : symbol;
          const valueDecl = target?.valueDeclaration;
          if (valueDecl && ts.isFunctionDeclaration(valueDecl)) fn = valueDecl;
        }
      }
      if (fn?.parameters?.[0]?.type) return { member: member.name.getText(), fn };
    }
    return undefined;
  }

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
    let pattern = param.name;
    // `(props, ref) => { const { a = 1, ...rest } = props as P; ... }`
    if (ts.isIdentifier(pattern) && fn.body && ts.isBlock(fn.body)) {
      for (const st of fn.body.statements) {
        if (!ts.isVariableStatement(st)) continue;
        for (const d of st.declarationList.declarations) {
          let init = d.initializer;
          while (init && (ts.isAsExpression(init) || ts.isParenthesizedExpression(init))) {
            init = init.expression;
          }
          if (
            ts.isObjectBindingPattern(d.name) &&
            init &&
            ts.isIdentifier(init) &&
            init.text === pattern.text
          ) {
            pattern = d.name;
          }
        }
      }
    }
    if (!ts.isObjectBindingPattern(pattern)) return defaults;
    for (const el of pattern.elements) {
      if (el.initializer && ts.isIdentifier(el.propertyName ?? el.name)) {
        const key = (el.propertyName ?? el.name).getText();
        defaults[key] = cleanDefault(el.initializer.getText());
      }
    }
    return defaults;
  }

  /** Get the props type for a component declaration */
  function getPropsType(decl) {
    // const X = Impl as unknown as SomeSignature: the props are Impl's. Slider
    // casts its forwardRef to one call signature per mode, so that the ref is
    // typed per mode.
    if (ts.isVariableDeclaration(decl) && decl.initializer && ts.isAsExpression(decl.initializer)) {
      let inner = decl.initializer;
      while (ts.isAsExpression(inner) || ts.isParenthesizedExpression(inner))
        inner = inner.expression;
      if (ts.isIdentifier(inner)) {
        const base = checker.getSymbolAtLocation(inner);
        const baseDecl = base?.valueDeclaration ?? base?.declarations?.[0];
        if (baseDecl && baseDecl !== decl) {
          const resolved = getPropsType(baseDecl);
          if (resolved) return resolved;
        }
      }
    }
    // forwardRef<Ref, Props>(...)
    if (
      ts.isVariableDeclaration(decl) &&
      decl.initializer &&
      ts.isCallExpression(initializerOf(decl))
    ) {
      const call = initializerOf(decl);
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

  /** The first sentence of a symbol's JSDoc, on one line. */
  function summaryOf(symbol) {
    const text = ts
      .displayPartsToString(symbol.getDocumentationComment(checker))
      .replace(/```[\s\S]*?```/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) return undefined;
    // A sentence ends where the next one starts with a capital or code, not
    // at the `?` of `faviconUrl? }`.
    const first = /^(.+?[.!?])(?=\s+[A-Z`]|$)/.exec(text)?.[1] ?? text;
    return first.length > 200 ? `${first.slice(0, 197)}...` : first;
  }

  /**
   * `(keys: string | readonly string[], callback: ..., options?: UseHotkeysOptions) => void`,
   * written from the declaration so a parameter keeps the type name it was
   * written with (`OgFetchRouteOptions`, not the alias it resolves to) and a
   * destructured options object reads as `options`.
   */
  function signatureOf(fn) {
    const typeParams = fn.typeParameters?.length
      ? `<${fn.typeParameters.map((p) => p.getText()).join(", ")}>`
      : "";
    const params = fn.parameters.map((p) => {
      const name = ts.isIdentifier(p.name) ? p.name.getText() : "options";
      const optional = p.questionToken || p.initializer ? "?" : "";
      const type = p.type ? typeText(p.type) : checker.typeToString(checker.getTypeAtLocation(p));
      return `${p.dotDotDotToken ? "..." : ""}${name}${optional}: ${type}`;
    });
    const signature = checker.getSignatureFromDeclaration(fn);
    const returns = fn.type
      ? typeText(fn.type)
      : signature
        ? checker.typeToString(checker.getReturnTypeOfSignature(signature))
        : "unknown";
    return `${typeParams}(${params.join(", ")}) => ${returns}`;
  }

  /**
   * A hook, a function or a constant: what `defineConfig`, `useHotkeys`,
   * `createMdxComponents` and the OG route factories are. The spec only had
   * components, so an agent learned these existed from prose at best, and
   * never where to import them from.
   */
  function processFunction(name, target, group, importFrom) {
    if (FUNCTION_EXCLUDE.has(name)) return;
    const decl = target.valueDeclaration ?? (target.declarations && target.declarations[0]);
    if (!decl) return;
    const fn = ts.isFunctionDeclaration(decl) ? decl : getComponentFunction(decl);
    const entry = { group };
    if (importFrom) entry.importFrom = importFrom;
    if (fn) {
      entry.kind = /^use[A-Z]/.test(name) ? "hook" : "function";
      entry.signature = signatureOf(fn);
    } else if (ts.isVariableDeclaration(decl)) {
      entry.kind = "value";
      entry.type = decl.type
        ? typeText(decl.type)
        : checker.typeToString(checker.getTypeOfSymbol(target));
    } else {
      return;
    }
    const doc = summaryOf(target);
    if (doc) entry.doc = doc;
    functions[name] = entry;
  }

  function processExport(name, symbol, group, importFrom) {
    if (EXCLUDE.has(name)) return;

    let target = symbol;
    if (target.flags & ts.SymbolFlags.Alias) {
      target = checker.getAliasedSymbol(target);
    }

    if (!(target.flags & ts.SymbolFlags.Value)) {
      // A type-only export: listed with its entry point, so `OnceUIConfig`
      // and `MdxComponents` are known to exist and where they come from.
      if (importFrom) {
        if (!entryTypes.has(importFrom)) entryTypes.set(importFrom, new Set());
        entryTypes.get(importFrom).add(name);
      }
      return;
    }
    // Lower-case exports and SCREAMING_CASE constants are not components.
    if (!/^[A-Z]/.test(name) || /^[A-Z][A-Z0-9_]+$/.test(name)) {
      processFunction(name, target, group, importFrom);
      return;
    }
    const decl = target.valueDeclaration ?? (target.declarations && target.declarations[0]);
    if (!decl) return;
    if (!ts.isVariableDeclaration(decl) && !ts.isFunctionDeclaration(decl)) return;

    const helper = helperCall(decl);
    const propsType = helper
      ? checker.getTypeFromTypeNode(helper.fn.parameters[0].type)
      : getPropsType(decl);
    if (!propsType) {
      warnings.push(`No props type resolved for ${name}; skipped`);
      return;
    }

    // For union props (e.g. ButtonProps | AnchorProps) merge member properties
    const typesToScan = propsType.isUnion() ? propsType.types : [propsType];
    const seen = new Map(); // propName -> symbol
    // Every member's declaration of a prop, so a prop whose type differs by
    // mode (Slider's `value`: a number, or with `range` a tuple) lists each.
    const variants = new Map();
    for (const t of typesToScan) {
      for (const p of checker.getPropertiesOfType(t)) {
        if (!seen.has(p.getName())) seen.set(p.getName(), p);
        const d = p.valueDeclaration ?? p.declarations?.[0];
        if (d && (ts.isPropertySignature(d) || ts.isPropertyDeclaration(d)) && d.type) {
          if (!variants.has(p.getName())) variants.set(p.getName(), []);
          const text = typeText(d.type);
          if (!variants.get(p.getName()).includes(text)) variants.get(p.getName()).push(text);
        }
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
    // `Flex` and `Grid` pick a client or server render and forward everything
    // to `ServerFlex`/`ServerGrid`, which hold the defaults (`position =
    // "relative"`, …). Without them the spec had no defaults for either.
    const serverSf = program.getSourceFile(
      path.join(path.dirname(ownFile), `Server${name}.tsx`).split(path.sep).join("/"),
    );
    const serverDecl = serverSf ? findComponentDecl(serverSf, `Server${name}`) : undefined;
    // Only the defaults that tell a reader something: `fill = false` and
    // `as = div` restate what leaving a prop off means, in every slice.
    const serverDefaults = Object.fromEntries(
      Object.entries(serverDecl ? getDefaults(getComponentFunction(serverDecl)) : {}).filter(
        ([, value]) => value !== "false" && value !== "div",
      ),
    );

    const fn = helper ? helper.fn : getComponentFunction(decl);
    const defaults = { ...serverDefaults, ...implDefaults, ...getDefaults(fn) };
    const mixins = new Set();
    const mixinMembers = new Map(); // mixin -> [propName, propString, declared member count]
    const extendsComponents = new Set();
    const props = {};

    for (const [propName, propSym] of seen) {
      // 3.0 components take `ref` as a prop, declared beside their own props
      // where `forwardRef` used to add it. Every component that renders an
      // element takes one, so listing it would say nothing per component.
      if (propName === "ref") continue;
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
          if (!mixinMembers.has(parent)) {
            mixinMembers.set(parent, {
              declared: pDecl.parent.members
                .filter((m) => ts.isPropertySignature(m) && m.name)
                .map((m) => m.name.getText()),
              seen: [],
            });
          }
          mixinMembers.get(parent).seen.push([propName, propSym, pDecl]);
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
        // ...unless that file is the same-named component this one re-exports
        // with something added: `/next`'s LayoutProvider is the context's
        // LayoutProvider with the Next adapters installed, and "LayoutProvider
        // extends LayoutProvider" names nothing the spec documents.
        if (base !== name) {
          extendsComponents.add(base);
          if (!inherited.has(name)) inherited.set(name, new Map());
          const byBase = inherited.get(name);
          if (!byBase.has(base)) byBase.set(base, {});
          byBase.get(base)[propName] = propString(propSym, pDecl, defaults);
          continue;
        }
      }

      props[propName] = propString(propSym, pDecl, defaults);
    }

    // A component that takes a few props of a mixin (`Pick<SpacingProps,
    // "marginTop" | ...>`, as the MDX elements do) lists those few. Naming
    // the whole mixin would promise the paddings and the rest it never takes.
    // Only a prop the type does not have at all counts as left out: a mixin's
    // `className` shadowed by the DOM's own is still taken.
    for (const [parent, { declared, seen: taken }] of mixinMembers) {
      const missing = declared.filter((member) => !seen.has(member));
      if (missing.length * 2 <= declared.length) continue;
      mixins.delete(parent);
      for (const [propName, propSym, pDecl] of taken) {
        props[propName] = propString(propSym, pDecl, defaults);
      }
    }

    for (const [propName, value] of Object.entries(props)) {
      const types = variants.get(propName);
      if (!types || types.length < 2) continue;
      const split = value.lastIndexOf(" = ");
      const fallback = split === -1 ? "" : value.slice(split);
      // `undefined` is how a member says "not in this mode"; the prop is optional anyway.
      let merged = [
        ...new Set(types.map((t) => t.replace(/^React\.ReactNode$/, "ReactNode"))),
      ].filter((t) => t !== "undefined");
      if (merged.includes("false") && merged.includes("true"))
        merged = ["boolean", ...merged.filter((t) => t !== "true" && t !== "false")];
      if (merged.length < 2) {
        if (merged.length === 1) props[propName] = `${merged[0]}${fallback}`;
        continue;
      }
      props[propName] =
        `${merged.map((t) => (t.includes("=>") ? `(${t})` : t)).join(" | ")}${fallback}`;
    }

    const entry = { group };
    if (importFrom) entry.importFrom = importFrom;
    if (helper) {
      // Not rendered: called. `props` are the argument of this call.
      entry.call = `${name}.${helper.member}(props)`;
      if (helper.fn.type) entry.returns = typeText(helper.fn.type);
    }
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

  // "extends" promises "all props of that component", so it can only name a
  // component the spec lists. A base that is not one (an internal file since
  // 3.0) is listed inline: Checkbox's `size`, `error` and `errorMessage` come
  // from internal/controlChrome.ts and used to vanish behind
  // `extends: ["controlChrome"]`.
  for (const [name, byBase] of inherited) {
    const entry = components[name];
    if (!entry || !entry.extends) continue;
    const kept = [];
    for (const base of entry.extends) {
      if (components[base]) {
        kept.push(base);
        continue;
      }
      entry.props = { ...byBase.get(base), ...entry.props };
    }
    if (kept.length) entry.extends = kept;
    else delete entry.extends;
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
    typeNamesUsed(components, mixins, functions),
    components,
  );

  const spec = {
    name: pkg.name,
    version: pkg.version,
    generated: new Date().toISOString().split("T")[0],
    format:
      "props are 'type', 'type = default', or '!type' (required). Components with 'mixins' also accept all props of those mixins. 'extends' means all props of that component are accepted. In 'types', an array lists a union's allowed values, an object gives a shape's fields in the same notation as props, and a string is the type as written — usually pointing at a component whose props are already listed. 'functions' are the hooks, functions and constants, each with its signature (or type) and the first line of its docs. Anything with 'importFrom' is imported from that specifier, not the package root; '@once-ui-system/fx' and '@once-ui-system/blocks' are packages of their own, installed beside core.",
    tokens,
    mixins,
    iconNames,
    types,
    components,
    functions,
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(spec, null, 1));

  emitArtifacts(spec, pkg.version, entryTypes);

  const count = Object.keys(components).length;
  console.log(
    `AI spec generated: ${count} components, ${Object.keys(functions).length} functions -> ${path.relative(ROOT, OUT_FILE)}`,
  );
  if (warnings.length) {
    console.log(`Warnings (${warnings.length}):`);
    for (const w of warnings) console.log(`  - ${w}`);
  }
}

/** Post-process Row/Column and emit sliced agent artifacts */
function emitArtifacts(spec, version, entryTypes) {
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

  // The catalog's purposes, tags and pairings are written by hand in the
  // seed; everything else comes from the spec. The seed was deleted once and
  // the fallback below quietly turned all 140 purposes into "X component" —
  // a catalog that tells an agent nothing — so a missing seed entry is now
  // reported, as is an entry for a component that no longer exists.
  const seedPath = path.join(OUT_DIR, "catalog.seed.json");
  const seed = fs.existsSync(seedPath) ? JSON.parse(fs.readFileSync(seedPath, "utf8")) : {};
  const unseeded = Object.keys(spec.components).filter((name) => !seed[name]?.purpose);
  const stale = Object.keys(seed).filter((name) => !spec.components[name]);
  if (unseeded.length) {
    console.warn(`catalog.seed.json has no purpose for: ${unseeded.join(", ")}`);
  }
  if (stale.length) {
    console.warn(
      `catalog.seed.json describes components the spec does not have: ${stale.join(", ")}`,
    );
  }

  // The catalog is half of the bootstrap every agent loads, so it says only
  // what picking a component needs: its purpose, where it is imported from
  // when that is not the root, and the one-line warnings. Tags, pairings and
  // `extends` used to ride here too and made it 40 KB, read in full on every
  // benchmark run; they live in the slices now, read only for the components
  // an agent actually uses.
  const catalog = { version, generated: spec.generated, components: {} };
  for (const [name, entry] of Object.entries(spec.components)) {
    const meta = seed[name] || {};
    catalog.components[name] = {
      purpose: meta.purpose || `${name} component`,
      // A component that does not come from the package root says where it
      // does come from, since naming it from the root does not resolve.
      ...(entry.importFrom ? { importFrom: entry.importFrom } : {}),
      ...(meta.avoid ? { avoid: meta.avoid } : {}),
      ...(meta.preferOver ? { preferOver: meta.preferOver } : {}),
    };
  }
  // One component per line, so the catalog still diffs per component.
  const entries = Object.entries(catalog.components).map(
    ([name, entry]) => `  ${JSON.stringify(name)}: ${JSON.stringify(entry)}`,
  );
  // The icon vocabulary rides in the catalog too. It used to live only in
  // spec.json, so an agent that needed one icon name read the whole spec
  // (about 37k tokens) to find it — most of what an agent read in the 2.1
  // benchmark pilot. A hundred names on one line cost a few hundred tokens.
  fs.writeFileSync(
    path.join(OUT_DIR, "catalog.json"),
    `{\n "version": ${JSON.stringify(catalog.version)},\n "generated": ${JSON.stringify(catalog.generated)},\n "iconNames": ${JSON.stringify(spec.iconNames)},\n "components": {\n${entries.join(",\n")}\n }\n}`,
  );

  // A slice names types (`!AccordionItem[]`, `DataPoint[]`) that were defined
  // only in spec.json, so an agent that met one opened the 131 KB spec to look
  // it up: 50 of 60 runs in the 2.1.0-rc.0 benchmark, and almost half of all it
  // read. Each slice now carries every type it reaches, nested ones included.
  const typesFor = (value) => {
    const found = new Set();
    let frontier = [value];
    while (frontier.length) {
      const next = [];
      for (const item of frontier) {
        for (const [word] of JSON.stringify(item ?? null).matchAll(/[A-Za-z_][A-Za-z0-9_]*/g)) {
          if (!Object.hasOwn(spec.types, word) || found.has(word)) continue;
          found.add(word);
          next.push(spec.types[word]);
        }
      }
      frontier = next;
    }
    return Object.fromEntries([...found].sort().map((name) => [name, spec.types[name]]));
  };

  const componentsDir = path.join(OUT_DIR, "components");
  fs.mkdirSync(componentsDir, { recursive: true });
  const slices = {};
  for (const [name, entry] of Object.entries(spec.components)) {
    const meta = seed[name] || {};
    const slice = {
      name,
      ...entry,
      ...(meta.tags ? { tags: meta.tags } : {}),
      ...(meta.pairsWith ? { pairsWith: meta.pairsWith } : {}),
      ...(meta.avoid ? { avoid: meta.avoid } : {}),
      ...(meta.preferOver ? { preferOver: meta.preferOver } : {}),
      mixinsRef: entry.mixins || [],
      tokensRef: Object.keys(entry.mixins || []).length ? "see tokens.json" : undefined,
    };
    if (slice.mixins) {
      slice.resolvedMixins = {};
      for (const mixin of slice.mixins) {
        if (spec.mixins[mixin]) slice.resolvedMixins[mixin] = spec.mixins[mixin];
      }
    }
    const types = typesFor([entry.props, entry.returns]);
    if (Object.keys(types).length) slice.types = types;
    slices[name] = slice;
    fs.writeFileSync(path.join(componentsDir, `${name}.json`), JSON.stringify(slice, null, 1));
  }
  // A slice for a component the spec no longer has (removed or renamed
  // since it was written) would still be read as the API: drop it.
  for (const file of fs.readdirSync(componentsDir)) {
    if (file.endsWith(".json") && !(file.slice(0, -5) in spec.components)) {
      fs.rmSync(path.join(componentsDir, file));
    }
  }

  // What the slices point at instead of spec.json: the design tokens, mixins
  // and shorthands, and the hooks and functions with the types they name.
  fs.writeFileSync(
    path.join(OUT_DIR, "tokens.json"),
    JSON.stringify(
      { tokens: spec.tokens, mixins: spec.mixins, shorthands: spec.shorthands },
      null,
      1,
    ),
  );
  fs.writeFileSync(
    path.join(OUT_DIR, "functions.json"),
    JSON.stringify({ functions: spec.functions, types: typesFor(spec.functions) }, null, 1),
  );

  // One file per task: the hand-written bundle in tasks/ with every slice,
  // type, mixin and gotcha it names folded in. An agent loop re-sends all it
  // has read on every call, so one read of the bundle costs far less than the
  // dozen slice reads it replaces (11 calls and 13 slices a run in the
  // benchmark). Mixins and types are shared by many slices, so they are
  // listed once at the top instead of once per component.
  const bundlesDir = path.join(OUT_DIR, "bundles");
  fs.rmSync(bundlesDir, { recursive: true, force: true });
  fs.mkdirSync(bundlesDir, { recursive: true });
  const gotchas = JSON.parse(fs.readFileSync(path.join(OUT_DIR, "gotchas.json"), "utf8"));
  // The rules ride inside every Markdown bundle, minus their opening
  // paragraphs about which files to load, which a bundle reader has done.
  const rulesCompact = fs.readFileSync(path.join(OUT_DIR, "rules.compact.md"), "utf8");
  const rulesBody = rulesCompact.slice(rulesCompact.indexOf("\n## ") + 1);
  const taskIndex = JSON.parse(fs.readFileSync(path.join(OUT_DIR, "tasks/index.json"), "utf8"));
  for (const { id, file } of taskIndex.tasks) {
    const task = JSON.parse(fs.readFileSync(path.join(OUT_DIR, file), "utf8"));
    const components = {};
    const mixins = {};
    const types = {};
    for (const name of task.components) {
      const slice = slices[name];
      if (!slice) continue;
      const { name: _name, mixinsRef, tokensRef, resolvedMixins, types: own, ...rest } = slice;
      components[name] = rest;
      Object.assign(mixins, resolvedMixins);
      Object.assign(types, own);
    }
    Object.assign(types, typesFor(mixins));
    const bundle = {
      ...task,
      components,
      gotchas: Object.fromEntries(
        (task.gotchas ?? []).filter((g) => gotchas[g]).map((g) => [g, gotchas[g].rule]),
      ),
      mixins,
      types: Object.fromEntries(
        Object.keys(types)
          .sort()
          .map((name) => [name, types[name]]),
      ),
    };
    fs.writeFileSync(path.join(bundlesDir, `${id}.json`), JSON.stringify(bundle));
    fs.writeFileSync(
      path.join(bundlesDir, `${id}.md`),
      bundleMarkdown(task, slices, gotchas, typesFor, rulesBody, spec.functions),
    );
  }
  // The bundle for a page no task matches: the rules and the common
  // components, so the fallback is one read plus the slices a page adds,
  // instead of the rules, the catalog and then a slice or two per turn.
  fs.writeFileSync(
    path.join(bundlesDir, `${BASE_BUNDLE.id}.md`),
    bundleMarkdown(BASE_BUNDLE, slices, gotchas, typesFor, rulesBody, spec.functions),
  );
  writeAgentsTaskTable(taskIndex);

  // Which specifier each export comes from. The rules say it in prose; this
  // is the same table with the export lists generated, so a new subpath or
  // export reaches an agent's first read without anyone editing the rules.
  const imports = {};
  for (const entry of ENTRY_POINTS) {
    const { specifier, use, peer, install } = entry;
    const row = { use };
    if (peer) row.peer = peer;
    if (install) row.install = install;
    if (specifier !== "@once-ui-system/core") {
      const from = (item) => item.importFrom === specifier;
      const names = [
        ...Object.entries(spec.components).filter(([, c]) => from(c)),
        ...Object.entries(spec.functions ?? {}).filter(([, f]) => from(f)),
      ].map(([name]) => name);
      if (names.length) row.exports = names;
      const typeNames = [...(entryTypes?.get(specifier) ?? [])];
      if (typeNames.length) row.types = typeNames.sort();
    }
    imports[specifier] = row;
  }

  const manifest = {
    version,
    generated: spec.generated,
    imports,
    files: {
      spec: "spec.json (the full machine spec, for tooling; agents read bundles and slices)",
      catalog: "catalog.json",
      tokens: "tokens.json",
      functions: "functions.json",
      bundles: "bundles/",
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
    // Without a task bundle, an agent starts from the rules and the catalog.
    bootstrap: ["rules.compact.md", "catalog.json"],
    resolve: "tasks/index.json",
    // The task's bundle has the rules, the task and every slice, type and
    // gotcha it names, and the gold example, so one read replaces the
    // bootstrap, the task file, its slices and the example. The JSON copy is
    // for tooling.
    bundle: "bundles/{id}.md",
    bundleJson: "bundles/{id}.json",
  };
  fs.writeFileSync(path.join(OUT_DIR, "manifest.json"), JSON.stringify(manifest, null, 1));

  syncDocsPublic();
  console.log(`AI artifacts: catalog + ${Object.keys(spec.components).length} component slices`);
}

// Components nearly every page reaches for whatever its task. In the 2.1.0
// benchmark, 116 of 200 slice reads after a bundle were for a component the
// bundle lacked, most of them these; each read added a turn that re-sent
// everything read so far.
const COMMON_COMPONENTS = [
  "Column",
  "Row",
  "Grid",
  "Heading",
  "Text",
  "Button",
  "IconButton",
  "Icon",
  "Input",
  "Textarea",
  "Tag",
  "Badge",
  "Avatar",
  "Dialog",
  "Skeleton",
  "VisuallyHidden",
];

const COMMON_HOOKS = ["useToast"];

const BASE_BUNDLE = {
  id: "page",
  title: "Any other page",
  description:
    "The rules and the components nearly every page uses, with their types and gotchas. Read it with the `components/<Name>.json` slices your page adds, in one step",
  components: [],
};

// `!T` marks a required prop in the spec; Markdown bundles write TypeScript.
const propLine = (name, type) =>
  type.startsWith("!") ? `- ${name}: ${type.slice(1)}` : `- ${name}?: ${type}`;

// Neighbouring optional props of one type share a line (`- width?, height?:
// T`): a size mixin's six lengths read once, not six times.
const propLines = (props) => {
  const out = [];
  let run = [];
  const flush = () => {
    if (!run.length) return;
    out.push(`- ${run.map(([name]) => `${name}?`).join(", ")}: ${run[0][1]}`);
    run = [];
  };
  for (const [name, type] of Object.entries(props ?? {})) {
    if (type.startsWith("!") || type.includes("=")) {
      flush();
      out.push(propLine(name, type));
      continue;
    }
    if (run.length && run[0][1] !== type) flush();
    run.push([name, type]);
  }
  flush();
  return out;
};

// A member that is already a type expression (`string & {}`, a template
// literal) stays as it is; anything else is a literal value.
const literal = (v) => (/^["`]|[ &|(]/.test(v) ? v : JSON.stringify(v));

// Token unions like TextVariant are every combination of a few parts
// ("label-default-xl", "label-default-l", …): 2 KB spelled out, one line as
// a template literal. Values are grouped by how many dash-separated parts
// they have, and by first part, and a group becomes a template only when it
// is the full product of its parts, so the type stays exact.
function compressUnion(values) {
  const product = (group) => {
    const parts = group[0]
      .split("-")
      .map((_, i) => [...new Set(group.map((v) => v.split("-")[i]))]);
    const size = parts.reduce((n, p) => n * p.length, 1);
    if (size !== group.length || parts.every((p) => p.length === 1)) return null;
    return `\`${parts
      .map((p) => (p.length === 1 ? p[0] : `\${${p.map((x) => JSON.stringify(x)).join(" | ")}}`))
      .join("-")}\``;
  };
  const plain = values.filter((v) => !/^[a-z0-9]+(-[a-z0-9]+)+$/.test(v));
  const dashed = values.filter((v) => !plain.includes(v));
  const out = plain.map(literal);
  const byCount = Map.groupBy(dashed, (v) => v.split("-").length);
  for (const group of byCount.values()) {
    const whole = product(group);
    if (whole) {
      out.push(whole);
      continue;
    }
    for (const sub of Map.groupBy(group, (v) => v.split("-")[0]).values()) {
      out.push(product(sub) ?? sub.map(literal).join(" | "));
    }
  }
  return out.join(" | ");
}

const typeLine = (name, type, context = {}) => {
  const { mixins = {}, types = {} } = context;
  if (Array.isArray(type)) {
    // Most of a key list another listed one already has (Grid's breakpoint
    // keys are Flex's minus direction, plus columns and rows): write the
    // difference, not the sixty keys again.
    for (const [base, other] of Object.entries(types)) {
      if (base === name || !Array.isArray(other) || other.length < 20) continue;
      const shared = type.filter((v) => other.includes(v));
      if (shared.length < type.length * 0.8) continue;
      const removed = other.filter((v) => !type.includes(v));
      const added = type.filter((v) => !other.includes(v));
      if (removed.length + added.length > 12) continue;
      const parts = [removed.length ? `Exclude<${base}, ${compressUnion(removed)}>` : base];
      if (added.length) parts.push(compressUnion(added));
      return `type ${name} = ${parts.join(" | ")}`;
    }
    return `type ${name} = ${compressUnion(type)}`;
  }
  if (typeof type === "string") return `type ${name} = ${type}`;
  // A shape that carries a whole mixin (Button's option props carry the
  // leaf props) names the mixin, which the bundle lists once, instead of
  // spelling its fields out again.
  let entries = Object.entries(type);
  const spread = [];
  for (const [mixin, props] of Object.entries(mixins)) {
    const keys = Object.keys(props);
    if (keys.length < 4 || mixin === name) continue;
    if (!keys.every((key) => key in type && type[key] === props[key])) continue;
    spread.push(mixin);
    entries = entries.filter(([key]) => !keys.includes(key));
  }
  const fields = entries.map(([key, value]) => {
    const required = value.startsWith("!");
    const field = /^[A-Za-z_$][\w$]*$/.test(key) || key.startsWith("[") ? key : JSON.stringify(key);
    return `${field}${required ? "" : "?"}: ${required ? value.slice(1) : value}`;
  });
  const shape = `{ ${fields.join("; ")} }`;
  return `type ${name} = ${[...spread, ...(fields.length || !spread.length ? [shape] : [])].join(" & ")}`;
};

// The task as one Markdown file an agent reads once and then writes from:
// the rules, every component it names plus the common ones, their mixins
// and types, the gotchas, the quality bar and the gold example. In the 2.1.0
// benchmark an agent made 10 calls a run, and from the bundle on each call
// re-sent 20k–60k tokens of docs to fetch one or two more files; that tail,
// not any one file, was most of the 3.7x total over shadcn/ui. JSON keys and
// escaped quotes cost tokens too, and tags or pairings help no one writing.
function bundleMarkdown(task, slices, gotchas, typesFor, rulesBody, functions = {}) {
  const names = [...new Set([...task.components, ...COMMON_COMPONENTS])].filter((n) => slices[n]);
  const mixins = {};
  const types = {};
  const sections = [];
  for (const name of names) {
    const slice = slices[name];
    let head = `### ${name}`;
    if (slice.importFrom) head += ` (from \`${slice.importFrom}\`)`;
    const lines = [head];
    if (slice.extends?.length) {
      const preset = slice.preset
        ? ` with ${Object.entries(slice.preset)
            .map(([k, v]) => `${k}="${v}"`)
            .join(" ")}`
        : "";
      lines.push(`Extends ${slice.extends.join(", ")}${preset}.`);
    }
    if (slice.mixins?.length) lines.push(`Mixins: ${slice.mixins.join(", ")}.`);
    if (slice.preferOver) lines.push(`Use instead of ${slice.preferOver}.`);
    if (slice.avoid) lines.push(`Avoid: ${slice.avoid}`);
    if (slice.call) lines.push(`Call: \`${slice.call}\``);
    lines.push(...propLines(slice.props));
    if (slice.returns) lines.push(`Returns: ${JSON.stringify(slice.returns)}`);
    sections.push(lines.join("\n"));
    Object.assign(mixins, slice.resolvedMixins);
    Object.assign(types, slice.types);
  }
  const hooks = COMMON_HOOKS.filter((name) => functions[name]);
  Object.assign(types, typesFor(mixins), typesFor(hooks.map((name) => functions[name])));

  const nameSet = new Set(names);
  const gotchaIds = [
    ...new Set([
      ...(task.gotchas ?? []),
      ...Object.keys(gotchas).filter((id) => gotchas[id].components?.some((c) => nameSet.has(c))),
    ]),
  ].filter((id) => gotchas[id]);

  let example = "";
  if (task.example) {
    const examplePath = path.join(OUT_DIR, task.example);
    if (fs.existsSync(examplePath)) example = fs.readFileSync(examplePath, "utf8").trim();
  }

  const out = [
    `# ${task.title}`,
    "",
    task.description,
    "",
    "This file is complete for this task: the rules (all of `rules.compact.md`), the props of every component below, their mixins and types, every gotcha for these components, the quality bar and a gold example. Write the page from it; reading the rules, catalog, gotchas, manifest or examples again only adds cost. Open `components/<Name>.json` only for a component not listed here, and then every one you need in a single step.",
    "",
    "## Rules",
    "",
    rulesBody.trim().replace(/^## /gm, "### "),
    "",
    "## Components",
    "",
    "Props marked `?` are optional; `= x` is the default. A component's mixins add the props listed under Mixins.",
    "",
    sections.join("\n\n"),
    "",
    ...(hooks.length
      ? [
          "## Hooks",
          "",
          ...hooks.map((name) => `- \`${name}\`: \`${functions[name].signature}\``),
          "",
        ]
      : []),
    "## Mixins",
    "",
    Object.entries(mixins)
      .map(([name, props]) => [`### ${name}`, ...propLines(props)].join("\n"))
      .join("\n\n"),
    "",
    "## Types",
    "",
    "```ts",
    ...Object.keys(types)
      .sort()
      // A type that is also a mixin is listed under Mixins already, prop by
      // prop; writing its fields out again here doubled the longest entries.
      .map((name) =>
        mixins[name]
          ? `type ${name} = the ${name} mixin above`
          : typeLine(name, types[name], { mixins, types }),
      ),
    "```",
    "",
    "## Gotchas",
    "",
    ...gotchaIds.map((id) => `- ${gotchas[id].rule}`),
  ];
  if (task.quality && Object.keys(task.quality).length) {
    out.push("", "## Quality bar", "", ...Object.values(task.quality).map((q) => `- ${q}`));
  }
  const recipes = (task.recipes ?? [])
    .map((id) => markdownSection("recipes.md", id))
    .filter(Boolean);
  if (recipes.length) out.push("", "## Recipes", "", ...recipes);
  if (task.layout) {
    const [file, anchor] = task.layout.split("#");
    const layout = markdownSection(file, anchor);
    if (layout) out.push("", "## Layout shell", "", layout);
  }
  if (example) {
    out.push("", `## Gold example (\`${task.example}\`)`, "", "```tsx", example, "```");
  }
  return selfContained(`${out.join("\n")}\n`);
}

// One `## ` section of a hand-written Markdown file, demoted to `### `, found
// by a task's recipe id ("reveal-stagger" for "## 7. Reveal stagger (entry,
// not ambient)") or layout anchor ("1-app-shell-with-a-sidebar").
function markdownSection(file, id) {
  const text = fs.readFileSync(path.join(OUT_DIR, file), "utf8");
  const sections = text.split(/\n(?=## )/).slice(1);
  const words = id.toLowerCase().split("-");
  const slug = (heading) =>
    heading
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .trim()
      .replace(/ +/g, "-");
  const found = sections.find((section) => {
    const heading = section.slice(3, section.indexOf("\n"));
    return slug(heading) === id || words.every((w) => heading.toLowerCase().includes(w));
  });
  if (!found) {
    console.warn(`${file} has no section for "${id}"`);
    return null;
  }
  return found.trim().replace(/^## /, "### ");
}

// The rules and gotchas send a reader without a bundle to other files for
// icon names, spacing tokens and import paths. In a bundle those are in the
// Types section and the slices, and each pointer cost a 20k-token turn in a
// test run (an agent opened catalog.json for icon names it already had).
function selfContained(text) {
  return text
    .replace(/,? ?from `iconNames` in `catalog\.json`( only)?/g, " (the IconName type below)$1")
    .replace(
      /take names from `iconNames` in `catalog\.json`/g,
      "take names from the IconName type below",
    )
    .replace(
      /from iconNames in catalog\.json \(spec\.json has the same list\)/g,
      "from the IconName type below",
    )
    .replace(/the tokens in `tokens\.json`/g, "the SpacingToken values below")
    .replace(/the layouts\.md shell/g, "the layout shell below")
    .replace(/ \(rules\.md #[\d–-]+\)/g, "")
    .replace(
      /the manifest's\n`imports` lists every entry point with its exports, and each slice, catalog\nentry and `functions\.json` entry says `importFrom` when it is not the root:/,
      "each component below says where it\ncomes from when it is not the root:",
    );
}

// AGENTS.md routes an agent straight to its task's bundle, so the task table
// lives in it, between markers, generated from tasks/.
function writeAgentsTaskTable(taskIndex) {
  const agentsPath = path.join(ROOT, "AGENTS.md");
  if (!fs.existsSync(agentsPath)) return;
  const start = "<!-- tasks:start -->";
  const end = "<!-- tasks:end -->";
  const text = fs.readFileSync(agentsPath, "utf8");
  if (!text.includes(start) || !text.includes(end)) return;
  const rows = taskIndex.tasks.map(({ id, file }) => {
    const task = JSON.parse(fs.readFileSync(path.join(OUT_DIR, file), "utf8"));
    return `| \`ai/bundles/${id}.md\` | ${task.title}: ${task.description} |`;
  });
  rows.push(
    `| \`ai/bundles/${BASE_BUNDLE.id}.md\` | ${BASE_BUNDLE.title}: ${BASE_BUNDLE.description} |`,
  );
  const table = ["| Bundle | For |", "|---|---|", ...rows].join("\n");
  const next = `${text.slice(0, text.indexOf(start) + start.length)}\n${table}\n${text.slice(text.indexOf(end))}`;
  if (next !== text) fs.writeFileSync(agentsPath, next);
}

function syncDocsPublic() {
  const docsAi = path.join(ROOT, "../../apps/docs/public/ai");
  if (!fs.existsSync(path.dirname(docsAi))) return;
  copyDir(OUT_DIR, docsAi);
  console.log(`Synced AI artifacts -> ${path.relative(ROOT, docsAi)}`);
}

// A mirror: what the source no longer has is removed from the copy too.
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(dest)) {
    if (!fs.existsSync(path.join(src, name))) fs.rmSync(path.join(dest, name), { recursive: true });
  }
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { isOwnSource };
