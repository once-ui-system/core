import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The build ships every Sass module precompiled to a CSS module and points the
 * JS at it (`scripts/compile-css-modules.js`), so an app needs no Sass to use
 * Once UI. These pin that contract on the built `dist/`: no emitted code
 * imports Sass, every style import resolves, and each compiled module keeps
 * the class names, keyframes and custom properties its source declares.
 *
 * Requires `dist/` (turbo wires `test` to depend on `build`; locally run
 * `pnpm build` first if this suite errors on a missing dist).
 */

const PKG_ROOT = join(__dirname, "..", "..");
const SRC = join(PKG_ROOT, "src");
const DIST = join(PKG_ROOT, "dist");
// Copied into dist, but not package code: the CLIs and the agent harness.
const NOT_CODE = new Set(["ai", "agent", "scripts"].map((dir) => join(DIST, dir)));

const walk = (dir: string, keep: (name: string) => boolean, files: string[] = []): string[] => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!NOT_CODE.has(full)) walk(full, keep, files);
    } else if (keep(entry.name)) {
      files.push(full);
    }
  }
  return files;
};

const STYLE_IMPORT = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)["']([^"'\n]+\.s?[ac]ss)["']/g;
const sassModules = walk(SRC, (name) => name.endsWith(".module.scss"));
const compiledPath = (file: string) =>
  join(DIST, relative(SRC, file)).replace(/\.module\.scss$/, ".module.css");

/** Names the source declares literally: classes, keyframes, custom properties. */
const declaredNames = (scss: string) => {
  const code = scss
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1")
    .replace(/^\s*@(use|forward|include)\b.*$/gm, "");
  const names = (pattern: RegExp) => [...new Set([...code.matchAll(pattern)].map((m) => m[1]))];
  return {
    classes: names(/\.(-?[_a-zA-Z][\w-]*)/g),
    keyframes: names(/@keyframes\s+([\w-]+)/g),
    properties: names(/(--[\w-]+)\s*:/g),
  };
};

describe("precompiled CSS modules", () => {
  it("compiles every Sass module", () => {
    expect(sassModules.length).toBeGreaterThan(0);
    const missing = sassModules.filter((file) => !existsSync(compiledPath(file)));
    expect(missing.map((file) => relative(PKG_ROOT, file))).toEqual([]);
  });

  it("leaves no emitted code importing Sass, and every style import resolves", () => {
    const sassImports: string[] = [];
    const unresolved: string[] = [];
    for (const file of walk(DIST, (name) => name.endsWith(".js") || name.endsWith(".d.ts"))) {
      for (const [, specifier] of readFileSync(file, "utf8").matchAll(STYLE_IMPORT)) {
        const where = `${relative(DIST, file)} -> ${specifier}`;
        if (/\.s[ac]ss$/.test(specifier)) sassImports.push(where);
        else if (!existsSync(resolve(dirname(file), specifier))) unresolved.push(where);
      }
    }
    expect(sassImports).toEqual([]);
    expect(unresolved).toEqual([]);
  });

  it("resolves all Sass: no @use, mixins, variables or interpolation remain", () => {
    const leftovers = sassModules.flatMap((file) => {
      const css = readFileSync(compiledPath(file), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
      const found = css.match(
        /@(use|forward|import|include|mixin|function|if|else|each)\b|#\{|\$[\w-]+\s*:/,
      );
      return found ? [`${relative(SRC, file)}: ${found[0]}`] : [];
    });
    expect(leftovers).toEqual([]);
  });

  it("keeps every class, keyframes name and custom property the source declares", () => {
    const lost = sassModules.flatMap((file) => {
      const css = readFileSync(compiledPath(file), "utf8");
      const { classes, keyframes, properties } = declaredNames(readFileSync(file, "utf8"));
      const wanted = [
        ...classes.map((name) => `.${name}`),
        ...keyframes.map((name) => `@keyframes ${name}`),
        ...properties.map((name) => `${name}:`),
      ];
      return wanted
        .filter((token) => !new RegExp(`${token.replace(/[.-]/g, "\\$&")}(?![\\w-])`).test(css))
        .map((token) => `${relative(SRC, file)}: ${token}`);
    });
    expect(lost).toEqual([]);
  });
});
