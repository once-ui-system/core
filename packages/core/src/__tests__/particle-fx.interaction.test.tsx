import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ParticleFx } from "../components/ParticleFx";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { createField, shapePoint, stepField } from "../internal/particleField";
import { expectNoAxeViolations } from "../test/axe";
import {
  controlAnimationFrames,
  fakeCanvasContext,
  installIntersectingObserver,
  mockReducedMotion,
  resetIntersectionObserver,
} from "../test/fxTestUtils";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/** The canvas ParticleFx draws on; it says how many particles it holds. */
const canvas = (container: HTMLElement) =>
  container.querySelector("canvas[data-fx-particle]") as HTMLCanvasElement;
const count = (container: HTMLElement) =>
  Number(canvas(container).getAttribute("data-fx-particles"));

/**
 * ParticleFx draws `density` particles on one canvas and drifts them on an
 * animation-frame loop that runs only while on screen and motion is allowed;
 * under reduced motion it draws them once and never animates. With `shape`
 * part of the field gathers into a mark. With `interactive` the particles
 * react to the pointer. Unmount stops the frame and the listeners.
 */
describe("ParticleFx", () => {
  beforeEach(() => {
    installIntersectingObserver();
    mockReducedMotion(false);
    fakeCanvasContext();
  });
  afterEach(() => {
    resetIntersectionObserver();
    vi.restoreAllMocks();
  });

  it("renders children and a hidden canvas of `density` particles", async () => {
    const { container } = render(
      <ParticleFx density={12} reducedMotion={false}>
        <p>Hero copy</p>
      </ParticleFx>,
      { wrapper },
    );
    expect(screen.getByText("Hero copy")).toBeInTheDocument();
    expect(canvas(container)).toHaveAttribute("aria-hidden", "true");
    expect(count(container)).toBe(12);
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
    const { calls } = fakeCanvasContext();
    render(<ParticleFx density={4} reducedMotion={false} />, { wrapper });
    expect(frames.pending()).toHaveLength(1);
    const before = calls.get("fillRect") ?? 0;
    frames.step(3);
    expect(calls.get("fillRect") ?? 0).toBeGreaterThan(before);
    expect(frames.pending()).toHaveLength(1);
  });

  it("draws still particles under prefers-reduced-motion", () => {
    mockReducedMotion(true);
    const frames = controlAnimationFrames();
    const { container } = render(<ParticleFx density={100} />, { wrapper });
    expect(count(container)).toBe(100);
    expect(frames.request).not.toHaveBeenCalled();
  });

  it("does not animate while off screen", () => {
    installIntersectingObserver(false);
    const frames = controlAnimationFrames();
    render(<ParticleFx density={5} reducedMotion={false} />, { wrapper });
    expect(frames.request).not.toHaveBeenCalled();
  });

  it("stops its frame and pointer listeners on unmount", () => {
    const frames = controlAnimationFrames();
    const { container, unmount } = render(
      <ParticleFx density={3} interactive reducedMotion={false} />,
      { wrapper },
    );
    const root = container.firstElementChild as HTMLElement;
    const remove = vi.spyOn(root, "removeEventListener");
    const [id] = frames.pending();
    unmount();
    expect(frames.cancel).toHaveBeenCalledWith(id);
    expect(remove).toHaveBeenCalledWith("pointermove", expect.any(Function));
  });

  it("forwards its ref", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<ParticleFx ref={ref} density={1} />, { wrapper });
    expect(ref.current).toBe(container.firstElementChild);
  });
});

describe("particle field", () => {
  const still = { pointer: null, radius: 0, mode: "repel" as const, speed: 1, time: 0 };

  it("gathers the `gather` share of particles into the shape, around the focus", () => {
    const field = createField({
      width: 200,
      height: 100,
      count: 10,
      shape: "ring",
      gather: 0.5,
      focus: { x: 0.5, y: 0.5, radius: 0.4 },
    });
    expect(Array.from(field.gathered).filter(Boolean)).toHaveLength(5);
    expect(field.focus).toEqual({ x: 100, y: 50, r: 40 });
    for (let i = 0; i < 5; i++) {
      const d = Math.hypot(field.hx[i] - 100, field.hy[i] - 50);
      expect(d).toBeGreaterThan(40 * 0.85);
      expect(d).toBeLessThanOrEqual(40.001);
    }
  });

  it("spreads every particle without a shape", () => {
    const field = createField({ width: 100, height: 100, count: 20, gather: 1 });
    expect(field.focus).toBeNull();
    expect(Array.from(field.gathered).every((g) => g === 0)).toBe(true);
  });

  it("keeps built-in shapes inside their box and samples custom points", () => {
    for (const shape of ["star", "ring", "diamond"] as const) {
      for (let k = 0; k < 50; k++) {
        const [x, y] = shapePoint(shape, k / 50, ((k * 7) % 50) / 50);
        expect(Math.abs(x)).toBeLessThanOrEqual(1.0001);
        expect(Math.abs(y)).toBeLessThanOrEqual(1.0001);
      }
    }
    const [x, y] = shapePoint([[0.5, -0.5]], 0.3, 0.5);
    expect(x).toBeCloseTo(0.5);
    expect(y).toBeCloseTo(-0.5);
  });

  it("pushes particles away from the pointer in repel mode and pulls them in attract mode", () => {
    const make = () => createField({ width: 100, height: 100, count: 1, random: () => 0.5 });
    const repel = make();
    const attract = make();
    for (let t = 0; t < 10; t++) {
      stepField(repel, { ...still, pointer: { x: 60, y: 50 }, radius: 40, time: t * 16 });
      stepField(attract, {
        ...still,
        pointer: { x: 60, y: 50 },
        radius: 40,
        mode: "attract",
        time: t * 16,
      });
    }
    expect(repel.x[0]).toBeLessThan(50);
    expect(attract.x[0]).toBeGreaterThan(50);
  });

  it("settles particles back home once the pointer leaves", () => {
    const field = createField({ width: 100, height: 100, count: 1, random: () => 0.5 });
    field.x[0] = 0;
    for (let t = 0; t < 400; t++) stepField(field, { ...still, time: 0 });
    expect(Math.abs(field.x[0] - field.hx[0])).toBeLessThan(5);
  });
});
