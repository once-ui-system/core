/**
 * How `formatRelativeTime` words a time.
 *
 * - `"narrow"`: "now", "5m", "3h", "2d", "3w", then the date ("Oct 12"), the
 *   way a feed or a chat labels a post. Narrow units stop at weeks: in many
 *   locales a narrow month reads the same as a minute ("3m").
 * - `"short"`: "now", "5 min. ago", "yesterday", "3 mo. ago".
 * - `"long"`: "now", "5 minutes ago", "yesterday", "3 months ago".
 */
export type RelativeTimeStyle = "narrow" | "short" | "long";

export interface RelativeTimeOptions {
  /** Defaults to `"narrow"`. */
  style?: RelativeTimeStyle;
  /** A BCP 47 tag such as `"hu"` or `"en-GB"`. Defaults to the reader's locale. */
  locale?: string | string[];
  /** The moment to measure from. Defaults to the current time. */
  now?: Date | number;
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

type Unit = "minute" | "hour" | "day" | "week" | "month" | "year";

const UNITS: [Unit, number][] = [
  ["year", YEAR],
  ["month", MONTH],
  ["week", WEEK],
  ["day", DAY],
  ["hour", HOUR],
  ["minute", MINUTE],
];

const toTime = (value: Date | number | string) =>
  value instanceof Date ? value.getTime() : typeof value === "number" ? value : Date.parse(value);

/**
 * A time as a distance from now, in the reader's language: "5m", "5 min.
 * ago" or "5 minutes ago" by `style`. Under a minute, either way, is "now".
 * Uses the platform's `Intl`, so every locale it knows is covered with no
 * strings to translate.
 */
export function formatRelativeTime(
  date: Date | number | string,
  { style = "narrow", locale, now = Date.now() }: RelativeTimeOptions = {},
): string {
  const time = toTime(date);
  const diff = toTime(now) - time;
  const distance = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(locale, {
    numeric: "auto",
    style: style === "long" ? "long" : style === "short" ? "short" : "narrow",
  });

  if (Number.isNaN(time)) return "";
  if (distance < MINUTE) return rtf.format(0, "second");

  if (style === "narrow") {
    // A future time keeps its direction ("in 5m"); the bare unit is for the past.
    if (diff < 0) {
      const [unit, size] = UNITS.find(([, size]) => distance >= size) as [Unit, number];
      return rtf.format(Math.trunc(distance / size), unit);
    }
    if (distance < 4 * WEEK) {
      const [unit, size] = UNITS.find(([, size]) => distance >= size) as [Unit, number];
      return new Intl.NumberFormat(locale, {
        style: "unit",
        unit,
        unitDisplay: "narrow",
      }).format(Math.floor(distance / size));
    }
    const then = new Date(time);
    const sameYear = then.getFullYear() === new Date(toTime(now)).getFullYear();
    return then.toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
      year: sameYear ? undefined : "numeric",
    });
  }

  const [unit, size] = UNITS.find(([, size]) => distance >= size) as [Unit, number];
  return rtf.format(Math.trunc(-diff / size), unit);
}

/**
 * How long, in milliseconds, until `formatRelativeTime` would word `date`
 * differently: a second past the next whole minute under an hour, the next
 * whole hour under a day, and so on. For a label that keeps itself current
 * with one timer instead of a tick every second.
 */
export function relativeTimeRefresh(
  date: Date | number | string,
  now: Date | number = Date.now(),
): number {
  const distance = Math.abs(toTime(now) - toTime(date));
  const step = distance < HOUR ? MINUTE : distance < DAY ? HOUR : DAY;
  return step - (distance % step) + SECOND;
}
