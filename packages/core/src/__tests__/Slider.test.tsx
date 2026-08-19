import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Slider } from "../components/Slider";

describe("Slider", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders slider input with correct attributes", () => {
    const ref = createRef<HTMLInputElement>();
    const onChange = vi.fn();
    render(
      <Slider
        ref={ref}
        value={50}
        onChange={onChange}
        min={0}
        max={100}
        step={5}
        label="Volume"
        showValue
      />,
    );

    const input = screen.getByRole("slider", { name: "Volume" });
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("50");
    expect(input).toHaveAttribute("min", "0");
    expect(input).toHaveAttribute("max", "100");
    expect(input).toHaveAttribute("step", "5");
    expect(input).toHaveAttribute("aria-valuenow", "50");
    expect(ref.current).toBe(input);

    expect(screen.getByText("Volume")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
  });

  it("calls onChange when slider value changes", () => {
    const onChange = vi.fn();
    render(<Slider value={25} onChange={onChange} min={0} max={100} label="Brightness" />);

    const input = screen.getByRole("slider", { name: "Brightness" });
    fireEvent.change(input, { target: { value: "75" } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(75);
  });

  it("handles dragging state transitions on mouse down and up", () => {
    const onChange = vi.fn();
    const { container } = render(<Slider value={30} onChange={onChange} />);

    const input = screen.getByRole("slider");
    fireEvent.mouseDown(input);

    // After mouse down, dragging is true -> cursor-grabbing is applied
    const sliderRow = container.querySelector(".group\\/slider");
    expect(sliderRow).toHaveClass("cursor-grabbing");

    fireEvent.mouseUp(window);
    expect(sliderRow).not.toHaveClass("cursor-grabbing");
  });

  it("handles dragging state transitions on touch start and end", () => {
    const onChange = vi.fn();
    const { container } = render(<Slider value={30} onChange={onChange} />);

    const input = screen.getByRole("slider");
    fireEvent.touchStart(input);

    const sliderRow = container.querySelector(".group\\/slider");
    expect(sliderRow).toHaveClass("cursor-grabbing");

    fireEvent.touchEnd(window);
    expect(sliderRow).not.toHaveClass("cursor-grabbing");
  });

  it("disables input and interaction when disabled is true", () => {
    const onChange = vi.fn();
    const { container } = render(<Slider value={40} onChange={onChange} disabled label="Locked" />);

    const input = screen.getByRole("slider", { name: "Locked" });
    expect(input).toBeDisabled();

    fireEvent.mouseDown(input);
    const sliderRow = container.querySelector(".group\\/slider");
    expect(sliderRow).toHaveClass("opacity-40");
    expect(sliderRow).toHaveClass("cursor-not-allowed");
  });

  it("renders custom className and style on root container", () => {
    const { container } = render(
      <Slider
        value={10}
        onChange={vi.fn()}
        className="custom-slider-class"
        style={{ zIndex: 10 }}
      />,
    );

    expect(container.firstChild).toHaveClass("custom-slider-class");
    expect(container.firstChild).toHaveStyle({ zIndex: "10" });
  });

  it("safely handles edge case when max is equal to min", () => {
    render(<Slider value={10} onChange={vi.fn()} min={10} max={10} label="Edge" />);
    expect(screen.getByRole("slider", { name: "Edge" })).toBeInTheDocument();
  });
});
