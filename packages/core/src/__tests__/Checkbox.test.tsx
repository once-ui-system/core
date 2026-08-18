import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Checkbox } from "../components/Checkbox";

describe("Checkbox", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders uncontrolled checkbox and toggles checked state on click", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox ref={ref} label="Accept Terms" />);

    const hiddenInput = ref.current as HTMLInputElement;
    expect(hiddenInput).not.toBeChecked();

    const visualCheckbox = screen.getByRole("checkbox", { name: "Accept Terms" });
    fireEvent.click(visualCheckbox);

    expect(hiddenInput).toBeChecked();
  });

  it("handles controlled isChecked and onToggle", () => {
    const onToggle = vi.fn();
    render(<Checkbox isChecked={true} onToggle={onToggle} label="Controlled Checkbox" />);

    const checkbox = screen.getByRole("checkbox", { name: "Controlled Checkbox" });
    expect(checkbox).toHaveAttribute("aria-checked", "true");

    fireEvent.click(checkbox);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("handles indeterminate state", () => {
    render(<Checkbox isIndeterminate={true} label="Select All" />);

    const checkbox = screen.getByRole("checkbox", { name: "Select All" });
    expect(checkbox).toHaveAttribute("aria-checked", "mixed");
  });

  it("handles keyboard Enter and Space keys", () => {
    const onToggle = vi.fn();
    render(<Checkbox onToggle={onToggle} label="Key test" />);

    const checkbox = screen.getByRole("checkbox", { name: "Key test" });

    fireEvent.keyDown(checkbox, { key: "Enter" });
    expect(onToggle).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(checkbox, { key: " " });
    expect(onToggle).toHaveBeenCalledTimes(2);
  });

  it("does not toggle when disabled", () => {
    const onToggle = vi.fn();
    render(<Checkbox disabled={true} onToggle={onToggle} label="Disabled Item" />);

    const checkbox = screen.getByRole("checkbox", { name: "Disabled Item" });
    fireEvent.click(checkbox);
    expect(onToggle).not.toHaveBeenCalled();

    fireEvent.keyDown(checkbox, { key: "Enter" });
    expect(onToggle).not.toHaveBeenCalled();
  });
});
