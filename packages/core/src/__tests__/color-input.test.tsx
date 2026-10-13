import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { ColorInput } from "../components/ColorInput";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

/**
 * ColorInput wraps a native colour field. It reports a hex string, or an
 * `rgba()` string with `supportAlpha` (keeping the opacity it was given), shows
 * the chosen colour as text and as a swatch that reopens the picker, and has a
 * button that clears the colour.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const ControlledColor = ({
  initial = "",
  onChange,
  ...props
}: { initial?: string } & Partial<React.ComponentProps<typeof ColorInput>>) => {
  const [value, setValue] = useState(initial);
  return (
    <ColorInput
      id="brand"
      label="Brand colour"
      value={value}
      onChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      {...props}
    />
  );
};

const field = () => screen.getByLabelText("Brand colour") as HTMLInputElement;

describe("ColorInput", () => {
  it("renders a labelled native colour field", () => {
    render(<ControlledColor />, { wrapper });
    expect(field()).toHaveAttribute("type", "color");
  });

  it("reports the picked colour as hex and shows it", () => {
    const onChange = vi.fn();
    render(<ControlledColor onChange={onChange} />, { wrapper });
    fireEvent.change(field(), { target: { value: "#ff8800" } });
    expect(onChange).toHaveBeenCalledWith("#ff8800");
    expect(screen.getByText("#ff8800")).toBeInTheDocument();
  });

  it("starts from a hex value", () => {
    render(<ControlledColor initial="#336699" />, { wrapper });
    expect(field().value).toBe("#336699");
    expect(screen.getByText("#336699")).toBeInTheDocument();
  });

  it("with supportAlpha, reports rgba() and keeps the opacity it started with", () => {
    const onChange = vi.fn();
    render(<ControlledColor supportAlpha initial="rgba(51, 102, 153, 0.5)" onChange={onChange} />, {
      wrapper,
    });
    expect(field().value).toBe("#336699");

    fireEvent.change(field(), { target: { value: "#ff0000" } });
    expect(onChange).toHaveBeenCalledWith("rgba(255, 0, 0, 0.5)");
  });

  it("clears the colour with the remove button", () => {
    const onChange = vi.fn();
    render(<ControlledColor initial="#336699" onChange={onChange} />, { wrapper });
    // jsdom 30 throws computing styles inside this field's suffix (its calc()
    // width). So no visibility check on the query (`hidden: true`; nothing is
    // hidden) and a bare click event rather than user-event, whose hover opens
    // the button's tooltip and has floating-ui compute styles there.
    const remove = () => screen.queryByRole("button", { name: "Remove", hidden: true });

    fireEvent.click(remove() as HTMLElement);
    expect(onChange).toHaveBeenCalledWith("");
    expect(screen.queryByText("#336699")).toBeNull();
    expect(remove()).toBeNull();
  });

  it("reopens the picker from the swatch", async () => {
    const user = userEvent.setup();
    render(<ControlledColor initial="#336699" />, { wrapper });
    const click = vi.spyOn(field(), "click");
    const swatch = document.querySelector<HTMLElement>(".prefix");
    expect(swatch).not.toBeNull();
    await user.click(swatch as HTMLElement);
    expect(click).toHaveBeenCalled();
  });

  it("disables the field", () => {
    render(<ControlledColor disabled />, { wrapper });
    expect(field()).toBeDisabled();
  });

  it("has no axe violations, empty or with a colour", async () => {
    const empty = render(<ControlledColor />, { wrapper });
    await expectNoAxeViolations(empty.container);
    empty.unmount();

    const filled = render(<ControlledColor initial="#336699" />, { wrapper });
    await expectNoAxeViolations(filled.container);
  });

  // The forwarded ref used to be ignored in favour of an internal one.
  it("forwards its ref to the input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<ColorInput ref={ref} id="brand" label="Brand colour" value="" onChange={vi.fn()} />, {
      wrapper,
    });
    expect(ref.current).toBe(field());
  });

  // `value` used to only seed internal state, so a parent that changed it
  // after mount (a reset, or a value loaded later) was ignored: the same class
  // of bug as NumberInput's (ROADMAP W2).
  it("follows its value prop after mount", () => {
    const { rerender } = render(
      <ColorInput id="brand" label="Brand colour" value="#336699" onChange={vi.fn()} />,
      { wrapper },
    );
    rerender(<ColorInput id="brand" label="Brand colour" value="#ff0000" onChange={vi.fn()} />);
    expect(field().value).toBe("#ff0000");
    expect(screen.getByText("#ff0000")).toBeInTheDocument();

    // A reset from outside clears it, swatch and text included.
    rerender(<ColorInput id="brand" label="Brand colour" value="" onChange={vi.fn()} />);
    expect(screen.queryByText("#ff0000")).toBeNull();
    expect(screen.queryByRole("button", { name: "Remove", hidden: true })).toBeNull();
  });

  it("follows an rgba() value's opacity", () => {
    const onChange = vi.fn();
    const props = { id: "brand", label: "Brand colour", supportAlpha: true, onChange };
    const { rerender } = render(<ColorInput {...props} value="rgba(51, 102, 153, 0.5)" />, {
      wrapper,
    });
    rerender(<ColorInput {...props} value="rgba(255, 0, 0, 0.25)" />);
    expect(field().value).toBe("#ff0000");

    // The next pick keeps the opacity that came in with the value.
    fireEvent.change(field(), { target: { value: "#00ff00" } });
    expect(onChange).toHaveBeenLastCalledWith("rgba(0, 255, 0, 0.25)");
  });

  it("keeps the user's pick when the parent passes it back, or never does", () => {
    const onChange = vi.fn();
    render(<ControlledColor initial="#336699" onChange={onChange} />, { wrapper });
    fireEvent.change(field(), { target: { value: "#ff8800" } });
    expect(field().value).toBe("#ff8800");

    // A parent that ignores onChange keeps passing the same value.
    const { container } = render(
      <ColorInput id="other" label="Other colour" value="#336699" onChange={vi.fn()} />,
      { wrapper },
    );
    const other = container.querySelector<HTMLInputElement>("#other") as HTMLInputElement;
    fireEvent.change(other, { target: { value: "#00ff00" } });
    expect(other.value).toBe("#00ff00");
  });
});
