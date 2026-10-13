import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "../components/Checkbox";
import { RadioButton } from "../components/RadioButton";
import { Switch } from "../components/Switch";
import { LayoutProvider } from "../contexts/LayoutProvider";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * `onToggle` used to be `() => void`, so every caller had to keep its own copy
 * of the state just to flip it: `onToggle={() => setOn(!on)}`. It now receives
 * the state the control moves to. A callback that ignores the argument is
 * still assignable, so 2.0 call sites compile and behave as before.
 */
describe("onToggle receives the new checked state", () => {
  it("Checkbox passes true when ticked and false when unticked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const { rerender } = render(<Checkbox label="Terms" checked={false} onToggle={onToggle} />, {
      wrapper: wrap,
    });

    await user.click(screen.getByRole("checkbox", { name: "Terms" }));
    expect(onToggle).toHaveBeenLastCalledWith(true);

    rerender(<Checkbox label="Terms" checked onToggle={onToggle} />);
    await user.keyboard("{Enter}");
    expect(onToggle).toHaveBeenLastCalledWith(false);
  });

  it("RadioButton passes true when picked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<RadioButton label="Monthly" checked={false} onToggle={onToggle} />, {
      wrapper: wrap,
    });

    await user.click(screen.getByRole("radio", { name: "Monthly" }));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it("Switch passes the new state from a click and from the keyboard", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    const { rerender } = render(<Switch label="Wi-Fi" checked={false} onToggle={onToggle} />, {
      wrapper: wrap,
    });

    await user.click(screen.getByText("Wi-Fi"));
    expect(onToggle).toHaveBeenLastCalledWith(true);

    rerender(<Switch label="Wi-Fi" checked onToggle={onToggle} />);
    await user.tab();
    await user.keyboard(" ");
    expect(onToggle).toHaveBeenLastCalledWith(false);
    expect(onToggle).toHaveBeenCalledTimes(2);
  });

  it("drives a controlled control without a second copy of its state", async () => {
    const user = userEvent.setup();
    const Host = () => {
      const [on, setOn] = useState(false);
      return <Switch label="Sync" checked={on} onToggle={setOn} />;
    };
    render(<Host />, { wrapper: wrap });

    const control = screen.getByRole("switch", { name: "Sync" });
    await user.click(control);
    expect(control).toBeChecked();
    await user.click(control);
    expect(control).not.toBeChecked();
  });

  it("still accepts a callback that takes no argument", async () => {
    const user = userEvent.setup();
    const legacy: () => void = vi.fn();
    render(
      <>
        <Checkbox label="A" checked={false} onToggle={legacy} />
        <RadioButton label="B" checked={false} onToggle={legacy} />
        <Switch label="C" checked={false} onToggle={legacy} />
      </>,
      { wrapper: wrap },
    );

    await user.click(screen.getByRole("checkbox", { name: "A" }));
    await user.click(screen.getByRole("radio", { name: "B" }));
    await user.click(screen.getByText("C"));
    expect(legacy).toHaveBeenCalledTimes(3);
  });
});
