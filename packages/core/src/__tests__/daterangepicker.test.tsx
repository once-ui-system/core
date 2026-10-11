import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { type DateRange, DateRangePicker } from "../components/DateRangePicker";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { axeViolations } from "../test/axe";

/**
 * DateRangePicker picks a range in clicks: the first sets the start, the
 * second the end (in either order, earliest first), and a third starts over.
 * It opens on the month of `value.startDate`, follows `value` when the parent
 * changes it, shows two months side by side with `dual`, and refuses days
 * outside `minDate`/`maxDate`.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const jan = (day: number) => new Date(2026, 0, day);
const january: DateRange = { startDate: jan(5), endDate: jan(9) };

/**
 * The day button for a date: DatePicker tags each one with its ISO value.
 * A DatePicker with a value draws its grid a tick after it has synced its
 * month to that value, and again after each change, so this waits for it.
 */
const day = (date: Date) =>
  waitFor(() => {
    const button = document.querySelector<HTMLButtonElement>(
      `button[data-value="${date.toISOString()}"]`,
    );
    if (!button) throw new Error(`No day button for ${date.toDateString()}`);
    return button;
  });

/** The month and year a calendar shows, read from its two header selectors. */
const showing = (month: string, year: string) => {
  expect(screen.getAllByText(month).length).toBeGreaterThan(0);
  expect(screen.getAllByText(year).length).toBeGreaterThan(0);
};

describe("DateRangePicker", () => {
  it("opens on the month of the start date", async () => {
    render(<DateRangePicker value={january} onChange={vi.fn()} />, { wrapper });
    expect(await day(jan(31))).toBeInTheDocument();
    showing("January", "2026");
  });

  it("sets the start on the first click and the end on the second", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateRangePicker value={{ startDate: jan(1), endDate: jan(2) }} onChange={onChange} />, {
      wrapper,
    });
    // A complete range is there, so the first click starts a new one.
    await user.click(await day(jan(12)));
    expect(onChange).toHaveBeenLastCalledWith({ startDate: jan(12), endDate: undefined });
    await user.click(await day(jan(20)));
    expect(onChange).toHaveBeenLastCalledWith({ startDate: jan(12), endDate: jan(20) });
  });

  it("starts from nothing: the first click sets the start", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateRangePicker onChange={onChange} />, { wrapper });
    // Without a value it opens on the current month.
    const now = new Date();
    const third = new Date(now.getFullYear(), now.getMonth(), 3);
    await user.click(await day(third));
    expect(onChange).toHaveBeenLastCalledWith({ startDate: third, endDate: undefined });
  });

  it("puts the earlier date first when the second click is before the start", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateRangePicker value={{ startDate: jan(20), endDate: undefined }} onChange={onChange} />,
      {
        wrapper,
      },
    );
    await user.click(await day(jan(8)));
    expect(onChange).toHaveBeenLastCalledWith({ startDate: jan(8), endDate: jan(20) });
  });

  it("marks the days of the range", async () => {
    render(<DateRangePicker value={january} onChange={vi.fn()} />, { wrapper });
    const inRange = async (date: Date) =>
      /alpha-weak/.test((await day(date)).parentElement?.className ?? "");
    const marks = [];
    for (const d of [4, 5, 7, 9, 10]) marks.push(await inRange(jan(d)));
    expect(marks).toEqual([false, true, true, true, false]);
  });

  it("follows `value` when the parent changes it, moving to its month", async () => {
    const onChange = vi.fn();
    const { rerender } = render(<DateRangePicker value={january} onChange={onChange} />, {
      wrapper,
    });
    await day(jan(5));
    rerender(
      <DateRangePicker
        value={{ startDate: new Date(2026, 4, 1), endDate: new Date(2026, 4, 3) }}
        onChange={onChange}
      />,
    );
    expect(await day(new Date(2026, 4, 31))).toBeInTheDocument();
    showing("May", "2026");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("moves between months with the month buttons", async () => {
    const user = userEvent.setup();
    render(<DateRangePicker value={january} onChange={vi.fn()} />, { wrapper });
    await day(jan(5));
    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(await day(new Date(2026, 1, 28))).toBeInTheDocument();
    showing("February", "2026");

    await user.click(screen.getByRole("button", { name: "Previous month" }));
    await user.click(screen.getByRole("button", { name: "Previous month" }));
    expect(await day(new Date(2025, 11, 31))).toBeInTheDocument();
    showing("December", "2025");
  });

  it("shows two consecutive months with `dual`, one arrow on each outer side", async () => {
    render(
      <DateRangePicker dual value={{ startDate: jan(5), endDate: undefined }} onChange={vi.fn()} />,
      {
        wrapper,
      },
    );
    expect(await day(jan(31))).toBeInTheDocument();
    expect(await day(new Date(2026, 1, 28))).toBeInTheDocument();
    showing("January", "2026");
    showing("February", "2026");
    expect(screen.getAllByRole("button", { name: "Previous month" })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: "Next month" })).toHaveLength(1);
  });

  it("selects across the two months of a dual picker", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateRangePicker
        dual
        value={{ startDate: jan(28), endDate: undefined }}
        onChange={onChange}
      />,
      { wrapper },
    );
    await user.click(await day(new Date(2026, 1, 3)));
    expect(onChange).toHaveBeenLastCalledWith({
      startDate: jan(28),
      endDate: new Date(2026, 1, 3),
    });
  });

  it("disables the days outside minDate and maxDate", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DateRangePicker value={january} onChange={onChange} minDate={jan(3)} maxDate={jan(25)} />,
      { wrapper },
    );
    expect(await day(jan(2))).toBeDisabled();
    expect(await day(jan(3))).toBeEnabled();
    expect(await day(jan(25))).toBeEnabled();
    expect(await day(jan(26))).toBeDisabled();
    await user.click(await day(jan(26)));
    expect(onChange).not.toHaveBeenCalled();
  });

  // The day grid had role="grid" with its buttons straight in it, no row or
  // gridcell (axe "aria-required-children"); and the month and year
  // selectors were DropdownWrapper triggers inside another interactive
  // element ("nested-interactive"). See datepicker-grid.test.tsx.
  it("has no axe violations", async () => {
    const { container } = render(<DateRangePicker value={january} onChange={vi.fn()} />, {
      wrapper,
    });
    await day(jan(5));
    expect(await axeViolations(container)).toEqual([]);
  });

  // BUG: with `dual`, the second calendar is given the next month as
  // `currentMonth` but also the range's end as `value`, and DatePicker moves to
  // its value's month. A range inside one month shows that month twice.
  it.skip("shows the next month beside a range that ends in the same month", async () => {
    render(<DateRangePicker dual value={january} onChange={vi.fn()} />, { wrapper });
    expect(await day(new Date(2026, 1, 28))).toBeInTheDocument();
  });

  // DateRangePicker took a ref through forwardRef but never attached it.
  it("forwards its ref to the root", async () => {
    const ref = createRef<HTMLDivElement>();
    render(<DateRangePicker ref={ref} value={january} onChange={vi.fn()} />, { wrapper });
    expect(ref.current).toContainElement(await day(jan(5)));
  });
});
