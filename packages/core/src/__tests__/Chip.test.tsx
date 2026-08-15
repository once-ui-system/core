import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Chip, chipVariants } from "../components/Chip";

describe("Chip", () => {
  it("renders default selected chip with label", () => {
    const { container } = render(<Chip label="React" />);
    const chip = screen.getByRole("button", { name: "React" });
    expect(chip).toBeInTheDocument();
    expect(chip).toHaveAttribute("aria-pressed", "true");
    expect(container.firstElementChild).toHaveClass(
      "bg-brand-alpha-medium",
      "text-brand-on-background-medium",
      "rounded-full",
      "cursor-interactive",
    );
  });

  it("renders unselected chip correctly", () => {
    const { container } = render(<Chip label="TypeScript" selected={false} />);
    const chip = screen.getByRole("button", { name: "TypeScript" });
    expect(chip).toHaveAttribute("aria-pressed", "false");
    expect(container.firstElementChild).toHaveClass(
      "bg-neutral-alpha-weak",
      "text-neutral-on-background-medium",
    );
  });

  it("calls onClick when clicked", () => {
    const handleClick = vi.fn();
    render(<Chip label="Clickable" onClick={handleClick} />);

    const chip = screen.getByRole("button", { name: "Clickable" });
    fireEvent.click(chip);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("calls onClick on Enter or Space key down", () => {
    const handleClick = vi.fn();
    render(<Chip label="Keyboard" onClick={handleClick} />);

    const chip = screen.getByRole("button", { name: "Keyboard" });
    fireEvent.keyDown(chip, { key: "Enter" });
    expect(handleClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(chip, { key: " " });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it("renders prefix icon", () => {
    const { container } = render(<Chip label="With Icon" prefixIcon="calendar" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders remove button and calls onRemove without triggering onClick", () => {
    const handleClick = vi.fn();
    const handleRemove = vi.fn();
    render(<Chip label="Removable" onClick={handleClick} onRemove={handleRemove} />);

    const removeBtn = screen.getByRole("button", { name: "Remove" });
    expect(removeBtn).toBeInTheDocument();

    fireEvent.click(removeBtn);
    expect(handleRemove).toHaveBeenCalledTimes(1);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("supports custom iconButtonProps on remove button", () => {
    const handleRemove = vi.fn();
    render(
      <Chip
        label="Custom Remove"
        onRemove={handleRemove}
        iconButtonProps={{
          icon: "trash",
          tooltip: "Delete",
        }}
      />,
    );

    const deleteBtn = screen.getByRole("button", { name: "Delete" });
    expect(deleteBtn).toBeInTheDocument();
    fireEvent.click(deleteBtn);
    expect(handleRemove).toHaveBeenCalledTimes(1);
  });

  it("renders children when provided", () => {
    render(<Chip>Children Content</Chip>);
    expect(screen.getByText("Children Content")).toBeInTheDocument();
  });

  it("forwards ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Chip ref={ref} label="Ref Chip" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges custom className and style", () => {
    const { container } = render(
      <Chip label="Custom" className="chip-custom" style={{ opacity: 0.9 }} />,
    );
    expect(container.firstElementChild).toHaveClass("chip-custom");
    expect((container.firstElementChild as HTMLElement).style.opacity).toBe("0.9");
  });

  it("exports chipVariants function for composability", () => {
    const selectedClasses = chipVariants({ selected: true });
    expect(selectedClasses).toContain("bg-brand-alpha-medium");
    expect(selectedClasses).toContain("text-brand-on-background-medium");

    const unselectedClasses = chipVariants({ selected: false });
    expect(unselectedClasses).toContain("bg-neutral-alpha-weak");
    expect(unselectedClasses).toContain("text-neutral-on-background-medium");
  });
});
