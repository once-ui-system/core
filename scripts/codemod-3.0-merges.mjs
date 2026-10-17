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
};

const TYPE_NOTES = {
  ScrollContainerControlPlacement: 'removed; use ScrollerProps["controlPlacement"]',
  DropdownProps:
    "now the props of the trigger-and-panel Dropdown (2.x DropdownWrapperProps); the 2.x panel's props are internal",
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
    const warnings = spreads.length
      ? [
          `${spreads.map((s) => s.value).join(" ")}: ScrollContainer gave its rest props to every tile, Scroller gives them to itself; move tile props into tile={{…}}`,
        ]
      : [];
    const result = { drop: [...tile], append: [], warnings };
    if (items) result.drop.push(items);
    if (tile.length) result.append.push(`tile={${objectOf(tile.map((a) => [a.name, a]))}}`);
    // Track mode needs a track prop; `draggable` was ScrollContainer's default anyway.
    const hasOption = tag.attrs.some((a) => TRACK_OPTIONS.has(a.name));
    if (!hasOption && !tile.length) result.append.push("draggable");
    if (items) {
      const expr = expressionOf(items);
      const entries = arrayEntries(expr);
      // Each entry one child, a fragment included: it was one item, one tile.
      result.children = entries
        ? entries.map((e) => (isOneElement(e) ? e : `{${e}}`)).join("")
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

  UserMenu: (tag) => {
    // UserMenu was always a dropdown trigger; User is one only with `dropdown`.
    if (tag.attrs.some((a) => a.name === "dropdown" || a.spread)) return {};
    return { append: ["dropdown={null}"] };
  },
};

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
  const append = (plan.append ?? []).map((a) => ` ${a}`).join("");
  const tagClose = open.selfClosing ? open.slash : open.gt;
  // Before any whitespace that precedes `/>` or `>`, so the attributes stay together.
  let insertAt = tagClose;
  while (insertAt > open.nameEnd && /\s/.test(src[insertAt - 1])) insertAt--;
  if (plan.selfClose && !open.selfClosing) {
    // Children became an attribute: the element closes itself.
    edits.push({ at: insertAt, end: end, text: `${append} />` });
  } else if (plan.children !== undefined) {
    if (open.selfClosing) {
      edits.push({ at: insertAt, end: end, text: `${append}>${plan.children}</${name}>` });
    } else {
      edits.push({ at: insertAt, end: closeAt, text: `${append}>${plan.children}` });
      edits.push({ at: closeAt, end, text: `</${name}>` });
    }
  } else {
    if (append) edits.push({ at: insertAt, end: insertAt, text: append });
    if (!open.selfClosing) edits.push({ at: closeAt, end, text: `</${name}>` });
  }
  edits.sort((x, y) => y.at - x.at || y.end - x.end);
  let out = src.slice(lt, end);
  for (const e of edits) out = out.slice(0, e.at - lt) + e.text + out.slice(e.end - lt);
  return { text: out, end, warnings: plan.warnings ?? [] };
}

/** Rename the merged names in `import`/`export { … } from "@once-ui-system/core…"`. */
function rewriteMergedImports(src, warnings, hits) {
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
    const list = clause.includes("\n")
      ? `{\n${out.map((t) => `${clause.match(/\n([ \t]*)\S/)?.[1] ?? "  "}${t},`).join("\n")}\n}`
      : `{ ${out.join(", ")} }`;
    return `${keyword} ${typeOnly ? "type " : ""}${list} from ${q}${source}${q}`;
  });
}

/**
 * The merges pass. Runs on a file's source after the other 3.0 passes and
 * returns `{ out, hits, warnings }` like they do.
 */
export function transformMerges(src) {
  const hits = [];
  const warnings = [];
  const bindings = importBindings(src);
  let out = src;

  // The old panel's name now means the trigger-and-panel component.
  for (const local of localNamesFor("Dropdown", bindings)) {
    const re = new RegExp(`<${local}(?=[\\s/>])`, "g");
    let m;
    while ((m = re.exec(out))) {
      const tag = parseTag(out, m.index);
      if (tag && !tag.attrs.some((a) => a.name === "trigger" || a.spread))
        warnings.push(
          `<${local}> without trigger: Dropdown is the trigger-and-panel component in 3.0 (2.x DropdownWrapper). ` +
            'A panel on its own is a Column with border="neutral-medium" background="surface" radius="l"; ' +
            "a panel inside DropdownWrapper's dropdown is not needed (its children go straight into Dropdown)",
        );
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
        out = out.slice(0, m.index) + done.text + out.slice(done.end);
        hits.push(`<${tag}> → <${to}>`);
        for (const w of done.warnings) warnings.push(`<${tag}> ${w}`);
        from = m.index + 1;
      }
    }
  }

  out = rewriteMergedImports(out, warnings, hits);

  // An old name still used some other way: as a value, in `typeof`, in a type.
  const code = out.replace(/(import|export)\s+(type\s+)?\{[^}]*\}\s*from\s*["'][^"']+["'];?/g, "");
  const after = importBindings(out);
  for (const name of [...Object.keys(MERGED_EXPORTS), ...Object.keys(MERGED_TYPES)]) {
    const imported = bindings.get(name);
    if (!imported || !isCoreSource(imported.source)) continue;
    if (after.has(name)) continue;
    if (new RegExp(`(?<![\\w$.])${name}(?![\\w$])`).test(code))
      warnings.push(
        `${name}: still referenced after the merge into ${MERGED_EXPORTS[name] ?? MERGED_TYPES[name]}; rename it by hand`,
      );
  }
  return { out, hits, warnings };
}
