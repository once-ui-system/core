import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import pkg from "../../package.json";

/**
 * Asserts every non-wildcard path in the package.json `exports` map points at
 * a file that the build actually emits (rfcs/2026-08-once-ui-2-architecture.md §5.1).
 *
 * This is the in-repo half of the package-contract checks (`pnpm check:package`
 * runs publint + arethetypeswrong against the packed tarball). It exists
 * because the `./icons`, `./types` and `./interfaces` subpaths shipped
 * pointing at `dist/<name>/index.js` while the build emits `dist/<name>.js`,
 * so all three were unresolvable for every consumer until fixed in 1.8.3.
 *
 * Requires `dist/` (turbo wires `test` to depend on `build`; locally run
 * `pnpm build` first if this suite errors on a missing dist).
 */

const PKG_ROOT = join(__dirname, "..", "..");

const collectExportPaths = (entry: unknown, paths: string[] = []): string[] => {
  if (typeof entry === "string") {
    paths.push(entry);
  } else if (entry && typeof entry === "object") {
    for (const value of Object.values(entry)) {
      collectExportPaths(value, paths);
    }
  }
  return paths;
};

describe("package exports integrity", () => {
  it("dist output exists (build must run before tests)", () => {
    expect(existsSync(join(PKG_ROOT, "dist", "index.js"))).toBe(true);
  });

  it("every non-wildcard exports path resolves to an emitted file", () => {
    const missing = Object.entries(pkg.exports as Record<string, unknown>).flatMap(
      ([subpath, entry]) =>
        collectExportPaths(entry)
          .filter((target) => !target.includes("*"))
          .filter((target) => !existsSync(join(PKG_ROOT, target)))
          .map((target) => `${subpath} -> ${target}`),
    );
    expect(missing).toEqual([]);
  });
});
