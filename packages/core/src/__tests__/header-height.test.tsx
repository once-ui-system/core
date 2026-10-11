import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Flex } from "../components/Flex";
import { Grid } from "../components/Grid";
import { LayoutProvider } from "../contexts/LayoutProvider";

/**
 * An app shell scrolls a pane, not the page, and the pane is "the viewport
 * below the header" tall. The apps wrote that as
 * `calc(100dvh - var(--static-space-56))` 25 times across five apps, each one
 * restating the header's height. `--header-height` says it once;
 * `height="below-header"` (and `minHeight`, `maxHeight`) reads it.
 */
const FOUNDATIONS = join(__dirname, "../../../foundations/scss");
const LAYOUT_TOKENS = readFileSync(join(FOUNDATIONS, "tokens/layout.scss"), "utf8");
const SIZE = readFileSync(join(FOUNDATIONS, "styles/size.generated.scss"), "utf8");

const VALUE = "calc(100dvh - var(--header-height))";

const classesOf = (html: string) => {
  const at = html.indexOf('class="') + 7;
  return html.slice(at, html.indexOf('"', at)).split(" ").filter(Boolean);
};

describe("app-shell header height", () => {
  it("defines --header-height as the 56px header every shell uses", () => {
    const root = LAYOUT_TOKENS.slice(0, LAYOUT_TOKENS.indexOf("@include"));
    expect(root).toMatch(/:root \{[\s\S]*--header-height:\s*var\(--static-space-56\);/);
  });

  it("generates a utility for height, min-height and max-height", () => {
    for (const prop of ["height", "min-height", "max-height"]) {
      expect(SIZE).toContain(`.${prop}-below-header {\n  ${prop}: ${VALUE};`);
    }
    // After `.fill-height`, so the keyword wins beside `fillHeight`.
    expect(SIZE.indexOf(".height-below-header")).toBeGreaterThan(SIZE.indexOf(".fill-height"));
  });

  it("is a class on the server, with no inline height", () => {
    const html = renderToStaticMarkup(
      <Flex height="below-header" overflowY="auto">
        x
      </Flex>,
    );
    expect(classesOf(html)).toContain("height-below-header");
    expect(html).not.toMatch(/style="[^"]*height/);
  });

  it("works for minHeight and maxHeight, on Grid too", () => {
    const flex = classesOf(renderToStaticMarkup(<Flex minHeight="below-header" />));
    const grid = classesOf(renderToStaticMarkup(<Grid maxHeight="below-header" />));
    expect(flex).toContain("min-height-below-header");
    expect(grid).toContain("max-height-below-header");
  });

  it("is the same value written inline inside a breakpoint object", () => {
    // Every size in a breakpoint object is inline (the client pass), so the
    // keyword resolves to the value the class carries.
    const { container } = render(
      <Flex xl={{ height: "below-header" }} data-testid="pane">
        x
      </Flex>,
      { wrapper: LayoutProvider },
    );
    const el = container.querySelector<HTMLElement>("[data-testid='pane']");
    expect(el?.getAttribute("style")).toContain(`height: ${VALUE}`);
    expect(el?.className).not.toContain("height-below-header");
  });
});
