import { act, render, waitFor } from "@testing-library/react";
import type React from "react";
import { Profiler, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "../components/DatePicker";
import { LayoutProvider } from "../contexts/LayoutProvider";

/**
 * Picking a day in a controlled DatePicker took the day grid out of the page
 * for a moment: the new `value` marked the calendar unsynced, which rendered
 * no grid until a timer put it back. The picker's height collapsed and
 * sprang back on every click. The grid now stays mounted through a pick.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const jan = (day: number) => new Date(2026, 0, day);

const dayButton = (date: Date) =>
  document.querySelector<HTMLButtonElement>(`button[data-value="${date.toISOString()}"]`);

function Controlled({ range }: { range?: boolean }) {
  const [value, setValue] = useState<Date>(jan(5));
  const [rangeValue, setRangeValue] = useState<{ startDate?: Date; endDate?: Date }>({
    startDate: jan(5),
  });
  return range ? (
    <DatePicker range value={rangeValue} onValueChange={setRangeValue} />
  ) : (
    <DatePicker value={value} onValueChange={setValue} />
  );
}

/**
 * Each commit of the picker, checked for its day grid. A commit without one
 * is a frame the browser may paint with the picker's height collapsed.
 */
function watchGrid() {
  const missing: string[] = [];
  let watching = false;
  const onRender = (_id: string, phase: string) => {
    if (watching && !document.querySelector('[role="grid"] button[data-value]'))
      missing.push(phase);
  };
  return {
    missing,
    onRender,
    start: () => {
      watching = true;
    },
    stop: () => {
      watching = false;
    },
  };
}

describe("DatePicker pick keeps its height", () => {
  for (const range of [false, true]) {
    it(`keeps the day grid mounted while a pick syncs${range ? " (range)" : ""}`, async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const watch = watchGrid();
      render(
        <Profiler id="picker" onRender={watch.onRender}>
          <Controlled range={range} />
        </Profiler>,
        { wrapper },
      );
      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      await waitFor(() => expect(dayButton(jan(12))).not.toBeNull());

      watch.start();
      await act(async () => {
        dayButton(jan(12))?.click();
      });
      // The state after the pick, before any timer runs.
      expect(document.querySelector('[role="grid"] button[data-value]')).not.toBeNull();
      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      await act(async () => {
        await Promise.resolve();
      });
      watch.stop();
      vi.useRealTimers();
      expect(watch.missing).toEqual([]);
      expect(dayButton(jan(12))).not.toBeNull();
    });
  }
});
