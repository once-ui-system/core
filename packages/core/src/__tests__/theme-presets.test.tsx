// @vitest-environment node
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ThemeInit } from "../components/ThemeInit";
import { defineConfig, themePreset, themePresets } from "../config";
import * as root from "../index";

/**
 * Agents building on the template's default theme score as "generic" in blind
 * ratings however well they compose. A preset is a whole look for a kind of
 * app: page and surface in both themes, brand, accent, solids, corners,
 * density, motion and faces, so `themePreset("ops")` starts designed.
 */

const NAMES = Object.keys(themePresets) as (keyof typeof themePresets)[];

const scriptConfig = (markup: string): Record<string, string> => {
  const json = markup.match(/const config = (\{[^;]*\});/)?.[1];
  if (!json) throw new Error("config not found in the ThemeInit script");
  return JSON.parse(json);
};

describe("theme presets", () => {
  it("ships ops, care, creative and commerce", () => {
    expect(NAMES).toEqual(["ops", "care", "creative", "commerce"]);
  });

  it.each(NAMES)("%s sets every axis a look needs", (name) => {
    const { style, dataStyle, fonts, description } = themePresets[name];
    for (const key of [
      "defaultTheme",
      "neutral",
      "brand",
      "accent",
      "solid",
      "solidStyle",
      "border",
      "transition",
      "pageBackground",
      "surfaceBackground",
    ] as const) {
      expect(style[key], `${name}.${key}`).toBeDefined();
    }
    for (const key of ["pageBackground", "surfaceBackground"] as const) {
      const value = style[key] as { light: string; dark: string };
      expect(value.light).toMatch(/^#[0-9a-f]{6}$/);
      expect(value.dark).toMatch(/^#[0-9a-f]{6}$/);
    }
    // The theme is a starting point: the visitor can still switch.
    expect(style.theme).toBe("system");
    expect(dataStyle.mode).toBeDefined();
    expect(description.length).toBeGreaterThan(20);
    for (const role of ["heading", "body", "code"] as const) {
      expect(fonts[role].nextFont).toBe(fonts[role].family.replace(/ /g, "_"));
    }
  });

  it("gives every preset its own look", () => {
    const signature = (name: (typeof NAMES)[number]) => {
      const s = themePresets[name].style;
      return [
        s.neutral,
        s.brand,
        s.solid,
        s.border,
        themePresets[name].fonts.heading.family,
      ].join();
    };
    expect(new Set(NAMES.map(signature)).size).toBe(NAMES.length);
  });

  it.each(NAMES)("%s renders through ThemeInit before the first paint", (name) => {
    const { style } = themePreset(name);
    const markup = renderToStaticMarkup(<ThemeInit config={style} />);
    const config = scriptConfig(markup);
    expect(config.neutral).toBe(style.neutral);
    expect(config.border).toBe(style.border);
    expect(markup).toContain((style.pageBackground as { dark: string }).dark);
    if (style.brandSeed) expect(markup).toContain('id="theme-init-schemes"');
  });

  it("passes defineConfig unchanged", () => {
    const ops = themePreset("ops");
    const config = defineConfig({ style: ops.style, dataStyle: ops.dataStyle });
    expect(config.style).toEqual(themePresets.ops.style);
  });

  it("puts the app's changes on top", () => {
    const { style, dataStyle } = themePreset("ops", {
      style: { border: "rounded" },
      dataStyle: { variant: "outline" },
    });
    expect(style.border).toBe("rounded");
    expect(style.neutral).toBe("slate");
    expect(dataStyle.variant).toBe("outline");
    // The preset itself is never changed.
    expect(themePresets.ops.style.border).toBe("conservative");
  });

  it("makes a seed of the app's own the brand", () => {
    expect(themePreset("ops", { style: { brandSeed: "#0f766e" } }).style).toMatchObject({
      brand: "custom",
      brandSeed: "#0f766e",
    });
  });

  it("drops the preset's seed for a named brand", () => {
    const { style } = themePreset("care", { style: { brand: "green" } });
    expect(style.brand).toBe("green");
    expect(style.brandSeed).toBeUndefined();
  });

  it("names the presets on an unknown name", () => {
    expect(() => themePreset("retro" as "ops")).toThrow(/ops, care, creative, commerce/);
  });

  it("is exported from the root too", () => {
    expect(root.themePreset).toBe(themePreset);
    expect(root.themePresets).toBe(themePresets);
  });
});
