#!/usr/bin/env node
// System adherence (iterative track, METHODOLOGY.md §11 2026-11-10): does an
// app use the arm's own system, or work around it? Static, over the files the
// run wrote. Counted per app:
//   system   JSX elements whose tag comes from the arm's system (imports from
//            its packages, or the scaffold's own component folder for shadcn
//            and Chakra snippets)
//   raw      raw HTML controls the system provides (button, input, select,
//            textarea, table, dialog, progress, meter). Layout and text tags
//            (div, span, p, h1...) are not counted: utility-first arms build
//            layout from them by design, and SVG drawing is needed everywhere
//   share    system / (system + raw); not defined for the Tailwind arm, whose
//            system is utility classes rather than components
//   colours  raw colour literals (#hex, rgb(), hsl(), oklch()) in code and CSS,
//            except in the arm's theme files (its prescribed theming path) and
//            in CSS custom property declarations (tokens)
//   cssLines stylesheet rule lines the run wrote (custom property declarations,
//            braces and at-rule lines are not counted)
// An app adheres when share >= MIN_SHARE (library arms), colours <= MAX_COLOURS
// and cssLines <= MAX_CSS_LINES. Thresholds fixed before the first iterative run.
//
//   node runner/adherence.mjs --arm A --dir <folder of the run's files>

import fs from "node:fs";
import path from "node:path";
import { listFiles } from "./lib.mjs";

// Checks an agent may run in the iterative track (runner/iter-check.mjs).
export const MAX_CHECKS = 6;
export const MIN_SHARE = 0.6;
export const MAX_COLOURS = 12;
export const MAX_CSS_LINES = 150;

const SYSTEM = {
  A: [/^@once-ui-system\//],
  B: [/^@once-ui-system\//],
  S: [/^@once-ui-system\//],
  C: [/^@\/components\/ui\//, /(^|\/)components\/ui\//],
  D: null,
  M: [/^@mui\//],
  K: [/^@chakra-ui\//, /^@\/components\/ui\//, /(^|\/)components\/ui\//],
  T: [/^@mantine\//],
};

const CONTROLS = new Set(["button", "input", "select", "textarea", "table", "dialog", "progress", "meter"]);

// The arm's theming entry points: colours there are the system's own theme.
const THEME_FILES = {
  A: ["app/providers.tsx", "app/layout.tsx"],
  B: ["app/providers.tsx", "app/layout.tsx"],
  S: ["src/resources/once-ui.config.js", "src/resources/once-ui.config.ts"],
  C: [],
  D: [],
  M: ["app/theme.ts"],
  K: ["components/ui/provider.tsx", "theme.ts", "app/theme.ts", "lib/theme.ts"],
  T: ["app/theme.ts"],
};

function imports(src) {
  const names = new Map();
  const re = /import\s+(type\s+)?([^;]*?)\s+from\s+["']([^"']+)["']/gs;
  for (const m of src.matchAll(re)) {
    if (m[1]) continue;
    const spec = m[2];
    const mod = m[3];
    const def = /^([A-Za-z_$][\w$]*)/.exec(spec.trim());
    if (def && !spec.trim().startsWith("{") && !spec.trim().startsWith("*")) names.set(def[1], mod);
    const ns = /\*\s+as\s+([A-Za-z_$][\w$]*)/.exec(spec);
    if (ns) names.set(ns[1], mod);
    const named = /\{([^}]*)\}/s.exec(spec);
    if (named) {
      for (const part of named[1].split(",")) {
        const p = part.trim().replace(/^type\s+/, "");
        if (!p || part.trim().startsWith("type ")) continue;
        const local = p.split(/\s+as\s+/).pop().trim();
        names.set(local, mod);
      }
    }
  }
  return names;
}

const isToken = (l) => /^\s*--[\w-]+\s*:/.test(l);

export function adherence(letter, dir) {
  const files = listFiles(dir);
  const patterns = SYSTEM[letter];
  let system = 0;
  let raw = 0;
  let colours = 0;
  let cssLines = 0;
  const rawTags = {};
  for (const f of files) {
    const src = fs.readFileSync(path.join(dir, f), "utf8");
    if (/\.(css|scss|sass)$/.test(f)) {
      cssLines += src
        .split("\n")
        .filter((l) => l.trim() && !/^\s*(\/\*|\*|\/\/|@|[{}]\s*$)/.test(l) && !isToken(l) && !/\{\s*$/.test(l)).length;
    }
    if (!/\.(tsx?|jsx?|css|scss)$/.test(f)) continue;
    if (!(THEME_FILES[letter] ?? []).includes(f)) {
      const code = /\.(css|scss)$/.test(f) ? src.split("\n").filter((l) => !isToken(l)).join("\n") : src;
      colours += (code.match(/#[0-9a-fA-F]{3,8}\b|\b(rgba?|hsla?|oklch|oklab|lab|lch)\(/g) ?? []).length;
    }
    if (!/\.(tsx|jsx)$/.test(f)) continue;
    const names = imports(src);
    // A JSX opening tag: `<Name` not preceded by an identifier character (that
    // would be a TypeScript generic such as useState<Foo>).
    for (const m of src.matchAll(/(^|[^\w$.])<([A-Za-z][\w]*)((?:\.[A-Za-z]\w*)*)(?=[\s/>])/g)) {
      const tag = m[2];
      if (/^[a-z]/.test(tag)) {
        if (!CONTROLS.has(tag)) continue;
        raw++;
        rawTags[tag] = (rawTags[tag] ?? 0) + 1;
        continue;
      }
      const mod = names.get(tag);
      if (mod && patterns?.some((p) => p.test(mod))) system++;
    }
  }
  const share = patterns ? (system + raw ? system / (system + raw) : 0) : null;
  const reasons = [];
  if (share != null && share < MIN_SHARE) {
    reasons.push(`only ${Math.round(share * 100)}% of the UI components come from the stack (${system} of ${system + raw}; raw HTML controls count against it; at least ${MIN_SHARE * 100}% needed). Raw controls used: ${Object.entries(rawTags).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([t, n]) => `<${t}> ×${n}`).join(", ")}`);
  }
  if (colours > MAX_COLOURS) reasons.push(`${colours} raw colour literals (#hex, rgb(), hsl(), oklch()); at most ${MAX_COLOURS}. Use the stack's colour tokens or theme instead`);
  if (cssLines > MAX_CSS_LINES) reasons.push(`${cssLines} lines of custom stylesheet; at most ${MAX_CSS_LINES}. Style through the stack instead`);
  return { system, raw, share: share == null ? null : Math.round(share * 1000) / 1000, colours, cssLines, ok: reasons.length === 0, reasons };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const arg = (k) => process.argv[process.argv.indexOf(`--${k}`) + 1];
  console.log(JSON.stringify(adherence(arg("arm"), path.resolve(arg("dir"))), null, 2));
}
