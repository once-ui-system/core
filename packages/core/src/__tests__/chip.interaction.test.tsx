import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Chip } from "../components/Chip";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * Chips as a filter row a keyboard user works through: Tab visits each chip
 * (and its remove button), Enter and Space toggle a chip whose pressed state
 * follows its parent, and a caller's own onKeyDown runs without taking the
 * keyboard activation away.
 */
describe("Chip: interaction", () => {
  const Filters = () => {
    const [on, setOn] = useState<string[]>(["Open"]);
    const toggle = (label: string) =>
      setOn((current) =>
        current.includes(label) ? current.filter((l) => l !== label) : [...current, label],
      );
    return (
      <>
        {["Open", "Closed", "Draft"].map((label) => (
          <Chip
            key={label}
            label={label}
            selected={on.includes(label)}
            onClick={() => toggle(label)}
          />
        ))}
      </>
    );
  };

  it("tabs through the chips and toggles each from the keyboard", async () => {
    const user = userEvent.setup();
    const { container } = render(<Filters />, { wrapper: wrap });
    const chip = (name: string) => screen.getByRole("button", { name });
    expect(chip("Open")).toHaveAttribute("aria-pressed", "true");
    expect(chip("Closed")).toHaveAttribute("aria-pressed", "false");

    await user.tab();
    expect(chip("Open")).toHaveFocus();
    await user.keyboard(" ");
    expect(chip("Open")).toHaveAttribute("aria-pressed", "false");
    await user.tab();
    await user.keyboard("{Enter}");
    expect(chip("Closed")).toHaveAttribute("aria-pressed", "true");
    await user.tab();
    expect(chip("Draft")).toHaveFocus();
    await expectNoAxeViolations(container);
  });

  it("visits a removable chip, then its remove button, in Tab order", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <Chip
        label="Berlin"
        onRemove={onRemove}
        iconButtonProps={{ "aria-label": "Remove Berlin" }}
      />,
      { wrapper: wrap },
    );
    await user.tab();
    expect(screen.getByRole("button", { name: "Berlin" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Remove Berlin" })).toHaveFocus();
    await user.keyboard(" ");
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  // The caller's props were spread over the chip's own key handler, so a
  // chip given `onKeyDown` stopped answering Enter and Space.
  it("still activates on Enter and Space with a caller's onKeyDown, which sees the keys", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onKeyDown = vi.fn();
    render(<Chip label="Tagged" onClick={onClick} onKeyDown={onKeyDown} />, { wrapper: wrap });
    await user.tab();
    await user.keyboard("{Enter} ");
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(onKeyDown.mock.calls.map(([event]) => event.key)).toEqual(["Enter", " "]);
  });

  it("lets a caller's onKeyDown cancel the activation", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Chip
        label="Guarded"
        onClick={onClick}
        onKeyDown={(event) => {
          if (event.key === " ") event.preventDefault();
        }}
      />,
      { wrapper: wrap },
    );
    await user.tab();
    await user.keyboard(" {Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("shows children when its label is empty", () => {
    render(<Chip label="">Fallback</Chip>, { wrapper: wrap });
    expect(screen.getByRole("button", { name: "Fallback" })).toBeInTheDocument();
  });
});
