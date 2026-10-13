#!/usr/bin/env node
/**
 * Mechanical Once UI codegen validator.
 * Usage: node scripts/validate-ai-code.js <file.tsx> [--fix] [--next | --no-next]
 *        node scripts/validate-ai-code.js --stdin [--next] < file.tsx
 *
 * `--next` and `--no-next` say whether the file belongs to a Next.js app, for
 * the rules that only apply there. Without either, the file counts as Next
 * when it imports from `next` or `next/*` itself, or when the nearest
 * package.json above it (above the working directory, for `--stdin`) lists
 * `next` in `dependencies` or `devDependencies`. A peer dependency does not
 * count: a library that supports Next is not a Next app. Neither does
 * `"use client"`, which every React Server Components framework shares.
 */

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const SPEC_PATH = path.join(ROOT, "ai", "spec.json");

function loadSpec() {
  if (!fs.existsSync(SPEC_PATH)) return { components: {}, tokens: {} };
  return JSON.parse(fs.readFileSync(SPEC_PATH, "utf8"));
}

/**
 * The icon names the package ships, from `spec.iconNames`.
 *
 * This used to read `spec.tokens.IconName`, which the generator no longer
 * writes since the names moved to their own list — so the set came back
 * empty and the icon check never ran. The old token form is still read, so a
 * spec generated before that change keeps working.
 */
function parseIconNames(spec) {
  const names = new Set(Array.isArray(spec.iconNames) ? spec.iconNames : []);
  const raw = spec.tokens?.IconName || "";
  for (const m of raw.match(/"([^"]+)"/g) || []) names.add(m.slice(1, -1));
  return names;
}

/**
 * Which props take an `IconName`, per component — read from the spec, not
 * guessed from the prop's name: `name` is an icon on `Icon` and a form field's
 * name on `Input`, and `icon` is an `IconName` on `IconButton` but a logo
 * source on `Logo`. A component inherits the icon props of what it extends.
 */
function iconPropsByComponent(spec) {
  const components = spec.components || {};
  const own = (name) =>
    Object.entries(components[name]?.props || {})
      .filter(([, type]) => /\bIconName\b/.test(String(type)))
      .map(([prop]) => prop);
  const resolve = (name, seen) => {
    if (seen.has(name)) return [];
    seen.add(name);
    const bases = components[name]?.extends || [];
    return [...own(name), ...bases.flatMap((base) => resolve(base, seen))];
  };
  const byComponent = new Map();
  for (const name of Object.keys(components)) {
    const props = new Set(resolve(name, new Set()));
    if (props.size) byComponent.set(name, props);
  }
  return byComponent;
}

/**
 * Fields of the spec's data shapes that take an `IconName` — `icon` on a
 * `MenuLink` or a `KbarItem`, `prefixIcon` on a `CodeInstance` — which an
 * agent writes as object literals rather than as JSX props.
 */
function iconFields(spec) {
  const fields = new Set();
  for (const shape of Object.values(spec.types || {})) {
    if (!shape || typeof shape !== "object" || Array.isArray(shape)) continue;
    for (const [field, type] of Object.entries(shape)) {
      if (/\bIconName\b/.test(String(type))) fields.add(field);
    }
  }
  return fields;
}

/** Split `text` on commas at depth 0, ignoring those inside brackets and strings. */
function splitTopLevel(text) {
  const parts = [];
  let depth = 0;
  let quote = null;
  let from = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if ("{[(".includes(ch)) depth++;
    else if ("}])".includes(ch)) depth--;
    else if (ch === "," && depth === 0) {
      parts.push(text.slice(from, i));
      from = i + 1;
    }
  }
  parts.push(text.slice(from));
  return parts.map((p) => p.trim()).filter(Boolean);
}

/**
 * The keys of `const name = { … }` in `source`, or `null` when the object is
 * not a plain literal this can read (it spreads another one, say).
 */
function objectLiteralKeys(source, name) {
  const m = new RegExp(`\\b(?:const|let|var)\\s+${name}\\b[^=]*=\\s*\\{`).exec(source);
  if (!m) return null;
  const start = m.index + m[0].length;
  let depth = 1;
  let quote = null;
  let i = start;
  for (; i < source.length && depth > 0; i++) {
    const ch = source[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if (ch === "{") depth++;
    else if (ch === "}") depth--;
  }
  const keys = [];
  for (const entry of splitTopLevel(source.slice(start, i - 1))) {
    const key = /^(?:["']([^"']+)["']|([A-Za-z_$][\w$]*))\s*(?::|\(|$)/.exec(entry);
    if (!key) return null;
    keys.push(key[1] || key[2]);
  }
  return keys;
}

/** Strip `//` and `/* *\/` comments, keeping string contents intact enough to parse keys. */
function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");
}

/**
 * Names registered by augmenting `IconLibraryOverrides` in `source`: listed in
 * the interface body (`rocket: true`), or derived from an icon object in the
 * same file the way the docs recommend
 * (`extends Record<keyof typeof iconLibrary, true>`). They are real
 * `IconName`s for that app. `unresolved` is set when an augmentation names its
 * icons some way this cannot read, so the caller knows the list is partial.
 */
function registeredIconNames(text) {
  const source = stripComments(text);
  const names = new Set();
  let unresolved = false;
  for (const [, heritage, body] of source.matchAll(
    /interface\s+IconLibraryOverrides\b([^{]*)\{([^}]*)\}/g,
  )) {
    for (const [, quoted, bare] of body.matchAll(
      /(?:["']([^"']+)["']|([A-Za-z_$][\w$]*))\s*\??\s*:/g,
    )) {
      names.add(quoted || bare);
    }
    const objects = [...heritage.matchAll(/keyof\s+typeof\s+([A-Za-z_$][\w$]*)/g)].map((m) => m[1]);
    if (heritage.trim() && !objects.length) unresolved = true;
    for (const object of objects) {
      const keys = objectLiteralKeys(source, object);
      if (keys) for (const key of keys) names.add(key);
      else unresolved = true;
    }
  }
  return { names, unresolved };
}

const SKIP_DIRS = new Set(["node_modules", ".git", ".next", "dist", "build", "out", ".turbo"]);

/**
 * Icon names a project registers anywhere under `root` — an app's icons live
 * in their own module (`resources/icons.ts`), not in the file being checked,
 * and without them every custom name would read as unknown.
 */
function projectIconNames(root) {
  const names = new Set();
  let unresolved = false;
  let budget = 5000;
  const walk = (dir) => {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (budget-- <= 0) return;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(full);
      } else if (/\.(?:ts|tsx|mts|cts)$/.test(entry.name)) {
        const text = fs.readFileSync(full, "utf8");
        if (!text.includes("IconLibraryOverrides")) continue;
        const found = registeredIconNames(text);
        for (const name of found.names) names.add(name);
        unresolved ||= found.unresolved;
      }
    }
  };
  walk(root);
  return { names, unresolved };
}

/** The directory of the nearest package.json at or above `dir`, or `dir` itself. */
function projectRoot(dir) {
  let current = path.resolve(dir);
  for (;;) {
    if (fs.existsSync(path.join(current, "package.json"))) return current;
    const parent = path.dirname(current);
    if (parent === current) return path.resolve(dir);
    current = parent;
  }
}

function parseFlags(argv) {
  return {
    stdin: argv.includes("--stdin"),
    fix: argv.includes("--fix"),
    next: argv.includes("--next") ? true : argv.includes("--no-next") ? false : undefined,
    // Every file named, not only the first: `validate-ai-code a.tsx b.tsx`
    // used to check a.tsx and silently skip the rest.
    files: argv.filter((a) => !a.startsWith("-")),
  };
}

function readInputs(flags) {
  if (flags.stdin) {
    return [{ source: fs.readFileSync(0, "utf8"), file: "<stdin>" }];
  }
  if (flags.files.length === 0) {
    console.error("Usage: validate-ai-code.js <file.tsx…> [--fix] [--next | --no-next] | --stdin");
    process.exit(2);
  }
  return flags.files.map((file) => ({ source: fs.readFileSync(file, "utf8"), file }));
}

/**
 * Does the nearest package.json at or above `dir` depend on `next`?
 *
 * Only the nearest one: in a monorepo the app's own manifest is the one that
 * says what the app is, and the workspace root's says nothing about it.
 */
function isNextProject(dir) {
  let current = path.resolve(dir);
  for (;;) {
    const manifest = path.join(current, "package.json");
    if (fs.existsSync(manifest)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(manifest, "utf8"));
        return Boolean(pkg.dependencies?.next || pkg.devDependencies?.next);
      } catch {
        return false;
      }
    }
    const parent = path.dirname(current);
    if (parent === current) return false;
    current = parent;
  }
}

/** The file itself imports from `next` or a `next/*` subpath. */
function importsNext(source) {
  return /\bfrom\s*["']next(?:\/[^"']*)?["']|\bimport\s*["']next\/[^"']*["']/.test(source);
}

/**
 * A literal colour in a styling position.
 *
 * The rule used to be a bare `#[0-9a-fA-F]{3,8}` over the whole file, which
 * flagged two things that are not colours at all: any string that happens to
 * look like hex (an order id `"#1024"` is a valid #RGBA literal), and the
 * `fill` / `stroke` of an inline `<svg>`, where a raw value is the only thing
 * that works — which is why 2.0 types those props `ColorValue` rather than
 * `Colors`. So it looks at where the value sits, not only at its shape.
 */
function hasLiteralColor(source) {
  const LITERAL = /#[0-9a-fA-F]{3,8}\b|rgba?\s*\(/;
  const SVG_PAINT =
    /^(?:fill|stroke|stopColor|stop-color|floodColor|flood-color|lightingColor|lighting-color)$/;

  for (const block of source.match(/style=\{\{[\s\S]*?\}\}/g) || []) {
    if (LITERAL.test(block)) return true;
  }

  for (const [, name, value] of source.matchAll(/([A-Za-z-]+)=\{?["']([^"']*)["']/g)) {
    if (SVG_PAINT.test(name)) continue;
    if (!/colou?r|background|border|shadow|gradient/i.test(name)) continue;
    if (LITERAL.test(value)) return true;
  }
  return false;
}

const LITERAL_PAINT = /#[0-9a-fA-F]{3,8}\b|(?:rgb|hsl)a?\s*\(/;
const SVG_PAINT_ATTR =
  /(?:^|\s)(fill|stroke|stopColor|stop-color|floodColor|flood-color|lightingColor|lighting-color|color)=\{?\s*(["'`])([^"'`]*)\2/g;

/**
 * A literal colour painted onto an inline SVG element: `<path fill="#15D9EF">`.
 *
 * `hasLiteralColor` leaves SVG paint alone because a raw value is the only
 * thing those attributes take — but the raw value can still be a token:
 * `currentColor`, coloured from the wrapper with `onBackground`, or
 * `var(--brand-solid-strong)`. A hex there never follows the theme. Only
 * lower-case (intrinsic) elements: a component's `fill` is its own prop.
 * Returns the first offender and how many there are, or null.
 */
function literalSvgPaint(source) {
  let first = null;
  let count = 0;
  for (const el of jsxElements(source)) {
    if (!/^[a-z]/.test(el.name)) continue;
    for (const [, attr, , value] of ownProps(el.attrs).matchAll(SVG_PAINT_ATTR)) {
      if (!LITERAL_PAINT.test(value)) continue;
      count++;
      first ??= { element: el.name, attr, value };
    }
  }
  return first && { ...first, count };
}

/**
 * Is `index` inside the braces of a `<prop>={ ... }` value?
 *
 * Counts braces forward from each occurrence of the prop, which is enough for
 * JSX: a `{` inside a string would have to be unbalanced to fool it, and the
 * answer is only used to suppress a warning.
 */
function insidePropValue(source, index, prop) {
  for (const m of source.matchAll(new RegExp(`\\b${prop}=\\{`, "g"))) {
    if (m.index > index) return false;
    let depth = 1;
    let i = m.index + m[0].length;
    for (; i < source.length && depth > 0; i++) {
      if (source[i] === "{") depth++;
      else if (source[i] === "}") depth--;
    }
    if (index > m.index && index < i) return true;
  }
  return false;
}

/**
 * The index of the `>` that ends an opening tag whose attributes start at
 * `from` — brace- and quote-aware, so a `>` inside an arrow function or an
 * object literal in a prop value does not end the tag early.
 */
function tagEnd(source, from) {
  let depth = 0;
  let quote = null;
  let i = from;
  for (; i < source.length; i++) {
    const ch = source[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if (ch === "{") depth++;
    else if (ch === "}") depth--;
    else if (ch === ">" && depth === 0) break;
  }
  return i;
}

/**
 * Every opening JSX tag with its attribute text.
 *
 * Brace- and quote-aware, so a `>` inside an arrow function or an object
 * literal in a prop value does not end the tag early — which is what a plain
 * `<Tag[^>]*>` does on `onClick={() => x > 1}`. Scanning resumes right after
 * the tag name, so a tag nested in a prop value (`trigger={<Card …>}`) is
 * found on its own as well.
 */
function openingTags(source) {
  const tags = [];
  for (const m of source.matchAll(/<([A-Z][A-Za-z0-9.]*)\b/g)) {
    const start = m.index + m[0].length;
    const end = tagEnd(source, start);
    tags.push({ name: m[1], attrs: source.slice(start, end), start, end });
  }
  return tags;
}

/**
 * Every JSX element, lower-case ones included, with its parent and the group
 * of siblings it belongs to.
 *
 * Built from opening and closing tags alone, which is enough to tell which
 * elements share a parent: `group` is the same for siblings, and an element
 * passed in a prop value (`trigger={<Card />}`) is grouped with the other
 * elements in that value, not with its owner's children. Each top-level
 * expression is a tree of its own — two components in one file are not
 * siblings. A fragment is transparent, as it is in the DOM. A `<` straight
 * after an identifier is a type argument (`useState<Item>`), not a tag.
 */
function jsxElements(source) {
  const elements = [];
  const stack = [];

  const groupOf = (at) => {
    const top = stack[stack.length - 1];
    if (!top) return `root:${at}`;
    if (top.kind === "fragment") return top.group;
    return `${top.kind}:${top.index}`;
  };
  const parentOf = () => {
    for (let k = stack.length - 1; k >= 0; k--) {
      if (stack[k].kind !== "fragment") return stack[k].index;
    }
    return -1;
  };

  // An opening tag's attributes end at its `>`; whatever was left open inside
  // them (an unbalanced tag in a prop value) ends there too.
  const settle = (at) => {
    for (;;) {
      let k = stack.length - 1;
      while (k >= 0 && stack[k].kind !== "attrs") k--;
      if (k < 0 || elements[stack[k].index].end > at) return;
      const { index } = stack[k];
      stack.length = k;
      if (!elements[index].selfClosing) stack.push({ kind: "children", index });
    }
  };

  // Pop to the matching open element, never out of an attribute value.
  const close = (matches) => {
    for (let k = stack.length - 1; k >= 0; k--) {
      if (stack[k].kind === "attrs") return;
      if (matches(stack[k])) {
        stack.length = k;
        return;
      }
    }
  };

  const TAG = /<\/([A-Za-z][\w.:-]*)?\s*>|<>|<([A-Za-z][\w.:-]*)/g;
  for (const m of source.matchAll(TAG)) {
    settle(m.index);
    if (m[0] === "<>") {
      stack.push({ kind: "fragment", group: groupOf(m.index) });
    } else if (m[0].startsWith("</")) {
      const name = m[1];
      close((entry) =>
        name
          ? entry.kind === "children" && elements[entry.index].name === name
          : entry.kind === "fragment",
      );
    } else {
      if (m.index > 0 && /[\w$.)\]]/.test(source[m.index - 1])) continue;
      const start = m.index + m[0].length;
      const end = tagEnd(source, start);
      const attrs = source.slice(start, end);
      elements.push({
        name: m[2],
        attrs,
        start,
        end,
        selfClosing: /\/\s*$/.test(attrs),
        group: groupOf(m.index),
        parent: parentOf(),
      });
      stack.push({ kind: "attrs", index: elements.length - 1 });
    }
  }
  return elements;
}

/**
 * The element's own props, with every `{ … }` value that holds JSX blanked to
 * spaces of the same length — so a check reads `fillWidth` and `maxWidth` on
 * the element itself and not on a tag nested inside one of its values
 * (`dropdown={<Column maxWidth={20} />}`), and an index into the masked text
 * is still an index into the original.
 */
function ownProps(attrs) {
  let out = "";
  let depth = 0;
  let quote = null;
  let from = 0;
  for (let i = 0; i < attrs.length; i++) {
    const ch = attrs[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if (ch === "{") {
      if (depth === 0) {
        out += attrs.slice(from, i);
        from = i;
      }
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) {
        const block = attrs.slice(from, i + 1);
        out += /<[A-Z]/.test(block) ? `{${" ".repeat(block.length - 2)}}` : block;
        from = i + 1;
      }
    }
  }
  return out + attrs.slice(from);
}

/**
 * The raw value of one of the element's own props: `"x"`, `'x'` or a whole
 * `{ … }` block, or `null` when the prop is absent or bare.
 */
function propValue(attrs, prop) {
  const own = ownProps(attrs);
  const m = new RegExp(`(?:^|\\s)${prop}=`).exec(own);
  if (!m) return null;
  const at = m.index + m[0].length;
  const open = own[at];
  if (open === '"' || open === "'") {
    const close = own.indexOf(open, at + 1);
    return close < 0 ? null : own.slice(at, close + 1);
  }
  if (open !== "{") return null;
  let depth = 0;
  let quote = null;
  for (let i = at; i < own.length; i++) {
    const ch = own[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if (ch === "{") depth++;
    else if (ch === "}" && --depth === 0) return own.slice(at, i + 1);
  }
  return null;
}

/** A prop value that is a plain string — `"x"`, `{"x"}`, `{`x`}` — as the string. */
function stringValue(value) {
  if (!value) return null;
  const m = /^\{?\s*(["'`])([^"'`]*)\1\s*\}?$/.exec(value);
  if (!m || (m[1] === "`" && m[2].includes("${"))) return null;
  return m[2];
}

/** Apply a replacement to the element's own props only, never inside nested JSX. */
function replaceOwnProps(attrs, pattern, replacement) {
  const masked = ownProps(attrs);
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  const re = new RegExp(pattern.source, flags);
  let out = "";
  let last = 0;
  for (const m of masked.matchAll(re)) {
    out += attrs.slice(last, m.index) + m[0].replace(pattern, replacement);
    last = m.index + m[0].length;
    if (!pattern.flags.includes("g")) break;
  }
  return out + attrs.slice(last);
}

/**
 * Collapse two props on one element into a shorthand: the earlier of the two
 * becomes the shorthand, the later is removed, and nothing else moves.
 */
function collapsePair(attrs, first, second, shorthand) {
  const own = ownProps(attrs);
  const a = own.search(first);
  const b = own.search(second);
  if (a < 0 || b < 0) return attrs;
  const [lead, trail] = a < b ? [first, second] : [second, first];
  const asShorthand = new RegExp(`(\\s)${lead.source.replace(/^\(\?:\^\|\\s\)/, "")}`);
  const removed = new RegExp(`\\s+${trail.source.replace(/^\(\?:\^\|\\s\)/, "")}`);
  return replaceOwnProps(replaceOwnProps(attrs, removed, ""), asShorthand, `$1${shorthand}`);
}

const FILL_WIDTH = /(?:^|\s)fillWidth(?=[\s/]|$)/;
const FILL_HEIGHT = /(?:^|\s)fillHeight(?=[\s/]|$)/;

/** Both centring props on one element, whatever sits between them. */
function isCentered(attrs) {
  const own = ownProps(attrs);
  return HORIZONTAL_CENTER.test(own) && VERTICAL_CENTER.test(own);
}

/** Does the element carry `prop`, bare or with a value? */
function hasProp(attrs, prop) {
  return new RegExp(`(?:^|\\s)${prop}(?=[\\s=/]|$)`).test(ownProps(attrs));
}

/** Does the element spread props it cannot see (`{...props}`)? */
function hasSpread(attrs) {
  return /\{\s*\.\.\./.test(ownProps(attrs));
}

const HORIZONTAL_CENTER = /(?:^|\s)horizontal=["']center["']/;
const VERTICAL_CENTER = /(?:^|\s)vertical=["']center["']/;
const LITERAL_MAX_WIDTH =
  /(?:^|\s)maxWidth=(?:"[^"]*"|\{\s*(?:\d+(?:\.\d+)?|"[^"]*"|'[^']*')\s*\})(?=[\s/]|$)/;
const MIN_WIDTH_ZERO = /(?:^|\s)minWidth=(?:\{\s*0\s*\}|\{?["']0["']\}?)(?=[\s/]|$)/;
// A bare `border` draws `--default-border`, which is `--neutral-alpha-weak`
// unless the app sets it in its custom CSS: naming that colour pins it and
// stops the border following the app's default.
const DEFAULT_BORDER = /(?:^|\s)(border(?:Top|Right|Bottom|Left|X|Y)?)=["']neutral-alpha-weak["']/;
const BREAKPOINTS = ["xl", "l", "m", "s", "xs"];

/** The layout primitives whose `position` defaults to `relative`. */
const RELATIVE_BY_DEFAULT = new Set(["Flex", "Row", "Column", "Grid"]);

/**
 * What a `<Flex>` is when its direction never changes, from its own props:
 * `{ to: "Row" | "Column", direction }`, or null when it is a real Flex — a
 * breakpoint sets a direction, the direction is computed or reversed — or
 * when there is no telling. `direction` is the literal it sets, or null when
 * it sets none (Flex defaults to row, and `Row` is a Flex with nothing added).
 * `exact` says the props show everything that decides it: no spread, and
 * every breakpoint value an object literal this can read.
 */
function staticFlex(attrs) {
  const breakpoints = BREAKPOINTS.map((bp) => propValue(attrs, bp)).filter(Boolean);
  if (breakpoints.some((value) => /\bdirection\s*:/.test(value))) return null;
  const readable = breakpoints.every(
    (value) => /^\{\s*\{[\s\S]*\}\s*\}$/.test(value) && !value.includes("..."),
  );
  const exact = readable && !hasSpread(attrs);
  if (!hasProp(attrs, "direction")) {
    // A spread or an opaque breakpoint object may carry the direction.
    return exact ? { to: "Row", direction: null, exact } : null;
  }
  const direction = stringValue(propValue(attrs, "direction"));
  if (direction === "row") return { to: "Row", direction, exact };
  if (direction === "column") return { to: "Column", direction, exact };
  return null;
}

/**
 * The typed theme props and the attribute each one writes, as
 * `themeAttributes` in src/utils/layoutClasses.ts maps them.
 */
const THEME_ATTRIBUTES = {
  "data-theme": "theme",
  "data-border": "themeBorder",
  "data-solid": "themeSolid",
  "data-surface": "themeSurface",
};

/**
 * Every prop `name` accepts per the spec — its own, its mixins' and those of
 * what it extends — with each prop's type.
 */
function acceptedProps(spec, name, seen = new Set()) {
  const entry = spec.components?.[name];
  if (!entry || seen.has(name)) return {};
  seen.add(name);
  const props = {};
  for (const base of entry.extends || []) Object.assign(props, acceptedProps(spec, base, seen));
  for (const mixin of entry.mixins || []) Object.assign(props, spec.mixins?.[mixin]);
  return Object.assign(props, entry.props);
}

/**
 * The values a prop type allows when it is a union of string literals —
 * written out (`"light" | "dark"`) or named in `spec.types` (`BorderStyle`) —
 * or null when it is anything else.
 */
function literalValues(spec, type) {
  const text = String(type ?? "")
    .replace(/\s*=.*$/, "")
    .trim();
  const named = spec.types?.[text];
  if (Array.isArray(named)) return named.map(String);
  if (/^"[^"]*"(?:\s*\|\s*"[^"]*")*$/.test(text)) {
    return [...text.matchAll(/"([^"]*)"/g)].map((m) => m[1]);
  }
  return null;
}

/**
 * Raw `data-theme` / `data-border` / `data-solid` / `data-surface` on a
 * component that takes the typed prop for it, per the spec, with a value that
 * prop accepts. `Button` and `IconButton` take none of them, so their
 * `data-border="rounded"` is the only way to round them and is left alone.
 */
function rawThemeAttributes(spec, tags) {
  const typed = spec.mixins?.StyleProps ?? {};
  const found = [];
  for (const tag of tags) {
    const own = ownProps(tag.attrs);
    if (!/(?:^|\s)data-(?:theme|border|solid|surface)=/.test(own)) continue;
    const accepted = acceptedProps(spec, tag.name);
    for (const [attribute, prop] of Object.entries(THEME_ATTRIBUTES)) {
      // The StyleProps prop itself, not a component's own prop of the same
      // name: ThemeProvider's `theme` sets the app's theme, not a subtree's.
      if (!(prop in typed) || accepted[prop] !== typed[prop]) continue;
      const raw = propValue(tag.attrs, attribute);
      if (!raw) continue;
      const value = stringValue(raw);
      const allowed = literalValues(spec, accepted[prop]);
      if (value !== null && allowed && !allowed.includes(value)) continue;
      found.push({ tag, attribute, prop, raw, value });
    }
  }
  return found;
}

/**
 * Timing props measured in milliseconds, per component. Everything else named
 * `speed` is a multiplier (`MatrixFx`, `WeatherFx`, `ParticleFx`,
 * `CelebrationFx`, `Effect`), where `0.5` is exactly right, or a named pace
 * (`LetterFx`, `GlitchFx`, `AutoScroll`). A component that extends one of
 * these in the spec (`HoverCard` extends `Animation`) inherits its props.
 */
const MILLISECOND_PROPS = {
  RevealFx: ["delay", "speed"],
  ShineFx: ["speed"],
  CountFx: ["speed"],
  TypeFx: ["delay", "speed"],
  Animation: ["delay", "duration"],
  Hover: ["delay", "hideDelay"],
  Skeleton: ["delay"],
};

function millisecondProps(spec, name) {
  const props = new Set(MILLISECOND_PROPS[name] || []);
  for (const base of spec.components?.[name]?.extends || []) {
    for (const prop of MILLISECOND_PROPS[base] || []) props.add(prop);
  }
  return props;
}

/**
 * A timing value written in seconds: a fraction on its own (`{0.3}`), or a
 * fraction it is multiplied by (`{index * 0.1}`) with nothing in the
 * expression big enough to be milliseconds already (`{index * 0.1 * 1000}`).
 */
function looksLikeSeconds(value) {
  if (!value?.startsWith("{")) return false;
  const expr = value.slice(1, -1).trim();
  const numbers = (expr.match(/\d*\.?\d+/g) || []).map(Number);
  if (numbers.some((n) => n >= 10)) return false;
  return /^\d*\.\d+$/.test(expr) || /\*\s*\d*\.\d+|\d*\.\d+\s*\*/.test(expr);
}

const POSITIONED = /(?:^|\s)position=\{?\s*["'](?:absolute|fixed|sticky)["']\s*\}?/;

/**
 * `LayoutProvider` named in an import or re-export from the package root (or
 * `/contexts`), as a value rather than a type.
 */
const CORE_ROOT_SPECIFIERS =
  /\b(import|export)\s+(type\s+)?\{([^}]*)\}\s*from\s*(["'])@once-ui-system\/core(?:\/contexts)?\4;?/g;

function namesLayoutProvider(specifiers) {
  return specifiers
    .split(",")
    .map((s) => s.trim())
    .some((s) => /^LayoutProvider(?:\s+as\s+[\w$]+)?$/.test(s));
}

function rootLayoutProviderImport(source) {
  for (const m of source.matchAll(CORE_ROOT_SPECIFIERS)) {
    if (!m[2] && namesLayoutProvider(m[3])) return m;
  }
  return null;
}

/**
 * 1.x prop names that 2.x no longer accepts at all, from the 2.0 codemod
 * (`scripts/codemod-2.0.mjs` at the repo root). Names that 2.x reuses with a
 * new meaning are left out, because they are valid now: `fill` on Media,
 * Carousel and Swiper, `icon` on Feedback, `radius` on ToggleButton.
 *
 * An agent writing from memory reaches for these. TypeScript reports one as a
 * missing required prop or, for `onToggle`, as a mismatch with the DOM's
 * `ToggleEvent`, which never mentions the rename, so this says it.
 */
const FIELD = { hasPrefix: "prefix", hasSuffix: "suffix", height: "size", radius: "corners" };
const PRE_2_PROPS = {
  ProgressBar: { label: "showLabel" },
  Toast: { icon: "showIcon" },
  DataTooltip: { colors: "showSwatches" },
  RevealFx: { trigger: "revealed" },
  SegmentedControl: { selected: "value", onToggle: "onChange", defaultSelected: "defaultValue" },
  NavIcon: { isActive: "active" },
  Checkbox: { isChecked: "checked", isIndeterminate: "indeterminate" },
  RadioButton: { isChecked: "checked" },
  Switch: { isChecked: "checked" },
  Dialog: { isOpen: "open" },
  Modal: { isOpen: "open" },
  DatePicker: { isOpen: "open", isNested: "nested" },
  DropdownWrapper: { isOpen: "open", isNested: "nested" },
  EmojiPickerDropdown: { isOpen: "open", isNested: "nested" },
  Input: FIELD,
  Textarea: FIELD,
  Option: { hasPrefix: "prefix", hasSuffix: "suffix" },
  Select: FIELD,
  NumberInput: FIELD,
  TagInput: FIELD,
  ColorInput: FIELD,
  DateInput: FIELD,
  DateRangeInput: FIELD,
  PasswordInput: FIELD,
  Pulse: { variant: "scheme" },
  Tag: { variant: "scheme" },
  Button: { radius: "corners" },
  IconButton: { radius: "corners" },
};

function validate(source, spec, iconNames, options = {}) {
  const issues = [];

  const add = (rule, message, fix) => issues.push({ rule, message, fix });

  // Per element: `fillWidth` on a parent and `fillHeight` on its child is not
  // a shorthand missed, and neither is `horizontal="center"` on a header row
  // beside `vertical="center"` on the row inside it.
  const tags = openingTags(source);

  const renamed = new Set();
  for (const t of tags) {
    for (const [old, now] of Object.entries(PRE_2_PROPS[t.name] ?? {})) {
      if (!hasProp(t.attrs, old) || renamed.has(`${t.name}.${old}`)) continue;
      renamed.add(`${t.name}.${old}`);
      add("api.renamed", `${t.name} takes ${now} in 2.x; ${old} is the 1.x name`);
    }
  }

  if (tags.some((t) => hasProp(t.attrs, "fillWidth") && hasProp(t.attrs, "fillHeight"))) {
    add("layout.shorthands", "Use fill instead of fillWidth + fillHeight", "fill");
  }

  // `Flex` is the right component exactly when the direction changes at a
  // breakpoint, so a Flex that sets one at `m` or `s` is not a Row or a
  // Column written the long way. One that sets none is a Row: Flex defaults
  // to row, and Row is a Flex with nothing added.
  const flexes = tags.filter((t) => t.name === "Flex").map((t) => staticFlex(t.attrs));
  if (flexes.some((f) => f?.direction === "column")) {
    add("layout.shorthands", 'Use Column instead of Flex direction="column"', "Column");
  }
  if (flexes.some((f) => f?.direction === "row")) {
    add("layout.shorthands", 'Use Row instead of Flex direction="row"', "Row");
  }
  if (flexes.some((f) => f && f.direction === null)) {
    add(
      "layout.shorthands",
      "Use Row instead of a Flex with no direction — Flex defaults to row; it is for a direction that changes at a breakpoint",
      "Row",
    );
  }

  // One issue per component, naming the prop for each attribute it carries.
  const themed = new Map();
  for (const t of rawThemeAttributes(spec, tags)) {
    if (!themed.has(t.tag.name)) themed.set(t.tag.name, new Set());
    themed.get(t.tag.name).add(`${t.prop}=${t.raw} for ${t.attribute}=${t.raw}`);
  }
  for (const [name, pairs] of themed) {
    add(
      "theme.typedProps",
      `<${name}> takes the typed theme props — write ${[...pairs].join(", ")}`,
      "typed-theme-props",
    );
  }
  if (tags.some((t) => isCentered(t.attrs))) {
    add(
      "layout.shorthands",
      'Use center instead of horizontal="center" vertical="center"',
      "center",
    );
  }

  // Only where it is the default. On a component positioned some other way
  // by default, `relative` is an override and means something.
  if (
    tags.some(
      (t) =>
        RELATIVE_BY_DEFAULT.has(t.name) &&
        stringValue(propValue(t.attrs, "position")) === "relative",
    )
  ) {
    add("layout.defaults", 'position="relative" is the default — omit it');
  }

  // Props another prop on the same element already implies. Checked per tag,
  // because `fillWidth` and `maxWidth` on two different elements is fine, and
  // only for a literal `maxWidth`: a computed one may resolve to `undefined`,
  // and then `fillWidth` is the only thing filling the width.
  if (
    tags.some((t) => hasProp(t.attrs, "fillWidth") && LITERAL_MAX_WIDTH.test(ownProps(t.attrs)))
  ) {
    add(
      "layout.defaults",
      "fillWidth beside maxWidth — maxWidth already fills the width, omit fillWidth",
      "drop-fillWidth",
    );
  }
  if (tags.some((t) => hasProp(t.attrs, "fillWidth") && MIN_WIDTH_ZERO.test(ownProps(t.attrs)))) {
    add(
      "layout.defaults",
      "minWidth={0} beside fillWidth — fillWidth already sets min-width: 0, omit minWidth",
      "drop-minWidth-0",
    );
  }
  const named = tags.map((t) => ownProps(t.attrs).match(DEFAULT_BORDER)).find(Boolean);
  if (named) {
    add(
      "border.default",
      `${named[1]}="neutral-alpha-weak" restates the default border — write bare ${named[1]}, and name a colour only to deviate`,
      "default-border",
    );
  }

  // A logo that changes with the theme is one Logo with a source per theme.
  // Two Logos, one `dark` and one `light`, double the elements, leave two
  // places to keep in sync, and put a hidden link in every focus order.
  const logos = tags.filter((t) => t.name === "Logo");
  const logoIn = (prop) =>
    logos.some((t) => hasProp(t.attrs, prop) && /(?:^|\s)(icon|wordmark)=/.test(ownProps(t.attrs)));
  if (logoIn("dark") && logoIn("light")) {
    add(
      "Logo.themes",
      'a Logo drawn twice, once with `dark` and once with `light` — draw it once with a source per theme: <Logo wordmark={{ light: "/logo-light.svg", dark: "/logo-dark.svg" }} /> (icon takes the same pair)',
    );
  }

  // A zIndex only means something against something positioned in the same
  // stacking group: the element itself (a sticky header), or a sibling of it
  // or of one of its ancestors (the absolute layer it sits over — layout
  // primitives are `relative` without a z-index, so they do not isolate
  // what is inside them). Something positioned in another component in the
  // same file does not make a group. Spread props may carry the position.
  const elements = jsxElements(source);
  const isPositioned = (el) =>
    POSITIONED.test(ownProps(el.attrs)) ||
    /\bposition\s*:(?!\s*["'](?:relative|static)["'])/.test(propValue(el.attrs, "style") || "");
  const inStackingGroup = (el) => {
    if (isPositioned(el) || hasSpread(el.attrs)) return true;
    for (let node = el; node; node = elements[node.parent]) {
      if (elements.some((o) => o !== node && o.group === node.group && isPositioned(o))) {
        return true;
      }
    }
    return false;
  };
  const lone = elements.find((el) => hasProp(el.attrs, "zIndex") && !inStackingGroup(el));
  if (lone) {
    add(
      "zIndex.scope",
      `zIndex on <${lone.name}> with nothing beside it positioned absolute, fixed or sticky — zIndex belongs to an isolated stacking group, not a lone element`,
    );
  }

  if (
    tags.some(
      (t) => t.name === "Button" && stringValue(propValue(t.attrs, "variant")) === "primary",
    )
  ) {
    add("layout.defaults", 'variant="primary" is the Button default — omit it');
  }

  // Scoped to the tag: `lines` is a different prop on Background and CodeBlock.
  if (
    tags.some((t) => t.name === "Textarea" && stringValue(propValue(t.attrs, "lines")) === "auto")
  ) {
    add("layout.defaults", 'lines="auto" is the Textarea default — omit it');
  }

  if (hasLiteralColor(source)) {
    add("color.tokens", "Use semantic color tokens, not hex/rgb");
  }

  const paint = literalSvgPaint(source);
  if (paint) {
    const more = paint.count > 1 ? ` (and ${paint.count - 1} more)` : "";
    add(
      "color.svgPaint",
      `Literal colour in inline SVG: <${paint.element} ${paint.attr}="${paint.value}">${more} — paint with currentColor (set the colour with onBackground on the wrapper) or a token, var(--brand-solid-strong)`,
    );
  }

  if (/<img[\s>/]|<a[\s>/]|<button[\s>/]/.test(source)) {
    add(
      "components.primitives",
      "Use Once UI components (Media, SmartLink, Button) instead of raw HTML",
    );
  }

  for (const tag of tags) {
    if (tag.name !== "Card") continue;
    if (hasProp(tag.attrs, "href") || hasProp(tag.attrs, "onClick")) continue;
    // Spread props may well carry the handler; there is no telling from here.
    if (hasSpread(tag.attrs)) continue;
    // A card handed to a `trigger` prop is operated by whatever owns it
    // (DropdownWrapper, Dialog), so it carries no handler of its own and is
    // not the static-panel misuse this rule is looking for.
    if (insidePropValue(source, tag.start, "trigger")) continue;
    add(
      "Card.interactive",
      "Card without href/onClick — use Column + surface recipe for static panels",
    );
    break;
  }

  // A cast is how an unregistered name gets past the type check that 2.0's
  // IconName union exists for (rules.md 14b) — and it also hides the name
  // from the check below whenever the value is not a plain literal.
  const casts = stripComments(source).match(/\bas\s+IconName\b/g);
  if (casts) {
    add(
      "Icon.cast",
      `${casts.length} \`as IconName\` cast${casts.length > 1 ? "s" : ""} — never cast an icon name: use a registered one from iconNames (type the field as IconName, or write the literal \`as const\`), or register the icon by augmenting IconLibraryOverrides`,
    );
  }

  // The project's own registrations (`options.icons`, which the CLI reads
  // from the project) and the file's are names too. When either registers
  // icons in a way that cannot be read, a name missing from the list proves
  // nothing, so the check stands down rather than guess.
  const local = registeredIconNames(source);
  const project = options.icons || { names: new Set(), unresolved: false };
  if (iconNames.size && !local.unresolved && !project.unresolved) {
    const known = new Set([...iconNames, ...local.names, ...project.names]);
    const unknown = new Set();
    const iconProps = iconPropsByComponent(spec);
    for (const tag of tags) {
      for (const prop of iconProps.get(tag.name) || []) {
        const name = stringValue(propValue(tag.attrs, prop));
        if (name && !known.has(name)) unknown.add(`${tag.name} ${prop}="${name}"`);
      }
    }
    // Data for MegaMenu, Kbar, CodeBlock. Only identifier-shaped values: an
    // `icon: "/favicon.svg"` in some config object is a path, not a name.
    const fields = [...iconFields(spec)];
    if (fields.length) {
      const FIELD = new RegExp(
        `\\b(${fields.join("|")})\\s*:\\s*["']([A-Za-z][A-Za-z0-9]*)["']`,
        "g",
      );
      for (const [, field, name] of source.matchAll(FIELD)) {
        if (!known.has(name)) unknown.add(`${field}: "${name}"`);
      }
    }
    for (const where of unknown) {
      add(
        "Icon.names",
        `Unknown icon name in ${where} — use a name from iconNames in spec.json, or register it by augmenting IconLibraryOverrides`,
      );
    }
  }

  const seconds = tags
    .flatMap((t) => [...millisecondProps(spec, t.name)].map((prop) => [t.name, prop, t.attrs]))
    .find(([, prop, attrs]) => looksLikeSeconds(propValue(attrs, prop)));
  if (seconds) {
    add(
      "RevealFx.delay",
      `${seconds[0]} ${seconds[1]} is in milliseconds — use index * 100, not index * 0.1`,
    );
  }

  // Without the Next adapters, SmartLink, Button href, Media and the rest
  // render a plain <a> and <img>: no client navigation, no image
  // optimisation, and nothing fails to tell you so. An app that composes the
  // adapters itself has already done what the /next export does.
  const nextApp = options.next ?? importsNext(source);
  if (
    nextApp &&
    rootLayoutProviderImport(source) &&
    !/\b(?:NextAdapterProvider|nextAdapters|AdapterProvider)\b/.test(source)
  ) {
    add(
      "LayoutProvider.next",
      'In a Next.js app, import LayoutProvider from "@once-ui-system/core/next" — the root export renders links and images as plain <a> and <img>',
      "next-layout-provider",
    );
  }

  if (/<Fade[^>]*>[\s\S]*<(Column|Row)[^>]*overflowY/.test(source)) {
    add("Fade.edge", "Fade wrapping scroll content — use as absolute edge strip instead");
  }

  if (/style=\{\{[^}]*(gap|padding|margin|color|background):/.test(source)) {
    add("spacing.tokens", "Use token props (gap, padding, background) instead of style={{}}");
  }

  return issues;
}

/**
 * Rewrite the attribute text of opening tags, one at a time from a fresh scan,
 * since a tag nested in a prop value overlaps its parent's attribute text.
 */
function rewriteTags(source, edit) {
  let out = source;
  for (;;) {
    const tag = openingTags(out).find((t) => edit(t.attrs, t.name) !== t.attrs);
    if (!tag) return out;
    out = out.slice(0, tag.start) + edit(tag.attrs, tag.name) + out.slice(tag.end);
  }
}

const NEXT_IMPORT = /\bimport\s+\{([^}]*)\}\s*from\s*(["'])@once-ui-system\/core\/next\2/;

/**
 * Move `LayoutProvider` from the root import to `@once-ui-system/core/next`,
 * keeping any alias, and leave every other specifier where it was.
 */
function moveLayoutProviderToNext(source) {
  const m = rootLayoutProviderImport(source);
  if (m?.[1] !== "import") return source;
  const specifiers = m[3]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const moved = specifiers.find((s) => /^LayoutProvider\b/.test(s));
  const kept = specifiers.filter((s) => s !== moved);
  const quote = m[4];
  const semi = m[0].endsWith(";") ? ";" : "";
  const from = m[0].match(/@once-ui-system\/core(?:\/contexts)?/)[0];
  const rootImport = `import { ${kept.join(", ")} } from ${quote}${from}${quote}${semi}`;

  // An existing `/next` import takes the specifier; otherwise a new one goes
  // where the root import was.
  if (NEXT_IMPORT.test(source)) {
    const without = kept.length
      ? source.slice(0, m.index) + rootImport + source.slice(m.index + m[0].length)
      : source.slice(0, m.index) + source.slice(m.index + m[0].length).replace(/^\r?\n/, "");
    return without.replace(NEXT_IMPORT, (whole, list) => {
      const names = list
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      return whole.replace(`{${list}}`, `{ ${[...names, moved].join(", ")} }`);
    });
  }
  const nextImport = `import { ${moved} } from ${quote}@once-ui-system/core/next${quote}${semi}`;
  const replacement = kept.length ? `${rootImport}\n${nextImport}` : nextImport;
  return source.slice(0, m.index) + replacement + source.slice(m.index + m[0].length);
}

const CORE_IMPORT = /\bimport\s*\{([^}]*)\}\s*from\s*(["'])@once-ui-system\/core\2;?/;

/** Where `Flex` comes from: "core" (the package root), "elsewhere", or null when it is not imported. */
function flexImport(source) {
  let where = null;
  for (const m of source.matchAll(/\bimport\s+(type\s+)?([^;]*?)\s*from\s*(["'])([^"']+)\3/g)) {
    const [, typeOnly, clause, , from] = m;
    const named = /\{([^}]*)\}/.exec(clause)?.[1] ?? "";
    const local = named
      .split(",")
      .map((s) => s.trim().replace(/^type\s+/, ""))
      .filter((s) => /(?:^|\sas\s+)Flex$/.test(s));
    const isDefault = /^Flex\b/.test(clause.trim());
    if (!local.length && !isDefault) continue;
    if (!typeOnly && from === "@once-ui-system/core" && local.every((s) => s === "Flex")) {
      where ??= "core";
    } else {
      return "elsewhere";
    }
  }
  return where;
}

/**
 * Add `names` to the package-root import and drop `Flex` from it once nothing
 * else uses it, keeping the import's own layout (one line or one per line).
 */
function updateCoreImport(source, add) {
  const m = CORE_IMPORT.exec(source);
  if (!m) return source;
  const rest = source.slice(0, m.index) + source.slice(m.index + m[0].length);
  const specifiers = m[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const name = (s) => s.replace(/^type\s+/, "").split(/\s+as\s+/)[0];
  let next = specifiers.filter((s) => s !== "Flex" || /\bFlex\b/.test(rest));
  const sorted = next.every((s, i) => i === 0 || name(next[i - 1]) <= name(s));
  for (const extra of add) {
    if (next.some((s) => name(s) === extra)) continue;
    next = sorted
      ? [...next, extra].sort((a, b) => (name(a) < name(b) ? -1 : 1))
      : [...next, extra];
  }
  const semi = m[0].endsWith(";") ? ";" : "";
  const quote = m[2];
  const list = m[1].includes("\n")
    ? `{\n${next.map((s) => `  ${s},\n`).join("")}}`
    : `{ ${next.join(", ")} }`;
  const statement = `import ${list} from ${quote}@once-ui-system/core${quote}${semi}`;
  return source.slice(0, m.index) + statement + source.slice(m.index + m[0].length);
}

/**
 * The index just past the `</Flex>` that closes the element whose opening
 * tag ends at `from`, counting the Flex elements nested inside it.
 */
function closingFlex(source, from) {
  let depth = 1;
  for (const m of source.slice(from).matchAll(/<\/Flex\s*>|<Flex\b/g)) {
    const at = from + m.index;
    if (m[0].startsWith("</")) {
      if (--depth === 0) return { start: at, end: at + m[0].length };
    } else if (!/[\w$.)\]]/.test(source[at - 1])) {
      const end = tagEnd(source, at + m[0].length);
      if (!/\/\s*$/.test(source.slice(at + m[0].length, end))) depth++;
    }
  }
  return null;
}

/**
 * Rename every `<Flex>` whose direction never changes to the `Row` or
 * `Column` it is, closing tag included, dropping the literal direction that
 * is now the component's own, and fix the import. Only where the rewrite is
 * exact: the tag's props show everything (no spread, readable breakpoints)
 * and `Flex` is the package's, not a local component or an alias.
 */
function flexToRowColumn(source) {
  if (flexImport(source) === "elsewhere") return source;
  let out = source;
  const added = new Set();
  for (;;) {
    const tag = openingTags(out).find((t) => t.name === "Flex" && staticFlex(t.attrs)?.exact);
    if (!tag) break;
    const { to } = staticFlex(tag.attrs);
    const attrs = replaceOwnProps(
      tag.attrs,
      /\s+direction=(?:"(?:row|column)"|'(?:row|column)'|\{\s*["'`](?:row|column)["'`]\s*\})(?=[\s/]|$)/,
      "",
    );
    const open = tag.start - "Flex".length;
    const selfClosing = /\/\s*$/.test(tag.attrs);
    const close = selfClosing ? null : closingFlex(out, tag.end + 1);
    if (!selfClosing && !close) break;
    let next = out;
    if (close) next = `${next.slice(0, close.start)}</${to}>${next.slice(close.end)}`;
    next = next.slice(0, open) + to + attrs + next.slice(tag.end);
    out = next;
    added.add(to);
  }
  return added.size && flexImport(source) === "core" ? updateCoreImport(out, [...added]) : out;
}

/**
 * Typed theme props for the raw attributes `rawThemeAttributes` finds — the
 * same attribute in the DOM, written through the prop the component types.
 */
function typedThemeProps(source, spec) {
  return rewriteTags(source, (attrs, name) => {
    let out = attrs;
    for (const { attribute, prop } of rawThemeAttributes(spec, [{ name, attrs }])) {
      out = replaceOwnProps(out, new RegExp(`(^|\\s)${attribute}=`), `$1${prop}=`);
    }
    return out;
  });
}

function applyFixes(source, issues, spec = loadSpec()) {
  let out = source;
  for (const issue of issues) {
    if (issue.fix === "Row" || issue.fix === "Column") {
      out = flexToRowColumn(out);
    }
    if (issue.fix === "typed-theme-props") {
      out = typedThemeProps(out, spec);
    }
    if (issue.fix === "fill") {
      out = rewriteTags(out, (attrs) => collapsePair(attrs, FILL_WIDTH, FILL_HEIGHT, "fill"));
    }
    if (issue.fix === "center") {
      out = rewriteTags(out, (attrs) =>
        collapsePair(attrs, HORIZONTAL_CENTER, VERTICAL_CENTER, "center"),
      );
    }
    if (issue.fix === "drop-fillWidth") {
      out = rewriteTags(out, (attrs) =>
        hasProp(attrs, "fillWidth") && LITERAL_MAX_WIDTH.test(ownProps(attrs))
          ? replaceOwnProps(attrs, /\s+fillWidth(?=[\s/]|$)/, "")
          : attrs,
      );
    }
    if (issue.fix === "drop-minWidth-0") {
      out = rewriteTags(out, (attrs) =>
        hasProp(attrs, "fillWidth") && MIN_WIDTH_ZERO.test(ownProps(attrs))
          ? replaceOwnProps(attrs, /\s+minWidth=(?:\{\s*0\s*\}|\{?["']0["']\}?)(?=[\s/]|$)/, "")
          : attrs,
      );
    }
    if (issue.fix === "default-border") {
      out = rewriteTags(out, (attrs) =>
        replaceOwnProps(
          attrs,
          /(border(?:Top|Right|Bottom|Left|X|Y)?)=["']neutral-alpha-weak["']/g,
          "$1",
        ),
      );
    }
    if (issue.fix === "next-layout-provider") {
      out = moveLayoutProviderToNext(out);
    }
  }
  return out;
}

function main() {
  const spec = loadSpec();
  const iconNames = parseIconNames(spec);
  const flags = parseFlags(process.argv.slice(2));

  let failed = false;
  for (const { source, file } of readInputs(flags)) {
    const dir = flags.stdin ? process.cwd() : path.dirname(path.resolve(file));
    const next = flags.next ?? (importsNext(source) || isNextProject(dir));
    const icons = projectIconNames(projectRoot(dir));

    const issues = validate(source, spec, iconNames, { next, icons });

    if (issues.length === 0) {
      console.log(`✓ ${file}: no mechanical issues`);
      continue;
    }

    failed = true;
    console.log(`✗ ${file}: ${issues.length} issue(s)`);
    for (const issue of issues) {
      console.log(`  [${issue.rule}] ${issue.message}`);
    }

    if (flags.fix) {
      const fixed = applyFixes(source, issues, spec);
      if (fixed !== source && !flags.stdin) {
        fs.writeFileSync(file, fixed);
        console.log(`Applied auto-fixes to ${file}`);
      }
    }
  }

  process.exit(failed ? 1 : 0);
}

// Importable for tests; the CLI runs only when this file is invoked directly.
if (require.main === module) main();

module.exports = {
  validate,
  applyFixes,
  PRE_2_PROPS,
  loadSpec,
  parseIconNames,
  iconPropsByComponent,
  registeredIconNames,
  projectIconNames,
  projectRoot,
  isNextProject,
  hasLiteralColor,
  literalSvgPaint,
  rawThemeAttributes,
  insidePropValue,
  openingTags,
  jsxElements,
  ownProps,
};
