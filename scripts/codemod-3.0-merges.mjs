/**
 * Once UI 2.x → 3.0 codemod: components that merged (F1, F2, F4, F5).
 *
 * Eleven exports folded into the component that survives them:
 *
 *   Modal               → <Dialog variant="sheet">
 *   Swiper              → <Carousel mode="snap">
 *   ScrollContainer     → <Scroller> track mode; `items` → children, tile props → `tile`
 *   AutoScroll          → <Scroller auto={{ speed, hover, reverse, gap }}>
 *   InfoTip             → <Tooltip content="…" />
 *   Hover               → <HoverCard placement="cover">; `overlay` → children
 *   CursorCard          → <HoverCard placement="cursor">; `overlay` → children,
 *                         `placement` → `cursorPlacement`
 *   DropdownWrapper     → <Dropdown>; `dropdown` → children
 *   ContextMenu         → <Dropdown openOn="contextmenu">; children → `trigger`,
 *                         `dropdown` → children
 *   EmojiPickerDropdown → <EmojiPicker trigger>; Dropdown-only props → `dropdownProps`
 *   UserMenu            → <User dropdown>
 *
 * And twelve more, with 2.x Table's `data` shape (F6):
 *
 *   DataTable           → <Table> (its API under the short name)
 *   Table data={{ headers, rows }} → <Table columns rows>; a header's `content`
 *                         is `header`, array rows are read by position;
 *                         `defaultPageSize` / `pageSizeOptions` → `defaultPerPage` /
 *                         `perPageOptions`; row callbacks take `(row, index)`
 *   DateRangePicker     → <DatePicker range>, `dual` → `months={2}`
 *   DateRangeInput      → <DateInput range>
 *   RangeSlider         → <Slider range>
 *   PasswordInput       → <Input type="password"> (the eye toggle is Input's)
 *   KeyTip              → <Kbd keys>
 *   MasonryGrid         → <Grid masonry>
 *   Pulse               → <StatusIndicator pulse>
 *   FadingLettersFx     → <TypeFx mode="fade">; `text` → `words`,
 *                         `animationState` → `state`, `messageIdx` → `delay`
 *   SettingAxes         → <Setting axes>; SettingGroup → <Setting control open>
 *   MobileMegaMenu      → <MegaMenu collapseBelow="always">
 *
 * Each rewrite is exact: the migrated element renders what the 2.x one did.
 * What cannot be seen from the source (a spread whose keys decide where they
 * belong, an old name still used as a value or a type) is reported instead.
 *
 * It runs after the other 3.0 passes, so those read the 2.x names they know
 * (the units pass converts DropdownWrapper's rem `minWidth`, say), and it
 * renames the imports last. Idempotent: a second run finds no old name.
 *
 * This module has its own JSX scanner rather than the 2.0 one, because these
 * rewrites move whole children and attribute values around: it must find the
 * end of an element whose text holds apostrophes (`<Text>Don't</Text>`),
 * nested elements of the same name, fragments and expressions with JSX in them.
 */
import {
  importBindings,
  isCoreSource,
  localNamesFor,
  specifiersOf,
  withLeadingSpace,
} from "./codemod-2.0.mjs";
import { addToCoreImport, braceList, codeOnly, located, removeFromCoreImport } from "./codemod-3.0-format.mjs";

// ─── A small JSX-aware scanner ──────────────────────────────────────────────

const CLOSE = { "(": ")", "[": "]", "{": "}" };

/** The last non-space character before `i`, and the word that ends there. */
function before(src, i) {
  let j = i - 1;
  while (j >= 0 && /\s/.test(src[j])) j--;
  const char = j >= 0 ? src[j] : "";
  let k = j;
  while (k >= 0 && /[\w$]/.test(src[k])) k--;
  return { char, word: src.slice(k + 1, j + 1) };
}

/** Whether the `<` at `i` opens a JSX element (not a comparison or a type argument). */
function isJsxStart(src, i) {
  if (src[i] !== "<" || !/[A-Za-z>]/.test(src[i + 1] ?? "")) return false;
  const { char, word } = before(src, i);
  if (char === "" || "([{,?:=&|!>;}".includes(char)) return true;
  return /^(return|yield|default|case|in|of|else|do)$/.test(word);
}

/** The index after the token at `i`: a string, template, comment, bracket group or JSX element. */
function skipToken(src, i) {
  const c = src[i];
  if (c === '"' || c === "'") {
    let j = i + 1;
    while (j < src.length && src[j] !== c) j += src[j] === "\\" ? 2 : 1;
    return j + 1;
  }
  if (c === "`") {
    let j = i + 1;
    while (j < src.length && src[j] !== "`") {
      if (src[j] === "\\") j += 2;
      else if (src[j] === "$" && src[j + 1] === "{") j = skipGroup(src, j + 1);
      else j++;
    }
    return j + 1;
  }
  if (c === "/" && src[i + 1] === "/") {
    const j = src.indexOf("\n", i);
    return j < 0 ? src.length : j;
  }
  if (c === "/" && src[i + 1] === "*") {
    const j = src.indexOf("*/", i + 2);
    return j < 0 ? src.length : j + 2;
  }
  if (CLOSE[c]) return skipGroup(src, i);
  if (c === "<" && isJsxStart(src, i)) return elementEnd(src, i);
  return i + 1;
}

/** The index after the bracket that closes the one at `i`. */
function skipGroup(src, i) {
  const close = CLOSE[src[i]];
  let j = i + 1;
  while (j < src.length && src[j] !== close) j = skipToken(src, j);
  return j + 1;
}

/**
 * The opening tag at `lt`: its name, attributes (with raw values and
 * offsets), spreads, where it ends and whether it closes itself.
 */
export function parseTag(src, lt) {
  let i = lt + 1;
  let j = i;
  while (j < src.length && /[\w$.:-]/.test(src[j])) j++;
  const name = src.slice(i, j);
  const attrs = [];
  i = j;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (c === "/" && (src[i + 1] === "/" || src[i + 1] === "*")) {
      i = skipToken(src, i);
      continue;
    }
    if (c === ">") return { name, nameEnd: lt + 1 + name.length, attrs, gt: i, selfClosing: false };
    if (c === "/" && src[i + 1] === ">")
      return { name, nameEnd: lt + 1 + name.length, attrs, gt: i + 1, slash: i, selfClosing: true };
    if (c === "{") {
      const end = skipGroup(src, i);
      attrs.push({ name: null, spread: true, at: i, end, value: src.slice(i, end) });
      i = end;
      continue;
    }
    let k = i;
    while (k < src.length && /[\w$:.-]/.test(src[k])) k++;
    if (k === i) {
      i++;
      continue;
    }
    const attrName = src.slice(i, k);
    let v = k;
    while (/\s/.test(src[v] ?? "")) v++;
    if (src[v] === "=") {
      v++;
      while (/\s/.test(src[v])) v++;
      const end = src[v] === "{" ? skipGroup(src, v) : skipToken(src, v);
      attrs.push({ name: attrName, at: i, end, value: src.slice(v, end) });
      i = end;
    } else {
      attrs.push({ name: attrName, at: i, end: k, value: null });
      i = k;
    }
  }
  return null;
}

/** The index after the element whose `<` is at `lt`, closing tag included. */
export function elementEnd(src, lt) {
  if (src[lt + 1] === ">") return childrenEnd(src, lt + 2).after;
  const tag = parseTag(src, lt);
  if (!tag) return src.length;
  if (tag.selfClosing) return tag.gt + 1;
  return childrenEnd(src, tag.gt + 1).after;
}

/** Where the children starting at `i` end (`at`, the closing tag's `<`) and the index after it. */
function childrenEnd(src, i) {
  let j = i;
  while (j < src.length) {
    const c = src[j];
    if (c === "{") {
      j = skipGroup(src, j);
      continue;
    }
    if (c === "<") {
      if (src[j + 1] === "/") {
        const gt = src.indexOf(">", j);
        return { at: j, after: gt < 0 ? src.length : gt + 1 };
      }
      if (/[A-Za-z>]/.test(src[j + 1] ?? "")) {
        j = elementEnd(src, j);
        continue;
      }
    }
    j++;
  }
  return { at: src.length, after: src.length };
}

/**
 * The top-level entries of an array literal `[a, b]`, as trimmed source, or
 * null when it is not an inline array (or holds a spread, which hides its
 * entries).
 */
export function arrayEntries(text) {
  const t = text.trim();
  if (!t.startsWith("[") || skipGroup(t, 0) !== t.length) return null;
  const entries = [];
  let start = 1;
  let i = 1;
  while (i < t.length - 1) {
    if (t[i] === ",") {
      entries.push(t.slice(start, i).trim());
      start = i + 1;
      i++;
      continue;
    }
    i = skipToken(t, i);
  }
  entries.push(t.slice(start, t.length - 1).trim());
  const list = entries.filter(Boolean);
  return list.some((e) => e.startsWith("...")) ? null : list;
}

// ─── Values ─────────────────────────────────────────────────────────────────

/** An attribute's value as a JS expression: `"x"` stays a string, `{e}` is `e`, a bare name is `true`. */
const expressionOf = (attr) => {
  if (attr.value === null) return "true";
  const v = attr.value.trim();
  if (v.startsWith("{")) return v.slice(1, -1).trim();
  // A JSX attribute string has no escapes; as a JS string its backslashes would be read as escapes.
  return v.includes("\\") ? JSON.stringify(v.slice(1, -1)) : v;
};

/** Whether `expr` is exactly one JSX element or fragment. */
const isOneElement = (expr) => {
  const t = expr.trim();
  return t.startsWith("<") && elementEnd(t, 0) === t.length;
};

/** `expr` as a JSX child: an element as it is (a fragment's contents), anything else in braces. */
const asChild = (expr) => {
  const t = expr.trim();
  if (!isOneElement(t)) return `{${t}}`;
  return t.startsWith("<>") && t.endsWith("</>") ? t.slice(2, -3) : t;
};

/** JSX children as one expression: an element, `{e}`'s `e`, or a fragment around the rest. */
function childrenAsExpression(children) {
  const t = children.trim();
  if (!t) return null;
  if (isOneElement(t)) return t;
  if (t.startsWith("{") && skipGroup(t, 0) === t.length) return t.slice(1, -1).trim();
  // Plain text, without entities (`&amp;`), which only JSX text decodes.
  if (!/[<{&]/.test(t)) return JSON.stringify(t.replace(/\s+/g, " "));
  return `<>${children}</>`;
}

/** An object literal from `[key, attr]` pairs: `{ speed: "slow", reverse: true }`. */
const objectOf = (pairs) =>
  `{ ${pairs.map(([key, attr]) => `${key}: ${expressionOf(attr)}`).join(", ")} }`;

// ─── The merges ─────────────────────────────────────────────────────────────

/** Old export → the one it folded into. */
export const MERGED_EXPORTS = {
  Modal: "Dialog",
  Swiper: "Carousel",
  ScrollContainer: "Scroller",
  AutoScroll: "Scroller",
  InfoTip: "Tooltip",
  Hover: "HoverCard",
  CursorCard: "HoverCard",
  DropdownWrapper: "Dropdown",
  ContextMenu: "Dropdown",
  EmojiPickerDropdown: "EmojiPicker",
  UserMenu: "User",
  DataTable: "Table",
  DateRangePicker: "DatePicker",
  DateRangeInput: "DateInput",
  RangeSlider: "Slider",
  PasswordInput: "Input",
  KeyTip: "Kbd",
  MasonryGrid: "Grid",
  Pulse: "StatusIndicator",
  FadingLettersFx: "TypeFx",
  SettingAxes: "Setting",
  SettingGroup: "Setting",
  MobileMegaMenu: "MegaMenu",
};

/** Old type export → the survivor's, or a note when there is no one-for-one type. */
const MERGED_TYPES = {
  ModalProps: "DialogProps",
  ScrollContainerProps: "ScrollerProps",
  HoverProps: "HoverCardProps",
  CursorCardProps: "HoverCardProps",
  DropdownWrapperProps: "DropdownProps",
  ContextMenuProps: "DropdownProps",
  EmojiPickerDropdownProps: "EmojiPickerProps",
  InfoTipProps: "TooltipProps",
  DataTableProps: "TableProps",
  DataTableColumn: "TableColumn",
  DataTableSort: "TableSort",
  DataTableLabels: "TableLabels",
  DateRangePickerProps: "DatePickerProps",
  RangeSliderProps: "SliderProps",
  KeyTipProps: "KbdProps",
  FadingLettersFxProps: "TypeFxProps",
  SettingAxesProps: "SettingProps",
  SettingGroupProps: "SettingProps",
  MobileMegaMenuProps: "MegaMenuProps",
};

const TYPE_NOTES = {
  ScrollContainerControlPlacement: 'removed; use ScrollerProps["controlPlacement"]',
  DropdownProps:
    "now the props of the trigger-and-panel Dropdown (2.x DropdownWrapperProps); the 2.x panel's props are internal",
  TableHeader: "removed; a 2.x header is a TableColumn with `header` for `content`",
  TableProps:
    "now the props of the columns/rows Table (2.x DataTableProps), generic over the row: TableProps<Row>",
  TableAction: "its onClick and disabled now receive (row, index); 2.x passed the index alone",
  AnimationState: 'removed with FadingLettersFx; use TypeFxProps["state"]',
};

/** ScrollContainer's own options, which stay on the element; the rest were tile props. */
const TRACK_OPTIONS = new Set([
  "controlPlacement",
  "infinite",
  "markers",
  "draggable",
  "step",
  "clip",
  "proximity",
  "active",
  "onActiveChange",
]);

/** The 3.0 units pass's rem props, handed in by transformMerges' caller. */
let UNITS = { rem: new Set(), breakpoints: new Set() };

/**
 * `const NAME = { … }` declared once in `src`, a plain object literal, and
 * named nowhere else but in one spread: `{ at, entries }` (offsets of the
 * entries are from `at`), else null.
 */
function tileConst(src, name) {
  const decl = new RegExp(`(^|[\\s;])const\\s+${name}\\s*(?::[^=]+)?=\\s*(?=\\{)`, "g");
  const found = [...src.matchAll(decl)];
  if (found.length !== 1) return null;
  if (/\bexport\s+$/.test(src.slice(Math.max(0, found[0].index - 20), found[0].index + found[0][1].length)))
    return null;
  const at = found[0].index + found[0][0].length;
  const close = skipGroup(src, at);
  const lit = objectLiteral(src.slice(at, close));
  if (!lit || lit.opaque || lit.entries.some((e) => !e.key)) return null;
  const uses = codeOnly(src, { jsxText: true }).match(new RegExp(`(?<![\\w$])(?<![^.]\\.)${name}(?![\\w$])`, "g"))?.length ?? 0;
  if (uses !== 2) return null;
  return { at, entries: lit.entries };
}

/**
 * Edits that turn the 2.x rem numbers of an object entry into rem strings,
 * as the units pass does on attributes: `minWidth: 20` → `minWidth: "20rem"`,
 * and inside a breakpoint object.
 */
function remEdits(entry, base, key) {
  const v = entry.value.trim();
  const valueAt = base + entry.valueAt;
  if (UNITS.rem.has(key) && /^-?\d+(\.\d+)?$/.test(v)) {
    const lead = entry.value.length - entry.value.trimStart().length;
    return [{ at: valueAt + lead, end: valueAt + lead + v.length, text: `"${v}rem"` }];
  }
  if (UNITS.breakpoints.has(key)) {
    const lit = objectLiteral(entry.value);
    if (!lit) return [];
    return lit.entries.filter((e) => e.key).flatMap((e) => remEdits(e, valueAt, e.key).filter((x) => UNITS.rem.has(e.key)));
  }
  return [];
}

/** EmojiPicker's own props in trigger mode; the rest of EmojiPickerDropdown's went to its DropdownWrapper. */
const EMOJI_OWN = new Set([
  "trigger",
  "onSelect",
  "closeAfterClick",
  "background",
  "columns",
  "open",
  "onOpenChange",
  "placement",
  "key",
  "ref",
]);

/** The entries of an object literal `{ a: 1, b }`, with offsets into `text`; null when not one. */
function objectLiteral(text) {
  const t = text;
  let s0 = 0;
  while (/\s/.test(t[s0] ?? "")) s0++;
  if (t[s0] !== "{" || skipGroup(t, s0) !== t.trimEnd().length) return null;
  const close = skipGroup(t, s0) - 1;
  const entries = [];
  let opaque = false;
  let start = s0 + 1;
  let i = start;
  const push = (from, to) => {
    let a = from;
    let b = to;
    while (a < b && /\s/.test(t[a])) a++;
    while (b > a && /\s/.test(t[b - 1])) b--;
    if (a === b) return;
    const seg = t.slice(a, b);
    const m = /^([A-Za-z_$][\w$]*|"[^"]*"|'[^']*')\s*:\s*/.exec(seg);
    // `{ rows }`: shorthand, the entry is the name's value.
    if (!m && /^[A-Za-z_$][\w$]*$/.test(seg)) {
      entries.push({ key: seg, at: a, keyEnd: b, valueAt: a, end: b, value: seg, shorthand: true });
      return;
    }
    if (!m) {
      opaque = true;
      entries.push({ key: null, at: a, end: b, keyEnd: a, valueAt: a, value: seg });
      return;
    }
    const key = m[1].replace(/^["']|["']$/g, "");
    entries.push({
      key,
      at: a,
      keyEnd: a + m[1].length,
      valueAt: a + m[0].length,
      end: b,
      value: t.slice(a + m[0].length, b),
    });
  };
  while (i < close) {
    if (t[i] === ",") {
      push(start, i);
      start = i + 1;
      i++;
      continue;
    }
    i = skipToken(t, i);
  }
  push(start, close);
  return { entries, opaque };
}

/** An expression that is a plain name or a member chain, safe to repeat: `data`, `props.table`. */
const isPlainReference = (expr) => /^[A-Za-z_$][\w$]*(\??\.[A-Za-z_$][\w$]*)*$/.test(expr.trim());

/**
 * `fn` as a callback that takes the row first: `(i) => …` becomes
 * `(_row, i) => …`; anything else is wrapped, `(_row, ...args) => fn(...args)`.
 */
function rowFirst(fn) {
  const t = fn.trim();
  let m = /^(async\s+)?\(([^()]*)\)(\s*(?::[^=]*)?=>)/.exec(t);
  if (m) {
    const params = m[2].trim();
    return `${m[1] ?? ""}(${params ? `_row, ${params}` : "_row"})${m[3]}${t.slice(m[0].length)}`;
  }
  m = /^(async\s+)?([A-Za-z_$][\w$]*)(\s*=>)/.exec(t);
  if (m) return `${m[1] ?? ""}(_row, ${m[2]})${m[3]}${t.slice(m[0].length)}`;
  m = /^(async\s+)?function\b([^(]*)\(([^()]*)\)/.exec(t);
  if (m) {
    const params = m[3].trim();
    return `${m[1] ?? ""}function${m[2]}(${params ? `_row, ${params}` : "_row"})${t.slice(m[0].length)}`;
  }
  const callee = isPlainReference(t) ? t : `(${t})`;
  return `(_row, ...args) => ${callee}(...args)`;
}

/** Each 2.x header `{ content, key, … }` as a column `{ header, key, … }`, or null when not inline. */
function headersAsColumns(headers) {
  const entries = arrayEntries(headers);
  if (!entries) return null;
  const out = [];
  for (const entry of entries) {
    const obj = objectLiteral(entry);
    if (!obj || obj.opaque) return null;
    let text = entry.trim();
    const base = entry.indexOf(text);
    const content = obj.entries.find((e) => e.key === "content");
    if (content) {
      const at = content.at - base;
      text = `${text.slice(0, at)}${content.shorthand ? "header: content" : "header"}${text.slice(content.keyEnd - base)}`;
    }
    out.push(text);
  }
  return `[${out.join(", ")}]`;
}

/** Rewrite the `onClick` and `disabled` of each inline action to take the row first. */
function actionsRowFirst(actions) {
  const entries = arrayEntries(actions);
  if (!entries) return null;
  const out = [];
  for (const entry of entries) {
    const obj = objectLiteral(entry);
    if (!obj) return null;
    let text = entry;
    for (const e of [...obj.entries].reverse()) {
      if (e.key !== "onClick" && e.key !== "disabled") continue;
      text = `${text.slice(0, e.valueAt)}${e.shorthand ? `${e.key}: ` : ""}${rowFirst(e.value)}${text.slice(e.end)}`;
    }
    out.push(text.trim());
  }
  return `[${out.join(", ")}]`;
}

/** Attributes that stay on an element whatever it becomes. */
const ELEMENT_ONLY = new Set(["key", "ref"]);

/**
 * One rewrite per old component: given the tag and the source, the edits that
 * turn it into the survivor (offsets into the source), and warnings.
 *
 * `edit.rename` replaces the tag names, `edit.add` inserts attributes after
 * the name, `edit.drop` removes attributes, `edit.append` adds attributes at
 * the end of the opening tag, `edit.children` sets the children (a
 * self-closing tag gains a closing one) and `edit.attrRename` renames one.
 */
const REWRITE = {
  Modal: () => ({ add: ['variant="sheet"'] }),

  Swiper: (tag) => {
    const indicator = tag.attrs.find((a) => a.name === "indicator");
    const result = { add: ['mode="snap"'], drop: [], append: [] };
    if (indicator) {
      const expr = expressionOf(indicator);
      result.drop.push(indicator);
      // Swiper's dots were a boolean; Carousel's indicator is a kind or false.
      if (expr === "false") result.append.push("indicator={false}");
      else if (expr !== "true") result.append.push(`indicator={${expr} ? "line" : false}`);
    }
    return result;
  },

  ScrollContainer: (tag, src) => {
    const items = tag.attrs.find((a) => a.name === "items");
    const tile = tag.attrs.filter(
      (a) =>
        a.name && a.name !== "items" && !TRACK_OPTIONS.has(a.name) && !ELEMENT_ONLY.has(a.name),
    );
    const spreads = tag.attrs.filter((a) => a.spread);
    const result = { drop: [...tile], append: [], warnings: [], outside: [] };
    // A same-file `const TILE = { … }` spread only here: its tile props go
    // into `tile`, its track options onto the Scroller.
    let tileBase = null;
    const options = [];
    const unknown = [];
    for (const s of spreads) {
      const name = /^\{\s*\.\.\.\s*([A-Za-z_$][\w$]*)\s*\}$/.exec(String(s.value))?.[1];
      const found = name && !tileBase ? tileConst(src, name) : null;
      if (!found) {
        unknown.push(s);
        continue;
      }
      tileBase = name;
      result.drop.push(s);
      for (const e of found.entries) {
        if (TRACK_OPTIONS.has(e.key)) {
          const v = e.value.trim();
          options.push(/^"[^"]*"$|^'[^']*'$/.test(v) ? `${e.key}=${v}` : `${e.key}={${v}}`);
          let from = found.at + e.at;
          while (from > 0 && /[ \t]/.test(src[from - 1])) from--;
          if (src[from - 1] === "\n") from--;
          let to = found.at + e.end;
          if (src[to] === ",") to++;
          result.outside.push({ at: from, end: to, text: "" });
        } else {
          for (const edit of remEdits(e, found.at, e.key)) result.outside.push(edit);
        }
      }
    }
    if (unknown.length)
      result.warnings.push(
        `${unknown.map((s) => s.value).join(" ")}: ScrollContainer gave its rest props to every tile, Scroller gives them to itself; move tile props into tile={{…}}`,
      );
    if (items) result.drop.push(items);
    result.append.push(...options);
    if (tileBase && tile.length)
      result.append.push(`tile={{ ...${tileBase}, ${objectOf(tile.map((a) => [a.name, a])).slice(2)}}`);
    else if (tileBase) result.append.push(`tile={${tileBase}}`);
    else if (tile.length) result.append.push(`tile={${objectOf(tile.map((a) => [a.name, a]))}}`);
    // Track mode needs a track prop; `draggable` was ScrollContainer's default anyway.
    const hasOption = tag.attrs.some((a) => TRACK_OPTIONS.has(a.name)) || options.length > 0;
    if (!hasOption && !tile.length && !tileBase) result.append.push("draggable");
    if (items) {
      const expr = expressionOf(items);
      const entries = arrayEntries(expr);
      // Each entry one child, a fragment included: it was one item, one tile.
      result.children = entries
        ? entries.map((e) => (isOneElement(e) ? e : `{${e}}`))
        : `{${expr}}`;
    } else {
      result.warnings.push("items: not set; Scroller takes the items as its children");
    }
    return result;
  },

  AutoScroll: (tag) => {
    const keys = { speed: "speed", hover: "hover", reverse: "reverse", scrollGap: "gap" };
    const moved = tag.attrs.filter((a) => a.name in keys);
    return {
      drop: moved,
      add: [moved.length ? `auto={${objectOf(moved.map((a) => [keys[a.name], a]))}}` : "auto"],
    };
  },

  InfoTip: (tag, src, children) => {
    const expr = children === null ? null : childrenAsExpression(children);
    return {
      append: [
        `content=${expr === null ? '""' : expr.startsWith('"') && !expr.includes("\\") ? expr : `{${expr}}`}`,
      ],
      selfClose: true,
    };
  },

  Hover: (tag, src, children) => overlayToChildren(tag, children, 'placement="cover"'),

  CursorCard: (tag, src, children) => {
    const result = overlayToChildren(tag, children, 'placement="cursor"');
    const placement = tag.attrs.find((a) => a.name === "placement");
    if (placement) result.attrRename = [[placement, "cursorPlacement"]];
    return result;
  },

  DropdownWrapper: (tag) => {
    const dropdown = tag.attrs.find((a) => a.name === "dropdown");
    if (!dropdown) return {};
    return { drop: [dropdown], children: asChild(expressionOf(dropdown)) };
  },

  ContextMenu: (tag, src, children) => {
    const dropdown = tag.attrs.find((a) => a.name === "dropdown");
    const trigger = children === null ? null : childrenAsExpression(children);
    const result = { add: ['openOn="contextmenu"'], drop: [], append: [], warnings: [] };
    if (trigger !== null) result.add.push(`trigger={${trigger}}`);
    else result.add.push("trigger={null}");
    if (dropdown) {
      result.drop.push(dropdown);
      result.children = asChild(expressionOf(dropdown));
    } else {
      result.children = "";
    }
    return result;
  },

  EmojiPickerDropdown: (tag) => {
    const moved = tag.attrs.filter((a) => a.name && !EMOJI_OWN.has(a.name));
    const spreads = tag.attrs.filter((a) => a.spread);
    const result = { drop: moved, append: [], warnings: [] };
    if (moved.length)
      result.append.push(`dropdownProps={${objectOf(moved.map((a) => [a.name, a]))}}`);
    if (spreads.length)
      result.warnings.push(
        `${spreads.map((s) => s.value).join(" ")}: Dropdown props in it (minWidth, style, className…) go in dropdownProps={{…}} on EmojiPicker`,
      );
    return result;
  },

  DataTable: () => ({}),

  Table: (tag) => rewriteOldTable(tag),

  DateRangePicker: (tag) => {
    const dual = tag.attrs.find((a) => a.name === "dual");
    const result = { add: ["range"], drop: [], append: [] };
    if (dual) {
      const expr = expressionOf(dual);
      result.drop.push(dual);
      if (expr === "true") result.append.push("months={2}");
      else if (expr !== "false") result.append.push(`months={${expr} ? 2 : 1}`);
    }
    return result;
  },

  DateRangeInput: () => ({ add: ["range"] }),

  RangeSlider: () => ({ add: ["range"] }),

  PasswordInput: (tag) => {
    const type = tag.attrs.find((a) => a.name === "type");
    const warnings = [];
    if (tag.attrs.some((a) => a.name === "suffix"))
      warnings.push("suffix: PasswordInput replaced it with the eye button; Input shows both");
    // Last, as PasswordInput set it after the props it was given.
    return { drop: type ? [type] : [], append: ['type="password"'], warnings };
  },

  KeyTip: () => ({}),

  MasonryGrid: (tag) => ({
    add: ["masonry"],
    warnings: tag.attrs.some((a) => a.name === "xl")
      ? ["xl: a masonry Grid reads columns at l, m, s and xs only, as MasonryGrid did"]
      : [],
  }),

  Pulse: () => ({ add: ["pulse"] }),

  FadingLettersFx: (tag) => {
    const result = { add: ['mode="fade"'], drop: [], append: [], attrRename: [] };
    const text = tag.attrs.find((a) => a.name === "text");
    const state = tag.attrs.find((a) => a.name === "animationState");
    const idx = tag.attrs.find((a) => a.name === "messageIdx");
    if (text) result.attrRename.push([text, "words"]);
    if (state) result.attrRename.push([state, "state"]);
    if (idx) {
      const expr = expressionOf(idx);
      result.drop.push(idx);
      if (/^\d+$/.test(expr)) {
        if (Number(expr) !== 0) result.append.push(`delay={${Number(expr) * 2500}}`);
      } else result.append.push(`delay={(${expr}) * 2500}`);
    }
    return result;
  },

  SettingAxes: () => ({}),

  SettingGroup: (tag) => {
    // A Setting is a group once it has `control` or `open`; 2.x's SettingGroup was one without either.
    if (tag.attrs.some((a) => a.name === "control" || a.name === "open")) return {};
    if (tag.attrs.some((a) => a.spread))
      return {
        append: ["open={false}"],
        warnings: [
          "a spread: open={false} was added after it so the group stays closed; move it before the spread if the spread sets open",
        ],
      };
    return { append: ["open={false}"] };
  },

  MobileMegaMenu: () => ({ add: ['collapseBelow="always"'] }),

  UserMenu: (tag) => {
    // UserMenu was always a dropdown trigger; User is one only with `dropdown`.
    if (tag.attrs.some((a) => a.name === "dropdown" || a.spread)) return {};
    return { append: ["dropdown={null}"] };
  },
};

/** 2.x Table's own props that DataTable's API names differently, or that take the row first now. */
function rewriteOldTable(tag) {
  const result = { drop: [], append: [], attrRename: [], warnings: [] };
  const attr = (name) => tag.attrs.find((a) => a.name === name);
  const data = attr("data");
  const expr = expressionOf(data);
  const obj = objectLiteral(expr);
  let headers = null;
  let rows = null;
  if (obj && !obj.opaque && obj.entries.length === 2) {
    headers = obj.entries.find((e) => e.key === "headers")?.value ?? null;
    rows = obj.entries.find((e) => e.key === "rows")?.value ?? null;
  } else if (isPlainReference(expr)) {
    headers = `${expr.trim()}.headers`;
    rows = `${expr.trim()}.rows`;
  }
  if (headers === null || rows === null) {
    result.warnings.push(
      "data: not an inline { headers, rows } or a plain name; set columns={headers.map(({ content, ...c }) => ({ ...c, header: content }))} and rows={rows} by hand",
    );
    return result;
  }
  const columns =
    headersAsColumns(headers) ??
    `${isPlainReference(headers) ? headers : `(${headers})`}.map(({ content, ...column }) => ({ ...column, header: content }))`;
  result.drop.push(data);
  result.append.push(`columns={${columns}}`, `rows={${rows}}`);
  for (const [old, to] of [
    ["defaultPageSize", "defaultPerPage"],
    ["pageSizeOptions", "perPageOptions"],
  ]) {
    const a = attr(old);
    if (a) result.attrRename.push([a, to]);
  }
  // 2.x always offered a page-size select, and first and last buttons, when paginated.
  const paginated = attr("paginated");
  if (paginated && expressionOf(paginated) !== "false") {
    if (!attr("pageSizeOptions")) result.append.push("perPageOptions={[5, 10, 20, 50]}");
    result.append.push("showFirstLast");
  }
  for (const name of ["onRowClick", "rowClassName", "cellClassName"]) {
    const a = attr(name);
    if (!a) continue;
    result.drop.push(a);
    result.append.push(`${name}={${rowFirst(expressionOf(a))}}`);
  }
  const actions = attr("actions");
  if (actions) {
    const rewritten = actionsRowFirst(expressionOf(actions));
    if (rewritten) {
      result.drop.push(actions);
      result.append.push(`actions={${rewritten}}`);
    } else {
      result.warnings.push(
        "actions: not an inline array; each action's onClick and disabled now receive (row, index), not the index",
      );
    }
  }
  return result;
}

/** Hover and CursorCard: `overlay` becomes the children, under `placement`. */
function overlayToChildren(tag, children, placement) {
  const overlay = tag.attrs.find((a) => a.name === "overlay");
  const result = { add: [placement], drop: [], warnings: [] };
  if (children !== null && children.trim())
    result.warnings.push(
      "children: ignored in 2.x beside trigger and overlay; HoverCard renders its children as the card",
    );
  if (overlay) {
    result.drop.push(overlay);
    result.children = asChild(expressionOf(overlay));
  } else {
    result.children = "{null}";
  }
  return result;
}

/** Rewrite one element at `lt`, named `local` in this file, as `tag` → `to`. */
function rewriteElement(src, lt, tag, local, to) {
  const open = parseTag(src, lt);
  if (!open) return null;
  const end = elementEnd(src, lt);
  let children = null;
  let closeAt = -1;
  if (!open.selfClosing) {
    const ce = childrenEnd(src, open.gt + 1);
    children = src.slice(open.gt + 1, ce.at);
    closeAt = ce.at;
  }
  const plan = REWRITE[tag](open, src, children);
  const name = local === tag ? to : local;
  const edits = [];
  // Opening tag name and inserted attributes.
  const add = (plan.add ?? []).map((a) => ` ${a}`).join("");
  edits.push({ at: lt + 1, end: open.nameEnd, text: name + add });
  for (const a of plan.drop ?? [])
    edits.push({ at: withLeadingSpace(src, a.at), end: a.end, text: "" });
  for (const [a, newName] of plan.attrRename ?? [])
    edits.push({ at: a.at, end: a.at + a.name.length, text: newName });
  const tagClose = open.selfClosing ? open.slash : open.gt;
  // Before any whitespace that precedes `/>` or `>`, so the attributes stay together.
  let insertAt = tagClose;
  while (insertAt > open.nameEnd && /\s/.test(src[insertAt - 1])) insertAt--;
  // A tag written over several lines keeps its `>` and its closing tag on
  // lines of their own, and an attribute it gains goes on a line of its own.
  const ws = src.slice(insertAt, tagClose);
  const broken = ws.includes("\n");
  const sep = broken && src.slice(open.nameEnd, insertAt).includes("\n") ? `${ws}  ` : " ";
  const append = (plan.append ?? []).map((a) => `${sep}${a}`).join("");
  if (plan.selfClose && !open.selfClosing) {
    // Children became an attribute: the element closes itself.
    edits.push({ at: insertAt, end: end, text: `${append}${broken ? ws : " "}/>` });
  } else if (plan.children !== undefined) {
    // A child that was an attribute's value moves up a level: its lines
    // shift so that its last line lines up with its first.
    const childIndent = `${ws.slice(ws.lastIndexOf("\n") + 1)}  `;
    const reindent = (text) => {
      const lines = text.split("\n");
      if (!broken || lines.length < 2 || /^\s/.test(text) || !lines[lines.length - 1].trim()) return text;
      const last = lines[lines.length - 1].match(/^[ \t]*/)[0].length;
      const shift = childIndent.length - last;
      return lines
        .map((l, i) => {
          if (i === 0 || !l.trim()) return l;
          const have = l.match(/^[ \t]*/)[0].length;
          return " ".repeat(Math.max(0, have + shift)) + l.slice(have);
        })
        .join("\n");
    };
    const kids = Array.isArray(plan.children)
      ? plan.children.map(reindent).join(broken ? `${ws}  ` : "")
      : reindent(plan.children);
    if (open.selfClosing) {
      edits.push({
        at: insertAt,
        end: end,
        text: !broken
          ? `${append}>${kids}</${name}>`
          : kids
            ? `${append}${ws}>${ws}  ${kids}${ws}</${name}>`
            : `${append}${ws}></${name}>`,
      });
    } else {
      const lead = children.match(/^\s*/)[0];
      const trail = children.match(/\s*$/)[0];
      const keep = lead.includes("\n") && !/^\s/.test(kids);
      edits.push({
        at: insertAt,
        end: closeAt,
        text: `${append}${ws}>${keep ? lead : ""}${kids}${keep ? trail : ""}`,
      });
      edits.push({ at: closeAt, end, text: `</${name}>` });
    }
  } else {
    if (append) edits.push({ at: insertAt, end: insertAt, text: append });
    if (!open.selfClosing) edits.push({ at: closeAt, end, text: `</${name}>` });
  }
  edits.sort((x, y) => y.at - x.at || y.end - x.end);
  let out = src.slice(lt, end);
  for (const e of edits) out = out.slice(0, e.at - lt) + e.text + out.slice(e.end - lt);
  return { text: out, end, warnings: plan.warnings ?? [], outside: plan.outside ?? [] };
}

/** Apply an element's rewrite and its edits elsewhere in the file (a const it spread). */
function applyRewrite(src, lt, done) {
  const edits = [{ at: lt, end: done.end, text: done.text }, ...done.outside];
  edits.sort((x, y) => y.at - x.at);
  let out = src;
  for (const e of edits) out = out.slice(0, e.at) + e.text + out.slice(e.end);
  return out;
}

/** Rename the merged names in `import`/`export { … } from "@once-ui-system/core…"`. */
function rewriteMergedImports(src, warnings, hits, typeRenames = new Map()) {
  const re =
    /(import|export)\s+(type\s+)?\{([^}]*)\}\s*from\s*(["'])(@once-ui-system\/core[^"']*)\4/g;
  return src.replace(re, (whole, keyword, typeOnly, clause, q, source) => {
    if (!isCoreSource(source)) return whole;
    const specs = specifiersOf(clause);
    let changed = false;
    const seen = new Set(specs.filter((s) => !/\s+as\s+/.test(s.text)).map((s) => s.name));
    const out = [];
    for (const s of specs) {
      const to = MERGED_EXPORTS[s.name] ?? MERGED_TYPES[s.name];
      if (TYPE_NOTES[s.name]) warnings.push(`${s.name}: ${TYPE_NOTES[s.name]}`);
      if (!to) {
        out.push(s.text);
        continue;
      }
      changed = true;
      hits.push(`${s.name} → ${to}`);
      const aliased = /\s+as\s+/.test(s.text);
      if (!aliased && keyword === "import" && MERGED_TYPES[s.name]) typeRenames.set(s.name, to);
      if (keyword === "export" && !aliased) {
        out.push(`${s.text.replace(s.name, to)} as ${s.name}`);
        continue;
      }
      if (!aliased && seen.has(to)) continue; // already imported under its own name
      if (!aliased) seen.add(to);
      out.push(s.text.replace(s.name, to));
    }
    if (!changed) return whole;
    // One specifier per line when the import was written that way.
    const list = braceList(out, clause);
    return `${keyword} ${typeOnly ? "type " : ""}${list} from ${q}${source}${q}`;
  });
}

/** 2.x Dropdown's own props, which its panel took out of the Row's. */
const PANEL_OWN = new Set(["selectedOption", "onEscape", "onSelect", "disabled", "className", "children"]);

/**
 * A 2.x `<Dropdown>` panel with no trigger, as the element it rendered:
 *
 *   <Row border="neutral-medium" background="surface" {...props}>
 *     <Column flex={1} overflowY="auto" gap="2">{children}</Column>
 *   </Row>
 *
 * Its props (padding, radius, a border of its own…) went on the Row after
 * those two, so they stay, and a border or background the panel set replaces
 * the default. `className` was taken out and dropped; `selectedOption` and
 * `onEscape` were never read. `disabled` added `cursor-not-allowed`, an
 * opacity of 0.6 (replaced by a style of the panel's own) and
 * `aria-disabled`. `onSelect` read the `data-value` of what was clicked, a
 * handler 3.0's Row does not have: reported, as is a disabled that is not a
 * literal, and a Row or Column name this file gives another component.
 */
function rewritePanel(src, lt, tag, local, bindings) {
  for (const name of ["Row", "Column"]) {
    const b = bindings.get(name);
    if (b && !(isCoreSource(b.source) && b.canonical === name)) return { why: `${name} is another component in this file` };
  }
  if (tag.attrs.some((a) => a.name === "onSelect")) return { why: "onSelect read the data-value of the clicked element; wire that onClick yourself" };
  const disabled = tag.attrs.find((a) => a.name === "disabled");
  const on = disabled ? expressionOf(disabled) : "false";
  if (on !== "true" && on !== "false") return { why: "disabled is not a literal" };
  const end = elementEnd(src, lt);
  const hits = [`<${local}> panel → <Row border background><Column flex={1} overflowY="auto" gap="2">, what 2.x rendered`];
  const kept = tag.attrs.filter((a) => !PANEL_OWN.has(a.name));
  if (tag.attrs.some((a) => a.name === "className")) hits.push(`<${local}> className removed (2.x's panel ignored it)`);
  const added = [];
  if (!kept.some((a) => a.name === "border")) added.push('border="neutral-medium"');
  if (!kept.some((a) => a.name === "background")) added.push('background="surface"');
  if (on === "true") {
    added.push('className="cursor-not-allowed"');
    if (!kept.some((a) => a.name === "style")) added.push("style={{ opacity: 0.6 }}");
    added.push("aria-disabled");
  }
  // The attributes as written, with the panel's own cut out.
  const tagClose = tag.selfClosing ? tag.slash : tag.gt;
  let attrText = src.slice(tag.nameEnd, tagClose);
  for (const a of [...tag.attrs].reverse()) {
    if (!PANEL_OWN.has(a.name)) continue;
    const from = withLeadingSpace(src, a.at) - tag.nameEnd;
    attrText = attrText.slice(0, Math.max(0, from)) + attrText.slice(a.end - tag.nameEnd);
  }
  // Added attributes first (the panel's own replaced them), on lines of their own when its were.
  const trailing = attrText.match(/\s*$/)[0];
  const body0 = attrText.slice(0, attrText.length - trailing.length);
  const lineIndent = /^\s*\n([ \t]*)\S/.exec(body0)?.[1];
  const sep = lineIndent !== undefined ? `\n${lineIndent}` : " ";
  const head = `<Row${added.map((a) => `${sep}${a}`).join("")}${body0}${trailing.includes("\n") ? trailing : ""}`;
  const inner = '<Column flex={1} overflowY="auto" gap="2"';
  if (tag.selfClosing) return { text: `${head}>${inner} /></Row>`, end, hits };
  const children = childrenEnd(src, tag.gt + 1);
  const body = src.slice(tag.gt + 1, children.at);
  const lineStart = src.lastIndexOf("\n", lt - 1) + 1;
  const indent = /^[ \t]*$/.test(src.slice(lineStart, lt)) ? src.slice(lineStart, lt) : null;
  const unit = (indent ?? "").includes("\t") ? "\t" : "  ";
  if (indent !== null && /^[ \t]*\n/.test(body) && /\n[ \t]*$/.test(body)) {
    // Children on lines of their own move one level in, inside the Column.
    const moved = body.replace(/\n(?=[ \t]*\S)/g, `\n${unit}`).replace(/\n[ \t]*$/, "");
    return { text: `${head}>\n${indent}${unit}${inner}>${moved}\n${indent}${unit}</Column>\n${indent}</Row>`, end, hits };
  }
  return { text: `${head}>${inner}>${body}</Column></Row>`, end, hits };
}

/**
 * The merges pass. Runs on a file's source after the other 3.0 passes and
 * returns `{ out, hits, warnings }` like they do.
 */
/** `text` with its import and re-export lists blanked (lengths kept). */
function blankImports(text) {
  return text.replace(/(import|export)\s+(type\s+)?\{[^}]*\}\s*from\s*["'][^"']+["'];?/g, (m) => m.replace(/[^\n]/g, " "));
}

export function transformMerges(src, { remProps, breakpointProps } = {}) {
  UNITS = { rem: remProps ?? new Set(), breakpoints: breakpointProps ?? new Set() };
  const hits = [];
  const warnings = [];
  const bindings = importBindings(src);
  let out = src;

  // The old panel's name now means the trigger-and-panel component. A 2.x
  // panel on its own becomes what it rendered (see rewritePanel).
  let panels = 0;
  // Passed as a value (an MDX components map, a registry), it hands out the new component.
  for (const local of localNamesFor("Dropdown", bindings)) {
    if (!isCoreSource(bindings.get(local)?.source ?? "") || local.includes("__")) continue;
    const code = blankImports(codeOnly(src, { jsxText: true })).replace(new RegExp(`</?${local}(?=[\\s/>])`, "g"), "");
    if (new RegExp(`(?<![\\w$.])${local}(?![\\w$])`).test(code))
      warnings.push(
        `${local} passed as a value: it was 2.x's bare panel and is the trigger-and-panel component in 3.0; ` +
          'pass a component of your own that renders <Row border="neutral-medium" background="surface"><Column flex={1} overflowY="auto" gap="2">{children}</Column></Row>',
      );
  }
  for (const local of localNamesFor("Dropdown", bindings)) {
    const re = new RegExp(`<${local}(?=[\\s/>])`, "g");
    let from = 0;
    for (;;) {
      re.lastIndex = from;
      const m = re.exec(out);
      if (!m) break;
      from = m.index + 1;
      const tag = parseTag(out, m.index);
      if (!tag || tag.attrs.some((a) => a.name === "trigger" || a.spread)) continue;
      const imported = isCoreSource(bindings.get(local)?.source ?? "") && !local.includes("__");
      const done = imported ? rewritePanel(out, m.index, tag, local, bindings) : { why: "it is not imported from core here" };
      if (done.text !== undefined) {
        out = out.slice(0, m.index) + done.text + out.slice(done.end);
        hits.push(...done.hits);
        panels++;
        continue;
      }
      warnings.push(
        `<${local}> without trigger: Dropdown is the trigger-and-panel component in 3.0 (2.x DropdownWrapper). ` +
          'A 2.x panel on its own rendered <Row border="neutral-medium" background="surface" …its props><Column flex={1} overflowY="auto" gap="2">…children</Column></Row>' +
          ` (it ignored className); write that (${done.why})`,
      );
    }
  }
  if (panels) out = addToCoreImport(out, ["Column", "Row"]) ?? out;

  // 2.x Table's `data` shape, before DataTable takes the name. A Table this
  // file defines itself is not Once UI's.
  const ownTable = /\b(function|class)\s+Table\b|\b(const|let|var)\s+Table\s*=/.test(out);
  for (const local of localNamesFor("Table", bindings)) {
    if (local === "Table" && !bindings.has("Table") && ownTable) continue;
    const re = new RegExp(`<${local}(?=[\\s/>])`, "g");
    let from = 0;
    for (;;) {
      re.lastIndex = from;
      const m = re.exec(out);
      if (!m) break;
      from = m.index + 1;
      const tag = parseTag(out, m.index);
      if (!tag) continue;
      if (!tag.attrs.some((a) => a.name === "data")) {
        if (tag.attrs.some((a) => a.spread) && !tag.attrs.some((a) => a.name === "columns"))
          warnings.push(
            `<${local}> with a spread and no columns: if the spread carries 2.x data={{ headers, rows }}, Table takes columns and rows in 3.0`,
          );
        continue;
      }
      const done = rewriteElement(out, m.index, "Table", local, "Table");
      if (!done) continue;
      for (const w of done.warnings) warnings.push(located(`<Table> ${w}`, out, m.index));
      const next = applyRewrite(out, m.index, done);
      // Counted only when written: a data it could not read changes nothing.
      if (next !== out) hits.push("<Table data> → <Table columns rows>");
      out = next;
    }
  }

  for (const [tag, to] of Object.entries(MERGED_EXPORTS)) {
    for (const local of localNamesFor(tag, bindings)) {
      const re = new RegExp(`<${local.replace(".", "\\.")}(?=[\\s/>])`, "g");
      let from = 0;
      for (;;) {
        re.lastIndex = from;
        const m = re.exec(out);
        if (!m) break;
        const done = rewriteElement(out, m.index, tag, local, to);
        if (!done) {
          from = m.index + 1;
          continue;
        }
        for (const w of done.warnings) warnings.push(located(`<${tag}> ${w}`, out, m.index));
        const next = applyRewrite(out, m.index, done);
        if (next !== out) hits.push(`<${tag}> → <${to}>`);
        out = next;
        from = m.index + 1;
      }
    }
  }

  // A renamed prop type is renamed where it is used, too: it only ever names a type.
  const typeRenames = new Map();
  out = rewriteMergedImports(out, warnings, hits, typeRenames);
  if (typeRenames.size) {
    const importRe = /(import|export)\s+(type\s+)?\{[^}]*\}\s*from\s*["'][^"']+["'];?/g;
    const parts = [];
    let last = 0;
    for (const m of out.matchAll(importRe)) {
      parts.push([out.slice(last, m.index), true], [m[0], false]);
      last = m.index + m[0].length;
    }
    parts.push([out.slice(last), true]);
    out = parts
      .map(([text, code]) => {
        if (!code) return text;
        for (const [from, to] of typeRenames)
          text = text.replace(new RegExp(`(?<![\\w$.])${from}(?![\\w$])`, "g"), to);
        return text;
      })
      .join("");
  }

  // An old name still used some other way: as a value, in `typeof`, in a type.
  // Comments, strings and JSX text are blanked (lengths kept), and so are the
  // import statements, so offsets in `code` are offsets in `out`.
  const after = importBindings(out);
  for (const name of [...Object.keys(MERGED_EXPORTS), ...Object.keys(MERGED_TYPES)]) {
    const imported = bindings.get(name);
    if (!imported || !isCoreSource(imported.source)) continue;
    if (after.has(name)) continue;
    const survivor = MERGED_EXPORTS[name] ?? MERGED_TYPES[name];
    // `{ ScrollContainer, Dialog }`: a component map (MDX components, a registry).
    if (MERGED_EXPORTS[name] && after.has(survivor)) {
      const keys = shorthandKeys(blankImports(codeOnly(out, { jsxText: true })), name);
      if (keys.length) {
        for (const at of keys.reverse()) out = `${out.slice(0, at)}${name}: ${survivor}${out.slice(at + name.length)}`;
        hits.push(`{ ${name} } → { ${name}: ${survivor} } (a component map's key keeps the old tag name)`);
      }
    }
    // An object key (`{ ScrollContainer: Scroller }`) names nothing.
    const key = new RegExp(`(?<=[{,]\\s*)${name}(?=\\s*:(?!:))`, "g");
    const code = blankImports(codeOnly(out, { jsxText: true })).replace(key, (m) => " ".repeat(m.length));
    if (new RegExp(`(?<![\\w$.])${name}(?![\\w$])`).test(code))
      warnings.push(
        `${name}: still referenced after the merge into ${survivor}; rename it by hand` +
          (MERGED_EXPORTS[name] ? ` (an object key can keep the old name: ${name}: ${survivor})` : ""),
      );
  }
  // A Dropdown import whose 2.x panels all became Rows, and that nothing else uses now.
  if (panels) {
    for (const local of localNamesFor("Dropdown", after)) {
      if (!isCoreSource(after.get(local)?.source ?? "")) continue;
      if (new RegExp(`(?<![\\w$.])${local}(?![\\w$])`).test(blankImports(codeOnly(out, { jsxText: true })))) continue;
      out = removeFromCoreImport(out, local);
      hits.push(`${local} removed from the import (its panels are Rows now)`);
    }
  }
  return { out, hits, warnings };
}

/**
 * Offsets of `name` written as a shorthand property of an object literal,
 * `{ ScrollContainer, Text }`, in `code` (comments and strings blanked). Not a
 * destructuring pattern (`const { A } = x`, a parameter), an `export { A }`
 * list or a JSX expression container (`as={A}`, `>{A}<`), where `A: B` would
 * mean something else or not parse.
 */
function shorthandKeys(code, name) {
  const found = [];
  const re = new RegExp(`(?<=[{,]\\s*)${name}(?=\\s*[,}])`, "g");
  for (const m of code.matchAll(re)) {
    // The brace that opens the literal: the nearest unclosed `{` before it.
    let depth = 0;
    let open = -1;
    for (let i = m.index - 1; i >= 0; i--) {
      const c = code[i];
      if (")]}".includes(c)) depth++;
      else if ("([{".includes(c)) {
        if (depth === 0) {
          open = c === "{" ? i : -1;
          break;
        }
        depth--;
      }
    }
    if (open < 0) continue;
    const close = skipGroup(code, open) - 1;
    const inner = code.slice(open + 1, close);
    const lead = code.slice(Math.max(0, open - 40), open);
    const tail = code.slice(close + 1, close + 40);
    if (/\bexport\s*$|\bimport\s*$|\b(const|let|var)\s*$|\bfunction\b[^(]*\($/.test(lead)) continue;
    if (/^\s*(=(?![=>])|:|\)\s*=>|\)\s*\{|,[^)]*\)\s*=>)/.test(tail)) continue; // a pattern
    // One bare name in braces is a JSX expression when it sits on an attribute or among children.
    if (!inner.includes(",") && /(?:[\w$-]=|>|\})\s*$/.test(lead)) continue;
    found.push(m.index);
  }
  return found;
}
