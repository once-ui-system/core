import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Under `data-solid="contrast"` the brand solids resolve to neutral
 * (`--brand-solid-strong` is `--function-neutral-1000` in dark), which is the
 * point of that style for buttons — and why anything that took "the brand
 * colour" from `--brand-solid-strong` lost its hue: Studio's WarpTunnel and
 * ParticleMorph drew near-white on once-ui.com.
 *
 * `--brand-color-*` is the brand solid as `data-solid="color"` has it, in both
 * themes, and no solid style may touch it.
 */
const THEME = readFileSync(join(__dirname, "..", "scss", "tokens", "theme.scss"), "utf8");

/** The declarations of the first rule whose selector list is exactly `selector`. */
const block = (selector: string): Record<string, string> => {
  const escaped = selector.replace(/[[\]"=]/g, "\\$&");
  const match = THEME.match(new RegExp(`(?:^|\\n)${escaped}(?:,[^{]*)?\\s*\\{([^}]*)\\}`));
  if (!match) throw new Error(`no rule for ${selector}`);
  return Object.fromEntries(
    [...match[1].matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]),
  );
};

describe("--brand-color-*", () => {
  for (const theme of ["dark", "light"]) {
    it(`matches the data-solid="color" brand solids in ${theme}`, () => {
      const base = block(`[data-theme="${theme}"]`);
      const color = block(`[data-theme="${theme}"][data-solid="color"]`);
      for (const weight of ["strong", "medium", "weak"]) {
        expect(base[`--brand-color-${weight}`]).toBe(color[`--brand-solid-${weight}`]);
        expect(base[`--brand-color-${weight}`]).toMatch(/^var\(--function-brand-\d+\)$/);
      }
    });
  }

  it("is set by no solid style", () => {
    for (const rule of THEME.matchAll(/([^{}]*\[data-solid[^{]*)\{([^}]*)\}/g)) {
      expect(rule[2]).not.toContain("--brand-color-");
    }
  });
});
