import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
// @ts-expect-error: a plain .mjs script, no types
import { MUST_RENAME, overlap } from "../scripts/tailwind-overlap.mjs";

const ROOT = join(__dirname, "..");
const adapter = readFileSync(join(ROOT, "tailwind/tailwind.css"), "utf8");
const tokens = readFileSync(join(ROOT, "dist/css/tokens.css"), "utf8");

/**
 * tailwind/tailwind.css, the Tailwind CSS v4 adapter. Tailwind's utilities
 * sit in a layer above Once UI's, so any class name both define takes
 * Tailwind's rule on Once UI's elements as well (scripts/tailwind-overlap.mjs).
 */
describe("tailwind adapter", () => {
  it("shares no class name whose meaning differs from Tailwind's", async () => {
    const { shared } = await overlap();
    expect(shared.filter((name: string) => MUST_RENAME.test(name))).toEqual([]);
  }, 60_000);

  it("keeps every other shared name off Tailwind (run scripts/tailwind-overlap.mjs)", async () => {
    const { shared } = await overlap();
    const blocked = [...adapter.matchAll(/@source not inline\("([^"]*)"\)/g)].flatMap((m) =>
      m[1].split(/\s+/),
    );
    expect(blocked).toEqual(shared);
  }, 60_000);

  it("names the layer order before anything else", () => {
    const firstRule = adapter
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .trim()
      .split("\n")[0];
    expect(firstRule).toBe("@layer properties, theme, base, once-ui, components, utilities;");
  });

  it("maps only tokens that exist", () => {
    const used = [...adapter.matchAll(/var\((--[\w-]+)\)/g)].map((m) => m[1]);
    const missing = [...new Set(used)].filter((name) => !tokens.includes(`${name}:`));
    expect(missing).toEqual([]);
  });
});
