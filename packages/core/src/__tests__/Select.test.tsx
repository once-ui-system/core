import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Select } from "../components/Select";

const mockOptions = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "orange", label: "Orange" },
];

describe("Select", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders with single selection value and placeholder", () => {
    render(
      <Select
        id="fruit-select"
        options={mockOptions}
        value="banana"
        placeholder="Select a fruit"
      />,
    );

    const input = screen.getByDisplayValue("Banana");
    expect(input).toBeInTheDocument();
  });

  it("handles option selection in single mode", () => {
    const onSelect = vi.fn();
    render(<Select id="single-select" options={mockOptions} value="apple" onSelect={onSelect} />);

    const input = screen.getByDisplayValue("Apple");
    fireEvent.focus(input);

    const bananaOption = screen.getByText("Banana");
    expect(bananaOption).toBeInTheDocument();

    fireEvent.click(bananaOption);
    expect(onSelect).toHaveBeenCalledWith("banana");
  });

  it("handles multiple selection mode", () => {
    const onSelect = vi.fn();
    render(
      <Select
        id="multi-select"
        multiple={true}
        options={mockOptions}
        value={["apple", "orange"]}
        onSelect={onSelect}
      />,
    );

    const input = screen.getByDisplayValue("2 options selected");
    expect(input).toBeInTheDocument();

    fireEvent.focus(input);
    const bananaOption = screen.getByText("Banana");
    fireEvent.click(bananaOption);

    expect(onSelect).toHaveBeenCalledWith(["apple", "orange", "banana"]);
  });

  it("supports searchable mode and filtering options", () => {
    render(<Select id="searchable-select" searchable={true} options={mockOptions} value="" />);

    const mainInput = screen.getByRole("textbox");
    fireEvent.focus(mainInput);

    const searchInput = screen.getByPlaceholderText("Search");
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "ora" } });

    expect(screen.getByText("Orange")).toBeInTheDocument();
    expect(screen.queryByText("Apple")).not.toBeInTheDocument();
  });

  it("forwards ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Select ref={ref} id="ref-select" options={mockOptions} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
