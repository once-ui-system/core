import { fireEvent, render, screen } from "@testing-library/react";
import { createRef, useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NumberInput } from "../components/NumberInput";

describe("NumberInput", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders with initial value and forwards ref", () => {
    const ref = createRef<HTMLInputElement>();
    render(<NumberInput ref={ref} id="test-number-input" value={42} />);

    const input = screen.getByRole("spinbutton");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(42);
    expect(ref.current).toBe(input);
  });

  it("increments and decrements value using stepper buttons", () => {
    const onChange = vi.fn();

    const TestComponent = () => {
      const [val, setVal] = useState<number>(10);
      return (
        <NumberInput
          id="stepper-input"
          value={val}
          step={2}
          onChange={(newVal) => {
            setVal(newVal);
            onChange(newVal);
          }}
        />
      );
    };

    render(<TestComponent />);

    const incrementBtn = screen.getByLabelText("Increment value");
    const decrementBtn = screen.getByLabelText("Decrement value");

    fireEvent.click(incrementBtn);
    expect(onChange).toHaveBeenLastCalledWith(12);

    fireEvent.click(decrementBtn);
    expect(onChange).toHaveBeenLastCalledWith(10);

    fireEvent.click(decrementBtn);
    expect(onChange).toHaveBeenLastCalledWith(8);
  });

  it("respects min and max bounds", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <NumberInput id="bounds-input" value={10} max={10} min={0} onChange={onChange} />,
    );

    const incrementBtn = screen.getByLabelText("Increment value");
    fireEvent.click(incrementBtn);
    expect(onChange).not.toHaveBeenCalled();

    rerender(<NumberInput id="bounds-input" value={0} max={10} min={0} onChange={onChange} />);

    const decrementBtn = screen.getByLabelText("Decrement value");
    fireEvent.click(decrementBtn);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("pads start with zeroes when padStart is specified", () => {
    render(<NumberInput id="pad-input" value={5} padStart={3} />);

    const input = screen.getByRole("spinbutton");
    expect(input).toHaveValue(5);
  });

  it("handles typing in input field", () => {
    const onChange = vi.fn();
    render(<NumberInput id="type-input" onChange={onChange} />);

    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "99" } });
    expect(onChange).toHaveBeenCalledWith(99);
  });
});
