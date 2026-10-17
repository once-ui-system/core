/**
 * Exports the design tokens in `scss/tokens/` as JSON, so platforms that cannot
 * load a stylesheet (React Native today; Figma, Swift or Kotlin later) read the
 * same values the web does.
 *
 * The output is the token cascade itself, not a pre-resolved theme: one layer
 * per CSS rule, with the `data-*` attributes the rule's selector needs and the
 * custom properties it sets. A reader picks a theme the way the browser does,
 * by applying every layer whose conditions match, least specific first. That
 * keeps every combination of theme, brand, accent, neutral, solid, border,
 * surface and scaling available without exporting each one. See
 * `tokens/README.md` for the format.
 *
 * Values are rewritten for readers without a CSS engine: `oklch()` and `rgba()`
 * become hex (8 digits when translucent), `var(--x)` becomes `{x}`, shadows
 * become arrays and arithmetic `calc()` on one unit is evaluated. Lengths keep
 * their unit ("1.5rem", "1px") because rem follows the root font size, which
 * Once UI changes per device (`--font-scaling-*`).
 *
 * Run with `--check` to verify the checked-in file matches a fresh export
 * (CI and `test/tokens-export.test.ts` do).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as sass from "sass";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "tokens/once-ui.tokens.json");

/* ---------------------------------------------------------------- colours */

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const toHex = (x) =>
  Math.round(clamp01(x) * 255)
    .toString(16)
    .padStart(2, "0");
const gamma = (x) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055);

function hex(r, g, b, a = 1) {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${a < 1 ? toHex(a) : ""}`;
}

/** OKLCH to sRGB hex, clipping out-of-gamut channels (as browsers do on sRGB screens). */
export function oklchToHex(l, c, h, alpha = 1) {
  const rad = (h * Math.PI) / 180;
  const a = c * Math.cos(rad);
  const b = c * Math.sin(rad);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const r = 4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
  const g = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
  const bl = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_;
  return hex(gamma(r), gamma(g), gamma(bl), alpha);
}

function color(value) {
  let m = value.match(/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+))?\s*\)$/);
  if (m) return oklchToHex(+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]);
  m = value.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+))?\s*\)$/);
  if (m) return hex(m[1] / 255, m[2] / 255, m[3] / 255, m[4] === undefined ? 1 : +m[4]);
  m = value.match(/^#([0-9a-f]{3,8})$/i);
  if (m) {
    let h = m[1].toLowerCase();
    if (h.length <= 4) h = [...h].map((ch) => ch + ch).join("");
    // Fully opaque 8-digit hex reads better as 6.
    return `#${h.length === 8 && h.endsWith("ff") ? h.slice(0, 6) : h}`;
  }
  return null;
}

/* ----------------------------------------------------------------- values */

const COLOR_IN_LIST = /(oklch|rgba?)\([^)]*\)|#[0-9a-f]{3,8}/gi;

function shadow(value) {
  const parts = value.split(/,(?![^(]*\))/).map((p) => p.trim());
  const out = [];
  for (const part of parts) {
    const c = part.match(COLOR_IN_LIST);
    if (!c) return null;
    const lengths = part.replace(COLOR_IN_LIST, "").trim().split(/\s+/);
    if (lengths.length < 2 || lengths.length > 4) return null;
    const px = lengths.map((l) => (l === "0" ? 0 : l.endsWith("px") ? Number.parseFloat(l) : NaN));
    if (px.some(Number.isNaN)) return null;
    const [x, y, blur = 0, spread = 0] = px;
    out.push({ x, y, blur, spread, color: color(c[0]) });
  }
  return out;
}

/** `calc(0.25rem * 1.1)` → "0.275rem": one unit, no var(), only * and /. */
function calc(value) {
  const m = value.match(/^calc\(\s*([\d.]+)(rem|px)\s*([*/])\s*([\d.]+)\s*\)$/);
  if (!m) return null;
  const n = m[3] === "*" ? +m[1] * +m[4] : +m[1] / +m[4];
  return `${+n.toFixed(4)}${m[2]}`;
}

function value(name, raw) {
  const v = raw.trim();
  const ref = v.match(/^var\(--([\w-]+)\)$/);
  if (ref) return ref[1] === name ? undefined : `{${ref[1]}}`;
  if (/^-?[\d.]+$/.test(v)) return Number(v);
  return color(v) ?? (name.startsWith("shadow-") ? shadow(v) : null) ?? calc(v) ?? v;
}

/* ----------------------------------------------------------------- parser */

/** Top-level blocks of plain CSS: `{ prelude, body }`, recursing into @media. */
function blocks(css) {
  const out = [];
  let depth = 0;
  let start = 0;
  let prelude = "";
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (ch === "{") {
      if (depth === 0) {
        prelude = css.slice(start, i).trim();
        start = i + 1;
      }
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) {
        out.push({ prelude, body: css.slice(start, i) });
        start = i + 1;
      }
    }
  }
  return out;
}

/** `[data-theme="dark"] [data-solid="color"]` → { theme: "dark", solid: "color" }. */
function conditions(selector) {
  if (selector === ":root") return {};
  const when = {};
  // Sass drops the quotes around simple attribute values.
  const rest = selector.replace(/\[data-([\w-]+)="?([^"\]]*)"?\]/g, (_, attr, val) => {
    when[attr.replace(/-(\w)/g, (__, c) => c.toUpperCase())] = val;
    return " ";
  });
  // Anything else (a class, an element) styles elements, not tokens.
  return rest.trim() === "" ? when : null;
}

function declarations(body) {
  const tokens = {};
  for (const decl of body.split(";")) {
    const m = decl.match(/^\s*--([\w-]+)\s*:\s*([\s\S]+?)\s*$/);
    if (!m) continue;
    const v = value(m[1], m[2]);
    if (v !== undefined) tokens[m[1]] = v;
  }
  return tokens;
}

function maxWidth(media) {
  const m = media.match(/^@media\s*\(max-width:\s*(\d+)px\)$/);
  if (!m) throw new Error(`export-tokens: unsupported media query "${media}"`);
  return +m[1];
}

function layers(css) {
  const out = [];
  const visit = (list, media) => {
    for (const { prelude, body } of list) {
      if (prelude.startsWith("@media")) {
        visit(blocks(body), maxWidth(prelude));
        continue;
      }
      const tokens = declarations(body);
      if (Object.keys(tokens).length === 0) continue;
      for (const selector of prelude.split(",").map((s) => s.trim())) {
        const when = conditions(selector);
        if (!when) continue;
        out.push({ when, ...(media ? { maxWidth: media } : {}), tokens });
      }
    }
  };
  visit(blocks(css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/@charset[^;]*;/, "")), undefined);
  return out;
}

/* ----------------------------------------------------------------- export */

function breakpoints() {
  const src = readFileSync(join(ROOT, "scss/styles/breakpoints.scss"), "utf8");
  return Object.fromEntries(
    [...src.matchAll(/^\$breakpoint-(\w+):\s*(\d+)px;/gm)].map((m) => [m[1], +m[2]]),
  );
}

export function exportTokens() {
  const { css } = sass.compile(join(ROOT, "scss/tokens/index.scss"), { style: "expanded" });
  const doc = {
    $description:
      "Once UI design tokens, exported from packages/foundations/scss/tokens by scripts/export-tokens.mjs. Do not edit; see tokens/README.md.",
    format: "once-ui-tokens",
    version: 1,
    breakpoints: breakpoints(),
    layers: layers(css),
  };
  return `${JSON.stringify(doc, null, 2)}\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const next = exportTokens();
  if (process.argv.includes("--check")) {
    let current = "";
    try {
      current = readFileSync(OUT, "utf8");
    } catch {}
    if (current !== next) {
      console.error("tokens/once-ui.tokens.json is stale: run `pnpm export:tokens`");
      process.exit(1);
    }
    console.log("token export is up to date");
  } else {
    writeFileSync(OUT, next);
    console.log(`wrote ${OUT}`);
  }
}
