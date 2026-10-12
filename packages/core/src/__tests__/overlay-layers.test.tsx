import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Dialog } from "../components/Dialog";
import { Drawer } from "../components/Drawer";
import { resetScrollLockState } from "../components/ScrollLock";
import { AdapterProvider } from "../contexts/AdapterProvider";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { Kbar, type KbarItem } from "../modules/navigation/Kbar";
import { resetDialogState } from "../test/dialogTestUtils";

/**
 * Overlays opened from inside other overlays. An app's mobile menu is a
 * Drawer whose top bar repeats the header: a logo drawn once per theme (the
 * other theme's copy hidden), and sometimes a search palette.
 */

const items: KbarItem[] = [
  { id: "home", name: "Home", section: "Navigation", shortcut: [], keywords: "", href: "/" },
];

const adapters = { useNavigate: () => vi.fn(), usePathname: () => "/" };

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <AdapterProvider adapters={adapters}>{children}</AdapterProvider>
  </LayoutProvider>
);

beforeEach(() => {
  resetScrollLockState();
  resetDialogState();
});

/** A logo link per theme, as an app's header renders it: one is always hidden. */
const ThemedLogos = () => (
  <>
    <a href="/" style={{ display: "none" }}>
      Logo (other theme)
    </a>
    <a href="/">Logo</a>
  </>
);

describe("a focus trap skips what Tab cannot reach", () => {
  it("opens a Drawer on its first visible element and wraps Tab past the hidden one", async () => {
    const user = userEvent.setup();
    render(
      <Drawer open onClose={() => {}} title="Menu" flush showClose={false}>
        <ThemedLogos />
        <button type="button" disabled>
          Unavailable
        </button>
        <button type="button">Close</button>
      </Drawer>,
      { wrapper: wrap },
    );
    const logo = screen.getByRole("link", { name: "Logo" });
    await waitFor(() => expect(logo).toHaveFocus());
    await user.tab();
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
    await user.tab();
    expect(logo).toHaveFocus();
    await user.tab({ shift: true });
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
  });

  it("wraps Tab in a Dialog past a hidden element", async () => {
    const user = userEvent.setup();
    render(
      <Dialog open onClose={() => {}} title="Settings">
        <button type="button">First</button>
        <button type="button">Last</button>
        <button type="button" style={{ display: "none" }}>
          Hidden
        </button>
      </Dialog>,
      { wrapper: wrap },
    );
    const dialog = screen.getByRole("dialog");
    const last = within(dialog).getByRole("button", { name: "Last" });
    last.focus();
    await user.tab();
    expect(last).not.toHaveFocus();
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });
});

describe("Escape closes the top layer only", () => {
  const MenuWithSearch = ({ Shell }: { Shell: "drawer" | "dialog" }) => {
    const [open, setOpen] = useState(true);
    const body = (
      <Kbar items={items}>
        <span>Search</span>
      </Kbar>
    );
    return Shell === "drawer" ? (
      <Drawer open={open} onClose={() => setOpen(false)} title="Menu">
        {body}
      </Drawer>
    ) : (
      <Dialog open={open} onClose={() => setOpen(false)} title="Menu">
        {body}
      </Dialog>
    );
  };

  for (const shell of ["drawer", "dialog"] as const) {
    it(`closes a palette opened from a ${shell}, and leaves the ${shell} open`, async () => {
      const user = userEvent.setup();
      render(<MenuWithSearch Shell={shell} />, { wrapper: wrap });
      await user.click(screen.getByText("Search").parentElement as HTMLElement);
      const palette = await screen.findByRole("dialog", { name: "Command palette" });
      await waitFor(() =>
        expect(within(palette).getByRole("combobox", { name: "Search" })).toHaveFocus(),
      );

      await user.keyboard("{Escape}");
      await waitFor(() =>
        expect(screen.queryByRole("dialog", { name: "Command palette" })).toBeNull(),
      );
      expect(screen.getByRole("dialog", { name: "Menu" })).toBeInTheDocument();

      // The next Escape is the menu's.
      await user.keyboard("{Escape}");
      await waitFor(() => expect(screen.queryByRole("dialog", { name: "Menu" })).toBeNull());
    });
  }
});
