import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { StatusIndicator, statusIndicatorVariants } from "../components/StatusIndicator";

describe("StatusIndicator", () => {
  it("renders default status indicator with default props", () => {
    const { container } = render(<StatusIndicator />);
    const indicator = container.firstElementChild;
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveAttribute("aria-label", "blue status indicator");
    expect(indicator).toHaveClass(
      "inline-flex",
      "shrink-0",
      "w-8",
      "h-8",
      "bg-[var(--scheme-blue-700)]",
      "rounded-full",
    );
  });

  it("renders all sizes correctly", () => {
    const { container: sContainer } = render(<StatusIndicator size="s" />);
    expect(sContainer.firstElementChild).toHaveClass("w-4", "h-4");

    const { container: mContainer } = render(<StatusIndicator size="m" />);
    expect(mContainer.firstElementChild).toHaveClass("w-8", "h-8");

    const { container: lContainer } = render(<StatusIndicator size="l" />);
    expect(lContainer.firstElementChild).toHaveClass("w-16", "h-16");
  });

  it("renders all color variants correctly", () => {
    const colorCases = [
      { color: "blue", bgClass: "bg-[var(--scheme-blue-700)]" },
      { color: "indigo", bgClass: "bg-[var(--scheme-indigo-700)]" },
      { color: "violet", bgClass: "bg-[var(--scheme-violet-700)]" },
      { color: "magenta", bgClass: "bg-[var(--scheme-magenta-700)]" },
      { color: "pink", bgClass: "bg-[var(--scheme-pink-700)]" },
      { color: "red", bgClass: "bg-[var(--scheme-red-700)]" },
      { color: "orange", bgClass: "bg-[var(--scheme-orange-700)]" },
      { color: "yellow", bgClass: "bg-[var(--scheme-yellow-700)]" },
      { color: "moss", bgClass: "bg-[var(--scheme-moss-700)]" },
      { color: "green", bgClass: "bg-[var(--scheme-green-700)]" },
      { color: "emerald", bgClass: "bg-[var(--scheme-emerald-700)]" },
      { color: "aqua", bgClass: "bg-[var(--scheme-aqua-700)]" },
      { color: "cyan", bgClass: "bg-[var(--scheme-cyan-700)]" },
      { color: "gray", bgClass: "bg-[var(--scheme-gray-700)]" },
    ] as const;

    for (const { color, bgClass } of colorCases) {
      const { container } = render(<StatusIndicator color={color} />);
      expect(container.firstElementChild).toHaveClass(bgClass);
      expect(container.firstElementChild).toHaveAttribute(
        "aria-label",
        `${color} status indicator`,
      );
    }
  });

  it("supports custom ariaLabel prop", () => {
    render(<StatusIndicator ariaLabel="System operational" />);
    expect(screen.getByLabelText("System operational")).toBeInTheDocument();
  });

  it("supports direct aria-label prop override via rest props", () => {
    render(<StatusIndicator aria-label="Direct aria override" />);
    expect(screen.getByLabelText("Direct aria override")).toBeInTheDocument();
  });

  it("forwards ref to the div element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<StatusIndicator ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges custom className and style", () => {
    const { container } = render(
      <StatusIndicator className="custom-indicator-class" style={{ opacity: 0.75 }} />,
    );
    const indicator = container.firstElementChild as HTMLElement;
    expect(indicator).toHaveClass("custom-indicator-class");
    expect(indicator.style.opacity).toBe("0.75");
  });

  it("supports flex layout props", () => {
    const { container } = render(<StatusIndicator position="absolute" top="8" right="8" />);
    const indicator = container.firstElementChild;
    expect(indicator).toHaveClass("absolute", "top-8", "right-8");
  });

  it("exports statusIndicatorVariants function for composability", () => {
    const defaultClasses = statusIndicatorVariants();
    expect(defaultClasses).toContain("inline-flex");
    expect(defaultClasses).toContain("shrink-0");
    expect(defaultClasses).toContain("w-8");
    expect(defaultClasses).toContain("h-8");
    expect(defaultClasses).toContain("bg-[var(--scheme-blue-700)]");

    const customClasses = statusIndicatorVariants({ size: "s", color: "green" });
    expect(customClasses).toContain("w-4");
    expect(customClasses).toContain("h-4");
    expect(customClasses).toContain("bg-[var(--scheme-green-700)]");
  });
});
