import { act, render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { Flex } from "../components/Flex";
import { Grid } from "../components/Grid";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { BELOW_HEADER_VALUE, breakpointStyle } from "../utils/layoutClasses";

/**
 * A breakpoint `width` or a numeric `padding` cannot be a class, so it moves
 * `Grid` to `ClientGrid`, as it moves `Flex` to `ClientFlex`. ClientFlex then
 * wrote it inline at the current breakpoint; ClientGrid applied only `style`,
 * `aspectRatio` and the offsets, so the Grid went to the client and the value
 * did nothing there. Both apply one `breakpointStyle` now.
 *
 * jsdom is 1024 wide, which is the `m` step.
 */
const JSDOM_WIDTH = window.innerWidth;

afterEach(() => {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: JSDOM_WIDTH });
});

const PROPERTIES = [
  "width",
  "height",
  "minHeight",
  "maxWidth",
  "aspectRatio",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "marginTop",
  "gap",
  "top",
] as const;

describe("ClientGrid breakpoint style", () => {
  it("applies a breakpoint size and numeric spacing, as ClientFlex does", () => {
    const m = {
      width: 20,
      height: "72",
      minHeight: "below-header",
      maxWidth: "50%",
      aspectRatio: "16 / 9",
      padding: 1,
      paddingX: 2,
      marginTop: 0.5,
      gap: 1.5,
      top: 2,
    } as const;
    const { container } = render(
      <LayoutProvider>
        <Flex position="relative" m={m}>
          flex
        </Flex>
        <Grid position="relative" m={m}>
          grid
        </Grid>
      </LayoutProvider>,
    );
    const flex = container.querySelector(".display-flex") as HTMLElement;
    const grid = container.querySelector(".display-grid") as HTMLElement;

    expect(grid.style.width).toBe("20px");
    expect(grid.style.height).toBe("var(--static-space-72)");
    expect(grid.style.minHeight).toBe(BELOW_HEADER_VALUE);
    expect(grid.style.maxWidth).toBe("50%");
    expect(grid.style.paddingTop).toBe("1px");
    expect(grid.style.paddingLeft).toBe("2px");
    expect(grid.style.paddingRight).toBe("2px");
    expect(grid.style.marginTop).toBe("0.5px");
    expect(grid.style.gap).toBe("1.5px");
    expect(grid.style.top).toBe("2px");
    // Parity: the same object writes the same values on both.
    for (const property of PROPERTIES) {
      expect(grid.style[property], property).toBe(flex.style[property]);
    }
  });

  it("cascades a wider breakpoint down, and skips a narrower one", () => {
    const { container } = render(
      <LayoutProvider>
        <Grid l={{ padding: 1 }} s={{ width: 10 }}>
          grid
        </Grid>
      </LayoutProvider>,
    );
    const grid = container.querySelector(".display-grid") as HTMLElement;
    expect(grid.style.paddingTop).toBe("1px");
    expect(grid.style.width).toBe("");
  });

  it("leaves a token to its class and writes it nowhere inline", () => {
    const { container } = render(
      <LayoutProvider>
        <Grid m={{ width: 20, padding: "8", gap: "4", top: "16" }}>grid</Grid>
      </LayoutProvider>,
    );
    const grid = container.querySelector(".display-grid") as HTMLElement;
    expect(grid.style.width).toBe("20px");
    for (const cls of ["m-p-8", "m-g-4", "m-top-16"]) expect(grid.classList).toContain(cls);
    expect(grid.style.padding).toBe("");
    expect(grid.style.gap).toBe("");
    expect(grid.style.top).toBe("");
  });

  it("clears what it wrote when the breakpoint no longer applies", async () => {
    const { container } = render(
      <LayoutProvider>
        <Grid m={{ width: 20, padding: 1 }}>grid</Grid>
      </LayoutProvider>,
    );
    const grid = container.querySelector(".display-grid") as HTMLElement;
    expect(grid.style.width).toBe("20px");
    await act(async () => {
      Object.defineProperty(window, "innerWidth", { configurable: true, value: 1300 });
      window.dispatchEvent(new Event("resize"));
      await new Promise((resolve) => setTimeout(resolve, 150));
    });
    expect(grid.style.width).toBe("");
    expect(grid.style.paddingTop).toBe("");
  });

  it("renders on the server through the provider, with nothing leaked to the DOM", () => {
    // The client component server-renders its base; the breakpoint pass is an
    // effect, so none of it is in the markup, and no prop is an attribute.
    const html = renderToStaticMarkup(
      <LayoutProvider>
        <Grid columns="2" padding={1} m={{ width: 20, padding: 2 }}>
          grid
        </Grid>
      </LayoutProvider>,
    );
    expect(html).toContain("display-grid");
    expect(html).toContain("padding-top:1px");
    expect(html).not.toContain("20px");
    const root = html.slice(0, html.indexOf(">"));
    for (const attr of [" m=", " width=", " padding=", " columns="]) {
      expect(root).not.toContain(attr);
    }
  });
});

describe("breakpointStyle", () => {
  it("puts the style escape hatch first, so a resolved value wins over it", () => {
    const entries = breakpointStyle({ style: { width: "5px", color: "red" }, width: 10 });
    expect(entries[0]).toEqual(["width", "5px"]);
    expect(entries.at(-1)).toEqual(["width", "10px"]);
  });

  it("applies the shorthand, then the sides, then the axes, as ClientFlex always has", () => {
    expect(breakpointStyle({ padding: 1, paddingLeft: 2, paddingX: 3 })).toEqual([
      ["padding", "1px"],
      ["paddingLeft", "2px"],
      ["paddingLeft", "3px"],
      ["paddingRight", "3px"],
    ]);
  });

  it("writes a t-shirt maxWidth, which has no breakpoint class", () => {
    expect(breakpointStyle({ maxWidth: "s" })).toEqual([["maxWidth", "var(--responsive-width-s)"]]);
  });

  it("writes nothing for a value a class holds", () => {
    expect(breakpointStyle({ padding: "8", gap: "4", top: "16", columns: 2, opacity: 50 })).toEqual(
      [],
    );
  });
});
