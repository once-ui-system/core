import { act, render, renderHook } from "@testing-library/react";
import type React from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { ThemeInit } from "../components/ThemeInit";
import { ThemeProvider, useTheme } from "../contexts/ThemeProvider";
import { customSchemeProperties } from "../utils/colorScheme";

/**
 * `defaultTheme` is where a visitor starts, not a lock: `theme="light"` forces
 * light and ignores `setTheme`, which left no way to ship a light site with a
 * working switch. `brandScale` and friends pin a scheme's exact steps, so an
 * app with a brand book does not override semantic variables in CSS.
 */

const root = document.documentElement;

afterEach(() => {
  localStorage.clear();
  root.removeAttribute("style");
  for (const name of root.getAttributeNames()) {
    if (name.startsWith("data-")) root.removeAttribute(name);
  }
});

const provider =
  (props: React.ComponentProps<typeof ThemeProvider>) =>
  ({ children }: { children: React.ReactNode }) => (
    <ThemeProvider {...props}>{children}</ThemeProvider>
  );

describe("ThemeProvider defaultTheme", () => {
  it("starts on the default and lets the visitor switch", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: provider({ defaultTheme: "light", children: null }),
    });
    expect(result.current.theme).toBe("light");
    act(() => result.current.setTheme("dark"));
    expect(result.current.theme).toBe("dark");
    expect(root.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("data-theme")).toBe("dark");
  });

  it("prefers the visitor's saved choice over the default", () => {
    localStorage.setItem("data-theme", "dark");
    const { result } = renderHook(() => useTheme(), {
      wrapper: provider({ defaultTheme: "light", children: null }),
    });
    expect(result.current.theme).toBe("dark");
  });

  it("saves 'system' when the default is not system, so a reload keeps it", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: provider({ defaultTheme: "light", children: null }),
    });
    act(() => result.current.setTheme("system"));
    expect(localStorage.getItem("data-theme")).toBe("system");
    expect(result.current.theme).toBe("system");
  });

  it("still forces with theme='light'", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: provider({ theme: "light", children: null }),
    });
    act(() => result.current.setTheme("dark"));
    expect(root.getAttribute("data-theme")).toBe("light");
  });

  it("renders the same theme on the server as on the first client render", () => {
    localStorage.setItem("data-theme", "dark");
    const Probe = () => <span>{useTheme().theme}</span>;
    const html = renderToString(
      <ThemeProvider defaultTheme="light">
        <Probe />
      </ThemeProvider>,
    );
    // The saved choice is applied after hydration, not during it.
    expect(html).toContain("light");
  });
});

describe("scheme scales", () => {
  it("customSchemeProperties takes a scale's steps over the seed's", () => {
    const props = customSchemeProperties({ brand: "#5A93FC" }, { brand: { 600: "#18372A" } });
    expect(props["--scheme-brand-600"]).toBe("#18372A");
    expect(props["--scheme-brand-100"]).toBe(
      customSchemeProperties({ brand: "#5A93FC" })["--scheme-brand-100"],
    );
    expect(props["--scheme-brand-600-30"]).toBeTruthy();
  });

  it("needs step 600 when there is no seed", () => {
    expect(customSchemeProperties({}, { neutral: { 100: "#fff" } })).toEqual({});
  });

  it("ThemeProvider writes a scale and implies custom", () => {
    render(
      <ThemeProvider neutralScale={{ 100: "#12231B", 600: "#55645B", 1200: "#F7F8F2" }}>
        <span />
      </ThemeProvider>,
    );
    expect(root.style.getPropertyValue("--scheme-neutral-1200")).toBe("#F7F8F2");
    expect(root.getAttribute("data-neutral")).toBe("custom");
  });

  it("ThemeInit renders a scale on the server and keeps scale keys off <html>", () => {
    const html = renderToString(
      <ThemeInit config={{ defaultTheme: "light", brandScale: { 600: "#18372A" } }} />,
    );
    expect(html).toContain("--scheme-brand-600:#18372A");
    expect(html).not.toContain("brand-scale");
    expect(html).not.toContain("default-theme");
    expect(html).toContain('"light"');
  });
});
