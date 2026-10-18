import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it } from "vitest";
import { Fieldset } from "../components/Fieldset";
import { Form } from "../components/Form";
import { Input } from "../components/Input";
import { RadioGroup } from "../components/RadioGroup";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * Fieldset in a form: a real `<fieldset>` group named by its legend, whose
 * `disabled` takes every native control inside out of the Tab order and out
 * of the submitted data, and whose layout grid is a `div`, never a nested
 * `<form>`.
 */
describe("Fieldset: interaction", () => {
  it("is a group named by its legend and described by its description", async () => {
    const { container } = render(
      <Fieldset legend="Shipping" description="Where we send the parcel">
        <Input id="street" label="Street" />
        <Input id="city" label="City" />
      </Fieldset>,
      { wrapper: wrap },
    );
    const group = screen.getByRole("group", { name: "Shipping" });
    expect(group.tagName).toBe("FIELDSET");
    expect(group).toHaveAccessibleDescription("Where we send the parcel");
    expect(group).toContainElement(screen.getByRole("textbox", { name: "City" }));
    await expectNoAxeViolations(container);
  });

  it("tabs through its fields in order", async () => {
    const user = userEvent.setup();
    render(
      <Fieldset legend="Name">
        <Input id="first" label="First" />
        <Input id="last" label="Last" />
      </Fieldset>,
      { wrapper: wrap },
    );
    await user.tab();
    expect(screen.getByRole("textbox", { name: "First" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("textbox", { name: "Last" })).toHaveFocus();
  });

  it("takes disabled fields out of the Tab order and out of the submitted data", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Form as="form">
        <Fieldset legend="Billing" disabled>
          <Input id="card" name="card" label="Card" defaultValue="4242" />
        </Fieldset>
        <Input id="note" name="note" label="Note" defaultValue="hi" />
      </Form>,
      { wrapper: wrap },
    );
    await user.tab();
    expect(screen.getByRole("textbox", { name: "Note" })).toHaveFocus();
    const data = new FormData(container.querySelector("form") as HTMLFormElement);
    expect(data.get("card")).toBeNull();
    expect(data.get("note")).toBe("hi");
  });

  it("lays its fields out without nesting a second form", () => {
    const { container } = render(
      <Form as="form">
        <Fieldset legend="Group" columns={2}>
          <Input id="a" label="A" />
          <Input id="b" label="B" />
        </Fieldset>
      </Form>,
      { wrapper: wrap },
    );
    expect(container.querySelectorAll("form")).toHaveLength(1);
    expect(screen.getByRole("group", { name: "Group" })).not.toHaveAttribute("disabled");
  });

  it("holds a radio group, named apart from the fieldset", () => {
    render(
      <Fieldset legend="Preferences">
        <RadioGroup
          label="Theme"
          options={[
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
        />
      </Fieldset>,
      { wrapper: wrap },
    );
    expect(screen.getByRole("group", { name: "Preferences" })).toContainElement(
      screen.getByRole("radiogroup", { name: "Theme" }),
    );
  });
});
