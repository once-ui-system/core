import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import {
  Calendar,
  type CalendarEvent,
  layoutDay,
  layoutSpans,
  viewDays,
} from "../modules/calendar";
import { addMonths, isAllDayLike, startOfWeek, stepDate } from "../modules/calendar/dates";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const at = (day: number, hour: number, minute = 0) => new Date(2026, 10, day, hour, minute);

const events: CalendarEvent[] = [
  { id: "standup", title: "Standup", start: at(11, 9), end: at(11, 9, 30) },
  {
    id: "review",
    title: "Design review",
    start: at(11, 9, 15),
    end: at(11, 10, 30),
    tone: "accent",
  },
  { id: "lunch", title: "Lunch", start: at(11, 12), end: at(11, 13) },
  { id: "trip", title: "Offsite", start: at(16, 0), end: at(19, 0), allDay: true, tone: "success" },
];

describe("calendar dates", () => {
  it("starts a week on the given weekday", () => {
    // 11 Nov 2026 is a Wednesday.
    expect(startOfWeek(at(11, 15), 1).getDate()).toBe(9);
    expect(startOfWeek(at(11, 15), 0).getDate()).toBe(8);
  });

  it("covers whole weeks round a month", () => {
    const days = viewDays("month", at(11, 0), 1);
    expect(days.length % 7).toBe(0);
    expect(days[0].getDay()).toBe(1);
    expect(days[0] <= new Date(2026, 10, 1)).toBe(true);
    expect(days[days.length - 1] >= new Date(2026, 10, 30)).toBe(true);
  });

  it("steps by the view's period and clamps month ends", () => {
    expect(stepDate("week", at(11, 0), 1).getDate()).toBe(18);
    expect(stepDate("day", at(11, 0), -1).getDate()).toBe(10);
    expect(addMonths(new Date(2026, 0, 31), 1).getDate()).toBe(28);
  });

  it("puts overlapping events side by side and a later one back in the first lane", () => {
    const blocks = layoutDay(events, at(11, 0));
    const byId = Object.fromEntries(blocks.map((b) => [b.event.id, b]));
    expect(byId.standup.lanes).toBe(2);
    expect(byId.review.lanes).toBe(2);
    expect(byId.standup.lane).not.toBe(byId.review.lane);
    expect(byId.lunch).toMatchObject({ lane: 0, lanes: 1, top: 720, bottom: 780 });
    // The all-day event is not a timed block.
    expect(byId.trip).toBeUndefined();
  });

  it("gives a short event a minimum height", () => {
    const [block] = layoutDay([{ id: "a", start: at(11, 8), end: at(11, 8, 5) }], at(11, 0));
    expect(block.bottom - block.top).toBe(20);
  });

  it("clips an event across midnight to each day", () => {
    const late = { id: "late", start: at(11, 22), end: at(12, 2) };
    expect(layoutDay([late], at(11, 0))[0]).toMatchObject({
      top: 1320,
      bottom: 1440,
      continuesAfter: true,
    });
    expect(layoutDay([late], at(12, 0))[0]).toMatchObject({
      top: 0,
      bottom: 120,
      continuesBefore: true,
    });
  });

  it("lays bars across a week, longest first, without overlaps", () => {
    const week = viewDays("week", at(16, 0), 1);
    const segments = layoutSpans(
      [
        { id: "one", start: at(17, 10), end: at(17, 11) },
        { id: "trip", start: at(16, 0), end: at(19, 0), allDay: true },
        { id: "two", start: at(18, 0), end: at(19, 0), allDay: true },
      ],
      week,
    );
    const byId = Object.fromEntries(segments.map((s) => [s.event.id, s]));
    expect(byId.trip).toMatchObject({ startIndex: 0, span: 3, lane: 0 });
    expect(byId.one.lane).toBe(1);
    expect(byId.two.lane).toBe(1);
    expect(isAllDayLike({ id: "x", start: at(1, 0), end: at(2, 0) })).toBe(true);
  });
});

describe("Calendar", () => {
  it("draws a month with its events and no axe violations", async () => {
    const { container } = render(
      <Calendar events={events} defaultDate={at(11, 0)} now={at(11, 10)} weekStartsOn={1} />,
      { wrapper },
    );
    expect(screen.getByRole("heading", { name: "November 2026" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Standup,/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Offsite, .*All day/ })).toBeTruthy();
    expect(container.querySelector('[aria-current="date"]')?.getAttribute("aria-label")).toMatch(
      /November 11, 2026/,
    );
    await expectNoAxeViolations(container);
  });

  it("opens an event and picks a whole day", () => {
    const onEventSelect = vi.fn();
    const onSlotSelect = vi.fn();
    render(
      <Calendar
        events={events}
        defaultDate={at(11, 0)}
        onEventSelect={onEventSelect}
        onSlotSelect={onSlotSelect}
      />,
      { wrapper },
    );
    fireEvent.click(screen.getByRole("button", { name: /^Lunch,/ }));
    expect(onEventSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "lunch" }));

    fireEvent.click(screen.getByRole("gridcell", { name: /November 20, 2026/ }));
    expect(onSlotSelect).toHaveBeenCalledWith({ start: at(20, 0), end: at(21, 0), allDay: true });
  });

  it("moves through days with the arrow keys", () => {
    const onDateChange = vi.fn();
    render(<Calendar events={[]} defaultDate={at(11, 0)} onDateChange={onDateChange} />, {
      wrapper,
    });
    const cell = screen.getByRole("gridcell", { name: /November 11, 2026/ });
    expect(cell.tabIndex).toBe(0);
    fireEvent.keyDown(cell, { key: "ArrowDown" });
    expect(onDateChange).toHaveBeenLastCalledWith(at(18, 0));
    expect(document.activeElement?.getAttribute("aria-label")).toMatch(/November 18, 2026/);
  });

  it("collapses a crowded day into n more", () => {
    const many = Array.from({ length: 5 }, (_, i) => ({
      id: `e${i}`,
      title: `Call ${i}`,
      start: at(11, 9 + i),
      end: at(11, 9 + i, 30),
    }));
    render(<Calendar events={many} defaultDate={at(11, 0)} maxEventsPerDay={3} />, { wrapper });
    expect(screen.getByRole("button", { name: "2 more" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "2 more" }));
    expect(screen.getByRole("heading", { name: /Wednesday, November 11, 2026/ })).toBeTruthy();
  });

  it("switches views and steps through weeks", () => {
    render(<Calendar events={events} defaultDate={at(11, 0)} weekStartsOn={1} />, { wrapper });
    fireEvent.click(screen.getByRole("tab", { name: "Week" }));
    expect(screen.getByRole("heading").textContent).toMatch(/Nov 9 – Nov 15, 2026/);
    const wednesday = screen.getByRole("group", { name: /Wednesday, November 11/ });
    expect(within(wednesday).getByRole("button", { name: /^Design review,/ })).toBeTruthy();
    // The all-day row carries the offsite in the next week.
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("All day")).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Offsite,/ })).toBeTruthy();
  });

  it("draws the now line on today in the week", () => {
    const { container } = render(
      <Calendar events={[]} view="week" defaultDate={at(11, 0)} now={at(11, 12)} />,
      { wrapper },
    );
    const line = container.querySelector<HTMLElement>('[class*="nowLine"]');
    expect(line?.style.top).toBe("50%");
  });

  it("picks empty time with a click for the default duration", () => {
    const onSlotSelect = vi.fn();
    render(
      <Calendar
        events={[]}
        view="day"
        defaultDate={at(11, 0)}
        onSlotSelect={onSlotSelect}
        snapMinutes={30}
      />,
      { wrapper },
    );
    const column = screen.getByRole("group", { name: /November 11/ });
    column.getBoundingClientRect = () =>
      ({ top: 0, left: 0, height: 2400, width: 200, right: 200, bottom: 2400 }) as DOMRect;
    // 1000px of 2400 is 10:00.
    fireEvent.pointerDown(column, { button: 0, clientX: 10, clientY: 1000, pointerId: 1 });
    fireEvent.pointerUp(column, { clientX: 10, clientY: 1000, pointerId: 1 });
    expect(onSlotSelect).toHaveBeenCalledWith({
      start: at(11, 10),
      end: at(11, 11),
      allDay: false,
    });
  });

  it("drags an event to a new time", () => {
    const onEventChange = vi.fn();
    const onEventSelect = vi.fn();
    render(
      <Calendar
        events={events}
        view="day"
        defaultDate={at(11, 0)}
        onEventChange={onEventChange}
        onEventSelect={onEventSelect}
      />,
      { wrapper },
    );
    const column = screen.getByRole("group", { name: /November 11/ });
    column.getBoundingClientRect = () =>
      ({ top: 0, left: 0, height: 2400, width: 200, right: 200, bottom: 2400 }) as DOMRect;
    const lunch = screen.getByRole("button", { name: /^Lunch,/ });
    // Grab at 12:00 (1200px), drop at 14:00 (1400px).
    fireEvent.pointerDown(lunch, { button: 0, clientX: 10, clientY: 1200, pointerId: 1 });
    fireEvent.pointerMove(lunch, { clientX: 10, clientY: 1400, pointerId: 1 });
    fireEvent.pointerUp(lunch, { clientX: 10, clientY: 1400, pointerId: 1 });
    fireEvent.click(lunch);
    expect(onEventChange).toHaveBeenCalledWith(
      expect.objectContaining({ start: at(11, 14), end: at(11, 15) }),
    );
    expect(onEventSelect).not.toHaveBeenCalled();
  });

  it("names days and times in the locale", () => {
    render(<Calendar events={events} defaultDate={at(11, 0)} locale="hu-HU" view="day" />, {
      wrapper,
    });
    expect(screen.getByRole("heading").textContent).toMatch(/2026\. november 11\./);
    expect(screen.getByRole("button", { name: /^Lunch, .*12:00/ })).toBeTruthy();
  });
});
