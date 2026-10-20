#!/usr/bin/env node
/**
 * Once UI 2.x → 3.0 codemod.
 *
 * Built on the 2.0 codemod's scanner: renames are component-scoped (a prop is
 * only renamed inside an element that is Once UI's component, found through
 * the file's imports, or by name in MDX where components have no import), and
 * anything a rewrite cannot do exactly is reported for a human instead of
 * guessed. Every pass is idempotent, so running it twice changes nothing,
 * but it reads code as 2.x: a bare number written for 3.0 (px) on a size
 * prop is rewritten as if it were 2.x rem. Run it once, over 2.x code.
 *
 * The break list it follows is MIGRATING.md § "2.x → 3.0"; each pass below
 * names the row it implements.
 *
 * Usage:  node scripts/codemod-3.0.mjs <dir> [--dry]
 *         node scripts/codemod-3.0-imports.mjs <dir> [--dry]   (import sources only)
 *         node scripts/codemod-3.0-leaf.mjs <dir> [--dry]      (G2 leaf props only)
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
import { addToCoreImport, attributeGap, braceList, codeOnly, lineMap, lineOf, located, removeFromCoreImport, splitLine } from "./codemod-3.0-format.mjs";
import { contextFor, evaluate, numberKind, statementEnd, valueSpans } from "./codemod-3.0-values.mjs";
import { boundElsewhere, closing, objectEntries, partsBetween, skipLexeme, topLevel, trimmed } from "./codemod-3.0-scan.mjs";
import { packagesAdded, transformImports } from "./codemod-3.0-imports.mjs";
import { LEAVES, elementsOf, transformLeaf } from "./codemod-3.0-leaf.mjs";
import { consumesProp, forwardsProp, isAliasSource, readSource, resolveOwn } from "./codemod-3.0-own.mjs";
import { transformMerges } from "./codemod-3.0-merges.mjs";
import { transformTypes } from "./codemod-3.0-types.mjs";
import { ONE_X_MESSAGE, detectOneX } from "./codemod-3.0-detect.mjs";
import { transformJsonStrings } from "./codemod-3.0-json.mjs";

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
  // Same `(expandedIds, item)` signature; `onSelect` stays the action.
  FileTree: { onExpandChange: "onExpandedIdsChange" },
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
  },
  NavGroup: {
    onToggle:
      "renamed to onOpenChange, which receives the next open state (a zero-argument toggle still works)",
  },
  // F10: StyleOverlay is in @once-ui-system/blocks, which core cannot import.
  CodeBlock: {
    styleButton:
      "removed: pass actions={<StyleOverlay><IconButton … /></StyleOverlay>}, with StyleOverlay " +
      "from @once-ui-system/blocks",
  },
};

/**
 * A FLAGGED prop whose use is already what 3.0 means, so its note is noise:
 * a zero-argument `onToggle` (inline, or a same-file function taking no
 * parameters) works unchanged as `onOpenChange`; DatePicker `open` beside
 * `autoFocus` is the one use its note says to keep.
 */
function flagNeedless(src, tag, a, attrs) {
  if (a.name === "onToggle" && (tag === "Accordion" || tag === "NavGroup") && a.value) {
    const expr = expressionOf(a.value);
    if (/^(?:async\s*)?\(\s*\)\s*=>/.test(expr) || /^function\s*[\w$]*\s*\(\s*\)/.test(expr)) return true;
    if (/^[A-Za-z_$][\w$]*$/.test(expr)) {
      const esc = expr.replace(/\$/g, "\\$");
      const decls = [...src.matchAll(new RegExp(`(?<![\\w$.])(?:const|let|var|function)\\s+${esc}(?![\\w$])`, "g"))];
      const zeroArg = new RegExp(
        `(?<![\\w$.])(?:const\\s+${esc}\\s*=\\s*(?:useCallback\\(\\s*)?(?:async\\s*)?\\(\\s*\\)\\s*=>|function\\s+${esc}\\s*\\(\\s*\\))`,
      );
      return decls.length === 1 && zeroArg.test(src);
    }
    return false;
  }
  if (tag === "DatePicker" && a.name === "open") return attrs.some((b) => b.name === "autoFocus");
  return false;
}

/**
 * The string literals a name is declared to hold in this file
 * (`variant?: "primary" | "secondary"`, `type V = "a" | "b"` through
 * `variant: V`), or null when a declaration is not such a union.
 */
export function declaredLiterals(src, expr) {
  const name = /(?:^|\.)\s*([A-Za-z_$][\w$]*)$/.exec(expr.trim())?.[1];
  if (!name || !/^[A-Za-z_$][\w$.?\s]*$/.test(expr.trim())) return null;
  const union = (text, depth = 0) => {
    const parts = text.split("|").map((p) => p.trim()).filter(Boolean);
    const out = [];
    for (const p of parts) {
      const lit = /^(["'])([^"'\\]*)\1$/.exec(p);
      if (lit) out.push(lit[2]);
      else if (/^[A-Z][\w$]*$/.test(p) && depth < 3) {
        const alias = new RegExp(`\\btype\\s+${p}\\s*=\\s*([^;\\n]+(?:\\n\\s*\\|[^;\\n]+)*)`).exec(src);
        const inner = alias && union(alias[1].trim().replace(/^\|/, ""), depth + 1);
        if (!inner) return null;
        out.push(...inner);
      } else return null;
    }
    return out;
  };
  const found = [];
  const re = new RegExp(`(?<![\\w$.])${name.replace(/\$/g, "\\$")}\\??\\s*:\\s*([^;,\\n}=)]+)`, "g");
  for (const m of codeOnly(src).matchAll(re)) {
    // A type position (`variant?: T` in a type or a parameter), not an object value (`{ variant: x }`).
    const text = src.slice(m.index + m[0].length - m[1].length, m.index + m[0].length).trim();
    if (!/^(["']|[A-Z])/.test(text)) continue;
    const lits = union(text);
    if (!lits) return null;
    found.push(...lits);
  }
  return found.length ? found : null;
}

/** Pickers whose range handler receives a DateRange in 3.0. */
const DATE_FIELDS = new Set(["DatePicker", "DateRangePicker", "DateInput", "DateRangeInput"]);

/**
 * The inline type a range handler's parameter is annotated with, when it is
 * `{ startDate: Date; endDate: Date }` with both required (which a DateRange,
 * both optional, is not assignable to): on an inline arrow, or on a function
 * of this file the attribute names. Null otherwise.
 */
function rangeAnnotation(src, a) {
  if (!a.value) return null;
  const expr = expressionOf(a.value);
  const REQUIRED = /^\{\s*(?:startDate\s*:\s*Date\s*[;,]\s*endDate\s*:\s*Date|endDate\s*:\s*Date\s*[;,]\s*startDate\s*:\s*Date)\s*[;,]?\s*\}$/;
  const param = (text) => {
    const m = /^(?:async\s*)?\(\s*(?:[A-Za-z_$][\w$]*|\{[^}]*\})\s*:\s*(\{[^}]*\})\s*\)/.exec(text.trim());
    return m && REQUIRED.test(m[1].trim()) ? m[1].replace(/\s+/g, " ").trim() : null;
  };
  const inline = param(expr);
  if (inline) return inline;
  if (!/^[A-Za-z_$][\w$]*$/.test(expr)) return null;
  const decl = new RegExp(`(?<![\\w$.])(?:const\\s+${expr}\\s*=\\s*(?:useCallback\\(\\s*)?|function\\s+${expr}\\s*)`).exec(src);
  return decl ? param(src.slice(decl.index + decl[0].length, decl.index + decl[0].length + 300)) : null;
}

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
    // An entry written one key per line gets the key on a line of its own.
    const multi = /^\{[ \t]*\r?\n([ \t]*)/.exec(body);
    const text = multi ? `\n${multi[1]}highlight: ${expr},` : ` highlight: ${expr},`;
    edits.push({ at: innerStart + o.at + 1, end: innerStart + o.at + 1, text, hit: "highlight moved onto codes" });
  }
  edits.push({ at: withLeadingSpace(src, root.at), end: root.end, text: "", hit: "root highlight removed" });
  return { edits, warnings: [] };
}

/**
 * C4: Accordion `open` with no handler beside it was the starting state in
 * 2.x (the accordion still toggled); 3.0's `open` controls it, so that is
 * `defaultOpen`. With `onToggle`/`onOpenChange` it is controlled already and
 * stays; a spread may carry the handler, so it is reported.
 */
function rewriteAccordion(src, attrs, tagText) {
  const open = attrs.find((a) => a.name === "open");
  if (!open) return { edits: [], warnings: [] };
  if (attrs.some((a) => a.name === "onToggle" || a.name === "onOpenChange")) return { edits: [], warnings: [] };
  if (attrs.some((a) => a.name === "defaultOpen"))
    return { edits: [], warnings: ["open beside defaultOpen: open now controls the accordion; keep one"] };
  if (/\{\s*\.\.\./.test(tagText))
    return {
      edits: [],
      warnings: [
        "open: now controls the accordion whenever it is set; if the spread carries no onOpenChange, use defaultOpen",
      ],
    };
  // `open={expanded}`: 2.x also followed the value when it changed later;
  // `defaultOpen` reads it once.
  const value = open.value === null ? "true" : String(open.value).trim();
  const followed = !/^\{\s*(true|false)\s*\}$|^true$/.test(value) && !/^["']/.test(value);
  return {
    edits: [{ at: open.at, end: open.at + "open".length, text: "defaultOpen", hit: "open → defaultOpen (no handler: it was the starting state)" }],
    warnings: followed
      ? [
          `open=${value} → defaultOpen: 2.x also opened or closed the accordion when ${expressionOf(value)} changed later, defaultOpen reads it once; ` +
            `if it changes, control it: open=${value} onOpenChange={(next) => …}`,
        ]
      : [],
  };
}

/**
 * Feedback `icon` written bare (MDX's `<Feedback icon>`, icon={true}) named
 * no icon: 2.x drew an empty gap where it would be. 3.0 draws the tone's
 * icon unless `icon` names another.
 */
function rewriteFeedback(src, attrs) {
  const icon = attrs.find((a) => a.name === "icon");
  if (!icon || !(icon.value === null || /^\{\s*true\s*\}$/.test(String(icon.value)))) return { edits: [], warnings: [] };
  return {
    edits: [],
    warnings: [
      "icon: a bare icon named no icon (2.x left an empty gap); remove it to show the tone's icon, or write showIcon={false} for none",
    ],
  };
}

const REWRITES = { Dialog: rewriteDialog, CodeBlock: rewriteCodeBlock, Accordion: rewriteAccordion, Feedback: rewriteFeedback };

/**
 * Exports 3.0 renamed: old → new. A1, G6. A lower-case name is a function:
 * every reference to it in the file is renamed (a file that imports
 * `generateMetadata` cannot also declare its own, so none of them is Next's).
 */
const RENAMED_EXPORTS = { Particle: "ParticleFx", generateMetadata: "createMetadata" };

/** Exports 3.0 removed with no drop-in replacement: name → what to do. A3, A6. */
const REMOVED_EXPORTS = {
  BaseBreakpointProps: "removed; use FlexBreakpointProps or GridBreakpointProps (leaves take LeafProps)",
  resetScrollLockState: "removed from the public API (it was test-only)",
  resetAdapterWarning: "removed from the public API (it was test-only)",
  warnIfFrameworkUnadapted: "removed from the public API (LayoutProvider calls it)",
  // F7: components and helpers that became internal.
  ServerFlex: "internal in 3.0; use Flex, which picks its server or client half itself",
  ClientFlex: "internal in 3.0; use Flex, which picks its server or client half itself",
  ServerGrid: "internal in 3.0; use Grid, which picks its server or client half itself",
  ClientGrid: "internal in 3.0; use Grid, which picks its server or client half itself",
  Cursor: "internal in 3.0; pass the element to Flex's or Grid's `cursor` prop",
  ElementType:
    "internal in 3.0. It rendered a router Link for an internal href, <a target=\"_blank\" rel=\"noreferrer\"> for an http(s) one, " +
    "a <button> for onClick or type, and a Flex otherwise, all unstyled. To keep that, define it locally: " +
    "const Interactive = ({ href, ...rest }) => href ? <Link href={href} {...rest} /> : <button type=\"button\" {...rest} />; " +
    "(Link from next/link or your router), and use <Interactive> with the same props. For a styled control use SmartLink, Button or IconButton",
  InteractiveDetails:
    "internal in 3.0; use the `label` and `description` props of Checkbox, RadioButton or Switch",
  InteractiveDetailsProps: "internal in 3.0; use React.ComponentProps<typeof Checkbox>",
  Toaster: "internal in 3.0; ToastProvider renders it, show toasts with useToast()",
  ArrowNavigation:
    "internal in 3.0; use the useArrowNavigation hook on your own container (pass containerRef, call handleKeyDown from onKeyDown)",
  ArrowNavigationProps: "internal in 3.0; use ArrowNavigationOptions with the useArrowNavigation hook",
  useArrowNavigationContext: "internal in 3.0; useArrowNavigation returns focusedIndex and setFocusedIndex",
  withArrowNavigation: "internal in 3.0; use the useArrowNavigation hook",
  DialogProvider: "removed in 3.0; Dialog stacks without it (the codemod unwraps <DialogProvider>)",
  dev:
    "internal in 3.0; keep a logger of your own: export const dev = Object.fromEntries([\"log\", \"warn\", \"error\", \"info\", \"debug\"].map((k) => " +
    "[k, (...args) => { if (process.env.NODE_ENV === \"development\") console[k](...args); }])) (2.x's, which logged in development only), and import it from there",
  getLastOpenedDropdown: "internal in 3.0; dropdowns close each other on their own",
  setLastOpenedDropdown: "internal in 3.0; dropdowns close each other on their own",
  clearLastOpenedDropdown: "internal in 3.0; dropdowns close each other on their own",
  MissingDependency: "internal in 3.0 (the fallback a component renders when its optional peer is missing)",
  escapeHtml: "internal in 3.0; escape with a library of your own",
  safeScriptJson: "internal in 3.0; Schema and ThemeInit use it, serialise script JSON yourself",
  sanitizeHref: "internal in 3.0; SmartLink and Button use it, validate hrefs yourself",
};

/**
 * F7: `<ElementType>` (internal in 3.0) where what it rendered can be read
 * from the element: no href and an `onClick` or a literal `type` was a plain
 * `<button>` (written `type="button"` when it had none, which 2.x left to
 * the browser's submit), an http(s) literal href was
 * `<a target="_blank" rel="noreferrer">`, and neither was a Flex. An
 * internal or computed href went to the app's router Link, which the codemod
 * cannot name, and a spread may carry either: those are reported with a
 * local replacement to paste. The import goes once no use is left.
 */
export function transformElementType(src) {
  const hits = [];
  const warnings = [];
  const bindings = importBindings(src);
  const locals = [...bindings].filter(([, b]) => b.canonical === "ElementType" && isCoreSource(b.source)).map(([l]) => l);
  if (!locals.length) return { out: src, hits, warnings };
  const edits = [];
  let flex = false;
  const elements = elementsOf(src);
  for (const local of locals) {
    for (const el of elements.filter((e) => e.name === local)) {
      const attrs = attributesOf(src, el.nameEnd, el.openEnd - 1);
      const opening = src.slice(el.at, el.openEnd);
      const has = (n) => attrs.find((a) => a.name === n);
      const href = has("href");
      const type = has("type");
      const typeValue = type ? literal(type.value) : null;
      const hrefValue = href ? literal(href.value) : null;
      const report = (why) =>
        warnings.push(located(`<${local}>: ${why}, so it is left for you; replace it with the local Interactive of this file's ElementType note`, src, el.at));
      if (/\{\s*\.\.\./.test(opening)) {
        report("a spread may carry an href, an onClick or a type");
        continue;
      }
      if (el.end < 0) {
        report("its closing tag was not found");
        continue;
      }
      let tag;
      const extra = [];
      const drop = [];
      if (!href) {
        if (has("onClick") || typeValue === "button" || typeValue === "submit" || typeValue === "reset") {
          tag = "button";
          if (!type) extra.push('type="button"');
        } else if (type) {
          report("its type cannot be read");
          continue;
        } else {
          tag = "Flex";
          flex = true;
        }
        if (has("onLinkClick")) drop.push(has("onLinkClick"));
      } else if (hrefValue && /^https?:\/\//.test(hrefValue)) {
        tag = "a";
        if (!has("target")) extra.push('target="_blank"');
        if (!has("rel")) extra.push('rel="noreferrer"');
        if (type) drop.push(type);
        const linkClick = has("onLinkClick");
        if (linkClick && has("onClick")) {
          report("it has both onClick and onLinkClick");
          continue;
        }
        if (linkClick) edits.push({ at: linkClick.at, end: linkClick.at + "onLinkClick".length, text: "onClick" });
      } else {
        report(hrefValue ? "an internal href rendered your router's Link" : "its href is computed (a router Link, an <a> or nothing)");
        continue;
      }
      for (const a of drop) edits.push({ at: withLeadingSpace(src, a.at), end: a.end, text: "" });
      const gap = attributeGap(src, el.nameEnd);
      edits.push({ at: el.at + 1, end: el.nameEnd, text: extra.length ? `${tag}${gap}${extra.join(gap)}` : tag });
      if (src[el.end - 2] !== "/") {
        const close = src.lastIndexOf(`</${local}`, el.end);
        if (close > el.at) edits.push({ at: close + 2, end: close + 2 + local.length, text: tag });
      }
      hits.push(`<${local}> → <${tag}${extra.length ? ` ${extra.join(" ")}` : ""}> (what 2.x's ElementType rendered here)`);
    }
  }
  let out = src;
  for (const e of edits.sort((a, b) => b.at - a.at)) out = out.slice(0, e.at) + e.text + out.slice(e.end);
  if (out === src) return { out, hits, warnings };
  for (const local of locals) {
    const rest = codeOnly(out, { jsxText: true }).replace(/import\s+(?:type\s+)?\{[^}]*\}\s*from\s*["'][^"']+["'];?/g, "");
    if (!new RegExp(`(?<![\\w$.])${local}(?![\\w$])`).test(rest)) out = removeFromCoreImport(out, local);
  }
  if (flex && !importBindings(out).has("Flex")) out = addToCoreImport(out, ["Flex"]) ?? out;
  return { out, hits, warnings };
}

/**
 * F7: `dev` (2.x's development-only logger) is internal in 3.0. When the app
 * has a module of its own exporting `dev` (found by the CLI: one file with
 * `export const dev`), the import is pointed there; otherwise it is reported
 * with the logger to paste.
 */
export function rewriteDevImport(src, file, devLogger) {
  const none = { out: src, hits: [], warnings: [] };
  if (!file || !devLogger || path.resolve(file) === path.resolve(devLogger)) return none;
  const bound = importBindings(src).get("dev");
  if (!bound || bound.canonical !== "dev" || !isCoreSource(bound.source)) return none;
  let rel = path.relative(path.dirname(file), devLogger).replace(/\\/g, "/").replace(/\.(tsx?|jsx?|mjs)$/, "").replace(/\/index$/, "");
  if (!rel.startsWith(".")) rel = `./${rel}`;
  const removed = removeFromCoreImport(src, "dev");
  if (removed === src) return none;
  const q = /from\s*(["'])@once-ui-system\/core/.exec(src)?.[1] ?? '"';
  const semi = /from\s*["']@once-ui-system\/core[^"']*["'];/.test(src) ? ";" : "";
  // Where the core import was (or the first import left).
  const at = src.search(/^import\s[^;]*?from\s*["']@once-ui-system\/core/m);
  const line = `import { dev } from ${q}${rel}${q}${semi}\n`;
  const out = removed.slice(0, at) + line + removed.slice(at);
  return { out, hits: [`dev → the app's own logger (${rel})`], warnings: [] };
}

/** Exports 3.0 removed whose element is a pure wrapper: its tags become a fragment. F7. */
const UNWRAPPED_EXPORTS = new Set(["DialogProvider"]);


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
  const unwrap = [];
  const re =
    /(import|export)\s+(type\s+)?\{([^}]*)\}\s*from\s*(["'])(@once-ui-system\/core[^"']*)\4(;?[ \t]*\n?)/g;
  let out = src.replace(re, (whole, keyword, typeOnly, clause, q, source, end) => {
    if (!isCoreSource(source)) return whole;
    const specs = specifiersOf(clause);
    let changed = false;
    const text = specs.flatMap((s) => {
      const aliased = /\s+as\s+/.test(s.text);
      if (keyword === "import" && UNWRAPPED_EXPORTS.has(s.name) && !aliased) {
        changed = true;
        unwrap.push(s.name);
        return [];
      }
      if (REMOVED_EXPORTS[s.name]) warnings.push(`${s.name}: ${REMOVED_EXPORTS[s.name]}`);
      const to = RENAMED_EXPORTS[s.name];
      if (!to) return [s.text];
      changed = true;
      hits.push(`${s.name} → ${to}`);
      // A re-export keeps the name it exported, so its importers still resolve.
      if (keyword === "export") {
        if (s.name === "generateMetadata" && !aliased)
          warnings.push(
            "generateMetadata: re-exported under Next's route-segment name; rename the export unless this file is meant to be a route's generateMetadata",
          );
        return [aliased ? s.text.replace(s.name, to) : `${to} as ${s.name}`];
      }
      if (aliased) return [s.text.replace(s.name, to)];
      renamedLocals.push([s.name, to]);
      return [s.text.replace(s.name, to)];
    });
    if (!changed) return whole;
    if (!text.length) return "";
    return `${keyword} ${typeOnly ? "type " : ""}${braceList(text, clause)} from ${q}${source}${q}${end}`;
  });
  for (const name of unwrap) {
    const before = out;
    // A fragment, not nothing: the wrapper may hold several children.
    out = out.replace(new RegExp(`<${name}\\s*>`, "g"), "<>").replace(new RegExp(`</${name}\\s*>`, "g"), "</>");
    if (out !== before) hits.push(`<${name}> unwrapped`);
    if (new RegExp(`\\b${name}\\b`).test(codeOnly(out, { jsxText: true })))
      warnings.push(`${name}: ${REMOVED_EXPORTS[name]}; a use left in place needs removing by hand`);
  }
  for (const [from, to] of renamedLocals) {
    if (/^[a-z]/.test(from)) {
      out = out.replace(new RegExp(`(?<![.\\w$])${from}(?![\\w$])`, "g"), to);
      continue;
    }
    out = out.replace(new RegExp(`(</?)${from}(?=[\\s/>])`, "g"), `$1${to}`);
    const importLine = new RegExp(`(import\\s+(?:type\\s+)?\\{[^}]*)\\b${to}\\b(?!\\s+as)`);
    const rest = codeOnly(out, { jsxText: true }).replace(/import\s+(?:type\s+)?\{[^}]*\}\s*from\s*["'][^"']+["'];?/g, "");
    if (new RegExp(`\\b${from}\\b`).test(rest)) {
      out = out.replace(importLine, `$1${to} as ${from}`);
      out = out.replace(new RegExp(`(</?)${to}(?=[\\s/>])`, "g"), `$1${from}`);
    }
  }
  return { out, hits, warnings };
}

// ─────────────────────────────────────────────────────────────────────────────
// D2–D5: units, durations and speed
//
// 3.0 gives a number one meaning per kind: a length is px, a time is ms and
// `speed` is a multiplier. 2.x read a bare number as rem on sizes, spacing and
// offsets, so `maxWidth={40}` becomes `maxWidth="40rem"`: the same rem it
// always was, still following the root font size, so the page renders exactly
// as before. Props that were already px are left alone. Only literals are
// rewritten (in a JSX attribute, a ternary of literals, or an inline object
// such as a breakpoint object); a variable, an expression or a spread is
// reported, because whether it holds a number cannot be seen from here.
// ─────────────────────────────────────────────────────────────────────────────

/** Flex's size, spacing, offset and blur props: a bare number was rem in 2.x on all of them. */
const REM_PROPS = new Set([
  "width",
  "height",
  "minWidth",
  "maxWidth",
  "minHeight",
  "maxHeight",
  "minColumnWidth",
  "padding",
  "paddingX",
  "paddingY",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "margin",
  "marginX",
  "marginY",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "gap",
  "top",
  "right",
  "bottom",
  "left",
  "translateX",
  "translateY",
  "blur",
  "backdropBlur",
]);

/** Breakpoint objects: `s={{ maxWidth: 20 }}` read its numbers as rem too. */
const BREAKPOINT_PROPS = new Set(["xl", "l", "m", "s", "xs"]);

/**
 * The Once UI components that pass REM_PROPS on to Flex or Grid: every
 * component whose 2.x props include SizeProps or SpacingProps (ai/spec.json
 * as of 2.x), plus the MDX elements, which take numeric margins.
 */
const LAYOUT_COMPONENTS = new Set(
  (
    "Accordion AccordionGroup Animation Arrow AutoScroll Avatar AvatarGroup Background Badge " +
    "Banner BlobFx BlockQuote Book Breadcrumbs Card Carousel CelebrationFx Chip Column " +
    "CompareImage CountFx CursorCard DataTable DatePicker DateRangePicker Dialog Drawer Dropdown " +
    "Effect EmojiPicker Fade FadingLettersFx Feedback Flex FlipFx GlitchFx Grid Heading HoloFx " +
    "Hover HoverCard Icon InfiniteScroll InfoTip InlineCode Kbd KeyTip Line List ListItem " +
    "LogoCloud Mask MasonryGrid MatrixFx Media NavGroup NavIcon OgCard Option Pagination " +
    "ParticleFx ProgressBar Pulse RadioGroup RangeSlider RevealFx Row ScrollContainer Scroller " +
    "ScrollToTop Scrubber SegmentedControl Setting SettingAxes SettingGroup ShineFx Skeleton " +
    "Spinner SplitView StatusIndicator StyleOverlay StylePanel Swiper Table TabList TabPanel Tabs " +
    "Tag Text ThemeSwitcher TiltFx Timeline Tooltip WeatherFx HeadingNav MegaMenu MobileMegaMenu " +
    "HeadingLink BarChart ChartHeader LinearGauge LineBarChart LineChart PieChart RadialGauge " +
    "CodeBlock MediaUpload MediaAudioPlayer ServerFlex ClientFlex ServerGrid ClientGrid " +
    "MdxBlockQuote MdxCodeBlock MdxHeading MdxHr MdxImage MdxInlineCode MdxList MdxListItem " +
    "MdxParagraph MdxTable"
  ).split(" "),
);

/**
 * Units that differ from component to component, over REM_PROPS or beside
 * them. A kind is:
 *   rem  a number was rem:        {40} → "40rem"
 *   px   a number was px already: left alone
 *   vh   a number was vh:         {50} → "50vh"   (Mask radius)
 *   %    a number was a percent:  {50} → "50%"    (Mask x/y, Background gradient)
 *   s    a number was seconds:    {4}  → {4000}   (now milliseconds)
 *   px!  a number was px, on a component that merges into one whose 2.x
 *        numbers were rem: {200} → "200px", so a second run cannot read
 *        the merged element's number as rem (DropdownWrapper → Dropdown)
 * A dotted key is a path into an inline object: `gradient={{ x: 50 }}`.
 *
 * Background's `gradient.width`/`height` were a quarter-percent of the
 * gradient layer, which is four times the element: `width: 100` was the
 * element's full width, which 3.0 writes `"100%"`.
 */
const UNIT_TABLE = {
  Avatar: { size: "rem" },
  Media: { height: "rem" },
  Animation: { blur: "px", slideUp: "rem", slideDown: "rem", slideLeft: "rem", slideRight: "rem" },
  Dialog: { minHeight: "px" },
  DataThemeProvider: { height: "rem" },
  LinearGauge: { width: "px", height: "px" },
  RadialGauge: { width: "px", height: "px" },
  DropdownWrapper: { minWidth: "rem", maxWidth: "rem", minHeight: "px!" },
  ContextMenu: { minWidth: "rem", maxWidth: "rem", minHeight: "px!" },
  Setting: { controlWidth: "rem" },
  SettingAxes: { axisWidth: "rem" },
  CodeBlock: { codeHeight: "rem" },
  Carousel: { "thumbnail.height": "rem" },
  Mask: { x: "%", y: "%", radius: "vh" },
  Background: {
    "gradient.x": "%",
    "gradient.y": "%",
    "gradient.width": "%",
    "gradient.height": "%",
    "mask.x": "%",
    "mask.y": "%",
    "mask.radius": "vh",
  },
  CelebrationFx: { duration: "s" },
  WeatherFx: { duration: "s" },
  FlipFx: { autoFlipInterval: "s" },
  MatrixFx: { "bulge.duration": "s" },
  Effect: {
    "matrix.bulge.duration": "s",
    "weather.duration": "s",
    "celebration.duration": "s",
  },
};

/**
 * D5: where `speed` was a length of time, it is renamed. RevealFx's keywords
 * become the milliseconds they stood for.
 */
const SPEED_RENAMES = {
  RevealFx: { to: "duration", keywords: { fast: 1000, medium: 2000, slow: 3000 } },
  ShineFx: { to: "duration" },
  CountFx: { to: "duration" },
  TypeFx: { to: "charDuration" },
};

const PARTICLE_SPEED =
  "speed is a multiplier on the designed drift now, 1 being 2.x's default 0.3: divide a 2.x value by 0.3 (0.6 → 2), or remove it if it was 0.3";

/** A 2.x ParticleFx speed as 3.0's multiplier: divided by 2.x's default, to two decimals. */
const particleSpeed = (n) => Math.round((n / 0.3) * 100) / 100;

/**
 * D5: ParticleFx `speed={n}` → `{n / 0.3}`, rounded to two decimals, and
 * dropped when that is 1 (2.x's default 0.3 is 3.0's 1). Only where the
 * element is imported from core: that import is what tells 2.x code from 3.0
 * code (the import pass moves it to @once-ui-system/fx), so a second run
 * leaves the number alone. By name (MDX) or on an expression it is reported.
 */
function rewriteParticleSpeed(src, speed, imported, edits, warn) {
  const raw = speed.value === null ? "" : String(speed.value);
  const expr = raw.startsWith("{") ? raw.slice(1, -1).trim() : raw;
  const found = raw.startsWith("{") ? literalNumbers(expr) : { opaque: true };
  if (found.opaque || !found.spans.length) {
    const divided = `${/^[\w.]+$/.test(expr) ? expr : `(${expr})`} / 0.3`;
    // Always a number where it comes from: dividing it is exact.
    const valueAt = raw.startsWith("{") ? src.indexOf(raw, speed.at) + 1 + raw.slice(1).indexOf(expr) : -1;
    if (imported && valueAt > 0 && unitCtx && numberKind(unitCtx, valueAt, valueAt + expr.length).kind === "num") {
      edits.push({ at: valueAt, end: valueAt + expr.length, text: divided, hit: "<ParticleFx> speed={…}: ÷ 0.3 (a multiplier of 3.0's default)" });
      return;
    }
    warn(`${PARTICLE_SPEED}; write speed={${divided}}`);
    return;
  }
  if (!imported) {
    warn(`${PARTICLE_SPEED}: ${found.spans.map((x) => `${x.text} → ${particleSpeed(Number(x.text))}`).join(", ")}`);
    return;
  }
  const valueAt = src.indexOf(raw, speed.at) + 1;
  if (found.spans.length === 1 && trimmed(expr, 0, expr.length).end - trimmed(expr, 0, expr.length).at === found.spans[0].text.length) {
    const next = particleSpeed(Number(found.spans[0].text));
    if (next === 1) {
      edits.push({ at: withLeadingSpace(src, speed.at), end: speed.end, text: "", hit: "<ParticleFx> speed: 2.x default removed (1 in 3.0)" });
      return;
    }
  }
  for (const x of found.spans)
    edits.push({
      at: valueAt + x.at,
      end: valueAt + x.end,
      text: String(particleSpeed(Number(x.text))),
      hit: "<ParticleFx> speed: ÷ 0.3 (a multiplier of 3.0's default)",
    });
}

/** A one-second ceiling: a duration literal under 50 was written as seconds, one over 1000 as ms. */
const SECONDS_BELOW = 50;
const MS_FROM = 1000;

const NUMBER = /^-?(\d+\.?\d*|\.\d+)$/;
/** `"50"`: a number written as a string, which 2.x read as the number on the props whose string now means a CSS length. */
const NUMERIC_STRING = /^(["'])(\d+(?:\.\d+)?)\1$/;
const STRING = /^(["'])(?:\\.|(?!\1).)*\1$|^`[^`]*`$/;
const CONSTANT = /^(undefined|null|true|false)$/;
// `cond ? { direction: "column" } : {}`: every branch an object literal of
// string values, so no number in it can change unit.
function stringObjectsOnly(body) {
  const q = /^([^?]*)\?\s*(\{[^{}]*\})\s*:\s*(\{[^{}]*\})$/.exec(body.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, '""'));
  if (!q) return false;
  return [q[2], q[3]].every((o) => /^\{(\s*[A-Za-z_$][\w$]*\s*:\s*""\s*,?)*\s*\}$/.test(o));
}

/**
 * A numeric literal in a unit kind, as the text that replaces it: a string
 * literal for a length (`"40rem"`), a number for milliseconds. `null` leaves
 * it alone; `{ warn }` cannot be decided.
 */
function convertNumber(kind, text) {
  const n = Number(text);
  if (kind === "px" || n === 0) return null;
  if (kind === "px!") return { text: `"${n}px"`, quoted: true };
  if (kind === "rem" || kind === "vh" || kind === "%") return { text: `"${n}${kind}"`, quoted: true };
  if (kind === "s") {
    if (Math.abs(n) < SECONDS_BELOW) return { text: String(Math.round(n * 1e6) / 1e3) };
    if (Math.abs(n) < MS_FROM) return { warn: `${n} is read as milliseconds; if it is seconds, multiply it by 1000` };
    return null;
  }
  return null;
}




/**
 * Where an expression's value can come from, as spans: both branches of a
 * ternary, both sides of `||`/`??`, the right of `&&`, recursively. Null when
 * a leaf is not a literal (a variable, arithmetic, a call): it cannot be read.
 */
function leaves(expr, at = 0, end = expr.length) {
  ({ at, end } = trimmed(expr, at, end));
  const text = expr.slice(at, end);
  if (NUMBER.test(text)) return [{ at, end, text, number: true }];
  if (STRING.test(text) || CONSTANT.test(text)) return [];
  // The lowest-precedence operator at depth 0: `?:`, then `??`/`||`, then `&&`.
  const ops = { ternary: -1, or: -1, and: -1 };
  let depth = 0;
  for (let i = at; i < end; i++) {
    const past = skipLexeme(expr, i);
    if (past !== i) {
      i = past - 1;
      continue;
    }
    const c = expr[i];
    const two = expr.slice(i, i + 2);
    if ("([{".includes(c)) depth++;
    else if (")]}".includes(c)) depth--;
    else if (depth !== 0) continue;
    else if (two === "??" || two === "||") {
      if (ops.or < 0) ops.or = i;
      i++;
    } else if (two === "&&") {
      if (ops.and < 0) ops.and = i;
      i++;
    } else if (c === "?" && expr[i + 1] !== "." && ops.ternary < 0) ops.ternary = i;
  }
  const join = (...parts) => (parts.some((p) => p === null) ? null : parts.flat());
  if (ops.ternary >= 0) {
    // The `:` that pairs with the first `?`, past any nested ternaries.
    let nested = 0;
    depth = 0;
    for (let i = ops.ternary + 1; i < end; i++) {
      const past = skipLexeme(expr, i);
      if (past !== i) {
        i = past - 1;
        continue;
      }
      const c = expr[i];
      if ("([{".includes(c)) depth++;
      else if (")]}".includes(c)) depth--;
      else if (depth !== 0) continue;
      else if (c === "?" && expr[i + 1] !== "?" && expr[i + 1] !== "." && expr[i - 1] !== "?") nested++;
      else if (c === ":" && nested-- === 0) return join(leaves(expr, ops.ternary + 1, i), leaves(expr, i + 1, end));
    }
    return null;
  }
  if (ops.or >= 0) return join(leaves(expr, at, ops.or), leaves(expr, ops.or + 2, end));
  if (ops.and >= 0) return leaves(expr, ops.and + 2, end);
  return null;
}

/**
 * The literal numbers in an expression that a rewrite can see exactly (see
 * `leaves`). `opaque` means it holds something else.
 */
function literalNumbers(expr) {
  const found = leaves(expr);
  return found ? { spans: found.filter((l) => l.number) } : { opaque: true };
}


/** The element names in this file that mean Once UI's `tag` (see localNamesFor). */
function namesFor(tag, bindings, isCore) {
  const aliases = [];
  for (const [local, { source, canonical }] of bindings) if (canonical === tag && isCore(source)) aliases.push(local);
  if (aliases.length) return aliases;
  return bindings.has(tag) || bindings.declared?.has(tag) ? [] : [tag];
}

/**
 * Rewrite the literal numbers of one value (`{…}` contents, or an object
 * entry's value) in a unit kind. `push` receives edits relative to `base`.
 */
function rewriteValue(kind, expr, base, label, push, warn) {
  const found = literalNumbers(expr);
  if (found.opaque) {
    if (kind === "px" || kind === "px!") return;
    const lead = expr.length - expr.trimStart().length;
    const name = expr.trim();
    // What the value is where it comes from (./codemod-3.0-values.mjs): a
    // config, a const, a mapped data entry, a typed prop, arithmetic.
    const length = kind === "rem" || kind === "%" || kind === "vh";
    const res = length && unitCtx ? numberKind(unitCtx, base + lead, base + lead + name.length) : null;
    if (res?.kind === "num") {
      // Always a number: the use becomes the string 2.x read it as.
      const at = base + lead;
      push({ at, end: at + name.length, text: `\`\${${name}}${kind}\``, kind, label, hit: `${label}={${name}}: a number → \`\${…}${kind}\`` });
      return;
    }
    // Never a number: a token, a CSS length, or nothing.
    if (res?.kind === "str") return;
    if (res?.kind === "mixed") {
      const fixable = sourceCandidate(res, name, kind);
      if (fixable) {
        fixable.uses.push({ kind, warn, label, name });
        return;
      }
      warn(mixedReport(label, name, kind, res));
      return;
    }
    const why = res?.why ? ` (${res.why})` : "";
    const known = constValue(name);
    // A same-file const that holds a string is a token or a CSS length: unchanged.
    if (known && known.string) return;
    // A `const W = 14` nothing shadows (or a member of an `as const`
    // object) is that number wherever it is read: the use becomes the string
    // 2.x read it as, `${W}rem`.
    if (known && known.fixed && known.number !== 0 && (kind === "rem" || kind === "%" || kind === "vh")) {
      const lead = expr.length - expr.trimStart().length;
      const name = expr.trim();
      push({ at: base + lead, end: base + lead + name.length, text: `\`\${${name}}${kind}\``, kind, label, hit: `${label}={${name}}: ${name} is ${known.number} → \`\${${name}}${kind}\`` });
      return;
    }
    if (known && kind !== "s") {
      warn(
        `${label}={${expr.trim()}}: ${expr.trim()} is ${known.number}, a const in this file, so this was ${known.number}${kind} in 2.x and is ${known.number}px now; ` +
          `write {\`\${${expr.trim()}}${kind}\`}, or make the const "${known.number}${kind}"${why}`,
      );
      return;
    }
    const unit = kind === "s" ? "seconds (now milliseconds)" : `${kind} (now px)`;
    const fix =
      kind === "s" ? "multiply it by 1000" : `write {\`\${${expr.trim()}}${kind}\`} or convert it to px`;
    warn(`${label}={${expr.trim()}}: a number here was ${unit}; if this value is a number, ${fix}${why}`);
    return;
  }
  for (const s of found.spans) {
    const r = convertNumber(kind, s.text);
    if (!r) continue;
    if (r.warn) warn(`${label}: ${r.warn}`);
    else push({ at: base + s.at, end: base + s.end, text: r.text, quoted: r.quoted, kind, label });
  }
}

/** Where a value's numbers are defined, as `file:line` (the file name only when it is another file). */
function whereDefined(atoms) {
  const seen = [];
  for (const a of atoms) {
    if (a.t !== "num" || !a.ctx) continue;
    const here = unitCtx && a.ctx.file === unitCtx.file && a.ctx.original === unitCtx.src;
    const place = `${here ? "line " : `${path.basename(a.ctx.file ?? "")}:`}${lineOf(a.ctx.src, a.at)}`;
    if (!seen.includes(place)) seen.push(place);
  }
  return seen.slice(0, 4).join(", ") + (seen.length > 4 ? ", …" : "");
}

/** The report for a value that is a number only some of the time. */
function mixedReport(label, name, kind, res) {
  const others = [...new Set(res.atoms.filter((a) => a.t !== "num").map((a) => (a.t === "nil" ? "undefined" : a.t === "str" ? "a string" : `a ${a.t}`)))].join(" or ");
  return (
    `${label}={${name}}: ${name} is a number (${whereDefined(res.atoms)}) or ${others}; a number was ${kind} in 2.x and is px now, ` +
    `so write those numbers as "N${kind}" where they are defined (and widen their type to \`\${number}${kind}\`)`
  );
}

/**
 * A same-file const that is a number or undefined (`const w = wide ? undefined : 32`):
 * its literal numbers can become the rem strings they were, at the source,
 * when every use of it is a size prop of the same unit. Collected per file;
 * transformUnits decides once it has seen every use.
 */
let sourceCandidates = new Map();
function sourceCandidate(res, name, kind) {
  if (!/^[A-Za-z_$][\w$]*$/.test(name) || !unitCtx) return null;
  if (!res.atoms.every((a) => a.t === "num" || a.t === "nil")) return null;
  const decl = res.atoms.find((a) => a.decl)?.decl;
  if (!decl || decl.name !== name || decl.annotated || decl.ctx.original !== unitCtx.src) return null;
  if (!res.atoms.every((a) => a.decl === decl || (a.decl && a.decl.at === decl.at))) return null;
  if (new RegExp(`\\bexport\\s+const\\s+${name}\\b|\\bexport\\s*\\{[^}]*\\b${name}\\b`).test(unitCtx.src)) return null;
  const init = unitCtx.src.slice(decl.initAt, decl.initEnd).replace(/\s+as\s+const\s*$/, "");
  const spans = leaves(init);
  if (!spans) return null;
  let entry = sourceCandidates.get(name);
  if (!entry) {
    entry = { decl, spans, uses: [] };
    sourceCandidates.set(name, entry);
  }
  return entry;
}

/**
 * The file's consts of a plain literal, `const GAP = 12` or
 * `const WIDTH = { plain: 14, wide: "20rem" } as const`: name (or
 * `name.key`) → `{ number }` or `{ string: true }`. A name declared twice
 * (shadowed in a function) is left out, since which one a use reads is not
 * known here. Set per file by transformUnits.
 */
let fileConsts = new Map();
/** The file the units pass is reading, `{ file, src }`, for ./codemod-3.0-values.mjs. */
let unitCtx = null;
function sameFileConsts(src) {
  const found = new Map();
  const seen = new Map();
  const literalOf = (v) => {
    const t = v.trim().replace(/\s+as\s+const$/, "");
    if (NUMBER.test(t)) return { number: Number(t) };
    if (/^(["'])[^"'`]*\1$/.test(t)) return { string: true };
    return null;
  };
  const imported = importBindings(src);
  const code = codeOnly(src, { jsxText: true });
  for (const m of src.matchAll(/\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\b/g)) seen.set(m[1], (seen.get(m[1]) ?? 0) + 1);
  for (const m of src.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*(?::[^=;]+)?=\s*/g)) {
    const name = m[1];
    if (seen.get(name) !== 1) continue;
    // The same number wherever it is read: the file declares the name once,
    // imports nothing by it, and binds it nowhere else.
    const fixed = !imported.has(name) && !boundElsewhere(code, name, m.index);
    const at = m.index + m[0].length;
    if (src[at] === "{") {
      const end = closing(src, at);
      if (end < 0) continue;
      const tail = src.slice(end + 1, end + 20);
      if (!/^\s*(as\s+const\s*)?[;\n]/.test(tail)) continue;
      // `as const` makes its entries readonly: a member is the number it was declared with.
      const readonly = /^\s*as\s+const\b/.test(tail);
      const { entries } = objectEntries(src.slice(at, end + 1));
      for (const e of entries) {
        if (e.shorthand) continue;
        const lit = literalOf(e.value);
        if (lit) found.set(`${name}.${e.key}`, { ...lit, fixed: fixed && readonly });
      }
      continue;
    }
    const lineEnd = src.slice(at).search(/[;\n]/);
    const lit = literalOf(src.slice(at, lineEnd < 0 ? undefined : at + lineEnd));
    if (lit) found.set(name, { ...lit, fixed });
  }
  return found;
}

const constValue = (expr) => fileConsts.get(expr.replace(/\?\./g, ".")) ?? null;

/** Walk `paths` (`{ "bulge.duration": "s" }`) into an inline object literal. */
function rewriteObject(paths, raw, base, label, push, warn) {
  const { entries, opaque } = objectEntries(raw);
  const wanted = Object.keys(paths);
  const heads = new Set(wanted.map((p) => p.split(".")[0]));
  for (const e of entries) {
    if (!heads.has(e.key)) continue;
    const leaf = paths[e.key];
    if (leaf) {
      const digits = !e.shorthand && (leaf === "%" || leaf === "vh") && NUMERIC_STRING.exec(e.value);
      if (digits) {
        // Untyped 2.x code (a template, a .js file) wrote these as numeric strings.
        if (Number(digits[2]) !== 0)
          push({ at: base + e.at, end: base + e.at + e.value.length, text: `"${digits[2]}${leaf}"`, quoted: true, kind: leaf, label: `${label}.${e.key}` });
        continue;
      }
      if (e.shorthand) warn(`${label}.${e.key}: a number here was ${leaf === "s" ? "seconds" : leaf}; check ${e.key}`);
      else rewriteValue(leaf, e.value, base + e.at, `${label}.${e.key}`, push, warn);
      continue;
    }
    const sub = {};
    for (const p of wanted) if (p.startsWith(`${e.key}.`)) sub[p.slice(e.key.length + 1)] = paths[p];
    if (e.value.startsWith("{") && !e.shorthand) rewriteObject(sub, e.value, base + e.at, `${label}.${e.key}`, push, warn);
    else warn(`${label}.${e.key}: check ${Object.keys(sub).join(", ")} inside it (units changed in 3.0)`);
  }
  if (opaque) warn(`${label}: spread or computed entries; check ${wanted.join(", ")} in them (units changed in 3.0)`);
}

/**
 * An import of the app's own code: a relative path, or a path alias such as
 * tsconfig's `@/…` or `~/…` (and `#…` subpath imports), which no package name
 * starts with.
 */
const isOwnSource = (source) => /^(\.|@\/|~\/|#)/.test(source);

/**
 * D2 on the file's own components: a wrapper defined here, or imported from a
 * relative path or a path alias (`@/components/…`, or any alias of the
 * nearest tsconfig's `paths`), often hands its size props on to a Once UI
 * Flex (`{...flex}`), where a 2.x number was rem. When its source shows that
 * it does (its props are a layout component's and the rest of them are spread
 * onto one; see ./codemod-3.0-own.mjs), the number becomes the rem string it
 * was. When that cannot be seen, it is reported. Only in files that import
 * Once UI, so MDX (whose elements are Once UI's) and unrelated files stay quiet.
 */
export function warnLocalSizes(src, { isCore = isCoreSource, file = null } = {}) {
  const warnings = [];
  const hits = [];
  const edits = [];
  const bindings = importBindings(src);
  if (![...bindings.values()].some((b) => isCore(b.source))) return { out: src, hits, warnings };
  const isRem = (canonical, prop) =>
    LAYOUT_COMPONENTS.has(canonical) && !LEAVES[canonical] && REM_PROPS.has(prop) && (UNIT_TABLE[canonical]?.[prop] ?? "rem") === "rem";
  const element = /<([A-Z][\w]*)(?=[\s/>])/g;
  let m;
  while ((m = element.exec(src))) {
    const name = m[1];
    const bound = bindings.get(name);
    const own = bound && !isCore(bound.source) && (isOwnSource(bound.source) || (file && isAliasSource(file, bound.source)));
    if (bound ? !own : LAYOUT_COMPONENTS.has(name)) continue;
    const from = m.index + name.length + 1;
    const end = openingTagEnd(src, from);
    if (end < 0) continue;
    for (const a of attributesOf(src, from, end)) {
      // G5 through a wrapper: Text no longer takes `size`, and a wrapper typed
      // as Text's props that spreads them onto a Text hands it straight on.
      const textSize = a.name === "size" && /^(xs|s|m|l|xl)$/.test(literal(a.value) ?? "") && literal(a.value);
      if (textSize) {
        const defined = bound ? file && resolveOwn(file, bound.source) : file;
        const byDefault = new RegExp(`import\\s+${name}\\s*(,|from)`).test(src);
        const target =
          !byDefault &&
          forwardsProp({
            file: defined || null,
            text: bound ? (defined ? readSource(defined) : null) : src,
            name: bound ? bound.canonical : name,
            prop: "size",
            isRem: (canonical, prop) => prop === "size" && (canonical === "Text" || canonical === "Heading"),
          });
        if (target)
          warnings.push(
            located(
              `<${name}> size="${textSize}": ${name} passes size on to a ${target}, which takes no size in 3.0 (2.x wrote the class font-${textSize}); ` +
                `write className="font-${textSize}" here${target === "Heading" ? " (on a Heading it set a size only under a parent with a font family)" : ""}, or a textVariant`,
              src,
              a.at,
            ),
          );
        continue;
      }
      if (!REM_PROPS.has(a.name) || a.value === null || !/^\{\s*-?\d/.test(String(a.value))) continue;
      const n = String(a.value).slice(1, -1).trim();
      if (!/^-?\d+(\.\d+)?$/.test(n) || Number(n) === 0) continue;
      // Where the wrapper is defined: this file, or the one its import resolves to.
      const defined = bound ? file && resolveOwn(file, bound.source) : file;
      // A default import: which export it is cannot be read by name.
      const byDefault = new RegExp(`import\\s+${name}\\s*(,|from)`).test(src);
      const target =
        !byDefault &&
        forwardsProp({
          file: defined || null,
          text: bound ? (defined ? readSource(defined) : null) : src,
          name: bound ? bound.canonical : name,
          prop: a.name,
          isRem,
        });
      // The wrapper turns it into rem itself (or uses it in an inline style): the number stays.
      if (!byDefault && consumesProp({ file: defined || null, text: bound ? (defined ? readSource(defined) : null) : src, name: bound ? bound.canonical : name, prop: a.name, isRem }))
        continue;
      if (target) {
        edits.push({ at: src.indexOf(a.value, a.at), end: a.end, text: `"${Number(n)}rem"` });
        hits.push(`<${name}> ${a.name}: number → "rem" string (${name} passes it on to a ${target})`);
        continue;
      }
      warnings.push(
        located(
          `<${name}> ${a.name}={${n}}: if ${name} passes ${a.name} on to a Once UI component, this was ${n}rem in 2.x and is ${n}px in 3.0; write "${n}rem" to keep the size`,
          src,
          a.at,
        ),
      );
    }
  }
  let out = src;
  for (const e of edits.sort((x, y) => y.at - x.at)) out = out.slice(0, e.at) + e.text + out.slice(e.end);
  return { out, hits, warnings };
}

/**
 * `<DataThemeProvider height={dataStyle.height}>`, where `dataStyle` is the
 * config's `const dataStyle = { height: 24 }`: transformDataStyle writes that
 * config value as "24rem" (in this run, or the run before), so the use site
 * must not add a unit. In a .js config the value is typed `string`, which
 * DataThemeProvider's `height` does not take, so a TypeScript use site casts
 * it to the rem string it now is. True when this is that case (handled).
 */
function dataStyleHeight(src, inner, base, file, push) {
  const e = inner.trim();
  if (/\bas\s+`\$\{number\}rem`\s*$/.test(e)) return true;
  const m = /^([\s\S]*?)\s*(?:\?\.|\.)\s*height$/.exec(e);
  if (!m || !unitCtx) return false;
  const at = base + inner.indexOf(e);
  const atoms = evaluate(contextFor(file, src), at, at + m[1].length);
  const config = atoms.length && atoms.every((x) => x.t === "obj" && x.decl?.name === "dataStyle" && !x.decl.annotated);
  if (!config) return false;
  if (!/\.(tsx|ts|mts|cts)$/.test(file ?? ".tsx")) return true;
  push({ at: at + e.length, end: at + e.length, text: " as `${number}rem`", kind: "rem", label: "height", hit: 'height={dataStyle.height}: the config\'s height is "Nrem" now → as `${number}rem`' });
  return true;
}

/**
 * D2 in config: the chart height in a `dataStyle: { height: 24 }` object, or
 * a `const dataStyle = { height: 24 }` (once-ui.config's chart defaults,
 * handed to DataThemeProvider), was rem.
 */
export function transformDataStyle(src) {
  const hits = [];
  const warnings = [];
  const edits = [];
  // `dataStyle: { … }` inside the config, or `const dataStyle = { … }` beside it.
  const key = /\bdataStyle\s*:\s*\{|\b(?:const|let|var)\s+dataStyle\s*(?::[^=]+)?=\s*\{/g;
  let m;
  while ((m = key.exec(src))) {
    // `const dataStyle: DataStyleConfig = …`: the app's own type says height is
    // a number, so it stays one, and the use site writes the unit
    // (`${dataStyle.height}rem`, see transformUnits).
    if (/^(?:const|let|var)\s+dataStyle\s*:/.test(m[0])) continue;
    const at = m.index + m[0].length - 1;
    const end = closing(src, at);
    if (end < 0) continue;
    const { entries } = objectEntries(src.slice(at, end + 1));
    for (const e of entries) {
      if (e.key !== "height" || e.shorthand) continue;
      const found = literalNumbers(e.value);
      if (found.opaque) {
        warnings.push(located(`dataStyle.height: ${e.value}: a number here was rem (now px); if it is a number, write it as "Nrem"`, src, at + e.at));
        continue;
      }
      for (const span of found.spans) {
        const r = convertNumber("rem", span.text);
        if (!r) continue;
        edits.push({ at: at + e.at + span.at, end: at + e.at + span.end, text: r.text });
        hits.push(`dataStyle.height: number → "rem" string`);
      }
    }
  }
  let out = src;
  for (const e of edits.sort((a, b) => b.at - a.at)) out = out.slice(0, e.at) + e.text + out.slice(e.end);
  return { out, hits, warnings };
}

/**
 * The D2–D5 pass on its own: units on Once UI elements, durations in ms,
 * and `speed` renames. `isCore(source)` decides which imports are Once UI
 * (core's own sources pass a predicate that accepts their relative imports).
 */
export function transformUnits(src, { isCore = isCoreSource, file = null } = {}) {
  const hits = [];
  const warnings = [];
  const edits = [];
  const bindings = importBindings(src);
  fileConsts = sameFileConsts(src);
  unitCtx = { file, src };
  sourceCandidates = new Map();
  const tags = new Set([...LAYOUT_COMPONENTS, ...Object.keys(UNIT_TABLE), ...Object.keys(SPEED_RENAMES)]);
  for (const tag of tags) {
    const own = UNIT_TABLE[tag] ?? {};
    const layout = LAYOUT_COMPONENTS.has(tag);
    for (const name of namesFor(tag, bindings, isCore)) {
      const open = new RegExp(`<${name.replace(".", "\\.")}(?=[\\s/>])`, "g");
      let m;
      while ((m = open.exec(src))) {
        const from = m.index + name.length + 1;
        const end = openingTagEnd(src, from);
        if (end < 0) continue;
        const attrs = attributesOf(src, from, end);
        const push = (e) =>
          edits.push({
            ...e,
            hit: `<${tag}> ${e.hit ?? `${e.label}: ${e.kind === "s" ? "seconds → ms" : `number → "${e.kind.replace("!", "")}" string`}`}`,
          });
        const warnAt = (at) => (w) => warnings.push(located(`<${tag}> ${w}`, src, at));
        let warn = warnAt(m.index);
        for (const a of attrs) {
          warn = warnAt(a.at);
          if (tag === "Mask" && a.name === "radius" && a.value !== null && NUMERIC_STRING.test(String(a.value))) {
            const n = NUMERIC_STRING.exec(String(a.value))[2];
            if (Number(n) !== 0) push({ at: a.at + a.name.length + 1, end: a.end, text: `"${n}vh"`, kind: "vh", label: "radius" });
            continue;
          }
          if (a.value === null || !String(a.value).startsWith("{")) continue;
          const valueAt = src.indexOf(a.value, a.at);
          const inner = a.value.slice(1, -1);
          const objectPaths = {};
          for (const [k, v] of Object.entries(own)) if (k.startsWith(`${a.name}.`)) objectPaths[k.slice(a.name.length + 1)] = v;
          if (Object.keys(objectPaths).length) {
            const body = inner.trim();
            if (body.startsWith("{")) rewriteObject(objectPaths, body, valueAt + 1 + inner.indexOf(body), a.name, push, warn);
            else if (!CONSTANT.test(body)) warn(`${a.name}={${body}}: check ${Object.keys(objectPaths).join(", ")} inside it (units changed in 3.0)`);
            continue;
          }
          if (layout && BREAKPOINT_PROPS.has(a.name)) {
            const body = inner.trim();
            if (!body.startsWith("{")) {
              if (!CONSTANT.test(body) && !stringObjectsOnly(body)) warn(`${a.name}={${body}}: numeric sizes and spacing in it were rem and are px now`);
              continue;
            }
            const { entries, opaque } = objectEntries(body);
            const base = valueAt + 1 + inner.indexOf(body);
            for (const e of entries) {
              if (!REM_PROPS.has(e.key)) continue;
              if (e.shorthand) warn(`${a.name}.${e.key}: a number here was rem (now px); check ${e.key}`);
              else rewriteValue("rem", e.value, base + e.at, `${a.name}.${e.key}`, push, warn);
            }
            if (opaque) warn(`${a.name}: spread or computed entries; numeric sizes and spacing in them were rem and are px now`);
            continue;
          }
          const kind = own[a.name] ?? (layout && REM_PROPS.has(a.name) ? "rem" : null);
          if (!kind) continue;
          if (tag === "DataThemeProvider" && a.name === "height" && dataStyleHeight(src, inner, valueAt + 1, file, push)) continue;
          rewriteValue(kind, inner, valueAt + 1, a.name, push, warn);
        }

        // D5: `speed` that was a length of time.
        const rename = SPEED_RENAMES[tag];
        const speed = attrs.find((a) => a.name === "speed");
        warn = warnAt(speed ? speed.at : m.index);
        if (rename && speed) {
          const twin = attrs.find((a) => a.name === rename.to);
          if (twin) {
            // 2.x had no such prop, so it reached the DOM and did nothing; speed was the one that worked.
            edits.push({ at: withLeadingSpace(src, twin.at), end: twin.end, text: "", hit: `<${tag}> unused ${rename.to} removed` });
          }
          const raw = speed.value === null ? "" : String(speed.value);
          const keyword = literal(raw);
          if (rename.keywords && keyword && rename.keywords[keyword]) {
            edits.push({ at: speed.at, end: speed.end, text: `${rename.to}={${rename.keywords[keyword]}}`, hit: `<${tag}> speed="${keyword}" → ${rename.to}` });
          } else {
            edits.push({ at: speed.at, end: speed.at + "speed".length, text: rename.to, hit: `<${tag}> speed → ${rename.to}` });
            const expr = raw.startsWith("{") ? raw.slice(1, -1).trim() : raw;
            // A same-file const holding a number of 50 or more was already milliseconds in 2.x.
            const known = /^[\w$.]+$/.test(expr) ? constValue(expr) : null;
            const numeric = known && !known.string && typeof known.number === "number" && known.number >= SECONDS_BELOW;
            if (rename.keywords && !NUMBER.test(expr) && !numeric)
              warn(`${rename.to}={${expr}}: milliseconds now; a 2.x keyword was "fast" 1000, "medium" 2000, "slow" 3000`);
          }
        }
        if (tag === "ParticleFx" && speed && !(speed.value && literal(speed.value)))
          rewriteParticleSpeed(src, speed, Boolean(bindings.get(name)), edits, warn);
        if (tag === "Effect") {
          const type = attrs.find((a) => a.name === "type");
          const t = type?.value ? literal(type.value) : null;
          if (speed && (t === null || t === "particle")) warn(`speed: if type is "particle", ${PARTICLE_SPEED}`);
          const particle = attrs.find((a) => a.name === "particle");
          if (particle?.value && /\bspeed\b/.test(particle.value)) warn(`particle.speed: ${PARTICLE_SPEED}`);
        }
      }
    }
  }
  // Consts that are a number or undefined: rewritten where they are declared
  // when every use of them is one of the size props seen above, in one unit.
  if (sourceCandidates.size) {
    const code = codeOnly(src, { jsxText: true });
    for (const [name, { decl, spans, uses }] of sourceCandidates) {
      const all = [...code.matchAll(new RegExp(`(?<![\\w$.])${name.replace(/\$/g, "\\$")}(?![\\w$])`, "g"))].length - 1;
      const kinds = new Set(uses.map((u) => u.kind));
      if (all === uses.length && kinds.size === 1) {
        const [kind] = kinds;
        for (const sp of spans) {
          if (!sp.number || Number(sp.text) === 0) continue;
          edits.push({ at: decl.initAt + sp.at, end: decl.initAt + sp.end, text: `"${Number(sp.text)}${kind}"`, hit: `const ${name}: number → "${kind}" string (every use of it is a size)` });
        }
        continue;
      }
      for (const u of uses)
        u.warn(
          `${u.label}={${name}}: ${name} is a number or undefined (line ${lineOf(src, decl.at)}); it was ${u.kind} in 2.x and is px now: write its numbers as "N${u.kind}" where it is declared, if nothing else reads it as a number`,
        );
    }
  }
  unitCtx = null;
  // Right to left, so earlier offsets stay valid; an overlapping edit is dropped.
  edits.sort((x, y) => y.at - x.at || y.end - x.end);
  let out = src;
  let lastAt = Number.POSITIVE_INFINITY;
  for (const e of edits) {
    if (e.end > lastAt) continue;
    // A whole attribute value `{40}` becomes `"40rem"`, not `{"40rem"}`.
    let a = e.at;
    let b = e.end;
    while (/\s/.test(out[a - 1] ?? "")) a--;
    while (/\s/.test(out[b] ?? "")) b++;
    const whole = e.quoted && out[a - 1] === "{" && out[b] === "}" && /=\s*$/.test(out.slice(0, a - 1));
    const [at, to] = whole ? [a - 1, b + 1] : [e.at, e.end];
    out = out.slice(0, at) + e.text + out.slice(to);
    lastAt = at;
    hits.push(e.hit);
  }
  return { out, hits, warnings };
}

// ─────────────────────────────────────────────────────────────────────────────
// E1–E4, F3: tone, variant, textVariant; Badge and Chip are Tag
//
// 3.0 gives each visual prop one meaning. `tone` is the semantic palette
// (brand, accent, neutral, info, success, warning, danger) everywhere 2.x
// spelled it `variant`, `scheme`, `state` or `hue`; `variant` is appearance
// only; `scheme` is a palette hue (blue, green…); Text and Heading take
// `textVariant`, the name Flex already used. Badge and Chip fold into Tag.
// Literal values are rewritten; a value the pass cannot read is reported.
// ─────────────────────────────────────────────────────────────────────────────

/** Plain prop renames: the value means the same under the new name. */
const TONE_RENAMES = {
  Text: { variant: "textVariant" },
  Heading: { variant: "textVariant" },
  // Components whose props are Text's, which pass `variant` on to it.
  ListItem: { variant: "textVariant" },
  CountFx: { variant: "textVariant" },
  CountdownFx: { variant: "textVariant" },
  ShineFx: { variant: "textVariant" },
  TypeFx: { variant: "textVariant" },
  FadingLettersFx: { variant: "textVariant" },
  Feedback: { variant: "tone" },
  Toast: { variant: "tone" },
  Pulse: { scheme: "tone" },
  StatusIndicator: { color: "scheme" },
};

/** E2: Button and IconButton `variant` values that were a tone or a twin. */
const BUTTON_TONES = new Set(["danger", "success", "warning"]);
const TONE_WORDS = /^(neutral|brand|accent|info|danger|warning|success)$/;

const quote = (raw) => (String(raw).trim().startsWith("'") ? "'" : '"');

/** Every quoted string literal in `text`, with offsets. */
function stringLiterals(text) {
  const found = [];
  const re = /(["'])((?:\\.|(?!\1).)*)\1/g;
  let m;
  while ((m = re.exec(text))) found.push({ at: m.index, end: m.index + m[0].length, value: m[2], q: m[1] });
  return found;
}

/** An attribute's value span in `src` (offsets of the text after `=`). */
const valueSpan = (src, a) => {
  const at = src.indexOf(a.value, a.at + a.name.length);
  return { at, end: at + String(a.value).length };
};

/**
 * Rename keys inside an inline object or array literal value: `{ key: … }` at
 * any depth of that literal. `map` is `{ oldKey: (valueText) => replacement
 * entry text | null }`, where null leaves it alone and `undefined` reports it.
 */
function rewriteKeys(text, base, key, replace, push, warn, label) {
  const re = new RegExp(`(^|[{,\\s])${key}(\\s*:\\s*)`, "g");
  let m;
  while ((m = re.exec(text))) {
    const keyAt = m.index + m[1].length;
    const valueAt = m.index + m[0].length;
    // The value runs to the next `,` or `}` at its own depth.
    let j = valueAt;
    let depth = 0;
    while (j < text.length) {
      const past = skipLexeme(text, j);
      if (past !== j) {
        j = past;
        continue;
      }
      const c = text[j];
      if ("([{".includes(c)) depth++;
      else if (")]}".includes(c)) {
        if (depth === 0) break;
        depth--;
      } else if (c === "," && depth === 0) break;
      j++;
    }
    let end = j;
    while (end > valueAt && /\s/.test(text[end - 1])) end--;
    const value = text.slice(valueAt, end);
    const r = replace(value.trim());
    if (r === undefined) warn(`${label}: ${key}: ${value.trim()} cannot be read; check it by hand`);
    else if (r !== null) push({ at: base + keyAt, end: base + end, text: r.text, remove: r.remove, hit: r.hit });
  }
}

/** E2/E1 on Button and IconButton: `variant` tones and `quaternary`, and `color`. */
function rewriteButton(src, attrs, tag, push, warn) {
  const variant = attrs.find((a) => a.name === "variant");
  const color = attrs.find((a) => a.name === "color");
  const tone = attrs.find((a) => a.name === "tone");
  let writesTone = false;
  if (variant?.value) {
    const v = literal(variant.value);
    if (v && BUTTON_TONES.has(v)) {
      // `primary` is the default variant, so the tone is all that is left.
      const q = quote(variant.value);
      if (tone) push({ at: withLeadingSpace(src, variant.at), end: variant.end, text: "", hit: `variant="${v}" removed (tone already set)` });
      else push({ at: variant.at, end: variant.end, text: `tone=${q}${v}${q}`, hit: `variant="${v}" → tone="${v}"` });
      writesTone = true;
    } else if (v === "quaternary") {
      const span = valueSpan(src, variant);
      push({ at: span.at, end: span.end, text: String(variant.value).replace("quaternary", "ghost"), hit: 'variant="quaternary" → "ghost"' });
    } else if (!v && !tone && splitButtonVariant(src, variant, push)) {
      writesTone = true;
    } else if (!v) {
      const expr = expressionOf(variant.value);
      const span = valueSpan(src, variant);
      for (const s of stringLiterals(String(variant.value))) {
        if (s.value === "quaternary")
          push({ at: span.at + s.at, end: span.at + s.end, text: `${s.q}ghost${s.q}`, hit: 'variant "quaternary" → "ghost"' });
      }
      const tones = stringLiterals(expr).filter((s) => BUTTON_TONES.has(s.value));
      // A name declared as a union of literals none of which changed: nothing to check.
      const declared = !stringLiterals(expr).length ? declaredLiterals(src, expr) : null;
      const unchanged = declared && declared.every((v) => !BUTTON_TONES.has(v) && v !== "quaternary");
      if (!unchanged && (tones.length || !stringLiterals(expr).length))
        warn(
          `variant={${expr}}: danger, success and warning are a tone in 3.0 (variant="primary" tone="danger"), and quaternary is ghost; check what it can hold`,
        );
    }
  }
  if (color?.value) {
    const v = literal(color.value);
    const t = v?.split("-")[0];
    if (v && TONE_WORDS.test(t) && !tone && !writesTone) {
      const q = quote(color.value);
      push({ at: color.at, end: color.end, text: `tone=${q}${t}${q}`, hit: `color="${v}" → tone="${t}"` });
      warn(`color="${v}" became tone="${t}", which colours the label as well as the icons (2.x tinted only the icons)`);
    } else {
      warn(
        `color: removed in 3.0 (it tinted only the icons); use tone="…" for the label and icons together${tone || writesTone ? ", which is already set here" : ""}`,
      );
    }
  }
}

/**
 * E2: `variant={c ? "danger" : "secondary"}`, every value a literal: the
 * variant each branch had in 3.0's terms, and the tone beside it, chosen
 * by the same condition (`danger` was primary in red):
 * `variant={c ? "primary" : "secondary"} tone={c ? "danger" : undefined}`,
 * and `variant="primary"` when every branch is the same variant.
 */
function splitButtonVariant(src, variant, push) {
  const value = String(variant.value);
  if (!value.startsWith("{")) return false;
  const span = valueSpan(src, variant);
  const innerAt = span.at + 1;
  const innerEnd = span.end - 1;
  const leaves = valueSpans(src, innerAt, innerEnd);
  const read = leaves.map((l) => {
    const t = src.slice(l.at, l.end);
    if (t === "undefined") return { l, variant: null, tone: null };
    const m = /^(["'])([a-z]+)\1$/.exec(t);
    if (!m) return null;
    if (BUTTON_TONES.has(m[2])) return { l, q: m[1], variant: "primary", tone: m[2] };
    return { l, q: m[1], variant: m[2] === "quaternary" ? "ghost" : m[2], tone: null };
  });
  if (!read.length || read.some((r) => r === null) || !read.some((r) => r.tone)) return false;
  const q = read.find((r) => r.q)?.q ?? '"';
  const rebuild = (pick) => {
    let text = src.slice(innerAt, innerEnd);
    for (const r of [...read].sort((a, b) => b.l.at - a.l.at)) {
      const v = pick(r);
      text = text.slice(0, r.l.at - innerAt) + (v === null ? "undefined" : `${q}${v}${q}`) + text.slice(r.l.end - innerAt);
    }
    return text.trim();
  };
  const variants = new Set(read.map((r) => r.variant));
  const variantText = variants.size === 1 && !variants.has(null) ? `variant=${q}${[...variants][0]}${q}` : `variant={${rebuild((r) => r.variant)}}`;
  const toneText = `tone={${rebuild((r) => r.tone)}}`;
  const lineStart = src.lastIndexOf("\n", variant.at - 1) + 1;
  const indent = src.slice(lineStart, variant.at);
  const sep = /^[ \t]*$/.test(indent) ? `\n${indent}` : " ";
  push({ at: variant.at, end: variant.end, text: `${variantText}${sep}${toneText}`, hit: 'variant={… "danger" …} → variant and tone={…}' });
  return true;
}

/** E1 on Tag: `scheme` → `tone`, `scheme="gradient"` → `variant="gradient"`. */
function rewriteTagScheme(src, attrs, push, warn) {
  const scheme = attrs.find((a) => a.name === "scheme");
  if (!scheme) return;
  const v = scheme.value === null ? null : literal(scheme.value);
  if (v === "gradient") {
    const q = quote(scheme.value);
    push({ at: scheme.at, end: scheme.end, text: `variant=${q}gradient${q}`, hit: 'scheme="gradient" → variant="gradient"' });
    return;
  }
  push({ at: scheme.at, end: scheme.at + "scheme".length, text: "tone", hit: "scheme → tone" });
  if (!v && /gradient/.test(String(scheme.value)))
    warn(`tone=${scheme.value}: "gradient" is variant="gradient" in 3.0, not a tone; split it by hand`);
}

/** E1 on the gauges: `hue="success"` → `tone`, `hue={[a, b]}` → `hueRange`. */
function rewriteGauge(src, attrs, push, warn) {
  const hue = attrs.find((a) => a.name === "hue");
  if (!hue?.value) return;
  const v = literal(hue.value);
  if (v) {
    push({ at: hue.at, end: hue.at + 3, text: "tone", hit: `hue="${v}" → tone` });
    return;
  }
  const expr = expressionOf(hue.value);
  // A ternary of tone names (`ok ? "success" : "danger"`) is a tone too.
  const strings = stringLiterals(expr);
  if (!expr.includes("[") && strings.length && strings.every((x) => TONE_WORDS.test(x.value))) {
    push({ at: hue.at, end: hue.at + 3, text: "tone", hit: "hue={…} → tone" });
    return;
  }
  if (expr.startsWith("[")) {
    push({ at: hue.at, end: hue.at + 3, text: "hueRange", hit: "hue={[…]} → hueRange" });
    return;
  }
  warn(`hue={${expr}}: a tone ("success", "neutral", "danger") is tone= in 3.0, a [start, end] pair is hueRange=; split it by hand`);
}

/**
 * An inline object or array attribute whose entries carry a renamed key.
 * `{…}` / `{[…]}` is rewritten; a variable is reported when this file shows
 * the old key anywhere, since its entries may be the ones defined here
 * (unless `note` is null: rewriteDataKeys follows it).
 */
function rewriteInlineKeys(src, attrs, prop, key, replace, push, warn, note) {
  const a = attrs.find((x) => x.name === prop);
  if (!a?.value || !String(a.value).startsWith("{")) return;
  const inner = String(a.value).slice(1, -1);
  const body = inner.trim();
  if (body.startsWith("{") || body.startsWith("[")) {
    const span = valueSpan(src, a);
    rewriteKeys(inner, span.at + 1, key, replace, push, warn, prop);
    return;
  }
  if (note && new RegExp(`\\b${key}\\s*:`).test(src)) warn(`${prop}={${body}}: ${note}`);
}

const TIMELINE_STATE = (value) => {
  const v = literal(value);
  if (v === "default") return { text: "", remove: true, hit: 'state: "default" removed (no tone)' };
  if (v === "active") return { text: `tone: ${quote(value)}brand${quote(value)}`, hit: 'state: "active" → tone: "brand"' };
  if (v === "success" || v === "danger") return { text: `tone: ${value}`, hit: `state: "${v}" → tone` };
  // `approved ? "success" : "active"`, `i <= step ? ("active" as const) : ("default" as const)`:
  // each literal branch mapped, "default" being no tone at all.
  const leaves = valueSpans(value, 0, value.length);
  const read = leaves.map((l) => {
    const t = value.slice(l.at, l.end);
    if (t === "undefined") return { l, to: null };
    const m = /^(["'])(active|default|success|danger)\1$/.exec(t);
    if (!m) return null;
    return { l, to: m[2] === "active" ? `${m[1]}brand${m[1]}` : m[2] === "default" ? null : t };
  });
  if (leaves.length < 2 || read.some((r) => r === null)) return undefined;
  if (read.every((r) => r.to === null)) return { text: "", remove: true, hit: 'state: "default" removed (no tone)' };
  let text = value;
  for (const r of [...read].sort((a, b) => b.l.at - a.l.at)) {
    if (r.to !== null) {
      text = text.slice(0, r.l.at) + r.to + text.slice(r.l.end);
      continue;
    }
    // `("default" as const)` → `undefined`, parentheses and all.
    let { outerAt: a, outerEnd: b } = r.l;
    while (/\(\s*$/.test(text.slice(0, a)) && /^\s*\)/.test(text.slice(b))) {
      a = text.slice(0, a).replace(/\(\s*$/, "").length;
      b = text.length - text.slice(b).replace(/^\s*\)/, "").length;
    }
    text = text.slice(0, a) + "undefined" + text.slice(b);
  }
  return { text: `tone: ${text}`, hit: 'state: … → tone: … ("active" is "brand", "default" no tone)' };
};

const TABLE_ACTION_VARIANT = (value) => {
  const v = literal(value);
  if (v === "danger") {
    const q = quote(value);
    return { text: `variant: ${q}primary${q}, tone: ${q}danger${q}`, hit: 'variant: "danger" → variant: "primary", tone: "danger"' };
  }
  return v ? null : undefined;
};

const RENAME_KEY = (to, hit) => (value) => ({ text: `${to}: ${value}`, hit });

// ─── Data built outside the element: Timeline items, Scrubber tracks ───────



/**
 * The object literals a Timeline's `items` or a Scrubber's `tracks` are built
 * from, followed through what can be read exactly: array literals, a
 * same-file `const` used only here, `.map(p => ({ … }))` (whose `p.key` reads
 * follow a const whose keys are renamed), `useMemo(() => …)`, a ternary, and
 * `as`/`satisfies`. `ctx.key` is the 2.x key; `ctx.nested` the keys whose
 * values are more of the same data (a track's `blocks`). Fills `found`
 * (`entries`: each `key: value`; `members`: each `p.key` to rename; `decls`:
 * consts followed) and returns false where the data cannot be seen.
 */
function walkData(src, at, end, ctx, found, param = null) {
  ({ at, end } = trimmed(src, at, end));
  if (at >= end) return false;
  const text = src.slice(at, end);
  const c = src[at];
  if ((c === "[" || c === "{") && closing(src, at) === end - 1) {
    const parts = partsBetween(src, at, end - 1);
    if (c === "[") return parts.every((p) => !src.startsWith("...", p.at) && walkData(src, p.at, p.end, ctx, found, param));
    let unknownSpread = false;
    let explicit = false;
    for (const p of parts) {
      const part = src.slice(p.at, p.end);
      const spread = /^\.\.\.\s*([A-Za-z_$][\w$]*)\s*$/.exec(part);
      if (part.startsWith("...")) {
        if (!(spread && spread[1] === param)) unknownSpread = true;
        continue;
      }
      const m = /^(?:([A-Za-z_$][\w$]*)|(["'])([^"']*)\2)\s*:\s*/.exec(part);
      const name = m ? (m[1] ?? m[3]) : /^[A-Za-z_$][\w$]*$/.test(part) ? part : null;
      if (name === ctx.key) {
        if (!m) return false; // `{ state }`: a variable's value
        explicit = true;
        found.entries.push({ keyAt: p.at, keyEnd: p.at + m[0].replace(/\s*:\s*$/, "").length, valueAt: p.at + m[0].length, valueEnd: p.end, param });
      } else if (m && ctx.nested.has(name)) {
        if (!walkData(src, p.at + m[0].length, p.end, ctx, found, null)) return false;
      }
    }
    // A spread of something else may carry the old key, unless this object sets it.
    return !(unknownSpread && !explicit);
  }
  // `x as T`, `x satisfies T`.
  const cast = topLevel(src, at, end, (i) => /^\s(as|satisfies)\s/.test(src.slice(i - 1, i + 11)) && /\s/.test(src[i - 1]));
  if (cast > at) {
    const word = /^(as|satisfies)/.exec(src.slice(cast))?.[0];
    if (word) return walkData(src, at, cast, ctx, found, param);
  }
  // `cond ? a : b`, `a ?? b`, `a || b`, `c && a`.
  const q = topLevel(src, at, end, (i) => src[i] === "?" && src[i + 1] !== "." && src[i + 1] !== "?" && src[i - 1] !== "?");
  if (q > 0) {
    let nested = 0;
    const colon = topLevel(src, q + 1, end, (i) => {
      if (src[i] === "?" && src[i + 1] !== "." && src[i + 1] !== "?" && src[i - 1] !== "?") nested++;
      else if (src[i] === ":" && nested-- === 0) return true;
      return false;
    });
    if (colon < 0) return false;
    return walkData(src, q + 1, colon, ctx, found, param) && walkData(src, colon + 1, end, ctx, found, param);
  }
  // `.map(cb)` (after any chain), and `useMemo(() => …)`.
  if (src[end - 1] === ")") {
    let open = -1;
    for (let i = end - 2, depth = 0; i >= at; i--) {
      if (")]}".includes(src[i])) depth++;
      else if ("([{".includes(src[i])) {
        if (depth === 0) {
          open = i;
          break;
        }
        depth--;
      }
    }
    if (open < 0 || closing(src, open) !== end - 1) return false;
    const callee = src.slice(at, open).replace(/\s+$/, "");
    const args = partsBetween(src, open, end - 1);
    const fn = args[0] && /^(?:async\s+)?(?:\(\s*(?:([A-Za-z_$][\w$]*)|(\{[^{}]*\}|\[[^[\]]*\]))?\s*(?::[^,)]*)?(?:,[^)]*)?\)|([A-Za-z_$][\w$]*))\s*(?::[^=]*)?=>\s*/.exec(src.slice(args[0].at, args[0].end));
    if (!fn) return false;
    const bodyAt = args[0].at + fn[0].length;
    if (src[bodyAt] === "{") {
      // `useMemo(() => { …; return [ … ]; })`: the block's own returns, when
      // no nested block or function returns too (an `if` may return else).
      if (!/^(?:React\.)?useMemo\s*(?:<[\s\S]*>)?$/.test(callee)) return false;
      const close = closing(src, bodyAt);
      if (close < 0) return false;
      const returns = [];
      let depth = 0;
      for (let i = bodyAt; i < close; i++) {
        const past = skipLexeme(src, i);
        if (past !== i) {
          i = past - 1;
          continue;
        }
        const ch = src[i];
        if ("([{".includes(ch)) depth++;
        else if (")]}".includes(ch)) depth--;
        else if (/^return\b/.test(src.slice(i, i + 7)) && !/[\w$.]/.test(src[i - 1])) {
          if (depth !== 1) return false;
          returns.push(i + "return".length);
        }
      }
      if (!returns.length) return false;
      return returns.every((r) => {
        const stop = topLevel(src, r, close, (i) => src[i] === ";" || (src[i] === "\n" && /^\n\s*(?:const|let|var|if|for|return|\}|$)/.test(src.slice(i))));
        return walkData(src, r, stop < 0 ? close : stop, ctx, found, null);
      });
    }
    const p = fn[1] ?? fn[3] ?? null;
    // `({ label }, i) =>`: what it takes out of the item is the app's own data, so the array mapped is not renamed.
    const destructured = Boolean(fn[2]);
    if (/^(?:React\.)?useMemo\s*(?:<[\s\S]*>)?$/.test(callee)) return walkData(src, bodyAt, args[0].end, ctx, found, null);
    const map = /^([\s\S]*?)\s*\??\.\s*map$/.exec(callee);
    if (!map) return false;
    // Items read through `p.key` come from the array mapped: a const whose keys are renamed too.
    const source = !destructured && /^[A-Za-z_$][\w$]*$/.test(map[1].trim()) ? map[1].trim() : null;
    const before = found.entries.length;
    const followed = source ? walkData(src, at, at + map[1].length, ctx, found, null) : false;
    if (source && !followed) found.entries.length = before;
    // `p.key` reads the array mapped: renamed with it when it is a followed
    // const, else it is the app's own data and stays.
    const reads = p && followed ? [...src.slice(bodyAt, args[0].end).matchAll(new RegExp(`(?<![\\w$.])${p}\\s*\\??\\.\\s*${ctx.key}(?![\\w$])`, "g"))] : [];
    for (const r of reads) {
      const keyAt = bodyAt + r.index + r[0].length - ctx.key.length;
      found.members.push({ at: keyAt, end: keyAt + ctx.key.length });
    }
    return walkData(src, bodyAt, args[0].end, ctx, found, followed ? p : null);
  }
  // A same-file const, declared once and used only here.
  if (/^[A-Za-z_$][\w$]*$/.test(text)) {
    const decl = [...src.matchAll(new RegExp(`(?<![\\w$.])(?:let|var|const)\\s+${text}\\b`, "g"))];
    if (decl.length !== 1 || !decl[0][0].startsWith("const")) return false;
    const code = codeOnly(src, { jsxText: true });
    const uses = [...code.matchAll(new RegExp(`(?<![\\w$.])${text}(?![\\w$])(?!\\s*:(?!:))(?!\\s*=(?![=>]))`, "g"))].filter(
      (u) => !/\b(const|let|var)\s+$/.test(code.slice(Math.max(0, u.index - 8), u.index)),
    );
    if (uses.length !== 1) return false;
    const head = new RegExp(`\\bconst\\s+${text}\\s*(?::[^=]+)?=\\s*`, "g");
    head.lastIndex = decl[0].index;
    const h = head.exec(src);
    if (!h || h.index !== decl[0].index) return false;
    const initAt = h.index + h[0].length;
    const initEnd = topLevel(src, initAt, src.length, (i) => src[i] === ";" || (src[i] === "\n" && /^\n\s*(?:const|let|var|export|function|import|type|interface|\/\/|\/\*|$)/.test(src.slice(i))));
    if (initEnd < 0) return false;
    found.decls.push(text);
    return walkData(src, initAt, initEnd, ctx, found, null);
  }
  return false;
}

/**
 * E1 on a Timeline's `items` or a Scrubber's `tracks` that are not an inline
 * literal: the same key rewrite, through `walkData`. Every bare use of the old
 * key in the data must be one the walk reached, or nothing is changed and it
 * is reported.
 */
function rewriteDataKeys(src, attrs, prop, ctx, replace, push, warn, note) {
  const a = attrs.find((x) => x.name === prop);
  if (!a?.value || !String(a.value).startsWith("{")) return;
  const body = String(a.value).slice(1, -1).trim();
  if (body.startsWith("{") || body.startsWith("[")) return; // inline: rewriteInlineKeys
  const span = valueSpan(src, a);
  const found = { entries: [], members: [], decls: [] };
  const ok = walkData(src, span.at + 1, span.end - 1, ctx, found);
  const edits = [];
  let bad = !ok;
  if (ok) {
    // Every bare `key` in what was walked is an entry the walk saw.
    const code = codeOnly(src);
    const spans = [{ at: span.at, end: span.end }];
    for (const name of found.decls) {
      const h = new RegExp(`\\bconst\\s+${name}\\b`).exec(src);
      const initEnd = topLevel(src, h.index, src.length, (i) => src[i] === ";" || (src[i] === "\n" && /^\n\s*(?:const|let|var|export|function|import|type|interface|\/\/|\/\*|$)/.test(src.slice(i))));
      spans.push({ at: h.index, end: initEnd });
    }
    const bare = spans.reduce((n, s) => n + [...code.slice(s.at, s.end).matchAll(new RegExp(`(?<![\\w$.])${ctx.key}(?![\\w$])`, "g"))].length, 0);
    if (bare !== found.entries.length) bad = true;
    for (const e of found.entries) {
      if (bad) break;
      const value = src.slice(e.valueAt, e.valueEnd);
      const through = e.param && new RegExp(`^${e.param}\\s*\\??\\.\\s*${ctx.key}\\b`).test(value.trim());
      if (through) {
        edits.push({ at: e.keyAt, end: e.keyEnd, text: ctx.to, hit: `${ctx.key} → ${ctx.to}` });
        continue;
      }
      const r = replace(value.trim());
      if (!r) {
        bad = true;
        break;
      }
      edits.push({ at: e.keyAt, end: e.valueEnd, text: r.text, remove: r.remove, hit: r.hit });
    }
    for (const m of found.members) edits.push({ at: m.at, end: m.end, text: ctx.to, hit: `.${ctx.key} → .${ctx.to}` });
  }
  if (bad) {
    if (new RegExp(`\\b${ctx.key}\\s*:`).test(src)) warn(`${prop}={${String(a.value).slice(1, -1).trim()}}: ${note}`);
    return;
  }
  for (const e of edits) push(e);
}

/** E1 in types: `TimelineItem["state"]`, `ScrubberTrack["scheme"]` and `ScrubberBlock["scheme"]` name the tone now. */
const TYPE_INDEX_RENAMES = { TimelineItem: ["state", "tone"], ScrubberTrack: ["scheme", "tone"], ScrubberBlock: ["scheme", "tone"] };

/**
 * F3: Badge and Chip are Tag. The element and its import become Tag, and
 * the props map:
 *   Badge  title → label, icon → prefixIcon, + variant="announce" (its look;
 *          announce also turns the shine on by default, as Badge did)
 *   Chip   iconButtonProps → removeButtonProps, + selected where it was left
 *          out (Chip's `selected` defaulted to true, Tag's to false)
 */
const FOLDED_INTO_TAG = {
  Badge: {
    props: { title: "label", icon: "prefixIcon" },
    add: (attrs) => (attrs.some((a) => a.name === "variant") ? [] : ['variant="announce"']),
    types: { BadgeProps: "TagProps" },
  },
  Chip: {
    props: { iconButtonProps: "removeButtonProps" },
    add: (attrs) => (attrs.some((a) => a.name === "selected") ? [] : ["selected"]),
    types: { ChipProps: "TagProps" },
  },
};

/** The import side of F3: `{ Badge, Chip }` → `{ Tag }`; the elements keep their local names when aliased. */
function foldImports(src, isCore, hits) {
  const re = /(import|export)\s+(type\s+)?\{([^}]*)\}\s*(from\s*(["'])([^"']+)\5;?[ \t]*\n?)/g;
  // A Tag already imported in another statement is not imported twice.
  const tagBound = (() => {
    const b = importBindings(src).get("Tag");
    return Boolean(b && isCore(b.source));
  })();
  let first = true;
  return src.replace(re, (whole, keyword, typeOnly, clause, tail, q, source) => {
    if (!isCore(source)) return whole;
    const specs = specifiersOf(clause);
    if (!specs.some((s) => FOLDED_INTO_TAG[s.name] || s.name === "BadgeProps" || s.name === "ChipProps")) return whole;
    const out = [];
    const seen = new Set();
    for (const s of specs) {
      const from = FOLDED_INTO_TAG[s.name] ? "Tag" : s.name === "BadgeProps" || s.name === "ChipProps" ? "TagProps" : null;
      let text = s.text;
      if (from) {
        const aliased = /\s+as\s+/.test(s.text);
        text = aliased ? s.text.replace(s.name, from) : s.text.replace(s.name, from);
        hits.push(`import ${s.name} → ${from}`);
      }
      const key = text.replace(/^type\s+/, "");
      if (seen.has(key)) continue;
      if (from && key === "Tag" && keyword === "import" && (tagBound || !first)) continue;
      seen.add(key);
      out.push(text);
    }
    if (keyword === "import" && out.some((t) => t.replace(/^type\s+/, "") === "Tag")) first = false;
    if (!out.length) return "";
    return `${keyword} ${typeOnly ?? ""}${braceList(out, clause)} ${tail}`;
  });
}

/**
 * The E/F3 pass on its own. `isCore(source)` decides which imports are Once
 * UI (core's own sources pass one that accepts their relative imports).
 */
export function transformTone(src, { isCore = isCoreSource } = {}) {
  const hits = [];
  const warnings = [];
  let out = src;

  // F3 first: Badge and Chip elements become Tag, with their props mapped.
  {
    const bindings = importBindings(out);
    const edits = [];
    for (const [tag, spec] of Object.entries(FOLDED_INTO_TAG)) {
      for (const name of namesFor(tag, bindings, isCore)) {
        const open = new RegExp(`<${name}(?=[\\s/>])`, "g");
        let m;
        while ((m = open.exec(out))) {
          const from = m.index + name.length + 1;
          const end = openingTagEnd(out, from);
          if (end < 0) continue;
          const attrs = attributesOf(out, from, end);
          // An alias keeps its local name; the import names Tag.
          if (name === tag) edits.push({ at: m.index + 1, end: from, text: "Tag", hit: `<${tag}> → <Tag>` });
          const added = spec.add(attrs);
          const gap = attributeGap(out, from);
          if (added.length) edits.push({ at: from, end: from, text: `${gap}${added.join(gap)}`, hit: `<${tag}> + ${added.join(" ")}` });
          for (const a of attrs) {
            const to = spec.props[a.name];
            if (!to) continue;
            if (attrs.some((b) => b.name === to)) {
              warnings.push(`<${tag}> ${a.name} and ${to} both set; Tag takes ${to}, merge them by hand`);
              continue;
            }
            edits.push({ at: a.at, end: a.at + a.name.length, text: to, hit: `<${tag}> ${a.name} → ${to}` });
          }
          // Tag renders its label, or its children without one, as 2.x's Tag
          // and Chip did; Badge drew its title and its children side by side.
          const selfClosing = /\/\s*>$/.test(out.slice(from, end + 1).trimEnd());
          if (
            tag === "Badge" &&
            attrs.some((a) => a.name === "title") &&
            !selfClosing &&
            !new RegExp(`^\\s*</${name}\\s*>`).test(out.slice(end + 1))
          )
            warnings.push("<Badge> title and children both set: Tag shows its label, or its children without one; merge them");
        }
        if (name === tag) {
          const close = new RegExp(`</${tag}\\s*>`, "g");
          let c;
          while ((c = close.exec(out))) edits.push({ at: c.index, end: c.index + c[0].length, text: "</Tag>", hit: `</${tag}> → </Tag>` });
          const typeofRe = new RegExp(`\\btypeof ${tag}\\b`, "g");
          while ((c = typeofRe.exec(out))) edits.push({ at: c.index, end: c.index + c[0].length, text: "typeof Tag", hit: `typeof ${tag} → typeof Tag` });
        }
      }
    }
    out = applyEdits(out, edits, hits);
    out = foldImports(out, isCore, hits);
    for (const [tag, spec] of Object.entries(FOLDED_INTO_TAG)) {
      for (const [type, to] of Object.entries(spec.types)) {
        const before = out;
        out = out.replace(new RegExp(`(?<![\\w$.])${type}(?![\\w$])`, "g"), to);
        if (out !== before) hits.push(`${type} → ${to}`);
      }
      // Anything else that still names it (a value, a map of components).
      const bound = importBindings(src).get(tag);
      const code = codeOnly(out, { jsxText: true }).replace(/import[^;]*;/g, "");
      const reference = new RegExp(`(?:[{(\\[,=:?]\\s*|\\btypeof\\s+)${tag}\\b|\\b${tag}\\s*[,})\\].]`);
      if (bound && isCore(bound.source) && reference.test(code))
        warnings.push(`${tag}: removed in 3.0, use Tag; a reference left in place needs renaming by hand`);
    }
  }

  // E1: Timeline items built outside the element, in a `TimelineItem[]` (or
  // a `TimelineItem`) the file declares, and pushed onto one: their `state`
  // keys are typed as Timeline's, so they are `tone` now.
  out = applyEdits(out, timelineItemEdits(out, isCore, warnings), hits);

  // E1/E2: renames and value rewrites, element by element.
  const bindings = importBindings(out);
  const edits = [];
  const tags = new Set([
    ...Object.keys(TONE_RENAMES),
    "Button",
    "IconButton",
    "Tag",
    "LinearGauge",
    "RadialGauge",
    "Timeline",
    "Table",
    "Scrubber",
    "Avatar",
  ]);
  for (const tag of tags) {
    for (const name of namesFor(tag, bindings, isCore)) {
      const open = new RegExp(`<${name}(?=[\\s/>])`, "g");
      let m;
      while ((m = open.exec(out))) {
        const from = m.index + name.length + 1;
        const end = openingTagEnd(out, from);
        if (end < 0) continue;
        const attrs = attributesOf(out, from, end);
        const push = (e) => {
          // Removing an object entry takes its comma with it.
          if (e.remove) {
            let { at, end: to } = e;
            const after = /^\s*,\s*/.exec(out.slice(to));
            if (after) to += after[0].length;
            else {
              const before = /,\s*$/.exec(out.slice(0, at));
              if (before) at -= before[0].length;
            }
            edits.push({ at, end: to, text: "", hit: `<${tag}> ${e.hit}` });
            return;
          }
          edits.push({ ...e, hit: `<${tag}> ${e.hit}` });
        };
        const warn = (w) => warnings.push(located(`<${tag}> ${w}`, out, m.index));
        for (const [old, to] of Object.entries(TONE_RENAMES[tag] ?? {})) {
          const a = attrs.find((x) => x.name === old);
          if (!a) continue;
          if (attrs.some((b) => b.name === to)) push({ at: withLeadingSpace(out, a.at), end: a.end, text: "", hit: `${old} removed (${to} already set)` });
          else push({ at: a.at, end: a.at + old.length, text: to, hit: `${old} → ${to}` });
        }
        if (tag === "Button" || tag === "IconButton") rewriteButton(out, attrs, tag, push, warn);
        if (tag === "Tag") rewriteTagScheme(out, attrs, push, warn);
        if (tag === "LinearGauge" || tag === "RadialGauge") rewriteGauge(out, attrs, push, warn);
        if (tag === "Timeline") {
          const note = 'items[].state is items[].tone in 3.0 ("active" is "brand", "default" is no tone)';
          rewriteInlineKeys(out, attrs, "items", "state", TIMELINE_STATE, push, warn, null);
          rewriteDataKeys(out, attrs, "items", { key: "state", to: "tone", nested: new Set() }, TIMELINE_STATE, push, warn, note);
        }
        if (tag === "Table")
          rewriteInlineKeys(out, attrs, "actions", "variant", TABLE_ACTION_VARIANT, push, warn, 'actions[].variant "danger" is variant: "primary", tone: "danger" in 3.0');
        if (tag === "Scrubber") {
          const note = "tracks[].scheme and blocks[].scheme are tone in 3.0";
          const rename = RENAME_KEY("tone", "scheme → tone");
          rewriteInlineKeys(out, attrs, "tracks", "scheme", rename, push, warn, null);
          rewriteDataKeys(out, attrs, "tracks", { key: "scheme", to: "tone", nested: new Set(["blocks"]) }, rename, push, warn, note);
        }
        if (tag === "Avatar")
          rewriteInlineKeys(out, attrs, "statusIndicator", "color", RENAME_KEY("scheme", "statusIndicator.color → scheme"), push, warn, "statusIndicator.color is statusIndicator.scheme in 3.0");
      }
    }
  }
  out = applyEdits(out, edits, hits);

  // E1 in types: an indexed access of the renamed key names the new one.
  {
    const typeBindings = importBindings(out);
    for (const [type, [from, to]] of Object.entries(TYPE_INDEX_RENAMES)) {
      for (const [bound, b] of typeBindings) {
        // `import { type TimelineItem }` binds "type TimelineItem" there.
        const local = bound.replace(/^type\s+/, "");
        if (b.canonical.replace(/^type\s+/, "") !== type || !isCore(b.source)) continue;
        const re = new RegExp(`(?<![\\w$.])(${local}\\s*\\[\\s*)(["'])${from}\\2(\\s*\\])`, "g");
        const before = out;
        out = out.replace(re, `$1$2${to}$2$3`);
        if (out !== before) hits.push(`${type}["${from}"] → ${type}["${to}"]`);
      }
    }
    // `ComponentProps<typeof Text>["variant"]`, `TextProps["variant"]`: the prop's type under its new name.
    for (const [bound, b] of typeBindings) {
      const local = bound.replace(/^type\s+/, "");
      const canonical = b.canonical.replace(/^type\s+/, "");
      if (!isCore(b.source)) continue;
      const component = TONE_RENAMES[canonical] ? canonical : /Props$/.test(canonical) && TONE_RENAMES[canonical.slice(0, -5)] ? canonical.slice(0, -5) : null;
      if (!component) continue;
      const head = canonical === component ? `(?:React\\s*\\.\\s*)?ComponentProps(?:WithRef|WithoutRef)?\\s*<\\s*typeof\\s+${local}\\s*>` : local;
      for (const [from, to] of Object.entries(TONE_RENAMES[component])) {
        const re = new RegExp(`(?<![\\w$.])(${head}\\s*\\[\\s*)(["'])${from}\\2(\\s*\\])`, "g");
        const before = out;
        out = out.replace(re, `$1$2${to}$2$3`);
        if (out !== before) hits.push(`${canonical === component ? `ComponentProps<typeof ${component}>` : canonical}["${from}"] → ["${to}"]`);
      }
    }
  }

  // E1: `addToast({ variant })` → `addToast({ tone })`, in files that show toasts.
  if (/\buse(?:Optional)?Toast\b/.test(out) && /\baddToast\b/.test(out)) {
    const toastEdits = [];
    const call = /\baddToast\s*(?:\?\.)?\(\s*/g;
    let m;
    while ((m = call.exec(out))) {
      const argAt = m.index + m[0].length;
      if (out[argAt] === ")") continue;
      const paren = m.index + m[0].lastIndexOf("(");
      const callEnd = closing(out, paren);
      const args = callEnd < 0 ? [] : partsBetween(out, paren, callEnd);
      // The object, or each object a ternary (or `??`) chooses between.
      const spans = args.length ? valueSpans(out, args[0].at, args[0].end) : [];
      const objects = spans.filter((sp) => out[sp.at] === "{" && closing(out, sp.at) === sp.end - 1);
      if (!spans.length || objects.length !== spans.length) {
        warnings.push(located("addToast(…): its `variant` is `tone` in 3.0; rename the key where the object is built", out, m.index));
        continue;
      }
      for (const sp of objects) {
        const body = out.slice(sp.at, sp.end);
        const { entries } = objectEntries(body);
        for (const e of entries) {
          if (e.key !== "variant") continue;
          if (e.shorthand) {
            toastEdits.push({ at: sp.at + e.at, end: sp.at + e.end, text: "tone: variant", hit: "addToast { variant } → { tone: variant }" });
            continue;
          }
          const keyAt = body.lastIndexOf("variant", e.at);
          toastEdits.push({ at: sp.at + keyAt, end: sp.at + keyAt + "variant".length, text: "tone", hit: "addToast variant → tone" });
        }
      }
    }
    out = applyEdits(out, toastEdits, hits);
  }
  return { out, hits, warnings };
}

/** Edits for the `state` keys of object literals typed as TimelineItem (see transformTone). */
function timelineItemEdits(src, isCore, warnings) {
  const edits = [];
  const names = [...importBindings(src)]
    .filter(([, b]) => b.canonical.replace(/^type\s+/, "") === "TimelineItem" && isCore(b.source))
    .map(([local]) => local.replace(/^type\s+/, ""));
  if (!names.length) return edits;
  const push = (e) => {
    if (e.remove) {
      let { at, end: to } = e;
      const after = /^\s*,\s*/.exec(src.slice(to));
      if (after) to += after[0].length;
      else {
        const before = /,\s*$/.exec(src.slice(0, at));
        if (before) at -= before[0].length;
      }
      edits.push({ at, end: to, text: "", hit: `<Timeline> ${e.hit} (a TimelineItem)` });
      return;
    }
    edits.push({ ...e, hit: `<Timeline> ${e.hit} (a TimelineItem)` });
  };
  const warn = (at) => (w) => warnings.push(located(`<Timeline> ${w}`, src, at));
  const typed = [];
  for (const name of names) {
    const decl = new RegExp(`\\b(?:const|let|var)\\s+([A-Za-z_$][\\w$]*)\\s*:\\s*(?:${name}\\s*\\[\\s*\\]|(?:Readonly)?Array\\s*<\\s*${name}\\s*>|${name})\\s*=\\s*`, "g");
    for (const m of src.matchAll(decl)) {
      const at = m.index + m[0].length;
      const end = statementEnd(src, at);
      rewriteKeys(src.slice(at, end), at, "state", TIMELINE_STATE, push, warn(m.index), "items");
      typed.push(m[1]);
    }
  }
  // `events.push({ …, state: "danger" })` onto one of them.
  for (const name of typed) {
    for (const m of src.matchAll(new RegExp(`(?<![\\w$.])${name}\\s*\\.\\s*(?:push|unshift)\\s*\\(`, "g"))) {
      const open = m.index + m[0].length - 1;
      const close = closing(src, open);
      if (close < 0) continue;
      rewriteKeys(src.slice(open + 1, close), open + 1, "state", TIMELINE_STATE, push, warn(m.index), "items");
    }
  }
  return edits;
}

/** Apply edits right to left so earlier offsets stay valid; an overlapping edit is dropped. */
function applyEdits(src, edits, hits) {
  edits.sort((x, y) => y.at - x.at || y.end - x.end);
  let out = src;
  let lastAt = Number.POSITIVE_INFINITY;
  for (const e of edits) {
    if (e.end > lastAt) continue;
    out = out.slice(0, e.at) + e.text + out.slice(e.end);
    hits.push(e.hit);
    lastAt = e.at;
  }
  return out;
}

/**
 * `<core.X>` where `core` is `import * as core from "@once-ui-system/core"`
 * gets every rule `<X>` gets. Each such element is renamed `<core__X>`, a
 * synthetic `import { X as core__X }` is added, the passes run, and the
 * imports they leave say where each name went: a name still on core's root
 * is `<core.Survivor>` again (DropdownWrapper → `<core.Dropdown>`), and one
 * that moved to a package (RevealFx → fx, StylePanel → blocks) is imported
 * from it by name, since the namespace no longer holds it.
 */
export function transform(src, { file = null, devLogger = null, strings = true } = {}) {
  const namespaces = [
    ...src.matchAll(/(?<![\w$.])import\s+\*\s+as\s+([\w$]+)\s+from\s*(["'])@once-ui-system\/core\2/g),
  ].map((m) => m[1]);
  const used = new Map();
  let text = src;
  for (const ns of namespaces) {
    const jsx = new RegExp(`(<\\/?)${ns}\\.([A-Z][\\w$]*)(?=[\\s/>])`, "g");
    text = text.replace(jsx, (_, open, name) => {
      used.set(`${ns}__${name}`, { ns, name });
      return `${open}${ns}__${name}`;
    });
  }
  if (!used.size) return transformFile(src, { file, devLogger, strings });
  // After the last import, so a pass that adds a name to "the" core import finds the file's own first.
  const imports = [...text.matchAll(/^import[^;]*?from\s*["'][^"']+["'];?[ \t]*$/gm)];
  const last = imports.at(-1);
  const at = last ? last.index + last[0].length : 0;
  const synthetic = `\nimport { ${[...used].map(([local, { name }]) => `${name} as ${local}`).join(", ")} } from "@once-ui-system/core";`;
  text = text.slice(0, at) + synthetic + text.slice(at);
  const result = transformFile(text, { file, devLogger, strings });
  let out = result.out;
  const bound = new Set([...importBindings(out).keys()]);
  const extra = [];
  out = out.replace(
    /(import\s+(?:type\s+)?\{)([^}]*)(\}\s*from\s*(["'])([^"']+)\4;?)/g,
    (whole, open, clause, close, _q, source) => {
      const specs = specifiersOf(clause);
      if (!specs.some((spec) => used.has(spec.text.split(/\s+as\s+/)[1]?.trim()))) return whole;
      const keep = [];
      for (const spec of specs) {
        const local = spec.text.split(/\s+as\s+/)[1]?.trim();
        const ns = local && used.get(local);
        if (!ns) {
          keep.push(spec.text);
          continue;
        }
        const element = (name) =>
          (out = out.replace(new RegExp(`(?<![\\w$.])${local}(?![\\w$])`, "g"), name));
        if (source === "@once-ui-system/core") {
          extra.push(() => element(`${ns.ns}.${spec.name}`));
        } else if (!bound.has(spec.name) || importBindings(src).get(spec.name)?.source === source) {
          keep.push(spec.name);
          extra.push(() => element(spec.name));
          result.hits.push(`<${ns.ns}.${ns.name}>: ${spec.name} imported from ${source}`);
        } else {
          keep.push(`${spec.name} as ${ns.ns}${spec.name}`);
          extra.push(() => element(`${ns.ns}${spec.name}`));
        }
      }
      const unique = [...new Set(keep)];
      if (!unique.length) return "\u0000";
      return `${open.slice(0, -1)}${braceList(unique, clause)}${close.slice(1)}`;
    },
  );
  for (const run of extra) run();
  // The synthetic import, and any statement left empty, go with their line.
  out = out.replace(/\n?\u0000/g, "");
  // Names imported twice now (a moved name the file also imported by name) are merged by the pass's own join.
  const warnings = result.warnings.map((w) => w.replace(/\b([\w$]+)__([A-Z][\w$]*)\b/g, "$1.$2"));
  const hits = result.hits.map((h) => h.replace(/\b([\w$]+)__([A-Z][\w$]*)\b/g, "$1.$2"));
  return { out, hits, warnings };
}

function transformFile(src, { file = null, devLogger = null, strings = true } = {}) {
  const hits = [];
  // Reports as { text, line }: a line is in the text the pass read, and is
  // carried on through each later pass's rewrite to the file written.
  const reports = [];
  let out = src;
  const run = (result, before) => {
    hits.push(...result.hits);
    for (const w of result.warnings) reports.push(splitLine(w));
    if (result.out !== before) {
      const map = lineMap(before, result.out);
      for (const r of reports) if (r.line !== null) r.line = map(r.line);
    }
    out = result.out;
  };
  // E/F3 first: Badge and Chip become Tag before the passes below read Tag.
  run(transformTone(out), out);
  run(transformElementType(out), out);
  run(rewriteDevImport(out, file, devLogger), out);
  run(rewriteExports(out), out);
  run(transformRenames(out), out);
  // D2–D5, after the renames above (it reads the 3.0 prop names).
  run(transformUnits(out, { file }), out);
  run(warnLocalSizes(out, { file }), out);
  run(transformDataStyle(out), out);
  // F1, F2, F4, F5: components that merged. Last, so the passes above read the
  // 2.x names they know; see the section below.
  run(transformMerges(out, { remProps: REM_PROPS, breakpointProps: BREAKPOINT_PROPS }), out);
  // G1, G4, G5: types, resets and aliases (./codemod-3.0-types.mjs). After
  // the merges, so it reads 3.0's component names.
  run(transformTypes(out), out);
  // G2: leaf components take LeafProps (./codemod-3.0-leaf.mjs); a dropped
  // prop moves to a Row or Column around the leaf where that renders the
  // same, and is reported otherwise. After the renames, on 3.0's names.
  run(transformLeaf(out), out);
  // B2, F9: import sources (./codemod-3.0-imports.mjs). Last, so a name the
  // merges produced (EmojiPickerDropdown → EmojiPicker) moves to its subpath.
  run(transformImports(out), out);
  // Strings that generate Once UI source: reported, never rewritten.
  if (strings && !/\.mdx$/.test(file ?? "")) run(reportCodeStrings(out), out);
  const warnings = reports.map((r) => (r.line === null ? r.text : `${r.text} (line ${r.line})`));
  return { out, hits, warnings };
}

/**
 * Code that writes Once UI source into a string (a generator, a scaffold, a
 * copy-to-clipboard sample built by concatenation): JSX in a string literal
 * that the codemod would still change, run on its own, is reported. Template
 * literals the passes above already migrated read as 3.0 and stay quiet.
 */
export function reportCodeStrings(src) {
  const warnings = [];
  const LITERAL = /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g;
  const code = src.replace(/\/\*[\s\S]*?\*\/|(^|[^:\\"'`])\/\/.*$/gm, (m) => m.replace(/[^\n]/g, " "));
  for (const m of code.matchAll(LITERAL)) {
    const raw = src.slice(m.index, m.index + m[0].length);
    if (!/<[A-Z][\w$]*(?:\.[A-Z][\w$]*)?[\s/>]/.test(raw)) continue;
    // A JSX attribute's own string (`label="<Tag>"`) is text, not source.
    if (/=\s*$/.test(src.slice(Math.max(0, m.index - 3), m.index)) && raw[0] !== "`") continue;
    const text = raw[0] === "`" ? raw.slice(1, -1) : raw.slice(1, -1).replace(/\\(["'\\])/g, "$1");
    let r;
    try {
      r = transform(text, { strings: false });
    } catch {
      continue;
    }
    if (r.out !== text && r.hits.length) {
      warnings.push(
        located(
          `a string holds 2.x Once UI source (${[...new Set(r.hits)].join("; ")}); if code is generated from it, update it to the 3.0 text`,
          src,
          m.index,
        ),
      );
      continue;
    }
    // An attribute the generator fills in (`variant="${v}"`, `width={${w}}`):
    // what it writes cannot be read, and these props changed meaning in 3.0.
    const filled = [...text.matchAll(/<([A-Z][\w$.]*)[^<>]*?\s([a-zA-Z]+)=(?:"\$\{|\{\$\{|\{\s*`?\$\{)/g)]
      .filter((x) => GENERATED_PROPS.has(x[2]))
      .map((x) => `<${x[1]}> ${x[2]}`);
    if (filled.length)
      warnings.push(
        located(
          `a string generates Once UI source with ${[...new Set(filled)].join(", ")} filled in by code; these changed in 3.0 (a variant tone is tone, a number is px not rem, handlers are onXChange): check what the generator writes`,
          src,
          m.index,
        ),
      );
  }
  return { out: src, hits: [], warnings };
}

/** Props whose 2.x values mean something else in 3.0, for generated source. */
const GENERATED_PROPS = new Set([
  "variant", "scheme", "color", "size", "speed", "onChange", "onToggle", "onSelect",
  "width", "height", "maxWidth", "minWidth", "maxHeight", "minHeight", "gap",
  "padding", "paddingX", "paddingY", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft",
  "margin", "marginX", "marginY", "marginTop", "marginRight", "marginBottom", "marginLeft",
]);

/** A5, C: the plain prop renames of TRANSFORMS, the REWRITES, and the FLAGGED reports. */
function transformRenames(src) {
  const hits = [];
  const warnings = [];
  let out = src;
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
          if (note && !flagNeedless(out, tag, a, attrs)) warnings.push(located(`<${tag}> ${a.name}: ${note}`, out, a.at));
          const range = DATE_FIELDS.has(tag) && (a.name === "onChange" || a.name === "onValueChange") ? rangeAnnotation(out, a) : null;
          if (range)
            warnings.push(
              located(
                `<${tag}> ${a.name}: the handler's parameter is typed ${range}; 3.0 passes a DateRange, whose startDate and endDate are unset until picked. ` +
                  'Type it DateRange (import { type DateRange } from "@once-ui-system/core") and check each date before using it',
                out,
                a.at,
              ),
            );
          const to = map[a.name];
          if (!to) continue;
          if (attrs.some((b) => b.name === to)) {
            // Both were set and the native one won in 2.x: the alias did nothing.
            edits.push({ at: withLeadingSpace(out, a.at), end: a.end, text: "", hit: `<${tag}> ${a.name} removed (${to} already set)` });
          } else {
            edits.push({ at: a.at, end: a.at + a.name.length, text: to, hit: `<${tag}> ${a.name} → ${to}` });
          }
        }
        const rewrite = REWRITES[tag]?.(out, attrs, out.slice(m.index, end + 1));
        if (rewrite) {
          for (const e of rewrite.edits) edits.push({ ...e, hit: `<${tag}> ${e.hit}` });
          for (const w of rewrite.warnings) warnings.push(located(`<${tag}> ${w}`, out, m.index));
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

// ─────────────────────────────────────────────────────────────────────────────
// F1, F2, F4, F5: components that merged
//
// Modal → Dialog variant="sheet"; Swiper → Carousel mode="snap";
// ScrollContainer and AutoScroll → Scroller (track mode, `auto`); InfoTip →
// Tooltip content; Hover and CursorCard → HoverCard placement="cover" |
// "cursor"; DropdownWrapper → Dropdown; ContextMenu → Dropdown
// openOn="contextmenu"; EmojiPickerDropdown → EmojiPicker trigger; UserMenu →
// User dropdown. The pass lives in ./codemod-3.0-merges.mjs, with the JSX
// scanner it needs to move children and attribute values between slots.
// ─────────────────────────────────────────────────────────────────────────────
export { MERGED_EXPORTS, transformMerges } from "./codemod-3.0-merges.mjs";
export { MOVED_IMPORTS, transformImports } from "./codemod-3.0-imports.mjs";

// Keep `literal` reachable for passes that read scale values (later rows).
export { literal, objectEntries };

/**
 * F8, F10: the packages this run made the app import, each with the files
 * that import it, so an app that generates other apps (one dependency list
 * per template or surface) can tell which lists need it.
 */
export function dependencyNote(install, dir = ".") {
  const lines = [...install].map(([name, list]) => {
    const rel = [...new Set(list)].map((f) => path.relative(dir, f) || f).sort();
    const shown = rel.length > 12 ? [...rel.slice(0, 12), `… ${rel.length - 12} more`] : rel;
    return `   ${name}: ${shown.join(", ")}`;
  });
  return (
    "Now imported, so add to your dependencies (imported by):\n" +
    `${lines.join("\n")}\n` +
    "   If the app generates other apps, add each package to the dependency list of every template that ships one of those files."
  );
}

/** The closing hint: the codemod keeps each rewrite on its line, so long lines are the formatter's to re-wrap. */
export function formatNote(files, dir = ".") {
  const n = files.length;
  return (
    `Run your formatter on the ${n} changed file${n === 1 ? "" : "s"} (npx biome format --write, or npx prettier --write): ` +
    "each rewrite stays on the line it was on, so a line that grew past the print width, and an import list a name left or joined, is re-wrapped there."
  );
}

const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  const [dir, ...flags] = process.argv.slice(2);
  if (!dir) {
    console.error("usage: codemod-3.0.mjs <dir> [--dry] [--force]");
    process.exit(1);
  }
  const dry = flags.includes("--dry");
  const files = [];
  const jsonFiles = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name === "node_modules" || e.name === ".next" || e.name === ".git" || e.name === "dist") continue;
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (/\.(tsx|jsx|mdx|ts|js|mjs)$/.test(e.name) && !e.name.endsWith(".d.ts")) files.push(p);
      else if (e.name.endsWith(".json") && !/^(package-lock|tsconfig.*|jsconfig)\.json$/.test(e.name)) jsonFiles.push(p);
    }
  })(dir);

  // On a 1.x tree the 2.x renames would land on the wrong names: stop first.
  const oneX = flags.includes("--force") ? null : detectOneX(dir, files);
  if (oneX) {
    console.error(`${ONE_X_MESSAGE}\n${oneX.map((r) => `   ${r}`).join("\n")}\n(--force runs it anyway)`);
    process.exit(1);
  }

  // The app's own development logger, when exactly one module exports `dev`.
  const loggers = files.filter((f) => {
    const text = fs.readFileSync(f, "utf8");
    return !/@once-ui-system\/core/.test(text) && /\bexport\s+const\s+dev\s*[:=]|\bexport\s*\{[^}]*\bdev\b[^}]*\}(?!\s*from)/.test(text);
  });
  const devLogger = loggers.length === 1 ? loggers[0] : null;

  let total = 0;
  let touched = 0;
  let flagged = 0;
  // Package → the files that now import it, so a generator's per-template
  // dependency lists can be updated from it.
  const install = new Map();
  // What this run rewrote, for the JSON strings that copy it.
  const rewritten = [];
  const changedFiles = [];
  const report = (f, out, hits, warnings) => {
    console.log(f);
    // One line per site, each with the line it is on, so none is fixed and its twin missed.
    for (const w of [...new Set(warnings)]) {
      const { text, line } = splitLine(w);
      console.log(`   ! ${line === null ? "" : `${f}:${line}  `}${text}  (fix by hand)`);
    }
    for (const h of [...new Set(hits)]) console.log(`   ${h}  ×${hits.filter((x) => x === h).length}`);
    flagged += new Set(warnings).size;
    if (hits.length) {
      touched++;
      total += hits.length;
      changedFiles.push(f);
      if (!dry) fs.writeFileSync(f, out);
    }
  };
  for (const f of files) {
    const src = fs.readFileSync(f, "utf8");
    const { out, hits, warnings } = transform(src, { file: f, devLogger });
    for (const name of packagesAdded(src, out)) install.set(name, [...(install.get(name) ?? []), f]);
    if (out !== src) rewritten.push({ src, out });
    if (!hits.length && !warnings.length) continue;
    report(f, out, hits, warnings);
  }
  // 2.x JSX copied into JSON strings (a scaffolder's anchors, templates).
  for (const f of jsonFiles) {
    if (fs.statSync(f).size > 4e6) continue;
    const src = fs.readFileSync(f, "utf8");
    const { out, hits, warnings } = transformJsonStrings(src, { transform: (s) => transform(s), rewritten });
    if (!hits.length && !warnings.length) continue;
    report(f, out, hits, warnings);
  }
  console.log(
    `\n${total} change${total === 1 ? "" : "s"} across ${touched} file${touched === 1 ? "" : "s"}` +
      (flagged ? `, ${flagged} to fix by hand` : "") +
      (dry ? " (dry run)" : ""),
  );
  // F8, F10: the effects and the blocks are packages of their own now.
  if (install.size) console.log(dependencyNote(install, dir));
  // Each rewrite keeps the line it was on: a formatter re-wraps what grew.
  if (touched && !dry) console.log(formatNote(changedFiles, dir));
}
