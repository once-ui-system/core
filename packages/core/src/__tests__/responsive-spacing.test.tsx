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

  it("still sends a responsive Flex to the client component", () => {
    // The class matrix ships with fixed widths, but an app can configure its
    // own breakpoints, and only a client component can read that context. Until
    // the CSS is generated against the app's own values, the routing decision
    // has to stay where the context is.
    expect(() => renderToStaticMarkup(<Flex s={{ gap: "4" }}>x</Flex>)).toThrow(/LayoutProvider/);
  });
});
