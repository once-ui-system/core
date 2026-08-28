import { beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeInit } from "../components/ThemeInit";

/**
 * ThemeInit emits a blocking inline <script> as a template literal. Nothing in
 * the normal build pipeline type-checks or parses that string, so a bad edit
 * inside it ships to npm and only shows up as a console error in consumer apps
 * (this happened: a `displayName` assignment was injected into the literal,
 * throwing ReferenceError on every page load and pinning the theme).
 *
 * These tests parse and run the emitted script, so the failure mode is a red
 * test rather than a runtime error in someone else's app.
 */

const config = {
  theme: "system",
  brand: "blue",
  accent: "indigo",
  neutral: "gray",
  solid: "contrast",
  "solid-style": "flat",
  border: "playful",
  surface: "translucent",
  transition: "all",
  scaling: "100",
  "viz-style": "categorical",
};

function emittedScript(): string {
  // ThemeInit is a plain function component returning a <script> element.
  const element = ThemeInit({ config }) as React.ReactElement<{
    dangerouslySetInnerHTML: { __html: string };
  }>;
  return element.props.dangerouslySetInnerHTML.__html;
}

/** Run the emitted script against the jsdom document. */
function runScript(): void {
  // biome-ignore lint/security/noGlobalEval: executing the emitted script is the point of the test
  new Function(emittedScript())();
}

describe("ThemeInit emitted script", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-theme");
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("is syntactically valid JavaScript", () => {
    expect(() => new Function(emittedScript())).not.toThrow();
  });

  it("references nothing from the module scope", () => {
    // The script runs in the browser before any bundle loads, so any identifier
    // from this module (ThemeInit, React, imports) would be a ReferenceError.
    expect(emittedScript()).not.toContain("displayName");
    expect(emittedScript()).not.toContain("ThemeInit");
  });

  it("runs without throwing and reports no error", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(runScript).not.toThrow();
    expect(error).not.toHaveBeenCalled();
  });

  it("applies every config key as a data attribute", () => {
    runScript();
    for (const [key, value] of Object.entries(config)) {
      if (key === "theme") continue; // theme is resolved, not copied verbatim
      expect(document.documentElement.getAttribute(`data-${key}`)).toBe(value);
    }
  });

  it("resolves theme 'system' from the media query", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) => ({ matches: query.includes("dark") }) as MediaQueryList,
    );
    runScript();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("prefers a saved theme over the config default", () => {
    localStorage.setItem("data-theme", "light");
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) => ({ matches: query.includes("dark") }) as MediaQueryList,
    );
    runScript();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("applies saved style overrides on top of the config", () => {
    localStorage.setItem("data-brand", "cyan");
    runScript();
    expect(document.documentElement.getAttribute("data-brand")).toBe("cyan");
  });

  it("falls back to the system preference when it throws", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    // Force the try block to fail after the media-query stub is in place.
    const storage = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("localStorage unavailable");
    });
    vi.spyOn(window, "matchMedia").mockImplementation(
      () => ({ matches: false }) as MediaQueryList,
    );

    expect(runScript).not.toThrow();
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    storage.mockRestore();
  });
});
