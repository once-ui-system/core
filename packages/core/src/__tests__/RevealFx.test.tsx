import { act, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getSpeedDurationMs,
  getTranslateYValue,
  RevealFx,
  revealFxVariants,
} from "../components/RevealFx";

describe("RevealFx", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("exports revealFxVariants with expected state classes", () => {
    const hidden = revealFxVariants({ state: "hidden" });
    expect(hidden).toContain("transition-all");
    expect(hidden).toContain("[mask-size:400%_100%]");
    expect(hidden).toContain("[-webkit-mask-size:400%_100%]");
    expect(hidden).toContain("[mask-position:100%_0]");
    expect(hidden).toContain("blur-[1rem]");

    const revealed = revealFxVariants({ state: "revealed" });
    expect(revealed).toContain("[mask-position:0_0]");
    expect(revealed).toContain("blur-none");

    const revealedNoMask = revealFxVariants({ state: "revealedNoMask" });
    expect(revealedNoMask).toContain("blur-none");
    expect(revealedNoMask).toContain("opacity-100");

    const hiddenNoMask = revealFxVariants({ state: "hiddenNoMask" });
    expect(hiddenNoMask).toContain("blur-[0.5rem]");
    expect(hiddenNoMask).toContain("opacity-0");
  });

  it("computes duration and translateY helpers correctly", () => {
    expect(getSpeedDurationMs("fast")).toBe(1000);
    expect(getSpeedDurationMs("medium")).toBe(2000);
    expect(getSpeedDurationMs("slow")).toBe(3000);
    expect(getSpeedDurationMs(500)).toBe(500);

    expect(getTranslateYValue(1)).toBe("1rem");
    expect(getTranslateYValue(0.5)).toBe("0.5rem");
    expect(getTranslateYValue("16")).toBe("var(--static-space-16)");
    expect(getTranslateYValue(undefined)).toBeUndefined();
  });

  it("renders with default props and animates after delay", () => {
    const { container } = render(
      <RevealFx>
        <span>Revealed Content</span>
      </RevealFx>,
    );
    const el = container.firstChild as HTMLElement;

    expect(el).toBeInTheDocument();
    expect(el).toHaveClass("w-full");
    expect(screen.getByText("Revealed Content")).toBeInTheDocument();

    // Initial state is hidden with mask
    expect(el.className).toContain("[mask-position:100%_0]");
    expect(el.style.transitionDuration).toBe("2s");

    // Advance delay (0ms) -> isRevealed becomes true
    act(() => {
      vi.advanceTimersByTime(10);
    });
    expect(el.className).toContain("[mask-position:0_0]");

    // Advance transition duration (2000ms) -> mask is removed
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(el.className).toContain("opacity-100");
    expect(el.className).not.toContain("[mask-position:");
  });

  it("respects custom speed and delay", () => {
    const { container } = render(
      <RevealFx speed="fast" delay={0.5} translateY={1}>
        <span>Fast Content</span>
      </RevealFx>,
    );
    const el = container.firstChild as HTMLElement;

    expect(el.style.transitionDuration).toBe("1s");
    expect(el.style.transform).toBe("translateY(1rem)");

    // Before delay expires (500ms), still hidden
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(el.className).toContain("[mask-position:100%_0]");
    expect(el.style.transform).toBe("translateY(1rem)");

    // After delay expires (500ms), isRevealed is true
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(el.className).toContain("[mask-position:0_0]");
    expect(el.style.transform).toBe("translateY(0)");

    // After fast duration (1000ms), mask is removed
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(el.className).toContain("opacity-100");
  });

  it("handles controlled trigger prop", () => {
    const { container, rerender } = render(
      <RevealFx trigger={false} speed={500}>
        <span>Controlled</span>
      </RevealFx>,
    );
    const el = container.firstChild as HTMLElement;

    expect(el.className).toContain("[mask-position:100%_0]");

    // Change trigger to true
    rerender(
      <RevealFx trigger={true} speed={500}>
        <span>Controlled</span>
      </RevealFx>,
    );
    expect(el.className).toContain("[mask-position:0_0]");

    // Advance timer past 500ms
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(el.className).toContain("opacity-100");

    // Change trigger back to false
    rerender(
      <RevealFx trigger={false} speed={500}>
        <span>Controlled</span>
      </RevealFx>,
    );
    expect(el.className).toContain("[mask-position:100%_0]");
  });

  it("renders without mask immediately when revealedByDefault is true", () => {
    const { container } = render(
      <RevealFx revealedByDefault>
        <span>Default Revealed</span>
      </RevealFx>,
    );
    const el = container.firstChild as HTMLElement;

    expect(el.className).toContain("opacity-100");
    expect(el.className).not.toContain("[mask-position:");
  });

  it("handles reduced motion override", () => {
    const { container } = render(
      <RevealFx reducedMotion={true} translateY={1}>
        <span>Reduced Motion</span>
      </RevealFx>,
    );
    const el = container.firstChild as HTMLElement;

    expect(el.style.transitionDuration).toBe("0s");
    expect(el.className).toContain("opacity-100");
    expect(el.style.transform).toBe("translateY(0)");
  });

  it("forwards ref to the root HTMLDivElement", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <RevealFx ref={ref}>
        <span>Ref Content</span>
      </RevealFx>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges custom className and style", () => {
    const { container } = render(
      <RevealFx className="custom-reveal" style={{ zIndex: 5 }}>
        <span>Custom</span>
      </RevealFx>,
    );
    const el = container.firstChild as HTMLElement;

    expect(el).toHaveClass("custom-reveal");
    expect(el.style.zIndex).toBe("5");
  });

  it("passes Flex props down to root element", () => {
    const { container } = render(
      <RevealFx direction="column" gap="16" padding="8" radius="m">
        <span>Flex Items</span>
      </RevealFx>,
    );
    const el = container.firstChild as HTMLElement;

    expect(el).toHaveClass("flex-col", "gap-16", "p-8", "rounded-m");
  });
});
