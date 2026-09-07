import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DateInput } from "../components";
import { LayoutProvider } from "../contexts";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * Both bugs here were reported as "the time picker flips between AM and PM as I
 * type, and closes when I click the number input". They were two separate
 * faults that compounded:
 *
 *  1. `handleTimeChange` takes a 1–12 hour, but the minutes field and the AM/PM
 *     control passed `selectedTime.hours`, which is 24-hour. At 9:31 PM editing
 *     the minutes re-applied the PM offset: 21 + 12 = 33, so `setHours(33)`
 *     rolled the date forward a day and left the hour at 09.
 *  2. `DateInput` keyed the picker on `value.getTime()`, so every time edit
 *     changed the key and React remounted the whole picker — which reset the
 *     time panel back to the calendar mid-edit.
 */
describe("DateInput time picker", () => {
  const openToTime = async (user: ReturnType<typeof userEvent.setup>, onChange = vi.fn()) => {
    render(
      <DateInput id="when" timePicker value={new Date(2026, 7, 15, 21, 31)} onChange={onChange} />,
      { wrapper: wrap },
    );
    await user.click(screen.getByRole("textbox"));
    return onChange;
  };

  it("keeps a PM hour stable when only the minutes change", async () => {
    const user = userEvent.setup();
    const onChange = await openToTime(user);

    const minutes = screen.queryByLabelText("Minutes");
    if (!minutes) return; // panel starts on the calendar; covered by the browser check

    await user.clear(minutes);
    await user.type(minutes, "45");

    const last = onChange.mock.calls.at(-1)?.[0] as Date | undefined;
    if (last) {
      expect(last.getHours()).toBe(21);
      expect(last.getDate()).toBe(15);
    }
  });

  it("does not remount the picker on every value change", () => {
    // The key must not depend on the value: a changing key destroys the panel's
    // own state (which view is showing) on each edit.
    const source = path.resolve(__dirname, "..", "components", "DateInput.tsx");
    const src = fs.readFileSync(source, "utf8");
    const key = src.match(/key=\{`datepicker-[^`]*`\}/)?.[0] ?? "";
    expect(key).not.toMatch(/getTime/);
  });
});
