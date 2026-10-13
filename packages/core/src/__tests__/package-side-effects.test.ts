import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import pkg from "../../package.json";

/**
 * `sideEffects` tells a bundler which files it may drop when nothing uses
 * their exports. Without it every module in the package counted as having
 * side effects, so importing one component from the root kept the rest of
 * the barrel's graph alive. The list names the stylesheets, which are imported
 * for their effect alone (`import "@once-ui-system/core/css/styles.css"`) and
 * would otherwise be dropped from a production build.
 *
 * It only works if the root manifest is the one bundlers read. They read the
 * nearest package.json above a module, and the build used to write a second
 * one into `dist/`, which would have hidden the field from every file there.
 *
 * Requires `dist/` (run `pnpm build` first), like the exports test.
 */

const PKG_ROOT = join(__dirname, "..", "..");
const DIST = join(PKG_ROOT, "dist");
const SRC = join(PKG_ROOT, "src");

const walk = (dir: string, files: string[] = []): string[] => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
};

const patterns = (pkg as { sideEffects?: string[] }).sideEffects ?? [];

/**
 * A pattern without a slash matches a file at any depth: webpack, Rollup and
 * Vite, and esbuild all read it that way. The list keeps to that form so the
 * same pattern means the same thing in each of them.
 */
const keptBy = (file: string) =>
  patterns.some((pattern) =>
    new RegExp(`^${pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*")}$`).test(
      basename(file),
    ),
  );

describe("sideEffects", () => {
  it("is a list of file-name globs", () => {
    expect(patterns.length).toBeGreaterThan(0);
    expect(patterns.filter((pattern) => pattern.includes("/"))).toEqual([]);
  });

  it("keeps every stylesheet the build emits", () => {
    const stylesheets = walk(DIST).filter((file) => /\.s?css$/.test(file));
    expect(stylesheets.length).toBeGreaterThan(0);
    expect(stylesheets.filter((file) => !keptBy(file)).map((file) => relative(DIST, file))).toEqual(
      [],
    );
  });

  it("marks no JavaScript as a side effect", () => {
    const kept = walk(DIST).filter((file) => file.endsWith(".js") && keptBy(file));
    expect(kept.map((file) => relative(DIST, file))).toEqual([]);
  });

  it("holds for the source: no module is imported only for what it does on load", () => {
    // `import "./x"` with no binding is the one shape that breaks once JS is
    // side-effect free: nothing uses an export, so the bundler drops the file.
    const offenders = walk(SRC)
      .filter((file) => /\.tsx?$/.test(file) && !/(__tests__|[\\/]test[\\/]|\.test\.)/.test(file))
      .filter((file) =>
        [...readFileSync(file, "utf8").matchAll(/^import\s+["']([^"']+)["']/gm)].some(
          (match) => !/\.s?css$/.test(match[1]),
        ),
      )
      .map((file) => relative(SRC, file));
    expect(offenders).toEqual([]);
  });

  it("is read from the root manifest: the build writes no dist/package.json", () => {
    expect(existsSync(join(DIST, "package.json"))).toBe(false);
  });
});
