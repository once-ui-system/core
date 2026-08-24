import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Feedback, feedbackVariants } from "../components/Feedback";

describe("Feedback", () => {
  it("renders default info feedback with title, description, and icon", () => {
    const { container } = render(
      <Feedback title="Info Title" description="Info description text." />,
    );

    expect(screen.getByText("Info Title")).toBeInTheDocument();
    expect(screen.getByText("Info description text.")).toBeInTheDocument();

    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(alert).toHaveClass(
      "w-full",
      "rounded-l",
      "items-start",
      "bg-info-background-medium",
      "border-info-border-medium",
    );

    // Icon should be present by default
    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });

  it("renders without icon when icon={false}", () => {
    const { container } = render(
      <Feedback icon={false} title="No Icon" description="Feedback without icon" />,
    );
    expect(screen.getByText("No Icon")).toBeInTheDocument();
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("renders all variants with correct classes", () => {
    const variants = [
      {
        variant: "info",
        bgClass: "bg-info-background-medium",
        borderClass: "border-info-border-medium",
      },
      {
        variant: "danger",
        bgClass: "bg-danger-background-medium",
        borderClass: "border-danger-border-medium",
      },
      {
        variant: "warning",
        bgClass: "bg-warning-background-medium",
        borderClass: "border-warning-border-medium",
      },
      {
        variant: "success",
        bgClass: "bg-success-background-medium",
        borderClass: "border-success-border-medium",
      },
    ] as const;

    for (const { variant, bgClass, borderClass } of variants) {
      render(
        <Feedback
          data-testid={`feedback-${variant}`}
          variant={variant}
          title={`${variant} title`}
        />,
      );
      const feedbackEl = screen.getByTestId(`feedback-${variant}`);
      expect(feedbackEl).toHaveClass(bgClass, borderClass);
    }
  });

  it("renders close button and calls onClose when clicked", () => {
    const handleClose = vi.fn();
    render(
      <Feedback
        title="Closable"
        description="Click close button"
        showCloseButton={true}
        onClose={handleClose}
      />,
    );

    const closeBtn = screen.getByRole("button", { name: /Close alert/i });
    expect(closeBtn).toBeInTheDocument();

    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("renders children content", () => {
    render(
      <Feedback title="Parent">
        <button type="button">Action Button</button>
      </Feedback>,
    );
    expect(screen.getByRole("button", { name: "Action Button" })).toBeInTheDocument();
  });

  it("forwards ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Feedback ref={ref} title="Ref Feedback" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges custom className and style", () => {
    render(
      <Feedback
        data-testid="styled-feedback"
        className="custom-feedback-class"
        style={{ opacity: 0.95 }}
      />,
    );
    const feedbackEl = screen.getByTestId("styled-feedback");
    expect(feedbackEl).toHaveClass("custom-feedback-class");
    expect(feedbackEl.style.opacity).toBe("0.95");
  });

  it("exports feedbackVariants function for composability", () => {
    const infoClasses = feedbackVariants({ variant: "info" });
    expect(infoClasses).toContain("bg-info-background-medium");
    expect(infoClasses).toContain("border-info-border-medium");

    const dangerClasses = feedbackVariants({ variant: "danger" });
    expect(dangerClasses).toContain("bg-danger-background-medium");
    expect(dangerClasses).toContain("border-danger-border-medium");
  });
});
