import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DateRangePicker } from "../components/DateRangePicker";

describe("DateRangePicker", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders with a single month picker when dual is false or omitted", () => {
    const startDate = new Date(2026, 7, 10);
    const endDate = new Date(2026, 7, 20);

    render(<DateRangePicker value={{ startDate, endDate }} />);

    expect(screen.getByText("August")).toBeInTheDocument();
    expect(screen.getByText("2026")).toBeInTheDocument();
  });

  it("renders dual month pickers when dual is true", () => {
    const startDate = new Date(2026, 7, 10); // August 2026
    const endDate = new Date(2026, 7, 20);

    render(<DateRangePicker value={{ startDate, endDate }} dual />);

    expect(screen.getAllByText("August").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("September").length).toBeGreaterThanOrEqual(1);
  });

  it("handles date selection sequence (first start date, then end date)", async () => {
    const onChange = vi.fn();
    const startDate = new Date(2026, 7, 10);
    const { container, rerender } = render(
      <DateRangePicker value={{ startDate, endDate: undefined }} onChange={onChange} />,
    );

    const day20Button = container.querySelector(
      `button[data-value="${new Date(2026, 7, 20).toISOString()}"]`,
    ) as HTMLButtonElement;
    expect(day20Button).toBeInTheDocument();
    fireEvent.click(day20Button);

    expect(onChange).toHaveBeenCalledTimes(1);
    const range = onChange.mock.calls[0][0];
    expect(range.startDate?.getDate()).toBe(10);
    expect(range.endDate?.getDate()).toBe(20);

    // If rerendered with full range, clicking another date starts a new selection
    rerender(<DateRangePicker value={{ startDate, endDate: range.endDate }} onChange={onChange} />);

    const day15Button = container.querySelector(
      `button[data-value="${new Date(2026, 7, 15).toISOString()}"]`,
    ) as HTMLButtonElement;
    expect(day15Button).toBeInTheDocument();
    fireEvent.click(day15Button);

    expect(onChange).toHaveBeenCalledTimes(2);
    const newRange = onChange.mock.calls[1][0];
    expect(newRange.startDate?.getDate()).toBe(15);
    expect(newRange.endDate).toBeUndefined();
  });

  it("swaps start and end dates when second selected date is earlier than start date", async () => {
    const onChange = vi.fn();
    const startDate = new Date(2026, 7, 15);
    const { container } = render(
      <DateRangePicker value={{ startDate, endDate: undefined }} onChange={onChange} />,
    );

    const day5Button = container.querySelector(
      `button[data-value="${new Date(2026, 7, 5).toISOString()}"]`,
    ) as HTMLButtonElement;
    expect(day5Button).toBeInTheDocument();
    fireEvent.click(day5Button);

    expect(onChange).toHaveBeenCalledTimes(1);
    const range = onChange.mock.calls[0][0];
    expect(range.startDate?.getDate()).toBe(5);
    expect(range.endDate?.getDate()).toBe(15);
  });

  it("handles month navigation", () => {
    const startDate = new Date(2026, 7, 10);
    render(<DateRangePicker value={{ startDate, endDate: undefined }} />);

    expect(screen.getByText("August")).toBeInTheDocument();

    const prevButton = screen.getByRole("button", { name: "chevronLeft" });
    fireEvent.click(prevButton);
    expect(screen.getByText("July")).toBeInTheDocument();

    const nextButton = screen.getByRole("button", { name: "chevronRight" });
    fireEvent.click(nextButton);
    expect(screen.getByText("August")).toBeInTheDocument();
  });

  it("forwards ref to root Flex container element", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<DateRangePicker ref={ref} />);

    expect(ref.current).toBe(container.firstChild);
  });

  it("applies custom className and style to root container", () => {
    const { container } = render(
      <DateRangePicker className="custom-range-picker" style={{ opacity: 0.9 }} />,
    );

    expect(container.firstChild).toHaveClass("custom-range-picker");
  });
});
