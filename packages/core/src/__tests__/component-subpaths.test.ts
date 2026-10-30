import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import pkg from "../../package.json";

/**
 * `@once-ui-system/core/components/<Name>` imports one public component file.
 *
 * Next 16 builds with Turbopack, which ignores `optimizePackageImports`: a
 * server component that imports Button from the package root ships every
 * client component to the browser (about 150 KB gzip on a page with a Button
 * and four layout components, in a measured Next 16.2 build). A subpath import
 * ships what the page uses (about 26 KB).
 *
 * 3.0 dropped the 2.x `./components/*` wildcard because it made every file in
 * dist/components public, internals included. These are listed one by one,
 * for exactly the modules the root barrel re-exports whole, by
 * `scripts/sync-component-exports.mjs`.
 */

const exportsMap = (pkg as unknown as { exports: Record<string, unknown> }).exports;
const barrel = readFileSync(join(__dirname, "../components/index.ts"), "utf8");
const publicModules = [...barrel.matchAll(/^export \* from "\.\/([A-Za-z]\w*)\.js";$/gm)].map(
  (m) => m[1],
);

describe("component subpaths", () => {
  it("has one entry per module the root barrel re-exports, and no others", () => {
    const keys = Object.keys(exportsMap).filter((key) => key.startsWith("./components/"));
    expect(keys).toEqual(publicModules.map((name) => `./components/${name}`));
    expect(keys.length).toBeGreaterThan(50);
  });

  it("points each entry at that component's built file and types", () => {
    for (const name of publicModules) {
      expect(exportsMap[`./components/${name}`]).toEqual({
        types: `./dist/components/${name}.d.ts`,
        default: `./dist/components/${name}.js`,
      });
    }
  });

  it("exports each component from the file named after it", () => {
    const missing = publicModules
      .filter((name) => !name.endsWith("Context"))
      .filter((name) => {
        const source = readFileSync(join(__dirname, `../components/${name}.tsx`), "utf8");
        return !new RegExp(
          `export\\s*(\\{[^}]*\\b${name}\\b|(const|function|class)\\s+${name}\\b)`,
        ).test(source);
      });
    expect(missing).toEqual([]);
  });
});
