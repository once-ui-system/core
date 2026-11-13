import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "../components/Checkbox";
import { RadioButton } from "../components/RadioButton";
import { Switch } from "../components/Switch";
import { LayoutProvider } from "../contexts/LayoutProvider";

/**
 * Checkbox, RadioButton and Switch type the native input props, but spread
 * them onto the label beside the control (and only when there was a label),
 * so `onChange`, `onBlur`, `required` and `form` went nowhere. That broke
 * react-hook-form's `register()`, which hands over `ref`, `name`, `onChange`
 * and `onBlur` and then reads the input. This stands in for it.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

function fakeRegister(name: string) {
  const form = {
    input: null as HTMLInputElement | null,
    values: [] as Array<{ name: string; checked: boolean }>,
    touched: [] as string[],
  };
  const props = {
    name,
    ref: (el: HTMLInputElement | null) => {
      form.input = el;
    },
    onChange: vi.fn((event: React.ChangeEvent<HTMLInputElement>) => {
      form.values.push({ name: event.target.name, checked: event.target.checked });
    }),
    onBlur: vi.fn((event: React.FocusEvent<HTMLInputElement>) => {
      form.touched.push(event.target.name);
    }),
  };
  return { form, props };
}

const cases = [
  ["Checkbox", "checkbox", (p: object) => <Checkbox label="Accept" {...p} />],
  ["Switch", "switch", (p: object) => <Switch label="Accept" {...p} />],
] as const;

describe.each(cases)("%s native input props", (_name, role, renderControl) => {
  it("reports clicks and keys through onChange, with the input's new state", async () => {
    const user = userEvent.setup();
    const { form, props } = fakeRegister("terms");
    render(renderControl(props), { wrapper });
    const control = screen.getByRole(role, { name: "Accept" });

    await user.click(control);
    expect(form.values).toEqual([{ name: "terms", checked: true }]);
    expect(form.input?.checked).toBe(true);
    expect(control).toHaveAttribute("aria-checked", "true");

    control.focus();
    await user.keyboard(" ");
    expect(form.values.at(-1)).toEqual({ name: "terms", checked: false });
    expect(form.input?.checked).toBe(false);
    expect(control).toHaveAttribute("aria-checked", "false");

    await user.click(screen.getByText("Accept"));
    expect(form.values.at(-1)).toEqual({ name: "terms", checked: true });
    expect(props.onChange).toHaveBeenCalledTimes(3);
  });

  it("reports blur with the input as the target", async () => {
    const user = userEvent.setup();
    const { form, props } = fakeRegister("terms");
    render(renderControl(props), { wrapper });
    screen.getByRole(role, { name: "Accept" }).focus();
    await user.tab();
    expect(form.touched).toEqual(["terms"]);
  });

  it("puts native attributes on the input, with or without a label", () => {
    const { container, rerender } = render(renderControl({ required: true, form: "signup" }), {
      wrapper,
    });
    const input = () => container.querySelector("input") as HTMLInputElement;
    expect(input()).toBeRequired();
    expect(input()).toHaveAttribute("form", "signup");

    rerender(
      role === "checkbox" ? (
        <Checkbox aria-label="Accept" required form="signup" />
      ) : (
        <Switch aria-label="Accept" required form="signup" />
      ),
    );
    expect(input()).toBeRequired();
    expect(input()).toHaveAttribute("form", "signup");
  });

  // 2.x's `onToggle` is `onCheckedChange` in 3.0.
  it("still calls onCheckedChange once per toggle", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(renderControl({ onCheckedChange }), { wrapper });
    await user.click(screen.getByRole(role, { name: "Accept" }));
    expect(onCheckedChange).toHaveBeenCalledTimes(1);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });
});

describe("RadioButton native input props", () => {
  it("reports choosing through onChange and blur with the input as the target", async () => {
    const user = userEvent.setup();
    const { form, props } = fakeRegister("plan");
    render(<RadioButton label="Pro" value="pro" {...props} />, { wrapper });
    const radio = screen.getByRole("radio", { name: "Pro" });

    await user.click(radio);
    expect(form.values).toEqual([{ name: "plan", checked: true }]);
    expect(form.input?.checked).toBe(true);
    expect(radio).toHaveAttribute("aria-checked", "true");

    radio.focus();
    await user.tab();
    expect(form.touched).toEqual(["plan"]);
  });

  it("puts native attributes on the input", () => {
    const { container } = render(<RadioButton aria-label="Pro" required form="signup" />, {
      wrapper,
    });
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("form", "signup");
  });
});
