import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { afterEach, describe, expect, expectTypeOf, it } from "vitest";
import { ThemeInit } from "../components/ThemeInit";
import { defineConfig } from "../config";
import { DataThemeProvider, useDataTheme } from "../contexts/DataThemeProvider";
import { ThemeProvider, useStyle } from "../contexts/ThemeProvider";

/**
 * Every app copied an untyped `once-ui.config.js` and then cast each value back
 * to the union the providers take (`style.brand as Schemes`, eleven times per
 * app), and renamed keys by hand for ThemeInit (`solidStyle` → `"solid-style"`).
 * `defineConfig` types the file once; the sections then go to the providers
 * exactly as written.
 *
 * The type assertions here are checked by `pnpm typecheck` (tsconfig includes
 * the tests): an unused `@ts-expect-error` is itself an error, so each one
 * proves a typo is caught.
 */

const font = { variable: "font-heading-x", className: "x", style: { fontFamily: "Geist" } };

const config = defineConfig({
  baseURL: "https://example.com",
  fonts: { heading: font, body: font, label: font, code: font, faces: [font] },
  style: {
    theme: "system",
    neutral: "gray",
    brand: "cyan",
    accent: "violet",
    solid: "contrast",
    solidStyle: "plastic",
    border: "playful",
    surface: "filled",
    transition: "all",
    scaling: "100",
  },
  dataStyle: {
    variant: "gradient",
    mode: "divergent",
    height: 24,
    axis: { stroke: "var(--neutral-alpha-weak)" },
    tick: { fill: "var(--neutral-on-background-weak)", fontSize: 11, line: false },
  },
  // The app's own sections pass through.
  social: [{ name: "GitHub", link: "https://github.com/once-ui-system" }],
});

describe("defineConfig", () => {
  it("has no runtime imports, so the ./config entry is safe anywhere", () => {
    // once-ui.config is imported by route handlers, middleware and scripts.
    // A value import here would drag the whole package into each of them.
    const source = readFileSync(join(__dirname, "..", "config.ts"), "utf8");
    const imports = source.match(/^import .*$/gm) ?? [];
    expect(imports.length).toBeGreaterThan(0);
    for (const line of imports) expect(line).toMatch(/^import type /);
  });

  it("returns its argument unchanged", () => {
    const input = { style: { brand: "cyan" as const } };
    expect(defineConfig(input)).toBe(input);
  });

  it("keeps the literal types the config was written with", () => {
    expectTypeOf(config.style.brand).toEqualTypeOf<"cyan">();
    expectTypeOf(config.style.solidStyle).toEqualTypeOf<"plastic">();
    expectTypeOf(config.dataStyle.mode).toEqualTypeOf<"divergent">();
    expectTypeOf(config.fonts.heading.variable).toEqualTypeOf<string>();
    expectTypeOf(config.fonts.faces).toBeArray();
    expectTypeOf(config.social[0].name).toEqualTypeOf<string>();
  });

  it("rejects a value outside the union", () => {
    // @ts-expect-error — "yelow" is not a scheme
    defineConfig({ style: { brand: "yelow" } });
    // @ts-expect-error — "outlined" is not a chart variant
    defineConfig({ dataStyle: { variant: "outlined" } });
  });

  it("rejects a misspelt key in a section Once UI owns", () => {
    // @ts-expect-error — solidstyle is not a style key
    defineConfig({ style: { brand: "cyan", solidstyle: "flat" } });
    // @ts-expect-error — strok is not an axis key
    defineConfig({ dataStyle: { axis: { strok: "red" } } });
  });

  it("checks a key that takes either shape against both", () => {
    // A scale once or per theme, a background once or per theme.
    defineConfig({
      style: {
        brandScale: { 600: "#18372A" },
        accentScale: { light: { 600: "#4E7A00" }, dark: { 600: "#B8F23A" } },
        pageBackground: "#F7F5EF",
        surfaceBackground: { light: "#fff", dark: "neutral-background-strong" },
      },
    });
    // @ts-expect-error — lite is neither a step nor a theme
    defineConfig({ style: { brandScale: { lite: { 600: "#fff" } } } });
    // @ts-expect-error — dim is not a theme
    defineConfig({ style: { pageBackground: { dim: "#000" } } });
  });
});

describe("the config as written goes to the providers", () => {
  afterEach(() => {
    localStorage.clear();
    for (const name of document.documentElement.getAttributeNames()) {
      if (name.startsWith("data-")) document.documentElement.removeAttribute(name);
    }
  });

  it("ThemeProvider and DataThemeProvider take the sections spread, no casts", () => {
    let seen: { solidStyle?: string; brand?: string; mode?: string } = {};
    function Probe() {
      const { solidStyle, brand } = useStyle();
      const { mode } = useDataTheme();
      seen = { solidStyle, brand, mode };
      return null;
    }

    render(
      <ThemeProvider {...config.style}>
        <DataThemeProvider {...config.dataStyle}>
          <Probe />
        </DataThemeProvider>
      </ThemeProvider>,
    );

    expect(seen).toEqual({ solidStyle: "plastic", brand: "cyan", mode: "divergent" });
    expect(document.documentElement.getAttribute("data-solid-style")).toBe("plastic");
  });

  it("ThemeInit takes the style section and kebab-cases its keys", () => {
    const element = ThemeInit({ config: config.style, dataStyle: config.dataStyle }) as {
      props: { dangerouslySetInnerHTML: { __html: string } };
    };
    new Function(element.props.dangerouslySetInnerHTML.__html)();

    const root = document.documentElement;
    expect(root.getAttribute("data-solid-style")).toBe("plastic");
    expect(root.hasAttribute("data-solidstyle")).toBe(false);
    expect(root.getAttribute("data-brand")).toBe("cyan");
    // The chart *mode* is the viz style, not the variant.
    expect(root.getAttribute("data-viz-style")).toBe("divergent");
  });

  it("ThemeInit still takes the 2.0 attribute-named config", () => {
    // What a 2.0 layout passes: an untyped config file's plain strings,
    // renamed to attribute names by hand. It must keep compiling.
    const style: Record<string, string> = { brand: "red", solidStyle: "flat" };
    const element = ThemeInit({
      config: {
        theme: "light",
        brand: style.brand,
        accent: "indigo",
        neutral: "sand",
        solid: "color",
        "solid-style": style.solidStyle,
        border: "rounded",
        surface: "translucent",
        transition: "micro",
        scaling: "105",
        "viz-style": "sequential",
      },
    }) as { props: { dangerouslySetInnerHTML: { __html: string } } };
    new Function(element.props.dangerouslySetInnerHTML.__html)();

    expect(document.documentElement.getAttribute("data-solid-style")).toBe("flat");
    expect(document.documentElement.getAttribute("data-viz-style")).toBe("sequential");
  });
});
