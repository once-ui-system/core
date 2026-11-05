import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";
import spec from "../../ai/spec.json";

/**
 * `ai/components/<Name>.json` is what an agent reads as a component's API.
 * The generator used to write a slice per spec entry and never remove one, so
 * 29 slices for 2.x components 3.0 removed or moved (Badge, Chip, Modal,
 * CursorCard, InfoTip…) stayed in the package and documented imports that do
 * not resolve. Every slice must be a spec entry, and every entry a real export
 * of the module it says to import from.
 */
const PACKAGES = path.join(__dirname, "..", "..", "..");
const ENTRIES: Record<string, string> = {
  "@once-ui-system/core": "core/src/index.ts",
  "@once-ui-system/core/next": "core/src/next/index.ts",
  "@once-ui-system/core/data": "core/src/modules/data/index.ts",
  "@once-ui-system/core/code": "core/src/modules/code/index.ts",
  "@once-ui-system/core/emoji": "core/src/modules/emoji/index.ts",
  "@once-ui-system/core/map": "core/src/modules/map/index.ts",
  "@once-ui-system/core/media": "core/src/modules/media/index.ts",
  "@once-ui-system/core/mdx": "core/src/modules/mdx/index.ts",
  "@once-ui-system/fx": "fx/src/index.ts",
  "@once-ui-system/blocks": "blocks/src/index.ts",
};

type Entry = { importFrom?: string; call?: string };
const components = spec.components as unknown as Record<string, Entry>;
const dir = path.join(__dirname, "..", "..", "ai", "components");
const slices = readdirSync(dir)
  .filter((f) => f.endsWith(".json"))
  .map((f) => f.slice(0, -5));

const exportsOf = (() => {
  const files = Object.fromEntries(
    Object.entries(ENTRIES).map(([mod, file]) => [mod, path.join(PACKAGES, file)]),
  );
  const program = ts.createProgram(Object.values(files), {
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    target: ts.ScriptTarget.ES2022,
    noEmit: true,
    skipLibCheck: true,
  });
  const checker = program.getTypeChecker();
  const names: Record<string, Set<string>> = {};
  for (const [mod, file] of Object.entries(files)) {
    const source = program.getSourceFile(file);
    const symbol = source && checker.getSymbolAtLocation(source);
    names[mod] = new Set(symbol ? checker.getExportsOfModule(symbol).map((s) => s.name) : []);
  }
  return names;
})();

describe("ai/components slices", () => {
  it("there is one per spec component, and none besides", () => {
    expect(slices.filter((name) => !(name in components))).toEqual([]);
    expect(Object.keys(components).filter((name) => !slices.includes(name))).toEqual([]);
  });

  it("every entry module is read", () => {
    for (const [mod, names] of Object.entries(exportsOf))
      expect(names.size, mod).toBeGreaterThan(0);
  });

  it.each(slices)("%s is exported where its slice says to import it from", (name) => {
    const slice = JSON.parse(readFileSync(path.join(dir, `${name}.json`), "utf8")) as Entry;
    const mod = slice.importFrom ?? "@once-ui-system/core";
    expect(ENTRIES[mod], `known module ${mod}`).toBeDefined();
    // `Meta.generate(props)` documents a call on the export `Meta`.
    const exported = (slice.call ?? name).split(".")[0].split("(")[0];
    expect(exportsOf[mod].has(exported), `${exported} from ${mod}`).toBe(true);
  });
});
