import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Grid } from "../components/Grid";
import { LayoutProvider } from "../contexts/LayoutProvider";

/**
 * `rows` was typed on `Grid` and on every breakpoint object, and documented as
 * "how many equal rows", but nothing read it: no class existed, `ServerGrid`
 * never took it out of its props, and it reached the DOM as a `rows`
 * attribute while the grid's rows followed the content regardless. It is a
 * class now, like `columns`, at the base and at every breakpoint.
 *
 * `renderToStaticMarkup` without a provider is the test for "on the server":
 * the client path throws there.
 */
const GRID_CSS = readFileSync(
  join(__dirname, "../../../foundations/scss/styles/grid.generated.scss"),
  "utf8",
);

const BREAKPOINTS = ["xl", "l", "m", "s", "xs"];

const classesOf = (html: string) => {
  const at = html.indexOf('class="') + 7;
  return html.slice(at, html.indexOf('"', at)).split(" ").filter(Boolean);
};

describe("Grid rows", () => {
  it("has a rule for every row count, at the base and every breakpoint", () => {
    const missing: string[] = [];
    for (let n = 1; n <= 12; n++) {
      for (const prefix of ["", ...BREAKPOINTS.map((bp) => `${bp}-`)]) {
        if (!GRID_CSS.includes(`.${prefix}rows-${n} {\n`)) missing.push(`.${prefix}rows-${n}`);
      }
    }
    expect(missing).toEqual([]);
    expect(GRID_CSS).toContain(".rows-1 {\n  grid-template-rows: 1fr;");
    expect(GRID_CSS).toContain(".rows-3 {\n  grid-template-rows: repeat(3, 1fr);");
  });

  it("puts the base rows ahead of every breakpoint block", () => {
    // Otherwise `.rows-3` would beat `.s-rows-1` on a phone.
    expect(GRID_CSS.indexOf(".rows-12 {")).toBeLessThan(GRID_CSS.indexOf("@media"));
  });

  it("renders as a class on the server, never as an attribute", () => {
    const html = renderToStaticMarkup(
      <Grid rows="3" columns="2">
        x
      </Grid>,
    );
    expect(classesOf(html)).toContain("rows-3");
    expect(html).not.toMatch(/\srows=/);
  });

  it("takes a numeric row count, which is a class too", () => {
    const html = renderToStaticMarkup(<Grid rows={4} />);
    expect(classesOf(html)).toContain("rows-4");
    expect(html).not.toMatch(/\srows=/);
  });

  it("reflows per breakpoint on the server, cascading like columns", () => {
    const html = renderToStaticMarkup(
      <Grid rows={4} m={{ rows: 2 }} s={{ rows: 1, columns: 1 }} />,
    );
    const classes = classesOf(html);
    expect(classes).toContain("rows-4");
    expect(classes).toContain("m-rows-2");
    expect(classes).toContain("s-rows-1");
    // `s` also covers `xs` unless `xs` says otherwise.
    expect(classes).toContain("xs-rows-1");
    expect(classes).not.toContain("l-rows-2");
    for (const cls of classes.filter((c) => /rows-/.test(c))) {
      expect(GRID_CSS, cls).toContain(`.${cls} {`);
    }
  });

  it("stays off the DOM on the client path as well", () => {
    // A `style` object and a breakpoint width move Grid to ClientGrid, which
    // renders ServerGrid underneath; `rows` must not survive either layer.
    const { container } = render(
      <LayoutProvider>
        <Grid rows="2" style={{ color: "red" }} s={{ width: 20, rows: 1 }}>
          x
        </Grid>
      </LayoutProvider>,
    );
    const grid = container.querySelector(".display-grid") as HTMLElement;
    expect(grid).not.toBeNull();
    expect(grid.hasAttribute("rows")).toBe(false);
    expect(grid.classList.contains("rows-2")).toBe(true);
    expect(grid.classList.contains("s-rows-1")).toBe(true);
  });
});
