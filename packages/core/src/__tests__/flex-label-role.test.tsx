import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Column } from "../components/Column";
import { Flex } from "../components/Flex";
import { LayoutProvider } from "../contexts/LayoutProvider";

/**
 * ARIA does not allow `aria-label` on a plain div or span without a role
 * (axe `aria-prohibited-attr`, flagged by Lighthouse on several sites), so a
 * labelled Flex with no role of its own renders as a `group`.
 */
describe("Flex with a label", () => {
  it("gets role=group when labelled and given no role", () => {
    expect(renderToStaticMarkup(<Flex aria-label="Surfaces" />)).toContain('role="group"');
    expect(renderToStaticMarkup(<Column aria-labelledby="h" />)).toContain('role="group"');
  });

  it("keeps an explicit role", () => {
    const html = renderToStaticMarkup(<Flex aria-label="Tabs" role="tablist" />);
    expect(html).toContain('role="tablist"');
    expect(html).not.toContain('role="group"');
  });

  it("leaves other elements and unlabelled Flex alone", () => {
    expect(renderToStaticMarkup(<Flex as="nav" aria-label="Main" />)).not.toContain("role=");
    expect(renderToStaticMarkup(<Flex />)).not.toContain("role=");
  });

  it("applies on the client path too", () => {
    const html = renderToStaticMarkup(
      <LayoutProvider>
        <Flex aria-label="Card" style={{ color: "red" }} />
      </LayoutProvider>,
    );
    expect(html).toContain('role="group"');
  });
});
