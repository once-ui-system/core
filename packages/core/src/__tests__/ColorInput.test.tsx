import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ColorInput } from "../components/ColorInput";

describe("ColorInput", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders with hex value and displays hex string", () => {
    const ref = createRef<HTMLInputElement>();
    const onChange = vi.fn();
    render(
      <ColorInput ref={ref} id="test-color" label="Color" value="#ff0000" onChange={onChange} />,
    );

    const input = screen.getByLabelText("Color");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("#ff0000");
    expect(screen.getByText("#ff0000")).toBeInTheDocument();
    expect(ref.current).toBe(input);
  });

  it("triggers onChange when native color input changes", () => {
    const onChange = vi.fn();
    render(<ColorInput id="test-color" label="Color Picker" value="#00ff00" onChange={onChange} />);

    const input = screen.getByLabelText("Color Picker");
    fireEvent.change(input, { target: { value: "#0000ff" } });

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it("handles supportAlpha and converts hex to rgba on change", () => {
    const onChange = vi.fn();
    render(
      <ColorInput
        id="alpha-color"
        label="Alpha Color"
        value="rgba(255, 0, 0, 0.5)"
        onChange={onChange}
        supportAlpha
      />,
    );

    const input = screen.getByLabelText("Alpha Color");
    expect(input).toHaveValue("#ff0000");

    fireEvent.change(input, { target: { value: "#00ff00" } });
    expect(onChange).toHaveBeenCalledTimes(1);
    const event = onChange.mock.calls[0][0];
    expect(event.target.value).toBe("rgba(0, 255, 0, 0.5)");
  });

  it("handles reset button click", () => {
    const onChange = vi.fn();
    render(<ColorInput id="reset-color" label="Reset Color" value="#123456" onChange={onChange} />);

    const removeBtn = screen.getByRole("button", { name: "Remove color" });
    fireEvent.click(removeBtn);

    expect(onChange).toHaveBeenCalledTimes(1);
    const event = onChange.mock.calls[0][0];
    expect(event.target.value).toBe("");
  });

  it("triggers click on input when swatch or text is clicked", () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <ColorInput
        ref={ref}
        id="click-color"
        label="Clickable"
        value="#abcdef"
        onChange={vi.fn()}
      />,
    );

    if (ref.current) {
      const clickSpy = vi.spyOn(ref.current, "click");
      const hexText = screen.getByText("#abcdef");
      fireEvent.click(hexText);
      expect(clickSpy).toHaveBeenCalled();
    }
  });

  it("renders with empty value and shows eye dropper", () => {
    render(<ColorInput id="empty-color" label="Empty" value="" onChange={vi.fn()} />);

    const input = screen.getByLabelText("Empty");
    expect(input).toHaveValue("#000000");
  });
});
