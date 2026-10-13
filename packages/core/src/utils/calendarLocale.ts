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
  /** A month with its year, in the locale's order ("October 2026", "2026年10月"). */
  monthYear: (month: number, year: number) => string;
}

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
  monthYear: (month, year) => `${ENGLISH_MONTHS[month]} ${year}`,
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

  // 1 January 2023 was a Sunday.
  const sunday = (offset: number) => new Date(Date.UTC(2023, 0, 1 + offset));

  const names: CalendarNames = {
    months: Array.from({ length: 12 }, (_, index) =>
      capitalize(month.format(new Date(Date.UTC(2023, index, 1))), resolved),
    ),
    weekdays: Array.from({ length: 7 }, (_, index) => weekday.format(sunday(index))),
    weekdayLabels: Array.from({ length: 7 }, (_, index) => weekdayLong.format(sunday(index))),
    monthYear: (m, year) => {
      const date = new Date(Date.UTC(2000, m, 1));
      // Date.UTC reads years 0 to 99 as 1900 to 1999.
      date.setUTCFullYear(year);
      return capitalize(monthYear.format(date), resolved);
    },
  };
  cache.set(resolved, names);
  return names;
};

/** The locale a date field formats its value in: `locale` when the platform accepts it, else US English. */
export const fieldLocale = (locale?: string) => supportedLocale(locale) ?? "en-US";
