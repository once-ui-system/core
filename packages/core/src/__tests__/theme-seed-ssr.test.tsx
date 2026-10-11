// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ThemeInit } from "../components/ThemeInit";
import { ThemeProvider } from "../contexts/ThemeProvider";
import {
  customSchemeProperties,
  generateColorScheme,
  schemeAlphaVariants,
} from "../utils/colorScheme";

/**
 * `brand: "custom"` had no way to supply its palette before the first paint.
 * `generateColorScheme` ran only in the browser, through `setProperty`, so a
 * server-rendered page painted `data-brand="custom"` against no
 * `--scheme-brand-*` at all — a page with no brand colour — until script ran.
 * Studio shipped a second pre-paint script to cover it.
 *
 * A seed in the style config is now generated on the server, by the same pure
 * function the client uses, and ThemeInit renders it into a <style> beside
 * its script. This file runs in Node, with no DOM, as a server render does.
 */

const SEED = "#5A93FC";

const styleOf = (markup: string) =>
  markup.match(/<style id="theme-init-schemes">([^<]*)<\/style>/)?.[1] ?? null;

const scriptConfig = (markup: string): Record<string, string> => {
  const json = markup.match(/const config = (\{[^;]*\});/)?.[1];
  if (!json) throw new Error("config not found in the ThemeInit script");
  return JSON.parse(json);
};

const declarations = (css: string) =>
  Object.fromEntries(
    [...css.matchAll(/(--[\w-]+):([^;]+);/g)].map((match) => [match[1], match[2]]),
  );

describe("ThemeInit renders a seeded scheme on the server", () => {
  it("emits the generated ramp in a <style>, before the script", () => {
    const markup = renderToStaticMarkup(
      <ThemeInit config={{ solid: "contrast", brandSeed: SEED }} />,
    );
    const css = styleOf(markup);
    expect(css).not.toBeNull();
    expect(css?.startsWith(":root{")).toBe(true);
    expect(markup.indexOf("<style")).toBeLessThan(markup.indexOf("<script"));

    const scheme = generateColorScheme(SEED);
    if (!scheme) throw new Error("seed did not parse");
    const expected: Record<string, string> = {};
    for (const [weight, value] of Object.entries(scheme)) {
      expected[`--scheme-brand-${weight}`] = value;
    }
    for (const [suffix, value] of Object.entries(schemeAlphaVariants(scheme))) {
      expected[`--scheme-brand-${suffix}`] = value;
    }
    expect(declarations(css ?? "")).toEqual(expected);
  });

  it("implies brand: custom, and keeps the seed out of the attributes", () => {
    const config = scriptConfig(renderToStaticMarkup(<ThemeInit config={{ brandSeed: SEED }} />));
    expect(config.brand).toBe("custom");
    expect(Object.keys(config).some((key) => key.includes("seed"))).toBe(false);
  });

  it("leaves a named scheme alone", () => {
    const markup = renderToStaticMarkup(
      <ThemeInit config={{ brand: "blue", accent: "custom", accentSeed: "oklch(0.7 0.15 30)" }} />,
    );
    const config = scriptConfig(markup);
    expect(config.brand).toBe("blue");
    expect(config.accent).toBe("custom");
    expect(Object.keys(declarations(styleOf(markup) ?? ""))).toContain("--scheme-accent-600");
  });

  it("generates all three seedable schemes", () => {
    const css = styleOf(
      renderToStaticMarkup(
        <ThemeInit config={{ brandSeed: SEED, accentSeed: "#e5484d", neutralSeed: "#8b8d98" }} />,
      ),
    );
    const names = Object.keys(declarations(css ?? ""));
    for (const scheme of ["brand", "accent", "neutral"]) {
      expect(names.filter((name) => name.startsWith(`--scheme-${scheme}-`))).toHaveLength(15);
    }
  });

  it("renders the script alone, unchanged, without a seed", () => {
    const markup = renderToStaticMarkup(<ThemeInit config={{ brand: "cyan" }} />);
    expect(markup.startsWith('<script id="theme-init">')).toBe(true);
    expect(markup).not.toContain("<style");
  });

  it("ignores a seed it cannot parse rather than pointing at nothing", () => {
    const markup = renderToStaticMarkup(<ThemeInit config={{ brandSeed: "not a colour" }} />);
    expect(markup).not.toContain("<style");
    expect(scriptConfig(markup).brand).toBeUndefined();
  });

  it("ThemeProvider renders on the server with a seed", () => {
    expect(() =>
      renderToString(
        <ThemeProvider brandSeed={SEED}>
          <span />
        </ThemeProvider>,
      ),
    ).not.toThrow();
  });
});

describe("the properties are the ones the CSS reads", () => {
  it("matches every --scheme-<name>-* that data-<name>=custom maps", () => {
    const tokens = readFileSync(
      join(__dirname, "../../../foundations/scss/tokens/function.scss"),
      "utf8",
    );
    for (const scheme of ["brand", "accent", "neutral"] as const) {
      const block = tokens.match(new RegExp(`\\[data-${scheme}="custom"\\]\\s*\\{([^}]*)\\}`));
      if (!block) throw new Error(`no [data-${scheme}="custom"] block`);
      const read = [...block[1].matchAll(/var\((--scheme-[\w-]+)\)/g)].map((m) => m[1]).sort();
      const written = Object.keys(customSchemeProperties({ [scheme]: SEED })).sort();
      expect(written).toEqual(read);
    }
  });
});
