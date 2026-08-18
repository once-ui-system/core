import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TagInput } from "../components/TagInput";

describe("TagInput", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders with tag chips and forwards ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <TagInput
        ref={ref}
        id="test-tags"
        value={["react", "typescript"]}
        onChange={() => {}}
        placeholder="Add tag"
      />,
    );

    expect(screen.getByText("react")).toBeInTheDocument();
    expect(screen.getByText("typescript")).toBeInTheDocument();
    const input = screen.getByPlaceholderText("Add tag");
    expect(ref.current).toBe(input);
  });

  it("adds tag on Enter and comma", () => {
    const onChange = vi.fn();
    render(<TagInput id="add-tags" value={["design"]} onChange={onChange} placeholder="Add tag" />);

    const input = screen.getByPlaceholderText("Add tag");

    fireEvent.change(input, { target: { value: "systems" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith(["design", "systems"]);

    fireEvent.change(input, { target: { value: "ui" } });
    fireEvent.keyDown(input, { key: "," });
    expect(onChange).toHaveBeenCalledWith(["design", "ui"]);
  });

  it("removes tag when chip remove button is clicked", () => {
    const onChange = vi.fn();
    render(<TagInput id="remove-tags" value={["apple", "banana", "cherry"]} onChange={onChange} />);

    // Find the chip containing "banana" and click its remove button
    const bananaText = screen.getByText("banana");
    const chip = bananaText.closest("[role='button']") as HTMLElement;
    const removeBtn = chip.querySelector("button") as HTMLButtonElement;
    fireEvent.click(removeBtn);

    expect(onChange).toHaveBeenCalledWith(["apple", "cherry"]);
  });

  it("does not add empty tags", () => {
    const onChange = vi.fn();
    render(
      <TagInput id="empty-tags" value={["first"]} onChange={onChange} placeholder="Add tag" />,
    );

    const input = screen.getByPlaceholderText("Add tag");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).not.toHaveBeenCalled();
  });
});
