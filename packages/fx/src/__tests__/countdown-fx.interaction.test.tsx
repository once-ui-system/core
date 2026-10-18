import { LayoutProvider } from "@once-ui-system/core";
import { act, render } from "@testing-library/react";
import type React from "react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CountdownFx } from "../CountdownFx.js";
import { expectNoAxeViolations } from "../test/axe.js";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const NOW = new Date("2026-01-01T00:00:00Z");
const inMs = (ms: number) => new Date(NOW.getTime() + ms);
const H = 3_600_000;
const M = 60_000;
const S = 1_000;

/** The read-out as a screen reader gets it: CountFx exposes each digit as text. */
const readout = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>("[class*='hidden'], span"))
    .filter((el) => el.children.length === 0 && !el.closest("[aria-hidden='true']"))
    .map((el) => el.textContent)
    .join("");

/**
 * CountdownFx ticks once a second toward `targetDate`, laid out by `format`,
 * and calls `onComplete` once when it reaches zero. A parent re-rendering with
 * a fresh inline callback or Date must not restart the countdown or call
 * onComplete again.
 */
describe("CountdownFx", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows hours, minutes and seconds by default", async () => {
    const { container } = render(<CountdownFx targetDate={inMs(2 * H + 3 * M + 4 * S)} />, {
      wrapper,
    });
    expect(readout(container)).toBe("02:03:04");
    vi.useRealTimers();
    await expectNoAxeViolations(container);
  });

  it("folds days into hours in HH:MM:SS", () => {
    const { container } = render(<CountdownFx targetDate={inMs(26 * H + 5 * S)} />, { wrapper });
    expect(readout(container)).toBe("26:00:05");
  });

  it("splits days out in DD:HH:MM:SS", () => {
    const { container } = render(
      <CountdownFx targetDate={inMs(26 * H + 5 * S)} format="DD:HH:MM:SS" />,
      { wrapper },
    );
    expect(readout(container)).toBe("01:02:00:05");
  });

  it("drops hours in MM:SS", () => {
    const { container } = render(<CountdownFx targetDate={inMs(4 * M + 5 * S)} format="MM:SS" />, {
      wrapper,
    });
    expect(readout(container)).toBe("04:05");
  });

  it("accepts an ISO string target", () => {
    const { container } = render(<CountdownFx targetDate={inMs(90 * S).toISOString()} />, {
      wrapper,
    });
    expect(readout(container)).toBe("00:01:30");
  });

  it("ticks down once a second", () => {
    const { container } = render(<CountdownFx targetDate={inMs(10 * S)} />, { wrapper });
    act(() => {
      vi.advanceTimersByTime(3 * S);
    });
    expect(readout(container)).toBe("00:00:07");
  });

  it("shows zeros and calls onComplete exactly once at the end", () => {
    const onComplete = vi.fn();
    const { container } = render(<CountdownFx targetDate={inMs(2 * S)} onComplete={onComplete} />, {
      wrapper,
    });
    act(() => {
      vi.advanceTimersByTime(2 * S);
    });
    expect(readout(container)).toBe("00:00:00");
    expect(onComplete).toHaveBeenCalledTimes(1);
    act(() => {
      vi.advanceTimersByTime(10 * S);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("does not call onComplete again when the parent re-renders with a new callback", () => {
    const calls: string[] = [];
    const target = inMs(1 * S);
    const { rerender } = render(
      <CountdownFx targetDate={target} onComplete={() => calls.push("a")} />,
      { wrapper },
    );
    act(() => {
      vi.advanceTimersByTime(1 * S);
    });
    rerender(<CountdownFx targetDate={new Date(target)} onComplete={() => calls.push("b")} />);
    act(() => {
      vi.advanceTimersByTime(3 * S);
    });
    expect(calls).toEqual(["a"]);
  });

  it("forwards its ref to the root element, running and finished", () => {
    const ref = createRef<HTMLDivElement>();
    const { container, rerender } = render(<CountdownFx ref={ref} targetDate={inMs(5 * S)} />, {
      wrapper,
    });
    expect(ref.current).toBe(container.firstElementChild);
    rerender(<CountdownFx ref={ref} targetDate={inMs(-5 * S)} />);
    expect(ref.current).toBe(container.firstElementChild);
  });

  it("stops ticking on unmount", () => {
    const { unmount } = render(<CountdownFx targetDate={inMs(10 * H)} />, { wrapper });
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
