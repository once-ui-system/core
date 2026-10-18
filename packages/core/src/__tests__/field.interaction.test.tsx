import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { Field } from "../components/Field";
import { Input } from "../components/Input";
import { Textarea } from "../components/Textarea";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * Field through a validation round trip: the label names the control and a
 * click on it focuses the control, the error appears and disappears with the
 * value and the control's invalid state and description follow it, and the
 * hint stays readable throughout.
 */
describe("Field: interaction", () => {
  it("focuses the control from a click on its label", async () => {
    const user = userEvent.setup();
    render(
      <Field label="Username" hint="Letters and digits">
        <input />
      </Field>,
      { wrapper: wrap },
    );
    await user.click(screen.getByText("Username"));
    expect(screen.getByRole("textbox", { name: "Username" })).toHaveFocus();
  });

  it("follows the error as the value is fixed", async () => {
    const user = userEvent.setup();
    const Validated = () => {
      const [value, setValue] = useState("");
      const error = value.length > 0 && value.length < 3 ? "At least 3 characters" : undefined;
      return (
        <Field label="Username" hint="Letters and digits" error={error} required>
          <Input id="username" value={value} onChange={(e) => setValue(e.target.value)} />
        </Field>
      );
    };
    const { container } = render(<Validated />, { wrapper: wrap });
    const field = screen.getByRole("textbox", { name: "Username" });
    expect(field).toHaveAttribute("aria-required", "true");
    expect(field).toHaveAccessibleDescription("Letters and digits");
    expect(field).toHaveAttribute("aria-invalid", "false");

    await user.type(field, "ab");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription("At least 3 characters Letters and digits");
    await expectNoAxeViolations(container);

    await user.type(field, "c");
    expect(field).toHaveAttribute("aria-invalid", "false");
    expect(field).toHaveAccessibleDescription("Letters and digits");
    expect(screen.queryByText("At least 3 characters")).not.toBeInTheDocument();
  });

  it("wires a Textarea the same way, with its own description last", () => {
    render(
      <Field label="Message" hint="Be nice" error="Required">
        <Textarea id="message" description="Markdown supported" />
      </Field>,
      { wrapper: wrap },
    );
    const field = screen.getByRole("textbox", { name: "Message" });
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(field).toHaveAccessibleDescription("Required Be nice Markdown supported");
  });

  it("keeps the control reachable with Tab, in place", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Field label="First">
          <input />
        </Field>
        <Field label="Second">
          <input />
        </Field>
      </>,
      { wrapper: wrap },
    );
    await user.tab();
    expect(screen.getByRole("textbox", { name: "First" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("textbox", { name: "Second" })).toHaveFocus();
  });

  it("gives two generated controls distinct ids", () => {
    render(
      <>
        <Field label="A">
          <input />
        </Field>
        <Field label="B">
          <input />
        </Field>
      </>,
      { wrapper: wrap },
    );
    const [a, b] = screen.getAllByRole("textbox");
    expect(a.id).not.toBe("");
    expect(a.id).not.toBe(b.id);
  });

  it("passes a controlId to the control and its label", () => {
    render(
      <Field label="Email" controlId="contact-email">
        <input />
      </Field>,
      { wrapper: wrap },
    );
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveAttribute("id", "contact-email");
  });
});
