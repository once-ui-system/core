import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { resetScrollLockState } from "../components/ScrollLock";
import { AdapterProvider } from "../contexts/AdapterProvider";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { Kbar, type KbarItem } from "../modules/navigation/Kbar";
import { expectNoAxeViolations } from "../test/axe";
import { resetDialogState } from "../test/dialogTestUtils";

const navigate = vi.fn();
const toggleTheme = vi.fn();

const items: KbarItem[] = [
  {
    id: "home",
    name: "Home",
    section: "Navigation",
    shortcut: ["G", "H"],
    keywords: "",
    href: "/",
  },
  { id: "docs", name: "Docs", section: "Navigation", shortcut: [], keywords: "", href: "/docs" },
  {
    id: "theme",
    name: "Toggle theme",
    section: "Actions",
    shortcut: [],
    keywords: "dark light",
    perform: toggleTheme,
  },
];

const adapters = { useNavigate: () => navigate, usePathname: () => "/" };

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <AdapterProvider adapters={adapters}>{children}</AdapterProvider>
  </LayoutProvider>
);

const openKbar = async () => {
  const user = userEvent.setup();
  render(
    <Kbar items={items}>
      <span>Open command palette</span>
    </Kbar>,
    { wrapper: wrap },
  );
  const trigger = screen.getByText("Open command palette").parentElement as HTMLElement;
  await user.click(trigger);
  const dialog = await screen.findByRole("dialog", { name: "Command palette" });
  const input = within(dialog).getByRole("combobox", { name: "Search" });
  await waitFor(() => expect(input).toHaveFocus());
  return { user, trigger, dialog, input };
};

const activeOption = (input: HTMLElement) => {
  const id = input.getAttribute("aria-activedescendant");
  return id ? document.getElementById(id) : null;
};

beforeEach(() => {
  navigate.mockClear();
  toggleTheme.mockClear();
  resetScrollLockState();
  resetDialogState();
});

/** Command palette semantics (ROADMAP W3): a modal dialog holding a combobox and its listbox. */
describe("Kbar accessibility", () => {
  it("is a modal dialog with a combobox that controls a listbox of grouped options", async () => {
    const { dialog, input } = await openKbar();

    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(input).toHaveAttribute("aria-expanded", "true");
    const listbox = screen.getByRole("listbox", { name: "Results" });
    expect(input).toHaveAttribute("aria-controls", listbox.id);

    expect(within(listbox).getByRole("group", { name: "Navigation" })).toBeInTheDocument();
    expect(within(listbox).getByRole("group", { name: "Actions" })).toBeInTheDocument();
    expect(within(listbox).getAllByRole("option")).toHaveLength(3);

    await expectNoAxeViolations(document.body);
  });

  it("starts on the first option, marked selected", async () => {
    const { input } = await openKbar();
    const first = activeOption(input);
    expect(first).toHaveAccessibleName(/^Home/);
    expect(first).toHaveAttribute("aria-selected", "true");
    for (const option of screen.getAllByRole("option").slice(1)) {
      expect(option).toHaveAttribute("aria-selected", "false");
    }
  });

  it("moves the active option with the arrow keys while focus stays in the search", async () => {
    const { user, input } = await openKbar();

    await user.keyboard("{ArrowDown}");
    expect(activeOption(input)).toHaveAccessibleName("Docs");
    expect(activeOption(input)).toHaveAttribute("aria-selected", "true");
    expect(input).toHaveFocus();

    await user.keyboard("{ArrowDown}{ArrowDown}");
    expect(activeOption(input)).toHaveAccessibleName(/^Home/);

    await user.keyboard("{ArrowUp}");
    expect(activeOption(input)).toHaveAccessibleName("Toggle theme");
    await user.keyboard("{Home}");
    expect(activeOption(input)).toHaveAccessibleName(/^Home/);
    await user.keyboard("{End}");
    expect(activeOption(input)).toHaveAccessibleName("Toggle theme");
  });

  it("runs the active option on Enter", async () => {
    const { user } = await openKbar();
    await user.keyboard("{ArrowDown}{Enter}");
    expect(navigate).toHaveBeenCalledWith("/docs");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("filters as you type, spaces included, and restarts at the first result", async () => {
    const { user, input } = await openKbar();
    await user.keyboard("{ArrowDown}");
    await user.type(input, "toggle th");

    expect(input).toHaveValue("toggle th");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(activeOption(input)).toHaveAccessibleName("Toggle theme");

    await user.keyboard("{Enter}");
    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });

  it("collapses the popup when nothing matches", async () => {
    const { user, input } = await openKbar();
    await user.type(input, "zzz");

    expect(input).toHaveAttribute("aria-expanded", "false");
    expect(input).not.toHaveAttribute("aria-controls");
    expect(input).not.toHaveAttribute("aria-activedescendant");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(screen.getByText("No results found")).toBeInTheDocument();
    await expectNoAxeViolations(document.body);
  });

  it("follows the pointer", async () => {
    const { user, input } = await openKbar();
    await user.hover(
      within(screen.getByRole("option", { name: "Toggle theme" })).getByText("Toggle theme"),
    );
    expect(activeOption(input)).toHaveAccessibleName("Toggle theme");
  });

  it("keeps Tab inside the dialog", async () => {
    const { user, input } = await openKbar();
    await user.tab();
    expect(input).toHaveFocus();
    await user.tab({ shift: true });
    expect(input).toHaveFocus();
  });

  it("returns focus to the trigger when closed with Escape", async () => {
    const { user, trigger } = await openKbar();
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(trigger).toHaveFocus();
  });

  it("puts its placeholder on the palette's search, not on the trigger", async () => {
    const user = userEvent.setup();
    render(
      <Kbar items={items} placeholder="Search posts">
        <span>Open command palette</span>
      </Kbar>,
      { wrapper: wrap },
    );
    const trigger = screen.getByText("Open command palette").parentElement as HTMLElement;
    expect(trigger).not.toHaveAttribute("placeholder");
    await user.click(trigger);
    const dialog = await screen.findByRole("dialog", { name: "Command palette" });
    expect(within(dialog).getByRole("combobox", { name: "Search posts" })).toHaveAttribute(
      "placeholder",
      "Search posts",
    );
  });
});

/** Opening from a Button: the palette was only reachable through its own wrapper row. */
describe("Kbar controlled", () => {
  const Controlled = ({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) => {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>
          Search
        </button>
        <Kbar
          items={items}
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            onOpenChange?.(next);
          }}
        />
      </>
    );
  };

  it("opens from a button elsewhere and renders no trigger of its own", async () => {
    const user = userEvent.setup();
    const { container } = render(<Controlled />, { wrapper: wrap });
    expect(container.querySelectorAll("[tabindex='0']")).toHaveLength(0);
    await user.click(screen.getByRole("button", { name: "Search" }));
    expect(await screen.findByRole("dialog", { name: "Command palette" })).toBeInTheDocument();
  });

  it("reports Escape and the shortcut through onOpenChange", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Controlled onOpenChange={onOpenChange} />, { wrapper: wrap });
    await user.keyboard("{Control>}k{/Control}");
    await screen.findByRole("dialog", { name: "Command palette" });
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
  });

  it("stays open on mount when it starts open", async () => {
    render(<Kbar items={items} open onOpenChange={() => {}} />, { wrapper: wrap });
    expect(await screen.findByRole("dialog", { name: "Command palette" })).toBeInTheDocument();
  });
});
