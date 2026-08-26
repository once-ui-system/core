import { act, render } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CountdownFx, countdownFxVariants } from "../components/CountdownFx";

describe("CountdownFx", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders default CountdownFx with tabular-nums and HH:MM:SS format", () => {
    const targetDate = new Date(Date.now() + (2 * 3600 + 30 * 60 + 45) * 1000);
    const { container } = render(<CountdownFx targetDate={targetDate} />);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toBeInTheDocument();
    expect(root).toHaveClass("tabular-nums", "flex", "items-center", "gap-0");

    // Advance timer to trigger initial calculation and interval
    act(() => {
      vi.advanceTimersByTime(10);
    });

    // Should have 2 separators for HH:MM:SS
    const separators = container.querySelectorAll("span");
    const separatorTexts = Array.from(separators).filter((el) => el.textContent === ":");
    expect(separatorTexts.length).toBe(2);
  });

  it("forwards ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    const targetDate = new Date(Date.now() + 60000);
    render(<CountdownFx ref={ref} targetDate={targetDate} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("renders MM:SS format correctly", () => {
    const targetDate = new Date(Date.now() + (5 * 60 + 30) * 1000);
    const { container } = render(<CountdownFx targetDate={targetDate} format="MM:SS" />);

    act(() => {
      vi.advanceTimersByTime(10);
    });

    // MM:SS should have exactly 1 separator
    const separators = Array.from(container.querySelectorAll("span")).filter(
      (el) => el.textContent === ":",
    );
    expect(separators.length).toBe(1);
  });

  it("renders DD:HH:MM:SS format correctly", () => {
    const targetDate = new Date(Date.now() + (3 * 86400 + 4 * 3600 + 15 * 60 + 20) * 1000);
    const { container } = render(<CountdownFx targetDate={targetDate} format="DD:HH:MM:SS" />);

    act(() => {
      vi.advanceTimersByTime(10);
    });

    // DD:HH:MM:SS should have 3 separators
    const separators = Array.from(container.querySelectorAll("span")).filter(
      (el) => el.textContent === ":",
    );
    expect(separators.length).toBe(3);
  });

  it("calls onComplete when target date is reached", () => {
    const onComplete = vi.fn();
    const targetDate = new Date(Date.now() + 2000);

    render(<CountdownFx targetDate={targetDate} onComplete={onComplete} />);

    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("handles string targetDate format", () => {
    const futureIsoString = new Date(Date.now() + 3600000).toISOString();
    const { container } = render(<CountdownFx targetDate={futureIsoString} />);

    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(container.firstElementChild).toBeInTheDocument();
  });

  it("handles targetDate already in the past on mount", () => {
    const onComplete = vi.fn();
    const pastDate = new Date(Date.now() - 5000);
    const { container } = render(<CountdownFx targetDate={pastDate} onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(container.firstElementChild).toHaveClass("tabular-nums");
  });

  it("merges custom className and style", () => {
    const targetDate = new Date(Date.now() + 60000);
    const { container } = render(
      <CountdownFx
        targetDate={targetDate}
        className="custom-countdown"
        style={{ zIndex: 10 }}
      />,
    );
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass("custom-countdown", "tabular-nums");
    expect(root.style.zIndex).toBe("10");
  });

  it("exports countdownFxVariants CVA function", () => {
    expect(countdownFxVariants()).toBe("tabular-nums");
    expect(countdownFxVariants({ className: "custom-test" })).toContain("tabular-nums");
    expect(countdownFxVariants({ className: "custom-test" })).toContain("custom-test");
  });
});
