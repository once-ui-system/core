import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { type ThemeConfig, ThemeInit } from "../components/ThemeInit";

describe("ThemeInit", () => {
  const defaultConfig: ThemeConfig = {
    theme: "system",
    brand: "blue",
    accent: "indigo",
    neutral: "gray",
    solid: "contrast",
    "solid-style": "flat",
    border: "playful",
    surface: "filled",
    transition: "all",
    scaling: "100",
    "viz-style": "gradient",
  };

  beforeEach(() => {
    localStorage.clear();
    // Clear custom attributes on document.documentElement
    const root = document.documentElement;
    const attrs = Array.from(root.attributes).map((a) => a.name);
    attrs.forEach((attr) => {
      if (attr.startsWith("data-")) {
        root.removeAttribute(attr);
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a script element with default id='theme-init'", () => {
    const { container } = render(<ThemeInit config={defaultConfig} />);
    const script = container.querySelector("script");

    expect(script).toBeInTheDocument();
    expect(script).toHaveAttribute("id", "theme-init");
  });

  it("supports custom id, nonce, and script attributes", () => {
    const { container } = render(
      <ThemeInit
        config={defaultConfig}
        id="custom-theme-init"
        nonce="test-nonce-123"
        data-testid="theme-script"
      />,
    );
    const script = container.querySelector("script");

    expect(script).toHaveAttribute("id", "custom-theme-init");
    expect(script).toHaveAttribute("nonce", "test-nonce-123");
    expect(script).toHaveAttribute("data-testid", "theme-script");
  });

  it("safely escapes script breakout attempts in config values", () => {
    const maliciousConfig: ThemeConfig = {
      theme: 'dark</script><script>alert("xss")</script>',
      brand: "blue",
    };

    const { container } = render(<ThemeInit config={maliciousConfig} />);
    const script = container.querySelector("script");
    const scriptContent = script?.innerHTML || "";

    expect(scriptContent).not.toContain("</script>");
    expect(scriptContent).toContain("\\u003c/script>");
  });

  it("executes script and applies data attributes to document.documentElement", () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query.includes("dark"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { container } = render(<ThemeInit config={defaultConfig} />);
    const script = container.querySelector("script");
    const scriptContent = script?.innerHTML || "";

    // Evaluate the inline script in JSDOM
    new Function(scriptContent)();

    const root = document.documentElement;
    expect(root.getAttribute("data-brand")).toBe("blue");
    expect(root.getAttribute("data-accent")).toBe("indigo");
    expect(root.getAttribute("data-neutral")).toBe("gray");
    expect(root.getAttribute("data-solid")).toBe("contrast");
    expect(root.getAttribute("data-solid-style")).toBe("flat");
    expect(root.getAttribute("data-border")).toBe("playful");
    expect(root.getAttribute("data-surface")).toBe("filled");
    expect(root.getAttribute("data-transition")).toBe("all");
    expect(root.getAttribute("data-scaling")).toBe("100");
    expect(root.getAttribute("data-viz-style")).toBe("gradient");
    expect(root.getAttribute("data-theme")).toBe("dark");
  });

  it("resolves system theme to light when prefers-color-scheme is light", () => {
    window.matchMedia = vi.fn().mockImplementation(() => ({
      matches: false,
      media: "(prefers-color-scheme: dark)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { container } = render(<ThemeInit config={{ theme: "system", brand: "emerald" }} />);
    const script = container.querySelector("script");
    new Function(script?.innerHTML || "")();

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-brand")).toBe("emerald");
  });

  it("prioritizes saved localStorage data-theme over config", () => {
    localStorage.setItem("data-theme", "light");

    const { container } = render(<ThemeInit config={{ theme: "dark", brand: "violet" }} />);
    const script = container.querySelector("script");
    new Function(script?.innerHTML || "")();

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("applies localStorage overrides for custom style attributes", () => {
    localStorage.setItem("data-brand", "moss");
    localStorage.setItem("data-border", "rounded");

    const { container } = render(<ThemeInit config={defaultConfig} />);
    const script = container.querySelector("script");
    new Function(script?.innerHTML || "")();

    expect(document.documentElement.getAttribute("data-brand")).toBe("moss");
    expect(document.documentElement.getAttribute("data-border")).toBe("rounded");
  });

  it("normalizes camelCase config properties to kebab-case attributes", () => {
    const camelConfig: ThemeConfig = {
      theme: "dark",
      solidStyle: "plastic",
      vizStyle: "sequential",
    };

    const { container } = render(<ThemeInit config={camelConfig} />);
    const script = container.querySelector("script");
    new Function(script?.innerHTML || "")();

    expect(document.documentElement.getAttribute("data-solid-style")).toBe("plastic");
    expect(document.documentElement.getAttribute("data-viz-style")).toBe("sequential");
  });

  it("handles errors gracefully and defaults to dark theme", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(localStorage, "getItem").mockImplementation(() => {
      throw new Error("localStorage restricted");
    });

    const { container } = render(<ThemeInit config={defaultConfig} />);
    const script = container.querySelector("script");
    new Function(script?.innerHTML || "")();

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(errorSpy).toHaveBeenCalled();
  });
});
