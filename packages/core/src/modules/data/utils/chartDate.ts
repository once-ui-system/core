import { format, parseISO } from "date-fns";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * A row's date as a `Date`, read the same way on the server and in every browser.
 *
 * A date-only string (`"2025-01-01"`) is midnight UTC, as `new Date("2025-01-01")`
 * reads it, so rows and a `date.start` / `date.end` written either way line up in
 * any time zone. Other ISO strings keep their own time and offset.
 */
export function toChartDate(value: unknown): Date | undefined {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : value;
  if (typeof value !== "string") return undefined;
  const parsed = DATE_ONLY.test(value) ? new Date(value) : parseISO(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

/** True when a date is exactly midnight UTC: a calendar day, not a moment. */
export function isCalendarDay(date: Date): boolean {
  return (
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0
  );
}

/**
 * Formats a chart date with a date-fns pattern. A calendar day (midnight UTC) is
 * written as that day wherever the page renders, so the server and the browser
 * write the same label and `new Date("1980-01-01")` never reads as 1979 west of
 * Greenwich. A moment with a time is written in the reader's time zone.
 */
export function formatChartDate(date: Date, pattern: string): string {
  if (!isCalendarDay(date)) return format(date, pattern);
  return format(new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()), pattern);
}
