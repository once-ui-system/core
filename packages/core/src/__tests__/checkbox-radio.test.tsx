import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { Checkbox } from "../components/Checkbox";
import { RadioButton } from "../components/RadioButton";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const formValues = (container: HTMLElement, name: string) =>
  new FormData(container.querySelector("form") as HTMLFormElement).getAll(name);

/**
 * One control, one name (ROADMAP W3). The hidden native input that carries the
 * value for form submission used to sit in the accessibility tree beside the
 * visible control as a second, unlabelled checkbox or radio.
 */
describe("Checkbox accessibility", () => {
  it("exposes a single checkbox, named by its label and described by its description", async () => {
    const { container } = render(
      <Checkbox label="Accept terms" description="Required to continue" />,
      { wrapper: wrap },
    );

    const [checkbox, ...others] = screen.getAllByRole("checkbox");
    expect(others).toHaveLength(0);
    expect(checkbox).toHaveAccessibleName("Accept terms");
    expect(checkbox).toHaveAccessibleDescription("Required to continue");
    await expectNoAxeViolations(container);
  });

  it("is named by the label alone, not the help button beside it", () => {
    render(<Checkbox label="Beta" iconButtonProps={{ tooltip: "Early access features" }} />, {
      wrapper: wrap,
    });
    expect(screen.getByRole("checkbox")).toHaveAccessibleName("Beta");
  });

  it("takes aria-label when it has no visible label", async () => {
    const { container } = render(<Checkbox aria-label="Select row 1" />, { wrapper: wrap });
    expect(screen.getByRole("checkbox", { name: "Select row 1" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("toggles from the keyboard", async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Accept terms" />, { wrapper: wrap });

    await user.tab();
    const checkbox = screen.getByRole("checkbox", { name: "Accept terms" });
    expect(checkbox).toHaveFocus();
    await user.keyboard(" ");
    expect(checkbox).toBeChecked();
    await user.keyboard("{Enter}");
    expect(checkbox).not.toBeChecked();
  });

  it("reports mixed and disabled states on the one control", async () => {
    const { container } = render(<Checkbox label="All rows" indeterminate disabled />, {
      wrapper: wrap,
    });
    const checkbox = screen.getByRole("checkbox", { name: "All rows" });
    expect(checkbox).toHaveAttribute("aria-checked", "mixed");
    expect(checkbox).toHaveAttribute("aria-disabled", "true");
    await expectNoAxeViolations(container);
  });

  it("submits its name and value with a form", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <Checkbox label="Newsletter" name="newsletter" value="weekly" />
      </form>,
      { wrapper: wrap },
    );

    expect(formValues(container, "newsletter")).toEqual([]);
    await user.click(screen.getByRole("checkbox", { name: "Newsletter" }));
    expect(formValues(container, "newsletter")).toEqual(["weekly"]);
  });
});

describe("RadioButton accessibility", () => {
  const Group = () => {
    const [value, setValue] = useState("card");
    return (
      <form>
        {["card", "bank"].map((option) => (
          <RadioButton
            key={option}
            name="payment"
            value={option}
            label={option === "card" ? "Card" : "Bank transfer"}
            description={option === "bank" ? "Takes two days" : undefined}
            checked={value === option}
            onCheckedChange={() => setValue(option)}
          />
        ))}
      </form>
    );
  };

  it("exposes one radio per option, each named by its label", async () => {
    const { container } = render(<Group />, { wrapper: wrap });

    const radios = screen.getAllByRole("radio");
    expect(radios).toHaveLength(2);
    expect(radios[0]).toHaveAccessibleName("Card");
    expect(radios[1]).toHaveAccessibleName("Bank transfer");
    expect(radios[1]).toHaveAccessibleDescription("Takes two days");
    await expectNoAxeViolations(container);
  });

  it("selects from the keyboard and submits the selected value", async () => {
    const user = userEvent.setup();
    const { container } = render(<Group />, { wrapper: wrap });
    expect(formValues(container, "payment")).toEqual(["card"]);

    await user.tab();
    await user.tab();
    const bank = screen.getByRole("radio", { name: "Bank transfer" });
    expect(bank).toHaveFocus();
    await user.keyboard(" ");
    expect(bank).toBeChecked();
    expect(screen.getByRole("radio", { name: "Card" })).not.toBeChecked();
    expect(formValues(container, "payment")).toEqual(["bank"]);
  });

  it("takes aria-label when it has no visible label", async () => {
    const { container } = render(<RadioButton aria-label="Small" name="size" value="s" />, {
      wrapper: wrap,
    });
    expect(screen.getByRole("radio", { name: "Small" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });
});
