import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { RadioButton } from "../components/RadioButton";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const radio = (name: string) => screen.getByRole("radio", { name });

/**
 * A RadioButton on its own, outside a RadioGroup: one focusable `radio` named
 * by its label, picked by a click, Space or Enter, reporting `true` through
 * `onToggle` and a real `change` through `onChange` (what form libraries
 * listen to), with its hidden input carrying the value to a form.
 */
describe("RadioButton: interaction", () => {
  it("is a single focusable radio named by its label and described by its description", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <RadioButton label="Email me" description="At most once a week" value="email" />,
      { wrapper: wrap },
    );
    expect(screen.getAllByRole("radio")).toHaveLength(1);
    await user.tab();
    expect(radio("Email me")).toHaveFocus();
    expect(radio("Email me")).toHaveAccessibleDescription("At most once a week");
    expect(radio("Email me")).not.toBeChecked();
    await expectNoAxeViolations(container);
  });

  it("is picked by Space, Enter and a click, reporting true each time it becomes picked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const { unmount } = render(<RadioButton label="A" onCheckedChange={onToggle} />, {
      wrapper: wrap,
    });
    await user.tab();
    await user.keyboard(" ");
    expect(radio("A")).toBeChecked();
    expect(onToggle).toHaveBeenLastCalledWith(true);
    unmount();

    render(<RadioButton label="B" onCheckedChange={onToggle} />, { wrapper: wrap });
    await user.tab();
    await user.keyboard("{Enter}");
    expect(radio("B")).toBeChecked();
    expect(onToggle).toHaveBeenCalledTimes(2);
  });

  it("fires a change event the caller's onChange sees, with the input checked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn((event: React.ChangeEvent<HTMLInputElement>) => event.target.checked);
    render(<RadioButton label="Pick" name="choice" value="x" onChange={onChange} />, {
      wrapper: wrap,
    });
    await user.click(radio("Pick"));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.results[0].value).toBe(true);
  });

  // 3.0: every change goes through the native input, so, as a native radio,
  // a second press leaves it picked (2.x un-picked a lone RadioButton).
  it("stays picked on a second press when it stands alone, as a native radio", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<RadioButton label="Twice" onCheckedChange={onCheckedChange} />, { wrapper: wrap });
    await user.click(radio("Twice"));
    await user.click(radio("Twice"));
    expect(onCheckedChange.mock.calls).toEqual([[true]]);
    expect(radio("Twice")).toBeChecked();
  });

  it("selects from a click on the label", async () => {
    const user = userEvent.setup();
    render(<RadioButton label="By label" />, { wrapper: wrap });
    await user.click(screen.getByText("By label"));
    expect(radio("By label")).toBeChecked();
  });

  it("starts from defaultChecked and submits its value with a form", () => {
    const { container } = render(
      <form>
        <RadioButton label="Yes" name="answer" value="yes" defaultChecked />
      </form>,
      { wrapper: wrap },
    );
    expect(radio("Yes")).toBeChecked();
    expect(new FormData(container.querySelector("form") as HTMLFormElement).get("answer")).toBe(
      "yes",
    );
  });

  it("is controlled by `checked`", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const { rerender } = render(
      <RadioButton label="C" checked={false} onCheckedChange={onToggle} />,
      {
        wrapper: wrap,
      },
    );
    await user.click(radio("C"));
    expect(onToggle).toHaveBeenCalledWith(true);
    expect(radio("C")).not.toBeChecked();
    rerender(<RadioButton label="C" checked onCheckedChange={onToggle} />);
    expect(radio("C")).toBeChecked();
  });

  it("drives a parent's state", async () => {
    const user = userEvent.setup();
    const Pair = () => {
      const [value, setValue] = useState("a");
      return (
        <>
          <RadioButton
            label="Apple"
            checked={value === "a"}
            onCheckedChange={() => setValue("a")}
          />
          <RadioButton label="Pear" checked={value === "p"} onCheckedChange={() => setValue("p")} />
        </>
      );
    };
    render(<Pair />, { wrapper: wrap });
    await user.click(radio("Pear"));
    expect(radio("Pear")).toBeChecked();
    expect(radio("Apple")).not.toBeChecked();
  });

  it("calls focus and blur handlers with the hidden input as the target", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLInputElement>();
    const targets: EventTarget[] = [];
    render(
      <RadioButton
        ref={ref}
        label="Focus me"
        onFocus={(event) => targets.push(event.target)}
        onBlur={(event) => targets.push(event.target)}
      />,
      { wrapper: wrap },
    );
    await user.tab();
    await user.tab();
    expect(targets).toEqual([ref.current, ref.current]);
    expect(ref.current).toHaveAttribute("type", "radio");
  });

  it("is out of the Tab order and ignores presses while disabled", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const { container } = render(
      <>
        <RadioButton label="Off" disabled onCheckedChange={onToggle} />
        <button type="button">After</button>
      </>,
      { wrapper: wrap },
    );
    expect(radio("Off")).toHaveAttribute("aria-disabled", "true");
    await user.tab();
    expect(screen.getByRole("button", { name: "After" })).toHaveFocus();
    await user.click(radio("Off"));
    await user.click(screen.getByText("Off"));
    expect(onToggle).not.toHaveBeenCalled();
    expect(radio("Off")).not.toBeChecked();
    await expectNoAxeViolations(container);
  });

  it("is named by aria-label when it has no label", () => {
    render(<RadioButton aria-label="Unlabelled option" />, { wrapper: wrap });
    expect(radio("Unlabelled option")).toBeInTheDocument();
  });
});
