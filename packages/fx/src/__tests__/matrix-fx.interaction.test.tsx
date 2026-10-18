import { LayoutProvider } from "@once-ui-system/core";
import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MatrixFx } from "../MatrixFx.js";
import { expectNoAxeViolations } from "../test/axe.js";
import {
  controlAnimationFrames,
  fakeCanvasContext,
  installIntersectingObserver,
  mockReducedMotion,
} from "../test/fxTestUtils.js";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/** jsdom has no layout; MatrixFx waits for a non-zero box before it builds its grid. */
const giveLayout = () =>
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    left: 0,
    top: 0,
    width: 30,
    height: 30,
    right: 30,
    bottom: 30,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });

/**
 * MatrixFx paints a dot grid on a decorative canvas behind its children,
 * revealed instantly, on mount, on hover/click or by `active`. A static grid
 * stops the frame loop; flicker and bulge keep it running, except under
 * reduced motion, where the grid is drawn once and the loop stops.
 */
describe("MatrixFx", () => {
  let canvas: ReturnType<typeof fakeCanvasContext>;
  beforeEach(() => {
    canvas = fakeCanvasContext();
    installIntersectingObserver();
    mockReducedMotion(false);
    giveLayout();
  });

  it("renders children over a decorative canvas", async () => {
    const { container } = render(
      <MatrixFx>
        <p>Inside</p>
      </MatrixFx>,
      { wrapper },
    );
    expect(screen.getByText("Inside")).toBeInTheDocument();
    expect(container.querySelector("canvas")).toHaveAttribute("aria-hidden", "true");
    await expectNoAxeViolations(container);
  });

  it("draws nothing until the container has a size", () => {
    vi.restoreAllMocks();
    canvas = fakeCanvasContext();
    const frames = controlAnimationFrames();
    render(<MatrixFx />, { wrapper });
    frames.step(5, 20);
    expect(canvas.calls.get("fillRect")).toBeUndefined();
  });

  it("draws the instant grid once and stops the loop", () => {
    const frames = controlAnimationFrames();
    render(<MatrixFx reducedMotion={false} />, { wrapper });
    frames.step(3, 20);
    expect(canvas.calls.get("fillRect")).toBeGreaterThan(0);
    expect(frames.pending()).toHaveLength(0);
  });

  it("keeps the loop running for flicker", () => {
    const frames = controlAnimationFrames();
    render(<MatrixFx flicker reducedMotion={false} />, { wrapper });
    frames.step(10, 20);
    expect(frames.pending()).toHaveLength(1);
  });

  it("stops flicker and bulge loops under reduced motion", () => {
    mockReducedMotion(true);
    const frames = controlAnimationFrames();
    render(<MatrixFx flicker bulge={{ type: "wave" }} />, { wrapper });
    frames.step(10, 20);
    expect(canvas.calls.get("fillRect")).toBeGreaterThan(0);
    expect(frames.pending()).toHaveLength(0);
  });

  it("stops the flicker loop when forced to reduced motion", () => {
    const frames = controlAnimationFrames();
    render(<MatrixFx flicker reducedMotion />, { wrapper });
    frames.step(10, 20);
    expect(frames.pending()).toHaveLength(0);
  });

  it("reveals on hover and hides again on leave", () => {
    const frames = controlAnimationFrames();
    const now = vi.spyOn(Date, "now").mockReturnValue(1_000_000);
    const { container } = render(<MatrixFx trigger="hover" reducedMotion={false} />, { wrapper });
    frames.step(3, 20);
    // Nothing is shown before the pointer arrives, and the loop idles.
    expect(canvas.calls.get("fillRect")).toBeUndefined();
    expect(frames.pending()).toHaveLength(0);

    const root = container.firstElementChild as HTMLElement;
    fireEvent.mouseEnter(root);
    expect(frames.pending()).toHaveLength(1);
    now.mockReturnValue(1_002_000);
    frames.step(3, 20);
    expect(canvas.calls.get("fillRect")).toBeGreaterThan(0);

    fireEvent.mouseLeave(root);
    now.mockReturnValue(1_010_000);
    frames.step(5, 20);
    expect(frames.pending()).toHaveLength(0);
  });

  // The hover reveal ran its eased grow-in and shrink-out under reduced
  // motion, and the loop kept running for as long as the pointer stayed.
  it("reveals and hides at once on hover under reduced motion, and stops the loop", () => {
    mockReducedMotion(true);
    const frames = controlAnimationFrames();
    vi.spyOn(Date, "now").mockReturnValue(1_000_000);
    const { container } = render(<MatrixFx trigger="hover" />, { wrapper });
    frames.step(3, 20);
    expect(canvas.calls.get("fillRect")).toBeUndefined();

    const root = container.firstElementChild as HTMLElement;
    fireEvent.mouseEnter(root);
    // No time has passed: an animated reveal would not show a dot yet.
    frames.step(1, 20);
    const drawn = canvas.calls.get("fillRect") ?? 0;
    expect(drawn).toBeGreaterThan(0);
    expect(frames.pending()).toHaveLength(0);

    fireEvent.mouseLeave(root);
    frames.step(2, 20);
    expect(canvas.calls.get("fillRect")).toBe(drawn);
    expect(frames.pending()).toHaveLength(0);
  });

  it("toggles the reveal on click with the click trigger", () => {
    const frames = controlAnimationFrames();
    vi.spyOn(Date, "now").mockReturnValue(1_000_000);
    const { container } = render(<MatrixFx trigger="click" reducedMotion={false} />, { wrapper });
    frames.step(3, 20);
    expect(frames.pending()).toHaveLength(0);
    fireEvent.click(container.firstElementChild as HTMLElement);
    expect(frames.pending()).toHaveLength(1);
  });

  it("follows `active` with the manual trigger", () => {
    const frames = controlAnimationFrames();
    vi.spyOn(Date, "now").mockReturnValue(1_000_000);
    const { rerender } = render(<MatrixFx trigger="manual" reducedMotion={false} />, { wrapper });
    frames.step(3, 20);
    expect(frames.pending()).toHaveLength(0);
    rerender(<MatrixFx trigger="manual" active reducedMotion={false} />);
    expect(frames.pending()).toHaveLength(1);
  });

  it("cancels its frame and resize listener on unmount, and forwards its ref", () => {
    const frames = controlAnimationFrames();
    const ref = createRef<HTMLDivElement>();
    const remove = vi.spyOn(window, "removeEventListener");
    const { container, unmount } = render(<MatrixFx ref={ref} flicker reducedMotion={false} />, {
      wrapper,
    });
    expect(ref.current).toBe(container.firstElementChild);
    frames.step(3, 20);
    const [id] = frames.pending();
    unmount();
    expect(frames.cancel).toHaveBeenCalledWith(id);
    expect(remove).toHaveBeenCalledWith("resize", expect.any(Function));
  });
});
