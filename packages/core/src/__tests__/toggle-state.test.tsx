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
 * `onCheckedChange` (2.x `onToggle`) receives the state the control moves to,
 * so a caller need not keep its own copy just to flip it. A callback that
 * ignores the argument is still assignable, so migrated call sites compile
 * and behave as before.
 */
describe("onCheckedChange receives the new checked state", () => {
  it("Checkbox passes true when ticked and false when unticked", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { rerender } = render(
      <Checkbox label="Terms" checked={false} onCheckedChange={onCheckedChange} />,
      {
        wrapper: wrap,
      },
    );

    await user.click(screen.getByRole("checkbox", { name: "Terms" }));
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);

    rerender(<Checkbox label="Terms" checked onCheckedChange={onCheckedChange} />);
    await user.keyboard("{Enter}");
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
  });

  it("RadioButton passes true when picked", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<RadioButton label="Monthly" checked={false} onCheckedChange={onCheckedChange} />, {
      wrapper: wrap,
    });

    await user.click(screen.getByRole("radio", { name: "Monthly" }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("Switch passes the new state from a click and from the keyboard", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { rerender } = render(
      <Switch label="Wi-Fi" checked={false} onCheckedChange={onCheckedChange} />,
      {
        wrapper: wrap,
      },
    );

    await user.click(screen.getByText("Wi-Fi"));
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);

    rerender(<Switch label="Wi-Fi" checked onCheckedChange={onCheckedChange} />);
    await user.tab();
    await user.keyboard(" ");
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
    expect(onCheckedChange).toHaveBeenCalledTimes(2);
  });

  it("drives a controlled control without a second copy of its state", async () => {
    const user = userEvent.setup();
    const Host = () => {
      const [on, setOn] = useState(false);
      return <Switch label="Sync" checked={on} onCheckedChange={setOn} />;
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
        <Checkbox label="A" checked={false} onCheckedChange={legacy} />
        <RadioButton label="B" checked={false} onCheckedChange={legacy} />
        <Switch label="C" checked={false} onCheckedChange={legacy} />
      </>,
      { wrapper: wrap },
    );

    await user.click(screen.getByRole("checkbox", { name: "A" }));
    await user.click(screen.getByRole("radio", { name: "B" }));
    await user.click(screen.getByText("C"));
    expect(legacy).toHaveBeenCalledTimes(3);
  });
});
