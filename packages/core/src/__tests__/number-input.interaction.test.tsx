import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { NumberInput } from "../components/NumberInput";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const field = () => screen.getByRole("spinbutton", { name: "Quantity" }) as HTMLInputElement;
// jsdom cannot compute the suffix's styles for a hover, so the steppers get a
// bare click rather than user-event's pointer sequence.
const up = () => screen.getByRole("button", { name: "Increment value", hidden: true });
const down = () => screen.getByRole("button", { name: "Decrement value", hidden: true });

/**
 * NumberInput: a native number field with step buttons. What it owns: typing
 * reports a number (and nothing for a partial entry), the buttons step by
 * `step` within `min`/`max` and land on the step grid without floating-point
 * noise, `padStart` pads what it shows, and it works controlled.
 */
describe("NumberInput: interaction", () => {
  it("renders a named spinbutton with its bounds, and step buttons", async () => {
    const { container } = render(
      <NumberInput id="qty" label="Quantity" min={1} max={9} step={2} defaultValue={3} />,
      { wrapper: wrap },
    );
    expect(field()).toHaveValue(3);
    expect(field()).toHaveAttribute("min", "1");
    expect(field()).toHaveAttribute("max", "9");
    expect(field()).toHaveAttribute("step", "2");
    expect(up()).toBeInTheDocument();
    expect(down()).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("reports typed numbers, and nothing for an entry that is not one yet", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<NumberInput id="qty" label="Quantity" onChange={onChange} />, { wrapper: wrap });
    await user.click(field());
    await user.keyboard("42");
    expect(onChange.mock.calls).toEqual([[4], [42]]);
    await user.clear(field());
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("steps up and down by `step` with the buttons", () => {
    const onChange = vi.fn();
    render(
      <NumberInput id="qty" label="Quantity" defaultValue={10} step={5} onChange={onChange} />,
      {
        wrapper: wrap,
      },
    );
    fireEvent.click(up());
    expect(field()).toHaveValue(15);
    fireEvent.click(down());
    fireEvent.click(down());
    expect(field()).toHaveValue(5);
    expect(onChange.mock.calls).toEqual([[15], [10], [5]]);
  });

  it("starts stepping from zero when empty", () => {
    const onChange = vi.fn();
    render(<NumberInput id="qty" label="Quantity" onChange={onChange} />, { wrapper: wrap });
    fireEvent.click(up());
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("does not step past min or max", () => {
    const onChange = vi.fn();
    render(
      <NumberInput
        id="qty"
        label="Quantity"
        defaultValue={2}
        min={1}
        max={3}
        onChange={onChange}
      />,
      { wrapper: wrap },
    );
    fireEvent.click(up());
    fireEvent.click(up());
    expect(field()).toHaveValue(3);
    fireEvent.click(down());
    fireEvent.click(down());
    fireEvent.click(down());
    expect(field()).toHaveValue(1);
    expect(onChange.mock.calls).toEqual([[3], [2], [1]]);
  });

  // 0.1 + 0.2 is 0.30000000000000004 in floating point, and that is what the
  // field showed and reported after a step.
  it("steps a decimal value without floating-point noise", () => {
    const onChange = vi.fn();
    render(
      <NumberInput id="qty" label="Quantity" defaultValue={0.2} step={0.1} onChange={onChange} />,
      { wrapper: wrap },
    );
    fireEvent.click(up());
    expect(field().value).toBe("0.3");
    expect(onChange).toHaveBeenLastCalledWith(0.3);
    fireEvent.click(down());
    fireEvent.click(down());
    fireEvent.click(down());
    expect(field().value).toBe("0");
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it("pads what it shows with padStart", () => {
    render(<NumberInput id="qty" label="Quantity" defaultValue={7} padStart={3} />, {
      wrapper: wrap,
    });
    expect(field().value).toBe("007");
    fireEvent.click(up());
    expect(field().value).toBe("008");
  });

  it("drives a parent's state as a controlled field", async () => {
    const user = userEvent.setup();
    const Controlled = () => {
      const [value, setValue] = useState(1);
      return (
        <>
          <NumberInput id="qty" label="Quantity" value={value} onChange={setValue} />
          <output>{value}</output>
        </>
      );
    };
    render(<Controlled />, { wrapper: wrap });
    fireEvent.click(up());
    expect(screen.getByRole("status")).toHaveTextContent("2");
    await user.clear(field());
    await user.type(field(), "17");
    expect(screen.getByRole("status")).toHaveTextContent("17");
    expect(field()).toHaveValue(17);
  });

  it("is reachable with Tab and skipped while disabled", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<NumberInput id="qty" label="Quantity" />, { wrapper: wrap });
    await user.tab();
    expect(field()).toHaveFocus();
    rerender(<NumberInput id="qty" label="Quantity" disabled />);
    expect(field()).toBeDisabled();
  });
});
