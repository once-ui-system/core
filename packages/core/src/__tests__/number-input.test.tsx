import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { NumberInput } from "../components/NumberInput";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const field = () => screen.getByRole("spinbutton") as HTMLInputElement;

/**
 * NumberInput seeded its text from `value` once and ignored every later
 * `value`, so a number changed from outside the field (an undo, a reset, a
 * timeline drag) left it showing the old one. Shorty remounted it with a
 * `key` on every such change. It follows the prop now, without fighting the
 * user's typing.
 */
describe("NumberInput follows its value", () => {
  it("shows a value changed from outside", () => {
    const { rerender } = render(<NumberInput id="n" label="Amount" value={1} />, {
      wrapper: wrap,
    });
    expect(field().value).toBe("1");

    rerender(<NumberInput id="n" label="Amount" value={42} />);
    expect(field().value).toBe("42");

    rerender(<NumberInput id="n" label="Amount" value={undefined} />);
    expect(field().value).toBe("");
  });

  it("still applies padStart to a followed value", () => {
    const { rerender } = render(<NumberInput id="n" label="Minutes" value={5} padStart={2} />, {
      wrapper: wrap,
    });
    expect(field().value).toBe("05");

    rerender(<NumberInput id="n" label="Minutes" value={7} padStart={2} />);
    expect(field().value).toBe("07");
  });

  /**
   * Each keystroke reports a number and the parent passes it straight back,
   * so the prop changes on every keystroke. The text must stay what the user
   * typed, not be rewritten to how the number would print: "05" reports 5,
   * and following it naively would turn the field into "5" under the cursor.
   */
  it("keeps the user's own text when the parent echoes it back", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const Controlled = () => {
      const [value, setValue] = useState<number | undefined>(1);
      return (
        <NumberInput
          id="n"
          label="Amount"
          value={value}
          onValueChange={(next) => {
            onChange(next);
            setValue(next);
          }}
        />
      );
    };
    render(<Controlled />, { wrapper: wrap });

    // Driven by `change` events: user-event normalises "05" to "5" in a
    // number field on its own, which would hide what the component does.
    fireEvent.change(field(), { target: { value: "0" } });
    fireEvent.change(field(), { target: { value: "05" } });
    expect(onChange).toHaveBeenLastCalledWith(5);
    expect(field().value).toBe("05");

    fireEvent.change(field(), { target: { value: "5.10" } });
    expect(onChange).toHaveBeenLastCalledWith(5.1);
    expect(field().value).toBe("5.10");

    await user.clear(field());
    await user.type(field(), "-1.5");
    expect(field().value).toBe("-1.5");
    expect(onChange).toHaveBeenLastCalledWith(-1.5);
  });

  /**
   * A browser reports a number field's partial text ("-", and "1." in some
   * engines) as an empty value. The field must not "correct" that to the
   * prop on the next render: the prop has not changed, the user is typing.
   */
  it("keeps a partial entry the browser reports as empty while the parent re-renders", () => {
    const { rerender } = render(<NumberInput id="n" label="Offset" value={3} />, {
      wrapper: wrap,
    });

    act(() => field().focus());
    fireEvent.change(field(), { target: { value: "" } });
    rerender(<NumberInput id="n" label="Offset" value={3} />);
    expect(field().value).toBe("");
  });

  it("shows what the parent settles on when it corrects the entry", async () => {
    const user = userEvent.setup();
    const Clamped = () => {
      const [value, setValue] = useState(10);
      return (
        <NumberInput
          id="n"
          label="Percent"
          value={value}
          onValueChange={(next) => setValue(Math.min(next, 100))}
        />
      );
    };
    render(<Clamped />, { wrapper: wrap });

    await user.clear(field());
    await user.type(field(), "150");
    expect(field().value).toBe("100");
  });

  it("follows an outside change made while the user is mid-edit", () => {
    const { rerender } = render(<NumberInput id="n" label="Offset" value={3} />, {
      wrapper: wrap,
    });

    act(() => field().focus());
    fireEvent.change(field(), { target: { value: "" } });
    rerender(<NumberInput id="n" label="Offset" value={8} />);
    expect(field().value).toBe("8");
  });

  it("steps from the followed value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <NumberInput id="n" label="Count" value={1} onValueChange={onChange} />,
      { wrapper: wrap },
    );
    rerender(<NumberInput id="n" label="Count" value={9} onValueChange={onChange} />);

    await user.click(screen.getByRole("button", { name: "Increment value" }));
    expect(onChange).toHaveBeenLastCalledWith(10);
    expect(field().value).toBe("10");
  });

  it("has no axe violations", async () => {
    const { container } = render(<NumberInput id="n" label="Amount" value={1} />, {
      wrapper: wrap,
    });
    await expectNoAxeViolations(container);
  });
});
