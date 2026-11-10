import { describe, expect, it } from "vitest";
import { createTheme, defaultSettings, resolveTokens, withAlpha } from "../src/theme";

const dark = { ...defaultSettings, theme: "dark" as const };

describe("theme", () => {
  it("follows the cascade: brand, theme and solid all apply", () => {
    const t = resolveTokens({ ...dark, brand: "emerald", solid: "color" }, 1280);
    const base = resolveTokens(dark, 1280);
    expect(t["brand-solid-strong"]).toBe(t["scheme-emerald-500"]);
    // Core's default solid is "contrast": a neutral solid, not the brand.
    expect(base["brand-solid-strong"]).toBe(base["scheme-gray-1000"]);
  });

  it("resolves translucent references: light alphas are step 400, dark step 600", () => {
    const light = resolveTokens({ ...defaultSettings, theme: "light" }, 400);
    const dark = resolveTokens({ ...defaultSettings, theme: "dark" }, 400);
    const step = (theme: Record<string, unknown>, n: number) =>
      String(theme[`function-neutral-${n}`]).slice(0, 7);
    expect(light["neutral-alpha-weak"]).toBe(`${step(light, 400)}26`);
    expect(light["neutral-alpha-medium"]).toBe(`${step(light, 400)}4d`);
    expect(light["neutral-alpha-strong"]).toBe(`${step(light, 400)}80`);
    expect(String(dark["neutral-alpha-strong"]).slice(0, 7)).toBe(step(dark, 600));
  });

  it("scales a colour's own alpha by a translucent reference", () => {
    expect(withAlpha("#808080", 0.5)).toBe("#80808080");
    expect(withAlpha("#80808080", 0.5)).toBe("#80808040");
    expect(withAlpha("1rem", 0.5)).toBeUndefined();
  });

  it("uses the phone breakpoint and root size on narrow screens", () => {
    const phone = createTheme(dark, 390);
    const desktop = createTheme(dark, 1440);
    expect(phone.rem).toBe(15);
    expect(desktop.rem).toBe(16);
    // responsive-space-m is static-space-24 on desktop, static-space-12 on phones.
    expect(desktop.space("m")).toBe(24);
    expect(phone.space("m")).toBe(12 * (15 / 16));
    expect(createTheme({ ...dark, mobileSize: "17" }, 390).rem).toBe(17);
  });

  it("scales spacing with `scaling`", () => {
    expect(createTheme({ ...dark, scaling: "110" }, 1440).space("16")).toBeCloseTo(17.6);
  });

  it("reads radius from the border style", () => {
    expect(createTheme({ ...dark, border: "sharp" }, 1440).radius("l")).toBe(0);
    expect(createTheme({ ...dark, border: "rounded" }, 1440).radius("l")).toBe(28);
  });

  it("builds text styles like core's font classes", () => {
    const t = createTheme(dark, 1440, { heading: "Geist" });
    expect(t.text("display-strong-xl")).toMatchObject({
      fontSize: 80,
      lineHeight: 80,
      fontWeight: "600",
      fontFamily: "Geist",
      letterSpacing: -4,
    });
    expect(t.text("body-default-m")).toMatchObject({
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "300",
    });
  });

  it("turns shadows into boxShadow plus platform fallbacks", () => {
    const s = createTheme(dark, 1440).shadow("m");
    expect(s.boxShadow).toMatch(/^0px 0px 2px 0px #0000001f, /);
    expect(s.elevation).toBeGreaterThan(0);
  });
});
