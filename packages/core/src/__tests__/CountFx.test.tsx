import { act, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CountFx, countFxVariants } from "../components/CountFx";

describe("CountFx", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders default CountFx with tabular-nums and inline-flex", () => {
    const { container } = render(<CountFx value={42} />);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toBeInTheDocument();
    expect(root).toHaveClass("tabular-nums", "inline-flex", "items-center");
    expect(root.textContent).toBe("42");
  });

  it("forwards ref to the root HTMLSpanElement", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<CountFx ref={ref} value={100} />);

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it("renders with custom children", () => {
    render(
      <CountFx value={50}>
        <span> USD</span>
      </CountFx>,
    );

    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("USD")).toBeInTheDocument();
  });

  it("formats value with separator", () => {
    render(<CountFx value={1234567} separator="," />);

    expect(screen.getByText("1,234,567")).toBeInTheDocument();
  });

  it("formats value with decimals", () => {
    render(<CountFx value={99.5} decimals={2} />);

    expect(screen.getByText("99.50")).toBeInTheDocument();
  });

  it("formats value with both separator and decimals", () => {
    render(<CountFx value={1234567.89} separator="," decimals={2} />);

    expect(screen.getByText("1,234,567.89")).toBeInTheDocument();
  });

  it("uses custom format function when provided", () => {
    const customFormat = (val: number) => `$${val.toFixed(0)}k`;
    render(<CountFx value={25} format={customFormat} />);

    expect(screen.getByText("$25k")).toBeInTheDocument();
  });

  it("renders wheel effect with digit columns", () => {
    const { container } = render(<CountFx value={123} effect="wheel" />);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toBeInTheDocument();
    expect(root).toHaveClass("tabular-nums");

    // Inside text container, has digit rows
    const textElement = root.firstElementChild as HTMLElement;
    expect(textElement).toHaveClass("inline-flex", "items-center", "gap-[0.1em]");
  });

  it("renders smooth effect with digit columns", () => {
    const { container } = render(<CountFx value={456} effect="smooth" />);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toBeInTheDocument();
    expect(root).toHaveClass("tabular-nums");

    const textElement = root.firstElementChild as HTMLElement;
    expect(textElement).toHaveClass("inline-flex", "items-center", "gap-[0.1em]");
  });

  it("animates value change on prop update", () => {
    let now = 1000;
    vi.spyOn(performance, "now").mockImplementation(() => now);

    const rafCallbacks: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    const { rerender } = render(<CountFx value={0} speed={1000} />);
    expect(screen.getByText("0")).toBeInTheDocument();

    rerender(<CountFx value={100} speed={1000} />);

    // First frame initializes startTime
    act(() => {
      const cb = rafCallbacks.shift();
      cb?.(now);
    });

    // Advance time and trigger next frame with intermediate progress
    now += 500;
    act(() => {
      const cb = rafCallbacks.shift();
      cb?.(now);
    });
    expect(screen.getByText("87")).toBeInTheDocument();

    // Advance time past total speed to complete animation
    now += 500;
    act(() => {
      const cb = rafCallbacks.shift();
      cb?.(now);
    });

    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("merges custom className and style", () => {
    const { container } = render(
      <CountFx value={10} className="custom-count-class" style={{ color: "rgb(255, 0, 0)" }} />,
    );
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass("custom-count-class", "tabular-nums");
    expect(root.style.color).toBe("rgb(255, 0, 0)");
  });

  it("exports countFxVariants CVA function", () => {
    expect(countFxVariants()).toBe("tabular-nums inline-flex items-center");
    expect(countFxVariants({ className: "custom-variant" })).toContain("tabular-nums");
    expect(countFxVariants({ className: "custom-variant" })).toContain("custom-variant");
  });
});
