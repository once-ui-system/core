/**
 * Node loader hook for check-tailwind.mjs: `import styles from "./X.module.css"`
 * gives an object whose class names are `X__name`, as a bundler's CSS modules
 * would give a hashed name, so module classes cannot be mistaken for
 * Tailwind's (`.hidden`, `.container`). The scoped CSS is collected by
 * scopeModuleCss() from the same file.
 */
import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { fileURLToPath } from "node:url";

const prefix = (file) =>
  basename(file)
    .replace(/\.module\.css$/, "")
    .replace(/\W/g, "_");

/** The module's CSS with each class outside `:global(…)` scoped to its file. */
export function scopeModuleCss(file) {
  const css = readFileSync(file, "utf8");
  const p = prefix(file);
  let out = "";
  let i = 0;
  while (i < css.length) {
    const at = css.indexOf(":global(", i);
    const end = at < 0 ? css.length : at;
    out += css.slice(i, end).replace(/\.(-?[A-Za-z_][\w-]*)/g, `.${p}__$1`);
    if (at < 0) break;
    let depth = 0;
    let j = at + ":global".length;
    for (; j < css.length; j++) {
      if (css[j] === "(") depth++;
      else if (css[j] === ")" && --depth === 0) break;
    }
    // :global(x) is x, unscoped.
    out += css.slice(at + ":global(".length, j);
    i = j + 1;
  }
  return out;
}

export async function load(url, context, next) {
  if (!url.endsWith(".module.css")) return next(url, context);
  const p = prefix(fileURLToPath(url));
  return {
    format: "module",
    shortCircuit: true,
    source: `export default new Proxy({}, { get: (_, k) => typeof k === "string" ? ${JSON.stringify(p)} + "__" + k : undefined });`,
  };
}
