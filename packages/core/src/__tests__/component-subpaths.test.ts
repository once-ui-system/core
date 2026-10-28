import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * `@once-ui-system/core/components/<Name>` imports one component file.
 *
 * Next 16 builds with Turbopack, which ignores `optimizePackageImports`: a
 * server component that imports Button from the package root ships every
 * client component to the browser (about 150 KB gzip on a page with a Button and a
 * few layout components, in a measured Next 16.2 build). A subpath import
 * ships what the page uses (about 26 KB). The subpath is only useful if the
 * file named after a component exports that component.
 */

const pkg = JSON.parse(readFileSync(join(__dirname, "../../package.json"), "utf8"));
const COMPONENTS = join(__dirname, "../components");

describe("component subpaths", () => {
  it("maps ./components/* to one built file per component", () => {
    expect(pkg.exports["./components/*"]).toEqual({
      types: "./dist/components/*.d.ts",
      default: "./dist/components/*.js",
    });
  });

  it("exports each component from the file named after it", () => {
    const missing = readdirSync(COMPONENTS)
      .filter((file) => /^[A-Z]\w*\.tsx?$/.test(file) && !/Context\.tsx?$/.test(file))
      .filter((file) => {
        const name = file.replace(/\.tsx?$/, "");
        const source = readFileSync(join(COMPONENTS, file), "utf8");
        return !new RegExp(
          `export\\s*(\\{[^}]*\\b${name}\\b|(const|function|class)\\s+${name}\\b)`,
        ).test(source);
      });
    expect(missing).toEqual([]);
  });
});
