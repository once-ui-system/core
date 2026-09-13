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

function validate(source, spec, iconNames) {
  const issues = [];

  const add = (rule, message, fix) => issues.push({ rule, message, fix });

  if (/fillWidth[\s\S]{0,80}fillHeight|<Flex[^>]*direction="column"|<Flex[^>]*direction="row"/.test(source)) {
    if (/fillWidth[\s\S]{0,120}fillHeight/.test(source)) {
      add("layout.shorthands", "Use fill instead of fillWidth + fillHeight", "fill");
    }
    if (/<Flex[^>]*direction="column"/.test(source)) {
      add("layout.shorthands", "Use Column instead of Flex direction=\"column\"", "Column");
    }
    if (/<Flex[^>]*direction="row"/.test(source)) {
      add("layout.shorthands", "Use Row instead of Flex direction=\"row\"", "Row");
    }
  }

  if (/horizontal="center"[\s\S]{0,80}vertical="center"/.test(source)) {
    add("layout.shorthands", "Use center instead of horizontal=\"center\" vertical=\"center\"", "center");
  }

  if (/position="relative"/.test(source)) {
    add("layout.defaults", "position=\"relative\" is the default — omit it");
  }

  if (/<Button[^>]*variant="primary"/.test(source)) {
    add("layout.defaults", "variant=\"primary\" is the Button default — omit it");
  }

  if (hasLiteralColor(source)) {
    add("color.tokens", "Use semantic color tokens, not hex/rgb");
  }

  if (/<img[\s>/]|<a[\s>/]|<button[\s>/]/.test(source)) {
    add("components.primitives", "Use Once UI components (Media, SmartLink, Button) instead of raw HTML");
  }

  for (const match of source.matchAll(/<Card\b[^>]*>/g)) {
    if (/\b(href|onClick)=/.test(match[0])) continue;
    // A card handed to a `trigger` prop is operated by whatever owns it
    // (DropdownWrapper, Dialog), so it carries no handler of its own and is
    // not the static-panel misuse this rule is looking for.
    if (insidePropValue(source, match.index, "trigger")) continue;
    add("Card.interactive", "Card without href/onClick — use Column + surface recipe for static panels");
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

function applyFixes(source, issues) {
  let out = source;
  for (const issue of issues) {
    if (issue.fix === "fill") {
      out = out.replace(/\bfillWidth\b\s*\n?\s*\bfillHeight\b/g, "fill");
    }
    if (issue.fix === "center") {
      out = out.replace(/\bhorizontal="center"\s*\n?\s*vertical="center"/g, "center");
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

module.exports = { validate, loadSpec, parseIconNames, hasLiteralColor, insidePropValue };
