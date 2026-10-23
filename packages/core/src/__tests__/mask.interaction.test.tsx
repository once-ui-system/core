import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Mask } from "../components/Mask";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";
import {
  controlAnimationFrames,
  installIntersectingObserver,
  mockReducedMotion,
  resetIntersectionObserver,
} from "../test/fxTestUtils";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * Mask clips its children to a radial window: fixed at `x`/`y` percent, or,
 * with `cursor`, eased toward the pointer on an animation-frame loop that only
 * runs while the mask is on screen and motion is allowed, and stops on unmount.
 */
describe("Mask", () => {
  beforeEach(() => {
    installIntersectingObserver();
  });
  afterEach(() => {
    resetIntersectionObserver();
  });

  it("renders its children without adding semantics", async () => {
    const { container } = render(
      <Mask>
        <p>Inside</p>
      </Mask>,
      { wrapper },
    );
    expect(screen.getByText("Inside")).toBeInTheDocument();
    expect(container.firstElementChild).not.toHaveAttribute("role");
    await expectNoAxeViolations(container);
  });

  it("places a fixed window from x, y and radius", () => {
    const { container } = render(<Mask x={25} y={75} radius={40} />, { wrapper });
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.getPropertyValue("--mask-position-x")).toBe("25%");
    expect(el.style.getPropertyValue("--mask-position-y")).toBe("75%");
    expect(el.style.getPropertyValue("--mask-radius")).toBe("40svh");
  });

  it("fades over the whole radius by default, and over the feather when set", () => {
    const { container, rerender } = render(<Mask x={50} y={50} />, { wrapper });
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.getPropertyValue("--mask-feather")).toBe("100%");
    rerender(<Mask x={50} y={50} feather={0} />);
    expect(el.style.getPropertyValue("--mask-feather")).toBe("0%");
    rerender(<Mask x={50} y={50} feather={140} />);
    expect(el.style.getPropertyValue("--mask-feather")).toBe("100%");
  });

  it("sets no window without x and y or cursor", () => {
    const { container } = render(<Mask x={25} />, { wrapper });
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.getPropertyValue("--mask-position-x")).toBe("");
  });

  it("forwards its ref to the mask element", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<Mask ref={ref} />, { wrapper });
    expect(ref.current).toBe(container.firstElementChild);
  });

  it("eases the window toward the pointer while in view", () => {
    mockReducedMotion(false);
    const frames = controlAnimationFrames();
    const { container } = render(<Mask cursor reducedMotion={false} />, { wrapper });
    const el = container.firstElementChild as HTMLElement;
    expect(frames.pending()).toHaveLength(1);

    fireEvent.mouseMove(document, { clientX: 100, clientY: 200 });
    frames.step();
    const x1 = Number.parseFloat(el.style.getPropertyValue("--mask-position-x"));
    expect(x1).toBeCloseTo(5);
    frames.step(200);
    const x2 = Number.parseFloat(el.style.getPropertyValue("--mask-position-x"));
    const y2 = Number.parseFloat(el.style.getPropertyValue("--mask-position-y"));
    expect(x2).toBeGreaterThan(99);
    expect(y2).toBeGreaterThan(199);
  });

  it("runs no loop when reduced motion is preferred", () => {
    mockReducedMotion(true);
    const frames = controlAnimationFrames();
    render(<Mask cursor />, { wrapper });
    expect(frames.request).not.toHaveBeenCalled();
  });

  it("runs no loop when forced to reduced motion", () => {
    mockReducedMotion(false);
    const frames = controlAnimationFrames();
    render(<Mask cursor reducedMotion />, { wrapper });
    expect(frames.request).not.toHaveBeenCalled();
  });

  it("runs no loop while off screen", () => {
    installIntersectingObserver(false);
    const frames = controlAnimationFrames();
    render(<Mask cursor reducedMotion={false} />, { wrapper });
    expect(frames.request).not.toHaveBeenCalled();
  });

  it("cancels its frame and stops listening on unmount", () => {
    const frames = controlAnimationFrames();
    const { container, unmount } = render(<Mask cursor reducedMotion={false} />, { wrapper });
    const el = container.firstElementChild as HTMLElement;
    const [id] = frames.pending();
    unmount();
    expect(frames.cancel).toHaveBeenCalledWith(id);
    expect(frames.pending()).toHaveLength(0);
    fireEvent.mouseMove(document, { clientX: 100, clientY: 200 });
    expect(el.style.getPropertyValue("--mask-position-x")).toBe("0px");
  });
});
