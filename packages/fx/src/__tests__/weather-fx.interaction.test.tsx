import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WeatherFx } from "../WeatherFx.js";
import { LayoutProvider } from "@once-ui-system/core";
import { expectNoAxeViolations } from "../test/axe.js";
import {
  controlAnimationFrames,
  fakeCanvasContext,
  mockReducedMotion,
} from "../test/fxTestUtils.js";

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
 * behind its children, from mount, while hovered, toggled by click, or while
 * `active` (manual). No frame loop runs under reduced motion, and unmount
 * cancels the loop.
 */
describe("WeatherFx", () => {
  let canvas: ReturnType<typeof fakeCanvasContext>;
  beforeEach(() => {
    canvas = fakeCanvasContext();
    mockReducedMotion(false);
    giveLayout();
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
    ["snow", "arc"],
    ["leaves", "ellipse"],
  ] as const)("draws %s from mount", (type, call) => {
    const frames = controlAnimationFrames();
    render(<WeatherFx type={type} intensity={10} reducedMotion={false} />, { wrapper });
    frames.step(3);
    expect(canvas.calls.get(call) ?? canvas.calls.get("fill") ?? 0).toBeGreaterThan(0);
    expect(frames.pending()).toHaveLength(1);
  });

  it("draws while `active` from the first render with the manual trigger", () => {
    const frames = controlAnimationFrames();
    render(<WeatherFx trigger="manual" active intensity={10} reducedMotion={false} />, {
      wrapper,
    });
    frames.step(3);
    expect(canvas.calls.get("stroke")).toBeGreaterThan(0);
  });

  it("starts drawing when `active` turns on with the manual trigger", () => {
    const frames = controlAnimationFrames();
    const { rerender } = render(
      <WeatherFx trigger="manual" intensity={10} reducedMotion={false} />,
      { wrapper },
    );
    frames.step(3);
    expect(canvas.calls.get("stroke")).toBeUndefined();
    rerender(<WeatherFx trigger="manual" active intensity={10} reducedMotion={false} />);
    frames.step(3);
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

  it("cancels its frame and resize listener on unmount, and forwards its ref", () => {
    const frames = controlAnimationFrames();
    const ref = createRef<HTMLDivElement>();
    const remove = vi.spyOn(window, "removeEventListener");
    const { container, unmount } = render(<WeatherFx ref={ref} reducedMotion={false} />, {
      wrapper,
    });
    expect(ref.current).toBe(container.firstElementChild);
    const [id] = frames.pending();
    unmount();
    expect(frames.cancel).toHaveBeenCalledWith(id);
    expect(remove).toHaveBeenCalledWith("resize", expect.any(Function));
  });
});
