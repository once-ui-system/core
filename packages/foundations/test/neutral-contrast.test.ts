import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { oklchToHex } from "../scripts/export-tokens.mjs";

/**
 * WCAG AA for body text is 4.5:1. The light theme's weakest text colour,
 * `--neutral-on-background-weak`, is a neutral palette's step 500: sand's
 * read 4.48:1 and slate's 4.49:1 on white, just under, until both were
 * nudged a hair darker. Every neutral a theme can pick is checked here, on
 * white, through the hex the token export writes (what a screen shows).
 */
const ROOT = join(__dirname, "..");
const scss = (name: string) => readFileSync(join(ROOT, "scss/tokens", name), "utf8");

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = Number.parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const onWhite = (hex: string) => 1.05 / (luminance(hex) + 0.05);

describe("light theme: neutral-on-background-weak", () => {
  const theme = scss("theme.scss");
  const step = /\[data-theme="light"\][^{]*\{[^}]*--neutral-on-background-weak:\s*var\(--function-neutral-(\d+)\)/.exec(
    theme,
  )?.[1];
  const functions = scss("function.scss");
  const schemes = scss("scheme.scss");
  const neutrals = [...functions.matchAll(/\[data-neutral="(\w+)"\]/g)]
    .map((m) => m[1])
    .filter((n) => n !== "custom");

  it("is a step of the neutral palette, for every neutral a theme can pick", () => {
    expect(step).toBeDefined();
    expect(neutrals).toEqual(expect.arrayContaining(["gray", "sand", "slate", "rose", "mint", "dusk"]));
  });

  it.each(neutrals)("%s reads at least 4.5:1 on white", (neutral) => {
    const m = new RegExp(`--scheme-${neutral}-${step}:\\s*oklch\\(([\\d.]+) ([\\d.]+) ([\\d.]+)\\)`).exec(schemes);
    expect(m, `--scheme-${neutral}-${step}`).not.toBeNull();
    const hex = oklchToHex(Number(m?.[1]), Number(m?.[2]), Number(m?.[3]));
    expect(onWhite(hex)).toBeGreaterThanOrEqual(4.5);
  });
});
