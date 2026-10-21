import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "../components/Button";
import { DatePicker } from "../components/DatePicker";
import { DropdownWrapper } from "../components/DropdownWrapper";
import { LayoutProvider } from "../contexts/LayoutProvider";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * Reported as "NumberInput chevrons close the overlay": a DatePicker with a
 * time panel, opened from a button through DropdownWrapper. DropdownWrapper
 * treated any child with a `value` prop as an option and gave it a "pick and
 * close" onClick, which replaced DatePicker's own. Day clicks stopped
 * propagation and survived; the stepper chevrons, AM/PM and "Back to calendar"
 * closed the dropdown.
 */
function Scheduler({ onChange }: { onChange: (date: Date) => void }) {
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 9, 23, 18, 1));
  return (
    <DropdownWrapper
      trigger={<Button>Schedule</Button>}
      dropdown={
        <DatePicker
          timePicker
          value={date}
          onChange={(next) => {
            setDate(next);
            onChange(next);
          }}
        />
      }
    />
  );
}

describe("DatePicker time panel in a DropdownWrapper", () => {
  it("stays open when the hour and minute chevrons are clicked", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const onChange = vi.fn();
      render(<Scheduler onChange={onChange} />, { wrapper: wrap });

      await user.click(screen.getByRole("button", { name: "Schedule" }));
      const day = await screen.findByRole("button", { name: /24/ });
      await user.click(day);
      // The time panel replaces the grid after a 400ms transition.
      await act(async () => {
        vi.advanceTimersByTime(500);
      });
      const minutes = await screen.findByLabelText("Minutes");
      expect(minutes).toHaveValue(1);

      const [, minutesUp] = screen.getAllByRole("button", { name: "Increment value" });
      await user.click(minutesUp);
      await waitFor(() => expect(screen.getByLabelText("Minutes")).toHaveValue(2));

      const [hoursDown] = screen.getAllByRole("button", { name: "Decrement value" });
      await user.click(hoursDown);
      await waitFor(() => expect(screen.getByLabelText("Hours")).toHaveValue(5));

      // Still open, and the time reached the caller.
      expect(screen.getByLabelText("Minutes")).toBeInTheDocument();
      const last = onChange.mock.calls.at(-1)?.[0] as Date;
      expect(last.getHours()).toBe(17);
      expect(last.getMinutes()).toBe(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it("still runs a caller's onClick on the picker", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<DatePicker value={new Date(2026, 9, 23)} onClick={onClick} data-testid="picker" />, {
      wrapper: wrap,
    });
    await user.click(screen.getByTestId("picker"));
    expect(onClick).toHaveBeenCalled();
  });
});
