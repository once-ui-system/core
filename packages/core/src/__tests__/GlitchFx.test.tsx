import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GlitchFx, glitchFxVariants } from "../components/GlitchFx";

describe("GlitchFx", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it("renders GlitchFx container with children and 3 flex layers", () => {
    const { container } = render(
      <GlitchFx>
        <span data-testid="glitch-child">Glitch Content</span>
      </GlitchFx>,
    );
    const root = container.firstElementChild as HTMLElement;

    expect(root).toBeInTheDocument();
    expect(root).toHaveClass("relative", "select-none", "inline-flex");

    const layers = root.querySelectorAll(":scope > div");
    expect(layers.length).toBe(3);

    // Main content layer
    expect(layers[0]).toHaveClass("inline-flex", "w-full", "z-index-1");
    expect(screen.getAllByTestId("glitch-child")).toHaveLength(3);

    // Blue shift layer
    expect(layers[1]).toHaveClass(
      "absolute",
      "pointer-events-none",
      "[filter:hue-rotate(260deg)]",
      "animate-glitch-blue",
      "[animation-play-state:running]",
    );

    // Red shift layer
    expect(layers[2]).toHaveClass(
      "absolute",
      "pointer-events-none",
      "[filter:hue-rotate(120deg)]",
      "animate-glitch-red",
      "[animation-play-state:running]",
    );
  });

  it("forwards ref to the root HTMLDivElement", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <GlitchFx ref={ref}>
        <span>Test Ref</span>
      </GlitchFx>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges custom className and style", () => {
    const { container } = render(
      <GlitchFx className="custom-glitch-class" style={{ zIndex: 5 }}>
        <span>Styled Content</span>
      </GlitchFx>,
    );
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass("custom-glitch-class", "relative", "select-none");
    expect(root.style.zIndex).toBe("5");
  });

  it("applies correct duration CSS custom property based on speed prop", () => {
    const { container: defaultContainer } = render(
      <GlitchFx>
        <span>Medium</span>
      </GlitchFx>,
    );
    expect(defaultContainer.firstElementChild).toHaveClass("[--glitch-duration:2.5s]");

    const { container: slowContainer } = render(
      <GlitchFx speed="slow">
        <span>Slow</span>
      </GlitchFx>,
    );
    expect(slowContainer.firstElementChild).toHaveClass("[--glitch-duration:3.5s]");

    const { container: fastContainer } = render(
      <GlitchFx speed="fast">
        <span>Fast</span>
      </GlitchFx>,
    );
    expect(fastContainer.firstElementChild).toHaveClass("[--glitch-duration:1.5s]");
  });

  it("handles hover trigger correctly and invokes mouse event callbacks", () => {
    const handleMouseEnter = vi.fn();
    const handleMouseLeave = vi.fn();

    const { container } = render(
      <GlitchFx
        trigger="hover"
        continuous={false}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span>Hover Me</span>
      </GlitchFx>,
    );
    const root = container.firstElementChild as HTMLElement;
    const layers = root.querySelectorAll(":scope > div");
    const blueLayer = layers[1] as HTMLElement;
    const redLayer = layers[2] as HTMLElement;

    // Initially paused on hover trigger
    expect(blueLayer).toHaveClass("[animation-play-state:paused]");
    expect(redLayer).toHaveClass("[animation-play-state:paused]");

    // On mouse enter -> running
    fireEvent.mouseEnter(root);
    expect(handleMouseEnter).toHaveBeenCalledTimes(1);
    expect(blueLayer).toHaveClass("[animation-play-state:running]");
    expect(redLayer).toHaveClass("[animation-play-state:running]");

    // On mouse leave -> paused
    fireEvent.mouseLeave(root);
    expect(handleMouseLeave).toHaveBeenCalledTimes(1);
    expect(blueLayer).toHaveClass("[animation-play-state:paused]");
    expect(redLayer).toHaveClass("[animation-play-state:paused]");
  });

  it("handles custom trigger with interval timer", () => {
    vi.useFakeTimers();

    const { container } = render(
      <GlitchFx trigger="custom" continuous={false} interval={2000}>
        <span>Custom Interval</span>
      </GlitchFx>,
    );
    const root = container.firstElementChild as HTMLElement;
    const layers = root.querySelectorAll(":scope > div");
    const blueLayer = layers[1] as HTMLElement;

    // Initially paused when continuous is false and trigger is custom
    expect(blueLayer).toHaveClass("[animation-play-state:paused]");

    // Advance to 2000ms: interval fires, active for 500ms
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(blueLayer).toHaveClass("[animation-play-state:running]");

    // Advance 500ms: timeout fires and glitch turns off
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(blueLayer).toHaveClass("[animation-play-state:paused]");

    vi.useRealTimers();
  });

  it("exports glitchFxVariants CVA function", () => {
    expect(glitchFxVariants()).toContain("relative");
    expect(glitchFxVariants()).toContain("select-none");
    expect(glitchFxVariants({ speed: "slow" })).toContain("[--glitch-duration:3.5s]");
    expect(glitchFxVariants({ speed: "medium" })).toContain("[--glitch-duration:2.5s]");
    expect(glitchFxVariants({ speed: "fast" })).toContain("[--glitch-duration:1.5s]");
    expect(glitchFxVariants({ className: "custom-variant" })).toContain("custom-variant");
  });
});
