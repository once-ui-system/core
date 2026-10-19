import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { Form } from "../components/Form";
import { SubmitButton } from "../components/SubmitButton";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * SubmitButton on its own and in a form: it is a submit button that the
 * keyboard reaches and presses, its `onClick` runs before the submit, and
 * while pending (from its form or its own `pending`) it stays focusable,
 * says it is busy, shows `pendingLabel`, and refuses presses.
 */
describe("SubmitButton: interaction", () => {
  it("submits its form from a click, Enter and Space, after its own onClick", async () => {
    const user = userEvent.setup();
    const calls: string[] = [];
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          calls.push("submit");
        }}
      >
        <SubmitButton onClick={() => calls.push("click")}>Save</SubmitButton>
      </form>,
      { wrapper: wrap },
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("type", "submit");
    await user.click(button);
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(calls).toEqual(["click", "submit", "click", "submit", "click", "submit"]);
  });

  it("takes its label from `label` or children", () => {
    render(
      <>
        <SubmitButton label="From label" />
        <SubmitButton>From children</SubmitButton>
      </>,
      { wrapper: wrap },
    );
    expect(screen.getByRole("button", { name: "From label" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "From children" })).toBeInTheDocument();
  });

  it("refuses presses while pending, but keeps its place in the Tab order", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    const onClick = vi.fn();
    const { container } = render(
      <form onSubmit={onSubmit}>
        <SubmitButton pending pendingLabel="Saving" onClick={onClick}>
          Save
        </SubmitButton>
      </form>,
      { wrapper: wrap },
    );
    await user.tab();
    const button = screen.getByRole("button", { name: /Saving$/ });
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toHaveAttribute("aria-busy", "true");
    await user.keyboard("{Enter} ");
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
    await expectNoAxeViolations(container);
  });

  it("lets `pending={false}` override its form's pending state", () => {
    render(
      <Form as="form" pending>
        <SubmitButton pending={false}>Save</SubmitButton>
      </Form>,
      { wrapper: wrap },
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(button).not.toHaveAttribute("aria-disabled");
    expect(button).not.toHaveAttribute("aria-busy");
  });

  it("is out of the Tab order when disabled outright", async () => {
    const user = userEvent.setup();
    render(
      <>
        <SubmitButton disabled>Save</SubmitButton>
        <button type="button">After</button>
      </>,
      { wrapper: wrap },
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    await user.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
  });
});
