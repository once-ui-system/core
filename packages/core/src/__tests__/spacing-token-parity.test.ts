import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The spacing scale is stated in two places that cannot import each other: the
 * SCSS generator's spec, which decides what classes exist, and `StaticSpacingToken`,
 * which decides what `padding=` accepts. They had already drifted — the layout
 * layer defined `--static-space-72` and shipped no class for it, and the type
 * did not list it either, so a step of the scale was simply unreachable.
 *
 * A class with no token is dead CSS; a token with no class is a prop that
 * type-checks and then does nothing at all.
 */
const FOUNDATIONS = join(__dirname, "../../../foundations");

const specTokens = (): string[] => {
  const src = readFileSync(join(FOUNDATIONS, "scripts/utilities.spec.mjs"), "utf8");
  const block = src.match(/export const SPACING_TOKENS = \[([\s\S]*?)\];/);
  if (!block) throw new Error("SPACING_TOKENS not found in the generator spec");
  return [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
};

const typeTokens = (): string[] => {
  const src = readFileSync(join(__dirname, "../types.ts"), "utf8");
  const block = src.match(/export type StaticSpacingToken =([\s\S]*?);/);
  if (!block) throw new Error("StaticSpacingToken not found");
  return [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
};

describe("spacing token parity", () => {
  it("offers every numeric class the generator emits", () => {
    const numeric = specTokens().filter((t) => /^\d+$/.test(t));
    expect(typeTokens()).toEqual(numeric);
  });

  it("keeps the t-shirt sizes out of the static type", () => {
    // Those live in ResponsiveSpacingToken; a t-shirt size in the static union
    // would claim `--static-space-m` exists, and it does not.
    expect(typeTokens().every((t) => /^\d+$/.test(t))).toBe(true);
  });

  it("includes 72, the step that had a token but no class or type", () => {
    expect(typeTokens()).toContain("72");
    expect(specTokens()).toContain("72");
  });
});
