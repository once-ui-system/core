import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Select } from "../components/Select";
import { LayoutProvider } from "../contexts/LayoutProvider";

const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Bravo" },
  { value: "c", label: "Charlie" },
];

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const Single = ({ onSelect }: { onSelect?: (value: string) => void }) => {
  const [value, setValue] = useState("a");
  return (
    <>
      <button type="button">Before</button>
      <Select
        id="s"
        label="Pick"
        options={options}
        value={value}
        onSelect={(next) => {
          setValue(next as string);
          onSelect?.(next as string);
        }}
      />
      <button type="button">After</button>
    </>
  );
};

const field = () => screen.getByRole("combobox", { name: "Pick" }) as HTMLInputElement;
const isOpen = () => field().getAttribute("aria-expanded") === "true";
const option = (name: string) => screen.findByRole("option", { name });

/** The option the field points at: focus stays in the field, on a combobox. */
const expectActive = async (name: string) => {
  const active = await option(name);
  expect(field()).toHaveFocus();
  expect(field()).toHaveAttribute("aria-activedescendant", active.id);
};

/** Long enough for every deferred focus hand-off in the dropdown to have run. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 120));

const expectOpen = async () => {
  await waitFor(() => expect(isOpen()).toBe(true));
  await settle();
};

const expectStaysClosed = async () => {
  await settle();
  expect(isOpen()).toBe(false);
  expect(screen.queryAllByRole("option")).toHaveLength(0);
};

/**
 * Picking an option closed the list, the closing dropdown handed focus back
 * to the field, and the field opens on focus, so the list reopened at once.
 * A `justSelectedRef` meant to stop that was written on every pick and never
 * read. Stack and Shorty replaced Select with a local Picker because of it.
 */
describe("Select open state", () => {
  it("closes on pick, hands focus back to the field, and stays closed", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Single onSelect={onSelect} />, { wrapper: wrap });

    await user.click(field());
    await expectOpen();
    await user.click(await option("Bravo"));

    expect(onSelect).toHaveBeenCalledWith("b");
    await waitFor(() => expect(field()).toHaveFocus());
    expect(field().value).toBe("Bravo");
    await expectStaysClosed();
  });

  it("reopens on a click on the field it handed focus back to", async () => {
    const user = userEvent.setup();
    render(<Single />, { wrapper: wrap });

    await user.click(field());
    await expectOpen();
    await user.click(await option("Charlie"));
    await expectStaysClosed();

    await user.click(field());
    await expectOpen();
    expect(await option("Charlie")).toHaveAttribute("aria-selected", "true");
  });

  it("opens from the keyboard, picks with Enter and stays closed", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Single onSelect={onSelect} />, { wrapper: wrap });

    screen.getByRole("button", { name: "Before" }).focus();
    await user.tab();
    // Tabbing in opens the list on the selected option; focus stays in the field.
    await expectOpen();
    await expectActive("Alpha");

    // One step down from Alpha is Bravo.
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledWith("b");
    await waitFor(() => expect(field()).toHaveFocus());
    await expectStaysClosed();

    // The field still has focus; Enter opens it again.
    await user.keyboard("{Enter}");
    await expectOpen();
  });

  it("stays closed after Escape", async () => {
    const user = userEvent.setup();
    render(<Single />, { wrapper: wrap });

    await user.click(field());
    await expectOpen();
    await user.keyboard("{Escape}");

    await waitFor(() => expect(field()).toHaveFocus());
    await expectStaysClosed();
  });

  it("still opens when focus comes back later by Tab", async () => {
    const user = userEvent.setup();
    render(<Single />, { wrapper: wrap });

    await user.click(field());
    await expectOpen();
    await user.click(await option("Bravo"));
    await expectStaysClosed();

    // Leave, then come back: that focus is the user's, not the dropdown's.
    await user.click(screen.getByRole("button", { name: "After" }));
    await user.tab({ shift: true });
    await expectOpen();
    await expectActive("Bravo");
  });

  it("closes a searchable Select on pick and keeps it closed", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const Searchable = () => {
      const [value, setValue] = useState("a");
      return (
        <Select
          id="q"
          label="Pick"
          searchable
          options={options}
          value={value}
          onSelect={(next) => {
            setValue(next as string);
            onSelect(next);
          }}
        />
      );
    };
    render(<Searchable />, { wrapper: wrap });

    await user.click(field());
    await expectOpen();
    await user.click(await screen.findByPlaceholderText("Search"));
    await user.keyboard("cha");
    await waitFor(() => expect(screen.queryByRole("option", { name: "Alpha" })).toBeNull());
    await user.click(await option("Charlie"));

    expect(onSelect).toHaveBeenCalledWith("c");
    await waitFor(() => expect(field()).toHaveFocus());
    await expectStaysClosed();
  });

  it("keeps a multiple Select open while options are picked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const Multiple = () => {
      const [value, setValue] = useState<string[]>([]);
      return (
        <Select
          id="m"
          label="Pick"
          multiple
          options={options}
          value={value}
          onSelect={(next) => {
            setValue(next as string[]);
            onSelect(next);
          }}
        />
      );
    };
    render(<Multiple />, { wrapper: wrap });

    await user.click(field());
    await expectOpen();
    await user.click(await option("Alpha"));
    await settle();
    expect(isOpen()).toBe(true);
    await user.click(await option("Charlie"));
    await settle();

    expect(isOpen()).toBe(true);
    expect(onSelect).toHaveBeenLastCalledWith(["a", "c"]);
    expect(field().value).toBe("2 options selected");
  });
});
