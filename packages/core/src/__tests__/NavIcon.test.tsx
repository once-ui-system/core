import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { NavIcon } from "../components/NavIcon";

describe("NavIcon", () => {
  it("renders default inactive NavIcon with default structure and classes", () => {
    render(<NavIcon data-testid="nav-icon" />);
    const navIcon = screen.getByTestId("nav-icon");

    expect(navIcon).toBeInTheDocument();
    expect(navIcon).toHaveAttribute("tabindex", "0");
    expect(navIcon).toHaveClass(
      "w-40",
      "h-40",
      "min-h-40",
      "min-w-40",
      "rounded-m",
      "relative",
      "cursor-interactive",
    );

    const lines = navIcon.querySelectorAll(":scope > div");
    expect(lines.length).toBe(2);

    // First line inactive
    expect(lines[0]).toHaveClass(
      "absolute",
      "left-1/2",
      "top-1/2",
      "-translate-x-1/2",
      "-translate-y-4",
      "h-px",
      "w-24",
      "bg-neutral-on-background-strong",
      "transition-transform",
      "duration-300",
    );

    // Second line inactive
    expect(lines[1]).toHaveClass(
      "absolute",
      "left-1/2",
      "top-1/2",
      "-translate-x-1/2",
      "translate-y-4",
      "h-px",
      "w-24",
      "bg-neutral-on-background-strong",
      "transition-transform",
      "duration-300",
    );
  });

  it("renders active state when isActive is true", () => {
    render(<NavIcon data-testid="nav-icon" isActive={true} />);
    const navIcon = screen.getByTestId("nav-icon");
    const lines = navIcon.querySelectorAll(":scope > div");

    expect(lines.length).toBe(2);

    // First line active
    expect(lines[0]).toHaveClass("-translate-x-1/2", "translate-y-0", "rotate-45");
    expect(lines[0]).not.toHaveClass("-translate-y-4");

    // Second line active
    expect(lines[1]).toHaveClass("-translate-x-1/2", "translate-y-0", "-rotate-45");
    expect(lines[1]).not.toHaveClass("translate-y-4");
  });

  it("handles onClick handler", () => {
    const handleClick = vi.fn();
    render(<NavIcon onClick={handleClick} data-testid="nav-icon" />);
    const navIcon = screen.getByTestId("nav-icon");

    fireEvent.click(navIcon);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("forwards ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<NavIcon ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current?.getAttribute("tabindex")).toBe("0");
  });

  it("merges custom className and style", () => {
    render(
      <NavIcon
        data-testid="nav-icon"
        className="custom-nav-icon-class"
        style={{ opacity: 0.75 }}
      />,
    );
    const navIcon = screen.getByTestId("nav-icon");
    expect(navIcon).toHaveClass("custom-nav-icon-class");
    expect(navIcon.style.opacity).toBe("0.75");
  });

  it("passes flex props correctly", () => {
    render(<NavIcon data-testid="nav-icon" radius="full" background="brand-medium" />);
    const navIcon = screen.getByTestId("nav-icon");
    expect(navIcon).toHaveClass("rounded-full", "bg-brand-background-medium");
  });
});
