import { LayoutProvider } from "@once-ui-system/core";
import { fireEvent, render as baseRender } from "@testing-library/react";
import { createRef, type ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { FlipFx } from "../FlipFx.js";
import { TiltFx } from "../TiltFx.js";
import { TypeFx } from "../TypeFx.js";

/**
 * Ported from 2.2's `breakpoint-transform-border.test.tsx` (#184): an
 * effect's own `transform` replaced the translate its `translateX` /
 * `translateY` props resolve to, TiltFx took any touch-capable laptop for a
 * phone (#187), and FadingLettersFx (3.0's `TypeFx mode="fade"`) typed `ref`
 * without forwarding it. A bare number is px in 3.0.
 */

/** A style prop moves Flex to ClientFlex, which reads the layout context. */
const render = (ui: ReactElement) => baseRender(ui, { wrapper: LayoutProvider });

/** The setup's matchMedia answers false to every query, so the pointer can hover. */
const hoverNone = () =>
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: query === "(hover: none)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }) as unknown as MediaQueryList,
  );

describe("FlipFx transform", () => {
  it("composes the flip with translateX/translateY", () => {
    const { getByRole } = render(<FlipFx translateY={16} flipped front="front" back="back" />);
    expect(getByRole("button").style.transform).toBe("translate(0, 16px) rotateY(180deg)");
  });

  it("keeps the translate when not flipped", () => {
    const { getByRole } = render(<FlipFx translateX="m" front="front" back="back" />);
    expect(getByRole("button").style.transform).toBe("translate(var(--responsive-space-m), 0)");
  });

  it("writes none with neither", () => {
    const { getByRole } = render(<FlipFx front="front" back="back" />);
    expect(getByRole("button").style.transform).toBe("none");
  });
});

describe("TiltFx", () => {
  const tiltSetup = () => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 0;
    });
    // jsdom lays nothing out; a zero-sized box would tilt by NaN degrees.
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(
      DOMRect.fromRect({ x: 0, y: 0, width: 100, height: 100 }),
    );
  };

  it("keeps the translate in front of the tilt", () => {
    tiltSetup();
    const { getByText } = render(
      <TiltFx translateY={32} reducedMotion={false}>
        tilt
      </TiltFx>,
    );
    const tilt = getByText("tilt") as HTMLElement;
    fireEvent.mouseMove(tilt, { clientX: 0, clientY: 0 });
    expect(tilt.style.transform).toMatch(/^translate\(0, 32px\) perspective\(1000px\)/);
  });

  it("tilts under a mouse even where touch events exist", () => {
    tiltSetup();
    // jsdom has `ontouchstart`, which 2.x read as a touch device.
    expect("ontouchstart" in window).toBe(true);
    const { getByText } = render(<TiltFx reducedMotion={false}>tilt</TiltFx>);
    const tilt = getByText("tilt") as HTMLElement;
    fireEvent.mouseMove(tilt, { clientX: 0, clientY: 0 });
    expect(tilt.style.transform).toMatch(/^perspective\(1000px\)/);
  });

  it("does not tilt where the pointer cannot hover", () => {
    tiltSetup();
    hoverNone();
    const { getByText } = render(<TiltFx reducedMotion={false}>tilt</TiltFx>);
    const tilt = getByText("tilt") as HTMLElement;
    fireEvent.mouseMove(tilt, { clientX: 0, clientY: 0 });
    expect(tilt.style.transform).toBe("");
  });
});

describe("TypeFx mode=fade (2.x FadingLettersFx)", () => {
  it("forwards its ref to the Text it renders", () => {
    const ref = createRef<HTMLSpanElement>();
    const { container } = render(
      <TypeFx ref={ref} mode="fade" words="hi there" state="visible" />,
    );
    expect(ref.current).toBe(container.firstElementChild);
  });
});
