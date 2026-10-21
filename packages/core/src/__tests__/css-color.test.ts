import { describe, expect, it } from "vitest";
import { cssColor, isRawColor } from "../internal/cssColor";

/**
 * E3: one resolver for free colour props. 2.x wrapped every value in
 * `var(--…)`, so `#fff` became `var(--#fff)` and `brand-weak` became
 * `var(--brand-weak)`, and neither painted anything.
 */
describe("cssColor", () => {
  it("passes raw CSS colours through", () => {
    for (const raw of [
      "#fff",
      "#112233aa",
      "rgb(0 0 0)",
      "rgba(0, 0, 0, 0.5)",
      "hsl(200 50% 50%)",
      "oklch(70% 0.1 200)",
      "color-mix(in srgb, red 50%, blue)",
      "var(--brand-solid-strong)",
      "white",
      "rebeccapurple",
      "transparent",
      "currentColor",
    ]) {
      expect(cssColor(raw)).toBe(raw);
      expect(isRawColor(raw)).toBe(true);
    }
  });

  it("resolves token names to their custom property", () => {
    expect(cssColor("brand-on-background-weak")).toBe("var(--brand-on-background-weak)");
    expect(cssColor("accent-solid-strong")).toBe("var(--accent-solid-strong)");
    expect(cssColor("neutral-alpha-medium")).toBe("var(--neutral-alpha-medium)");
    expect(cssColor("--my-colour")).toBe("var(--my-colour)");
  });

  it("reads a tone and weight as that tone's on-background colour", () => {
    expect(cssColor("brand-weak")).toBe("var(--brand-on-background-weak)");
    expect(cssColor("danger-strong")).toBe("var(--danger-on-background-strong)");
  });

  it("reads a palette hue as the charts' token when given their prefix", () => {
    expect(cssColor("blue", "data-")).toBe("var(--data-blue)");
    expect(cssColor("green", "data-")).toBe("var(--data-green)");
    expect(cssColor("contrast", "data-")).toBe("var(--data-contrast)");
    expect(cssColor("#0af", "data-")).toBe("#0af");
    expect(cssColor("brand-solid-strong", "data-")).toBe("var(--brand-solid-strong)");
    // Without the prefix a named colour is a CSS colour.
    expect(cssColor("green")).toBe("green");
  });

  it("never produces var(--#…)", () => {
    for (const v of ["#fff", " #fff ", "rgb(1,2,3)"])
      expect(cssColor(v)).not.toMatch(/var\(--[#(]/);
  });
});
