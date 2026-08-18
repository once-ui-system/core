import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { RadioButton } from "../components/RadioButton";

describe("RadioButton", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders uncontrolled radio button and toggles checked state on click", () => {
    const ref = createRef<HTMLInputElement>();
    render(<RadioButton ref={ref} label="Option A" value="option-a" name="radio-group" />);

    const hiddenInput = ref.current as HTMLInputElement;
    expect(hiddenInput).not.toBeChecked();

    const visualRadio = screen.getByRole("radio", { name: "Option A" });
    fireEvent.click(visualRadio);

    expect(hiddenInput).toBeChecked();
  });

  it("handles controlled isChecked and onToggle", () => {
    const onToggle = vi.fn();
    render(
      <RadioButton
        isChecked={true}
        onToggle={onToggle}
        label="Controlled Radio"
        value="controlled"
      />,
    );

    const radio = screen.getByRole("radio", { name: "Controlled Radio" });
    expect(radio).toHaveAttribute("aria-checked", "true");

    fireEvent.click(radio);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("handles keyboard Enter and Space keys", () => {
    const onToggle = vi.fn();
    render(<RadioButton onToggle={onToggle} label="Key test" />);

    const radio = screen.getByRole("radio", { name: "Key test" });

    fireEvent.keyDown(radio, { key: "Enter" });
    expect(onToggle).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(radio, { key: " " });
    expect(onToggle).toHaveBeenCalledTimes(2);
  });

  it("does not toggle when disabled", () => {
    const onToggle = vi.fn();
    render(<RadioButton disabled={true} onToggle={onToggle} label="Disabled Item" />);

    const radio = screen.getByRole("radio", { name: "Disabled Item" });
    fireEvent.click(radio);
    expect(onToggle).not.toHaveBeenCalled();

    fireEvent.keyDown(radio, { key: "Enter" });
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("renders description and handles disabled styling", () => {
    render(
      <RadioButton
        label="With Description"
        description="Detailed explanation here"
        disabled={true}
      />,
    );

    expect(screen.getByText("With Description")).toBeInTheDocument();
    expect(screen.getByText("Detailed explanation here")).toBeInTheDocument();
  });
});
