import { LayoutProvider } from "@once-ui-system/core";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { expectNoAxeViolations } from "../test/axe.js";
import {
  controlAnimationFrames,
  fakeCanvasContext,
  mockReducedMotion,
} from "../test/fxTestUtils.js";
import { WeatherFx } from "../WeatherFx.js";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const giveLayout = () =>
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    left: 0,
    top: 0,
    width: 200,
    height: 100,
    right: 200,
    bottom: 100,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });

/**
 * WeatherFx draws rain, snow, leaves or lightning on a decorative canvas
 * behind its children. `active` / `defaultActive` / `onActiveChange` is its
 * state: on from mount, while hovered, toggled by click, or set by the parent.
 * No frame loop runs under reduced motion, unmount cancels the loop, and the
 * loop sleeps once the weather has stopped and fallen away.
 */
describe("WeatherFx", () => {
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
      <WeatherFx>
        <p>Forecast</p>
      </WeatherFx>,
      { wrapper },
    );
    expect(screen.getByText("Forecast")).toBeInTheDocument();
    expect(container.querySelector("canvas")).toHaveAttribute("aria-hidden", "true");
    await expectNoAxeViolations(container);
  });

  it.each([
    ["rain", "stroke"],
    ["snow", "drawImage"],
    ["leaves", "drawImage"],
  ] as const)("draws %s from mount", (type, call) => {
    const frames = controlAnimationFrames();
    render(<WeatherFx type={type} intensity={10} reducedMotion={false} />, { wrapper });
    frames.step(3);
    expect(canvas.calls.get(call) ?? canvas.calls.get("fill") ?? 0).toBeGreaterThan(0);
    expect(frames.pending()).toHaveLength(1);
  });

  it("draws while `active` from the first render", () => {
    const frames = controlAnimationFrames();
    render(<WeatherFx trigger="click" active intensity={10} reducedMotion={false} />, {
      wrapper,
    });
    frames.step(3);
    expect(canvas.calls.get("stroke")).toBeGreaterThan(0);
  });

  it("starts drawing when a controlled `active` turns on", () => {
    const frames = controlAnimationFrames();
    const { rerender } = render(<WeatherFx active={false} intensity={10} reducedMotion={false} />, {
      wrapper,
    });
    frames.step(3);
    expect(canvas.calls.get("stroke")).toBeUndefined();
    rerender(<WeatherFx active intensity={10} reducedMotion={false} />);
    frames.step(3);
    expect(canvas.calls.get("stroke")).toBeGreaterThan(0);
  });

  it("stops after `duration`, tells the parent, and lets the loop sleep", () => {
    vi.useFakeTimers();
    const frames = controlAnimationFrames();
    const onActiveChange = vi.fn();
    render(
      <WeatherFx
        duration={500}
        intensity={10}
        onActiveChange={onActiveChange}
        reducedMotion={false}
      />,
      { wrapper },
    );
    frames.step(5);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(onActiveChange).toHaveBeenCalledWith(false);
    frames.step(200);
    expect(frames.pending()).toHaveLength(0);
  });

  it("starts afresh when `type` changes", () => {
    const frames = controlAnimationFrames();
    const { rerender } = render(<WeatherFx intensity={10} reducedMotion={false} />, { wrapper });
    frames.step(2);
    rerender(<WeatherFx type="snow" intensity={10} reducedMotion={false} />);
    const before = canvas.calls.get("stroke") ?? 0;
    frames.step(2);
    // Snow draws flakes now; no rain drop is carried over as a broken flake.
    expect(canvas.calls.get("stroke") ?? 0).toBe(before);
    expect(canvas.calls.get("drawImage")).toBeGreaterThan(0);
  });

  it("keeps lightning under three flashes a second at any intensity", () => {
    const frames = controlAnimationFrames();
    render(<WeatherFx type="lightning" intensity={400} reducedMotion={false} />, { wrapper });
    // Each visible bolt lights the sky once a frame, so the fills per frame
    // count the bolts on screen. A strike is a rise in that count; the bolts of
    // one strike land within 25 ms of each other, so rises a few frames apart
    // are the same strike.
    const starts: number[] = [];
    let total = 0;
    let visible = 0;
    for (let i = 0; i < 600; i++) {
      frames.step(1, 16);
      const now = canvas.calls.get("fillRect") ?? 0;
      const bolts = now - total;
      total = now;
      if (bolts > visible && (starts.length === 0 || i - starts[starts.length - 1] > 4)) {
        starts.push(i);
      }
      visible = bolts;
    }
    // 600 frames of 16 ms is 9.6 s: at most one strike every half second.
    expect(starts.length).toBeLessThanOrEqual(Math.ceil(9.6 / 0.5) + 1);
  });

  it("keeps the trigger working when the parent passes its own handlers", () => {
    const frames = controlAnimationFrames();
    const onClick = vi.fn();
    const { container } = render(
      <WeatherFx trigger="click" intensity={5} onClick={onClick} reducedMotion={false} />,
      { wrapper },
    );
    fireEvent.click(container.firstElementChild as HTMLElement);
    frames.step(2);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(canvas.calls.get("stroke")).toBeGreaterThan(0);
  });

  it("starts on hover and on click with those triggers", () => {
    const frames = controlAnimationFrames();
    const hover = render(<WeatherFx trigger="hover" intensity={5} reducedMotion={false} />, {
      wrapper,
    });
    frames.step(2);
    expect(canvas.calls.get("stroke")).toBeUndefined();
    fireEvent.mouseEnter(hover.container.firstElementChild as HTMLElement);
    frames.step(2);
    const afterHover = canvas.calls.get("stroke") ?? 0;
    expect(afterHover).toBeGreaterThan(0);
    hover.unmount();

    const click = render(<WeatherFx trigger="click" intensity={5} reducedMotion={false} />, {
      wrapper,
    });
    frames.step(2);
    expect(canvas.calls.get("stroke")).toBe(afterHover);
    fireEvent.click(click.container.firstElementChild as HTMLElement);
    frames.step(2);
    expect(canvas.calls.get("stroke")).toBeGreaterThan(afterHover);
  });

  it("runs no loop under prefers-reduced-motion", () => {
    mockReducedMotion(true);
    const frames = controlAnimationFrames();
    render(<WeatherFx />, { wrapper });
    // The first commit runs before useReducedMotion has read the query; no loop survives it.
    expect(frames.pending()).toHaveLength(0);
  });

  it("runs no loop when forced to reduced motion", () => {
    const frames = controlAnimationFrames();
    render(<WeatherFx reducedMotion />, { wrapper });
    expect(frames.request).not.toHaveBeenCalled();
  });

  it("cancels its frame on unmount, and forwards its ref", () => {
    const frames = controlAnimationFrames();
    const ref = createRef<HTMLDivElement>();
    const { container, unmount } = render(<WeatherFx ref={ref} reducedMotion={false} />, {
      wrapper,
    });
    expect(ref.current).toBe(container.firstElementChild);
    const [id] = frames.pending();
    unmount();
    expect(frames.cancel).toHaveBeenCalledWith(id);
  });
});
