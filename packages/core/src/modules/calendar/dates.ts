/**
 * The date arithmetic and the layouts behind `Calendar`, with no React in
 * them, so they are tested on their own and an app can reuse them (a list of
 * the week's events beside the grid, a server that counts a day's bookings).
 *
 * Every date is a local `Date`. A day is midnight to midnight in the
 * browser's time zone; a calendar for another zone is given dates already
 * moved into it.
 */

export const MINUTES_PER_DAY = 24 * 60;

export interface CalendarEventBase {
  id: string;
  start: Date;
  end: Date;
  /** Shown in the all-day row (week and day) and as a bar (month). */
  allDay?: boolean;
}

/** Midnight at the start of the date's day. */
export const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

/** The date `days` days on, at the same clock time (summer time kept). */
export const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

/** The same day of the month `months` months on, clamped to the month's end. */
export const addMonths = (date: Date, months: number) => {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(date.getDate(), lastDay));
  return target;
};

export const addMinutes = (date: Date, minutes: number) =>
  new Date(date.getTime() + minutes * 60_000);

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** The first day of the date's week, for a week that starts on `weekStartsOn` (0 Sunday). */
export const startOfWeek = (date: Date, weekStartsOn = 0) => {
  const day = startOfDay(date);
  const shift = (day.getDay() - weekStartsOn + 7) % 7;
  return addDays(day, -shift);
};

/** The days a view shows, midnight each: one, seven, or whole weeks round the month. */
export const viewDays = (view: CalendarView, date: Date, weekStartsOn = 0): Date[] => {
  if (view === "day") return [startOfDay(date)];
  if (view === "week") {
    const first = startOfWeek(date, weekStartsOn);
    return Array.from({ length: 7 }, (_, i) => addDays(first, i));
  }
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const first = startOfWeek(monthStart, weekStartsOn);
  const last = addDays(startOfWeek(monthEnd, weekStartsOn), 6);
  const days: Date[] = [];
  for (let day = first; day <= last; day = addDays(day, 1)) days.push(day);
  return days;
};

export type CalendarView = "month" | "week" | "day";

/** The date one step back or on in the view: a month, a week or a day. */
export const stepDate = (view: CalendarView, date: Date, step: number) =>
  view === "month" ? addMonths(date, step) : addDays(date, view === "week" ? 7 * step : step);

/** Minutes since the day's midnight. */
export const minutesInDay = (date: Date, day: Date) =>
  Math.round((date.getTime() - startOfDay(day).getTime()) / 60_000);

/** Whether the event touches the day: it starts before the day ends and ends after it starts. */
export const touchesDay = (event: CalendarEventBase, day: Date) => {
  const dayStart = startOfDay(day);
  const dayEnd = addDays(dayStart, 1);
  // A zero-length event (a deadline) still belongs to the day it sits in.
  if (event.end.getTime() === event.start.getTime())
    return event.start >= dayStart && event.start < dayEnd;
  return event.start < dayEnd && event.end > dayStart;
};

/**
 * Whether the event goes in a view's all-day row rather than the hours: it is
 * marked all-day, or it runs across midnight for a full day or more.
 */
export const isAllDayLike = (event: CalendarEventBase) =>
  Boolean(event.allDay) || event.end.getTime() - event.start.getTime() >= MINUTES_PER_DAY * 60_000;

export interface TimedBlock<E extends CalendarEventBase> {
  event: E;
  /** Minutes from the day's midnight to the block's top, clipped to the day. */
  top: number;
  /** Minutes from the day's midnight to the block's bottom, clipped to the day. */
  bottom: number;
  /** The lane it sits in among the events it overlaps, from 0. */
  lane: number;
  /** How many lanes its group of overlapping events needs. */
  lanes: number;
  /** Whether the event began on an earlier day or goes on past this one. */
  continuesBefore: boolean;
  continuesAfter: boolean;
}

/**
 * One day's timed events as blocks, side by side where they overlap, the way
 * calendar apps draw them: each group of events that overlap one another
 * shares the column width, and an event takes the first lane free at its
 * start. A block is at least `minMinutes` tall so a five-minute call can
 * still be read and pressed.
 */
export const layoutDay = <E extends CalendarEventBase>(
  events: E[],
  day: Date,
  minMinutes = 20,
): TimedBlock<E>[] => {
  const blocks = events
    .filter((event) => !isAllDayLike(event) && touchesDay(event, day))
    .map((event) => {
      const top = Math.max(0, minutesInDay(event.start, day));
      const end = Math.min(MINUTES_PER_DAY, minutesInDay(event.end, day));
      return {
        event,
        top,
        bottom: Math.min(MINUTES_PER_DAY, Math.max(end, top + minMinutes)),
        lane: 0,
        lanes: 1,
        continuesBefore: event.start < startOfDay(day),
        continuesAfter: event.end > addDays(startOfDay(day), 1),
      };
    })
    .sort((a, b) => a.top - b.top || b.bottom - a.bottom || a.event.id.localeCompare(b.event.id));

  let group: TimedBlock<E>[] = [];
  let laneEnds: number[] = [];
  let groupEnd = -1;
  const closeGroup = () => {
    for (const block of group) block.lanes = laneEnds.length;
    group = [];
    laneEnds = [];
  };
  for (const block of blocks) {
    if (block.top >= groupEnd) closeGroup();
    let lane = laneEnds.findIndex((end) => end <= block.top);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(block.bottom);
    } else {
      laneEnds[lane] = block.bottom;
    }
    block.lane = lane;
    group.push(block);
    groupEnd = Math.max(groupEnd, block.bottom);
  }
  closeGroup();
  return blocks;
};

export interface SpanSegment<E extends CalendarEventBase> {
  event: E;
  /** The index of the first day it covers in the row, from 0. */
  startIndex: number;
  /** How many days it covers in the row. */
  span: number;
  /** The row of bars it sits in, from 0. */
  lane: number;
  continuesBefore: boolean;
  continuesAfter: boolean;
}

/**
 * Events as bars across a row of days (a week of the month, or the all-day
 * row above the hours), each in the first lane free over its whole span.
 * Longer bars go first, so a week-long trip keeps the top lane and the
 * single days fit round it.
 */
export const layoutSpans = <E extends CalendarEventBase>(
  events: E[],
  days: Date[],
): SpanSegment<E>[] => {
  if (days.length === 0) return [];
  const segments: SpanSegment<E>[] = [];
  for (const event of events) {
    const covered = days
      .map((day, index) => (touchesDay(event, day) ? index : -1))
      .filter((index) => index !== -1);
    if (covered.length === 0) continue;
    const first = covered[0];
    const last = covered[covered.length - 1];
    segments.push({
      event,
      startIndex: first,
      span: last - first + 1,
      lane: 0,
      continuesBefore: event.start < startOfDay(days[0]),
      continuesAfter: event.end > addDays(startOfDay(days[days.length - 1]), 1),
    });
  }
  segments.sort(
    (a, b) =>
      a.startIndex - b.startIndex ||
      b.span - a.span ||
      Number(isAllDayLike(b.event)) - Number(isAllDayLike(a.event)) ||
      a.event.start.getTime() - b.event.start.getTime() ||
      a.event.id.localeCompare(b.event.id),
  );
  const lanes: boolean[][] = [];
  for (const segment of segments) {
    let lane = 0;
    for (;;) {
      const row = lanes[lane] ?? [];
      lanes[lane] = row;
      let free = true;
      for (let i = segment.startIndex; i < segment.startIndex + segment.span; i++) {
        if (row[i]) free = false;
      }
      if (free) {
        for (let i = segment.startIndex; i < segment.startIndex + segment.span; i++) row[i] = true;
        segment.lane = lane;
        break;
      }
      lane++;
    }
  }
  return segments;
};

/** A minute count rounded to the nearest step (15, 30…), kept within the day. */
export const snapMinutes = (minutes: number, step: number) =>
  Math.min(MINUTES_PER_DAY, Math.max(0, Math.round(minutes / step) * step));
