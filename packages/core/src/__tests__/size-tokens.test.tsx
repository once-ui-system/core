import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Flex } from "../components/Flex";
import { Grid } from "../components/Grid";
import { LayoutProvider } from "../contexts/LayoutProvider";
import type { SpacingToken } from "../types";
import { STATIC_SPACING_TOKENS, sizeValue } from "../utils/layoutClasses";

/**
 * `ServerFlex`, `ClientFlex` and `ServerGrid` each kept their own list of the
 * static spacing steps to resolve a size token, and all three had dropped
 * `"72"`: `width="72"` type-checked and rendered no width, on the server and
 * at a breakpoint alike. They read one list now, and this pins that list to
 * the scale foundations generates.
 */
const FOUNDATIONS = join(__dirname, "../../../foundations");

const scale = (): string[] => {
  const src = readFileSync(join(FOUNDATIONS, "scripts/utilities.spec.mjs"), "utf8");
  const block = src.match(/export const SPACING_TOKENS = \[([\s\S]*?)\];/);
  if (!block) throw new Error("SPACING_TOKENS not found in the generator spec");
  return [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]).filter((t) => /^\d+$/.test(t));
};

const definedSteps = (): string[] => {
  const layout = readFileSync(join(FOUNDATIONS, "scss/tokens/layout.scss"), "utf8");
  // Each scaling block restates the steps; the first block is the scale.
  return [...new Set([...layout.matchAll(/--static-space-(\d+):/g)].map((m) => m[1]))];
};

const styleOf = (html: string) => {
  const at = html.indexOf('style="') + 7;
  return html.slice(at, html.indexOf('"', at));
};

describe("size tokens", () => {
  it("reads the whole static scale foundations generates", () => {
    expect(STATIC_SPACING_TOKENS).toEqual(scale());
    expect(STATIC_SPACING_TOKENS).toEqual(definedSteps());
    expect(STATIC_SPACING_TOKENS).toContain("72");
  });

  it("resolves every step, and nothing else, as it always has", () => {
    for (const token of STATIC_SPACING_TOKENS) {
      expect(sizeValue(token, "width"), token).toBe(`var(--static-space-${token})`);
    }
    expect(sizeValue("m", "width")).toBe("var(--responsive-width-m)");
    expect(sizeValue("m", "height")).toBe("var(--responsive-height-m)");
    expect(sizeValue(12, "width")).toBe("12rem");
    expect(sizeValue("50%", "width")).toBe("50%");
    expect(sizeValue("calc(100% - 1rem)", "height")).toBe("calc(100% - 1rem)");
    expect(sizeValue("73", "width")).toBeUndefined();
    expect(sizeValue("below-header", "height")).toBeUndefined();
    expect(sizeValue(undefined, "width")).toBeUndefined();
  });

  it("writes every step as a Flex size on the server", () => {
    for (const token of STATIC_SPACING_TOKENS) {
      const t = token as SpacingToken;
      const style = styleOf(
        renderToStaticMarkup(<Flex width={t} height={t} minWidth={t} maxHeight={t} />),
      );
      expect(style, token).toContain(`width:var(--static-space-${token})`);
      expect(style, token).toContain(`height:var(--static-space-${token})`);
      expect(style, token).toContain(`min-width:var(--static-space-${token})`);
      expect(style, token).toContain(`max-height:var(--static-space-${token})`);
    }
  });

  it("writes 72 as a Grid size and an auto-fit minimum on the server", () => {
    const html = renderToStaticMarkup(<Grid width="72" maxWidth="72" minColumnWidth="72" />);
    expect(styleOf(html)).toContain("width:var(--static-space-72)");
    expect(styleOf(html)).toContain("max-width:var(--static-space-72)");
    expect(html).toContain("--grid-min-column-width:var(--static-space-72)");
  });

  it("writes 72 as a breakpoint size on the client", () => {
    // jsdom is 1024 wide, which is the `m` step.
    const { container } = render(
      <LayoutProvider>
        <Flex m={{ width: "72", minHeight: "72" }}>x</Flex>
      </LayoutProvider>,
    );
    const flex = container.querySelector(".display-flex") as HTMLElement;
    expect(flex.style.width).toBe("var(--static-space-72)");
    expect(flex.style.minHeight).toBe("var(--static-space-72)");
  });
});
