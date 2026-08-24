import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Pulse, pulseVariants } from "../components/Pulse";

describe("Pulse", () => {
  it("renders default pulse with default classes", () => {
    const { container } = render(<Pulse />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute("data-solid", "color");
    expect(root).toHaveClass("relative", "items-center", "justify-center", "min-w-24", "min-h-24");

    // Outer pulse wave container and dot
    const waveContainer = root.children[0] as HTMLElement;
    expect(waveContainer).toHaveClass(
      "absolute",
      "left-1/2",
      "top-1/2",
      "-translate-x-1/2",
      "-translate-y-1/2",
    );

    const waveDot = waveContainer.firstElementChild as HTMLElement;
    expect(waveDot).toHaveClass(
      "origin-center",
      "pointer-events-none",
      "animate-pulse",
      "rounded-full",
      "w-48",
      "h-48",
      "bg-brand-solid-medium",
    );

    // Inner center dot
    const centerDot = root.children[1] as HTMLElement;
    expect(centerDot).toHaveClass("rounded-full", "min-w-8", "min-h-8", "bg-brand-solid-strong");
  });

  it("forwards ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Pulse ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("renders children when provided", () => {
    render(
      <Pulse>
        <span data-testid="pulse-child">Status Active</span>
      </Pulse>,
    );
    expect(screen.getByTestId("pulse-child")).toBeInTheDocument();
    expect(screen.getByText("Status Active")).toBeInTheDocument();
  });

  it("renders small size correctly", () => {
    const { container } = render(<Pulse size="s" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("min-w-16", "min-h-16");

    const waveDot = root.children[0].firstElementChild as HTMLElement;
    expect(waveDot).toHaveClass("w-32", "h-32");

    const centerDot = root.children[1] as HTMLElement;
    expect(centerDot).toHaveClass("min-w-4", "min-h-4");
  });

  it("renders large size correctly", () => {
    const { container } = render(<Pulse size="l" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("min-w-32", "min-h-32");

    const waveDot = root.children[0].firstElementChild as HTMLElement;
    expect(waveDot).toHaveClass("w-64", "h-64");

    const centerDot = root.children[1] as HTMLElement;
    expect(centerDot).toHaveClass("min-w-12", "min-h-12");
  });

  it("renders different color variants", () => {
    const { container } = render(<Pulse variant="danger" />);
    const root = container.firstElementChild as HTMLElement;

    const waveDot = root.children[0].firstElementChild as HTMLElement;
    expect(waveDot).toHaveClass("bg-danger-solid-medium");

    const centerDot = root.children[1] as HTMLElement;
    expect(centerDot).toHaveClass("bg-danger-solid-strong");
  });

  it("applies custom pulseSize as number", () => {
    const { container } = render(<Pulse pulseSize={80} />);
    const root = container.firstElementChild as HTMLElement;
    const waveDot = root.children[0].firstElementChild as HTMLElement;
    expect(waveDot.style.width).toBe("80px");
    expect(waveDot.style.height).toBe("80px");
  });

  it("applies custom pulseSize as string", () => {
    const { container } = render(<Pulse pulseSize="4rem" />);
    const root = container.firstElementChild as HTMLElement;
    const waveDot = root.children[0].firstElementChild as HTMLElement;
    expect(waveDot.style.width).toBe("4rem");
    expect(waveDot.style.height).toBe("4rem");
  });

  it("merges custom className and style", () => {
    const { container } = render(<Pulse className="custom-pulse-class" style={{ zIndex: 5 }} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("custom-pulse-class");
    expect(root.style.zIndex).toBe("5");
  });

  it("generates correct classes from pulseVariants", () => {
    expect(pulseVariants({ size: "s" })).toContain("min-w-16 min-h-16");
    expect(pulseVariants({ size: "m" })).toContain("min-w-24 min-h-24");
    expect(pulseVariants({ size: "l" })).toContain("min-w-32 min-h-32");
  });
});
