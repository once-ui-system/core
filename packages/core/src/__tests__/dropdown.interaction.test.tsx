import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Dropdown } from "../components/Dropdown";
import { Option } from "../components/Option";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";
import { failOnConsoleError } from "../test/failOnConsoleError";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

failOnConsoleError();

/** The documented pattern: Dropdown's onSelect and each Option's onClick both pick. */
const Picker = ({
  disabled,
  onPick,
  onEscape,
}: {
  disabled?: boolean;
  onPick?: (value: string) => void;
  onEscape?: () => void;
}) => {
  const [selected, setSelected] = useState("");
  const handleSelect = (value: string) => {
    setSelected(value);
    onPick?.(value);
  };
  return (
    <Dropdown
      aria-label="Sort by"
      selectedOption={selected}
      onSelect={handleSelect}
      onEscape={onEscape}
      disabled={disabled}
      padding="4"
    >
      <Option label="Newest" value="newest" selected={selected === "newest"} />
      <Option label="Oldest" value="oldest" selected={selected === "oldest"} />
      <Option label="Archived" value="archived" disabled />
    </Dropdown>
  );
};

/**
 * Dropdown is the bare listbox panel; DropdownWrapper adds the trigger and
 * the popup. On its own it reads the clicked option's value and reports it
 * through onSelect, and `disabled` stops every way of picking.
 */
describe("Dropdown", () => {
  it("is a listbox of its options", async () => {
    const { container } = render(<Picker />, { wrapper: wrap });
    const listbox = screen.getByRole("listbox", { name: "Sort by" });
    expect(listbox).not.toHaveAttribute("aria-disabled");
    expect(screen.getAllByRole("option")).toHaveLength(3);
    await expectNoAxeViolations(container);
  });

  it("reports the clicked option's value once, and marks it selected", async () => {
    const user = userEvent.setup();
    const onPick = vi.fn();
    render(<Picker onPick={onPick} />, { wrapper: wrap });

    await user.click(screen.getByRole("option", { name: "Oldest" }));
    expect(onPick).toHaveBeenCalledTimes(1);
    expect(onPick).toHaveBeenCalledWith("oldest");
    expect(screen.getByRole("option", { name: "Oldest" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("option", { name: "Newest" })).not.toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  it("reports a value from a click inside an option, not just on it", async () => {
    const user = userEvent.setup();
    const onPick = vi.fn();
    render(<Picker onPick={onPick} />, { wrapper: wrap });
    await user.click(screen.getByText("Newest"));
    expect(onPick).toHaveBeenCalledWith("newest");
  });

  it("picks the focused option with Enter and Space", async () => {
    const user = userEvent.setup();
    const onPick = vi.fn();
    render(<Picker onPick={onPick} />, { wrapper: wrap });

    await user.tab();
    expect(screen.getByRole("option", { name: "Newest" })).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.tab();
    await user.keyboard(" ");
    expect(onPick.mock.calls).toEqual([["newest"], ["oldest"]]);
  });

  it("ignores a disabled option", async () => {
    const user = userEvent.setup();
    const onPick = vi.fn();
    render(<Picker onPick={onPick} />, { wrapper: wrap });
    const archived = screen.getByRole("option", { name: "Archived" });
    expect(archived).toHaveAttribute("aria-disabled", "true");
    await user.click(archived);
    expect(onPick).not.toHaveBeenCalled();
  });

  /** "Prevent interaction with the dropdown": an Option's own onClick picked anyway. */
  it("prevents every pick when disabled, an option's own onClick included", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onClick = vi.fn();
    const { container } = render(
      <Dropdown aria-label="Sort by" onSelect={onSelect} disabled>
        <Option label="Newest" value="newest" onClick={onClick} />
      </Dropdown>,
      { wrapper: wrap },
    );

    expect(screen.getByRole("listbox", { name: "Sort by" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await user.click(screen.getByRole("option", { name: "Newest" }));
    screen.getByRole("option", { name: "Newest" }).focus();
    await user.keyboard("{Enter}");
    expect(onClick).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
    await expectNoAxeViolations(container);
  });

  /** `onEscape` was accepted and never called. */
  it("calls onEscape when Escape is pressed inside it", async () => {
    const user = userEvent.setup();
    const onEscape = vi.fn();
    render(<Picker onEscape={onEscape} />, { wrapper: wrap });

    await user.tab();
    await user.keyboard("{Escape}");
    expect(onEscape).toHaveBeenCalledTimes(1);
    await user.keyboard("a");
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it("still runs a caller's onKeyDown and forwards its ref", async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();
    const ref = createRef<HTMLDivElement>();
    render(
      <Dropdown ref={ref} aria-label="Menu" onKeyDown={onKeyDown}>
        <Option label="One" value="one" />
      </Dropdown>,
      { wrapper: wrap },
    );
    expect(ref.current).toBe(screen.getByRole("listbox", { name: "Menu" }));
    await user.tab();
    await user.keyboard("{Escape}");
    expect(onKeyDown).toHaveBeenCalledTimes(1);
  });
});
