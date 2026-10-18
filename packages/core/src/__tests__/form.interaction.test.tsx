import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Form } from "../components/Form";
import { Input } from "../components/Input";
import { SubmitButton } from "../components/SubmitButton";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/** A submit handler whose promise the test settles by hand. */
function deferredSubmit() {
  const pending: Array<() => void> = [];
  const onSubmit = vi.fn(
    (event: React.FormEvent) =>
      new Promise<void>((resolve) => {
        event.preventDefault();
        pending.push(resolve);
      }),
  );
  const settle = async () => {
    await act(async () => {
      for (const resolve of pending.splice(0)) resolve();
    });
  };
  return { onSubmit, settle };
}

/**
 * Form as a user submits it: Enter in a field or a press on the submit
 * button sends one submit, the form stays busy until an async handler
 * settles and drops further submits meanwhile, a field's own size wins over
 * the form's, and a conditionally rendered field keeps the grid correct.
 */
describe("Form: interaction", () => {
  it("submits once from Enter in a field, and not again while pending", async () => {
    const user = userEvent.setup();
    const { onSubmit, settle } = deferredSubmit();
    const { container } = render(
      <Form as="form" onSubmit={onSubmit}>
        <Input id="email" name="email" label="Email" />
        <SubmitButton>Send</SubmitButton>
      </Form>,
      { wrapper: wrap },
    );
    const field = screen.getByRole("textbox", { name: "Email" });
    await user.type(field, "a@b.co{Enter}");
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(container.querySelector("form")).toHaveAttribute("aria-busy", "true");

    await user.type(field, "{Enter}");
    expect(onSubmit).toHaveBeenCalledTimes(1);

    await settle();
    expect(container.querySelector("form")).not.toHaveAttribute("aria-busy");
    await user.type(field, "{Enter}");
    expect(onSubmit).toHaveBeenCalledTimes(2);
    await settle();
  });

  it("hands the handler the submitted data", async () => {
    const user = userEvent.setup();
    let submitted: FormData | undefined;
    render(
      <Form
        as="form"
        onSubmit={(event) => {
          event.preventDefault();
          submitted = new FormData(event.currentTarget);
        }}
      >
        <Input id="first" name="first" label="First" defaultValue="Ada" />
        <Input id="last" name="last" label="Last" />
        <SubmitButton>Save</SubmitButton>
      </Form>,
      { wrapper: wrap },
    );
    await user.type(screen.getByRole("textbox", { name: "Last" }), "Lovelace");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(submitted?.get("first")).toBe("Ada");
    expect(submitted?.get("last")).toBe("Lovelace");
  });

  it("keeps focus on the submit button through a keyboard submit", async () => {
    const user = userEvent.setup();
    const { onSubmit, settle } = deferredSubmit();
    render(
      <Form as="form" onSubmit={onSubmit}>
        <SubmitButton pendingLabel="Saving">Save</SubmitButton>
      </Form>,
      { wrapper: wrap },
    );
    await user.tab();
    await user.keyboard("{Enter}");
    const button = screen.getByRole("button", { name: /Saving$/ });
    expect(button).toHaveFocus();
    await user.keyboard(" ");
    expect(onSubmit).toHaveBeenCalledTimes(1);
    await settle();
    expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
  });

  it("is a plain div grid unless asked for a form, and passes axe", async () => {
    const { container } = render(
      <Form columns={2} density="stacked">
        <Input id="a" label="A" />
        <Input id="b" label="B" />
      </Form>,
      { wrapper: wrap },
    );
    expect(container.querySelector("form")).toBeNull();
    expect(container.firstElementChild).toHaveAttribute("data-density", "stacked");
    await expectNoAxeViolations(container);
  });

  it("re-groups its cells when a field is hidden", async () => {
    const user = userEvent.setup();
    const Toggling = () => {
      const [company, setCompany] = useState(true);
      return (
        <>
          <button type="button" onClick={() => setCompany((on) => !on)}>
            Toggle
          </button>
          <Form density="stacked">
            <Input id="name" label="Name" />
            {company && <Input id="company" label="Company" />}
            <Input id="email" label="Email" />
          </Form>
        </>
      );
    };
    render(<Toggling />, { wrapper: wrap });
    expect(screen.getAllByTestId(/^form-cell-/)).toHaveLength(3);
    await user.click(screen.getByRole("button", { name: "Toggle" }));
    expect(screen.getAllByTestId(/^form-cell-/)).toHaveLength(2);
    expect(screen.getByRole("textbox", { name: "Email" })).toBeInTheDocument();
  });

  it("lets a field's own size win over the form's", () => {
    render(
      <Form size="l">
        <Input id="big" label="Big" />
        <Input id="small" label="Small" size="s" />
      </Form>,
      { wrapper: wrap },
    );
    const surface = (name: string) =>
      screen.getByRole("textbox", { name }).closest("[data-surface='field']") as HTMLElement;
    expect(surface("Big").className).not.toBe(surface("Small").className);
  });
});
