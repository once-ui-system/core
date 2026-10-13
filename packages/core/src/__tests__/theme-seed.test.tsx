import { render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ThemeProvider } from "../contexts/ThemeProvider";
import { customSchemeProperties } from "../utils/colorScheme";

/**
 * On the client, a seed is applied by the same pure function ThemeInit runs
 * on the server, written onto <html>. That is what lets a seed change after
 * load (an editor previewing a colour) and what keeps a seed working in an
 * app that does not render ThemeInit.
 */

const root = document.documentElement;

afterEach(() => {
  localStorage.clear();
  root.removeAttribute("style");
  for (const name of root.getAttributeNames()) {
    if (name.startsWith("data-")) root.removeAttribute(name);
  }
});

describe("ThemeProvider with a seed", () => {
  it("writes the generated scheme onto <html> and implies brand=custom", () => {
    render(
      <ThemeProvider brandSeed="#5A93FC">
        <span />
      </ThemeProvider>,
    );
    const expected = customSchemeProperties({ brand: "#5A93FC" });
    for (const [property, value] of Object.entries(expected)) {
      expect(root.style.getPropertyValue(property)).toBe(value);
    }
    expect(root.getAttribute("data-brand")).toBe("custom");
  });

  it("follows a seed that changes, and cleans up after itself", () => {
    const view = render(
      <ThemeProvider accent="custom" accentSeed="#e5484d">
        <span />
      </ThemeProvider>,
    );
    const first = root.style.getPropertyValue("--scheme-accent-600");
    expect(first).not.toBe("");

    view.rerender(
      <ThemeProvider accent="custom" accentSeed="#30a46c">
        <span />
      </ThemeProvider>,
    );
    const second = root.style.getPropertyValue("--scheme-accent-600");
    expect(second).toBe(customSchemeProperties({ accent: "#30a46c" })["--scheme-accent-600"]);
    expect(second).not.toBe(first);

    view.unmount();
    expect(root.style.getPropertyValue("--scheme-accent-600")).toBe("");
  });

  it("does not switch to custom on a seed it cannot parse", () => {
    render(
      <ThemeProvider brandSeed="not a colour">
        <span />
      </ThemeProvider>,
    );
    expect(root.getAttribute("data-brand")).toBe("blue");
    expect(root.style.getPropertyValue("--scheme-brand-600")).toBe("");
  });
});
