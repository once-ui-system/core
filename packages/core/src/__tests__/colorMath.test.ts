import { describe, expect, it } from "vitest";
import { luminance, mixColors, parseColor, toHex, withAlpha } from "../utils/colorMath";

function hex(input: string) {
  const color = parseColor(input);
  if (!color) throw new Error(`unreadable: ${input}`);
  return toHex(color);
}

describe("colorMath", () => {
  it("reads hex, rgb() and oklch()", () => {
    expect(hex("#0f0")).toBe("#00ff00");
    expect(hex("rgb(255 0 0)")).toBe("#ff0000");
    expect(hex("rgba(0, 0, 255, 0.5)")).toBe("#0000ff80");
    expect(hex("oklch(1 0 0)")).toBe("#ffffff");
    expect(hex("oklch(0.5463 0.1068 169.32)")).toBe("#0a8466");
    expect(parseColor("var(--brand)")).toBeUndefined();
  });

  it("mixes like color-mix in srgb", () => {
    expect(mixColors("#ffffff", "#000000", 0.5)).toBe("#808080");
    expect(mixColors("#ff0000", "#0000ff", 1)).toBe("#ff0000");
    expect(mixColors("var(--x)", "#000000", 0.2)).toBe("#000000");
  });

  it("sets alpha and reads luminance", () => {
    expect(withAlpha("#10b981", 0.5)).toBe("#10b98180");
    expect(luminance("#ffffff")).toBeCloseTo(1);
    expect(luminance("#000000")).toBe(0);
  });
});
