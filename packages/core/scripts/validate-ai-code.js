#!/usr/bin/env node
/**
 * Mechanical Once UI codegen validator.
 * Usage: node scripts/validate-ai-code.js <file.tsx> [--fix]
 *        node scripts/validate-ai-code.js --stdin < file.tsx
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SPEC_PATH = path.join(ROOT, "ai", "spec.json");

function loadSpec() {
  if (!fs.existsSync(SPEC_PATH)) return { components: {}, tokens: {} };
  return JSON.parse(fs.readFileSync(SPEC_PATH, "utf8"));
}

function parseIconNames(spec) {
  const raw = spec.tokens?.IconName || "";
  const matches = raw.match(/"([^"]+)"/g) || [];
  return new Set(matches.map((m) => m.slice(1, -1)));
}

function readInput(argv) {
  const fileArg = argv.find((a) => !a.startsWith("-"));
  if (argv.includes("--stdin")) {
    return { source: fs.readFileSync(0, "utf8"), file: "<stdin>" };
  }
  if (!fileArg) {
    console.error("Usage: validate-ai-code.js <file.tsx> [--fix] | --stdin");
    process.exit(2);
  }
  return { source: fs.readFileSync(fileArg, "utf8"), file: fileArg };
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
  const re = /<([A-Z][A-Za-z0-9.]*)\b/g;
  let m;
  while ((m = re.exec(source)) !== null) {
    const start = m.index + m[0].length;
    let i = start;
    let depth = 0;
    let quote = null;
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
    tags.push({ name: m[1], attrs: source.slice(start, i), start, end: i });
  }
  return tags;
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

const HORIZONTAL_CENTER = /(?:^|\s)horizontal=["']center["']/;
const VERTICAL_CENTER = /(?:^|\s)vertical=["']center["']/;
const LITERAL_MAX_WIDTH =
  /(?:^|\s)maxWidth=(?:"[^"]*"|\{\s*(?:\d+(?:\.\d+)?|"[^"]*"|'[^']*')\s*\})(?=[\s/]|$)/;
const MIN_WIDTH_ZERO = /(?:^|\s)minWidth=(?:\{\s*0\s*\}|\{?["']0["']\}?)(?=[\s/]|$)/;
const DEFAULT_BORDER = /(?:^|\s)(border(?:Top|Right|Bottom|Left|X|Y)?)=["']neutral-alpha-weak["']/;

function validate(source, spec, iconNames) {
  const issues = [];

  const add = (rule, message, fix) => issues.push({ rule, message, fix });

  // Per element: `fillWidth` on a parent and `fillHeight` on its child is not
  // a shorthand missed, and neither is `horizontal="center"` on a header row
  // beside `vertical="center"` on the row inside it.
  const tags = openingTags(source);
  if (tags.some((t) => hasProp(t.attrs, "fillWidth") && hasProp(t.attrs, "fillHeight"))) {
    add("layout.shorthands", "Use fill instead of fillWidth + fillHeight", "fill");
  }
  if (/<Flex[^>]*direction="column"/.test(source)) {
    add("layout.shorthands", 'Use Column instead of Flex direction="column"', "Column");
  }
  if (/<Flex[^>]*direction="row"/.test(source)) {
    add("layout.shorthands", 'Use Row instead of Flex direction="row"', "Row");
  }
  if (tags.some((t) => isCentered(t.attrs))) {
    add(
      "layout.shorthands",
      'Use center instead of horizontal="center" vertical="center"',
      "center",
    );
  }

  if (/position="relative"/.test(source)) {
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

  // A zIndex only means something against a sibling in the same stacking
  // group, and that group is always anchored by something positioned.
  if (/\bzIndex=/.test(source) && !/position=["'](?:absolute|fixed|sticky)["']/.test(source)) {
    add(
      "zIndex.scope",
      "zIndex with nothing positioned absolute, fixed or sticky — zIndex belongs to an isolated stacking group, not a lone element",
    );
  }

  if (/<Button[^>]*variant="primary"/.test(source)) {
    add("layout.defaults", 'variant="primary" is the Button default — omit it');
  }

  // Scoped to the tag: `lines` is a different prop on Background and CodeBlock.
  if (/<Textarea[^>]*\blines=\{?["']auto["']/.test(source)) {
    add("layout.defaults", 'lines="auto" is the Textarea default — omit it');
  }

  if (hasLiteralColor(source)) {
    add("color.tokens", "Use semantic color tokens, not hex/rgb");
  }

  if (/<img[\s>/]|<a[\s>/]|<button[\s>/]/.test(source)) {
    add(
      "components.primitives",
      "Use Once UI components (Media, SmartLink, Button) instead of raw HTML",
    );
  }

  for (const match of source.matchAll(/<Card\b[^>]*>/g)) {
    if (/\b(href|onClick)=/.test(match[0])) continue;
    // A card handed to a `trigger` prop is operated by whatever owns it
    // (DropdownWrapper, Dialog), so it carries no handler of its own and is
    // not the static-panel misuse this rule is looking for.
    if (insidePropValue(source, match.index, "trigger")) continue;
    add(
      "Card.interactive",
      "Card without href/onClick — use Column + surface recipe for static panels",
    );
    break;
  }

  const iconPropRe = /(?:prefixIcon|suffixIcon|name)=["']([^"']+)["']/g;
  let iconMatch;
  while ((iconMatch = iconPropRe.exec(source)) !== null) {
    const name = iconMatch[1];
    if (iconNames.size && !iconNames.has(name)) {
      add("Icon.names", `Unknown icon name "${name}" — use IconName from spec.json`);
    }
  }

  if (
    /\b(?:delay|speed)=\{[^}]*\*\s*0?\.\d+/.test(source) ||
    /\b(?:delay|speed)=\{\s*0?\.\d+\s*\}/.test(source)
  ) {
    add(
      "RevealFx.delay",
      "RevealFx delay and ShineFx speed are milliseconds — use index * 100, not index * 0.1",
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

function applyFixes(source, issues) {
  let out = source;
  for (const issue of issues) {
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
  }
  return out;
}

function main() {
  const spec = loadSpec();
  const iconNames = parseIconNames(spec);
  const fix = process.argv.includes("--fix");
  const { source, file } = readInput(process.argv.slice(2));

  const issues = validate(source, spec, iconNames);

  if (issues.length === 0) {
    console.log(`✓ ${file}: no mechanical issues`);
    process.exit(0);
  }

  console.log(`✗ ${file}: ${issues.length} issue(s)`);
  for (const issue of issues) {
    console.log(`  [${issue.rule}] ${issue.message}`);
  }

  if (fix) {
    const fixed = applyFixes(source, issues);
    if (fixed !== source && !process.argv.includes("--stdin")) {
      const fileArg = process.argv.find((a) => a.endsWith(".tsx") || a.endsWith(".jsx"));
      fs.writeFileSync(fileArg, fixed);
      console.log(`Applied auto-fixes to ${fileArg}`);
    }
  }

  process.exit(1);
}

// Importable for tests; the CLI runs only when this file is invoked directly.
if (require.main === module) main();

module.exports = {
  validate,
  applyFixes,
  loadSpec,
  parseIconNames,
  hasLiteralColor,
  insidePropValue,
  openingTags,
  ownProps,
};
