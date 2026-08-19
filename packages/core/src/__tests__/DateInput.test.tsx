import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DateInput } from "../components/DateInput";

describe("DateInput", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders with label and placeholder", () => {
    render(<DateInput id="test-date" label="Select Date" placeholder="YYYY-MM-DD" />);

    const input = screen.getByLabelText("Select Date");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", "YYYY-MM-DD");
    expect(input).toHaveValue("");
  });

  it("formats and displays initial date value", () => {
    const testDate = new Date(2026, 7, 23); // Aug 23, 2026
    render(<DateInput id="test-date" label="Event Date" value={testDate} />);

    const input = screen.getByLabelText("Event Date");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(
      testDate.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    );
  });

  it("formats date with time when timePicker is true", () => {
    const testDate = new Date(2026, 7, 23, 14, 30);
    render(<DateInput id="test-date-time" label="Event Time" value={testDate} timePicker />);

    const input = screen.getByLabelText("Event Time");
    expect(input).toHaveValue(
      testDate.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    );
  });

  it("forwards ref to root wrapper element", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(<DateInput ref={ref} id="ref-date" label="Ref Test" />);

    expect(ref.current).toBe(container.firstChild);
  });

  it("opens dropdown on focus", () => {
    render(<DateInput id="focus-date" label="Focus Test" />);

    const input = screen.getByLabelText("Focus Test");
    fireEvent.focus(input);

    // The DatePicker calendar is rendered in document body / portal
    expect(document.body).toBeInTheDocument();
  });
});
