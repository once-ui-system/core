import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Button } from "../components/Button";
import { resetScrollLockState } from "../components/ScrollLock";
import { AdapterProvider } from "../contexts/AdapterProvider";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { Kbar, KbarContent, type KbarItem } from "../modules/navigation/Kbar";
import { expectNoAxeViolations } from "../test/axe";
import { resetDialogState } from "../test/dialogTestUtils";
import { failOnConsoleError } from "../test/failOnConsoleError";

failOnConsoleError();

const navigate = vi.fn();
const toggleTheme = vi.fn();
let pathname = "/";

const items: KbarItem[] = [
  {
    id: "home",
    name: "Home",
    section: "Navigation",
    shortcut: ["G", "H"],
    keywords: "",
    href: "/",
  },
  {
    id: "docs",
    name: "Docs",
    section: "Navigation",
    shortcut: [],
    keywords: "guide manual",
    href: "/docs",
    description: "Read the guides",
  },
  {
    id: "theme",
    name: "Toggle theme",
    section: "Actions",
    shortcut: [],
    keywords: "dark light",
    perform: toggleTheme,
    icon: "search",
  },
];

const adapters = { useNavigate: () => navigate, usePathname: () => pathname };

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <AdapterProvider adapters={adapters}>{children}</AdapterProvider>
  </LayoutProvider>
);

beforeEach(() => {
  navigate.mockClear();
  toggleTheme.mockClear();
  pathname = "/";
  resetScrollLockState();
  resetDialogState();
});

const palette = () => screen.queryByRole("dialog", { name: "Command palette" });
const search = () => screen.getByRole("combobox", { name: "Search" });
const trigger = () => screen.getByRole("button", { name: "Search" });

const renderKbar = () =>
  render(
    <Kbar items={items}>
      <Button prefixIcon="search">Search</Button>
    </Kbar>,
    { wrapper: wrap },
  );

const waitForPalette = async () => {
  await screen.findByRole("dialog", { name: "Command palette" });
  await waitFor(() => expect(search()).toHaveFocus());
};

/**
 * Kbar beyond the palette's own combobox (kbar.test.tsx): how it opens
 * (its trigger, from the keyboard too, and Cmd/Ctrl+K anywhere), what a click
 * on a result does, what the search matches, and how it closes. The trigger
 * is the element Tab reaches, so it is the button that says it opens a dialog;
 * it had no role.
 */
describe("Kbar trigger", () => {
  it("is one button that opens a dialog, reachable with Tab", async () => {
    const user = userEvent.setup();
    const { container } = renderKbar();
    expect(screen.getAllByRole("button", { name: "Search" })).toHaveLength(1);
    expect(trigger()).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    await user.tab();
    expect(trigger()).toHaveFocus();
    await expectNoAxeViolations(container);
  });

  it("opens on Enter and on Space", async () => {
    const user = userEvent.setup();
    renderKbar();
    await user.tab();
    await user.keyboard("{Enter}");
    await waitForPalette();
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(palette()).toBeNull());

    expect(trigger()).toHaveFocus();
    await user.keyboard(" ");
    await waitForPalette();
  });

  it("toggles with Cmd+K and Ctrl+K from anywhere", async () => {
    const user = userEvent.setup();
    renderKbar();
    await user.keyboard("{Meta>}k{/Meta}");
    await waitForPalette();
    await user.keyboard("{Control>}k{/Control}");
    await waitFor(() => expect(palette()).toBeNull());
    await user.keyboard("{Control>}k{/Control}");
    await waitForPalette();
  });

  it("ignores K without a modifier", async () => {
    const user = userEvent.setup();
    renderKbar();
    await user.keyboard("k");
    expect(palette()).toBeNull();
  });
});

describe("Kbar results", () => {
  const openPalette = async () => {
    const user = userEvent.setup();
    renderKbar();
    await user.click(trigger());
    await waitForPalette();
    return user;
  };

  it("runs a clicked action once and closes", async () => {
    const user = await openPalette();
    await user.click(screen.getByRole("option", { name: "Toggle theme" }));
    expect(toggleTheme).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(palette()).toBeNull());
  });

  it("renders a link result as a link to its href, and closes when it is followed", async () => {
    const user = await openPalette();
    const docs = screen.getByRole("option", { name: /Docs/ });
    expect(docs).toHaveAttribute("href", "/docs");
    expect(docs).toHaveTextContent("Read the guides");
    docs.addEventListener("click", (event) => event.preventDefault());
    await user.click(docs);
    await waitFor(() => expect(palette()).toBeNull());
  });

  it("shows each item's shortcut keys", async () => {
    await openPalette();
    const home = screen.getByRole("option", { name: /Home/ });
    expect(within(home).getByText("G")).toBeInTheDocument();
    expect(within(home).getByText("H")).toBeInTheDocument();
  });

  it("matches on keywords and on section names, case-insensitively", async () => {
    const user = await openPalette();
    await user.type(search(), "MANUAL");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("option", { name: /Docs/ })).toBeInTheDocument();

    await user.clear(search());
    await user.type(search(), "actions");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(screen.getByRole("group", { name: "Actions" })).toBeInTheDocument();
    expect(screen.queryByRole("group", { name: "Navigation" })).toBeNull();
  });

  it("starts empty again after closing", async () => {
    const user = await openPalette();
    await user.type(search(), "theme");
    await user.keyboard("{Escape}");
    await waitFor(() => expect(palette()).toBeNull());
    await user.click(trigger());
    await waitForPalette();
    expect(search()).toHaveValue("");
    expect(screen.getAllByRole("option")).toHaveLength(3);
  });

  it("closes on a click on the overlay, not on one inside the panel", async () => {
    const user = await openPalette();
    const dialog = palette() as HTMLElement;
    await user.click(dialog);
    expect(palette()).toBeInTheDocument();
    fireEvent.click(dialog.parentElement as HTMLElement);
    await waitFor(() => expect(palette()).toBeNull());
  });

  it("closes when the route changes", async () => {
    const user = userEvent.setup();
    const { rerender } = renderKbar();
    await user.click(trigger());
    await waitForPalette();
    pathname = "/docs";
    rerender(
      <Kbar items={items}>
        <Button prefixIcon="search">Search</Button>
      </Kbar>,
    );
    await waitFor(() => expect(palette()).toBeNull());
  });
});

describe("KbarContent", () => {
  it("renders nothing while closed, and takes its own placeholder", async () => {
    const onClose = vi.fn();
    const { rerender } = render(<KbarContent open={false} onClose={onClose} items={items} />, {
      wrapper: wrap,
    });
    expect(palette()).toBeNull();

    rerender(<KbarContent open onClose={onClose} items={items} placeholder="Jump to" />);
    expect(await screen.findByRole("combobox", { name: "Jump to" })).toBeInTheDocument();
  });

  it("calls onClose once on Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<KbarContent open onClose={onClose} items={items} />, { wrapper: wrap });
    await waitFor(() => expect(search()).toHaveFocus());
    await user.keyboard("{Escape}");
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
  });
});
