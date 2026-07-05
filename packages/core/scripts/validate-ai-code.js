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

  if (/#[0-9a-fA-F]{3,8}\b|rgb\s*\(|rgba\s*\(/.test(source)) {
    add("color.tokens", "Use semantic color tokens, not hex/rgb");
  }

  if (/<img[\s>/]|<a[\s>/]|<button[\s>/]/.test(source)) {
    add("components.primitives", "Use Once UI components (Media, SmartLink, Button) instead of raw HTML");
  }

  const cardMatches = source.match(/<Card\b[^>]*>/g) || [];
  for (const tag of cardMatches) {
    if (!/\b(href|onClick)=/.test(tag)) {
      add("Card.interactive", "Card without href/onClick — use Column + surface recipe for static panels");
      break;
    }
  }

  const iconPropRe = /(?:prefixIcon|suffixIcon|name)=["']([^"']+)["']/g;
  let iconMatch;
  while ((iconMatch = iconPropRe.exec(source)) !== null) {
    const name = iconMatch[1];
    if (iconNames.size && !iconNames.has(name)) {
      add("Icon.names", `Unknown icon name "${name}" — use IconName from spec.json`);
    }
  }

  if (/delay=\{[^}]*\*\s*80/.test(source)) {
    add("RevealFx.delay", "RevealFx delay is in seconds — use index * 0.1, not index * 80");
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

main();
