import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ParticleFx } from "../components/ParticleFx";
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

/** The particles are the bare divs ParticleFx appends; children render inside a Flex of their own. */
const particles = (container: HTMLElement) =>
  Array.from((container.firstElementChild as HTMLElement).children).filter(
    (el) => (el as HTMLElement).style.borderRadius === "50%",
  ) as HTMLElement[];

/**
 * ParticleFx scatters `density` dots and drifts them on an animation-frame
 * loop that runs only while on screen and motion is allowed; under reduced
 * motion it places at most 30 dots and never animates. With `interactive` the
 * dots react to the pointer. Unmount removes dots, listener and frame.
 */
describe("ParticleFx", () => {
  beforeEach(() => {
    installIntersectingObserver();
    mockReducedMotion(false);
  });
  afterEach(() => {
    resetIntersectionObserver();
  });

  it("renders children and `density` decorative dots", async () => {
    const { container } = render(
      <ParticleFx density={12} reducedMotion={false}>
        <p>Hero copy</p>
      </ParticleFx>,
      { wrapper },
    );
    expect(screen.getByText("Hero copy")).toBeInTheDocument();
    expect(particles(container)).toHaveLength(12);
    expect(particles(container).every((el) => el.textContent === "")).toBe(true);
    await expectNoAxeViolations(container);
  });

  it("is pointer-transparent unless interactive", () => {
    const { container, rerender } = render(<ParticleFx density={1} />, { wrapper });
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toMatch(/pointer-events-none/);
    rerender(<ParticleFx density={1} interactive />);
    expect(root.className).toMatch(/pointer-events-auto/);
  });

  it("animates while on screen", () => {
    const frames = controlAnimationFrames();
    const { container } = render(<ParticleFx density={4} reducedMotion={false} />, { wrapper });
    expect(frames.pending()).toHaveLength(1);
    const before = particles(container).map((el) => el.style.transform);
    vi.spyOn(Date, "now").mockReturnValue(5_000_000);
    frames.step(5);
    expect(particles(container).map((el) => el.style.transform)).not.toEqual(before);
    expect(frames.pending()).toHaveLength(1);
  });

  it("places at most 30 still dots under prefers-reduced-motion", () => {
    mockReducedMotion(true);
    const frames = controlAnimationFrames();
    const { container } = render(<ParticleFx density={100} />, { wrapper });
    expect(particles(container)).toHaveLength(30);
    expect(frames.pending()).toHaveLength(0);
  });

  it("places still dots when forced to reduced motion", () => {
    const frames = controlAnimationFrames();
    const { container } = render(<ParticleFx density={10} reducedMotion />, { wrapper });
    expect(particles(container)).toHaveLength(10);
    expect(frames.request).not.toHaveBeenCalled();
  });

  it("does not animate while off screen", () => {
    installIntersectingObserver(false);
    const frames = controlAnimationFrames();
    render(<ParticleFx density={5} reducedMotion={false} />, { wrapper });
    expect(frames.request).not.toHaveBeenCalled();
  });

  it("pushes dots away from the pointer in repel mode", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5); // every dot starts at 50%, 50%
    const frames = controlAnimationFrames();
    const { container } = render(
      <ParticleFx density={1} interactive intensity={40} speed={1} reducedMotion={false} />,
      { wrapper },
    );
    const root = container.firstElementChild as HTMLElement;
    vi.spyOn(root, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      width: 100,
      height: 100,
      right: 100,
      bottom: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    fireEvent.mouseMove(root, { clientX: 60, clientY: 50 });
    frames.step(20);
    const x = Number.parseFloat(particles(container)[0].style.transform.split("(")[1]);
    expect(x).toBeLessThan(50);
  });

  it("removes its dots, frame and pointer listener on unmount", () => {
    const frames = controlAnimationFrames();
    const { container, unmount } = render(
      <ParticleFx density={3} interactive reducedMotion={false} />,
      { wrapper },
    );
    const root = container.firstElementChild as HTMLElement;
    const remove = vi.spyOn(root, "removeEventListener");
    const [id] = frames.pending();
    const dots = particles(container);
    unmount();
    expect(frames.cancel).toHaveBeenCalledWith(id);
    expect(remove).toHaveBeenCalledWith("mousemove", expect.any(Function));
    expect(dots.every((el) => !el.isConnected)).toBe(true);
  });

  it("forwards its ref", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<ParticleFx ref={ref} density={1} />, { wrapper });
    expect(ref.current).toBe(container.firstElementChild);
  });
});
