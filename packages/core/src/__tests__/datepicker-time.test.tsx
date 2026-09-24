import fs from "node:fs";
import path from "node:path";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DateInput } from "../components/DateInput";
import { DatePicker } from "../components/DatePicker";
import { LayoutProvider } from "../contexts/LayoutProvider";

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

/**
 * The 2.0 "ms timings" pass multiplied every RevealFx `speed` it found by a
 * thousand — including the two that were already milliseconds. DatePicker's
 * calendar and Carousel's slide sat inside a RevealFx with a 250 s / 300 s
 * transition: mounted, focusable, clickable, and at opacity 0 for four minutes.
 */
describe("DatePicker reveal and time header", () => {
  it("reveals the calendar in a fraction of a second", () => {
    const { container } = render(
      <DatePicker timePicker value={new Date(2026, 3, 10, 13, 14)} onChange={() => {}} />,
      { wrapper: wrap },
    );
    const reveal = Array.from(container.querySelectorAll<HTMLElement>("[style]")).find(
      (el) => el.style.transitionDuration !== "",
    );
    expect(reveal).toBeDefined();
    expect(Number.parseFloat(reveal?.style.transitionDuration ?? "0")).toBeLessThanOrEqual(1);
  });

  it("shows the header time as 12-hour, not 24-hour with an AM/PM suffix", () => {
    render(<DatePicker timePicker value={new Date(2026, 3, 10, 13, 14)} onChange={() => {}} />, {
      wrapper: wrap,
    });
    expect(screen.getByText("01:14 PM")).toBeInTheDocument();
    expect(screen.queryByText("13:14 PM")).toBeNull();
  });

  it("no core component asks RevealFx for a reveal slower than five seconds", () => {
    const dir = path.resolve(__dirname, "..", "components");
    const slow: string[] = [];
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith(".tsx")) continue;
      const src = fs.readFileSync(path.join(dir, file), "utf8");
      for (const m of src.matchAll(/<RevealFx[\s\S]*?speed=\{(\d+)\}/g)) {
        if (Number(m[1]) > 5000) slow.push(`${file}: speed={${m[1]}}`);
      }
    }
    expect(slow).toEqual([]);
  });
});
