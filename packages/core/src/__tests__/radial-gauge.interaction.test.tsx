import { act, render, screen } from "@testing-library/react";
import type React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { RadialGauge } from "../modules/data/RadialGauge";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const ticks = (container: HTMLElement) => Array.from(container.querySelectorAll("line"));
const lit = (container: HTMLElement) =>
  ticks(container).filter((line) => line.style.opacity === "1").length;

/**
 * Both gauges light `floor(value% of the ticks)` ticks, and step the lit count
 * one tick per 20ms toward a new value instead of jumping. RadialGauge shows
 * the value (or its children) in the middle; LinearGauge can label its scale.
 */
describe("RadialGauge", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("lights value% of its ticks and shows the value with its unit", async () => {
    const { container } = render(<RadialGauge value={50} unit="%" line={{ count: 10 }} />, {
      wrapper,
    });
    expect(ticks(container)).toHaveLength(10);
    expect(lit(container)).toBe(5);
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("%")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("has no duplicate ids when two gauges share a page", async () => {
    const { container } = render(
      <>
        <RadialGauge value={10} />
        <RadialGauge value={20} />
      </>,
      { wrapper },
    );
    const ids = Array.from(container.querySelectorAll("[id]")).map((el) => el.id);
    expect(new Set(ids).size).toBe(ids.length);
    await expectNoAxeViolations(container);
  });

  it("trims edgePad ticks at both ends", () => {
    const { container } = render(<RadialGauge line={{ count: 10 }} edgePad={2} />, { wrapper });
    expect(ticks(container)).toHaveLength(6);
  });

  it("renders children instead of the number", () => {
    render(
      <RadialGauge value={30}>
        <span>Custom</span>
      </RadialGauge>,
      { wrapper },
    );
    expect(screen.getByText("Custom")).toBeInTheDocument();
    expect(screen.queryByText("30")).toBeNull();
  });

  it("steps the lit ticks toward a new value, one per 20ms", () => {
    vi.useFakeTimers();
    const { container, rerender } = render(<RadialGauge value={0} line={{ count: 10 }} />, {
      wrapper,
    });
    rerender(<RadialGauge value={50} line={{ count: 10 }} />);
    act(() => {
      vi.advanceTimersByTime(40);
    });
    expect(lit(container)).toBe(2);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(lit(container)).toBe(5);
    rerender(<RadialGauge value={20} line={{ count: 10 }} />);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(lit(container)).toBe(2);
  });

  it("colours lit ticks along the hue range", () => {
    const { container } = render(<RadialGauge value={100} tone="danger" line={{ count: 2 }} />, {
      wrapper,
    });
    const [first, last] = ticks(container);
    // jsdom serialises hsl() as rgb(): hue 0 is red, hue 30 is orange.
    expect(first.style.stroke).toBe("rgb(255, 0, 0)");
    expect(last.style.stroke).toBe("rgb(255, 128, 0)");
  });

  it("stops stepping on unmount", () => {
    vi.useFakeTimers();
    const { rerender, unmount } = render(<RadialGauge value={0} />, { wrapper });
    rerender(<RadialGauge value={90} />);
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
