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
  Button:           { radius: "corners" },
  IconButton:       { radius: "corners" },
  ToggleButton:     { radius: "corners" },
};

/** `radius="none"` is roundness, not a corner — it keeps its name. */
const VALUE_AWARE = { radius: (raw) => raw === '"none"' || raw === "{'none'}" };

/** Find the end of the opening tag, skipping strings and nested {...}. */
function openingTagEnd(src, from) {
  let i = from, depth = 0, quote = null;
  while (i < src.length) {
    const c = src[i];
    if (quote) {
      if (c === quote && src[i - 1] !== "\\") quote = null;
    } else if (c === '"' || c === "'" || c === "`") quote = c;
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
    let depth = 0, j = i;
    while (j < src.length) {
      if (src[j] === "{") depth++;
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
      attrs.push({ name, at: i, value: raw });
      i = end;
    } else {
      attrs.push({ name, at: i, value: null });               // boolean shorthand
      i = j;
    }
  }
  return attrs;
}

export function transform(src) {
  const hits = [];
  let out = src;
  for (const [tag, map] of Object.entries(TRANSFORMS)) {
    const open = new RegExp(`<${tag}(?=[\\s/>])`, "g");
    let m;
    const edits = [];
    while ((m = open.exec(out))) {
      const end = openingTagEnd(out, m.index + tag.length + 1);
      if (end < 0) continue;
      const body = out.slice(m.index, end);
      for (const a of attributesOf(out, m.index + tag.length + 1, end)) {
        const newP = map[a.name];
        if (!newP) continue;
        if (VALUE_AWARE[a.name] && a.value !== null && VALUE_AWARE[a.name](a.value)) continue;
        edits.push({ at: a.at, len: a.name.length, to: newP, tag, oldP: a.name });
      }
    }
    edits.sort((x, y) => y.at - x.at);
    for (const e of edits) {
      out = out.slice(0, e.at) + e.to + out.slice(e.at + e.len);
      hits.push(`<${e.tag}> ${e.oldP} → ${e.to}`);
    }
  }
  return { out, hits };
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

let total = 0, touched = 0;
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  const { out, hits } = transform(src);
  if (!hits.length) continue;
  touched++; total += hits.length;
  console.log(`${f}`);
  for (const h of [...new Set(hits)]) console.log(`   ${h}  ×${hits.filter((x) => x === h).length}`);
  if (!dry) fs.writeFileSync(f, out);
}
console.log(`\n${total} rename${total === 1 ? "" : "s"} across ${touched} file${touched === 1 ? "" : "s"}${dry ? " (dry run)" : ""}`);
}
