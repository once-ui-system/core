import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { DatePicker, type DateRange } from "../components/DatePicker";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const jan = (day: number) => new Date(2026, 0, day);

const day = (date: Date) =>
  waitFor(() => {
    const button = document.querySelector<HTMLButtonElement>(
      `button[data-value="${date.toISOString()}"]`,
    );
    if (!button) throw new Error(`No day button for ${date.toDateString()}`);
    return button;
  });

const cell = async (date: Date) => (await day(date)).closest('[role="gridcell"]') as HTMLElement;

/**
 * DateRangePicker picked from the keyboard alone: autoFocus lands on the
 * start day, the arrows walk the grid, Enter sets the start and then the
 * end, the selection reads as selected cells, and a controlled parent sees
 * each step. Pointer picking is covered in daterangepicker.test.tsx.
 */
describe("DateRangePicker: interaction", () => {
  it("picks a range with the arrows and Enter", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker
        range
        value={{ startDate: jan(5), endDate: undefined }}
        onValueChange={onChange}
        autoFocus
      />,
      { wrapper: wrap },
    );
    await waitFor(async () => expect(await day(jan(5))).toHaveFocus());
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(await day(jan(7))).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenLastCalledWith({ startDate: jan(5), endDate: jan(7) });
  });

  // Picking the start changes the first calendar's `value`, which remounted
  // its grid with focus on the page: the end could not be picked by keyboard.
  it("keeps focus on the picked start day, so the end can be picked by keyboard", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker
        range
        value={{ startDate: jan(5), endDate: jan(9) }}
        onValueChange={onChange}
        autoFocus
      />,
      { wrapper: wrap },
    );
    await waitFor(async () => expect(await day(jan(5))).toHaveFocus(), { timeout: 3000 });
    await user.keyboard("{ArrowRight}{Enter}");
    expect(onChange).toHaveBeenLastCalledWith({ startDate: jan(6), endDate: undefined });
    await waitFor(async () => expect(await day(jan(6))).toHaveFocus(), { timeout: 3000 });
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenLastCalledWith({ startDate: jan(6), endDate: jan(13) });
  });

  it("starts a new range on the next pick after a complete one", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker
        range
        value={{ startDate: jan(5), endDate: jan(9) }}
        onValueChange={onChange}
        autoFocus
      />,
      { wrapper: wrap },
    );
    await waitFor(async () => expect(await day(jan(5))).toHaveFocus());
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenLastCalledWith({ startDate: jan(12), endDate: undefined });
  });

  it("drives a controlled parent through start, end and a fresh start", async () => {
    const user = userEvent.setup();
    const Controlled = () => {
      const [range, setRange] = useState<DateRange>({ startDate: jan(1), endDate: jan(2) });
      return (
        <>
          <DatePicker range value={range} onValueChange={setRange} />
          <output>
            {range.startDate?.getDate() ?? "-"}/{range.endDate?.getDate() ?? "-"}
          </output>
        </>
      );
    };
    render(<Controlled />, { wrapper: wrap });
    await user.click(await day(jan(10)));
    expect(screen.getByRole("status")).toHaveTextContent("10/-");
    await user.click(await day(jan(14)));
    expect(screen.getByRole("status")).toHaveTextContent("10/14");
    expect(await cell(jan(14))).toHaveAttribute("aria-selected", "true");
    await user.click(await day(jan(3)));
    expect(screen.getByRole("status")).toHaveTextContent("3/-");
  });

  it("does not pick a day outside minDate and maxDate", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <DatePicker
        range
        value={{ startDate: jan(10), endDate: undefined }}
        minDate={jan(8)}
        maxDate={jan(20)}
        onValueChange={onChange}
      />,
      { wrapper: wrap },
    );
    const early = await day(jan(3));
    expect(early).toBeDisabled();
    await user.click(early);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("has no axe violations with a full range", async () => {
    const { container } = render(
      <DatePicker range value={{ startDate: jan(5), endDate: jan(9) }} onValueChange={vi.fn()} />,
      { wrapper: wrap },
    );
    await day(jan(9));
    await expectNoAxeViolations(container);
  });
});
