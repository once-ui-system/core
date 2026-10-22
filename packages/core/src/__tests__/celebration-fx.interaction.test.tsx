import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CelebrationFx } from "../components/CelebrationFx";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";
import { controlAnimationFrames, fakeCanvasContext, mockReducedMotion } from "../test/fxTestUtils";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * CelebrationFx draws confetti or fireworks on a decorative canvas behind its
 * children, started at mount, on hover, on click or by `active` (manual). The
 * draw loop must not start under reduced motion, must stop on unmount, and the
 * manual trigger must follow `active` as it changes, not only its first value.
 */
describe("CelebrationFx", () => {
  let canvas: ReturnType<typeof fakeCanvasContext>;
  beforeEach(() => {
    canvas = fakeCanvasContext();
    mockReducedMotion(false);
  });

  it("renders children over a decorative canvas", async () => {
    const { container } = render(
      <CelebrationFx>
        <h2>You did it</h2>
      </CelebrationFx>,
      { wrapper },
    );
    expect(screen.getByRole("heading", { name: "You did it" })).toBeInTheDocument();
    expect(container.querySelector("canvas")).toHaveAttribute("aria-hidden", "true");
    await expectNoAxeViolations(container);
  });

  it("starts drawing at mount and cancels its frame on unmount", () => {
    const frames = controlAnimationFrames();
    const { unmount } = render(<CelebrationFx reducedMotion={false} />, { wrapper });
    expect(canvas.calls.get("clearRect")).toBe(1);
    frames.step(3);
    expect(canvas.calls.get("clearRect")).toBe(4);
    const [id] = frames.pending();
    unmount();
    expect(frames.cancel).toHaveBeenCalledWith(id);
  });

  it("draws nothing under prefers-reduced-motion", () => {
    mockReducedMotion(true);
    const frames = controlAnimationFrames();
    render(<CelebrationFx />, { wrapper });
    // useReducedMotion reads the query in an effect, so the very first commit
    // still sees motion allowed and may paint one frame; no loop survives it.
    expect(frames.pending()).toHaveLength(0);
    frames.step(10);
    expect(canvas.calls.get("clearRect") ?? 0).toBeLessThanOrEqual(1);
  });

  it("draws nothing when forced to reduced motion", () => {
    const frames = controlAnimationFrames();
    render(<CelebrationFx reducedMotion />, { wrapper });
    expect(frames.request).not.toHaveBeenCalled();
  });

  it("launches fireworks only while `active` with the manual trigger", () => {
    const frames = controlAnimationFrames();
    const { rerender } = render(
      <CelebrationFx type="fireworks" trigger="manual" active={false} reducedMotion={false} />,
      { wrapper },
    );
    frames.step(30);
    expect(canvas.calls.get("arc")).toBeUndefined();

    rerender(<CelebrationFx type="fireworks" trigger="manual" active reducedMotion={false} />);
    frames.step(30);
    expect(canvas.calls.get("arc")).toBeGreaterThan(0);
  });

  it("bursts fireworks where clicked with the click trigger", () => {
    const frames = controlAnimationFrames();
    const { container } = render(
      <CelebrationFx type="fireworks" trigger="click" reducedMotion={false} />,
      { wrapper },
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.cursor).toBe("pointer");
    frames.step(30);
    expect(canvas.calls.get("arc")).toBeUndefined();
    fireEvent.click(root, { clientX: 20, clientY: 20 });
    frames.step();
    expect(canvas.calls.get("arc")).toBeGreaterThan(0);
  });

  it("emits fireworks while hovered with the hover trigger", () => {
    const frames = controlAnimationFrames();
    const { container } = render(
      <CelebrationFx type="fireworks" trigger="hover" reducedMotion={false} />,
      { wrapper },
    );
    frames.step(30);
    expect(canvas.calls.get("arc")).toBeUndefined();
    fireEvent.mouseEnter(container.firstElementChild as HTMLElement);
    frames.step(30);
    expect(canvas.calls.get("arc")).toBeGreaterThan(0);
  });

  it("keeps the click cursor when a style is passed", () => {
    const { container } = render(<CelebrationFx trigger="click" style={{ minHeight: "10rem" }} />, {
      wrapper,
    });
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.cursor).toBe("pointer");
    expect(root.style.minHeight).toBe("10rem");
  });

  it("forwards its ref and stops listening for resize on unmount", () => {
    const ref = createRef<HTMLDivElement>();
    const remove = vi.spyOn(window, "removeEventListener");
    const { container, unmount } = render(<CelebrationFx ref={ref} />, { wrapper });
    expect(ref.current).toBe(container.firstElementChild);
    unmount();
    expect(remove).toHaveBeenCalledWith("resize", expect.any(Function));
  });
});
