import { LayoutProvider } from "@once-ui-system/core";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CelebrationFx } from "../CelebrationFx.js";
import { expectNoAxeViolations } from "../test/axe.js";
import {
  controlAnimationFrames,
  fakeCanvasContext,
  installIntersectingObserver,
  mockReducedMotion,
  resetIntersectionObserver,
} from "../test/fxTestUtils.js";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const giveLayout = () =>
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    left: 0,
    top: 0,
    width: 300,
    height: 200,
    right: 300,
    bottom: 200,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });

const drawn = (canvas: ReturnType<typeof fakeCanvasContext>) =>
  (canvas.calls.get("fillRect") ?? 0) +
  (canvas.calls.get("arc") ?? 0) +
  (canvas.calls.get("stroke") ?? 0);

/**
 * CelebrationFx draws confetti or fireworks on a decorative canvas behind its
 * children. `active` / `defaultActive` / `onActiveChange` is its state: the
 * `mount` trigger starts active, `hover` follows the pointer, `click` bursts
 * where clicked, and `duration` (3 s by default) turns it off. The loop runs
 * on time, not frames, and sleeps once everything has settled.
 */
describe("CelebrationFx", () => {
  let canvas: ReturnType<typeof fakeCanvasContext>;
  beforeEach(() => {
    canvas = fakeCanvasContext();
    mockReducedMotion(false);
    giveLayout();
  });
  afterEach(() => {
    vi.useRealTimers();
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
    frames.step(3);
    expect(drawn(canvas)).toBeGreaterThan(0);
    const [id] = frames.pending();
    expect(id).toBeDefined();
    unmount();
    expect(frames.cancel).toHaveBeenCalledWith(id);
  });

  it("shows a still frame and runs no loop under prefers-reduced-motion", () => {
    mockReducedMotion(true);
    const frames = controlAnimationFrames();
    render(<CelebrationFx />, { wrapper });
    // Read on the first run too, not only once useReducedMotion catches up.
    expect(frames.request).not.toHaveBeenCalled();
    expect(drawn(canvas)).toBeGreaterThan(0);
  });

  it("runs no loop when forced to reduced motion", () => {
    const frames = controlAnimationFrames();
    render(<CelebrationFx reducedMotion />, { wrapper });
    expect(frames.request).not.toHaveBeenCalled();
  });

  it("follows a controlled `active`", () => {
    const frames = controlAnimationFrames();
    const { rerender } = render(
      <CelebrationFx type="fireworks" active={false} reducedMotion={false} />,
      { wrapper },
    );
    frames.step(30);
    expect(canvas.calls.get("stroke")).toBeUndefined();

    rerender(<CelebrationFx type="fireworks" active reducedMotion={false} />);
    frames.step(30);
    expect(canvas.calls.get("stroke")).toBeGreaterThan(0);
  });

  it("ends after `duration`, tells the parent, and lets the loop sleep", () => {
    vi.useFakeTimers();
    const frames = controlAnimationFrames();
    const onActiveChange = vi.fn();
    render(
      <CelebrationFx duration={1000} onActiveChange={onActiveChange} reducedMotion={false} />,
      { wrapper },
    );
    frames.step(10);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onActiveChange).toHaveBeenCalledWith(false);
    // Everything in the air lands within a few seconds, then no frame is asked for.
    frames.step(600, 16);
    expect(frames.pending()).toHaveLength(0);
  });

  it("ends after 3 s by default", () => {
    vi.useFakeTimers();
    controlAnimationFrames();
    const onActiveChange = vi.fn();
    render(<CelebrationFx onActiveChange={onActiveChange} reducedMotion={false} />, { wrapper });
    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(onActiveChange).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onActiveChange).toHaveBeenCalledWith(false);
  });

  it("runs until `active` turns off with `duration={0}`", () => {
    vi.useFakeTimers();
    controlAnimationFrames();
    const onActiveChange = vi.fn();
    render(<CelebrationFx duration={0} onActiveChange={onActiveChange} reducedMotion={false} />, {
      wrapper,
    });
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(onActiveChange).not.toHaveBeenCalled();
  });

  it("bursts fireworks where clicked with the click trigger", () => {
    const frames = controlAnimationFrames();
    const { container } = render(
      <CelebrationFx type="fireworks" trigger="click" reducedMotion={false} />,
      { wrapper },
    );
    const root = container.firstElementChild as HTMLElement;
    frames.step(30);
    expect(drawn(canvas)).toBe(0);
    fireEvent.click(root, { clientX: 20, clientY: 20 });
    frames.step();
    expect(canvas.calls.get("stroke")).toBeGreaterThan(0);
  });

  it("drops no confetti at mount with the hover and click triggers", () => {
    const frames = controlAnimationFrames();
    render(<CelebrationFx trigger="hover" reducedMotion={false} />, { wrapper });
    render(<CelebrationFx trigger="click" reducedMotion={false} />, { wrapper });
    frames.step(120);
    expect(drawn(canvas)).toBe(0);
  });

  it("celebrates while hovered and reports it", () => {
    const frames = controlAnimationFrames();
    const onActiveChange = vi.fn();
    const { container } = render(
      <CelebrationFx
        type="fireworks"
        trigger="hover"
        onActiveChange={onActiveChange}
        reducedMotion={false}
      />,
      { wrapper },
    );
    const root = container.firstElementChild as HTMLElement;
    frames.step(30);
    expect(canvas.calls.get("stroke")).toBeUndefined();
    fireEvent.mouseEnter(root);
    expect(onActiveChange).toHaveBeenLastCalledWith(true);
    frames.step(30);
    expect(canvas.calls.get("stroke")).toBeGreaterThan(0);
    fireEvent.mouseLeave(root);
    expect(onActiveChange).toHaveBeenLastCalledWith(false);
  });

  it("keeps the trigger working when the parent passes its own handlers", () => {
    const frames = controlAnimationFrames();
    const onClick = vi.fn();
    const { container } = render(
      <CelebrationFx type="fireworks" trigger="click" onClick={onClick} reducedMotion={false} />,
      { wrapper },
    );
    fireEvent.click(container.firstElementChild as HTMLElement, { clientX: 10, clientY: 10 });
    frames.step(2);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(canvas.calls.get("stroke")).toBeGreaterThan(0);
  });

  it("starts afresh when `type` changes mid-flight", () => {
    const frames = controlAnimationFrames();
    const { rerender } = render(<CelebrationFx reducedMotion={false} />, { wrapper });
    frames.step(5);
    rerender(<CelebrationFx type="fireworks" reducedMotion={false} />);
    expect(() => frames.step(60)).not.toThrow();
    expect(canvas.calls.get("stroke")).toBeGreaterThan(0);
  });

  it("does not restart on a parent re-render with an equal palette", () => {
    const frames = controlAnimationFrames();
    const { rerender } = render(
      <CelebrationFx colors={["brand-solid-medium"]} reducedMotion={false} />,
      { wrapper },
    );
    frames.step(2);
    const before = frames.cancel.mock.calls.length;
    rerender(<CelebrationFx colors={["brand-solid-medium"]} reducedMotion={false} />);
    expect(frames.cancel.mock.calls.length).toBe(before);
  });

  it("sleeps while off screen", () => {
    const observers = installIntersectingObserver(true);
    const frames = controlAnimationFrames();
    render(<CelebrationFx reducedMotion={false} />, { wrapper });
    frames.step(2);
    expect(frames.pending()).toHaveLength(1);
    act(() => {
      for (const o of observers) {
        o.callback(
          [{ isIntersecting: false } as IntersectionObserverEntry],
          {} as IntersectionObserver,
        );
      }
    });
    expect(frames.pending()).toHaveLength(0);
    resetIntersectionObserver();
  });

  it("forwards its ref", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<CelebrationFx ref={ref} />, { wrapper });
    expect(ref.current).toBe(container.firstElementChild);
  });
});
