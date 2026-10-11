import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "../components/DatePicker";
import { DateRangePicker } from "../components/DateRangePicker";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

/**
 * DatePicker's calendar was a `role="grid"` with its day buttons straight
 * inside, no rows or cells (axe "aria-required-children"), and its month and
 * year selectors were buttons inside two `role="button"` wrappers (axe
 * "nested-interactive") until the Buttons registered after mount, which left
 * the server markup nested. The grid is now rows of gridcells under a row of
 * column headers, one day is its tab stop, and its keys act on its own days.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const jan = (day: number) => new Date(2026, 0, day);

/** A day's button, once the calendar has synced to its value and drawn. */
const day = (date: Date) =>
  waitFor(() => {
    const button = document.querySelector<HTMLButtonElement>(
      `button[data-value="${date.toISOString()}"]`,
    );
    if (!button) throw new Error(`No day button for ${date.toDateString()}`);
    return button;
  });

/** Long enough for the picker's own deferred focus and reveal to have run. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 200));

/**
 * Puts focus on a day, as Tab or a click would. The picker no longer takes
 * focus by itself (see datepicker-focus.test.tsx), so a test has to.
 */
const focusDay = async (date: Date) => {
  const button = await day(date);
  act(() => button.focus());
  expect(button).toHaveFocus();
  return button;
};

describe("DatePicker grid", () => {
  it("is a grid named after its month: a header row, then a row of seven cells per week", async () => {
    render(<DatePicker value={jan(5)} onChange={vi.fn()} />, { wrapper });
    await day(jan(5));

    const grid = screen.getByRole("grid", { name: "January 2026" });
    const rows = within(grid).getAllByRole("row");
    // January 2026 starts on a Thursday: five weeks, and the header.
    expect(rows).toHaveLength(6);
    expect(
      within(rows[0])
        .getAllByRole("columnheader")
        .map((header) => header.getAttribute("aria-label")),
    ).toEqual(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);
    for (const week of rows.slice(1)) {
      expect(within(week).getAllByRole("gridcell")).toHaveLength(7);
    }

    // Each day's button is in its own cell, and the selected day's cell says so.
    const fifth = await day(jan(5));
    expect(fifth.closest('[role="gridcell"]')).toHaveAttribute("aria-selected", "true");
    expect((await day(jan(6))).closest('[role="gridcell"]')).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("has no axe violations", async () => {
    const { container } = render(<DatePicker value={jan(5)} onChange={vi.fn()} />, { wrapper });
    await day(jan(5));
    await settle();
    await expectNoAxeViolations(container);
  });

  it("has no axe violations with the year list open", async () => {
    const user = userEvent.setup();
    render(<DatePicker value={jan(5)} onChange={vi.fn()} />, { wrapper });
    await day(jan(5));
    await settle();
    await user.click(screen.getByText("2026"));
    await screen.findByRole("option", { name: "2025" });
    await settle();
    await expectNoAxeViolations(document.body);
  });

  it("nests no button in another in the server markup", () => {
    const html = renderToString(
      <LayoutProvider>
        <DatePicker value={jan(5)} onChange={() => {}} />
      </LayoutProvider>,
    );
    expect(html).toContain("January");
    expect(html).not.toContain('role="button"');
  });

  it("is one tab stop, on the selected day, which follows the arrow keys", async () => {
    const user = userEvent.setup();
    render(<DatePicker value={jan(5)} onChange={vi.fn()} />, { wrapper });
    const grid = await waitFor(() => screen.getByRole("grid"));

    // The other months' days are disabled, so out of the tab order anyway.
    const tabbable = () =>
      Array.from(grid.querySelectorAll("button")).filter(
        (button) => button.tabIndex === 0 && !button.disabled,
      );
    expect(tabbable()).toEqual([await day(jan(5))]);

    // Tab reaches it after the four header controls.
    await user.tab();
    await user.tab();
    await user.tab();
    await user.tab();
    await user.tab();
    expect(await day(jan(5))).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(await day(jan(6))).toHaveFocus();
    expect(tabbable()).toEqual([await day(jan(6))]);
  });

  it("moves by day and by week from the selected day, and picks with Enter", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker value={jan(5)} onChange={onChange} />, { wrapper });
    await focusDay(jan(5));

    await user.keyboard("{ArrowDown}");
    expect(await day(jan(12))).toHaveFocus();
    await user.keyboard("{ArrowLeft}");
    expect(await day(jan(11))).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenLastCalledWith(jan(11));
  });

  it("ends on the last day that can be picked", async () => {
    const user = userEvent.setup();
    render(<DatePicker value={jan(5)} onChange={vi.fn()} maxDate={jan(25)} />, { wrapper });
    await focusDay(jan(5));

    await user.keyboard("{End}");
    expect(await day(jan(25))).toHaveFocus();
  });

  it("picks a dual picker's day in the calendar it was pressed in", async () => {
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
    // The second calendar starts on its first day. Enter there used to pick
    // the first calendar's day at the same position: January the 1st.
    await focusDay(new Date(2026, 1, 1));
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenLastCalledWith({
      startDate: jan(28),
      endDate: new Date(2026, 1, 1),
    });
  });
});
