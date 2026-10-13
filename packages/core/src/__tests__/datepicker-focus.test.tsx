import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { DatePicker } from "../components/DatePicker";
import { LayoutProvider } from "../contexts/LayoutProvider";

/**
 * DatePicker focused its selected day on a timer once it was ready and on
 * every change of month, wherever focus was, and the grid's ArrowNavigation
 * focused its first day whenever it mounted with focus on the page. An inline
 * picker took focus as the page loaded, from a field being typed in, and from
 * its own month controls. Focus now moves into the grid only when the user is
 * in the picker already, or with `autoFocus` as it opens (DateInput's).
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
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

/** Longer than every timer the picker runs once it has mounted. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 400));

describe("DatePicker focus", () => {
  it("takes no focus as it mounts", async () => {
    render(<DatePicker value={jan(5)} onChange={vi.fn()} />, { wrapper });
    await day(jan(5));
    await settle();
    expect(document.body).toHaveFocus();
  });

  it("leaves focus in the field the user is in", async () => {
    render(
      <>
        <input aria-label="Name" />
        <DatePicker value={jan(5)} onChange={vi.fn()} />
      </>,
      { wrapper },
    );
    const name = screen.getByRole("textbox", { name: "Name" });
    act(() => name.focus());
    await settle();
    expect(name).toHaveFocus();
  });

  it("takes no focus when its value is changed from outside", async () => {
    const { rerender } = render(<DatePicker value={jan(5)} onChange={vi.fn()} />, { wrapper });
    await day(jan(5));
    await settle();

    rerender(<DatePicker value={new Date(2026, 2, 10)} onChange={vi.fn()} />);
    await day(new Date(2026, 2, 10));
    await settle();
    expect(document.body).toHaveFocus();
  });

  it("keeps focus on the month buttons as they change the month", async () => {
    const user = userEvent.setup();
    render(<DatePicker value={jan(5)} onChange={vi.fn()} />, { wrapper });
    await day(jan(5));

    await user.click(screen.getByRole("button", { name: "Next month" }));
    await day(new Date(2026, 1, 28));
    await settle();
    expect(screen.getByRole("button", { name: "Next month" })).toHaveFocus();

    // Back on the selected day's month: focus used to jump onto that day.
    await user.click(screen.getByRole("button", { name: "Previous month" }));
    await day(jan(31));
    await settle();
    expect(screen.getByRole("button", { name: "Previous month" })).toHaveFocus();
    expect(screen.getByRole("grid", { name: "January 2026" })).toBeInTheDocument();
  });

  it("keeps focus on the year selector once a year is picked from its list", async () => {
    const user = userEvent.setup();
    render(<DatePicker value={jan(5)} onChange={vi.fn()} />, { wrapper });
    await day(jan(5));
    await settle();

    await user.click(screen.getByText("2026"));
    await user.click(await screen.findByRole("option", { name: "2025" }));
    await day(new Date(2025, 0, 31));
    await settle();
    expect(screen.getByText("2025").closest("button")).toHaveFocus();

    // Back to the selected day's year: focus used to jump onto that day.
    await user.click(screen.getByText("2025"));
    await user.click(await screen.findByRole("option", { name: "2026" }));
    await day(jan(31));
    await settle();
    expect(screen.getByText("2026").closest("button")).toHaveFocus();
  });

  it("starts the keys from the day focus is on, and keeps focus on a day picked with them", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DatePicker value={jan(5)} onChange={onChange} />, { wrapper });
    const fifth = await day(jan(5));
    act(() => fifth.focus());

    // Focus follows the keys from an effect once the grid has re-rendered,
    // so it is waited for rather than read straight after the key.
    await user.keyboard("{ArrowDown}");
    await waitFor(async () => expect(await day(jan(12))).toHaveFocus());
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenLastCalledWith(jan(12));

    // The pick redraws the grid, and focus comes back to the picked day.
    await waitFor(async () => expect(await day(jan(12))).toHaveFocus());
    await user.keyboard("{ArrowRight}");
    await waitFor(async () => expect(await day(jan(13))).toHaveFocus());
  });

  it("starts the keys from a day that took focus before the grid was listening", async () => {
    // A quick Tab can focus a day after the grid reaches the page but before
    // its effects run, so the day's focusin has gone by unheard. This focuses
    // the 5th in the same task that adds it, which is that window exactly;
    // a loaded CI runner hit it from the test above, landing on the 7th.
    const user = userEvent.setup();
    const early = new MutationObserver(() => {
      const fifth = document.querySelector<HTMLButtonElement>(
        `button[data-value="${jan(5).toISOString()}"]`,
      );
      if (!fifth) return;
      fifth.focus();
      early.disconnect();
    });
    early.observe(document.body, { childList: true, subtree: true });
    render(<DatePicker value={jan(5)} onChange={vi.fn()} />, { wrapper });
    await waitFor(async () => expect(await day(jan(5))).toHaveFocus());
    await settle();

    await user.keyboard("{ArrowDown}");
    await waitFor(async () => expect(await day(jan(12))).toHaveFocus());
  });

  it("with autoFocus, focuses the selected day as it appears", async () => {
    render(<DatePicker value={jan(5)} onChange={vi.fn()} autoFocus />, { wrapper });
    const fifth = await day(jan(5));
    await waitFor(() => expect(fifth).toHaveFocus());
  });

  it("with autoFocus, focuses the first day that can be picked when none is selected", async () => {
    render(
      <DatePicker
        onChange={vi.fn()}
        autoFocus
        currentMonth={0}
        currentYear={2026}
        onMonthChange={vi.fn()}
        minDate={jan(3)}
      />,
      { wrapper },
    );
    const third = await day(jan(3));
    await waitFor(() => expect(third).toHaveFocus());
  });
});
