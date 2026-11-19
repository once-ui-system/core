import { describe, expect, it } from "vitest";
import catalog from "../../ai/catalog.json";
import seed from "../../ai/catalog.seed.json";
import spec from "../../ai/spec.json";

/**
 * The catalog is half of the bootstrap an agent loads, and its purposes are
 * the only thing in it that says what a component is for. They are written
 * by hand in `catalog.seed.json`. When the seed was deleted the generator
 * fell back to "X component" for all 140 entries and nothing failed.
 */
type CatalogEntry = { purpose: string; tags: string[]; importFrom?: string; pairsWith?: string[] };
const entries = catalog.components as unknown as Record<string, CatalogEntry>;
const seeded = seed as unknown as Record<string, { purpose?: string; partOf?: string }>;
const components = spec.components as unknown as Record<string, { importFrom?: string }>;

describe("ai catalog", () => {
  it("has a written purpose for every component in the spec", () => {
    const missing = Object.keys(components).filter((name) => !seeded[name]?.purpose);
    expect(missing).toEqual([]);
  });

  it("describes no component the spec does not have", () => {
    expect(Object.keys(seeded).filter((name) => !components[name])).toEqual([]);
  });

  it("never falls back to a generic purpose", () => {
    const generic = Object.entries(entries).filter(
      ([name, entry]) => entry.purpose === `${name} component`,
    );
    expect(generic.map(([name]) => name)).toEqual([]);
  });

  it("carries the icon names, so an agent never opens the spec for one", () => {
    expect(catalog.iconNames).toEqual(spec.iconNames);
    expect(catalog.iconNames.length).toBeGreaterThan(50);
  });

  it("keeps each purpose to one line", () => {
    for (const entry of Object.values(entries)) {
      expect(entry.purpose).not.toMatch(/\n/);
      expect(entry.purpose.length).toBeLessThanOrEqual(130);
    }
  });

  it("says where a component outside the package root is imported from", () => {
    for (const [name, entry] of Object.entries(components)) {
      if (seeded[name]?.partOf) continue;
      expect(entries[name]?.importFrom).toBe(entry.importFrom);
    }
    expect(entries.LineChart.importFrom).toBe("@once-ui-system/core/data");
  });

  it("leaves a component's parts to its slices, each with its purpose", () => {
    const parts = Object.keys(seeded).filter((name) => seeded[name].partOf);
    expect(parts).toContain("StylePanelRoot");
    for (const name of parts) {
      expect(entries[name]).toBeUndefined();
      expect(entries[seeded[name].partOf as string]).toBeDefined();
    }
  });
});
