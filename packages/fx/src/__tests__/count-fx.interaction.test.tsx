import { LayoutProvider } from "@once-ui-system/core";
import { render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { CountFx } from "../CountFx.js";
import { expectNoAxeViolations } from "../test/axe.js";
import { controlAnimationFrames, mockReducedMotion } from "../test/fxTestUtils.js";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * CountFx shows `value` at once on mount and animates toward a new value over
 * `speed` ms on an animation-frame loop, cancelled on unmount. The `wheel` and
 * `smooth` effects draw a 0-9 strip per digit, which must not be what a screen
 * reader reads: the number itself has to be in the accessible text.
 */
describe("CountFx", () => {
  it("shows the value immediately on mount, without animating", () => {
    const frames = controlAnimationFrames();
    render(<CountFx value={42} />, { wrapper });
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(frames.request).not.toHaveBeenCalled();
  });

  it("formats with separator and decimals", () => {
    render(<CountFx value={1234567.5} separator="," decimals={2} />, { wrapper });
    expect(screen.getByText("1,234,567.50")).toBeInTheDocument();
  });

  it("uses a custom format", () => {
    render(<CountFx value={9} format={(v: number) => `$${v}`} />, { wrapper });
    expect(screen.getByText("$9")).toBeInTheDocument();
  });

  it("renders children after the number", () => {
    render(
      <CountFx value={9} as="p">
        %
      </CountFx>,
      { wrapper },
    );
    expect(screen.getByText(/9/).textContent).toBe("9%");
  });

  it("counts linearly to a new value over `speed` ms", () => {
    const frames = controlAnimationFrames();
    const { rerender } = render(<CountFx value={0} duration={160} easing="linear" />, { wrapper });
    rerender(<CountFx value={100} duration={160} easing="linear" />);
    frames.step(); // seeds the start time
    frames.step(5); // 80ms of 160ms
    expect(screen.getByText("50")).toBeInTheDocument();
    frames.step(5);
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(frames.pending()).toHaveLength(0);
  });

  it("eases out: further along than linear at the halfway mark", () => {
    const frames = controlAnimationFrames();
    const { rerender } = render(<CountFx value={0} duration={160} />, { wrapper });
    rerender(<CountFx value={100} duration={160} />);
    frames.step(6);
    expect(Number(screen.getByText(/^\d+$/).textContent)).toBeGreaterThan(80);
  });

  it("cancels the frame in flight on unmount", () => {
    const frames = controlAnimationFrames();
    const { rerender, unmount } = render(<CountFx value={0} duration={1000} />, { wrapper });
    rerender(<CountFx value={100} duration={1000} />);
    frames.step(2);
    expect(frames.pending()).toHaveLength(1);
    unmount();
    expect(frames.cancel).toHaveBeenCalled();
    expect(frames.pending()).toHaveLength(0);
  });

  it.each(["wheel", "smooth"] as const)(
    "exposes the number, not the digit strips, to assistive tech (%s)",
    async (effect) => {
      const { container } = render(<CountFx value={42} effect={effect} />, { wrapper });
      const text = (container.firstElementChild as HTMLElement).firstElementChild as HTMLElement;
      // Every 0-9 strip is hidden; only the value is read.
      const visible = Array.from(text.childNodes)
        .filter((node) => !(node as Element).closest?.("[aria-hidden='true']"))
        .map((node) => node.textContent)
        .join("");
      expect(visible).toBe("42");
      await expectNoAxeViolations(container);
    },
  );

  it("lands the wheel on the target digits after animating", () => {
    const frames = controlAnimationFrames();
    const { container, rerender } = render(
      <CountFx value={10} effect="wheel" duration={160} easing="linear" />,
      { wrapper },
    );
    rerender(<CountFx value={25} effect="wheel" duration={160} easing="linear" />);
    frames.step(12);
    // The centred digit in each strip sits at translateY(0%).
    const centred = Array.from(container.querySelectorAll<HTMLElement>("[style*='translateY(0%)']"))
      .map((el) => el.textContent)
      .join("");
    expect(centred).toBe("25");
  });

  // The count ran through every number whatever the motion preference.
  it("jumps to a new value without counting under reduced motion", () => {
    mockReducedMotion(true);
    const frames = controlAnimationFrames();
    const { rerender } = render(<CountFx value={0} duration={160} />, { wrapper });
    rerender(<CountFx value={100} duration={160} />);
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(frames.pending()).toHaveLength(0);
  });
});
