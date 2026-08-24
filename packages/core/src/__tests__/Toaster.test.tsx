import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  Toaster,
  toastAnimationVariants,
  toasterContainerVariants,
  toasterVariants,
  toastWrapperVariants,
} from "../components/Toaster";
import { LayoutProvider } from "../contexts/LayoutProvider";

describe("Toaster", () => {
  const sampleToasts = [
    {
      id: "toast-1",
      variant: "success" as const,
      message: "First notification",
    },
    {
      id: "toast-2",
      variant: "danger" as const,
      message: "Second notification",
    },
  ];

  it("renders toast notifications through portal into document.body", () => {
    const handleRemove = vi.fn();
    render(
      <LayoutProvider>
        <Toaster toasts={sampleToasts} removeToast={handleRemove} />
      </LayoutProvider>,
    );

    expect(screen.getByText("First notification")).toBeInTheDocument();
    expect(screen.getByText("Second notification")).toBeInTheDocument();
  });

  it("renders with bottom position by default", () => {
    const handleRemove = vi.fn();
    const { baseElement } = render(
      <LayoutProvider>
        <Toaster toasts={sampleToasts} removeToast={handleRemove} />
      </LayoutProvider>,
    );

    const container = baseElement.querySelector("[class*='bottom-l']");
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass("fixed", "left-1/2", "-translate-x-1/2", "bottom-l");
  });

  it("renders with top position when configured", () => {
    const handleRemove = vi.fn();
    const { baseElement } = render(
      <LayoutProvider>
        <Toaster toasts={sampleToasts} removeToast={handleRemove} m="top" l="top" xl="top" />
      </LayoutProvider>,
    );

    const container = baseElement.querySelector("[class*='top-l']");
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass("fixed", "left-1/2", "-translate-x-1/2", "top-l");
  });

  it("triggers removeToast when a toast's close button is clicked", () => {
    const handleRemove = vi.fn();
    const { baseElement } = render(
      <LayoutProvider>
        <Toaster toasts={sampleToasts} removeToast={handleRemove} />
      </LayoutProvider>,
    );

    const buttons = baseElement.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
    if (buttons[0]) {
      fireEvent.click(buttons[0]);
    }
    expect(handleRemove).toHaveBeenCalledWith("toast-1");
  });

  it("forwards ref to the root Column element", () => {
    const handleRemove = vi.fn();
    const ref = createRef<HTMLDivElement>();
    render(
      <LayoutProvider>
        <Toaster ref={ref} toasts={sampleToasts} removeToast={handleRemove} />
      </LayoutProvider>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("exports CVA variant generators for composability", () => {
    const bottomContainer = toasterContainerVariants({ position: "bottom" });
    expect(bottomContainer).toContain("fixed");
    expect(bottomContainer).toContain("left-1/2");
    expect(bottomContainer).toContain("-translate-x-1/2");
    expect(bottomContainer).toContain("bottom-l");

    const topContainer = toasterContainerVariants({ position: "top" });
    expect(topContainer).toContain("top-l");

    expect(toasterVariants).toBe(toasterContainerVariants);

    const bottomWrapper = toastWrapperVariants({ position: "bottom" });
    expect(bottomWrapper).toContain("transition-[transform,opacity]");
    expect(bottomWrapper).toContain("duration-300");
    expect(bottomWrapper).toContain("bottom-0");

    const topWrapper = toastWrapperVariants({ position: "top" });
    expect(topWrapper).toContain("top-0");

    const bottomAnimation = toastAnimationVariants({ position: "bottom" });
    expect(bottomAnimation).toContain("animate-fadeInBottom");

    const topAnimation = toastAnimationVariants({ position: "top" });
    expect(topAnimation).toContain("animate-fadeInTop");
  });
});
