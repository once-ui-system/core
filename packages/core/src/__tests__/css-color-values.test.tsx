import { render } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { Background } from "../components/Background";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { cssColor } from "../internal/cssColor";

/**
 * `ColorValue` advertises raw CSS colours, but Background, ParticleFx and the
 * charts wrapped every value in `var(--…)`, so `"#fff"` became `var(--#fff)`
 * and painted nothing.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("colour props", () => {
  it("pass raw CSS colours through and turn tokens into custom properties", () => {
    for (const raw of [
      "#fff",
      "rgb(0 0 0 / 50%)",
      "hsl(200, 50%, 50%)",
      "oklch(70% 0.1 200)",
      "var(--my-colour)",
      "color-mix(in srgb, red, blue)",
      "transparent",
      "currentColor",
    ]) {
      expect(cssColor(raw), raw).toBe(raw);
      expect(cssColor(raw, "data-"), raw).toBe(raw);
    }
    expect(cssColor("brand-on-background-weak")).toBe("var(--brand-on-background-weak)");
    // The charts' scheme names, `red` included, stay tokens.
    expect(cssColor("blue", "data-")).toBe("var(--data-blue)");
    expect(cssColor("red", "data-")).toBe("var(--data-red)");
  });

  it("paint a raw colour on Background's dots, grid and gradient", () => {
    const { container } = render(
      <Background
        dots={{ display: true, color: "#ff0000" }}
        grid={{ display: true, color: "#0000ff" }}
        gradient={{ display: true, colorStart: "#111111", colorEnd: "brand-background-strong" }}
      />,
      { wrapper },
    );
    const html = container.innerHTML;
    expect(html).not.toContain("var(--#");
    expect(html).not.toContain("var(--rgb");
    expect(html).toContain("--dots-color: #ff0000");
    // jsdom drops a declaration it cannot parse, and writes one it can as rgb().
    expect(html).toContain("rgb(0, 0, 255) 1px");
    expect(html).toContain("#111111");
    expect(html).toContain("var(--brand-background-strong)");
  });
});
