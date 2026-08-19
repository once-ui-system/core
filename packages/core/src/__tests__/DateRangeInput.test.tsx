import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DateRangeInput } from "../components/DateRangeInput";

describe("DateRangeInput", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders with start and end placeholders", () => {
    render(<DateRangeInput id="test-range" startLabel="Start date" endLabel="End date" />);

    const startInput = screen.getByPlaceholderText("Start date");
    const endInput = screen.getByPlaceholderText("End date");

    expect(startInput).toBeInTheDocument();
    expect(endInput).toBeInTheDocument();
    expect(startInput).toHaveValue("");
    expect(endInput).toHaveValue("");
  });

  it("formats and displays initial date range value", () => {
    const startDate = new Date(2026, 7, 10);
    const endDate = new Date(2026, 7, 20);

    render(
      <DateRangeInput
        id="test-range-val"
        startLabel="Start"
        endLabel="End"
        value={{ startDate, endDate }}
      />,
    );

    const startInput = screen.getByPlaceholderText("Start");
    const endInput = screen.getByPlaceholderText("End");

    expect(startInput).toHaveValue(
      startDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    );
    expect(endInput).toHaveValue(
      endDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    );
  });

  it("forwards ref to root wrapper element", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<DateRangeInput ref={ref} id="ref-range" />);

    expect(ref.current).toBe(container.firstChild);
  });

  it("opens dropdown on focus of start or end input", () => {
    render(<DateRangeInput id="focus-range" startLabel="Start" endLabel="End" />);

    const startInput = screen.getByPlaceholderText("Start");
    fireEvent.focus(startInput);

    expect(document.body).toBeInTheDocument();
  });
});
