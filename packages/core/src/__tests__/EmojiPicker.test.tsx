import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EmojiPicker, EmojiPickerDropdown } from "../components";

describe("EmojiPicker", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders with search input and default smiley category emojis", () => {
    const handleSelect = vi.fn();
    render(<EmojiPicker onSelect={handleSelect} />);

    expect(screen.getByTestId("emoji-picker")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search emojis")).toBeInTheDocument();

    const emojiButtons = screen.getAllByRole("gridcell");
    expect(emojiButtons.length).toBeGreaterThan(0);
    // Default category 'smileys' should include grinning face 😀
    expect(screen.getByRole("gridcell", { name: "grinning face" })).toBeInTheDocument();
  });

  it("selects an emoji on click and triggers onSelect and onClose", () => {
    const handleSelect = vi.fn();
    const handleClose = vi.fn();
    render(<EmojiPicker onSelect={handleSelect} onClose={handleClose} />);

    const grinningFaceBtn = screen.getByRole("gridcell", { name: "grinning face" });
    fireEvent.click(grinningFaceBtn);

    expect(handleSelect).toHaveBeenCalledWith("😀");
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("switches category via SegmentedControl", () => {
    render(<EmojiPicker onSelect={vi.fn()} />);

    // Switch to animals category tab
    const tabs = screen.getAllByRole("tab");
    expect(tabs.length).toBeGreaterThan(1);

    // Click animals tab (second tab)
    fireEvent.click(tabs[1]);

    // Animals category should show hamster 🐹
    expect(screen.getByRole("gridcell", { name: "hamster" })).toBeInTheDocument();
  });

  it("filters emojis by search query after debounce", () => {
    render(<EmojiPicker onSelect={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText("Search emojis");
    fireEvent.change(searchInput, { target: { value: "hamster" } });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(screen.getByRole("gridcell", { name: "hamster" })).toBeInTheDocument();
    // Non-matching emojis from smileys should not be shown
    expect(screen.queryByRole("gridcell", { name: "grinning face" })).not.toBeInTheDocument();
  });

  it("displays 'No results found' when no emojis match search query", () => {
    render(<EmojiPicker onSelect={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText("Search emojis");
    fireEvent.change(searchInput, { target: { value: "nonexistentemojitermxyz" } });

    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(screen.getByText("No results found")).toBeInTheDocument();
  });

  it("hides category control when search query is active and restores when cleared", () => {
    render(<EmojiPicker onSelect={vi.fn()} />);

    const searchInput = screen.getByPlaceholderText("Search emojis");

    // Initially category tabs are present
    expect(screen.getAllByRole("tab").length).toBeGreaterThan(0);

    fireEvent.change(searchInput, { target: { value: "hamster" } });
    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(screen.queryAllByRole("tab")).toHaveLength(0);

    fireEvent.change(searchInput, { target: { value: "" } });
    act(() => {
      vi.advanceTimersByTime(350);
    });

    expect(screen.getAllByRole("tab").length).toBeGreaterThan(0);
  });

  it("supports keyboard navigation across grid cells", () => {
    const handleSelect = vi.fn();
    render(<EmojiPicker onSelect={handleSelect} columns="4" />);

    const grid = screen.getByRole("grid");
    const emojiButtons = screen.getAllByRole("gridcell");

    // Focus on first button
    fireEvent.focus(emojiButtons[0]);

    // ArrowRight moves to next item
    fireEvent.keyDown(grid, { key: "ArrowRight" });
    expect(emojiButtons[1]).toHaveFocus();

    // ArrowDown moves down by 4 items (column count)
    fireEvent.keyDown(grid, { key: "ArrowDown" });
    expect(emojiButtons[5]).toHaveFocus();

    // ArrowUp moves up by 4 items
    fireEvent.keyDown(grid, { key: "ArrowUp" });
    expect(emojiButtons[1]).toHaveFocus();

    // ArrowLeft moves back to first item
    fireEvent.keyDown(grid, { key: "ArrowLeft" });
    expect(emojiButtons[0]).toHaveFocus();

    // Enter selects the currently focused item
    fireEvent.keyDown(grid, { key: "Enter" });
    expect(handleSelect).toHaveBeenCalledWith(emojiButtons[0].textContent?.trim());
  });

  it("forwards ref to the outer container element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<EmojiPicker ref={ref} onSelect={vi.fn()} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges custom className and style", () => {
    render(
      <EmojiPicker onSelect={vi.fn()} className="custom-picker-class" style={{ zIndex: 100 }} />,
    );

    const picker = screen.getByTestId("emoji-picker");
    expect(picker).toHaveClass("custom-picker-class");
    expect(picker).toHaveStyle({ zIndex: "100" });
  });
});

describe("EmojiPickerDropdown", () => {
  it("renders trigger and forwards ref", () => {
    const ref = createRef<HTMLDivElement>();
    const handleSelect = vi.fn();

    render(
      <EmojiPickerDropdown
        ref={ref}
        trigger={<button type="button">Open Picker</button>}
        onSelect={handleSelect}
      />,
    );

    expect(screen.getByText("Open Picker")).toBeInTheDocument();
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
