#!/usr/bin/env node
/**
 * Once UI 1.8.x → 2.0 prop codemod.
 *
 * Renames are component-scoped: a transform fires only inside a JSX element
 * whose tag matches, never on a bare attribute name. That matters because
 * several of the old names (`height`, `radius`, `label`, `icon`, `fill`) are
 * legitimate props on OTHER components and must survive untouched.
 *
 * Usage:  node scripts/codemod-2.0.mjs <dir> [--dry]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** component → { oldProp: newProp } */
const TRANSFORMS = {
  ProgressBar:      { label: "showLabel" },
  Feedback:         { icon: "showIcon" },
  Toast:            { icon: "showIcon" },
  DataTooltip:      { colors: "showSwatches" },
  RevealFx:         { trigger: "revealed" },
  SegmentedControl: { selected: "value", onToggle: "onChange", defaultSelected: "defaultValue" },
  NavIcon:          { isActive: "active" },
  Checkbox:         { isChecked: "checked", isIndeterminate: "indeterminate" },
  RadioButton:      { isChecked: "checked" },
  Switch:           { isChecked: "checked" },
  Dialog:           { isOpen: "open" },
  Modal:            { isOpen: "open" },
  KbarContent:      { isOpen: "open" },
  DatePicker:       { isOpen: "open", isNested: "nested" },
  DropdownWrapper:  { isOpen: "open", isNested: "nested" },
  // Inherits DropdownWrapper's props via ComponentProps, so it inherits the rename.
  EmojiPickerDropdown: { isOpen: "open", isNested: "nested" },
  Input:            { hasPrefix: "prefix", hasSuffix: "suffix", height: "size", radius: "corners" },
  Textarea:         { hasPrefix: "prefix", hasSuffix: "suffix", height: "size", radius: "corners" },
  Option:           { hasPrefix: "prefix", hasSuffix: "suffix" },
  // Components whose props derive from Input (extends InputProps / ComponentProps<typeof Input>)
  // inherit its renames, so the codemod must know their tags too.
  Select:           { hasPrefix: "prefix", hasSuffix: "suffix", height: "size", radius: "corners" },
  NumberInput:      { hasPrefix: "prefix", hasSuffix: "suffix", height: "size", radius: "corners" },
  TagInput:         { hasPrefix: "prefix", hasSuffix: "suffix", height: "size", radius: "corners" },
  ColorInput:       { hasPrefix: "prefix", hasSuffix: "suffix", height: "size", radius: "corners" },
  DateInput:        { hasPrefix: "prefix", hasSuffix: "suffix", height: "size", radius: "corners" },
  DateRangeInput:   { hasPrefix: "prefix", hasSuffix: "suffix", height: "size", radius: "corners" },
  PasswordInput:    { hasPrefix: "prefix", hasSuffix: "suffix", height: "size", radius: "corners" },
  // Docs-site wrappers that forward props verbatim to the component they wrap.
  ClientOption:     { hasPrefix: "prefix", hasSuffix: "suffix" },
  ClientSwitch:     { isChecked: "checked" },
  Pulse:            { variant: "scheme" },
  Tag:              { variant: "scheme" },
  // `fill` shadowed the Flex layout prop of the same name on all three, so
  // `<Media fill />` filled nothing. The shadow is now `stretch` and `fill`
  // means on these what it means everywhere else.
  Media:            { fill: "stretch" },
  Carousel:         { fill: "stretch" },
  Swiper:           { fill: "stretch" },
  Button:           { radius: "corners" },
  IconButton:       { radius: "corners" },
  ToggleButton:     { radius: "corners" },
};

/**
 * Props that keep their old name for particular values.
 *
 * `radius` used to be exempted here on the theory that `radius="none"` meant
 * roundness rather than a corner. It does not: `radius` is only ever renamed
 * inside the button and input families, and on those `radius` is gone in 2.0
 * while `corners` accepts "none" like any other value. The exemption left
 * every `radius="none"` in those components as a type error the codemod had
 * silently declined to fix, so it is empty until a real case appears.
 */
const VALUE_AWARE = {};

/**
 * Props whose VALUE changed, not their name. A rename cannot express these, so
 * they are reported for a human rather than rewritten:
 *
 *   RevealFx.delay   seconds → milliseconds   (delay={0.2}  → delay={200})
 *   ShineFx.speed    seconds → milliseconds   (speed={0.75} → speed={750})
 *   Skeleton.delay   "1".."6" step → milliseconds
 *   Skeleton.width   five-step scale → a Flex width (width="80%")
 *
 * A bare literal is mechanical, but `delay={index * 0.1}` is not: the caller
 * owns the multiplier, so guessing would silently change timing.
 */

/**
 * Heuristic: a duration literal under this many units was almost certainly
 * written as seconds (0.2, 1, 5) and a larger one as milliseconds (200, 1500).
 * It is a guess, but it is the difference between flagging only what still
 * needs changing and re-flagging every already-migrated call site forever.
 * Non-numeric values always warn, because an expression cannot be judged.
 */
const SECONDS_CEILING = 50;

const looksLikeSeconds = (raw) => {
  const n = Number(String(raw).replace(/[{}"']/g, "").trim());
  return Number.isNaN(n) ? true : n > 0 && n < SECONDS_CEILING;
};

const VALUE_CHANGED = {
  ColorInput: {
    // Not a value change but a signature change: onChange now receives the
    // colour string instead of the DOM event, so `e.target.value` in the
    // handler becomes the value itself. There is no way to tell a migrated
    // handler from an unmigrated one when it is passed by name, so this warns
    // on every call site rather than staying silent on the ones it cannot
    // read — a handful of noisy lines beat a type error found after release.
    onChange: { note: "now receives (value: string), not the change event", when: () => true },
  },
  RevealFx: {
    delay: { note: "seconds → milliseconds (multiply by 1000)", when: looksLikeSeconds },
  },
  ShineFx: {
    speed: { note: "seconds → milliseconds (multiply by 1000)", when: looksLikeSeconds },
  },
};

/**
 * Skeleton's 1.8.x props cannot be migrated by renaming, because what they
 * meant depended on `shape`. Read straight off the old stylesheet:
 *
 *   .line   uses  w-* for width (25/33/50/75/100%)  and h-* for height
 *   .circle uses  w-* for the diameter — `height` never applied at all
 *   .block  is 100%×100% — neither `width` nor `height` applied
 *   .delay-N is animation-delay: N × 0.1s
 *
 * 2.0 keeps one `size` scale (line height, or circle diameter), takes width
 * from Flex like any other element, and takes `delay` in milliseconds. So a
 * circle's `size` has to come from its old `width` while its `height` is
 * dropped, and a line's `height` becomes `size` while its `width` becomes the
 * percentage the stylesheet was already applying. Renaming `height` → `size`
 * unconditionally would give a circle the wrong diameter whenever the two
 * differed, which is why this is a pass of its own.
 */
const SKELETON_LINE_WIDTH = { xs: "25%", s: "33%", m: "50%", l: "75%", xl: "100%" };
const SCALE = /^["'](xs|s|m|l|xl)["']$/;

/** The literal behind `"m"` or `{"m"}`, or null when it is not a literal. */
function literal(raw) {
  if (raw === null || raw === undefined) return null;
  const inner = String(raw).trim().replace(/^\{|\}$/g, "").trim();
  return SCALE.test(inner) || /^["'][^"']*["']$/.test(inner) ? inner.slice(1, -1) : null;
}

/** Widen an edit's start to swallow the whitespace before it, so removing an
 *  attribute does not leave a double space or a dangling newline. */
const withLeadingSpace = (src, at) => {
  let i = at;
  while (i > 0 && /[ \t]/.test(src[i - 1])) i--;
  if (src[i - 1] === "\n" && /^\s*$/.test(src.slice(i, at))) i--;
  return i;
};

/**
 * `{String(i + 1) as SkeletonDelay}` / `{i.toString() as "1" | "2"}` → the
 * expression in milliseconds.
 *
 * The old prop was a string union, so every computed step had to be stringified
 * and cast back to it. That wrapper is exactly what 2.0 removes, and the step
 * was × 0.1s, so the inner expression × 100 is the same animation — including
 * at i = 0, which named a `.delay-0` class that never existed and so meant no
 * delay either way. Only this shape is rewritten; a bare variable is left to a
 * warning, because its own type is what has to change.
 */
function delayFromStringifiedStep(raw) {
  const inner = String(raw).trim().replace(/^\{|\}$/g, "").trim();
  const cast = inner.match(/\s+as\s+(any|[A-Za-z_]\w*|(?:\s*["'][1-6]["']\s*\|?)+(?:\s*\|\s*undefined)?)\s*$/);
  if (!cast) return null;
  if (/\bundefined\b/.test(cast[1])) return null;      // the value may be absent; × 100 would be NaN
  let expr = inner.slice(0, cast.index).trim();

  const asString = expr.match(/^String\s*\(([\s\S]*)\)$/);
  if (asString) expr = asString[1].trim();
  else if (/\.toString\s*\(\s*\)$/.test(expr)) expr = expr.replace(/\.toString\s*\(\s*\)$/, "").trim();
  else return null;                                     // not a stringified step

  if (!expr) return null;
  const atomic = /^[A-Za-z_]\w*$/.test(expr) || /^\([\s\S]*\)$/.test(expr);
  return `${atomic ? expr : `(${expr})`} * 100`;
}

function rewriteSkeleton(src, attrs, nameEnd) {
  const edits = [];
  const warnings = [];
  const by = Object.fromEntries(attrs.map((a) => [a.name, a]));
  const shape = by.shape ? literal(by.shape.value) : "line";  // the component's default

  if (by.shape && shape === null) {
    warnings.push("shape is computed — width/height/size need checking by hand");
    return { edits, warnings };
  }

  if (by.delay) {
    const raw = String(by.delay.value ?? "").trim();
    const step = literal(by.delay.value);
    const ms = delayFromStringifiedStep(by.delay.value);
    if (step && /^[1-6]$/.test(step)) {
      const value = Number(step) * 100;
      edits.push({ at: by.delay.at, end: by.delay.end, text: `delay={${value}}`, hit: `delay "${step}" → {${value}}` });
    } else if (ms) {
      edits.push({ at: by.delay.at, end: by.delay.end, text: `delay={${ms}}`, hit: `delay step → {${ms}}` });
    } else if (/^["']/.test(raw) || /\bas\s+(\w*Delay\b|["'][1-6]["'])/.test(raw)) {
      // Only warn on something still wearing the old shape. Everything else
      // the compiler catches anyway — `delay` is typed `number` in 2.0 — so a
      // blanket warning would just re-flag values this pass already migrated.
      warnings.push('delay: step "1".."6" → milliseconds (step × 100)');
    }
  }

  const drop = (a, note) => {
    edits.push({ at: withLeadingSpace(src, a.at), end: a.end, text: "", hit: `${a.name} removed (had no effect)` });
    if (note) warnings.push(note);
  };

  if (shape === "circle") {
    const w = by.width ? literal(by.width.value) : null;
    const h = by.height ? literal(by.height.value) : null;
    if (by.width && w && SCALE.test(`"${w}"`)) {
      edits.push({ at: by.width.at, end: by.width.end, text: `size="${w}"`, hit: `circle width="${w}" → size="${w}"` });
      // `height` never reached a circle in 1.8.x, so it carries no meaning to keep.
      if (by.height) {
        if (h && h !== w) warnings.push(`height="${h}" was ignored on a circle; diameter comes from width="${w}"`);
        drop(by.height);
      }
    } else if (by.width) {
      warnings.push("circle: diameter now comes from size, not width");
    }
  } else if (shape === "block") {
    // Neither applied to a block, and 2.0's width is a real Flex width, so
    // leaving one behind would silently start changing the layout.
    if (by.width) drop(by.width, 'width was ignored on a block (it fills its container)');
    if (by.height) drop(by.height, 'height was ignored on a block (it fills its container)');
  } else {
    // 1.8.x defaulted `width` to "m", i.e. `.w-m { width: 50% }`. 2.0 has no
    // width default, and the element is an inline flex with no content, so a
    // line that never named a width would collapse to nothing at all. Make the
    // old default explicit rather than let every such skeleton disappear.
    if (!by.width && !by.fillWidth && !by.maxWidth && !by.minWidth) {
      edits.push({
        at: nameEnd, end: nameEnd, text: ' width="50%"',
        hit: 'width="50%" added (was the 1.8.x default)',
      });
    }
    if (by.height) {
      const h = literal(by.height.value);
      if (h && SCALE.test(`"${h}"`))
        edits.push({ at: by.height.at, end: by.height.end, text: `size="${h}"`, hit: `height="${h}" → size="${h}"` });
      else warnings.push("height → size");
    }
    if (by.width) {
      const w = literal(by.width.value);
      if (w && SKELETON_LINE_WIDTH[w]) {
        edits.push({
          at: by.width.at, end: by.width.end,
          text: `width="${SKELETON_LINE_WIDTH[w]}"`,
          hit: `width="${w}" → width="${SKELETON_LINE_WIDTH[w]}"`,
        });
      } else if (w === null) {
        warnings.push("width: scale → a Flex width, e.g. width=\"80%\"");
      }
    }
  }
  return { edits, warnings };
}

/** component → (src, attrs) => { edits, warnings } for changes a rename cannot express */
const REWRITES = { Skeleton: rewriteSkeleton };

/**
 * If a JS comment starts at `i`, return the index just past it, else `i`.
 *
 * Comments are legal in JSX attribute position and inside `{...}` values, and
 * their prose is not code: an apostrophe in `they're` would otherwise open a
 * string that never closes, so the scanner would run off the end of the file
 * and the whole element would be skipped without a word. Every scanner that
 * tracks quotes or braces must therefore skip comments first.
 */
function skipComment(src, i) {
  if (src[i] !== "/") return i;
  if (src[i + 1] === "/") {
    let j = i + 2;
    while (j < src.length && src[j] !== "\n") j++;
    return j;
  }
  if (src[i + 1] === "*") {
    const close = src.indexOf("*/", i + 2);
    return close < 0 ? src.length : close + 2;
  }
  return i;
}

/** Find the end of the opening tag, skipping strings, comments and nested {...}. */
function openingTagEnd(src, from) {
  let i = from, depth = 0, quote = null;
  while (i < src.length) {
    const c = src[i];
    if (quote) {
      if (c === quote && src[i - 1] !== "\\") quote = null;
      i++;
      continue;
    }
    const past = skipComment(src, i);
    if (past !== i) { i = past; continue; }
    if (c === '"' || c === "'" || c === "`") quote = c;
    else if (c === "{") depth++;
    else if (c === "}") depth--;
    else if (c === ">" && depth === 0) return i;
    i++;
  }
  return -1;
}

/** Read the raw attribute value that starts at `i` ("..." or {...}). */
function readValue(src, i) {
  if (src[i] === '"' || src[i] === "'") {
    const q = src[i];
    let j = i + 1;
    while (j < src.length && !(src[j] === q && src[j - 1] !== "\\")) j++;
    return { raw: src.slice(i, j + 1), end: j + 1 };
  }
  if (src[i] === "{") {
    let depth = 0, j = i, quote = null;
    while (j < src.length) {
      if (quote) {
        if (src[j] === quote && src[j - 1] !== "\\") quote = null;
        j++;
        continue;
      }
      const past = skipComment(src, j);
      if (past !== j) { j = past; continue; }
      if (src[j] === '"' || src[j] === "'" || src[j] === "`") quote = src[j];
      else if (src[j] === "{") depth++;
      else if (src[j] === "}" && --depth === 0) return { raw: src.slice(i, j + 1), end: j + 1 };
      j++;
    }
  }
  return { raw: "", end: i };
}

/**
 * Attributes of one opening tag, at attribute position only.
 *
 * This must not be a plain regex over the tag text: an expression value like
 * `label={isChecked ? a : b}` contains an identifier equal to an old prop name,
 * and rewriting it would rename the caller's local variable. So values are
 * skipped wholesale and only names sitting at depth 0 are returned.
 */
function attributesOf(src, from, to) {
  const attrs = [];
  let i = from;
  while (i < to) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    const past = skipComment(src, i);
    if (past !== i) { i = past; continue; }                   // // or /* */ between attributes
    if (c === "{") { i = readValue(src, i).end; continue; }   // spread {...props}
    if (!/[A-Za-z_]/.test(c)) { i++; continue; }
    let j = i;
    while (j < to && /[\w:.-]/.test(src[j])) j++;
    const name = src.slice(i, j);
    let k = j;
    while (k < to && /\s/.test(src[k])) k++;
    if (src[k] === "=") {
      let v = k + 1;
      while (v < to && /\s/.test(src[v])) v++;
      const { raw, end } = readValue(src, v);
      attrs.push({ name, at: i, value: raw, end });
      i = end;
    } else {
      attrs.push({ name, at: i, value: null, end: j });       // boolean shorthand
      i = j;
    }
  }
  return attrs;
}

/**
 * Where each JSX name in this file comes from: `local name → { source, canonical }`.
 *
 * A transform keyed on the bare tag name cannot tell Once UI's `<Modal>` from
 * an app's own `<Modal>`, and renaming a prop on someone else's component turns
 * working code into a type error. Import bindings are what tells them apart,
 * and they also carry aliases: `{ Modal as Sheet }` means `<Sheet>` is the
 * element to migrate and `<Modal>` is not.
 */
function importBindings(src) {
  const bindings = new Map();
  const re = /import\s+(?:type\s+)?(?:\{([^}]*)\}|(\w+)|\*\s+as\s+(\w+))\s*from\s*["']([^"']+)["']/g;
  let m;
  while ((m = re.exec(src))) {
    const [, named, def, ns, source] = m;
    if (named) {
      for (const part of named.split(",")) {
        const [canonical, alias] = part.trim().split(/\s+as\s+/).map((x) => x?.trim());
        if (canonical) bindings.set(alias || canonical, { source, canonical });
      }
    } else if (def || ns) {
      const name = def || ns;
      bindings.set(name, { source, canonical: name });
    }
  }
  return bindings;
}

const isCoreSource = (source) => /^@once-ui-system\/core(\/|$)/.test(source);

/**
 * The element names in this file that mean Once UI's `tag`.
 *
 * Three cases, in order: the file imports `tag` from core (migrate it, under
 * whatever local alias it was given); the file binds that name to something
 * else (leave it alone — it is the app's own component); the name is not
 * imported at all (migrate it by name, which is what MDX depends on, since
 * there components arrive through the provider rather than an import).
 */
function localNamesFor(tag, bindings) {
  const aliases = [];
  for (const [local, { source, canonical }] of bindings)
    if (canonical === tag && isCoreSource(source)) aliases.push(local);
  if (aliases.length) return aliases;
  return bindings.has(tag) ? [] : [tag];
}

export function transform(src) {
  const hits = [];
  const warnings = [];
  const bindings = importBindings(src);
  let out = src;
  // Union of all three maps: a tag can have only a value change (ShineFx) or
  // only a rewrite (Skeleton) and would otherwise never be visited, so its
  // warning would silently never fire.
  const tags = new Set([
    ...Object.keys(TRANSFORMS),
    ...Object.keys(VALUE_CHANGED),
    ...Object.keys(REWRITES),
  ]);
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
          const changed = VALUE_CHANGED[tag]?.[a.name];
          if (changed && changed.when(a.value ?? "")) {
            warnings.push(`<${tag}> ${a.name}: ${changed.note}`);
          }
          const newP = map[a.name];
          if (!newP) continue;
          if (VALUE_AWARE[a.name] && a.value !== null && VALUE_AWARE[a.name](a.value)) continue;
          edits.push({
            at: a.at,
            end: a.at + a.name.length,
            text: newP,
            hit: `<${tag}> ${a.name} → ${newP}`,
          });
        }
        const rewrite = REWRITES[tag]?.(out, attrs, m.index + name.length + 1);
        if (rewrite) {
          for (const e of rewrite.edits) edits.push({ ...e, hit: `<${tag}> ${e.hit}` });
          for (const w of rewrite.warnings) warnings.push(`<${tag}> ${w}`);
        }
      }
    }
    // Right to left, so an earlier edit's offsets stay valid. Overlaps cannot
    // both be applied; the first one wins and the second is dropped rather
    // than corrupting the span.
    edits.sort((x, y) => y.at - x.at);
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

// Importable as a module (for tests); the CLI below runs only when invoked directly.
const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (!invokedDirectly) { /* imported */ } else {
const [dir, ...flags] = process.argv.slice(2);
if (!dir) { console.error("usage: codemod-2.0.mjs <dir> [--dry]"); process.exit(1); }
const dry = flags.includes("--dry");
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".next" || e.name === ".git") continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx|jsx|mdx)$/.test(e.name)) files.push(p);
  }
})(dir);

let total = 0, touched = 0, totalWarnings = 0;
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  const { out, hits, warnings } = transform(src);
  if (!hits.length && !warnings.length) continue;
  if (warnings.length) {
    console.log(`${f}`);
    for (const w of [...new Set(warnings)]) console.log(`   ! ${w}  — value changed, fix by hand`);
    totalWarnings += warnings.length;
    if (!hits.length) continue;
  }
  touched++; total += hits.length;
  if (!warnings.length) console.log(`${f}`);
  for (const h of [...new Set(hits)]) console.log(`   ${h}  ×${hits.filter((x) => x === h).length}`);
  if (!dry) fs.writeFileSync(f, out);
}
console.log(
  `\n${total} rename${total === 1 ? "" : "s"} across ${touched} file${touched === 1 ? "" : "s"}` +
    (totalWarnings ? `, ${totalWarnings} value change${totalWarnings === 1 ? "" : "s"} to fix by hand` : "") +
    (dry ? " (dry run)" : ""),
);
}
