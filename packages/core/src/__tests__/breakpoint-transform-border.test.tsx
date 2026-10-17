import { act, fireEvent, render } from "@testing-library/react";
import { createRef, type ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Arrow } from "../components/Arrow";
import { CursorCard } from "../components/CursorCard";
import { Fade } from "../components/Fade";
import { FadingLettersFx } from "../components/FadingLettersFx";
import { Flex } from "../components/Flex";
import { FlipFx } from "../components/FlipFx";
import { Grid } from "../components/Grid";
import { TiltFx } from "../components/TiltFx";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { breakpointStyle, isClassExpressible } from "../utils/layoutClasses";

/**
 * Two ROADMAP 2.2 lines: leaving a breakpoint cleared the base inline value
 * it had overridden; a component's own `transform` replaced its translate
 * props; `FadingLettersFx` typed `ref` without forwarding it; a breakpoint
 * border type-checked and drew nothing; `Fade` ignored `blur` outside its
 * pattern mode.
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

/**
 * jsdom has `ontouchstart`, so CursorCard and TiltFx take it for a touch
 * device and ignore the mouse. Hide it for one test.
 */
function withoutTouch(): () => void {
  let owner: object | null = window;
  while (owner && !Object.hasOwn(owner, "ontouchstart")) owner = Object.getPrototypeOf(owner);
  if (!owner) return () => {};
  const descriptor = Object.getOwnPropertyDescriptor(owner, "ontouchstart") as PropertyDescriptor;
  delete (owner as Record<string, unknown>).ontouchstart;
  return () => Object.defineProperty(owner, "ontouchstart", descriptor);
}

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
    expect(flex.style.maxWidth).toBe("20rem");
    expect(flex.style.paddingTop).toBe("2rem");
    expect(grid.style.width).toBe("10rem");

    await resizeTo(1300);
    expect(flex.style.maxWidth).toBe("40rem");
    // The breakpoint wrote the `padding` shorthand; each side comes back.
    expect(flex.style.paddingTop).toBe("1rem");
    expect(flex.style.paddingLeft).toBe("1rem");
    expect(grid.style.width).toBe("30rem");

    await resizeTo(JSDOM_WIDTH);
    expect(flex.style.maxWidth).toBe("20rem");
    expect(grid.style.width).toBe("10rem");
  });

  it("still clears a value the base never set", async () => {
    const { container } = render(
      <LayoutProvider>
        <Flex m={{ width: 20 }}>flex</Flex>
      </LayoutProvider>,
    );
    const flex = container.querySelector(".display-flex") as HTMLElement;
    expect(flex.style.width).toBe("20rem");
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
    expect(arrow.style.transform).toBe("translate(2rem, 0) scale(0.8)");
  });

  it("composes with translateX/translateY on FlipFx", () => {
    const { getByRole } = inLayout(<FlipFx translateY={1} flipped front="front" back="back" />);
    expect(getByRole("button").style.transform).toBe("translate(0, 1rem) rotateY(180deg)");
  });

  it("keeps the translate when FlipFx is not flipped", () => {
    const { getByRole } = inLayout(<FlipFx translateX={1} front="front" back="back" />);
    expect(getByRole("button").style.transform).toBe("translate(1rem, 0)");
  });

  it("composes with translateX/translateY on CursorCard", () => {
    const restoreTouch = withoutTouch();
    try {
      const { getByText } = inLayout(
        <CursorCard trigger={<span>trigger</span>} overlay={<span>card</span>} translateX={1} />,
      );
      fireEvent.mouseEnter(getByText("trigger").parentElement as HTMLElement);
      const card = getByText("card").parentElement as HTMLElement;
      expect(card.style.transform).toMatch(/^translate\(calc\(0px - 100%\)/);
      expect(card.style.transform).toMatch(/ translate\(1rem, 0\)$/);
    } finally {
      restoreTouch();
    }
  });

  it("keeps the translate in front of the TiltFx tilt", () => {
    const restoreTouch = withoutTouch();
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 0;
    });
    // jsdom lays nothing out; a zero-sized box would tilt by NaN degrees.
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(
      DOMRect.fromRect({ x: 0, y: 0, width: 100, height: 100 }),
    );
    try {
      const { getByText } = inLayout(
        <TiltFx translateY={2} reducedMotion={false}>
          tilt
        </TiltFx>,
      );
      const tilt = getByText("tilt") as HTMLElement;
      expect(tilt.style.transform).toBe("translate(0, 2rem)");
      fireEvent.mouseMove(tilt, { clientX: 0, clientY: 0 });
      expect(tilt.style.transform).toMatch(/^translate\(0, 2rem\) perspective\(1000px\)/);
    } finally {
      restoreTouch();
    }
  });
});

describe("FadingLettersFx", () => {
  it("forwards its ref to the Text it renders", () => {
    const ref = createRef<HTMLSpanElement>();
    const { container } = render(
      <FadingLettersFx ref={ref} text="hi there" animationState="visible" />,
    );
    expect(ref.current).toBe(container.firstElementChild);
    // A forwardRef, so React 18 (in the peer range) forwards it too: there a
    // function component never receives `ref`.
    expect((FadingLettersFx as unknown as { $$typeof: symbol }).$$typeof).toBe(
      Symbol.for("react.forward_ref"),
    );
  });
});

describe("Fade", () => {
  it("blurs by its blur prop outside pattern mode", () => {
    const { container } = inLayout(<Fade blur={2} />);
    expect((container.firstElementChild as HTMLElement).style.backdropFilter).toBe("blur(2rem)");
  });

  it("blurs by its blur prop in pattern mode", () => {
    const { container } = inLayout(<Fade blur={1} pattern={{ display: true, size: "2" }} />);
    expect((container.firstElementChild as HTMLElement).style.backdropFilter).toBe("blur(1rem)");
  });
});
