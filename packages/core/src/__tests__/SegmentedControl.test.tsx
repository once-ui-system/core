import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { SegmentedControl } from "../components/SegmentedControl";

const testButtons = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

describe("SegmentedControl", () => {
  it("renders all buttons and selects the first button by default", () => {
    const handleToggle = vi.fn();
    render(<SegmentedControl buttons={testButtons} onToggle={handleToggle} />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);

    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[0]).toHaveAttribute("tabindex", "0");
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");
    expect(tabs[1]).toHaveAttribute("tabindex", "-1");
    expect(tabs[2]).toHaveAttribute("aria-selected", "false");
    expect(tabs[2]).toHaveAttribute("tabindex", "-1");
  });

  it("selects button specified by defaultSelected", () => {
    const handleToggle = vi.fn();
    render(
      <SegmentedControl buttons={testButtons} onToggle={handleToggle} defaultSelected="week" />,
    );

    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("aria-selected", "false");
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
    expect(tabs[2]).toHaveAttribute("aria-selected", "false");
  });

  it("handles controlled selection via selected prop", () => {
    const handleToggle = vi.fn();
    const { rerender } = render(
      <SegmentedControl buttons={testButtons} onToggle={handleToggle} selected="month" />,
    );

    const tabs = screen.getAllByRole("tab");
    expect(tabs[2]).toHaveAttribute("aria-selected", "true");

    rerender(<SegmentedControl buttons={testButtons} onToggle={handleToggle} selected="day" />);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[2]).toHaveAttribute("aria-selected", "false");
  });

  it("calls onToggle and updates selection on button click", () => {
    const handleToggle = vi.fn();
    render(<SegmentedControl buttons={testButtons} onToggle={handleToggle} />);

    const weekTab = screen.getByRole("tab", { name: "Week" });
    fireEvent.click(weekTab);

    expect(handleToggle).toHaveBeenCalledTimes(1);
    expect(handleToggle).toHaveBeenCalledWith("week", expect.any(Object));
    expect(weekTab).toHaveAttribute("aria-selected", "true");
  });

  it("renders in compact mode with outline variant and edge radii", () => {
    const handleToggle = vi.fn();
    render(<SegmentedControl buttons={testButtons} onToggle={handleToggle} compact />);

    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveClass("rounded-l-m");
    expect(tabs[1]).toHaveClass("rounded-none");
    expect(tabs[2]).toHaveClass("rounded-r-m");
  });

  it("handles keyboard navigation with arrow keys and Enter/Space", () => {
    const handleToggle = vi.fn();
    render(<SegmentedControl buttons={testButtons} onToggle={handleToggle} />);

    const tablist = screen.getByRole("tablist");
    const tabs = screen.getAllByRole("tab");

    tabs[0].focus();
    expect(document.activeElement).toBe(tabs[0]);

    // ArrowRight moves focus to the next item
    fireEvent.keyDown(tablist, { key: "ArrowRight" });
    expect(document.activeElement).toBe(tabs[1]);

    // ArrowDown moves focus to the next item
    fireEvent.keyDown(tablist, { key: "ArrowDown" });
    expect(document.activeElement).toBe(tabs[2]);

    // ArrowRight wraps to the first item
    fireEvent.keyDown(tablist, { key: "ArrowRight" });
    expect(document.activeElement).toBe(tabs[0]);

    // ArrowLeft wraps to the last item
    fireEvent.keyDown(tablist, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(tabs[2]);

    // Enter selects the focused item
    fireEvent.keyDown(tablist, { key: "Enter" });
    expect(handleToggle).toHaveBeenCalledWith("month");

    // ArrowLeft to middle item
    fireEvent.keyDown(tablist, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(tabs[1]);

    // Space selects the focused item
    fireEvent.keyDown(tablist, { key: " " });
    expect(handleToggle).toHaveBeenCalledWith("week");
  });

  it("forwards ref to the outer container element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<SegmentedControl ref={ref} buttons={testButtons} onToggle={vi.fn()} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges custom className and style", () => {
    render(
      <SegmentedControl
        buttons={[
          { value: "a", label: "A", className: "btn-custom-a" },
          { value: "b", label: "B" },
        ]}
        onToggle={vi.fn()}
        className="control-custom"
      />,
    );

    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveClass("control-custom", "btn-custom-a");
    expect(tabs[1]).toHaveClass("control-custom");
  });
});
