import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Grid } from "../components/Grid";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { tokenLength as t } from "../utils/layoutClasses";

/**
 * "As many columns as fit, each at least N wide" had no prop, so the apps
 * wrote `display: grid; grid-template-columns: repeat(auto-fit, minmax(13rem,
 * 1fr))` by hand — Motion alone in five places — and an inline `style` on
 * Grid is exactly what sends it to the client. `minColumnWidth` is a class plus
 * a custom property, both written on the server.
 */
const GRID_CSS = readFileSync(
  join(__dirname, "../../../foundations/scss/styles/grid.generated.scss"),
  "utf8",
);

const classesOf = (html: string) => {
  const at = html.indexOf('class="') + 7;
  return html.slice(at, html.indexOf('"', at)).split(" ").filter(Boolean);
};

describe("Grid minColumnWidth", () => {
  it("is the auto-fit track list, sized by a custom property", () => {
    expect(GRID_CSS).toContain(
      ".columns-auto-fit {\n  grid-template-columns: repeat(auto-fit, minmax(min(var(--grid-min-column-width), 100%), 1fr));",
    );
  });

  it("renders on the server with the class and the width beside it", () => {
    // No LayoutProvider: the client path would throw.
    const html = renderToStaticMarkup(
      <Grid minColumnWidth={13} gap="8">
        x
      </Grid>,
    );
    expect(classesOf(html)).toContain("columns-auto-fit");
    expect(html).toContain(`--grid-min-column-width:${t(13)}`);
  });

  it("reads a value the way minWidth does", () => {
    const width = (value: React.ComponentProps<typeof Grid>["minColumnWidth"]) =>
      renderToStaticMarkup(<Grid minColumnWidth={value} />).match(
        /--grid-min-column-width:([^;"]+)/,
      )?.[1];
    expect(width(16)).toBe(t(16));
    expect(width(12.5)).toBe(t(12.5));
    expect(width("160")).toBe("var(--static-space-160)");
    expect(width("30%")).toBe("30%");
    expect(width("calc(10rem + 2vw)")).toBe("calc(10rem + 2vw)");
  });

  it("takes precedence over columns", () => {
    const classes = classesOf(renderToStaticMarkup(<Grid columns="3" minColumnWidth={16} />));
    expect(classes).toContain("columns-auto-fit");
    expect(classes).not.toContain("columns-3");
  });

  it("gives way to a breakpoint column count at that width", () => {
    const classes = classesOf(
      renderToStaticMarkup(<Grid minColumnWidth={16} s={{ columns: 1 }} />),
    );
    expect(classes).toContain("columns-auto-fit");
    expect(classes).toContain("s-columns-1");
    // The breakpoint rule wins because it comes later at equal specificity.
    expect(GRID_CSS.indexOf(".columns-auto-fit {")).toBeLessThan(GRID_CSS.indexOf("@media"));
  });

  it("writes nothing when it is not set", () => {
    const html = renderToStaticMarkup(<Grid columns="2" />);
    expect(classesOf(html)).not.toContain("columns-auto-fit");
    expect(html).not.toContain("--grid-min-column-width");
  });

  it("keeps the width when a style object sends the grid to the client", () => {
    // `style` is still an escape hatch; it must not drop the auto-fit width.
    const { container } = render(
      <Grid minColumnWidth={10} style={{ outline: "1px solid" }}>
        x
      </Grid>,
      { wrapper: LayoutProvider },
    );
    const el = container.firstElementChild as HTMLElement | null;
    expect(el?.className).toContain("columns-auto-fit");
    expect(el?.style.getPropertyValue("--grid-min-column-width")).toBe(t(10));
  });
});
