import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import manifest from "../../ai/manifest.json";
import spec from "../../ai/spec.json";

/**
 * 2.1 added three entry points (`/mdx`, `/config`, and the OG handlers on
 * `/next`) and a hook an app reaches for by name (`useHotkeys`). The spec held
 * components only, from four barrels, so none of these reached an agent:
 * `defineConfig` and `createMdxComponents` are functions, and the MDX elements
 * and `/next`'s `LayoutProvider` sat in barrels the generator never walked.
 */
type Entry = {
  group: string;
  importFrom?: string;
  props?: Record<string, string>;
  mixins?: string[];
};
type Fn = { importFrom?: string; kind: string; signature?: string; type?: string; doc?: string };
type Row = { use: string; peer?: string; exports?: string[]; types?: string[] };

const components = spec.components as unknown as Record<string, Entry>;
const functions = (spec as unknown as { functions: Record<string, Fn> }).functions;
const types = spec.types as unknown as Record<string, unknown>;
const imports = (manifest as unknown as { imports: Record<string, Row> }).imports;
const slice = (name: string) =>
  path.join(__dirname, "..", "..", "ai", "components", `${name}.json`);

const MDX = "@once-ui-system/core/mdx";
const NEXT = "@once-ui-system/core/next";
const CONFIG = "@once-ui-system/core/config";

describe("harness entry points", () => {
  it.each([
    ["mdxComponents", MDX, "value"],
    ["createMdxComponents", MDX, "function"],
    ["createOgFetchRoute", NEXT, "function"],
    ["createOgProxyRoute", NEXT, "function"],
    ["defineConfig", CONFIG, "function"],
  ])("documents %s, imported from %s", (name, from, kind) => {
    expect(functions[name]?.importFrom).toBe(from);
    expect(functions[name]?.kind).toBe(kind);
  });

  it("documents the root hooks without an importFrom", () => {
    expect(functions.useHotkeys).toMatchObject({ kind: "hook" });
    expect(functions.useHotkeys.importFrom).toBeUndefined();
    expect(functions.useHotkeys.signature).toContain("options?: UseHotkeysOptions");
    expect(functions.useInViewport?.kind).toBe("hook");
  });

  it("keeps a parameter's declared type name and resolves it", () => {
    expect(functions.createOgFetchRoute.signature).toBe(
      "(options?: OgFetchRouteOptions) => OgRouteHandlers",
    );
    for (const name of [
      "OgFetchRouteOptions",
      "OgRouteHandlers",
      "UseHotkeysOptions",
      "OnceUIConfig",
    ]) {
      expect(types[name]).toBeDefined();
    }
  });

  it.each(["MdxHeading", "MdxParagraph", "MdxCodeBlock", "MdxTable"])(
    "%s has a slice that says to import it from /mdx",
    (name) => {
      expect(components[name]?.importFrom).toBe(MDX);
      expect(existsSync(slice(name))).toBe(true);
      expect(JSON.parse(readFileSync(slice(name), "utf8")).importFrom).toBe(MDX);
    },
  );

  it("lists the margins an MDX element takes, not every spacing prop", () => {
    expect(components.MdxHeading.mixins ?? []).not.toContain("SpacingProps");
    expect(components.MdxHeading.props).toHaveProperty("marginTop");
    expect(components.MdxHeading.props).not.toHaveProperty("padding");
  });

  it("gives /next's LayoutProvider its own props, not itself as a base", () => {
    expect(components.LayoutProvider.importFrom).toBe(NEXT);
    expect(components.LayoutProvider.props).toHaveProperty("children");
    expect((components.LayoutProvider as { extends?: string[] }).extends).toBeUndefined();
  });

  it.each([
    "Tabs",
    "TabList",
    "Tab",
    "TabPanel",
    "Drawer",
    "VisuallyHidden",
    "Breadcrumbs",
    "KeyTip",
  ])("has %s on the root", (name) => {
    expect(components[name]).toBeDefined();
    expect(components[name].importFrom).toBeUndefined();
  });

  it("tells an agent in the manifest which specifier holds what", () => {
    expect(imports[MDX]).toMatchObject({ peer: "prismjs" });
    expect(imports[MDX].exports).toEqual(
      expect.arrayContaining(["mdxComponents", "createMdxComponents", "MdxHeading"]),
    );
    expect(imports[MDX].types).toContain("MdxComponents");
    expect(imports[NEXT].exports).toEqual(
      expect.arrayContaining(["LayoutProvider", "createOgFetchRoute", "createOgProxyRoute"]),
    );
    expect(imports[CONFIG].exports).toEqual(["defineConfig"]);
    expect(imports[CONFIG].types).toContain("OnceUIConfig");
    expect(imports["@once-ui-system/core/components/<Name>"].exports).toEqual([
      "MediaAudioPlayer",
      "MediaVideoPlayer",
    ]);
  });
});
