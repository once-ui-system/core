import { render } from "@testing-library/react";
import type React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Avatar } from "../components/Avatar";
import { Background } from "../components/Background";
import { Column } from "../components/Column";
import { Dropdown } from "../components/Dropdown";
import { Flex } from "../components/Flex";
import { Grid } from "../components/Grid";
import { Mask } from "../components/Mask";
import { Media } from "../components/Media";
import { Scroller } from "../components/Scroller";
import { Text } from "../components/Text";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { isCSSUnit, sizeValue, spacingValue } from "../utils/layoutClasses";
import { speedFactor } from "../utils/speed";

/**
 * 3.0, D2–D5: a bare number means px on every size, spacing, offset and blur
 * prop (`width={320}` is 320px, as in React's own `style={{ width: 320 }}`);
 * a digit string is still the spacing token (`"16"` is `--static-space-16`);
 * a CSS length string passes through (`"20rem"`). Times are milliseconds and
 * `speed` is a multiplier.
 */
const styleOf = (html: string) => {
  const at = html.indexOf('style="') + 7;
  return html.slice(at, html.indexOf('"', at));
};

const r = (ui: React.ReactElement) => render(ui, { wrapper: LayoutProvider });
const ssr = (ui: React.ReactElement) => renderToStaticMarkup(<LayoutProvider>{ui}</LayoutProvider>);

describe("a number is px", () => {
  it("on width, height and their min/max", () => {
    const { getByTestId } = r(
      <Flex
        data-testid="f"
        width={320}
        height={200}
        minWidth={100}
        maxWidth={640}
        minHeight={48}
        maxHeight={480}
      />,
    );
    const { style } = getByTestId("f");
    expect(style.width).toBe("320px");
    expect(style.height).toBe("200px");
    expect(style.minWidth).toBe("100px");
    expect(style.maxWidth).toBe("640px");
    expect(style.minHeight).toBe("48px");
    expect(style.maxHeight).toBe("480px");
  });

  it("on padding, margin, gap, offsets, translate and blur, on the server", () => {
    const style = styleOf(
      ssr(
        <Flex padding={24} marginTop={8} gap={12} top={4} translateY={-2} blur={6}>
          x
        </Flex>,
      ),
    );
    expect(style).toContain("padding-top:24px");
    expect(style).toContain("margin-top:8px");
    expect(style).toContain("gap:12px");
    expect(style).toContain("top:4px");
    expect(style).toContain("transform:translate(0, -2px)");
    expect(style).toContain("filter:blur(6px)");
  });

  it("on Grid, Text and in a breakpoint object", () => {
    const grid = styleOf(ssr(<Grid minColumnWidth={240} padding={16} />));
    expect(grid).toContain("--grid-min-column-width:240px");
    expect(grid).toContain("padding-top:16px");
    expect(styleOf(ssr(<Text marginX={10}>t</Text>))).toContain("margin-left:10px");
    const { getByTestId } = r(<Column data-testid="c" m={{ maxWidth: 360, gap: 8 }} />);
    expect(getByTestId("c").style.maxWidth).toBe("360px");
    expect(getByTestId("c").style.gap).toBe("8px");
  });
});

describe("a CSS length string passes through", () => {
  it("recognises px, rem, em, %, viewport units and functions", () => {
    for (const value of ["320px", "40rem", "1.5em", "-2px", "50%", "100vh", "100dvh", "50vw"]) {
      expect(isCSSUnit(value), value).toBe(true);
    }
    expect(isCSSUnit("clamp(1rem, 2vw, 3rem)")).toBe(true);
    expect(isCSSUnit("var(--width)")).toBe(true);
    for (const value of ["16", "m", "auto", "40 rem", "", "px"]) {
      expect(isCSSUnit(value), value).toBe(false);
    }
  });

  it('renders width="20rem" and padding="1.5rem" as written', () => {
    const { getByTestId } = r(
      <Flex data-testid="f" width="20rem" maxWidth="320px" padding="1.5rem" gap="0.5rem" />,
    );
    const el = getByTestId("f");
    expect(el.style.width).toBe("20rem");
    expect(el.style.maxWidth).toBe("320px");
    expect(el.style.paddingTop).toBe("1.5rem");
    expect(el.style.gap).toBe("0.5rem");
    // A length is inline, never a class.
    expect(el.className).not.toMatch(/\bp-1\.5rem\b|\bg-0\.5rem\b/);
  });

  it("keeps a CSS-length breakpoint value off the class path", () => {
    const { getByTestId } = r(<Flex data-testid="f" s={{ padding: "2rem" }} />);
    expect(getByTestId("f").className).not.toContain("s-p-2rem");
  });
});

describe("tokens stay strings", () => {
  it('reads "16" as the static step and "m" as the responsive size', () => {
    expect(sizeValue("16", "width")).toBe("var(--static-space-16)");
    expect(sizeValue("m", "height")).toBe("var(--responsive-height-m)");
    expect(spacingValue("16")).toBeUndefined();
    const html = ssr(
      <Flex padding="16" gap="8" top="4" width="40">
        x
      </Flex>,
    );
    expect(html).toContain("p-16");
    expect(html).toContain("g-8");
    expect(html).toContain("top-4");
    expect(styleOf(html)).toContain("width:var(--static-space-40)");
    expect(styleOf(html)).not.toContain("padding");
  });
});

describe("the outliers have one unit too", () => {
  it("Avatar size: a number is px, a CSS length as written", () => {
    const px = r(<Avatar data-testid="a" size={40} value="A" />).getByTestId("a");
    expect(px.style.width).toBe("40px");
    const rem = r(<Avatar data-testid="b" size="2.5rem" value="A" />).getByTestId("b");
    expect(rem.style.width).toBe("2.5rem");
  });

  it("Media height: a number is px", () => {
    const { container } = r(<Media src="/a.jpg" aspectRatio="" height={240} />);
    expect((container.firstElementChild as HTMLElement).style.height).toBe("240px");
  });

  it("Mask: x, y and radius are px as numbers, CSS lengths as strings", () => {
    const { container, rerender } = r(<Mask x={10} y={20} radius={300} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.getPropertyValue("--mask-position-x")).toBe("10px");
    expect(el.style.getPropertyValue("--mask-radius")).toBe("300px");
    rerender(<Mask x="50%" y="0%" />);
    expect(el.style.getPropertyValue("--mask-position-x")).toBe("50%");
    // The default is 2.2's default, 50svh (2.x before 2.2 used 50vh).
    expect(el.style.getPropertyValue("--mask-radius")).toBe("50svh");
  });

  it("Background gradient: a percentage of the element, or px", () => {
    const html = ssr(
      <Background gradient={{ display: true, x: "100%", y: 0, width: "50%", height: 400 }} />,
    );
    // The gradient layer is 4× the element and starts 1.5× before it.
    expect(html).toContain("--gradient-position-x:62.5%");
    expect(html).toContain("--gradient-position-y:calc(37.5% + 0px)");
    expect(html).toContain("--gradient-width:12.5%");
    expect(html).toContain("--gradient-height:400px");
  });

  it("Dropdown openOn=contextmenu (2.x ContextMenu) keeps its 12rem default width as a string", () => {
    expect(() =>
      ssr(
        <Dropdown openOn="contextmenu" trigger="x">
          <div />
        </Dropdown>,
      ),
    ).not.toThrow();
  });
});

describe("time is milliseconds, speed a multiplier", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("speed keywords are 0.5, 1 and 2, numbers are themselves", () => {
    expect(speedFactor("slow")).toBe(0.5);
    expect(speedFactor("medium")).toBe(1);
    expect(speedFactor("fast")).toBe(2);
    expect(speedFactor(3)).toBe(3);
    expect(speedFactor(undefined)).toBe(1);
    expect(speedFactor(0)).toBe(1);
  });

  it("Scroller auto (2.x AutoScroll) accepts a multiplier as well as a keyword", () => {
    expect(() =>
      ssr(
        <>
          <Scroller auto={{ speed: 1.5 }}>a</Scroller>
          <Scroller auto={{ speed: "fast" }}>a</Scroller>
        </>,
      ),
    ).not.toThrow();
  });
});
