"use client";

import type { DateRange } from "@once-ui-system/core";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

/*
 * Docs pages are prerendered at build time. An example seeded with
 * `useState(new Date())` rendered the build's date and time into the HTML,
 * the visitor's clock rendered another, and hydration failed (React #418)
 * on every visit after the minute the docs were built. These start empty
 * and become now once mounted, so server and client agree.
 */

export function useNowState(): [Date | undefined, Dispatch<SetStateAction<Date | undefined>>] {
  const [value, setValue] = useState<Date | undefined>();
  useEffect(() => setValue((current) => current ?? new Date()), []);
  return [value, setValue];
}

/** A range from today to `days` days ahead, set once mounted. */
export function useRangeFromToday(days: number): [DateRange, Dispatch<SetStateAction<DateRange>>] {
  const [range, setRange] = useState<DateRange>({ startDate: undefined, endDate: undefined });
  useEffect(() => {
    const start = new Date();
    const end = new Date(start);
    end.setDate(start.getDate() + days);
    setRange((current) => (current.startDate ? current : { startDate: start, endDate: end }));
  }, [days]);
  return [range, setRange];
}
