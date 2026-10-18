import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { RadioButton } from "../components/RadioButton";
import { RadioGroup, type RadioGroupOption } from "../components/RadioGroup";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const sizes: RadioGroupOption[] = [
  { value: "s", label: "Small" },
  { value: "m", label: "Medium" },
  { value: "l", label: "Large" },
];

const radio = (name: string) => screen.getByRole("radio", { name });

/**
 * RadioGroup driven the way a keyboard user drives it: Tab enters on one
 * radio and leaves the group in one more press, Space or Enter picks the
 * focused radio when none is picked yet, a label click selects, and the
 * group's own handlers see its keys first.
 */
describe("RadioGroup: interaction", () => {
  it("enters on one radio and leaves the whole group with the next Tab", async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Before</button>
        <RadioGroup label="Size" options={sizes} defaultValue="m" />
        <button type="button">After</button>
      </>,
      { wrapper: wrap },
    );
    await user.tab();
    await user.tab();
    expect(radio("Medium")).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
    await user.tab({ shift: true });
    expect(radio("Medium")).toHaveFocus();
  });

  it("picks the focused radio with Space or Enter while none is picked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { unmount } = render(<RadioGroup label="Size" options={sizes} onChange={onChange} />, {
      wrapper: wrap,
    });
    await user.tab();
    expect(radio("Small")).toHaveFocus();
    await user.keyboard(" ");
    expect(radio("Small")).toBeChecked();
    expect(onChange).toHaveBeenCalledWith("s");
    unmount();

    render(<RadioGroup label="Size" options={sizes} onChange={onChange} />, { wrapper: wrap });
    await user.tab();
    await user.keyboard("{Enter}");
    expect(radio("Small")).toBeChecked();
  });

  it("does not report again when the picked radio is pressed again", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RadioGroup label="Size" options={sizes} defaultValue="l" onChange={onChange} />, {
      wrapper: wrap,
    });
    await user.click(radio("Large"));
    await user.keyboard(" ");
    expect(onChange).not.toHaveBeenCalled();
    expect(radio("Large")).toBeChecked();
  });

  it("selects from a click on the option's label text", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RadioGroup label="Size" options={sizes} onChange={onChange} />, { wrapper: wrap });
    await user.click(screen.getByText("Large"));
    expect(onChange).toHaveBeenCalledWith("l");
    expect(radio("Large")).toBeChecked();
    expect(screen.getAllByRole("radio", { checked: true })).toHaveLength(1);
  });

  it("calls the caller's onKeyDown first, and lets it take over a key", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onKeyDown = vi.fn((event: React.KeyboardEvent) => {
      if (event.key === "ArrowDown") event.preventDefault();
    });
    render(
      <RadioGroup
        label="Size"
        options={sizes}
        defaultValue="s"
        onChange={onChange}
        onKeyDown={onKeyDown}
      />,
      { wrapper: wrap },
    );
    await user.tab();
    await user.keyboard("{ArrowDown}");
    expect(onKeyDown).toHaveBeenCalled();
    expect(radio("Small")).toHaveFocus();
    expect(onChange).not.toHaveBeenCalled();
    await user.keyboard("{ArrowRight}");
    expect(radio("Medium")).toBeChecked();
  });

  it("leaves arrow keys with a modifier alone", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<RadioGroup label="Size" options={sizes} defaultValue="s" onChange={onChange} />, {
      wrapper: wrap,
    });
    await user.tab();
    await user.keyboard("{Control>}{ArrowDown}{/Control}");
    expect(onChange).not.toHaveBeenCalled();
    expect(radio("Small")).toHaveFocus();
  });

  it("drives a controlled parent with arrow keys over mixed options and children", async () => {
    const user = userEvent.setup();
    const Controlled = () => {
      const [value, setValue] = useState("s");
      return (
        <>
          <RadioGroup label="Size" options={sizes} value={value} onChange={setValue}>
            <RadioButton value="custom" label="Custom" />
          </RadioGroup>
          <output>{value}</output>
        </>
      );
    };
    render(<Controlled />, { wrapper: wrap });
    await user.tab();
    await user.keyboard("{ArrowUp}");
    expect(radio("Custom")).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent("custom");
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("status")).toHaveTextContent("s");
  });

  it("describes each option with its description, and passes axe", async () => {
    const { container } = render(
      <RadioGroup
        label="Delivery"
        options={[
          { value: "std", label: "Standard", description: "3–5 days" },
          { value: "exp", label: "Express", description: "Next day" },
        ]}
        defaultValue="std"
      />,
      { wrapper: wrap },
    );
    expect(radio("Express")).toHaveAccessibleDescription("Next day");
    await expectNoAxeViolations(container);
  });
});
