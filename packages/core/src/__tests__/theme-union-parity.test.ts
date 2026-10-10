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
  const source = readFileSync(THEME_PROVIDER, "utf8");
  const block = source.match(new RegExp(`export type ${name} =([^;]*);`));
  if (!block) throw new Error(`${name} not found in ThemeProvider.tsx`);
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
  ["BodySize", "body-size", []],
  ["BodyLineHeight", "body-line-height", []],
];

describe("ThemeProvider unions match the CSS", () => {
  it.each(cases)("%s lists every data-%s value tokens.css styles", (type, attribute, defaults) => {
    // "custom" is a separate arm (`NeutralColor | "custom"`), not a palette.
    const css = cssValues(attribute).filter((value) => value !== "custom");
    expect(unionValues(type)).toEqual([...css, ...defaults].sort());
  });
});
