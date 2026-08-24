import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toast, toastVariants } from "../components/Toast";

describe("Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders toast message with default icon and accessibility attributes", () => {
    const { container } = render(<Toast variant="success">Operation completed successfully</Toast>);

    expect(screen.getByText("Operation completed successfully")).toBeInTheDocument();
    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(alert).toHaveClass("transition-[opacity,transform]", "duration-300", "opacity-100");
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders correct icons for each variant", () => {
    const variants = ["success", "danger", "warning", "info"] as const;

    for (const variant of variants) {
      const { container } = render(<Toast variant={variant}>{variant} message</Toast>);
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
    }
  });

  it("hides icon when icon={false}", () => {
    const { container } = render(
      <Toast variant="info" icon={false}>
        No icon message
      </Toast>,
    );

    expect(screen.getByText("No icon message")).toBeInTheDocument();
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("renders action element when provided", () => {
    render(
      <Toast variant="warning" action={<button type="button">Retry</button>}>
        Action toast
      </Toast>,
    );

    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("renders close button and triggers onClose when clicked", () => {
    const handleClose = vi.fn();
    const { container } = render(
      <Toast variant="danger" onClose={handleClose}>
        Closeable toast
      </Toast>,
    );

    const closeButton = container.querySelector("button");
    expect(closeButton).toBeInTheDocument();
    if (closeButton) {
      fireEvent.click(closeButton);
    }
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("automatically calls onClose after 6000ms timeout", () => {
    const handleClose = vi.fn();
    render(
      <Toast variant="info" onClose={handleClose}>
        Auto-dismiss toast
      </Toast>,
    );

    expect(handleClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(6000);
    });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("forwards ref to div element", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Toast ref={ref} variant="success">
        Ref test
      </Toast>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges custom className and style", () => {
    const { container } = render(
      <Toast variant="info" className="custom-toast-class" style={{ zIndex: 99 }}>
        Custom styling
      </Toast>,
    );

    const alert = container.firstElementChild as HTMLElement;
    expect(alert).toHaveClass("custom-toast-class");
    expect(alert.style.zIndex).toBe("99");
  });

  it("exports toastVariants function for composability", () => {
    const visibleClasses = toastVariants({ visible: true });
    expect(visibleClasses).toContain("transition-[opacity,transform]");
    expect(visibleClasses).toContain("duration-300");
    expect(visibleClasses).toContain("opacity-100");

    const hiddenClasses = toastVariants({ visible: false });
    expect(hiddenClasses).toContain("opacity-0");
  });
});
