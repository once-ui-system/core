#!/usr/bin/env node
/**
 * Once UI 2.x → 3.0 codemod.
 *
 * Built on the 2.0 codemod's scanner: renames are component-scoped (a prop is
 * only renamed inside an element that is Once UI's component, found through
 * the file's imports, or by name in MDX where components have no import), and
 * anything a rewrite cannot do exactly is reported for a human instead of
 * guessed. Every pass is idempotent, so running it twice changes nothing.
 *
 * The break list it follows is MIGRATING.md § "2.x → 3.0"; each pass below
 * names the row it implements.
 *
 * Usage:  node scripts/codemod-3.0.mjs <dir> [--dry]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  attributesOf,
  importBindings,
  isCoreSource,
  literal,
  localNamesFor,
  openingTagEnd,
  specifiersOf,
  withLeadingSpace,
} from "./codemod-2.0.mjs";

/** component → { oldProp: newProp } */
const TRANSFORMS = {
  // A5: the camel-case alias of the native attribute.
  IconButton: { ariaLabel: "aria-label" },
  Spinner: { ariaLabel: "aria-label" },
  Switch: { ariaLabel: "aria-label" },
  Scrubber: { ariaLabel: "aria-label" },
  StatusIndicator: { ariaLabel: "aria-label" },
};

/**
 * C: one value contract. State `X` is `X` / `defaultX` / `onXChange(next)`,
 * and `onChange` only ever means the native DOM event. Each handler below
 * keeps its 2.x signature, so renaming the attribute is the whole migration.
 * Merged into TRANSFORMS per component.
 */
const VALUE_CONTRACT_FIELDS = {
  // C1/C2: text-like fields and pickers. `onChange` on these is the native
  // event of the real <input> in 3.0 (NumberInput, ColorInput, TagInput's text
  // field, DateInput), or no longer accepted (DateRangeInput and the pickers).
  NumberInput: { onChange: "onValueChange" },
  ColorInput: { onChange: "onValueChange" },
  TagInput: { onChange: "onValueChange" },
  DateInput: { onChange: "onValueChange" },
  DateRangeInput: { onChange: "onValueChange" },
  DateRangePicker: { onChange: "onValueChange" },
  // `defaultDate` was declared and never read in 2.x; `defaultValue` works.
  DatePicker: { onChange: "onValueChange", defaultDate: "defaultValue" },
  // `onSelect` stays the action on menus (DropdownWrapper, ContextMenu).
  Select: { onSelect: "onValueChange" },
};

const VALUE_CONTRACT_CONTROLS = {
  // C3/C4: toggles, groups, disclosure.
  // C3: `onToggle(checked)` → `onCheckedChange(checked)`; `onChange` is now
  // the hidden `<input>`'s native event.
  Checkbox: { onToggle: "onCheckedChange" },
  RadioButton: { onToggle: "onCheckedChange" },
  Switch: { onToggle: "onCheckedChange" },
  // Docs-site wrapper that forwards its props to Switch.
  ClientSwitch: { onToggle: "onCheckedChange" },
  // Value handlers: `onChange(value)` → `onValueChange(value)`.
  RadioGroup: { onChange: "onValueChange" },
  SegmentedControl: { onChange: "onValueChange" },
  Tabs: { onChange: "onValueChange" },
  Slider: { onChange: "onValueChange" },
  RangeSlider: { onChange: "onValueChange" },
  ThemeSwitcher: { onChange: "onValueChange" },
  StylePanel: { onChange: "onValueChange" },
  "StylePanel.Root": { onChange: "onValueChange" },
  Pagination: { onChange: "onPageChange" },
  Scrubber: { onChange: "onValueChange", onSelect: "onSelectedChange" },
  // C4: `onToggle()` → `onOpenChange(open)`. Flagged in FLAGGED as well.
  Accordion: { onToggle: "onOpenChange" },
  NavGroup: { onToggle: "onOpenChange" },
  // The `default*` spelling of an uncontrolled starting state.
  RevealFx: { revealedByDefault: "defaultRevealed" },
  Carousel: { revealedByDefault: "defaultRevealed" },
  // A field's height is `size` everywhere else.
  Kbar: { inputSize: "size" },
  KbarContent: { inputSize: "size" },
};

for (const table of [VALUE_CONTRACT_FIELDS, VALUE_CONTRACT_CONTROLS]) {
  for (const [tag, map] of Object.entries(table)) TRANSFORMS[tag] = { ...TRANSFORMS[tag], ...map };
}

/**
 * Props kept by name whose meaning changed, so a rename cannot carry them:
 * component → { prop: note }. Every use is reported.
 */
const FLAGGED = {
  // C: entries appended by the value-contract passes.
  DatePicker: {
    open:
      "was an autofocus hint, not visibility: it re-focuses the grid each time it turns true. " +
      "Keep it only alongside autoFocus for a picker you open yourself; otherwise remove it",
  },
  // C4: renamed too, but the handler now receives the next state, and
  // `open` controls the accordion whether or not a handler is passed.
  Accordion: {
    onToggle:
      "renamed to onOpenChange, which receives the next open state (a zero-argument toggle still works)",
    open:
      "now controls the accordion whenever it is set; if it only gave the starting state " +
      "(no onToggle/onOpenChange beside it), use defaultOpen",
  },
  NavGroup: {
    onToggle:
      "renamed to onOpenChange, which receives the next open state (a zero-argument toggle still works)",
  },
};

/** The `{…}` contents of an attribute value, or the quoted string as written. */
const expressionOf = (raw) => {
  const v = String(raw).trim();
  return v.startsWith("{") ? v.slice(1, -1).trim() : v;
};

/**
 * A2: Dialog `hideClose` → `showClose`.
 *
 * In 2.x `showClose` won when both were set, so a `hideClose` next to a
 * `showClose` never did anything and is simply dropped.
 */
function rewriteDialog(src, attrs) {
  const hide = attrs.find((a) => a.name === "hideClose");
  if (!hide) return { edits: [], warnings: [] };
  const drop = { at: withLeadingSpace(src, hide.at), end: hide.end, text: "" };
  if (attrs.some((a) => a.name === "showClose")) {
    return { edits: [{ ...drop, hit: "hideClose removed (showClose already set)" }], warnings: [] };
  }
  const expr = hide.value === null ? "true" : expressionOf(hide.value);
  if (expr === "false") {
    return { edits: [{ ...drop, hit: "hideClose={false} removed (the default)" }], warnings: [] };
  }
  const value = expr === "true" ? "false" : /^[\w.]+$/.test(expr) ? `!${expr}` : `!(${expr})`;
  return {
    edits: [{ at: hide.at, end: hide.end, text: `showClose={${value}}`, hit: "hideClose → showClose" }],
    warnings: [],
  };
}

/** Top-level `{…}` object literals inside an array literal `[…]`, as offsets. */
function objectsInArray(text) {
  const objects = [];
  let depth = 0;
  let quote = null;
  let start = -1;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quote) {
      if (c === quote && text[i - 1] !== "\\") quote = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") quote = c;
    else if (c === "[" || c === "{" || c === "(") {
      if (depth === 1 && c === "{") start = i;
      depth++;
    } else if (c === "]" || c === "}" || c === ")") {
      depth--;
      if (depth === 1 && c === "}" && start >= 0) {
        objects.push({ at: start, end: i + 1 });
        start = -1;
      }
    } else if (depth === 1 && !/[\s,]/.test(c) && start < 0) {
      return null; // a spread or a variable in the array: cannot see its entries
    }
  }
  return objects;
}

/**
 * A4: CodeBlock's root `highlight` moves onto each `codes` entry.
 *
 * In 2.x the root value applied to every entry that set none of its own, which
 * is exactly what is written here. Only an inline array of inline objects can
 * be rewritten; `codes={snippets}` is reported.
 */
function rewriteCodeBlock(src, attrs) {
  const root = attrs.find((a) => a.name === "highlight");
  if (!root || root.value === null) return { edits: [], warnings: [] };
  const codes = attrs.find((a) => a.name === "codes");
  const value = String(root.value).trim();
  const expr = value.startsWith("{") ? expressionOf(value) : value;
  const inner = codes?.value ? expressionOf(codes.value) : "";
  const objects = inner.startsWith("[") ? objectsInArray(inner) : null;
  if (!codes || !objects) {
    return {
      edits: [],
      warnings: [`highlight: move it onto each entry of codes ({ code, language, highlight: ${expr} })`],
    };
  }
  const valueStart = src.indexOf(codes.value, codes.at);
  const innerStart = valueStart + codes.value.indexOf(inner);
  const edits = [];
  for (const o of objects) {
    const body = inner.slice(o.at, o.end);
    if (/[{,\s]highlight\s*:/.test(body)) continue; // the entry's own value already won
    edits.push({ at: innerStart + o.at + 1, end: innerStart + o.at + 1, text: ` highlight: ${expr},`, hit: "highlight moved onto codes" });
  }
  edits.push({ at: withLeadingSpace(src, root.at), end: root.end, text: "", hit: "root highlight removed" });
  return { edits, warnings: [] };
}

const REWRITES = { Dialog: rewriteDialog, CodeBlock: rewriteCodeBlock };

/** Exports 3.0 renamed: old → new. A1. */
const RENAMED_EXPORTS = { Particle: "ParticleFx" };

/** Exports 3.0 removed with no drop-in replacement: name → what to do. A3, A6. */
const REMOVED_EXPORTS = {
  BaseBreakpointProps: "removed; use FlexBreakpointProps, GridBreakpointProps or TextBreakpointProps",
  resetScrollLockState: "removed from the public API (it was test-only)",
  resetAdapterWarning: "removed from the public API (it was test-only)",
  warnIfFrameworkUnadapted: "removed from the public API (LayoutProvider calls it)",
};

/**
 * Rename and report exports in `import { … } from "@once-ui-system/core…"`.
 *
 * A renamed binding imported under its own name is renamed at every JSX use
 * too. If the old name is still referenced some other way (passed as a value,
 * in a type), the import keeps it as a local alias so those references stay
 * valid, which is exact whatever the file does with it.
 */
export function rewriteExports(src) {
  const hits = [];
  const warnings = [];
  const renamedLocals = [];
  const re = /import\s+(type\s+)?\{([^}]*)\}\s*from\s*(["'])(@once-ui-system\/core[^"']*)\3/g;
  let out = src.replace(re, (whole, typeOnly, clause, q, source) => {
    if (!isCoreSource(source)) return whole;
    const specs = specifiersOf(clause);
    let changed = false;
    const text = specs.map((s) => {
      if (REMOVED_EXPORTS[s.name]) warnings.push(`${s.name}: ${REMOVED_EXPORTS[s.name]}`);
      const to = RENAMED_EXPORTS[s.name];
      if (!to) return s.text;
      changed = true;
      hits.push(`${s.name} → ${to}`);
      if (/\s+as\s+/.test(s.text)) return s.text.replace(s.name, to);
      renamedLocals.push([s.name, to]);
      return s.text.replace(s.name, to);
    });
    if (!changed) return whole;
    return `import ${typeOnly ? "type " : ""}{ ${text.join(", ")} } from ${q}${source}${q}`;
  });
  for (const [from, to] of renamedLocals) {
    out = out.replace(new RegExp(`(</?)${from}(?=[\\s/>])`, "g"), `$1${to}`);
    const importLine = new RegExp(`(import\\s+(?:type\\s+)?\\{[^}]*)\\b${to}\\b(?!\\s+as)`);
    const rest = out.replace(/import\s+(?:type\s+)?\{[^}]*\}\s*from\s*["'][^"']+["'];?/g, "");
    if (new RegExp(`\\b${from}\\b`).test(rest)) {
      out = out.replace(importLine, `$1${to} as ${from}`);
      out = out.replace(new RegExp(`(</?)${to}(?=[\\s/>])`, "g"), `$1${from}`);
    }
  }
  return { out, hits, warnings };
}

export function transform(src) {
  const exp = rewriteExports(src);
  const hits = [...exp.hits];
  const warnings = [...exp.warnings];
  let out = exp.out;
  const bindings = importBindings(out);
  const tags = new Set([...Object.keys(TRANSFORMS), ...Object.keys(REWRITES), ...Object.keys(FLAGGED)]);
  for (const tag of tags) {
    const map = TRANSFORMS[tag] ?? {};
    const edits = [];
    for (const name of localNamesFor(tag, bindings)) {
      const open = new RegExp(`<${name}(?=[\\s/>])`, "g");
      let m;
      while ((m = open.exec(out))) {
        const end = openingTagEnd(out, m.index + name.length + 1);
        if (end < 0) continue;
        const attrs = attributesOf(out, m.index + name.length + 1, end);
        for (const a of attrs) {
          const note = FLAGGED[tag]?.[a.name];
          if (note) warnings.push(`<${tag}> ${a.name}: ${note}`);
          const to = map[a.name];
          if (!to) continue;
          if (attrs.some((b) => b.name === to)) {
            // Both were set and the native one won in 2.x: the alias did nothing.
            edits.push({ at: withLeadingSpace(out, a.at), end: a.end, text: "", hit: `<${tag}> ${a.name} removed (${to} already set)` });
          } else {
            edits.push({ at: a.at, end: a.at + a.name.length, text: to, hit: `<${tag}> ${a.name} → ${to}` });
          }
        }
        const rewrite = REWRITES[tag]?.(out, attrs);
        if (rewrite) {
          for (const e of rewrite.edits) edits.push({ ...e, hit: `<${tag}> ${e.hit}` });
          for (const w of rewrite.warnings) warnings.push(`<${tag}> ${w}`);
        }
      }
    }
    // Right to left, so earlier offsets stay valid; an overlapping edit is dropped.
    edits.sort((x, y) => y.at - x.at || y.end - x.end);
    let lastAt = Number.POSITIVE_INFINITY;
    for (const e of edits) {
      if (e.end > lastAt) continue;
      out = out.slice(0, e.at) + e.text + out.slice(e.end);
      hits.push(e.hit);
      lastAt = e.at;
    }
  }
  return { out, hits, warnings };
}

// Keep `literal` reachable for passes that read scale values (later rows).
export { literal };

const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  const [dir, ...flags] = process.argv.slice(2);
  if (!dir) {
    console.error("usage: codemod-3.0.mjs <dir> [--dry]");
    process.exit(1);
  }
  const dry = flags.includes("--dry");
  const files = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name === "node_modules" || e.name === ".next" || e.name === ".git" || e.name === "dist") continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(tsx|jsx|mdx|ts|js|mjs)$/.test(e.name) && !e.name.endsWith(".d.ts")) files.push(p);
    }
  })(dir);

  let total = 0;
  let touched = 0;
  let flagged = 0;
  for (const f of files) {
    const src = fs.readFileSync(f, "utf8");
    const { out, hits, warnings } = transform(src);
    if (!hits.length && !warnings.length) continue;
    console.log(f);
    for (const w of [...new Set(warnings)]) console.log(`   ! ${w}  (fix by hand)`);
    for (const h of [...new Set(hits)]) console.log(`   ${h}  ×${hits.filter((x) => x === h).length}`);
    flagged += warnings.length;
    if (hits.length) {
      touched++;
      total += hits.length;
      if (!dry) fs.writeFileSync(f, out);
    }
  }
  console.log(
    `\n${total} change${total === 1 ? "" : "s"} across ${touched} file${touched === 1 ? "" : "s"}` +
      (flagged ? `, ${flagged} to fix by hand` : "") +
      (dry ? " (dry run)" : ""),
  );
}
