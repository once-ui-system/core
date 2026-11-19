import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Dialog } from "../components/Dialog";
import { resetScrollLockState } from "../components/ScrollLock";
import { Select } from "../components/Select";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";
import { resetDialogState } from "../test/dialogTestUtils";
import { failOnConsoleError } from "../test/failOnConsoleError";
import { clearLastOpenedDropdown } from "../utils/dropdownState";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

failOnConsoleError();
beforeEach(() => {
  resetScrollLockState();
  clearLastOpenedDropdown();
});

const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Bravo" },
  { value: "c", label: "Charlie", disabled: true },
];

const field = (name = "Pick") => screen.getByRole("combobox", { name }) as HTMLInputElement;
const option = (name: string) => screen.getByRole("option", { name });
const isOpen = () => field().getAttribute("aria-expanded") === "true";

const open = async (user: ReturnType<typeof userEvent.setup>, name = "Pick") => {
  await user.click(field(name));
  await waitFor(() => expect(field(name)).toHaveAttribute("aria-expanded", "true"));
  await screen.findAllByRole("option");
};

/**
 * What the combobox suites (select-combobox, select-open-state) leave out:
 * every one of them controls `value`. Without it, a Select was controlled
 * anyway — `value` defaulted to "", so a pick was reported and never shown,
 * and a multiple Select reported one value at a time, never the list.
 */
describe("an uncontrolled Select", () => {
  it("shows the option picked and reports it once", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Select id="s" label="Pick" options={options} onValueChange={onSelect} />, {
      wrapper: wrap,
    });

    expect(field()).toHaveValue("");
    await open(user);
    await user.click(option("Bravo"));
    expect(onSelect.mock.calls).toEqual([["b"]]);
    expect(field()).toHaveValue("Bravo");

    await open(user);
    expect(option("Bravo")).toHaveAttribute("aria-selected", "true");
    expect(field()).toHaveAttribute("aria-activedescendant", option("Bravo").id);
  });

  it("keeps a multiple Select's list, adding and removing", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Select id="s" label="Pick" multiple options={options} onValueChange={onSelect} />, {
      wrapper: wrap,
    });

    await open(user);
    await user.click(option("Bravo"));
    await user.click(option("Alpha"));
    expect(field()).toHaveValue("2 options selected");
    await user.click(option("Bravo"));
    expect(field()).toHaveValue("Alpha");
    expect(onSelect.mock.calls).toEqual([[["b"]], [["b", "a"]], [["a"]]]);
    expect(option("Alpha")).toHaveAttribute("aria-selected", "true");
    expect(option("Bravo")).toHaveAttribute("aria-selected", "false");
  });
});

describe("a controlled Select", () => {
  it("shows its value and stays on it when the parent does not take the pick", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Select id="s" label="Pick" options={options} value="a" onValueChange={onSelect} />, {
      wrapper: wrap,
    });
    expect(field()).toHaveValue("Alpha");
    await open(user);
    await user.click(option("Bravo"));
    expect(onSelect).toHaveBeenCalledWith("b");
    expect(field()).toHaveValue("Alpha");
  });

  it("follows a new value from the parent", () => {
    const { rerender } = render(<Select id="s" label="Pick" options={options} value="a" />, {
      wrapper: wrap,
    });
    rerender(<Select id="s" label="Pick" options={options} value="b" />);
    expect(field()).toHaveValue("Bravo");
  });
});

describe("Select options", () => {
  it("runs an option's own onClick with its value as well as onSelect", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onSelect = vi.fn();
    render(
      <Select
        id="s"
        label="Pick"
        options={[{ value: "a", label: "Alpha", onClick }, ...options.slice(1)]}
        onValueChange={onSelect}
      />,
      { wrapper: wrap },
    );
    await open(user);
    await user.click(option("Alpha"));
    expect(onClick.mock.calls).toEqual([["a"]]);
    expect(onSelect.mock.calls).toEqual([["a"]]);
  });

  it("does not pick a disabled option from a click", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Select id="s" label="Pick" options={options} onValueChange={onSelect} />, {
      wrapper: wrap,
    });
    await open(user);
    expect(option("Charlie")).toHaveAttribute("aria-disabled", "true");
    await user.click(option("Charlie"));
    expect(onSelect).not.toHaveBeenCalled();
    expect(isOpen()).toBe(true);
  });

  it("picks the last enabled option with End, then Enter", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Select id="s" label="Pick" options={options} onValueChange={onSelect} />, {
      wrapper: wrap,
    });
    await user.tab();
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(isOpen()).toBe(true));
    await user.keyboard("{End}{Enter}");
    expect(onSelect.mock.calls).toEqual([["b"]]);
  });
});

describe("Select field props", () => {
  it("is described by its description and its error", async () => {
    const { container } = render(
      <Select
        id="s"
        label="Plan"
        options={options}
        description="Billed monthly"
        errorMessage="Pick a plan"
      />,
      { wrapper: wrap },
    );
    expect(field("Plan")).toHaveAccessibleDescription(/Billed monthly/);
    expect(field("Plan")).toHaveAccessibleDescription(/Pick a plan/);
    await expectNoAxeViolations(container);
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    render(<Select id="s" label="Pick" options={options} disabled />, { wrapper: wrap });
    expect(field()).toBeDisabled();
    await user.click(field());
    await user.tab();
    expect(field()).not.toHaveFocus();
    expect(isOpen()).toBe(false);
  });
});

describe("a searchable Select", () => {
  it("shows the emptyState when nothing matches, and translates its search field", async () => {
    const user = userEvent.setup();
    render(
      <Select
        id="s"
        label="Pick"
        searchable
        options={options}
        emptyState={<span>Nothing like that</span>}
        labels={{ search: "Suchen", clear: "Leeren" }}
      />,
      { wrapper: wrap },
    );
    await open(user);
    const query = await screen.findByRole("combobox", { name: "Suchen" });
    await waitFor(() => expect(query).toHaveFocus());

    await user.keyboard("zzz");
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText("Nothing like that")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Leeren" }));
    expect(query).toHaveValue("");
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("filters case-insensitively and picks the first match with Enter", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Select id="s" label="Pick" searchable options={options} onValueChange={onSelect} />, {
      wrapper: wrap,
    });
    await open(user);
    const query = await screen.findByRole("combobox", { name: "Search" });
    await waitFor(() => expect(query).toHaveFocus());
    await user.keyboard("BRA");
    expect(screen.getAllByRole("option").map((el) => el.textContent)).toEqual(["Bravo"]);
    await user.keyboard("{Enter}");
    expect(onSelect.mock.calls).toEqual([["b"]]);
    expect(field()).toHaveValue("Bravo");
  });
});

describe("Select in a Modal", () => {
  it("closes its own list on Escape and leaves the Modal open", async () => {
    const user = userEvent.setup();
    resetDialogState();
    const Harness = () => {
      const [open, setOpen] = useState(true);
      return (
        <Dialog variant="sheet" open={open} onClose={() => setOpen(false)} title="Settings">
          <Select id="s" label="Pick" options={options} />
        </Dialog>
      );
    };
    render(<Harness />, { wrapper: wrap });
    const dialog = await screen.findByRole("dialog");
    await open(user);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(isOpen()).toBe(false));
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole("combobox", { name: "Pick" })).toHaveFocus();
  });
});
