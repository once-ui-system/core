import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DatePicker } from "../components/DatePicker";

describe("DatePicker", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders month and year header for a given date", () => {
    const testDate = new Date(2026, 7, 23); // August 2026
    render(<DatePicker value={testDate} />);

    expect(screen.getByText("August")).toBeInTheDocument();
    expect(screen.getByText("2026")).toBeInTheDocument();
  });

  it("calls onChange when a date is clicked", async () => {
    const onChange = vi.fn();
    const testDate = new Date(2026, 7, 1); // August 2026
    render(<DatePicker value={testDate} onChange={onChange} />);

    const day15Button = await screen.findByRole("button", { name: "15" });
    fireEvent.click(day15Button);

    expect(onChange).toHaveBeenCalledTimes(1);
    const selectedDate = onChange.mock.calls[0][0] as Date;
    expect(selectedDate.getDate()).toBe(15);
    expect(selectedDate.getMonth()).toBe(7);
    expect(selectedDate.getFullYear()).toBe(2026);
  });

  it("navigates to previous and next month", () => {
    const testDate = new Date(2026, 7, 1); // August 2026
    render(<DatePicker value={testDate} />);

    expect(screen.getByText("August")).toBeInTheDocument();

    const prevButton = screen.getByRole("button", { name: "chevronLeft" });
    fireEvent.click(prevButton);
    expect(screen.getByText("July")).toBeInTheDocument();

    const nextButton = screen.getByRole("button", { name: "chevronRight" });
    fireEvent.click(nextButton);
    expect(screen.getByText("August")).toBeInTheDocument();
  });

  it("disables dates outside minDate and maxDate range", async () => {
    const minDate = new Date(2026, 7, 10);
    const maxDate = new Date(2026, 7, 20);
    const testDate = new Date(2026, 7, 15);
    const { container } = render(
      <DatePicker value={testDate} minDate={minDate} maxDate={maxDate} />,
    );

    // Wait for calendar to render
    await screen.findByText("August");

    const day5 = container.querySelector(
      `button[data-value="${new Date(2026, 7, 5).toISOString()}"]`,
    );
    expect(day5).toBeDisabled();

    const day15 = container.querySelector(
      `button[data-value="${new Date(2026, 7, 15).toISOString()}"]`,
    );
    expect(day15).not.toBeDisabled();

    const day25 = container.querySelector(
      `button[data-value="${new Date(2026, 7, 25).toISOString()}"]`,
    );
    expect(day25).toBeDisabled();
  });

  it("handles timePicker mode and toggling to time selector", async () => {
    const onChange = vi.fn();
    const testDate = new Date(2026, 7, 23, 14, 30);
    render(<DatePicker value={testDate} onChange={onChange} timePicker />);

    // Click on date triggers time selector toggle
    const day23Button = await screen.findByRole("button", { name: "23" });
    fireEvent.click(day23Button);

    const backButton = await screen.findByText("Back to calendar");
    expect(backButton).toBeInTheDocument();
  });

  it("forwards ref to root container element", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<DatePicker ref={ref} />);

    expect(ref.current).toBe(container.firstChild);
  });
});
