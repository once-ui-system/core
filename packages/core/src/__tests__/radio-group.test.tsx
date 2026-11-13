import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Grid } from "../components/Grid";
import { RadioButton } from "../components/RadioButton";
import { RadioGroup, type RadioGroupOption } from "../components/RadioGroup";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * Every app that needs one choice from a few hand-wires RadioButtons to a
 * `useState`: each radio is its own Tab stop, the arrow keys do nothing, and
 * nothing tells a screen reader the radios belong together or what they choose.
 */
const plans: RadioGroupOption[] = [
  { value: "monthly", label: "Monthly", description: "Billed every month" },
  { value: "annual", label: "Annual", description: "Two months free" },
  { value: "lifetime", label: "Lifetime" },
];

const radio = (name: string) => screen.getByRole("radio", { name });
const checkedRadio = () => screen.queryByRole("radio", { checked: true });
const formValues = (container: HTMLElement, name: string) =>
  new FormData(container.querySelector("form") as HTMLFormElement).getAll(name);

const Controlled = (props: Partial<React.ComponentProps<typeof RadioGroup>>) => {
  const [value, setValue] = useState("annual");
  return (
    <RadioGroup label="Plan" options={plans} value={value} onValueChange={setValue} {...props} />
  );
};

describe("RadioGroup: structure", () => {
  it("is a radiogroup named by its label and described by its description", () => {
    render(<RadioGroup label="Plan" description="You can change it later" options={plans} />, {
      wrapper: wrap,
    });
    const group = screen.getByRole("radiogroup", { name: "Plan" });
    expect(group).toHaveAccessibleDescription("You can change it later");
    expect(group).toHaveAttribute("aria-orientation", "vertical");
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(radio("Annual")).toHaveAccessibleDescription("Two months free");
  });

  it("takes aria-label when it has no visible label, and lets it win over one", () => {
    const { rerender } = render(<RadioGroup aria-label="Plan" options={plans} />, {
      wrapper: wrap,
    });
    expect(screen.getByRole("radiogroup", { name: "Plan" })).toBeInTheDocument();

    rerender(<RadioGroup label="Plan" aria-label="Billing plan" options={plans} />);
    expect(screen.getByRole("radiogroup", { name: "Billing plan" })).toBeInTheDocument();
  });

  it("lays the radios out in a row with `horizontal`", () => {
    render(<RadioGroup aria-label="Plan" orientation="horizontal" options={plans} />, {
      wrapper: wrap,
    });
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("forwards its ref and layout props to the group", () => {
    let node: HTMLDivElement | null = null;
    render(
      <RadioGroup
        ref={(el) => {
          node = el;
        }}
        aria-label="Plan"
        options={plans}
        className="plans"
      />,
      { wrapper: wrap },
    );
    expect(node).toBe(screen.getByRole("radiogroup"));
    expect(screen.getByRole("radiogroup")).toHaveClass("plans");
  });
});

describe("RadioGroup: error", () => {
  it("marks every radio invalid with the group's errorMessage or error, as well as the group", () => {
    const { rerender } = render(
      <RadioGroup label="Plan" options={plans} errorMessage="Pick a plan" />,
      { wrapper: wrap },
    );
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("radiogroup")).toHaveAccessibleDescription("Pick a plan");
    for (const r of screen.getAllByRole("radio")) {
      expect(r).toHaveAttribute("aria-invalid", "true");
      // The danger look sits on the radio's container, as for a radio's own error.
      expect(r.closest("[class*='error']")).not.toBeNull();
    }

    rerender(<RadioGroup label="Plan" options={plans} error />);
    for (const r of screen.getAllByRole("radio")) expect(r).toHaveAttribute("aria-invalid", "true");

    rerender(<RadioGroup label="Plan" options={plans} />);
    for (const r of screen.getAllByRole("radio")) {
      expect(r).not.toHaveAttribute("aria-invalid");
      expect(r.closest("[class*='error']")).toBeNull();
    }
  });
});

describe("RadioGroup: selection", () => {
  it("starts on defaultValue and selects on click, reporting each change once", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <RadioGroup label="Plan" options={plans} defaultValue="annual" onValueChange={onChange} />,
      {
        wrapper: wrap,
      },
    );
    expect(checkedRadio()).toBe(radio("Annual"));

    await user.click(radio("Lifetime"));
    expect(checkedRadio()).toBe(radio("Lifetime"));
    expect(radio("Annual")).not.toBeChecked();

    await user.click(radio("Lifetime"));
    await user.click(screen.getByText("Monthly"));
    expect(checkedRadio()).toBe(radio("Monthly"));
    expect(onChange.mock.calls.map(([value]) => value)).toEqual(["lifetime", "monthly"]);
  });

  it("starts with nothing selected without a value or defaultValue", () => {
    render(<RadioGroup label="Plan" options={plans} />, { wrapper: wrap });
    expect(checkedRadio()).toBeNull();
  });

  it("is controlled: shows `value`, not the last click, until the parent updates it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <RadioGroup label="Plan" options={plans} value="monthly" onValueChange={onChange} />,
      { wrapper: wrap },
    );

    await user.click(radio("Annual"));
    expect(onChange).toHaveBeenCalledWith("annual");
    expect(checkedRadio()).toBe(radio("Monthly"));

    rerender(<RadioGroup label="Plan" options={plans} value="annual" onValueChange={onChange} />);
    expect(checkedRadio()).toBe(radio("Annual"));
  });

  it("follows its parent's state when wired up as a controlled input", async () => {
    const user = userEvent.setup();
    render(<Controlled />, { wrapper: wrap });
    await user.click(radio("Lifetime"));
    expect(checkedRadio()).toBe(radio("Lifetime"));
  });

  it("does not select a disabled option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <RadioGroup
        label="Plan"
        options={plans.map((plan) => ({ ...plan, disabled: plan.value === "lifetime" }))}
        defaultValue="monthly"
        onValueChange={onChange}
      />,
      { wrapper: wrap },
    );
    expect(radio("Lifetime")).toHaveAttribute("aria-disabled", "true");
    await user.click(radio("Lifetime"));
    expect(checkedRadio()).toBe(radio("Monthly"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disables every radio with `disabled`", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <RadioGroup
        label="Plan"
        options={plans}
        defaultValue="monthly"
        disabled
        onValueChange={onChange}
      />,
      { wrapper: wrap },
    );
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-disabled", "true");
    for (const r of screen.getAllByRole("radio")) {
      expect(r).toHaveAttribute("aria-disabled", "true");
      expect(r).toHaveAttribute("tabindex", "-1");
    }
    await user.click(radio("Annual"));
    expect(checkedRadio()).toBe(radio("Monthly"));
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("RadioGroup: keyboard", () => {
  const Page = (props: Partial<React.ComponentProps<typeof RadioGroup>>) => (
    <>
      <button type="button">Before</button>
      <RadioGroup label="Plan" options={plans} {...props} />
      <button type="button">After</button>
    </>
  );

  it("is one Tab stop: the selected radio", async () => {
    const user = userEvent.setup();
    render(<Page defaultValue="annual" />, { wrapper: wrap });

    await user.tab();
    await user.tab();
    expect(radio("Annual")).toHaveFocus();
    expect(radio("Monthly")).toHaveAttribute("tabindex", "-1");
    expect(radio("Lifetime")).toHaveAttribute("tabindex", "-1");

    await user.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(radio("Annual")).toHaveFocus();
  });

  it("is reachable at the first enabled radio while none is selected", async () => {
    const user = userEvent.setup();
    render(
      <Page options={plans.map((plan) => ({ ...plan, disabled: plan.value === "monthly" }))} />,
      { wrapper: wrap },
    );
    await user.tab();
    await user.tab();
    expect(radio("Annual")).toHaveFocus();
    expect(checkedRadio()).toBeNull();

    await user.keyboard(" ");
    expect(checkedRadio()).toBe(radio("Annual"));
  });

  it("moves focus and the selection with the arrow keys, wrapping at the ends", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Page defaultValue="monthly" onValueChange={onChange} />, { wrapper: wrap });
    await user.tab();
    await user.tab();

    await user.keyboard("{ArrowDown}");
    expect(radio("Annual")).toHaveFocus();
    expect(checkedRadio()).toBe(radio("Annual"));
    expect(radio("Annual")).toHaveAttribute("tabindex", "0");
    expect(radio("Monthly")).toHaveAttribute("tabindex", "-1");

    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(radio("Monthly")).toHaveFocus();
    expect(checkedRadio()).toBe(radio("Monthly"));

    await user.keyboard("{ArrowUp}");
    expect(checkedRadio()).toBe(radio("Lifetime"));
    await user.keyboard("{ArrowLeft}");
    expect(checkedRadio()).toBe(radio("Annual"));

    expect(onChange.mock.calls.map(([value]) => value)).toEqual([
      "annual",
      "lifetime",
      "monthly",
      "lifetime",
      "annual",
    ]);
  });

  it("skips disabled radios", async () => {
    const user = userEvent.setup();
    render(
      <Page
        defaultValue="monthly"
        options={plans.map((plan) => ({ ...plan, disabled: plan.value === "annual" }))}
      />,
      { wrapper: wrap },
    );
    await user.tab();
    await user.tab();
    await user.keyboard("{ArrowDown}");
    expect(checkedRadio()).toBe(radio("Lifetime"));
    await user.keyboard("{ArrowUp}");
    expect(checkedRadio()).toBe(radio("Monthly"));
  });

  it("uses the same keys in a horizontal group, with Left and Right swapped in RTL", async () => {
    const user = userEvent.setup();
    render(
      <div dir="rtl">
        <RadioGroup label="Plan" options={plans} defaultValue="monthly" orientation="horizontal" />
      </div>,
      { wrapper: wrap },
    );
    await user.tab();
    await user.keyboard("{ArrowLeft}");
    expect(checkedRadio()).toBe(radio("Annual"));
    await user.keyboard("{ArrowRight}");
    expect(checkedRadio()).toBe(radio("Monthly"));
    await user.keyboard("{ArrowDown}");
    expect(checkedRadio()).toBe(radio("Annual"));
  });

  it("keeps the group reachable when the selected radio is disabled", () => {
    render(
      <RadioGroup
        label="Plan"
        value="annual"
        options={plans.map((plan) => ({ ...plan, disabled: plan.value === "annual" }))}
      />,
      { wrapper: wrap },
    );
    expect(radio("Monthly")).toHaveAttribute("tabindex", "0");
    expect(radio("Annual")).toHaveAttribute("tabindex", "-1");
  });
});

describe("RadioGroup: forms", () => {
  it("submits the selected value under its name, and nothing before a choice", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <RadioGroup label="Plan" name="plan" options={plans} />
      </form>,
      { wrapper: wrap },
    );
    expect(formValues(container, "plan")).toEqual([]);

    await user.click(radio("Annual"));
    expect(formValues(container, "plan")).toEqual(["annual"]);

    await user.keyboard("{ArrowDown}");
    expect(formValues(container, "plan")).toEqual(["lifetime"]);
  });

  it("submits nothing while disabled", () => {
    const { container } = render(
      <form>
        <RadioGroup label="Plan" name="plan" options={plans} defaultValue="annual" disabled />
      </form>,
      { wrapper: wrap },
    );
    expect(formValues(container, "plan")).toEqual([]);
  });
});

describe("RadioGroup: RadioButton children", () => {
  // Radio cards in a grid: a layout `options` cannot describe.
  const Cards = ({
    onPick,
    ...props
  }: Partial<React.ComponentProps<typeof RadioGroup>> & {
    onPick?: () => void;
  }) => (
    <form>
      <RadioGroup label="Size" name="size" {...props}>
        <Grid columns="2" gap="8">
          <RadioButton value="s" label="Small" />
          <RadioButton value="m" label="Medium" onCheckedChange={onPick} />
          <RadioButton value="l" label="Large" disabled />
          <RadioButton value="xl" label="Extra large" />
        </Grid>
      </RadioGroup>
    </form>
  );

  it("owns the checked state, name and focus of RadioButtons anywhere inside it", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onPick = vi.fn();
    const { container } = render(<Cards onValueChange={onChange} onPick={onPick} />, {
      wrapper: wrap,
    });

    expect(checkedRadio()).toBeNull();
    expect(radio("Small")).toHaveAttribute("tabindex", "0");
    expect(radio("Medium")).toHaveAttribute("tabindex", "-1");

    await user.click(radio("Medium"));
    expect(checkedRadio()).toBe(radio("Medium"));
    expect(onPick).toHaveBeenCalledTimes(1);
    expect(formValues(container, "size")).toEqual(["m"]);

    await user.keyboard("{ArrowDown}");
    expect(radio("Extra large")).toHaveFocus();
    expect(checkedRadio()).toBe(radio("Extra large"));
    expect(onChange.mock.calls.map(([value]) => value)).toEqual(["m", "xl"]);
    expect(formValues(container, "size")).toEqual(["xl"]);
  });

  it("renders options first, then children", () => {
    render(
      <RadioGroup label="Plan" options={plans.slice(0, 1)}>
        <RadioButton value="custom" label="Custom" />
      </RadioGroup>,
      { wrapper: wrap },
    );
    const values = screen.getAllByRole("radio").map((r) => r.getAttribute("data-value"));
    expect(values).toEqual(["monthly", "custom"]);
  });

  it("leaves a RadioButton outside any group as it was", async () => {
    const user = userEvent.setup();
    render(<RadioButton label="Alone" value="alone" />, { wrapper: wrap });
    const alone = radio("Alone");
    expect(alone).toHaveAttribute("tabindex", "0");
    expect(alone).not.toHaveAttribute("data-value");
    await user.click(alone);
    expect(alone).toBeChecked();
  });
});

describe("RadioGroup: rendering", () => {
  it("puts the right radio in the Tab order in the server render", () => {
    const selected = renderToString(
      <LayoutProvider>
        <RadioGroup label="Plan" options={plans} defaultValue="annual" />
      </LayoutProvider>,
    );
    expect(selected).toContain('role="radiogroup"');
    expect(selected.match(/tabindex="0"/g)).toHaveLength(1);
    expect(selected).toMatch(/aria-checked="true"[^>]*tabindex="0"[^>]*data-value="annual"/);

    const none = renderToString(
      <LayoutProvider>
        <RadioGroup label="Plan" options={plans} />
      </LayoutProvider>,
    );
    expect(none.match(/tabindex="0"/g)).toHaveLength(1);
    expect(none).toMatch(/tabindex="0"[^>]*data-value="monthly"/);
  });

  it("has no axe violations: options, horizontal, disabled and children", async () => {
    const { container, rerender } = render(
      <RadioGroup
        label="Plan"
        description="Change it any time"
        options={plans}
        defaultValue="annual"
      />,
      { wrapper: wrap },
    );
    await expectNoAxeViolations(container);

    rerender(<RadioGroup aria-label="Plan" orientation="horizontal" options={plans} disabled />);
    await expectNoAxeViolations(container);

    rerender(
      <RadioGroup label="Size" defaultValue="m">
        <RadioButton value="s" label="Small" />
        <RadioButton value="m" label="Medium" description="Fits most" />
      </RadioGroup>,
    );
    await expectNoAxeViolations(container);
  });
});
