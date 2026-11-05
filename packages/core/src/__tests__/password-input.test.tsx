import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Input } from "../components/Input";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

/**
 * PasswordInput is an Input that starts masked and has a button to reveal and
 * hide what was typed. The button is named for what it will do, never submits
 * the form, and the typed value survives the switch.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const ControlledPassword = (props: Partial<React.ComponentProps<typeof Input>>) => {
  const [value, setValue] = useState("");
  return (
    <Input
      type="password"
      id="password"
      label="Password"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      {...props}
    />
  );
};

const field = () => screen.getByLabelText("Password") as HTMLInputElement;

describe("PasswordInput", () => {
  it("starts masked, labelled, with a button to show the password", () => {
    render(<ControlledPassword />, { wrapper });
    expect(field()).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Show password" })).toBeInTheDocument();
  });

  it("reveals and hides the password, keeping what was typed", async () => {
    const user = userEvent.setup();
    render(<ControlledPassword />, { wrapper });
    await user.type(field(), "hunter2");

    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(field()).toHaveAttribute("type", "text");
    expect(field().value).toBe("hunter2");

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(field()).toHaveAttribute("type", "password");
    expect(field().value).toBe("hunter2");
  });

  it("toggles from the keyboard", async () => {
    const user = userEvent.setup();
    render(<ControlledPassword />, { wrapper });
    screen.getByRole("button", { name: "Show password" }).focus();
    await user.keyboard("{Enter}");
    expect(field()).toHaveAttribute("type", "text");
    await user.keyboard(" ");
    expect(field()).toHaveAttribute("type", "password");
  });

  it("does not submit the surrounding form when the toggle is pressed", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <ControlledPassword />
      </form>,
      { wrapper },
    );
    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("passes Input props through: disabled, error message, autocomplete", () => {
    render(
      <ControlledPassword
        disabled
        autoComplete="current-password"
        error
        errorMessage="Too short"
      />,
      { wrapper },
    );
    expect(field()).toBeDisabled();
    expect(field()).toHaveAttribute("autocomplete", "current-password");
    expect(field()).toHaveAttribute("aria-invalid", "true");
    expect(field()).toHaveAccessibleDescription("Too short");
  });

  it("forwards its ref to the input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input type="password" ref={ref} id="password" label="Password" />, { wrapper });
    expect(ref.current).toBe(field());
  });

  it("has no axe violations, masked or revealed", async () => {
    const user = userEvent.setup();
    const { container } = render(<ControlledPassword />, { wrapper });
    await expectNoAxeViolations(container);
    await user.click(screen.getByRole("button", { name: "Show password" }));
    await expectNoAxeViolations(container);
  });
});
