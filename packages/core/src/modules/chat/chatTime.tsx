"use client";

import { type ReactNode, useEffect, useState } from "react";
import { formatRelativeTime, relativeTimeRefresh } from "../../utils/relativeTime";

/**
 * A chat time is either a `Date`, which the chat components format and put in
 * a `<time>` element, or anything else, which they render as given ("Just
 * now", a string the server already formatted).
 */
export type ChatTime = Date | ReactNode;

/**
 * How a `Date` reads: `"clock"` is the time of day ("8:51 AM"), `"relative"`
 * a short distance from now that keeps itself current ("now", "2m", "1h",
 * then the date), in the reader's language.
 */
export type ChatTimeFormat = "clock" | "relative";

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/**
 * Hours and minutes for a message; for a conversation list (`relative`), the
 * time today, the weekday within the last week, and the date before that.
 */
export function formatChatTime(date: Date, relative = false, now = new Date()): string {
  if (!relative || sameDay(date, now)) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  const days = (now.getTime() - date.getTime()) / 86_400_000;
  if (days > 0 && days < 7) {
    return date.toLocaleDateString([], { weekday: "short" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

/** "2m", re-rendered when the wording would change, with the clock time on hover. */
function LiveRelativeTime({ date }: { date: Date }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setTimeout(() => setNow(Date.now()), relativeTimeRefresh(date, now));
    return () => clearTimeout(timer);
  }, [date, now]);

  return (
    <time
      dateTime={date.toISOString()}
      title={date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
      suppressHydrationWarning
    >
      {formatRelativeTime(date, { now })}
    </time>
  );
}

/**
 * A `Date` as a `<time>` with a machine-readable `dateTime`; anything else
 * as given. The formatted text depends on the reader's locale, time zone and
 * clock, so a server render can differ from the client's and the warning is
 * muted.
 */
export function renderChatTime(
  time: ChatTime,
  relative = false,
  format: ChatTimeFormat = "clock",
): ReactNode {
  if (time instanceof Date) {
    if (format === "relative") return <LiveRelativeTime date={time} />;
    return (
      <time dateTime={time.toISOString()} suppressHydrationWarning>
        {formatChatTime(time, relative)}
      </time>
    );
  }
  return time;
}
