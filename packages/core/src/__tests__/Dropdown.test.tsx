import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Dropdown } from "../components/Dropdown";
import { Option } from "../components/Option";

describe("Dropdown", () => {
  it("renders with role listbox and children", () => {
    render(
      <Dropdown>
        <Option value="opt1" label="Option 1" />
        <Option value="opt2" label="Option 2" />
      </Dropdown>,
    );

    const listbox = screen.getByRole("listbox");
    expect(listbox).toBeInTheDocument();
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
  });

  it("calls onSelect when an option with data-value is clicked", () => {
    const onSelect = vi.fn();
    render(
      <Dropdown onSelect={onSelect}>
        <Option value="first-value" label="First" />
        <Option value="second-value" label="Second" />
      </Dropdown>,
    );

    fireEvent.click(screen.getByText("First"));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("first-value");
  });

  it("calls onSelect when clicking a child element inside an element with data-value", () => {
    const onSelect = vi.fn();
    render(
      <Dropdown onSelect={onSelect}>
        <div data-value="custom-val">
          <span data-testid="nested-span">Click inside</span>
        </div>
      </Dropdown>,
    );

    fireEvent.click(screen.getByTestId("nested-span"));
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("custom-val");
  });

  it("does not call onSelect when clicking an element without data-value", () => {
    const onSelect = vi.fn();
    render(
      <Dropdown onSelect={onSelect}>
        <div data-testid="no-val">No data-value</div>
      </Dropdown>,
    );

    fireEvent.click(screen.getByTestId("no-val"));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("handles disabled state properly", () => {
    const onSelect = vi.fn();
    render(
      <Dropdown disabled onSelect={onSelect}>
        <Option value="opt-disabled" label="Disabled Option" />
      </Dropdown>,
    );

    const listbox = screen.getByRole("listbox");
    expect(listbox).toHaveAttribute("aria-disabled", "true");
    expect(listbox).toHaveClass("cursor-not-allowed");
    expect(listbox).toHaveClass("opacity-60");

    fireEvent.click(screen.getByText("Disabled Option"));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("calls onEscape when Escape key is pressed", () => {
    const onEscape = vi.fn();
    render(
      <Dropdown onEscape={onEscape}>
        <Option value="opt" label="Opt" />
      </Dropdown>,
    );

    const listbox = screen.getByRole("listbox");
    fireEvent.keyDown(listbox, { key: "Escape" });
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it("forwards onKeyDown handler for non-escape keys", () => {
    const onKeyDown = vi.fn();
    render(
      <Dropdown onKeyDown={onKeyDown}>
        <Option value="opt" label="Opt" />
      </Dropdown>,
    );

    const listbox = screen.getByRole("listbox");
    fireEvent.keyDown(listbox, { key: "ArrowDown" });
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });

  it("forwards ref to the root listbox element", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Dropdown ref={ref}>
        <Option value="ref-opt" label="Ref Option" />
      </Dropdown>,
    );

    expect(ref.current).toBe(screen.getByRole("listbox"));
  });

  it("merges custom className and styles", () => {
    render(
      <Dropdown className="custom-dropdown-class" padding="8">
        <div>Content</div>
      </Dropdown>,
    );

    const listbox = screen.getByRole("listbox");
    expect(listbox).toHaveClass("custom-dropdown-class");
    expect(listbox).toHaveClass("p-8");
  });
});
