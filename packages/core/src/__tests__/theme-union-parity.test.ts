import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * ThemeProvider's unions and the `[data-*]` selectors in tokens.css are the
 * same list written twice, and they had drifted: the CSS shipped rose, mint
 * and dusk neutrals and a sharp corner style that the types did not accept,
 * so StylePanel offered them through a cast and an app could not pass them
 * without one.
 *
 * Each union must list every value the CSS styles, plus the values that are
 * deliberately the default and have no selector of their own.
 */
const TOKENS = join(__dirname, "../../../foundations/scss/tokens");
const THEME_PROVIDER = join(__dirname, "../contexts/ThemeProvider.tsx");
// `Density` is declared beside its table, which the server-side ThemeInit reads.
const DENSITY = join(__dirname, "../utils/density.ts");

const cssValues = (attribute: string): string[] => {
  const pattern = new RegExp(`\\[data-${attribute}="([^"]+)"\\]`, "g");
  const values = new Set<string>();
  for (const file of readdirSync(TOKENS)) {
    for (const match of readFileSync(join(TOKENS, file), "utf8").matchAll(pattern)) {
      values.add(match[1]);
    }
  }
  return [...values].sort();
};

const unionValues = (name: string): string[] => {
  const source = readFileSync(name === "Density" ? DENSITY : THEME_PROVIDER, "utf8");
  const block = source.match(new RegExp(`export type ${name} =([^;]*);`));
  if (!block) throw new Error(`${name} not found`);
  return [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]).sort();
};

const cases: [type: string, attribute: string, unstyledDefaults: string[]][] = [
  ["NeutralColor", "neutral", []],
  ["BorderStyle", "border", []],
  ["SolidType", "solid", []],
  ["SolidStyle", "solid-style", ["flat"]],
  ["SurfaceStyle", "surface", []],
  ["TransitionStyle", "transition", ["none"]],
  ["ScalingSize", "scaling", ["100"]],
  // Only the scaling a density picks lives in tokens.css; the controls' sizes
  // are in their modules (density.scss), and normal is the default m.
  ["Density", "density", ["normal"]],
  ["BodySize", "body-size", []],
  ["BodyLineHeight", "body-line-height", []],
  ["DeviceFontSize", "desktop-size", []],
  ["DeviceFontSize", "tablet-size", []],
  ["DeviceFontSize", "mobile-size", []],
  ["InteractiveCursor", "cursor-interactive", []],
];

describe("ThemeProvider unions match the CSS", () => {
  it.each(cases)("%s lists every data-%s value tokens.css styles", (type, attribute, defaults) => {
    // "custom" is a separate arm (`NeutralColor | "custom"`), not a palette.
    const css = cssValues(attribute).filter((value) => value !== "custom");
    expect(unionValues(type)).toEqual([...css, ...defaults].sort());
  });
});
