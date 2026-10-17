import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Field } from "../components/Field";
import { Fieldset } from "../components/Fieldset";
import { Form } from "../components/Form";
import { FormErrorSummary } from "../components/FormErrorSummary";
import { Input } from "../components/Input";
import { SubmitButton } from "../components/SubmitButton";
import { Textarea } from "../components/Textarea";
import { expectNoAxeViolations } from "../test/axe";

/**
 * The form building blocks: Field wires a label, hint and error to a control;
 * Fieldset names a section; SubmitButton follows the form's pending state;
 * FormErrorSummary collects the errors and links to each field.
 */

describe("Field", () => {
  it("names the control with its label and describes it with the hint", async () => {
    const { container } = render(
      <Field label="Email" hint="We never share it">
        <Input id="email" />
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAttribute("id", "email");
    expect(input).toHaveAccessibleDescription("We never share it");
    expect(input).not.toHaveAttribute("aria-invalid", "true");
    await expectNoAxeViolations(container);
  });

  it("marks the control invalid and reads the error before the hint", async () => {
    const { container } = render(
      <Field label="Email" hint="We never share it" error="Enter a valid email">
        <Input id="email" />
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Enter a valid email We never share it");
    await expectNoAxeViolations(container);
  });

  it("keeps the control's own aria-describedby", () => {
    render(
      <>
        <span id="extra">Extra</span>
        <Field label="Email" hint="Hint">
          <Input id="email" aria-describedby="extra" />
        </Field>
      </>,
    );
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-describedby", "extra email-hint");
  });

  it("marks a required control and does not read the asterisk", () => {
    render(
      <Field label="Name" required>
        <Input id="name" />
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Name" });
    expect(input).toHaveAttribute("aria-required", "true");
  });

  it("wires a Textarea, whose own error prop used to be ignored", () => {
    render(
      <Field label="Note" error="Too short">
        <Textarea id="note" />
      </Field>,
    );
    const textarea = screen.getByRole("textbox", { name: "Note" });
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAccessibleDescription("Too short");
  });

  it("generates an id for a native control that has none", () => {
    render(
      <Field label="Plan">
        <select>
          <option>Free</option>
        </select>
      </Field>,
    );
    const select = screen.getByRole("combobox", { name: "Plan" });
    expect(select.id).toMatch(/^field-/);
  });

  it("wires the one element among whitespace children, as MDX passes them", () => {
    render(
      <Field label="Email" error="Required">
        {" "}
        <Input id="email" />{" "}
      </Field>,
    );
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveAttribute("aria-invalid", "true");
  });

  it("hands a render function the control props", () => {
    render(
      <Field label="Code" error="Wrong code">
        {(control) => <input {...control} />}
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Code" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Wrong code");
  });

  it("does not mark a nested field with another id invalid", () => {
    render(
      <Field label="Outer" error="Bad" controlId="outer">
        <div id="outer">
          <Input id="inner" label="Inner" />
        </div>
      </Field>,
    );
    expect(screen.getByRole("textbox", { name: "Inner" })).toHaveAttribute("aria-invalid", "false");
  });

  it("takes a span inside a Form without leaking it to the DOM", () => {
    const { container } = render(
      <Form columns={2}>
        <Field label="A" span={2}>
          <Input id="a" />
        </Field>
        <Field label="B">
          <Input id="b" />
        </Field>
      </Form>,
    );
    expect(container.querySelector("[span]")).toBeNull();
    expect(container.querySelector('[data-testid="form-cell-0"]')?.className).toMatch(/span-2/);
  });
});

describe("Fieldset", () => {
  it("is a named group described by its description", async () => {
    const { container } = render(
      <Fieldset legend="Billing address" description="Where invoices go">
        <Field label="Street">
          <Input id="street" />
        </Field>
      </Fieldset>,
    );
    const group = screen.getByRole("group", { name: "Billing address" });
    expect(group).toHaveAccessibleDescription("Where invoices go");
    await expectNoAxeViolations(container);
  });

  it("disables every native control inside", () => {
    render(
      <Fieldset legend="Locked" disabled>
        <Input id="x" label="X" />
      </Fieldset>,
    );
    expect(screen.getByRole("textbox", { name: "X" })).toBeDisabled();
  });

  it("inherits the outer form's size", () => {
    const { container } = render(
      <Form size="s">
        <Fieldset legend="Section">
          <Input id="x" />
        </Fieldset>
      </Form>,
    );
    expect(container.querySelector('[data-surface="field"]')?.className).toMatch(
      /(^|[\s_])s(_|\s|$)/,
    );
  });
});

describe("Form submit state", () => {
  it("is pending while an async onSubmit runs and blocks a second submit", async () => {
    let resolve!: () => void;
    const onSubmit = vi.fn(
      (event: React.FormEvent) =>
        new Promise<void>((r) => {
          event.preventDefault();
          resolve = r;
        }),
    );
    const { container } = render(
      <Form as="form" onSubmit={onSubmit}>
        <Input id="email" label="Email" />
        <SubmitButton pendingLabel="Saving">Save</SubmitButton>
      </Form>,
    );
    const form = container.querySelector("form") as HTMLFormElement;
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("type", "submit");

    fireEvent.submit(form);
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(form).toHaveAttribute("aria-busy", "true");
    // Button's spinner is a "Loading" status, so the name gains that prefix.
    const pending = screen.getByRole("button", { name: /Saving$/ });
    expect(pending).toHaveAttribute("aria-disabled", "true");
    expect(pending).not.toBeDisabled();

    fireEvent.submit(form);
    expect(onSubmit).toHaveBeenCalledTimes(1);

    await act(async () => resolve());
    expect(form).not.toHaveAttribute("aria-busy");
    expect(screen.getByRole("button", { name: "Save" })).not.toHaveAttribute("aria-disabled");
  });

  it("swallows a click while pending", () => {
    const onClick = vi.fn();
    render(
      <Form as="form" pending>
        <SubmitButton onClick={onClick}>Save</SubmitButton>
      </Form>,
    );
    const button = screen.getByRole("button", { name: /Save$/ });
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    button.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("keeps the outer form's pending state inside a Fieldset", () => {
    render(
      <Form as="form" pending>
        <Fieldset legend="Section">
          <SubmitButton>Save</SubmitButton>
        </Fieldset>
      </Form>,
    );
    expect(screen.getByRole("button", { name: /Save$/ })).toHaveAttribute("aria-disabled", "true");
  });

  it("leaves a synchronous onSubmit alone", () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const { container } = render(
      <Form as="form" onSubmit={onSubmit}>
        <SubmitButton>Save</SubmitButton>
      </Form>,
    );
    const form = container.querySelector("form") as HTMLFormElement;
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(onSubmit).toHaveBeenCalledTimes(2);
    expect(form).not.toHaveAttribute("aria-busy");
  });
});

describe("FormErrorSummary", () => {
  it("renders nothing without errors", () => {
    const { container } = render(<FormErrorSummary errors={{ email: undefined }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("lists the errors, takes focus, and focuses a field from its link", async () => {
    const { container } = render(
      <>
        <FormErrorSummary
          errors={{ email: "Enter a valid email", name: "", plan: "Pick a plan" }}
        />
        <Input id="email" label="Email" />
        <Input id="plan" label="Plan" />
      </>,
    );
    const summary = screen.getByRole("alert");
    expect(summary).toHaveFocus();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);

    fireEvent.click(screen.getByRole("link", { name: "Pick a plan" }));
    expect(screen.getByRole("textbox", { name: "Plan" })).toHaveFocus();
    await expectNoAxeViolations(container);
  });

  it("does not take focus when autoFocus is off", () => {
    render(<FormErrorSummary autoFocus={false} errors={[{ message: "Something went wrong" }]} />);
    expect(screen.getByRole("alert")).not.toHaveFocus();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
