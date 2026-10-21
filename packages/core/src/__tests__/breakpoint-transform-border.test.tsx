import { act, render } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Arrow } from "../components/Arrow";
import { Fade } from "../components/Fade";
import { Flex } from "../components/Flex";
import { Grid } from "../components/Grid";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { breakpointStyle, isClassExpressible, tokenLength as t } from "../utils/layoutClasses";

/**
 * Two ROADMAP 2.2 lines: leaving a breakpoint cleared the base inline value
 * it had overridden; a component's own `transform` replaced its translate
 * props; a breakpoint border type-checked and drew nothing; `Fade` ignored
 * `blur` outside its pattern mode. A bare number is on the token scale in 3.0.
 *
 * The 2.2 file also covered FlipFx, TiltFx, CursorCard and FadingLettersFx.
 * In 3.0 the effects live in `@once-ui-system/fx` (tested there), CursorCard
 * is HoverCard `placement="cursor"` and FadingLettersFx is TypeFx mode="fade".
 *
 * jsdom is 1024 wide, which is the `m` step; 1300 is past `l`.
 */
const JSDOM_WIDTH = window.innerWidth;

afterEach(() => {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: JSDOM_WIDTH });
  vi.restoreAllMocks();
});

/** A style prop moves Flex to ClientFlex, which reads the layout context. */
const inLayout = (ui: ReactElement) => render(<LayoutProvider>{ui}</LayoutProvider>);

async function resizeTo(width: number) {
  await act(async () => {
    Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
    window.dispatchEvent(new Event("resize"));
    await new Promise((resolve) => setTimeout(resolve, 150));
  });
}

describe("leaving a breakpoint", () => {
  it("restores the base inline value it overrode, on Flex and Grid", async () => {
    const { container } = render(
      <LayoutProvider>
        <Flex maxWidth={40} padding={1} m={{ maxWidth: 20, padding: 2 }}>
          flex
        </Flex>
        <Grid width={30} m={{ width: 10 }}>
          grid
        </Grid>
      </LayoutProvider>,
    );
    const flex = container.querySelector(".display-flex") as HTMLElement;
    const grid = container.querySelector(".display-grid") as HTMLElement;
    expect(flex.style.maxWidth).toBe(t(20));
    expect(flex.style.paddingTop).toBe(t(2));
    expect(grid.style.width).toBe(t(10));

    await resizeTo(1300);
    expect(flex.style.maxWidth).toBe(t(40));
    // The breakpoint wrote the `padding` shorthand; each side comes back.
    expect(flex.style.paddingTop).toBe(t(1));
    expect(flex.style.paddingLeft).toBe(t(1));
    expect(grid.style.width).toBe(t(30));

    await resizeTo(JSDOM_WIDTH);
    expect(flex.style.maxWidth).toBe(t(20));
    expect(grid.style.width).toBe(t(10));
  });

  it("still clears a value the base never set", async () => {
    const { container } = render(
      <LayoutProvider>
        <Flex m={{ width: 20 }}>flex</Flex>
      </LayoutProvider>,
    );
    const flex = container.querySelector(".display-flex") as HTMLElement;
    expect(flex.style.width).toBe(t(20));
    await resizeTo(1300);
    expect(flex.style.width).toBe("");
  });
});

describe("breakpoint borders", () => {
  it("are sent to the client, where a class cannot hold them", () => {
    expect(isClassExpressible({ borderLeft: "brand-strong" })).toBe(false);
    expect(isClassExpressible({ border: true })).toBe(false);
  });

  it("resolve to the colour, style and width the base classes give", () => {
    expect(breakpointStyle({ border: "neutral-alpha-medium" })).toEqual([
      ["borderColor", "var(--neutral-alpha-medium)"],
      ["borderStyle", "solid"],
      ["borderWidth", "1px"],
    ]);
    expect(breakpointStyle({ borderX: true, borderStyle: "dashed", borderWidth: 2 })).toEqual([
      ["borderColor", "var(--default-border)"],
      ["borderStyle", "dashed"],
      ["borderTopWidth", "0"],
      ["borderRightWidth", "2px"],
      ["borderBottomWidth", "0"],
      ["borderLeftWidth", "2px"],
    ]);
  });

  it("apply at the breakpoint and clear past it, on Flex and Grid", async () => {
    const { container } = render(
      <LayoutProvider>
        <Flex m={{ borderLeft: "brand-strong" }}>flex</Flex>
        <Grid m={{ border: "surface" }}>grid</Grid>
      </LayoutProvider>,
    );
    const flex = container.querySelector(".display-flex") as HTMLElement;
    const grid = container.querySelector(".display-grid") as HTMLElement;
    expect(flex.style.borderColor).toBe("var(--brand-border-strong)");
    expect(flex.style.borderStyle).toBe("solid");
    expect(flex.style.borderLeftWidth).toBe("1px");
    expect(flex.style.borderTopWidth).toBe("0px");
    expect(grid.style.borderColor).toBe("var(--surface-border)");
    expect(grid.style.borderWidth).toBe("1px");

    await resizeTo(1300);
    expect(flex.style.borderColor).toBe("");
    expect(flex.style.borderLeftWidth).toBe("");
    expect(grid.style.borderColor).toBe("");
  });
});

describe("a component's own transform", () => {
  it("composes with translateX/translateY on Arrow", () => {
    const { container } = inLayout(<Arrow trigger="#none" translateX={2} />);
    const arrow = container.firstElementChild as HTMLElement;
    expect(arrow.style.transform).toBe(`translate(${t(2)}, 0) scale(0.8)`);
  });
});

describe("Fade", () => {
  it("blurs by its blur prop outside pattern mode", () => {
    const { container } = inLayout(<Fade blur={2} />);
    expect((container.firstElementChild as HTMLElement).style.backdropFilter).toBe(`blur(${t(2)})`);
  });

  it("blurs by its blur prop in pattern mode", () => {
    const { container } = inLayout(<Fade blur={1} pattern={{ display: true, size: "2" }} />);
    expect((container.firstElementChild as HTMLElement).style.backdropFilter).toBe(`blur(${t(1)})`);
  });
});
