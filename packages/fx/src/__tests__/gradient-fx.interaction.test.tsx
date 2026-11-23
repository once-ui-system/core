import { LayoutProvider } from "@once-ui-system/core";
import { render, screen } from "@testing-library/react";
import type React from "react";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GradientFx } from "../GradientFx.js";
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

/** A WebGL context whose calls all succeed; `drawArrays` counts the frames drawn. */
function fakeWebGL({ available = true } = {}) {
  const twoD = fakeCanvasContext();
  const draws = vi.fn();
  const gl = new Proxy({} as Record<string | symbol, unknown>, {
    get(_target, prop) {
      if (prop === "then") return undefined;
      if (prop === "drawArrays") return draws;
      if (prop === "isContextLost") return () => false;
      if (prop === "getShaderParameter" || prop === "getProgramParameter") return () => true;
      if (prop === "getAttribLocation") return () => 0;
      if (typeof prop === "string" && /^[A-Z_]+$/.test(prop)) return 1;
      return () => ({});
    },
  });
  twoD.getContext.mockImplementation(((kind: string) =>
    kind === "2d"
      ? twoD.ctx
      : available
        ? gl
        : null) as unknown as HTMLCanvasElement["getContext"]);
  return { draws };
}

describe("GradientFx", () => {
  beforeEach(() => {
    mockReducedMotion(false);
    installIntersectingObserver(true);
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      width: 400,
      height: 200,
      right: 400,
      bottom: 200,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
  });

  it("puts its children over decoration that assistive tech skips", async () => {
    fakeWebGL();
    const { container } = render(
      <GradientFx>
        <h1>Launch</h1>
      </GradientFx>,
      { wrapper },
    );
    expect(screen.getByRole("heading", { name: "Launch" })).toBeInTheDocument();
    for (const layer of container.querySelectorAll("[aria-hidden='true']")) {
      expect(layer.textContent).toBe("");
    }
    await expectNoAxeViolations(container);
  });

  it("draws the field with the shader and caps it near 30 frames a second", () => {
    const { draws } = fakeWebGL();
    const frames = controlAnimationFrames();
    render(<GradientFx />, { wrapper });
    frames.step(1);
    const first = draws.mock.calls.length;
    expect(first).toBe(1);
    frames.step(10, 16);
    // Ten 60 Hz frames are about five 30 fps frames.
    expect(draws.mock.calls.length - first).toBeGreaterThanOrEqual(4);
    expect(draws.mock.calls.length - first).toBeLessThanOrEqual(6);
  });

  it("does not run off screen", () => {
    installIntersectingObserver(false);
    const { draws } = fakeWebGL();
    const frames = controlAnimationFrames();
    render(<GradientFx />, { wrapper });
    frames.step(5);
    expect(draws).not.toHaveBeenCalled();
    expect(frames.pending()).toHaveLength(0);
  });

  it("holds one still frame under reduced motion", () => {
    mockReducedMotion(true);
    const { draws } = fakeWebGL();
    const frames = controlAnimationFrames();
    render(<GradientFx />, { wrapper });
    expect(draws).toHaveBeenCalledTimes(1);
    expect(frames.pending()).toHaveLength(0);
  });

  it("stops its loop on unmount", () => {
    fakeWebGL();
    const frames = controlAnimationFrames();
    const { unmount } = render(<GradientFx />, { wrapper });
    expect(frames.pending().length).toBeGreaterThan(0);
    unmount();
    expect(frames.pending()).toHaveLength(0);
  });

  it("keeps the CSS look, one blob per colour after the ground, without WebGL", () => {
    fakeWebGL({ available: false });
    const { container } = render(<GradientFx colors={["#000", "#123", "#456", "#789"]} />, {
      wrapper,
    });
    expect(container.querySelector("canvas")).toBeNull();
    expect(container.querySelectorAll("[class*='blob']:not([class*='blobs'])")).toHaveLength(3);
  });

  it("renders the same markup for the same seed, so the server and browser agree", () => {
    const a = renderToString(
      <LayoutProvider>
        <GradientFx seed={7} />
      </LayoutProvider>,
    );
    const b = renderToString(
      <LayoutProvider>
        <GradientFx seed={7} />
      </LayoutProvider>,
    );
    const c = renderToString(
      <LayoutProvider>
        <GradientFx seed={8} />
      </LayoutProvider>,
    );
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });
});
