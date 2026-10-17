/**
 * The names a calendar shows, in a locale. Without one (or with a tag the
 * platform does not accept) they are the English names the date components
 * have always shown, word for word, so leaving `locale` out changes nothing.
 */
export interface CalendarNames {
  /** January to December. */
  months: string[];
  /** The column headers, Sunday first: short enough to fit a day's cell. */
  weekdays: string[];
  /** The full weekday names, Sunday first, for screen readers. */
  weekdayLabels: string[];
  /** The day a week starts on in the locale: 0 is Sunday, 1 Monday. */
  firstDayOfWeek: number;
  /** A month with its year, in the locale's order ("October 2026", "2026年10月"). */
  monthYear: (month: number, year: number) => string;
  /** The words for the two halves of a 12-hour clock: "AM" and "PM" in English. */
  dayPeriods: [am: string, pm: string];
  /**
   * A time on a 12-hour clock, in the locale's order ("01:14 PM", "午後01:14"),
   * with `dayPeriods` in place of the locale's own words when given.
   */
  time: (hours: number, minutes: number, dayPeriods?: [string, string]) => string;
}

const pad = (value: number) => value.toString().padStart(2, "0");

const ENGLISH_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const ENGLISH: CalendarNames = {
  months: ENGLISH_MONTHS,
  weekdays: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
  weekdayLabels: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  firstDayOfWeek: 0,
  monthYear: (month, year) => `${ENGLISH_MONTHS[month]} ${year}`,
  dayPeriods: ["AM", "PM"],
  time: (hours, minutes, [am, pm] = ["AM", "PM"]) => {
    const hours12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${pad(hours12)}:${pad(minutes)} ${hours >= 12 ? pm : am}`;
  },
};

/** The locale as the platform resolves it, or undefined when it is missing or not a valid tag. */
const supportedLocale = (locale?: string) => {
  if (!locale) return undefined;
  try {
    return Intl.DateTimeFormat.supportedLocalesOf(locale)[0];
  } catch {
    return undefined;
  }
};

/**
 * Many locales write month names in lower case ("octubre", "octobre"); as a
 * heading or a menu item on its own they start with a capital, the way the
 * platforms' own date pickers show them.
 */
const capitalize = (text: string, locale: string) =>
  text.charAt(0).toLocaleUpperCase(locale) + text.slice(1);

/**
 * The locale's first day of the week, from `Intl.Locale`'s week info (1 is
 * Monday, 7 Sunday). Sunday where the platform has no week info (Firefox), as
 * the calendar has always started.
 */
const firstDayOfWeekOf = (locale: string) => {
  try {
    const info = new Intl.Locale(locale) as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number };
      weekInfo?: { firstDay: number };
    };
    const firstDay = (info.getWeekInfo?.() ?? info.weekInfo)?.firstDay;
    return typeof firstDay === "number" ? firstDay % 7 : 0;
  } catch {
    return 0;
  }
};

const cache = new Map<string, CalendarNames>();

export const getCalendarNames = (locale?: string): CalendarNames => {
  const resolved = supportedLocale(locale);
  if (!resolved) return ENGLISH;

  const cached = cache.get(resolved);
  if (cached) return cached;

  // In UTC, so a date's month and weekday are the same wherever the code runs.
  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(resolved, { ...options, timeZone: "UTC" });
  const month = format({ month: "long" });
  const weekday = format({ weekday: "short" });
  const weekdayLong = format({ weekday: "long" });
  const monthYear = format({ month: "long", year: "numeric" });
  // The picker's hour field runs 1 to 12, so its time is on a 12-hour clock in every locale.
  const clock = format({ hour: "2-digit", minute: "2-digit", hourCycle: "h12" });
  const clockParts = (hours: number, minutes: number) =>
    clock.formatToParts(new Date(Date.UTC(2000, 0, 1, hours, minutes)));
  const dayPeriodAt = (hours: number, fallback: string) =>
    clockParts(hours, 0).find((part) => part.type === "dayPeriod")?.value ?? fallback;
  const dayPeriods: [string, string] = [dayPeriodAt(9, "AM"), dayPeriodAt(21, "PM")];

  // 1 January 2023 was a Sunday.
  const sunday = (offset: number) => new Date(Date.UTC(2023, 0, 1 + offset));

  const names: CalendarNames = {
    months: Array.from({ length: 12 }, (_, index) =>
      capitalize(month.format(new Date(Date.UTC(2023, index, 1))), resolved),
    ),
    weekdays: Array.from({ length: 7 }, (_, index) => weekday.format(sunday(index))),
    weekdayLabels: Array.from({ length: 7 }, (_, index) => weekdayLong.format(sunday(index))),
    firstDayOfWeek: firstDayOfWeekOf(resolved),
    monthYear: (m, year) => {
      const date = new Date(Date.UTC(2000, m, 1));
      // Date.UTC reads years 0 to 99 as 1900 to 1999.
      date.setUTCFullYear(year);
      return capitalize(monthYear.format(date), resolved);
    },
    dayPeriods,
    time: (hours, minutes, [am, pm] = dayPeriods) => {
      const parts: { type: string; value: string }[] = clockParts(hours, minutes);
      // The hour alone is ambiguous on a 12-hour clock: add the period if the locale left it out.
      if (!parts.some((part) => part.type === "dayPeriod")) {
        parts.push({ type: "literal", value: " " }, { type: "dayPeriod", value: "" });
      }
      return parts
        .map((part) => (part.type === "dayPeriod" ? (hours >= 12 ? pm : am) : part.value))
        .join("");
    },
  };
  cache.set(resolved, names);
  return names;
};

/** The locale a date field formats its value in: `locale` when the platform accepts it, else US English. */
export const fieldLocale = (locale?: string) => supportedLocale(locale) ?? "en-US";
