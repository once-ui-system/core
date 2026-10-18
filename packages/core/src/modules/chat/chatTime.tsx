import type { ReactNode } from "react";

/**
 * A chat time is either a `Date`, which the chat components format and put in
 * a `<time>` element, or anything else, which they render as given ("Just
 * now", a string the server already formatted).
 */
export type ChatTime = Date | ReactNode;

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

/**
 * A `Date` as a `<time>` with a machine-readable `dateTime`; anything else
 * as given. The formatted text depends on the reader's locale and time zone,
 * so a server render can differ from the client's and the warning is muted.
 */
export function renderChatTime(time: ChatTime, relative = false): ReactNode {
  if (time instanceof Date) {
    return (
      <time dateTime={time.toISOString()} suppressHydrationWarning>
        {formatChatTime(time, relative)}
      </time>
    );
  }
  return time;
}
