import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DateInput } from "../components/DateInput";
import { DateRangeInput } from "../components/DateRangeInput";
import type { DateRange } from "../components/DateRangePicker";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

/**
 * DateInput and DateRangeInput wrapped their read-only field in
 * DropdownWrapper's two `role="button"` elements: an input inside a button
 * (axe "nested-interactive"), announced twice, with no popup state of its own;
 * DateRangeInput's picker also sat in a listbox with no options. Each field is
 * now a combobox that opens a date picker dialog, as Select's field opens its
 * listbox: `aria-haspopup="dialog"`, `aria-expanded`, and `aria-controls` on
 * the dialog while it is open.
 */

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const jan = (day: number) => new Date(2026, 0, day);

/** Long enough for the picker's deferred focus and reveal to have run. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 250));

/** A day's button in the open picker. */
const day = (date: Date) =>
  waitFor(() => {
    const button = document.querySelector<HTMLButtonElement>(
      `button[data-value="${date.toISOString()}"]`,
    );
    if (!button) throw new Error(`No day button for ${date.toDateString()}`);
    return button;
  });

const Single = ({ onPick }: { onPick?: (date: Date) => void }) => {
  const [value, setValue] = useState<Date | undefined>(jan(5));
  return (
    <>
      <button type="button">Before</button>
      <DateInput
        id="due"
        label="Due"
        value={value}
        onChange={(date) => {
          setValue(date);
          onPick?.(date);
        }}
      />
      <button type="button">After</button>
    </>
  );
};

const field = () => screen.getByRole("combobox", { name: "Due" }) as HTMLInputElement;
const isOpen = () => field().getAttribute("aria-expanded") === "true";

const expectOpenOnTheSelectedDay = async () => {
  await waitFor(() => expect(isOpen()).toBe(true));
  const dialog = screen.getByRole("dialog", { name: "Due" });
  expect(field()).toHaveAttribute("aria-controls", dialog.id);
  expect(dialog).toContainElement(await day(jan(5)));
  // Opening moves focus into the picker, onto the selected day.
  await waitFor(() =>
    expect(document.activeElement).toBe(
      document.querySelector(`button[data-value="${jan(5).toISOString()}"]`),
    ),
  );
};

const expectClosedOnTheField = async () => {
  await waitFor(() => expect(isOpen()).toBe(false));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(field()).toHaveFocus();
  // And it stays closed: focus coming back to the field does not reopen it.
  await settle();
  expect(isOpen()).toBe(false);
};

describe("DateInput as a combobox", () => {
  it("is a collapsed combobox named by its label, with no button around it", () => {
    render(<Single />, { wrapper: wrap });

    expect(field()).toHaveAttribute("aria-haspopup", "dialog");
    expect(field()).toHaveAttribute("aria-expanded", "false");
    expect(field()).not.toHaveAttribute("aria-controls");
    expect(field().value).toBe("Jan 5, 2026");
    expect(screen.getAllByRole("button").map((button) => button.textContent)).toEqual([
      "Before",
      "After",
    ]);
  });

  it("has no button around it in the server markup either", () => {
    const html = renderToString(
      <LayoutProvider>
        <DateInput id="due" label="Due" value={jan(5)} />
      </LayoutProvider>,
    );
    expect(html).toContain('role="combobox"');
    expect(html).toContain('aria-haspopup="dialog"');
    expect(html).not.toContain('role="button"');
  });

  it("opens on a click, as a dialog named after the field, focus on the selected day", async () => {
    const user = userEvent.setup();
    render(<Single />, { wrapper: wrap });

    await user.click(field());
    await expectOpenOnTheSelectedDay();
  });

  it.each([
    ["Enter", "{Enter}"],
    ["Space", " "],
    ["ArrowDown", "{ArrowDown}"],
  ])("opens with %s", async (_, key) => {
    const user = userEvent.setup();
    render(<Single />, { wrapper: wrap });

    await user.click(screen.getByRole("button", { name: "Before" }));
    await user.tab();
    expect(field()).toHaveFocus();
    // Tabbing in does not open it.
    await settle();
    expect(isOpen()).toBe(false);

    await user.keyboard(key);
    await expectOpenOnTheSelectedDay();
  });

  it("closes with Escape and returns focus to the field", async () => {
    const user = userEvent.setup();
    render(<Single />, { wrapper: wrap });
    await user.click(field());
    await expectOpenOnTheSelectedDay();

    await user.keyboard("{Escape}");
    await expectClosedOnTheField();
  });

  it("closes on a pick, showing it, with focus back on the field", async () => {
    const user = userEvent.setup();
    const onPick = vi.fn();
    render(<Single onPick={onPick} />, { wrapper: wrap });
    await user.click(field());
    await expectOpenOnTheSelectedDay();

    await user.keyboard("{ArrowRight}{ArrowRight}{Enter}");
    expect(onPick).toHaveBeenLastCalledWith(jan(7));
    await expectClosedOnTheField();
    expect(field().value).toBe("Jan 7, 2026");
  });

  it("names the dialog after an aria-label when there is no label", async () => {
    const user = userEvent.setup();
    render(<DateInput id="when" aria-label="Delivery date" />, { wrapper: wrap });

    await user.click(screen.getByRole("combobox", { name: "Delivery date" }));
    expect(await screen.findByRole("dialog", { name: "Delivery date" })).toBeInTheDocument();
  });

  it("has no axe violations closed", async () => {
    const { container } = render(<Single />, { wrapper: wrap });
    await expectNoAxeViolations(container);
  });

  it("has no axe violations open", async () => {
    const user = userEvent.setup();
    render(<Single />, { wrapper: wrap });
    await user.click(field());
    await expectOpenOnTheSelectedDay();
    await settle();
    await expectNoAxeViolations(document.body);
  });
});

const Range = ({ onPick }: { onPick?: (range: DateRange) => void }) => {
  const [value, setValue] = useState<DateRange>({ startDate: jan(5), endDate: jan(9) });
  return (
    <>
      <button type="button">Before</button>
      <DateRangeInput
        id="stay"
        startLabel="Check-in"
        endLabel="Check-out"
        value={value}
        onChange={(range) => {
          setValue(range);
          onPick?.(range);
        }}
      />
    </>
  );
};

const start = () => screen.getByRole("combobox", { name: "Check-in" }) as HTMLInputElement;
const end = () => screen.getByRole("combobox", { name: "Check-out" }) as HTMLInputElement;

describe("DateRangeInput as two comboboxes", () => {
  it("is two collapsed comboboxes named by their labels, with no button around them", () => {
    render(<Range />, { wrapper: wrap });

    for (const combobox of [start(), end()]) {
      expect(combobox).toHaveAttribute("aria-haspopup", "dialog");
      expect(combobox).toHaveAttribute("aria-expanded", "false");
      expect(combobox).not.toHaveAttribute("aria-controls");
    }
    expect(start().value).toBe("Jan 5, 2026");
    expect(end().value).toBe("Jan 9, 2026");
    expect(screen.getAllByRole("button").map((button) => button.textContent)).toEqual(["Before"]);
  });

  it("opens one dialog from either field, focus on the start day", async () => {
    const user = userEvent.setup();
    render(<Range />, { wrapper: wrap });

    await user.click(end());
    const dialog = await screen.findByRole("dialog", { name: "Check-in – Check-out" });
    expect(start()).toHaveAttribute("aria-expanded", "true");
    expect(end()).toHaveAttribute("aria-controls", dialog.id);
    expect(start()).toHaveAttribute("aria-controls", dialog.id);
    // A dialog, not a listbox around a calendar.
    expect(screen.queryByRole("listbox")).toBeNull();
    const fifth = await day(jan(5));
    await waitFor(() => expect(fifth).toHaveFocus());
  });

  it("closes with Escape and returns focus to the field that opened it", async () => {
    const user = userEvent.setup();
    render(<Range />, { wrapper: wrap });
    await user.click(screen.getByRole("button", { name: "Before" }));
    await user.tab();
    await user.tab();
    expect(end()).toHaveFocus();

    await user.keyboard("{ArrowDown}");
    await waitFor(async () => expect(await day(jan(5))).toHaveFocus());
    await user.keyboard("{Escape}");

    await waitFor(() => expect(end()).toHaveAttribute("aria-expanded", "false"));
    expect(end()).toHaveFocus();
    await settle();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes once the range is picked, with focus back on the field", async () => {
    const user = userEvent.setup();
    const onPick = vi.fn();
    render(<Range onPick={onPick} />, { wrapper: wrap });
    await user.click(start());
    await waitFor(async () => expect(await day(jan(5))).toHaveFocus());

    await user.click(await day(jan(12)));
    expect(onPick).toHaveBeenLastCalledWith({ startDate: jan(12), endDate: undefined });
    expect(start()).toHaveAttribute("aria-expanded", "true");
    await user.click(await day(jan(15)));
    expect(onPick).toHaveBeenLastCalledWith({ startDate: jan(12), endDate: jan(15) });

    await waitFor(() => expect(start()).toHaveAttribute("aria-expanded", "false"));
    expect(start()).toHaveFocus();
    expect(start().value).toBe("Jan 12, 2026");
    expect(end().value).toBe("Jan 15, 2026");
  });

  it("has no axe violations closed", async () => {
    const { container } = render(<Range />, { wrapper: wrap });
    await expectNoAxeViolations(container);
  });

  it("has no axe violations open", async () => {
    const user = userEvent.setup();
    render(<Range />, { wrapper: wrap });
    await user.click(start());
    await waitFor(async () => expect(await day(jan(5))).toHaveFocus());
    await settle();
    await expectNoAxeViolations(document.body);
  });
});
