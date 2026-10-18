import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { DateRangeInput } from "../components/DateRangeInput";
import { LayoutProvider } from "../contexts/LayoutProvider";

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

const start = () => screen.getByRole("combobox", { name: "From" }) as HTMLInputElement;
const end = () => screen.getByRole("combobox", { name: "To" }) as HTMLInputElement;

/**
 * DateRangeInput from the keyboard: Enter, Space or ArrowDown on either
 * field opens the picker, a range picked with the keys fills both fields and
 * closes it with focus back on the opener, it works with no `value` at all,
 * the caller's key and click handlers still run, and a group name given with
 * `aria-label` names the dialog without replacing each field's own name.
 */
describe("DateRangeInput: interaction", () => {
  it.each([["{Enter}"], [" "], ["{ArrowDown}"]])("opens from the field with %s", async (key) => {
    const user = userEvent.setup();
    render(
      <DateRangeInput
        id="trip"
        startLabel="From"
        endLabel="To"
        value={{ startDate: jan(5), endDate: jan(9) }}
      />,
      { wrapper: wrap },
    );
    await user.tab();
    expect(start()).toHaveFocus();
    await user.keyboard(key);
    expect(start()).toHaveAttribute("aria-expanded", "true");
    expect(await screen.findByRole("dialog", { name: "From – To" })).toBeInTheDocument();
  });

  it("picks a range from the keyboard, uncontrolled, and hands focus back", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateRangeInput id="trip" startLabel="From" endLabel="To" onChange={onChange} />, {
      wrapper: wrap,
    });
    await user.tab();
    await user.tab();
    expect(end()).toHaveFocus();
    await user.keyboard("{Enter}");

    const today = new Date();
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    // Without a value the picker focuses the first day that can be picked.
    await waitFor(async () => expect(await day(first)).toHaveFocus());
    await user.keyboard("{Enter}{ArrowRight}{ArrowRight}{Enter}");
    const third = new Date(today.getFullYear(), today.getMonth(), 3);
    expect(onChange).toHaveBeenLastCalledWith({ startDate: first, endDate: third });

    await waitFor(() => expect(end()).toHaveAttribute("aria-expanded", "false"));
    expect(end()).toHaveFocus();
    const format = (d: Date) =>
      d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    expect(start().value).toBe(format(first));
    expect(end().value).toBe(format(third));
  });

  it("still runs the caller's click and keydown handlers, and lets keydown cancel opening", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onKeyDown = vi.fn((event: React.KeyboardEvent) => event.preventDefault());
    render(
      <DateRangeInput
        id="trip"
        startLabel="From"
        endLabel="To"
        onClick={onClick}
        onKeyDown={onKeyDown}
      />,
      { wrapper: wrap },
    );
    await user.tab();
    await user.keyboard("{Enter}");
    expect(onKeyDown).toHaveBeenCalled();
    expect(start()).toHaveAttribute("aria-expanded", "false");
    await user.click(end());
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(end()).toHaveAttribute("aria-expanded", "true");
  });

  // `aria-label` was spread onto both fields after their own names, so the
  // start and end fields were both announced as the group's name.
  it("names the dialog with aria-label and keeps each field's own name", async () => {
    const user = userEvent.setup();
    render(<DateRangeInput id="trip" startLabel="From" endLabel="To" aria-label="Travel dates" />, {
      wrapper: wrap,
    });
    expect(start()).toBeInTheDocument();
    expect(end()).toBeInTheDocument();
    await user.click(start());
    expect(await screen.findByRole("dialog", { name: "Travel dates" })).toBeInTheDocument();
  });

  it("is not opened from a disabled field", async () => {
    const user = userEvent.setup();
    render(<DateRangeInput id="trip" startLabel="From" endLabel="To" disabled />, {
      wrapper: wrap,
    });
    expect(start()).toBeDisabled();
    expect(end()).toBeDisabled();
    await user.click(start());
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
