import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Slider } from "../components/Slider";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

/**
 * Slider is a styled native range input, so the browser owns pointer and
 * keyboard stepping. What the component owns: it reports numbers rather than
 * strings, it is controlled by `value`, the drawn fill and thumb follow the
 * value within `min`/`max`, and `disabled` reaches the input.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const ControlledSlider = (props: Partial<React.ComponentProps<typeof Slider>>) => {
  const [value, setValue] = useState(20);
  return <Slider aria-label="Volume" value={value} onValueChange={setValue} {...props} />;
};

describe("Slider", () => {
  it("renders a range input with the value, bounds and step", () => {
    render(
      <Slider aria-label="Volume" value={30} onValueChange={vi.fn()} min={10} max={50} step={5} />,
      {
        wrapper,
      },
    );
    const slider = screen.getByRole("slider", { name: "Volume" }) as HTMLInputElement;
    expect(slider.value).toBe("30");
    expect(slider).toHaveAttribute("min", "10");
    expect(slider).toHaveAttribute("max", "50");
    expect(slider).toHaveAttribute("step", "5");
  });

  it("reports the new value as a number", () => {
    const onChange = vi.fn();
    render(<Slider aria-label="Volume" value={30} onValueChange={onChange} step={0.5} />, {
      wrapper,
    });
    fireEvent.change(screen.getByRole("slider"), { target: { value: "42.5" } });
    expect(onChange).toHaveBeenCalledWith(42.5);
  });

  it("is controlled: the input shows `value`, not the last change, until the parent updates it", () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Slider aria-label="Volume" value={30} onValueChange={onChange} />,
      {
        wrapper,
      },
    );
    const slider = screen.getByRole("slider") as HTMLInputElement;

    fireEvent.change(slider, { target: { value: "80" } });
    expect(onChange).toHaveBeenCalledWith(80);
    expect(slider.value).toBe("30");

    rerender(<Slider aria-label="Volume" value={80} onValueChange={onChange} />);
    expect(slider.value).toBe("80");
  });

  it("follows its parent's state when wired up as a controlled input", () => {
    render(<ControlledSlider showValue />, { wrapper });
    fireEvent.change(screen.getByRole("slider"), { target: { value: "65" } });
    expect((screen.getByRole("slider") as HTMLInputElement).value).toBe("65");
    expect(screen.getByText("65")).toBeInTheDocument();
  });

  it("draws the fill and thumb at the value's position between min and max", () => {
    const { container } = render(
      <Slider aria-label="Volume" value={75} onValueChange={vi.fn()} min={50} max={150} />,
      { wrapper },
    );
    const fill = container.querySelector<HTMLElement>("[style*='width: 25%']");
    const thumb = container.querySelector<HTMLElement>("[style*='left: 25%']");
    expect(fill).not.toBeNull();
    expect(thumb).not.toBeNull();
  });

  it("shows the label and, with showValue, the current value", () => {
    render(
      <Slider aria-label="Volume" label="Volume" showValue value={12} onValueChange={vi.fn()} />,
      {
        wrapper,
      },
    );
    expect(screen.getByText("Volume")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("disables the input", () => {
    render(<Slider aria-label="Volume" value={30} onValueChange={vi.fn()} disabled />, { wrapper });
    expect(screen.getByRole("slider")).toBeDisabled();
  });

  it("forwards its ref to the input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Slider aria-label="Volume" ref={ref} value={30} onValueChange={vi.fn()} />, {
      wrapper,
    });
    expect(ref.current).toBe(screen.getByRole("slider"));
  });

  it("has no axe violations when named", async () => {
    const { container } = render(<ControlledSlider />, { wrapper });
    await expectNoAxeViolations(container);
  });

  // `label` used to render as plain text beside the input, so a Slider given
  // only `label` had no accessible name (axe: "label").
  it("names the input with its `label`", async () => {
    const { container } = render(<Slider label="Volume" value={30} onValueChange={vi.fn()} />, {
      wrapper,
    });
    expect(screen.getByRole("slider", { name: "Volume" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("lets an aria-label win over the visible label", () => {
    render(
      <Slider label="Volume" aria-label="Master volume" value={30} onValueChange={vi.fn()} />,
      {
        wrapper,
      },
    );
    expect(screen.getByRole("slider", { name: "Master volume" })).toBeInTheDocument();
  });
});

/**
 * `value` and `onChange` used to be required, so a slider in a form that only
 * needed submitting, or one whose value was read from a ref, still had to be
 * wired to a `useState`.
 */
describe("Slider: uncontrolled", () => {
  it("starts at defaultValue and follows the input on its own", () => {
    const onChange = vi.fn();
    render(<Slider aria-label="Volume" defaultValue={30} onValueChange={onChange} showValue />, {
      wrapper,
    });
    const slider = screen.getByRole("slider") as HTMLInputElement;
    expect(slider.value).toBe("30");

    fireEvent.change(slider, { target: { value: "70" } });
    expect(onChange).toHaveBeenCalledWith(70);
    expect(slider.value).toBe("70");
    expect(screen.getByText("70")).toBeInTheDocument();
  });

  it("moves the drawn fill and thumb with it", () => {
    const { container } = render(<Slider aria-label="Volume" defaultValue={20} />, { wrapper });
    fireEvent.change(screen.getByRole("slider"), { target: { value: "60" } });
    expect(container.querySelector("[style*='width: 60%']")).not.toBeNull();
    expect(container.querySelector("[style*='left: 60%']")).not.toBeNull();
  });

  it("starts at `min` without a defaultValue, and needs no onChange", () => {
    render(<Slider aria-label="Volume" min={10} max={50} />, { wrapper });
    const slider = screen.getByRole("slider") as HTMLInputElement;
    expect(slider.value).toBe("10");
    fireEvent.change(slider, { target: { value: "25" } });
    expect(slider.value).toBe("25");
  });

  it("lets `value` win over defaultValue, so a controlled slider stays controlled", () => {
    const onChange = vi.fn();
    render(<Slider aria-label="Volume" value={40} defaultValue={10} onValueChange={onChange} />, {
      wrapper,
    });
    const slider = screen.getByRole("slider") as HTMLInputElement;
    expect(slider.value).toBe("40");
    fireEvent.change(slider, { target: { value: "90" } });
    expect(onChange).toHaveBeenCalledWith(90);
    expect(slider.value).toBe("40");
  });

  it("submits its value under its name", () => {
    const { container } = render(
      <form>
        <Slider label="Volume" name="volume" defaultValue={35} />
      </form>,
      { wrapper },
    );
    const form = container.querySelector("form") as HTMLFormElement;
    expect(new FormData(form).get("volume")).toBe("35");
    fireEvent.change(screen.getByRole("slider"), { target: { value: "55" } });
    expect(new FormData(form).get("volume")).toBe("55");
  });

  it("has no axe violations", async () => {
    const { container } = render(<Slider label="Volume" defaultValue={50} showValue />, {
      wrapper,
    });
    await expectNoAxeViolations(container);
  });
});
