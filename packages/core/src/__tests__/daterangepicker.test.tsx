import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { DatePicker, type DateRange } from "../components/DatePicker";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { axeViolations, expectNoAxeViolations } from "../test/axe";

/**
 * DatePicker range picks a range in clicks: the first sets the start, the
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

describe("DatePicker range", () => {
  it("opens on the month of the start date", async () => {
    render(<DatePicker range value={january} onValueChange={vi.fn()} />, { wrapper });
    expect(await day(jan(31))).toBeInTheDocument();
    showing("January", "2026");
  });

  it("sets the start on the first click and the end on the second", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker range value={{ startDate: jan(1), endDate: jan(2) }} onValueChange={onChange} />,
      {
        wrapper,
      },
    );
    // A complete range is there, so the first click starts a new one.
    await user.click(await day(jan(12)));
    expect(onChange).toHaveBeenLastCalledWith({ startDate: jan(12), endDate: undefined });
    await user.click(await day(jan(20)));
    expect(onChange).toHaveBeenLastCalledWith({ startDate: jan(12), endDate: jan(20) });
  });

  it("starts from nothing: the first click sets the start", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker range onValueChange={onChange} />, { wrapper });
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
      <DatePicker
        range
        value={{ startDate: jan(20), endDate: undefined }}
        onValueChange={onChange}
      />,
      {
        wrapper,
      },
    );
    await user.click(await day(jan(8)));
    expect(onChange).toHaveBeenLastCalledWith({ startDate: jan(8), endDate: jan(20) });
  });

  it("marks the days of the range", async () => {
    render(<DatePicker range value={january} onValueChange={vi.fn()} />, { wrapper });
    const inRange = async (date: Date) =>
      /alpha-weak/.test((await day(date)).parentElement?.className ?? "");
    const marks = [];
    for (const d of [4, 5, 7, 9, 10]) marks.push(await inRange(jan(d)));
    expect(marks).toEqual([false, true, true, true, false]);
  });

  it("follows `value` when the parent changes it, moving to its month", async () => {
    const onChange = vi.fn();
    const { rerender } = render(<DatePicker range value={january} onValueChange={onChange} />, {
      wrapper,
    });
    await day(jan(5));
    rerender(
      <DatePicker
        range
        value={{ startDate: new Date(2026, 4, 1), endDate: new Date(2026, 4, 3) }}
        onValueChange={onChange}
      />,
    );
    expect(await day(new Date(2026, 4, 31))).toBeInTheDocument();
    showing("May", "2026");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("moves between months with the month buttons", async () => {
    const user = userEvent.setup();
    render(<DatePicker range value={january} onValueChange={vi.fn()} />, { wrapper });
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
      <DatePicker
        range
        months={2}
        value={{ startDate: jan(5), endDate: undefined }}
        onValueChange={vi.fn()}
      />,
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
      <DatePicker
        range
        months={2}
        value={{ startDate: jan(28), endDate: undefined }}
        onValueChange={onChange}
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
      <DatePicker
        range
        value={january}
        onValueChange={onChange}
        minDate={jan(3)}
        maxDate={jan(25)}
      />,
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
    const { container } = render(<DatePicker range value={january} onValueChange={vi.fn()} />, {
      wrapper,
    });
    await day(jan(5));
    expect(await axeViolations(container)).toEqual([]);
  });

  it("has no axe violations with `dual`, mid-selection", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DatePicker
        range
        months={2}
        value={{ startDate: jan(28), endDate: undefined }}
        onValueChange={vi.fn()}
      />,
      { wrapper },
    );
    await day(jan(28));
    await user.hover(await day(new Date(2026, 1, 3)));
    await expectNoAxeViolations(container);
  });

  // With `dual`, the second calendar is given the next month as
  // `currentMonth` but also the range's end as `value`, and DatePicker moved
  // to its value's month: a range inside one month showed that month twice.
  // A calendar whose month is the caller's (currentMonth, currentYear and
  // onMonthChange) no longer follows its value.
  it("shows the next month beside a range that ends in the same month", async () => {
    render(<DatePicker range months={2} value={january} onValueChange={vi.fn()} />, { wrapper });
    expect(await day(new Date(2026, 1, 28))).toBeInTheDocument();
    showing("January", "2026");
    showing("February", "2026");
    expect(screen.getByRole("grid", { name: "January 2026" })).toBeInTheDocument();
    expect(screen.getByRole("grid", { name: "February 2026" })).toBeInTheDocument();
    // Each day once, in its own month's calendar.
    expect(document.querySelectorAll(`button[data-value="${jan(9).toISOString()}"]`)).toHaveLength(
      1,
    );
  });

  it("keeps both months of a dual picker when the start is picked in the second", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    // Not echoed back as `value`: the picker's own state moves on alone.
    render(<DatePicker range months={2} value={january} onValueChange={onChange} />, { wrapper });
    await user.click(await day(new Date(2026, 1, 10)));

    expect(onChange).toHaveBeenLastCalledWith({
      startDate: new Date(2026, 1, 10),
      endDate: undefined,
    });
    expect(screen.getByRole("grid", { name: "January 2026" })).toBeInTheDocument();
    expect(screen.getByRole("grid", { name: "February 2026" })).toBeInTheDocument();
    // The new start is marked in the calendar that shows it.
    expect((await day(new Date(2026, 1, 10))).closest('[role="gridcell"]')).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("moves both calendars of a dual picker together", async () => {
    const user = userEvent.setup();
    render(<DatePicker range months={2} value={january} onValueChange={vi.fn()} />, { wrapper });
    await day(jan(5));
    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(await day(new Date(2026, 2, 31))).toBeInTheDocument();
    expect(screen.getByRole("grid", { name: "February 2026" })).toBeInTheDocument();
    expect(screen.getByRole("grid", { name: "March 2026" })).toBeInTheDocument();
  });

  // A calendar's month and year lists set that calendar's month alone. In a
  // dual picker the two came apart (or showed one month twice), and the
  // arrows then moved on from the month DatePicker range still had.
  describe("the month and year lists of a dual picker", () => {
    const grids = () => screen.getAllByRole("grid").map((grid) => grid.getAttribute("aria-label"));
    const pick = async (
      user: ReturnType<typeof userEvent.setup>,
      trigger: HTMLElement,
      option: string,
    ) => {
      await user.click(trigger);
      await user.click(await screen.findByRole("option", { name: option }));
      // The list closes, and the grids are drawn again.
      await waitFor(() => expect(screen.queryByRole("listbox")).toBeNull());
    };
    const yearButtons = () => screen.getAllByRole("button", { name: /^Year: \d{4}, change year$/ });

    it("move both calendars from the first calendar's lists", async () => {
      const user = userEvent.setup();
      render(<DatePicker range months={2} value={january} onValueChange={vi.fn()} />, { wrapper });
      await day(jan(5));

      await pick(user, yearButtons()[0], "2027");
      await waitFor(() => expect(grids()).toEqual(["January 2027", "February 2027"]));

      await pick(
        user,
        screen.getByRole("button", { name: "Month: January, change month" }),
        "March",
      );
      await waitFor(() => expect(grids()).toEqual(["March 2027", "April 2027"]));

      // The arrows go on from there.
      await user.click(screen.getByRole("button", { name: "Next month" }));
      await waitFor(() => expect(grids()).toEqual(["April 2027", "May 2027"]));
    });

    it("move the first calendar to the month before from the second calendar's lists", async () => {
      const user = userEvent.setup();
      render(<DatePicker range months={2} value={january} onValueChange={vi.fn()} />, { wrapper });
      await day(jan(5));

      await pick(user, yearButtons()[1], "2025");
      await waitFor(() => expect(grids()).toEqual(["January 2025", "February 2025"]));

      await pick(
        user,
        screen.getByRole("button", { name: "Month: February, change month" }),
        "January",
      );
      await waitFor(() => expect(grids()).toEqual(["December 2024", "January 2025"]));

      await user.click(screen.getByRole("button", { name: "Previous month" }));
      await waitFor(() => expect(grids()).toEqual(["November 2024", "December 2024"]));
    });

    it("keep a single calendar's arrows in step with the lists", async () => {
      const user = userEvent.setup();
      render(<DatePicker range value={january} onValueChange={vi.fn()} />, { wrapper });
      await day(jan(5));

      await pick(user, yearButtons()[0], "2028");
      await waitFor(() => expect(grids()).toEqual(["January 2028"]));
      await user.click(screen.getByRole("button", { name: "Next month" }));
      await waitFor(() => expect(grids()).toEqual(["February 2028"]));
    });
  });

  // DatePicker range took a ref through forwardRef but never attached it.
  it("forwards its ref to the root", async () => {
    const ref = createRef<HTMLDivElement>();
    render(<DatePicker range ref={ref} value={january} onValueChange={vi.fn()} />, { wrapper });
    expect(ref.current).toContainElement(await day(jan(5)));
  });
});
