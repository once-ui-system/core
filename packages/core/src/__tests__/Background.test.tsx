import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Background,
  backgroundDotsVariants,
  backgroundGradientVariants,
  backgroundGridVariants,
  backgroundLinesVariants,
  backgroundVariants,
} from "../components/Background";

describe("Background", () => {
  beforeEach(() => {
    class MockIntersectionObserver {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }

    window.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
  it("renders default background container", () => {
    const { container } = render(<Background />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toBeInTheDocument();
    expect(root).toHaveClass("w-full", "h-full", "overflow-hidden", "z-0");
  });

  it("forwards ref to the root div element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Background ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("renders children properly", () => {
    render(
      <Background>
        <div data-testid="bg-child">Background Content</div>
      </Background>,
    );
    expect(screen.getByTestId("bg-child")).toBeInTheDocument();
    expect(screen.getByText("Background Content")).toBeInTheDocument();
  });

  it("merges custom className and style", () => {
    const { container } = render(
      <Background className="custom-bg-class" style={{ opacity: 0.85 }} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("custom-bg-class", "overflow-hidden", "z-0");
    expect(root.style.opacity).toBe("0.85");
  });

  it("renders gradient layer when gradient.display is true", () => {
    const { container } = render(
      <Background
        gradient={{
          display: true,
          opacity: 50,
          x: 20,
          y: 80,
          width: 200,
          height: 100,
          tilt: 45,
          colorStart: "accent-background-strong",
          colorEnd: "accent-background-weak",
        }}
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    const gradientEl = root.firstElementChild as HTMLElement;
    expect(gradientEl).toBeInTheDocument();
    expect(gradientEl).toHaveClass("pointer-events-none", "absolute", "origin-center");
    expect(gradientEl.style.getPropertyValue("--gradient-tilt")).toBe("45deg");
    expect(gradientEl.style.getPropertyValue("--gradient-color-start")).toBe(
      "var(--accent-background-strong)",
    );
    expect(gradientEl.style.getPropertyValue("--gradient-color-end")).toBe(
      "var(--accent-background-weak)",
    );
    expect(gradientEl.style.getPropertyValue("--gradient-width")).toBe("50%");
    expect(gradientEl.style.getPropertyValue("--gradient-height")).toBe("25%");
  });

  it("renders dots layer when dots.display is true", () => {
    const { container } = render(
      <Background
        dots={{
          display: true,
          opacity: 70,
          color: "accent-on-background-weak",
          size: "32",
        }}
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    const dotsEl = root.firstElementChild as HTMLElement;
    expect(dotsEl).toBeInTheDocument();
    expect(dotsEl).toHaveClass(
      "pointer-events-none",
      "absolute",
      "top-0",
      "left-0",
      "w-full",
      "h-full",
    );
    expect(dotsEl.style.getPropertyValue("--dots-color")).toBe("var(--accent-on-background-weak)");
    expect(dotsEl.style.getPropertyValue("--dots-size")).toBe("var(--static-space-32)");
  });

  it("renders lines layer when lines.display is true", () => {
    const { container } = render(
      <Background
        lines={{
          display: true,
          opacity: 60,
          angle: 30,
          size: "16",
          thickness: 2,
          color: "neutral-border-medium",
        }}
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    const linesEl = root.firstElementChild as HTMLElement;
    expect(linesEl).toBeInTheDocument();
    expect(linesEl).toHaveClass(
      "pointer-events-none",
      "absolute",
      "top-0",
      "left-0",
      "w-full",
      "h-full",
      "bg-center",
    );
    expect(linesEl.style.getPropertyValue("--lines-angle")).toBe("30deg");
    expect(linesEl.style.getPropertyValue("--lines-thickness")).toBe("2px");
    expect(linesEl.style.getPropertyValue("--lines-color")).toBe("var(--neutral-border-medium)");
  });

  it("renders grid layer when grid.display is true", () => {
    const { container } = render(
      <Background
        grid={{
          display: true,
          opacity: 40,
          color: "brand-border-weak",
          width: "40px",
          height: "40px",
        }}
      />,
    );
    const root = container.firstElementChild as HTMLElement;
    const gridEl = root.firstElementChild as HTMLElement;
    expect(gridEl).toBeInTheDocument();
    expect(gridEl).toHaveClass(
      "pointer-events-none",
      "absolute",
      "top-0",
      "left-0",
      "w-full",
      "h-full",
    );
    expect(gridEl.style.backgroundSize).toBe("40px 40px");
    expect(gridEl.style.backgroundImage).toContain("var(--brand-border-weak)");
  });

  it("renders inside a Mask when mask prop is provided", () => {
    const { container } = render(
      <Background
        gradient={{ display: true }}
        mask={{
          radius: 60,
          x: 50,
          y: 50,
        }}
      >
        <span data-testid="masked-child">Masked</span>
      </Background>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(screen.getByTestId("masked-child")).toBeInTheDocument();
    const maskEl = root.firstElementChild as HTMLElement;
    expect(maskEl).toBeInTheDocument();
    expect(maskEl.style.getPropertyValue("--mask-radius")).toBe("60vh");
  });

  it("exports all background variant functions", () => {
    expect(backgroundVariants()).toBe("overflow-hidden z-0");
    expect(backgroundGradientVariants()).toContain("pointer-events-none");
    expect(backgroundGradientVariants()).toContain("w-[400%]");
    expect(backgroundDotsVariants()).toContain("pointer-events-none");
    expect(backgroundLinesVariants()).toContain("bg-center");
    expect(backgroundGridVariants()).toContain("w-full");
  });
});
