import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { StyleScope } from "../components/StyleScope";

describe("StyleScope", () => {
  it("writes the config as data attributes on its own element", () => {
    const html = renderToStaticMarkup(
      <StyleScope config={{ brand: "red", border: "playful", solid: "contrast", theme: "dark" }}>
        hi
      </StyleScope>,
    );
    expect(html).toContain('data-brand="red"');
    expect(html).toContain('data-border="playful"');
    expect(html).toContain('data-solid="contrast"');
    expect(html).toContain('data-theme="dark"');
    expect(html).not.toContain("<style");
  });

  it("writes an invert theme, which the stylesheet resolves against the page", () => {
    const html = renderToStaticMarkup(<StyleScope config={{ theme: "invert" }}>hi</StyleScope>);
    expect(html).toContain('data-theme="invert"');
  });

  it("follows the page theme when the config's theme is system", () => {
    const html = renderToStaticMarkup(<StyleScope config={{ theme: "system" }}>hi</StyleScope>);
    expect(html).not.toContain("data-theme");
  });

  it("turns a seed into a custom scheme on the element", () => {
    const html = renderToStaticMarkup(
      <StyleScope config={{ brandSeed: "#0B6E4F" }}>hi</StyleScope>,
    );
    expect(html).toContain('data-brand="custom"');
    expect(html).toMatch(/--scheme-brand-600:/);
    // Nested data-theme subtrees are pointed back at the scope's ramp.
    expect(html).toMatch(
      /\[data-style-scope="[^"]+"\] \[data-theme\]\{--function-brand-100:var\(--scheme-brand-100\)/,
    );
  });

  it("drops a seed that does not parse", () => {
    const html = renderToStaticMarkup(
      <StyleScope config={{ brandSeed: "not a colour" }}>hi</StyleScope>,
    );
    expect(html).not.toContain("data-brand");
  });

  it("keeps per-theme scales and backgrounds to its own subtree", () => {
    const html = renderToStaticMarkup(
      <StyleScope
        config={{
          brandScale: { light: { 600: "#ff0000" }, dark: { 600: "#00ff00" } },
          pageBackground: { light: "#f7f4ef", dark: "#0f0e0c" },
        }}
      >
        hi
      </StyleScope>,
    );
    expect(html).toMatch(/\[data-style-scope="[^"]+"\]:is\(\[data-theme="light"\]/);
    expect(html).toContain("--scheme-brand-600:#ff0000");
    expect(html).toContain("--scheme-brand-600:#00ff00");
    expect(html).toContain("--page-background:#f7f4ef");
    expect(html).not.toContain("html:root");
  });

  it("sets fonts per role and refuses values that could end the declaration", () => {
    const html = renderToStaticMarkup(
      <StyleScope fonts={{ heading: "var(--font-serif)", body: "x;color:red" }}>hi</StyleScope>,
    );
    expect(html).toContain("--font-heading:var(--font-serif)");
    expect(html).not.toContain("--font-body");
  });

  it("gives two scopes their own ids", () => {
    const html = renderToStaticMarkup(
      <>
        <StyleScope config={{ brandSeed: "#ff0000" }}>a</StyleScope>
        <StyleScope config={{ brandSeed: "#0000ff" }}>b</StyleScope>
      </>,
    );
    const ids = [...html.matchAll(/data-style-scope="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(ids).size).toBe(2);
  });
});
