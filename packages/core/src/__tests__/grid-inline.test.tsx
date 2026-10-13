import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Flex } from "../components/Flex";
import { Grid } from "../components/Grid";

/**
 * `Grid inline` writes `.display-inline-grid`, as `Flex inline` writes
 * `.display-inline-flex`, and only the flex class had a rule: an inline grid
 * rendered as a block grid. Foundations generates the grid one now, beside
 * `.display-grid` and ahead of `.grid-hide`, so hiding an inline grid still
 * wins.
 */
const STYLES = join(__dirname, "../../../foundations/scss/styles");
const GRID = readFileSync(join(STYLES, "grid.generated.scss"), "utf8");
const FLEX = readFileSync(join(STYLES, "flex.generated.scss"), "utf8");

const classesOf = (html: string) => {
  const at = html.indexOf('class="') + 7;
  return html.slice(at, html.indexOf('"', at)).split(" ").filter(Boolean);
};

describe("Grid inline", () => {
  it("writes display-inline-grid in place of display-grid, on the server", () => {
    const classes = classesOf(renderToStaticMarkup(<Grid inline columns="2" />));
    expect(classes).toContain("display-inline-grid");
    expect(classes).not.toContain("display-grid");
    expect(classesOf(renderToStaticMarkup(<Grid columns="2" />))).toContain("display-grid");
  });

  it("has a rule behind the class, as Flex inline does", () => {
    expect(GRID).toContain(".display-inline-grid {\n  display: inline-grid;\n}");
    expect(FLEX).toContain(".display-inline-flex {\n  display: inline-flex;\n}");
    const display = classesOf(renderToStaticMarkup(<Flex inline />)).concat(
      classesOf(renderToStaticMarkup(<Grid inline />)),
    );
    const dead = display
      .filter((cls) => cls.startsWith("display-"))
      .filter((cls) => !`${GRID}\n${FLEX}`.includes(`.${cls} {`));
    expect(dead).toEqual([]);
  });

  it("is still hidden by hide, at the base and at a breakpoint", () => {
    // Same specificity, so source order decides: the hide rules come later.
    const at = GRID.indexOf(".display-inline-grid {");
    expect(at).toBeGreaterThan(-1);
    expect(at).toBeLessThan(GRID.indexOf(".grid-hide {"));
    expect(at).toBeLessThan(GRID.indexOf("@media"));
    const classes = classesOf(renderToStaticMarkup(<Grid inline hide />));
    expect(classes).toEqual(expect.arrayContaining(["display-inline-grid", "grid-hide"]));
  });
});
