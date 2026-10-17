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
import { transformMerges } from "./codemod-3.0-merges.mjs";

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

/**
 * Exports 3.0 renamed: old → new. A1, G6. A lower-case name is a function:
 * every reference to it in the file is renamed (a file that imports
 * `generateMetadata` cannot also declare its own, so none of them is Next's).
 */
const RENAMED_EXPORTS = { Particle: "ParticleFx", generateMetadata: "createMetadata" };

/** Exports 3.0 removed with no drop-in replacement: name → what to do. A3, A6. */
const REMOVED_EXPORTS = {
  BaseBreakpointProps: "removed; use FlexBreakpointProps, GridBreakpointProps or TextBreakpointProps",
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
    "internal in 3.0; use SmartLink for a link, Button or IconButton for an action, or a plain <a>/<button>",
  InteractiveDetails:
    "internal in 3.0; use the `label` and `description` props of Checkbox, RadioButton or Switch",
  InteractiveDetailsProps: "internal in 3.0; use React.ComponentProps<typeof Checkbox>",
  Toaster: "internal in 3.0; ToastProvider renders it, show toasts with useToast()",
  Arrow: "internal in 3.0; use Button's `arrowIcon` or Tag's `arrow`",
  ArrowNavigation:
    "internal in 3.0; use the useArrowNavigation hook on your own container (pass containerRef, call handleKeyDown from onKeyDown)",
  ArrowNavigationProps: "internal in 3.0; use ArrowNavigationOptions with the useArrowNavigation hook",
  useArrowNavigationContext: "internal in 3.0; useArrowNavigation returns focusedIndex and setFocusedIndex",
  withArrowNavigation: "internal in 3.0; use the useArrowNavigation hook",
  DialogProvider: "removed in 3.0; Dialog stacks without it (the codemod unwraps <DialogProvider>)",
  dev: "internal in 3.0; log behind a process.env.NODE_ENV check of your own",
  getLastOpenedDropdown: "internal in 3.0; dropdowns close each other on their own",
  setLastOpenedDropdown: "internal in 3.0; dropdowns close each other on their own",
  clearLastOpenedDropdown: "internal in 3.0; dropdowns close each other on their own",
  MissingDependency: "internal in 3.0 (the fallback a component renders when its optional peer is missing)",
  escapeHtml: "internal in 3.0; escape with a library of your own",
  safeScriptJson: "internal in 3.0; Schema and ThemeInit use it, serialise script JSON yourself",
  sanitizeHref: "internal in 3.0; SmartLink and Button use it, validate hrefs yourself",
};

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
    return `${keyword} ${typeOnly ? "type " : ""}{ ${text.join(", ")} } from ${q}${source}${q}${end}`;
  });
  for (const name of unwrap) {
    const before = out;
    // A fragment, not nothing: the wrapper may hold several children.
    out = out.replace(new RegExp(`<${name}\\s*>`, "g"), "<>").replace(new RegExp(`</${name}\\s*>`, "g"), "</>");
    if (out !== before) hits.push(`<${name}> unwrapped`);
    if (new RegExp(`\\b${name}\\b`).test(out))
      warnings.push(`${name}: ${REMOVED_EXPORTS[name]}; a use left in place needs removing by hand`);
  }
  for (const [from, to] of renamedLocals) {
    if (/^[a-z]/.test(from)) {
      out = out.replace(new RegExp(`(?<![.\\w$])${from}(?![\\w$])`, "g"), to);
      continue;
    }
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

/** A one-second ceiling: a duration literal under 50 was written as seconds, one over 1000 as ms. */
const SECONDS_BELOW = 50;
const MS_FROM = 1000;

const NUMBER = /^-?(\d+\.?\d*|\.\d+)$/;
const STRING = /^(["'])(?:\\.|(?!\1).)*\1$|^`[^`]*`$/;
const CONSTANT = /^(undefined|null|true|false)$/;

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

/** Skip a string or comment starting at `i`; the index after it, or `i` when there is none. */
function skipLexeme(text, i) {
  const c = text[i];
  if (c === '"' || c === "'" || c === "`") {
    let j = i + 1;
    while (j < text.length && !(text[j] === c && text[j - 1] !== "\\")) j++;
    return j + 1;
  }
  if (c === "/" && text[i + 1] === "/") {
    const nl = text.indexOf("\n", i);
    return nl < 0 ? text.length : nl;
  }
  if (c === "/" && text[i + 1] === "*") {
    const close = text.indexOf("*/", i + 2);
    return close < 0 ? text.length : close + 2;
  }
  return i;
}

/** `text` with its offsets, trimmed of whitespace and of parentheses around all of it. */
function trimmed(expr, at, end) {
  for (;;) {
    while (at < end && /\s/.test(expr[at])) at++;
    while (end > at && /\s/.test(expr[end - 1])) end--;
    if (expr[at] !== "(" || expr[end - 1] !== ")" || closing(expr, at) !== end - 1) return { at, end };
    at++;
    end--;
  }
}

/** The index of the bracket that closes the one at `i`. */
function closing(expr, i) {
  let depth = 0;
  for (let j = i; j < expr.length; j++) {
    const past = skipLexeme(expr, j);
    if (past !== j) {
      j = past - 1;
      continue;
    }
    if ("([{".includes(expr[j])) depth++;
    else if (")]}".includes(expr[j]) && --depth === 0) return j;
  }
  return -1;
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

/**
 * The entries of an object literal `{ … }` that starts at `text[0]`: each
 * key with the offsets of its value. A spread, a computed key or a method is
 * reported as `opaque` beside the entries that could be read.
 */
export function objectEntries(text) {
  const entries = [];
  let opaque = false;
  let i = 1;
  const end = text.length - 1;
  while (i < end) {
    const past = skipLexeme(text, i);
    if (past !== i && !/["'`]/.test(text[i])) {
      i = past;
      continue;
    }
    if (/[\s,]/.test(text[i])) {
      i++;
      continue;
    }
    let key;
    if (/["']/.test(text[i])) {
      const close = skipLexeme(text, i);
      key = text.slice(i + 1, close - 1);
      i = close;
    } else if (/[A-Za-z_$]/.test(text[i])) {
      let j = i;
      while (j < end && /[\w$]/.test(text[j])) j++;
      key = text.slice(i, j);
      i = j;
    } else {
      opaque = true; // `...spread` or `[computed]`
      key = null;
    }
    while (i < end && /\s/.test(text[i])) i++;
    let valueAt = i;
    if (key !== null && text[i] === ":") valueAt = i + 1;
    else if (key !== null && (text[i] === "," || i >= end)) {
      entries.push({ key, value: key, at: valueAt - key.length, end: valueAt, shorthand: true });
      continue;
    } else if (key !== null) opaque = true; // a method or a getter
    let j = valueAt;
    let depth = 0;
    while (j < end) {
      const skip = skipLexeme(text, j);
      if (skip !== j) {
        j = skip;
        continue;
      }
      const c = text[j];
      if ("([{".includes(c)) depth++;
      else if (")]}".includes(c)) depth--;
      else if (c === "," && depth === 0) break;
      j++;
    }
    if (key !== null && text[valueAt - 1] === ":") {
      let a = valueAt;
      let b = j;
      while (a < b && /\s/.test(text[a])) a++;
      while (b > a && /\s/.test(text[b - 1])) b--;
      entries.push({ key, value: text.slice(a, b), at: a, end: b });
    }
    i = j + 1;
  }
  return { entries, opaque };
}

/** The element names in this file that mean Once UI's `tag` (see localNamesFor). */
function namesFor(tag, bindings, isCore) {
  const aliases = [];
  for (const [local, { source, canonical }] of bindings) if (canonical === tag && isCore(source)) aliases.push(local);
  if (aliases.length) return aliases;
  return bindings.has(tag) ? [] : [tag];
}

/**
 * Rewrite the literal numbers of one value (`{…}` contents, or an object
 * entry's value) in a unit kind. `push` receives edits relative to `base`.
 */
function rewriteValue(kind, expr, base, label, push, warn) {
  const found = literalNumbers(expr);
  if (found.opaque) {
    if (kind === "px" || kind === "px!") return;
    const unit = kind === "s" ? "seconds (now milliseconds)" : `${kind} (now px)`;
    const fix =
      kind === "s" ? "multiply it by 1000" : `write {\`\${${expr.trim()}}${kind}\`} or convert it to px`;
    warn(`${label}={${expr.trim()}}: a number here was ${unit}; if this value is a number, ${fix}`);
    return;
  }
  for (const s of found.spans) {
    const r = convertNumber(kind, s.text);
    if (!r) continue;
    if (r.warn) warn(`${label}: ${r.warn}`);
    else push({ at: base + s.at, end: base + s.end, text: r.text, quoted: r.quoted, kind, label });
  }
}

/** Walk `paths` (`{ "bulge.duration": "s" }`) into an inline object literal. */
function rewriteObject(paths, raw, base, label, push, warn) {
  const { entries, opaque } = objectEntries(raw);
  const wanted = Object.keys(paths);
  const heads = new Set(wanted.map((p) => p.split(".")[0]));
  for (const e of entries) {
    if (!heads.has(e.key)) continue;
    const leaf = paths[e.key];
    if (leaf) {
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
 * D2 on the file's own components: a wrapper defined here or imported from a
 * relative path often hands its size props on to a Once UI Flex (`{...flex}`),
 * where a 2.x number was rem. Whether it does cannot be seen from the call,
 * so a literal number is reported, not rewritten. Only in files that import
 * Once UI, so MDX (whose elements are Once UI's) and unrelated files stay quiet.
 */
export function warnLocalSizes(src, { isCore = isCoreSource } = {}) {
  const warnings = [];
  const bindings = importBindings(src);
  if (![...bindings.values()].some((b) => isCore(b.source))) return { warnings };
  const element = /<([A-Z][\w]*)(?=[\s/>])/g;
  let m;
  while ((m = element.exec(src))) {
    const name = m[1];
    const bound = bindings.get(name);
    if (bound ? !bound.source.startsWith(".") || isCore(bound.source) : LAYOUT_COMPONENTS.has(name)) continue;
    const from = m.index + name.length + 1;
    const end = openingTagEnd(src, from);
    if (end < 0) continue;
    for (const a of attributesOf(src, from, end)) {
      if (!REM_PROPS.has(a.name) || a.value === null || !/^\{\s*-?\d/.test(String(a.value))) continue;
      const n = String(a.value).slice(1, -1).trim();
      if (!/^-?\d+(\.\d+)?$/.test(n) || Number(n) === 0) continue;
      warnings.push(
        `<${name}> ${a.name}={${n}}: if ${name} passes ${a.name} on to a Once UI component, this was ${n}rem in 2.x and is ${n}px in 3.0; write "${n}rem" to keep the size`,
      );
    }
  }
  return { warnings };
}

/**
 * D2 in config: the chart height in a `dataStyle: { height: 24 }` object
 * (once-ui.config's chart defaults, handed to DataThemeProvider) was rem.
 */
export function transformDataStyle(src) {
  const hits = [];
  const warnings = [];
  const edits = [];
  const key = /\bdataStyle\s*:\s*\{/g;
  let m;
  while ((m = key.exec(src))) {
    const at = m.index + m[0].length - 1;
    const end = closing(src, at);
    if (end < 0) continue;
    const { entries } = objectEntries(src.slice(at, end + 1));
    for (const e of entries) {
      if (e.key !== "height" || e.shorthand) continue;
      const found = literalNumbers(e.value);
      if (found.opaque) {
        warnings.push(`dataStyle.height: ${e.value}: a number here was rem (now px); if it is a number, write it as "Nrem"`);
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
export function transformUnits(src, { isCore = isCoreSource } = {}) {
  const hits = [];
  const warnings = [];
  const edits = [];
  const bindings = importBindings(src);
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
            hit: `<${tag}> ${e.label}: ${e.kind === "s" ? "seconds → ms" : `number → "${e.kind.replace("!", "")}" string`}`,
          });
        const warn = (w) => warnings.push(`<${tag}> ${w}`);
        for (const a of attrs) {
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
              if (!CONSTANT.test(body)) warn(`${a.name}={${body}}: numeric sizes and spacing in it were rem and are px now`);
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
          rewriteValue(kind, inner, valueAt + 1, a.name, push, warn);
        }

        // D5: `speed` that was a length of time.
        const rename = SPEED_RENAMES[tag];
        const speed = attrs.find((a) => a.name === "speed");
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
            if (rename.keywords && !NUMBER.test(expr))
              warn(`${rename.to}={${expr}}: milliseconds now; a 2.x keyword was "fast" 1000, "medium" 2000, "slow" 3000`);
          }
        }
        if (tag === "ParticleFx" && speed && !(speed.value && literal(speed.value))) warn(PARTICLE_SPEED);
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
    } else if (!v) {
      const expr = expressionOf(variant.value);
      const span = valueSpan(src, variant);
      for (const s of stringLiterals(String(variant.value))) {
        if (s.value === "quaternary")
          push({ at: span.at + s.at, end: span.at + s.end, text: `${s.q}ghost${s.q}`, hit: 'variant "quaternary" → "ghost"' });
      }
      const tones = stringLiterals(expr).filter((s) => BUTTON_TONES.has(s.value));
      if (tones.length || !stringLiterals(expr).length)
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
 * the old key anywhere, since its entries may be the ones defined here.
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
  if (new RegExp(`\\b${key}\\s*:`).test(src)) warn(`${prop}={${body}}: ${note}`);
}

const TIMELINE_STATE = (value) => {
  const v = literal(value);
  if (v === "default") return { text: "", remove: true, hit: 'state: "default" removed (no tone)' };
  if (v === "active") return { text: `tone: ${quote(value)}brand${quote(value)}`, hit: 'state: "active" → tone: "brand"' };
  if (v === "success" || v === "danger") return { text: `tone: ${value}`, hit: `state: "${v}" → tone` };
  return undefined;
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
    return `${keyword} ${typeOnly ?? ""}{ ${out.join(", ")} } ${tail}`;
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
          if (added.length) edits.push({ at: from, end: from, text: ` ${added.join(" ")}`, hit: `<${tag}> + ${added.join(" ")}` });
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
      const code = out
        .replace(/import[^;]*;/g, "")
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/(^|[^:])\/\/[^\n]*/g, "$1");
      const reference = new RegExp(`(?:[{(\\[,=:?]\\s*|\\btypeof\\s+)${tag}\\b|\\b${tag}\\s*[,})\\].]`);
      if (bound && isCore(bound.source) && reference.test(code))
        warnings.push(`${tag}: removed in 3.0, use Tag; a reference left in place needs renaming by hand`);
    }
  }

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
        const warn = (w) => warnings.push(`<${tag}> ${w}`);
        for (const [old, to] of Object.entries(TONE_RENAMES[tag] ?? {})) {
          const a = attrs.find((x) => x.name === old);
          if (!a) continue;
          if (attrs.some((b) => b.name === to)) push({ at: withLeadingSpace(out, a.at), end: a.end, text: "", hit: `${old} removed (${to} already set)` });
          else push({ at: a.at, end: a.at + old.length, text: to, hit: `${old} → ${to}` });
        }
        if (tag === "Button" || tag === "IconButton") rewriteButton(out, attrs, tag, push, warn);
        if (tag === "Tag") rewriteTagScheme(out, attrs, push, warn);
        if (tag === "LinearGauge" || tag === "RadialGauge") rewriteGauge(out, attrs, push, warn);
        if (tag === "Timeline")
          rewriteInlineKeys(out, attrs, "items", "state", TIMELINE_STATE, push, warn, 'items[].state is items[].tone in 3.0 ("active" is "brand", "default" is no tone)');
        if (tag === "Table")
          rewriteInlineKeys(out, attrs, "actions", "variant", TABLE_ACTION_VARIANT, push, warn, 'actions[].variant "danger" is variant: "primary", tone: "danger" in 3.0');
        if (tag === "Scrubber")
          rewriteInlineKeys(out, attrs, "tracks", "scheme", RENAME_KEY("tone", "scheme → tone"), push, warn, "tracks[].scheme and blocks[].scheme are tone in 3.0");
        if (tag === "Avatar")
          rewriteInlineKeys(out, attrs, "statusIndicator", "color", RENAME_KEY("scheme", "statusIndicator.color → scheme"), push, warn, "statusIndicator.color is statusIndicator.scheme in 3.0");
      }
    }
  }
  out = applyEdits(out, edits, hits);

  // E1: `addToast({ variant })` → `addToast({ tone })`, in files that show toasts.
  if (/\buse(?:Optional)?Toast\b/.test(out) && /\baddToast\b/.test(out)) {
    const toastEdits = [];
    const call = /\baddToast\s*(?:\?\.)?\(\s*/g;
    let m;
    while ((m = call.exec(out))) {
      const argAt = m.index + m[0].length;
      if (out[argAt] !== "{") {
        if (out[argAt] !== ")") warnings.push("addToast(…): its `variant` is `tone` in 3.0; rename the key where the object is built");
        continue;
      }
      const close = closing(out, argAt);
      if (close < 0) continue;
      const body = out.slice(argAt, close + 1);
      const { entries } = objectEntries(body);
      for (const e of entries) {
        if (e.key !== "variant" || e.shorthand) continue;
        const keyAt = body.lastIndexOf("variant", e.at);
        toastEdits.push({ at: argAt + keyAt, end: argAt + keyAt + "variant".length, text: "tone", hit: "addToast variant → tone" });
      }
      if (entries.some((e) => e.key === "variant" && e.shorthand))
        warnings.push("addToast({ variant }): rename it `tone: variant`, the key is tone in 3.0");
    }
    out = applyEdits(out, toastEdits, hits);
  }
  return { out, hits, warnings };
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

export function transform(src) {
  // E/F3 first: Badge and Chip become Tag before the passes below read Tag.
  const tone = transformTone(src);
  const exp = rewriteExports(tone.out);
  const hits = [...tone.hits, ...exp.hits];
  const warnings = [...tone.warnings, ...exp.warnings];
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
  // D2–D5, after the renames above (it reads the 3.0 prop names).
  const units = transformUnits(out);
  out = units.out;
  hits.push(...units.hits);
  warnings.push(...units.warnings);
  warnings.push(...warnLocalSizes(out).warnings);
  const config = transformDataStyle(out);
  out = config.out;
  hits.push(...config.hits);
  warnings.push(...config.warnings);
  // F1, F2, F4, F5: components that merged. Last, so the passes above read the
  // 2.x names they know; see the section below.
  const merges = transformMerges(out);
  out = merges.out;
  hits.push(...merges.hits);
  warnings.push(...merges.warnings);
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
