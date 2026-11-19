/**
 * Is this a 1.x tree? The 3.0 codemod reads 2.x code: on 1.x it would rename
 * what 2.0 renamed differently (`isOpen`, `hasPrefix`, `height` on Input) and
 * miss the subpath moves, so it stops and points at the 2.0 codemod instead.
 *
 * Two kinds of evidence, either one enough:
 *   - the installed or declared `@once-ui-system/core` is below 2 (the nearest
 *     package.json up from the directory, then its lockfile or node_modules
 *     when the range says nothing, like `latest`);
 *   - the source uses what only 1.x had: a chart, CodeBlock or MediaUpload
 *     export imported from the root barrel (2.0 moved them to subpaths), or a
 *     1.x prop name on the component 2.0 renamed it on (`<Dialog isOpen>`,
 *     `<Input hasPrefix>`).
 * A 2.x or 3.0 tree has neither.
 */
import fs from "node:fs";
import path from "node:path";

export const ONE_X_MESSAGE =
  "this looks like 1.x: run the 2.0 codemod first (node codemod-2.0.mjs <dir>, see MIGRATING.md \"1.8.x → 2.0\"), then this one";

const PKG = "@once-ui-system/core";

/** Exports the root barrel had only in 1.x (2.0 moved them to subpaths). */
const MOVED = new Set([
  "BarChart", "ChartHeader", "ChartMode", "ChartProps", "ChartStatus", "ChartVariant",
  "DataPoint", "DataTooltip", "Legend", "LineBarChart", "LineChart", "LinearGauge",
  "LinearGradient", "PieChart", "RadialGauge", "RadialGradient",
  "CodeBlock", "CodeBlockProps", "MediaUpload", "MediaUploadProps",
]);

/** component → the 1.x prop names 2.0 renamed on it. */
const OLD_PROPS = {
  Dialog: ["isOpen"], Modal: ["isOpen"], KbarContent: ["isOpen"],
  DatePicker: ["isOpen", "isNested"], DropdownWrapper: ["isOpen", "isNested"],
  Checkbox: ["isChecked", "isIndeterminate"], RadioButton: ["isChecked"], Switch: ["isChecked"],
  NavIcon: ["isActive"],
  ...Object.fromEntries(
    ["Input", "Textarea", "Select", "NumberInput", "TagInput", "ColorInput", "DateInput", "DateRangeInput", "PasswordInput"]
      .map((c) => [c, ["hasPrefix", "hasSuffix"]]),
  ),
};

/** The major of a version or a range's lower bound, or null when it names none. */
export function majorOf(range) {
  if (typeof range !== "string") return null;
  if (/^(?:file|link|workspace|git|github|https?):/.test(range)) return null;
  const m = /(\d+)(?:\.(?:\d+|x|\*))?/.exec(range.replace(/^npm:[^@]*@/, ""));
  return m ? Number(m[1]) : null;
}

const readJson = (p) => {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
};

/** The version the tree is on, from the nearest package.json naming the package. */
export function installedVersion(dir) {
  for (let d = path.resolve(dir); ; d = path.dirname(d)) {
    const pkg = readJson(path.join(d, "package.json"));
    const range = pkg && { ...pkg.devDependencies, ...pkg.peerDependencies, ...pkg.dependencies }[PKG];
    if (range) {
      const installed = readJson(path.join(d, "node_modules", PKG, "package.json"))?.version;
      if (installed) return { version: installed, where: path.join(d, "node_modules", PKG) };
      const lock = readJson(path.join(d, "package-lock.json"));
      const locked = lock?.packages?.[`node_modules/${PKG}`]?.version ?? lock?.dependencies?.[PKG]?.version;
      if (locked) return { version: locked, where: path.join(d, "package-lock.json") };
      return { version: range, where: path.join(d, "package.json") };
    }
    if (path.dirname(d) === d) return null;
  }
}

/** What in one file only 1.x code would have, as `line: text` reasons. */
export function oneXSigns(src) {
  const signs = [];
  const lineAt = (i) => src.slice(0, i).split("\n").length;
  const imported = new Set();
  for (const m of src.matchAll(/import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*["']@once-ui-system\/core["']/g)) {
    for (const raw of m[1].split(",")) {
      const name = raw.trim().replace(/^type\s+/, "").split(/\s+as\s+/)[0].trim();
      if (!name) continue;
      imported.add(name);
      if (MOVED.has(name)) signs.push({ line: lineAt(m.index), text: `${name} imported from the root barrel (2.0 moved it to a subpath)` });
    }
  }
  for (const [tag, props] of Object.entries(OLD_PROPS)) {
    if (!imported.has(tag)) continue;
    const re = new RegExp(`<${tag}\\b[^>]*?\\s(${props.join("|")})(?=[\\s=/>])`, "g");
    for (const m of src.matchAll(re))
      signs.push({ line: lineAt(m.index), text: `<${tag} ${m[1]}> is the 1.x name` });
  }
  return signs;
}

/**
 * The reasons to think `dir` is 1.x, or null. `files` are the sources the
 * codemod would read; only the first few signs are kept, for the message.
 */
export function detectOneX(dir, files) {
  const reasons = [];
  const v = installedVersion(dir);
  const major = v && majorOf(v.version);
  if (major !== null && major !== undefined && major < 2) reasons.push(`${PKG} ${v.version} (${v.where})`);
  for (const f of files) {
    let src;
    try {
      src = fs.readFileSync(f, "utf8");
    } catch {
      continue;
    }
    for (const s of oneXSigns(src)) {
      if (reasons.length >= 4) break;
      reasons.push(`${f}:${s.line}  ${s.text}`);
    }
    if (reasons.length >= 4) break;
  }
  return reasons.length ? reasons : null;
}
