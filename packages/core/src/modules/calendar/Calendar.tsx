"use client";

import classNames from "clsx";
import {
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Button } from "../../components/Button.js";
import { IconButton } from "../../components/IconButton.js";
import { Row } from "../../components/Row.js";
import { SegmentedControl } from "../../components/SegmentedControl.js";
import { Text } from "../../components/Text.js";
import { useControllableState } from "../../internal/useControllableState.js";
import type { Tone } from "../../types.js";
import { fieldLocale, getCalendarNames } from "../../utils/calendarLocale.js";
import styles from "./Calendar.module.css";
import {
  addDays,
  addMinutes,
  type CalendarView,
  isAllDayLike,
  isSameDay,
  layoutDay,
  layoutSpans,
  MINUTES_PER_DAY,
  minutesInDay,
  snapMinutes,
  startOfDay,
  stepDate,
  type TimedBlock,
  viewDays,
} from "./dates.js";

export interface CalendarEvent {
  /** Unique among the calendar's events. */
  id: string;
  title: string;
  start: Date;
  /** Exclusive: an event from 9:00 to 10:00 ends at 10:00. An all-day event on 12 Nov ends at midnight on 13 Nov. */
  end: Date;
  /** Drawn in the all-day row and as a solid bar in the month. An event of 24 hours or more is drawn there too. */
  allDay?: boolean;
  /** The event's palette. Defaults to `brand`. */
  tone?: Tone;
  /** A second line in the week and day views, such as a room or a client. */
  description?: string;
  /** Whether people may drag it when `onEventChange` is given. Defaults to true. */
  editable?: boolean;
}

/** A stretch of time picked on the calendar: a drag or click on empty time, or a day in the month. */
export interface CalendarSlot {
  start: Date;
  end: Date;
  allDay: boolean;
}

export interface CalendarEventChange<E extends CalendarEvent = CalendarEvent> {
  event: E;
  start: Date;
  end: Date;
}

export interface CalendarLabels {
  today: string;
  previous: string;
  next: string;
  month: string;
  week: string;
  day: string;
  allDay: string;
  /** The link under a month day whose events do not all fit. */
  more: (count: number) => string;
  /** The views' switch, for screen readers. */
  view: string;
}

const ENGLISH_LABELS: CalendarLabels = {
  today: "Today",
  previous: "Previous",
  next: "Next",
  month: "Month",
  week: "Week",
  day: "Day",
  allDay: "All day",
  more: (count) => `${count} more`,
  view: "View",
};

export interface CalendarProps<E extends CalendarEvent = CalendarEvent> {
  events: E[];
  /** The view shown, controlled. Leave it out to let the calendar keep its own, from `defaultView`. */
  view?: CalendarView;
  /** Defaults to `month`. */
  defaultView?: CalendarView;
  onViewChange?: (view: CalendarView) => void;
  /** The views on the switch, in its order. One view hides the switch. Defaults to month, week and day. */
  views?: CalendarView[];
  /** A day inside the period shown, controlled. */
  date?: Date;
  /** Defaults to today. */
  defaultDate?: Date;
  onDateChange?: (date: Date) => void;
  /** A BCP 47 tag for names and times. Defaults to English. */
  locale?: string;
  /** 0 Sunday to 6 Saturday. Defaults to the locale's first day of the week. */
  weekStartsOn?: number;
  /** The first hour the week and day views draw. Defaults to 0. */
  dayStartHour?: number;
  /** The hour the week and day views end at, up to 24. Defaults to 24. */
  dayEndHour?: number;
  /** The hour the week and day views scroll to when they open. Defaults to 8. */
  scrollToHour?: number;
  /** The step a drag snaps to, in minutes. Defaults to 15. */
  snapMinutes?: number;
  /** The length a click on empty time picks, in minutes. Defaults to 60. */
  defaultDuration?: number;
  /** How many event rows a month day shows before "n more". Defaults to 3. */
  maxEventsPerDay?: number;
  /** The scrolling height of the week and day views. Defaults to "36rem". */
  height?: string;
  /** Called when an event is pressed, by pointer or keyboard. */
  onEventSelect?: (event: E) => void;
  /**
   * Makes empty time pickable: a drag over the hours, a click (for
   * `defaultDuration`), or a month day. The calendar draws the stretch while
   * it is dragged; adding the event is the app's.
   */
  onSlotSelect?: (slot: CalendarSlot) => void;
  /**
   * Lets people drag an event to another time or day and drag its bottom
   * edge to change its end, in the week and day views. The calendar shows the
   * new place while dragging and leaves the event where it was until the
   * app passes the changed event back.
   */
  onEventChange?: (change: CalendarEventChange<E>) => void;
  /** What an event shows instead of its title (and time). */
  renderEvent?: (event: E, context: { view: CalendarView; timeLabel: string }) => ReactNode;
  /** Hides the header with the arrows, the title and the views. Defaults to true. */
  toolbar?: boolean;
  /** Things at the end of the header, such as a "New event" button. */
  toolbarEnd?: ReactNode;
  labels?: Partial<CalendarLabels>;
  /** The time the now line and today follow. Defaults to the clock, read after the page loads. */
  now?: Date;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}

const toneVars = (tone: Tone = "brand") =>
  ({
    "--event-fill": `var(--${tone}-alpha-weak)`,
    "--event-fill-hover": `var(--${tone}-alpha-medium)`,
    "--event-solid": `var(--${tone}-solid-strong)`,
    "--event-on": `var(--${tone}-on-background-strong)`,
    "--event-on-solid": `var(--${tone}-on-solid-strong)`,
  }) as CSSProperties;

type Drag<E> =
  | { kind: "create"; dayIndex: number; anchor: number; current: number }
  | {
      kind: "move" | "resize";
      event: E;
      startX: number;
      startY: number;
      /** Minutes from the event's start to where it was grabbed. */
      grab: number;
      duration: number;
      dayIndex: number;
      top: number;
      bottom: number;
      moved: boolean;
    };

/**
 * A scheduling calendar: a month of days, or a week or a day of hours, with
 * events laid out the way calendar apps lay them out (overlapping events side
 * by side, long ones as bars). Picking empty time, dragging events and
 * opening them call back to the app, which keeps the events.
 */
export function Calendar<E extends CalendarEvent = CalendarEvent>({
  events,
  view: viewProp,
  defaultView = "month",
  onViewChange,
  views = ["month", "week", "day"],
  date: dateProp,
  defaultDate,
  onDateChange,
  locale,
  weekStartsOn: weekStartsOnProp,
  dayStartHour = 0,
  dayEndHour = 24,
  scrollToHour = 8,
  snapMinutes: snap = 15,
  defaultDuration = 60,
  maxEventsPerDay = 3,
  height = "36rem",
  onEventSelect,
  onSlotSelect,
  onEventChange,
  renderEvent,
  toolbar = true,
  toolbarEnd,
  labels: labelsProp,
  now: nowProp,
  className,
  style,
  "aria-label": ariaLabel,
}: CalendarProps<E>) {
  const labels = { ...ENGLISH_LABELS, ...labelsProp };
  const names = getCalendarNames(locale);
  const loc = fieldLocale(locale);
  const weekStartsOn = weekStartsOnProp ?? names.firstDayOfWeek;

  const [view, setView] = useControllableState<CalendarView>({
    value: viewProp,
    defaultValue: defaultView,
    onChange: onViewChange,
  });
  const [initialDate] = useState(() => startOfDay(defaultDate ?? new Date()));
  const [date, setDate] = useControllableState<Date>({
    value: dateProp,
    defaultValue: initialDate,
    onChange: onDateChange,
  });

  // The clock is read after the page loads, so the server and the first
  // render agree; it moves on every minute.
  const [clock, setClock] = useState<Date | null>(null);
  useEffect(() => {
    if (nowProp) return;
    setClock(new Date());
    const timer = window.setInterval(() => setClock(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, [nowProp]);
  const now = nowProp ?? clock;

  const days = useMemo(() => viewDays(view, date, weekStartsOn), [view, date, weekStartsOn]);

  const formats = useMemo(() => {
    // Node and browsers ship different ICU data, which differ in the spaces
    // they put in times and ranges (U+202F, U+2009). Plain spaces keep the
    // server's HTML and the first client render the same.
    const make = (options: Intl.DateTimeFormatOptions) => {
      const format = new Intl.DateTimeFormat(loc, options);
      return { format: (date: Date) => format.format(date).replace(/[\u00a0\u2009\u202f]/g, " ") };
    };
    return {
      time: make({ hour: "numeric", minute: "2-digit" }),
      // "2 PM" on the hour, "2:30 PM" otherwise: the month's lines keep room for the title.
      shortTime: (() => {
        const hour = make({ hour: "numeric" });
        const minute = make({ hour: "numeric", minute: "2-digit" });
        return { format: (date: Date) => (date.getMinutes() ? minute : hour).format(date) };
      })(),
      hour: make({ hour: "numeric" }),
      weekdayShort: make({ weekday: "short" }),
      dayLong: make({ weekday: "long", day: "numeric", month: "long", year: "numeric" }),
      dayShort: make({ day: "numeric", month: "short", year: "numeric" }),
      dayMonth: make({ day: "numeric", month: "short" }),
    };
  }, [loc]);

  const timeRange = (event: CalendarEvent) =>
    isAllDayLike(event)
      ? labels.allDay
      : `${formats.time.format(event.start)} – ${formats.time.format(event.end)}`;

  const eventLabel = (event: CalendarEvent) =>
    `${event.title}, ${formats.dayLong.format(event.start)}, ${timeRange(event)}`;

  const title = (() => {
    if (view === "month") return names.monthYear(date.getMonth(), date.getFullYear());
    if (view === "day") return formats.dayLong.format(date);
    const first = days[0];
    const last = days[days.length - 1];
    const sameYear = first.getFullYear() === last.getFullYear();
    return `${(sameYear ? formats.dayMonth : formats.dayShort).format(first)} – ${formats.dayShort.format(last)}`;
  })();

  const openDay = (day: Date) => {
    setDate(startOfDay(day));
    if (views.includes("day")) setView("day");
  };

  const eventContent = (event: E, timeLabel: string, showTime: boolean) =>
    renderEvent ? (
      renderEvent(event, { view, timeLabel })
    ) : (
      <>
        {showTime && <span className={styles.eventTime}>{timeLabel}</span>}
        <span className={styles.eventText}>{event.title}</span>
      </>
    );

  return (
    <section
      className={classNames(styles.calendar, className)}
      style={style}
      aria-label={ariaLabel ?? title}
    >
      {toolbar && (
        <Row vertical="center" gap="8" paddingBottom="12" wrap>
          <Row gap="4" vertical="center">
            <IconButton
              icon="chevronLeft"
              variant="tertiary"
              size="m"
              tooltip={labels.previous}
              aria-label={labels.previous}
              onClick={() => setDate(stepDate(view, date, -1))}
            />
            <Button
              variant="secondary"
              size="s"
              label={labels.today}
              onClick={() => setDate(startOfDay(now ?? new Date()))}
            />
            <IconButton
              icon="chevronRight"
              variant="tertiary"
              size="m"
              tooltip={labels.next}
              aria-label={labels.next}
              onClick={() => setDate(stepDate(view, date, 1))}
            />
          </Row>
          <div style={{ flex: "1 1 12rem", minWidth: 0 }}>
            <Text as="h2" textVariant="heading-strong-m" aria-live="polite">
              {title}
            </Text>
          </div>
          {views.length > 1 && (
            <SegmentedControl
              aria-label={labels.view}
              compact
              fillWidth={false}
              buttons={views.map((v) => ({ value: v, label: labels[v] }))}
              value={view}
              onValueChange={(value) => setView(value as CalendarView)}
            />
          )}
          {toolbarEnd}
        </Row>
      )}
      {view === "month" ? (
        <MonthView
          days={days}
          date={date}
          setDate={setDate}
          events={events}
          now={now}
          maxEventsPerDay={maxEventsPerDay}
          formats={formats}
          labels={labels}
          openDay={openDay}
          onSlotSelect={onSlotSelect}
          onEventSelect={onEventSelect}
          eventLabel={eventLabel}
          eventContent={eventContent}
          customRender={Boolean(renderEvent)}
        />
      ) : (
        <TimeView
          days={days}
          events={events}
          now={now}
          view={view}
          dayStartHour={Math.max(0, Math.min(23, dayStartHour))}
          dayEndHour={Math.max(dayStartHour + 1, Math.min(24, dayEndHour))}
          scrollToHour={scrollToHour}
          snap={snap}
          defaultDuration={defaultDuration}
          height={height}
          formats={formats}
          labels={labels}
          openDay={view === "week" && views.includes("day") ? openDay : undefined}
          onSlotSelect={onSlotSelect}
          onEventSelect={onEventSelect}
          onEventChange={onEventChange}
          eventLabel={eventLabel}
          eventContent={eventContent}
        />
      )}
    </section>
  );
}

type Formatter = { format: (date: Date) => string };

interface Formats {
  time: Formatter;
  shortTime: Formatter;
  hour: Formatter;
  weekdayShort: Formatter;
  dayLong: Formatter;
  dayShort: Formatter;
  dayMonth: Formatter;
}

interface SharedViewProps<E extends CalendarEvent> {
  days: Date[];
  events: E[];
  now: Date | null;
  formats: Formats;
  labels: CalendarLabels;
  onSlotSelect?: (slot: CalendarSlot) => void;
  onEventSelect?: (event: E) => void;
  eventLabel: (event: E) => string;
  eventContent: (event: E, timeLabel: string, showTime: boolean) => ReactNode;
}

function MonthView<E extends CalendarEvent>({
  days,
  date,
  setDate,
  events,
  now,
  maxEventsPerDay,
  formats,
  labels,
  openDay,
  onSlotSelect,
  onEventSelect,
  eventLabel,
  eventContent,
  customRender,
}: SharedViewProps<E> & {
  date: Date;
  setDate: (date: Date) => void;
  maxEventsPerDay: number;
  openDay: (day: Date) => void;
  /** A custom renderer draws its own lead, so the dot is left out. */
  customRender: boolean;
}) {
  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
  const month = date.getMonth();
  const focusDay = days.find((day) => isSameDay(day, date)) ?? days[0];
  const cellRefs = useRef(new Map<number, HTMLDivElement>());
  const focusAfterMove = useRef(false);

  useEffect(() => {
    if (!focusAfterMove.current) return;
    focusAfterMove.current = false;
    cellRefs.current.get(startOfDay(date).getTime())?.focus();
  });

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>, day: Date) => {
    const moves: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    let next: Date | null = null;
    if (event.key in moves) next = addDays(day, moves[event.key]);
    else if (event.key === "Home")
      next = addDays(day, -(days.findIndex((d) => isSameDay(d, day)) % 7));
    else if (event.key === "End")
      next = addDays(day, 6 - (days.findIndex((d) => isSameDay(d, day)) % 7));
    else if (event.key === "PageUp")
      next = new Date(day.getFullYear(), day.getMonth() - 1, day.getDate());
    else if (event.key === "PageDown")
      next = new Date(day.getFullYear(), day.getMonth() + 1, day.getDate());
    else if ((event.key === "Enter" || event.key === " ") && event.target === event.currentTarget) {
      event.preventDefault();
      if (onSlotSelect) onSlotSelect({ start: day, end: addDays(day, 1), allDay: true });
      else openDay(day);
      return;
    }
    if (!next) return;
    event.preventDefault();
    focusAfterMove.current = true;
    setDate(next);
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: the ARIA grid pattern; a table cannot hold bars that span its cells
    <div className={styles.monthGrid} role="grid" aria-readonly={!onSlotSelect}>
      {/* biome-ignore lint/a11y/useSemanticElements lint/a11y/useFocusableInteractive: a row of the ARIA grid; its cells take focus */}
      <div role="row" style={{ display: "contents" }}>
        {weeks[0]?.map((day) => (
          // biome-ignore lint/a11y/useSemanticElements lint/a11y/useFocusableInteractive: a header of the ARIA grid
          <div key={day.getDay()} role="columnheader" className={styles.weekdayHeader}>
            <Text textVariant="label-default-s">{formats.weekdayShort.format(day)}</Text>
          </div>
        ))}
      </div>
      {weeks.map((week) => {
        const segments = layoutSpans(events, week);
        const visible = segments.filter((segment) => segment.lane < maxEventsPerDay);
        const hidden = week.map(
          (_, index) =>
            segments.filter(
              (segment) =>
                segment.lane >= maxEventsPerDay &&
                index >= segment.startIndex &&
                index < segment.startIndex + segment.span,
            ).length,
        );
        const shownLanes = Math.min(
          maxEventsPerDay,
          segments.reduce((max, segment) => Math.max(max, segment.lane + 1), 0),
        );
        const weekStyle = {
          "--calendar-lanes": shownLanes + (hidden.some(Boolean) ? 1 : 0),
        } as CSSProperties;
        return (
          // biome-ignore lint/a11y/useSemanticElements lint/a11y/useFocusableInteractive: a row of the ARIA grid; its cells take focus
          <div key={week[0].getTime()} role="row" className={styles.monthWeek} style={weekStyle}>
            {week.map((day, index) => {
              const today = now ? isSameDay(day, now) : false;
              const focused = isSameDay(day, focusDay);
              // Bars live in the cell they start in and reach across the
              // following cells, so every event is inside a gridcell.
              const starting = visible.filter((segment) => segment.startIndex === index);
              return (
                // biome-ignore lint/a11y/useSemanticElements: a cell of the ARIA grid, with a roving tabindex
                <div
                  key={day.getTime()}
                  ref={(node) => {
                    if (node) cellRefs.current.set(day.getTime(), node);
                    else cellRefs.current.delete(day.getTime());
                  }}
                  role="gridcell"
                  aria-label={formats.dayLong.format(day)}
                  aria-current={today ? "date" : undefined}
                  aria-selected={focused}
                  tabIndex={focused ? 0 : -1}
                  className={styles.monthDay}
                  data-outside={day.getMonth() !== month}
                  data-selectable={Boolean(onSlotSelect)}
                  onKeyDown={(event) => onKeyDown(event, day)}
                  onClick={(event) => {
                    if (event.target !== event.currentTarget) return;
                    setDate(day);
                    onSlotSelect?.({ start: day, end: addDays(day, 1), allDay: true });
                  }}
                >
                  <button
                    type="button"
                    tabIndex={-1}
                    className={styles.dayNumber}
                    data-today={today}
                    aria-hidden
                    onClick={() => openDay(day)}
                  >
                    <Text textVariant="label-default-s">{day.getDate()}</Text>
                  </button>
                  {starting.map((segment) => {
                    const { event } = segment;
                    const bar = isAllDayLike(event) || segment.span > 1;
                    const barStyle = {
                      "--calendar-lane": segment.lane,
                      "--calendar-span": segment.span,
                    } as CSSProperties;
                    return (
                      <div key={event.id} className={styles.monthBar} style={barStyle}>
                        <button
                          type="button"
                          className={styles.event}
                          style={toneVars(event.tone)}
                          data-solid={bar}
                          data-continues-before={segment.continuesBefore}
                          data-continues-after={segment.continuesAfter}
                          aria-label={eventLabel(event)}
                          onClick={() => onEventSelect?.(event)}
                        >
                          {!bar && !customRender && <span className={styles.dot} />}
                          <Text textVariant="label-default-s" className={styles.eventLine}>
                            {eventContent(event, bar ? "" : formatStart(formats, event), !bar)}
                          </Text>
                        </button>
                      </div>
                    );
                  })}
                  {hidden[index] > 0 && (
                    <button
                      type="button"
                      className={styles.more}
                      style={{ "--calendar-lane": maxEventsPerDay } as CSSProperties}
                      onClick={() => openDay(day)}
                    >
                      <Text textVariant="label-default-s">{labels.more(hidden[index])}</Text>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

const formatStart = (formats: Formats, event: CalendarEvent) =>
  formats.shortTime.format(event.start);

function TimeView<E extends CalendarEvent>({
  days,
  events,
  now,
  view,
  dayStartHour,
  dayEndHour,
  scrollToHour,
  snap,
  defaultDuration,
  height,
  formats,
  labels,
  openDay,
  onSlotSelect,
  onEventSelect,
  onEventChange,
  eventLabel,
  eventContent,
}: SharedViewProps<E> & {
  view: CalendarView;
  dayStartHour: number;
  dayEndHour: number;
  scrollToHour: number;
  snap: number;
  defaultDuration: number;
  height: string;
  openDay?: (day: Date) => void;
  onEventChange?: (change: CalendarEventChange<E>) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const columnRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [drag, setDrag] = useState<Drag<E> | null>(null);
  const suppressClick = useRef(false);
  const rangeStart = dayStartHour * 60;
  const rangeEnd = dayEndHour * 60;
  const hours = dayEndHour - dayStartHour;

  // Open at the working day rather than midnight.
  // biome-ignore lint/correctness/useExhaustiveDependencies: only when the view or its first day changes
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const hourHeight = scroller.scrollHeight / hours;
    scroller.scrollTop = Math.max(0, (scrollToHour - dayStartHour) * hourHeight);
  }, [view, days[0]?.getTime()]);

  const allDayEvents = events.filter(isAllDayLike);
  const allDaySegments = layoutSpans(allDayEvents, days);
  const allDayLanes = allDaySegments.reduce((max, s) => Math.max(max, s.lane + 1), 0);
  const blocksByDay = days.map((day) => layoutDay(events, day));

  const pointAt = (clientX: number, clientY: number) => {
    let dayIndex = 0;
    columnRefs.current.forEach((column, index) => {
      if (!column) return;
      const rect = column.getBoundingClientRect();
      if (clientX >= rect.left) dayIndex = index;
    });
    const column = columnRefs.current[dayIndex];
    const rect = column?.getBoundingClientRect();
    const ratio = rect && rect.height > 0 ? (clientY - rect.top) / rect.height : 0;
    return { dayIndex, minutes: rangeStart + ratio * (rangeEnd - rangeStart) };
  };

  const clamp = (minutes: number) => Math.max(rangeStart, Math.min(rangeEnd, minutes));

  const onColumnPointerDown = (event: PointerEvent<HTMLDivElement>, dayIndex: number) => {
    if (!onSlotSelect || event.button !== 0 || event.target !== event.currentTarget) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const minutes = clamp(snapDown(pointAt(event.clientX, event.clientY).minutes, snap));
    setDrag({ kind: "create", dayIndex, anchor: minutes, current: minutes });
  };

  const onEventPointerDown = (
    event: PointerEvent<HTMLElement>,
    block: TimedBlock<E>,
    dayIndex: number,
    kind: "move" | "resize",
  ) => {
    if (!onEventChange || block.event.editable === false || event.button !== 0) return;
    event.stopPropagation();
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
    const point = pointAt(event.clientX, event.clientY);
    const start = minutesInDay(block.event.start, days[dayIndex]);
    const duration = Math.round((block.event.end.getTime() - block.event.start.getTime()) / 60_000);
    setDrag({
      kind,
      event: block.event,
      startX: event.clientX,
      startY: event.clientY,
      grab: point.minutes - start,
      duration,
      dayIndex,
      top: start,
      bottom: start + duration,
      moved: false,
    });
  };

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!drag) return;
    const point = pointAt(event.clientX, event.clientY);
    if (drag.kind === "create") {
      setDrag({ ...drag, current: clamp(snapMinutes(point.minutes, snap)) });
      return;
    }
    const moved =
      drag.moved || Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) > 4;
    if (!moved) return;
    if (drag.kind === "move") {
      const top = snapMinutes(point.minutes - drag.grab, snap);
      const clamped = Math.max(
        0,
        Math.min(MINUTES_PER_DAY - Math.min(drag.duration, MINUTES_PER_DAY), top),
      );
      setDrag({
        ...drag,
        moved,
        dayIndex: point.dayIndex,
        top: clamped,
        bottom: clamped + drag.duration,
      });
    } else {
      const bottom = Math.max(drag.top + snap, snapMinutes(point.minutes, snap));
      setDrag({ ...drag, moved, bottom: Math.min(MINUTES_PER_DAY, bottom) });
    }
  };

  const onPointerUp = () => {
    if (!drag) return;
    setDrag(null);
    if (drag.kind === "create") {
      const day = days[drag.dayIndex];
      const from = Math.min(drag.anchor, drag.current);
      let to = Math.max(drag.anchor, drag.current);
      if (to === from) to = Math.min(MINUTES_PER_DAY, from + defaultDuration);
      onSlotSelect?.({ start: addMinutes(day, from), end: addMinutes(day, to), allDay: false });
      return;
    }
    if (!drag.moved) return;
    suppressClick.current = true;
    const day = days[drag.dayIndex];
    onEventChange?.({
      event: drag.event,
      start: addMinutes(day, drag.top),
      end: addMinutes(day, drag.bottom),
    });
  };

  const minutesToPercent = (minutes: number) =>
    ((minutes - rangeStart) / (rangeEnd - rangeStart)) * 100;

  const ghost = (() => {
    if (!drag) return null;
    if (drag.kind === "create") {
      const from = Math.min(drag.anchor, drag.current);
      const to = Math.max(drag.anchor, drag.current, from + snap);
      return { dayIndex: drag.dayIndex, from, to, title: "" };
    }
    if (!drag.moved) return null;
    return { dayIndex: drag.dayIndex, from: drag.top, to: drag.bottom, title: drag.event.title };
  })();

  const hourList = Array.from({ length: hours }, (_, i) => dayStartHour + i);
  const gridStyle = {
    "--calendar-days": days.length,
    "--calendar-hours": hours,
  } as CSSProperties;

  return (
    <div style={gridStyle}>
      <div className={styles.timeHeader}>
        <div />
        {days.map((day) => {
          const today = now ? isSameDay(day, now) : false;
          const content = (
            <>
              <Text textVariant="label-default-s">{formats.weekdayShort.format(day)}</Text>
              <Text
                textVariant="heading-strong-s"
                className={styles.todayNumber}
                data-today={today}
                aria-current={today ? "date" : undefined}
              >
                {day.getDate()}
              </Text>
            </>
          );
          return openDay ? (
            <button
              key={day.getTime()}
              type="button"
              className={styles.columnHeader}
              aria-label={formats.dayLong.format(day)}
              onClick={() => openDay(day)}
            >
              {content}
            </button>
          ) : (
            <div key={day.getTime()} className={styles.columnHeader}>
              {content}
            </div>
          );
        })}
      </div>
      {allDaySegments.length > 0 && (
        <div className={styles.allDayRow}>
          <Text
            textVariant="label-default-xs"
            className={styles.allDayLabel}
            style={{ gridColumn: 1 }}
          >
            {labels.allDay}
          </Text>
          {allDaySegments.map((segment) => (
            <div
              key={`${segment.event.id}-${segment.startIndex}`}
              className={styles.spanBar}
              style={{
                gridColumn: `${segment.startIndex + 2} / span ${segment.span}`,
                gridRow: segment.lane + 1,
              }}
            >
              <button
                type="button"
                className={styles.event}
                style={toneVars(segment.event.tone)}
                data-solid
                data-continues-before={segment.continuesBefore}
                data-continues-after={segment.continuesAfter}
                aria-label={eventLabel(segment.event)}
                onClick={() => onEventSelect?.(segment.event)}
              >
                <Text textVariant="label-default-s" className={styles.eventText}>
                  {eventContent(segment.event, labels.allDay, false)}
                </Text>
              </button>
            </div>
          ))}
          {allDayLanes === 0 && <div />}
        </div>
      )}
      <div ref={scrollRef} className={styles.scroll} style={{ height }}>
        <div className={styles.timeGrid}>
          <div className={styles.hours} aria-hidden>
            {hourList.map((hour, i) =>
              i === 0 ? null : (
                <Text
                  key={hour}
                  textVariant="label-default-xs"
                  className={styles.hourLabel}
                  style={{ top: `${(i / hours) * 100}%` }}
                >
                  {formats.hour.format(new Date(2000, 0, 1, hour))}
                </Text>
              ),
            )}
          </div>
          {days.map((day, dayIndex) => {
            const today = now ? isSameDay(day, now) : false;
            const nowMinutes = now && today ? minutesInDay(now, day) : null;
            return (
              // biome-ignore lint/a11y/useSemanticElements: a day's hours, named for screen readers; not a form group
              <div
                key={day.getTime()}
                ref={(node) => {
                  columnRefs.current[dayIndex] = node;
                }}
                role="group"
                aria-label={formats.dayLong.format(day)}
                className={styles.dayColumn}
                data-today={view === "week" && today}
                data-selectable={Boolean(onSlotSelect)}
                onPointerDown={(event) => onColumnPointerDown(event, dayIndex)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={() => setDrag(null)}
              >
                {blocksByDay[dayIndex]
                  .filter((block) => block.bottom > rangeStart && block.top < rangeEnd)
                  .map((block) => {
                    const top = Math.max(block.top, rangeStart);
                    const bottom = Math.min(block.bottom, rangeEnd);
                    const dragging =
                      drag &&
                      drag.kind !== "create" &&
                      drag.moved &&
                      drag.event.id === block.event.id;
                    const short = bottom - top < 45;
                    const editable = Boolean(onEventChange) && block.event.editable !== false;
                    return (
                      <div
                        key={block.event.id}
                        className={styles.timedEvent}
                        style={{
                          top: `${minutesToPercent(top)}%`,
                          height: `${minutesToPercent(bottom) - minutesToPercent(top)}%`,
                          // Overlapping events cascade like a calendar app's: each
                          // reaches past its lane, the later one drawn over it, so
                          // titles stay readable in a crowded hour.
                          left: `${(block.lane / block.lanes) * 100}%`,
                          width: `${
                            block.lane === block.lanes - 1
                              ? 100 / block.lanes
                              : Math.min(
                                  (100 / block.lanes) * 1.7,
                                  100 - (block.lane / block.lanes) * 100,
                                )
                          }%`,
                          zIndex: block.lane + 1,
                        }}
                      >
                        <button
                          type="button"
                          className={styles.event}
                          style={toneVars(block.event.tone)}
                          data-dragging={Boolean(dragging)}
                          aria-label={eventLabel(block.event)}
                          onPointerDown={(event) =>
                            onEventPointerDown(event, block, dayIndex, "move")
                          }
                          onPointerMove={onPointerMove}
                          onPointerUp={onPointerUp}
                          onPointerCancel={() => setDrag(null)}
                          onClick={() => {
                            if (suppressClick.current) {
                              suppressClick.current = false;
                              return;
                            }
                            onEventSelect?.(block.event);
                          }}
                        >
                          <Text
                            textVariant="label-strong-s"
                            className={styles.eventText}
                            style={short ? { whiteSpace: "nowrap" } : undefined}
                          >
                            {eventContent(
                              block.event,
                              `${formats.time.format(block.event.start)}`,
                              false,
                            )}
                          </Text>
                          {!short && (
                            <Text textVariant="label-default-xs" className={styles.eventTime}>
                              {`${formats.time.format(block.event.start)} – ${formats.time.format(block.event.end)}`}
                              {block.event.description ? ` · ${block.event.description}` : ""}
                            </Text>
                          )}
                        </button>
                        {editable && !block.continuesAfter && (
                          <div
                            className={styles.resize}
                            aria-hidden
                            onPointerDown={(event) =>
                              onEventPointerDown(event, block, dayIndex, "resize")
                            }
                            onPointerMove={onPointerMove}
                            onPointerUp={onPointerUp}
                          />
                        )}
                      </div>
                    );
                  })}
                {ghost && ghost.dayIndex === dayIndex && (
                  <div
                    className={styles.ghost}
                    style={{
                      top: `${minutesToPercent(Math.max(ghost.from, rangeStart))}%`,
                      height: `${minutesToPercent(Math.min(ghost.to, rangeEnd)) - minutesToPercent(Math.max(ghost.from, rangeStart))}%`,
                    }}
                  >
                    <Text textVariant="label-default-xs">
                      {ghost.title ? `${ghost.title} · ` : ""}
                      {formats.time.format(addMinutes(day, ghost.from))} –{" "}
                      {formats.time.format(addMinutes(day, ghost.to))}
                    </Text>
                  </div>
                )}
                {nowMinutes !== null && nowMinutes >= rangeStart && nowMinutes <= rangeEnd && (
                  <div
                    className={styles.nowLine}
                    style={{ top: `${minutesToPercent(nowMinutes)}%` }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const snapDown = (minutes: number, step: number) => Math.floor(minutes / step) * step;
