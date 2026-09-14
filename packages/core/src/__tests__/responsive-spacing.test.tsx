import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Flex } from "../components/Flex";
import { ServerFlex } from "../components/ServerFlex";

/**
 * A token in a breakpoint prop used to resolve to nothing at all.
 *
 * `s={{ gap: "4" }}` is what the docs and every example teach, but no `.s-g-4`
 * class existed and ClientFlex's inline path guards on
 * `typeof value === "number"`, so the string fell through both. Numbers worked,
 * tokens did not, and neither said so. Measured in Chromium at 600px before the
 * fix: gap stayed 15px and padding 22.5px, the base values.
 */
const classesOf = (el: React.ReactElement) => {
  const html = renderToStaticMarkup(el);
  const at = html.indexOf('class="') + 7;
  return html.slice(at, html.indexOf('"', at));
};

describe("breakpoint spacing", () => {
  it("emits a class for every spacing prefix at a breakpoint", () => {
    const classes = classesOf(
      <ServerFlex s={{ gap: "4", padding: "8", marginTop: "16", paddingX: "24" }}>x</ServerFlex>,
    );
    expect(classes).toContain("s-g-4");
    expect(classes).toContain("s-p-8");
    expect(classes).toContain("s-mt-16");
    expect(classes).toContain("s-px-24");
  });

  it("cascades a breakpoint down to the narrower ones", () => {
    const classes = classesOf(<ServerFlex s={{ gap: "4" }}>x</ServerFlex>);
    expect(classes).toContain("s-g-4");
    expect(classes).toContain("xs-g-4");
  });

  it("lets a narrower breakpoint override a wider one", () => {
    const classes = classesOf(<ServerFlex s={{ gap: "4" }} xs={{ gap: "16" }}>x</ServerFlex>);
    expect(classes).toContain("s-g-4");
    expect(classes).toContain("xs-g-16");
    expect(classes).not.toContain("xs-g-4");
  });

  it("leaves a numeric value to the inline path", () => {
    // `gap: 0.25` is a rem value with no class behind it; only tokens map.
    const classes = classesOf(<ServerFlex s={{ gap: 0.25 }}>x</ServerFlex>);
    expect(classes).not.toMatch(/s-g-/);
  });

  /**
   * The point of the whole exercise: a responsive Flex renders on the server.
   * No `use client` boundary, no LayoutProvider, and the layout is right in
   * the first paint rather than after an effect. This works only because the
   * breakpoints are fixed — a stylesheet cannot carry a width the app picks at
   * runtime, since `@media` does not read custom properties.
   */
  it("renders a responsive Flex on the server, with no provider", () => {
    const html = renderToStaticMarkup(<Flex direction="row" gap="16" s={{ direction: "column", gap: "4" }}>x</Flex>);
    expect(html).toContain("s-flex-column");
    expect(html).toContain("s-g-4");
  });

  it("keeps the values a class cannot express on the client", () => {
    // A rem gap, a free-form width, and `xl` — which is Infinity, the base
    // state, and which ServerFlex's cascade does not read.
    for (const el of [
      <Flex key="n" s={{ gap: 0.25 }}>x</Flex>,
      <Flex key="w" s={{ width: 20 }}>x</Flex>,
      <Flex key="x" xl={{ gap: "4" }}>x</Flex>,
    ]) {
      expect(() => renderToStaticMarkup(el)).toThrow(/LayoutProvider/);
    }
  });
});
