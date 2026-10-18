import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Flex } from "../components/Flex";
import { Grid } from "../components/Grid";
import { isCSSUnit, sizeValue } from "../utils/layoutClasses";

/**
 * `width="320px"` and `maxWidth="40rem"` failed the type and then rendered no
 * size at all: `CSSUnit` and the parser only knew `%`, `vh`, `dvh`, `vw` and
 * `calc()`. px, rem and em now pass through as written, on the server, at a
 * breakpoint, and on the offsets.
 */

const styleOf = (html: string) => {
  const at = html.indexOf('style="') + 7;
  return html.slice(at, html.indexOf('"', at));
};

describe("px, rem and em lengths", () => {
  it("are CSS units, and bare or malformed numbers are not", () => {
    for (const value of ["320px", "40rem", "1.5em", "0.5rem", ".5rem", "-8px"]) {
      expect(isCSSUnit(value), value).toBe(true);
      expect(sizeValue(value, "width"), value).toBe(value);
    }
    for (const value of ["px", "rem", "32", "12pxx", "1 rem"]) {
      expect(isCSSUnit(value), value).toBe(false);
    }
    // Tokens still resolve as tokens.
    expect(sizeValue("32", "width")).toBe("var(--static-space-32)");
  });

  it("render as Flex and Grid sizes", () => {
    const flex = styleOf(
      renderToStaticMarkup(<Flex width="320px" maxWidth="40rem" minHeight="2em" />),
    );
    expect(flex).toContain("width:320px");
    expect(flex).toContain("max-width:40rem");
    expect(flex).toContain("min-height:2em");

    const grid = styleOf(renderToStaticMarkup(<Grid width="320px" height="10rem" />));
    expect(grid).toContain("width:320px");
    expect(grid).toContain("height:10rem");
  });

  it("take auto as a width, so a breakpoint can undo a fixed one", () => {
    // Agents wrote `width={10} s={{ width: "auto" }}` and failed the type.
    expect(sizeValue("auto", "width")).toBe("auto");
    expect(styleOf(renderToStaticMarkup(<Flex width="auto" />))).toContain("width:auto");
  });

  it("render as offsets inline rather than as a class", () => {
    const html = renderToStaticMarkup(<Flex position="absolute" top="12px" left="1rem" />);
    expect(html).not.toContain("top-12px");
    expect(styleOf(html)).toContain("top:12px");
    expect(styleOf(html)).toContain("left:1rem");
  });
});
