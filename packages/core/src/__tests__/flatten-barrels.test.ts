import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

/**
 * `scripts/flatten-barrels.mjs` runs after `tsc` and rewrites each built
 * `export * from` as the list of names it carries. Under Turbopack a server
 * component that imports one client component through a star-export barrel
 * ships every client component the barrel reaches, with their CSS; named
 * re-exports let it ship only what the page imports. The rewrite must not
 * change what any entry point exports.
 */

const scriptPath = "../../scripts/flatten-barrels.mjs";

let dir: string;

function write(files: Record<string, string>) {
  dir = mkdtempSync(join(tmpdir(), "flatten-barrels-"));
  for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text);
}

afterEach(() => {
  if (dir) rmSync(dir, { recursive: true, force: true });
});

describe("flatten-barrels", () => {
  it("lists the names each star export carries", async () => {
    write({
      "Button.js": `"use client";\nexport const Button = () => null;\nexport function useButton() {}\n`,
      "Column.js": "const Column = () => null;\nexport { Column };\n",
      "types.js": "export {};\n",
      "index.js": `export * from "./Button.js";\nexport * from "./Column.js";\nexport * from "./types.js";\n`,
    });
    const { flattenFile } = await import(scriptPath);
    expect(flattenFile(join(dir, "index.js"))).toBe(3);
    expect(readFileSync(join(dir, "index.js"), "utf8")).toBe(
      `export { Button, useButton } from "./Button.js";\nexport { Column } from "./Column.js";\n\n`,
    );
  });

  it("follows nested barrels and keeps the ES rules for clashes", async () => {
    write({
      "a.js": "export const shared = 1;\nexport const onlyA = 1;\nexport default 1;\n",
      "b.js": "export const shared = 2;\nexport const onlyB = 2;\n",
      "c.js": `export { onlyA as renamed } from "./a.js";\n`,
      "inner.js": `export * from "./c.js";\nexport const own = 1;\n`,
      "index.js": [
        `export * from "./a.js";`,
        `export * from "./b.js";`,
        `export * from "./inner.js";`,
        "export const onlyB = 3;",
        "",
      ].join("\n"),
    });
    const { exportedNames, flattenFile } = await import(scriptPath);
    const before = [...exportedNames(join(dir, "index.js")).keys()].sort();
    // `shared` is ambiguous between a and b, so neither star exports it;
    // `onlyB` is the module's own; `default` never travels through a star.
    expect(before).toEqual(["onlyA", "onlyB", "own", "renamed"]);
    flattenFile(join(dir, "index.js"));
    const text = readFileSync(join(dir, "index.js"), "utf8");
    expect(text).not.toContain("export *");
    expect(text).toContain(`export { onlyA } from "./a.js";`);
    expect(text).toContain(`export { own, renamed } from "./inner.js";`);
    expect(text).not.toContain("shared");
    expect(text).toContain("export const onlyB = 3;");
  });
});
