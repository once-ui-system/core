import { act, render, screen } from "@testing-library/react";
import type React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { LinearGauge } from "../modules/data/LinearGauge";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const ticks = (container: HTMLElement) => Array.from(container.querySelectorAll("line"));
const lit = (container: HTMLElement) =>
  ticks(container).filter((line) => line.style.opacity === "1").length;

/**
 * Both gauges light `floor(value% of the ticks)` ticks, and step the lit count
 * one tick per 20ms toward a new value instead of jumping. LinearGauge can
 * label its scale.
 */
describe("LinearGauge", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("lights value% of its ticks", async () => {
    const { container } = render(<LinearGauge value={25} line={{ count: 8 }} />, { wrapper });
    expect(ticks(container)).toHaveLength(8);
    expect(lit(container)).toBe(2);
    await expectNoAxeViolations(container);
  });

  it("labels the scale in percent or with given labels", () => {
    const { rerender } = render(<LinearGauge labels="percentage" />, { wrapper });
    for (const label of ["0%", "25%", "50%", "75%", "100%"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    rerender(<LinearGauge labels={["Low", "High"]} />);
    expect(screen.getByText("Low")).toBeInTheDocument();
    expect(screen.queryByText("50%")).toBeNull();
  });

  it("draws a single tick without NaN coordinates", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = render(<LinearGauge value={100} line={{ count: 1 }} />, { wrapper });
    expect(ticks(container)[0].getAttribute("x1")).not.toBe("NaN");
    expect(error).not.toHaveBeenCalled();
  });

  it("steps toward a new value", () => {
    vi.useFakeTimers();
    const { container, rerender } = render(<LinearGauge value={0} line={{ count: 10 }} />, {
      wrapper,
    });
    rerender(<LinearGauge value={100} line={{ count: 10 }} />);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(lit(container)).toBe(5);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(lit(container)).toBe(10);
  });
});
