import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { InteractiveDetails } from "../components/InteractiveDetails";

describe("InteractiveDetails", () => {
  it("renders label with default styling when enabled", () => {
    render(<InteractiveDetails label="Enable notifications" />);
    const labelEl = screen.getByText("Enable notifications");
    expect(labelEl).toBeInTheDocument();
    expect(labelEl).toHaveClass(
      "text-neutral-on-background-strong",
      "font-label",
      "font-default",
      "font-m",
    );
  });

  it("renders disabled state with muted label and not-allowed cursor", () => {
    const { container } = render(<InteractiveDetails label="Disabled option" disabled={true} />);
    const labelEl = screen.getByText("Disabled option");
    expect(labelEl).toHaveClass("text-neutral-on-background-weak");
    expect(container.firstElementChild).toHaveClass("cursor-not-allowed");
  });

  it("renders description when provided", () => {
    render(
      <InteractiveDetails
        label="Main feature"
        description="Detailed description for the feature"
      />,
    );
    expect(screen.getByText("Main feature")).toBeInTheDocument();
    const descEl = screen.getByText("Detailed description for the feature");
    expect(descEl).toBeInTheDocument();
    expect(descEl).toHaveClass(
      "text-neutral-on-background-weak",
      "font-body",
      "font-default",
      "font-s",
    );
  });

  it("does not render description when omitted", () => {
    const { container } = render(<InteractiveDetails label="Only label" />);
    expect(screen.getByText("Only label")).toBeInTheDocument();
    expect(container.querySelectorAll("span").length).toBe(1);
  });

  it("renders help tooltip icon button when iconButtonProps.tooltip is provided", () => {
    render(
      <InteractiveDetails
        label="With Help"
        iconButtonProps={{
          tooltip: "Helpful info",
          tooltipPosition: "right",
        }}
      />,
    );
    expect(screen.getByText("With Help")).toBeInTheDocument();
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
  });

  it("fires onClick handler when container is clicked", () => {
    const handleClick = vi.fn();
    const { container } = render(<InteractiveDetails label="Clickable" onClick={handleClick} />);
    const root = container.firstElementChild as HTMLElement;
    fireEvent.click(root);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("stops event propagation when help icon button is clicked", () => {
    const handleContainerClick = vi.fn();
    const handleIconClick = vi.fn();
    render(
      <InteractiveDetails
        label="With Actionable Help"
        onClick={handleContainerClick}
        iconButtonProps={{
          tooltip: "Help text",
          onClick: handleIconClick,
        }}
      />,
    );
    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(handleIconClick).toHaveBeenCalledTimes(1);
    expect(handleContainerClick).not.toHaveBeenCalled();
  });

  it("forwards ref to root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<InteractiveDetails ref={ref} label="With Ref" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("applies custom id, className, and style", () => {
    const { container } = render(
      <InteractiveDetails
        id="custom-id"
        className="custom-details-class"
        style={{ opacity: 0.85 }}
        label="Customized"
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("id", "custom-id");
    expect(root).toHaveClass("custom-details-class");
    expect(root.style.opacity).toBe("0.85");
  });

  it("renders children when provided", () => {
    render(
      <InteractiveDetails label="With Extra">
        <div data-testid="extra-child">Extra Content</div>
      </InteractiveDetails>,
    );
    expect(screen.getByTestId("extra-child")).toBeInTheDocument();
  });
});
