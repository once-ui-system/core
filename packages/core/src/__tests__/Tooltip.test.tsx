import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Tooltip } from "../components/Tooltip";

describe("Tooltip", () => {
  it("renders default tooltip with label and role", () => {
    render(<Tooltip label="Sample tooltip text" />);
    const tooltip = screen.getByRole("tooltip");

    expect(tooltip).toBeInTheDocument();
    expect(screen.getByText("Sample tooltip text")).toBeInTheDocument();
    expect(tooltip).toHaveClass("animate-fadeIn", "select-none", "whitespace-nowrap");
  });

  it("renders ReactNode label content", () => {
    render(<Tooltip label={<span data-testid="custom-label">Custom JSX Label</span>} />);
    expect(screen.getByTestId("custom-label")).toBeInTheDocument();
    expect(screen.getByText("Custom JSX Label")).toBeInTheDocument();
  });

  it("renders prefix and suffix icons", () => {
    const { container } = render(
      <Tooltip label="Tooltip with icons" prefixIcon="info" suffixIcon="chevronRight" />,
    );
    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBe(2);
  });

  it("forwards ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Tooltip ref={ref} label="Ref test" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current?.getAttribute("role")).toBe("tooltip");
  });

  it("merges custom className and style", () => {
    render(
      <Tooltip label="Custom styling" className="custom-tooltip-class" style={{ opacity: 0.8 }} />,
    );
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveClass("custom-tooltip-class", "animate-fadeIn");
    expect(tooltip.style.opacity).toBe("0.8");
  });

  it("passes flex/row props correctly", () => {
    render(<Tooltip label="Custom props" background="brand-medium" radius="l" padding="12" />);
    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveClass("bg-brand-background-medium", "rounded-l", "p-12");
  });
});
