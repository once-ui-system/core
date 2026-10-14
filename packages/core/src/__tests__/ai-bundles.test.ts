import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import spec from "../../ai/spec.json";

/**
 * In the 2.1.0-rc.0 benchmark an agent opened the 131 KB `spec.json` in 50
 * of 60 runs, each time to look up a type a slice named but did not define,
 * and it read the 40 KB catalog and a dozen slices one call at a time. These
 * keep the harness an agent reads self-contained and small.
 */
const AI = path.join(__dirname, "..", "..", "ai");
const read = (file: string) => JSON.parse(readFileSync(path.join(AI, file), "utf8"));
const types = spec.types as unknown as Record<string, unknown>;
const typeNames = (value: unknown) =>
  [...JSON.stringify(value ?? null).matchAll(/[A-Za-z_][A-Za-z0-9_]*/g)]
    .map(([word]) => word)
    .filter((word) => Object.hasOwn(types, word));

type Slice = { props?: unknown; returns?: unknown; types?: Record<string, unknown> };
const slices = readdirSync(path.join(AI, "components")).map(
  (file) => [file, read(`components/${file}`) as Slice] as const,
);
const index = read("tasks/index.json") as { tasks: { id: string; file: string }[] };

describe("ai harness without spec.json", () => {
  it.each(slices)("%s defines every type it names", (_, slice) => {
    const defined = slice.types ?? {};
    const named = typeNames([slice.props, slice.returns, Object.values(defined)]);
    expect(named.filter((name) => !defined[name])).toEqual([]);
  });

  it("never sends an agent to spec.json from a slice, a bundle or the compact rules", () => {
    for (const [file, slice] of slices)
      expect([file, JSON.stringify(slice)]).not.toContain("spec.json");
    for (const file of readdirSync(path.join(AI, "bundles"))) {
      expect(readFileSync(path.join(AI, "bundles", file), "utf8")).not.toMatch(/see spec\.json/);
    }
    const rules = readFileSync(path.join(AI, "rules.compact.md"), "utf8");
    expect(rules.match(/spec\.json/g)).toHaveLength(1);
    expect(rules).toMatch(/Never open `spec\.json`/);
  });

  it("keeps the catalog small enough to load on every task", () => {
    expect(statSync(path.join(AI, "catalog.json")).size).toBeLessThan(25_000);
  });
});

describe("ai task bundles in one file", () => {
  it.each(index.tasks.map((t) => [t.id, t.file] as const))(
    "%s has a bundle with every slice, type and gotcha its task names",
    (id, file) => {
      const task = read(file) as { components: string[]; gotchas?: string[] };
      const bundle = read(`bundles/${id}.json`) as {
        components: Record<string, Slice>;
        gotchas: Record<string, string>;
        mixins: Record<string, unknown>;
        types: Record<string, unknown>;
      };
      expect(Object.keys(bundle.components)).toEqual(task.components);
      expect(Object.keys(bundle.gotchas)).toEqual(task.gotchas ?? []);
      const named = typeNames([
        Object.values(bundle.components).map((c) => [c.props, c.returns]),
        Object.values(bundle.mixins),
        Object.values(bundle.types),
      ]);
      expect(named.filter((name) => !bundle.types[name])).toEqual([]);
    },
  );
});
