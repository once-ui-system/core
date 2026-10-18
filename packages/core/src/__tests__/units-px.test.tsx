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
import {
  isCSSUnit,
  sizeValue,
  spacingValue,
  tokenLength,
  withTokenLengths,
} from "../utils/layoutClasses";
import { speedFactor } from "../utils/speed";

/**
 * 3.0, D2–D5: a bare number is on the token scale on every size, spacing,
 * offset and blur prop: `n` renders as the static token `"n"` does, n/16 rem
 * times `--scaling` (`width={320}` is 20rem, 320px at the default root size
 * and scaling); a digit string is still the spacing token (`"16"` is
 * `--static-space-16`); a CSS length string passes through (`"320px"` does
 * not scale). Times are milliseconds and `speed` is a multiplier.
 */

/** What a number renders as (pinned on its own below). */
const t = tokenLength;
const styleOf = (html: string) => {
  const at = html.indexOf('style="') + 7;
  return html.slice(at, html.indexOf('"', at));
};

const r = (ui: React.ReactElement) => render(ui, { wrapper: LayoutProvider });
const ssr = (ui: React.ReactElement) => renderToStaticMarkup(<LayoutProvider>{ui}</LayoutProvider>);

describe("a number is on the token scale", () => {
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
    expect(style.width).toBe("var(--ou-n-320)");
    expect(style.getPropertyValue("--ou-n-320")).toBe("calc(20rem * var(--scaling, 1))");
    expect(style.height).toBe(t(200));
    expect(style.minWidth).toBe(t(100));
    expect(style.maxWidth).toBe("var(--ou-n-640)");
    expect(style.getPropertyValue("--ou-n-640")).toBe("calc(40rem * var(--scaling, 1))");
    expect(style.minHeight).toBe("var(--static-space-48)");
    expect(style.maxHeight).toBe(t(480));
  });

  it("on padding, margin, gap, offsets, translate and blur, on the server", () => {
    const style = styleOf(
      ssr(
        <Flex padding={24} marginTop={8} gap={12} top={4} translateY={-2} blur={6}>
          x
        </Flex>,
      ),
    );
    expect(style).toContain(`padding-top:${t(24)}`);
    expect(style).toContain(`margin-top:${t(8)}`);
    expect(style).toContain(`gap:${t(12)}`);
    expect(style).toContain(`top:${t(4)}`);
    expect(style).toContain(`transform:translate(0, ${t(-2)})`);
    expect(style).toContain(`filter:blur(${t(6)})`);
    // Each number between the steps is declared on the element itself.
    expect(style).toContain("--ou-n-6:calc(0.375rem * var(--scaling, 1))");
    expect(style).toContain("--ou-n--2:calc(-0.125rem * var(--scaling, 1))");
  });

  it("on Grid, Text and in a breakpoint object", () => {
    const grid = styleOf(ssr(<Grid minColumnWidth={240} padding={16} />));
    expect(grid).toContain(`--grid-min-column-width:${t(240)}`);
    expect(grid).toContain(`padding-top:${t(16)}`);
    expect(styleOf(ssr(<Text marginX={10}>t</Text>))).toContain(`margin-left:${t(10)}`);
    const { getByTestId } = r(<Column data-testid="c" m={{ maxWidth: 360, gap: 8 }} />);
    expect(getByTestId("c").style.maxWidth).toBe(t(360));
    expect(getByTestId("c").style.gap).toBe(t(8));
    expect(getByTestId("c").style.getPropertyValue("--ou-n-360")).toBe(
      "calc(22.5rem * var(--scaling, 1))",
    );
  });

  it("means what the token of the same name means: n/16 rem, scaled", () => {
    // A step of the scale is the token: `"16"` is --static-space-16, 1rem,
    // and `calc(1rem * 1.1)` under data-scaling="110".
    expect(tokenLength(16)).toBe("var(--static-space-16)");
    expect(tokenLength(40)).toBe("var(--static-space-40)");
    expect(tokenLength(1)).toBe("var(--static-space-1)");
    // Between the steps it is n/16 rem times --scaling (which the same
    // data-scaling="110" sets to 1.1), held in a custom property the element
    // declares (withTokenLengths): the length itself is a bare var().
    expect(tokenLength(320)).toBe("var(--ou-n-320)");
    expect(tokenLength(12.5)).toBe("var(--ou-n-12_5)");
    expect(tokenLength(-2)).toBe("var(--ou-n--2)");
    expect(withTokenLengths({ width: "var(--ou-n-320)", padding: "var(--ou-n-12_5)" })).toEqual({
      width: "var(--ou-n-320)",
      padding: "var(--ou-n-12_5)",
      "--ou-n-320": "calc(20rem * var(--scaling, 1))",
      "--ou-n-12_5": "calc(0.78125rem * var(--scaling, 1))",
    });
    const plain = { width: "1rem" };
    expect(withTokenLengths(plain)).toBe(plain);
    expect(tokenLength(0)).toBe("0px");
  });

  it("leaves a border width in px: a hairline does not scale", () => {
    const { getByTestId } = r(
      <Column data-testid="c" m={{ border: "neutral-medium", borderWidth: 2 }} />,
    );
    expect(getByTestId("c").style.borderWidth).toBe("2px");
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
  it("Avatar size: a number is on the token scale, a CSS length as written", () => {
    const px = r(<Avatar data-testid="a" size={40} value="A" />).getByTestId("a");
    expect(px.style.width).toBe(t(40));
    const rem = r(<Avatar data-testid="b" size="2.5rem" value="A" />).getByTestId("b");
    expect(rem.style.width).toBe("2.5rem");
  });

  it("Media height: a number is on the token scale", () => {
    const { container } = r(<Media src="/a.jpg" aspectRatio="" height={240} />);
    expect((container.firstElementChild as HTMLElement).style.height).toBe(t(240));
  });

  it("Media sizes: a number stays px, an image hint in device pixels", () => {
    const { container } = r(<Media src="/a.jpg" aspectRatio="" height={240} sizes={640} />);
    expect(container.innerHTML).toContain("(max-width: 640px) 100vw, 640px");
  });

  it("Mask: x, y and radius are on the token scale as numbers, CSS lengths as strings", () => {
    const { container, rerender } = r(<Mask x={10} y={20} radius={300} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.getPropertyValue("--mask-position-x")).toBe(t(10));
    expect(el.style.getPropertyValue("--mask-radius")).toBe(t(300));
    rerender(<Mask x="50%" y="0%" />);
    expect(el.style.getPropertyValue("--mask-position-x")).toBe("50%");
    // The default is 2.2's default, 50svh (2.x before 2.2 used 50vh).
    expect(el.style.getPropertyValue("--mask-radius")).toBe("50svh");
  });

  it("Background gradient: a percentage of the element, or the token scale", () => {
    const html = ssr(
      <Background gradient={{ display: true, x: "100%", y: 0, width: "50%", height: 400 }} />,
    );
    // The gradient layer is 4× the element and starts 1.5× before it.
    expect(html).toContain("--gradient-position-x:62.5%");
    expect(html).toContain("--gradient-position-y:calc(37.5% + 0px)");
    expect(html).toContain("--gradient-width:12.5%");
    expect(html).toContain(`--gradient-height:${t(400)}`);
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
