import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Button } from "../components/Button";
import { Column } from "../components/Column";
import { Dropdown } from "../components/Dropdown";
import { Option } from "../components/Option";
import { resetScrollLockState } from "../components/ScrollLock";
import { Submenu } from "../components/Submenu";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { gracePolygon, pointInPolygon } from "../internal/menuTree";
import { expectNoAxeViolations } from "../test/axe";
import { failOnConsoleError } from "../test/failOnConsoleError";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

failOnConsoleError();
beforeEach(() => resetScrollLockState());

const items = (
  <Column padding="4" gap="2">
    <Option value="new" label="New file" />
    <Submenu label="Share">
      <Option value="email" label="Email" />
      <Option value="link" label="Copy link" />
      <Submenu label="Export">
        <Option value="pdf" label="PDF" />
        <Option value="png" label="PNG" />
      </Submenu>
    </Submenu>
    <Option value="rename" label="Rename" />
  </Column>
);

const Menu = (props: Partial<React.ComponentProps<typeof Dropdown>>) => (
  <>
    <Dropdown trigger={<Button variant="secondary">File</Button>} {...props}>
      {items}
    </Dropdown>
    <p>Outside</p>
  </>
);

const openMenu = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole("button", { name: "File" }));
  const menu = await screen.findByRole("menu", { name: "File" });
  // Hidden, so out of the accessibility tree, until positioned.
  await screen.findByRole("menuitem", { name: "Share" });
  return menu;
};

const focusOn = async (name: string) =>
  waitFor(() => expect(screen.getByRole("menuitem", { name })).toHaveFocus());

describe("Submenu", () => {
  it("makes the panel a menu, its trigger a menu button, and its item a submenu", async () => {
    const user = userEvent.setup();
    const { container } = render(<Menu />, { wrapper: wrap });
    expect(screen.getByRole("button", { name: "File" })).toHaveAttribute(
      "aria-haspopup",
      "listbox",
    );

    const menu = await openMenu(user);
    expect(screen.getByRole("button", { name: "File" })).toHaveAttribute("aria-haspopup", "menu");
    expect(
      within(menu)
        .getAllByRole("menuitem")
        .map((el) => el.textContent),
    ).toEqual(["New file", "Share", "Rename"]);
    const share = screen.getByRole("menuitem", { name: "Share" });
    expect(share).toHaveAttribute("aria-haspopup", "menu");
    expect(share).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("option")).toBeNull();
    await expectNoAxeViolations(container);
  });

  it("opens with Right arrow on the first item, and Left arrow closes it back to its item", async () => {
    const user = userEvent.setup();
    render(<Menu />, { wrapper: wrap });
    await openMenu(user);
    await focusOn("New file");

    await user.keyboard("{ArrowDown}");
    await focusOn("Share");
    await user.keyboard("{ArrowRight}");

    const submenu = await screen.findByRole("menu", { name: "Share" });
    expect(screen.getByRole("menuitem", { name: "Share" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("menuitem", { name: "Share" })).toHaveAttribute(
      "aria-controls",
      submenu.id,
    );
    await focusOn("Email");

    await user.keyboard("{ArrowDown}");
    await focusOn("Copy link");
    await user.keyboard("{ArrowDown}");
    await focusOn("Export");
    await user.keyboard("{ArrowDown}");
    await focusOn("Email");
    await user.keyboard("{End}");
    await focusOn("Export");

    await user.keyboard("{ArrowLeft}");
    await waitFor(() => expect(screen.queryByRole("menu", { name: "Share" })).toBeNull());
    await focusOn("Share");
    // The root menu is still open.
    expect(screen.getByRole("menu", { name: "File" })).toBeInTheDocument();
  });

  it("nests: Enter opens the next level, Escape closes one level at a time", async () => {
    const user = userEvent.setup();
    render(<Menu />, { wrapper: wrap });
    await openMenu(user);
    await focusOn("New file");
    await user.keyboard("{ArrowDown}{Enter}");
    await focusOn("Email");
    await user.keyboard("{End}{Enter}");
    await screen.findByRole("menu", { name: "Export" });
    await focusOn("PDF");

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu", { name: "Export" })).toBeNull());
    await focusOn("Export");
    expect(screen.getByRole("menu", { name: "Share" })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu", { name: "Share" })).toBeNull());
    await focusOn("Share");

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("menu", { name: "File" })).toBeNull());
    expect(screen.getByRole("button", { name: "File" })).toHaveFocus();
  });

  it("reports a pick in a submenu through the Dropdown's onSelect, and closes the whole menu", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Menu onSelect={onSelect} />, { wrapper: wrap });
    await openMenu(user);
    await focusOn("New file");
    await user.keyboard("{ArrowDown}{ArrowRight}");
    await focusOn("Email");
    await user.keyboard("{ArrowDown}{Enter}");

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("link");
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    expect(screen.getByRole("button", { name: "File" })).toHaveFocus();
  });

  it("opens on a click without closing the menu, and a click on its item picks", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Menu onSelect={onSelect} />, { wrapper: wrap });
    await openMenu(user);
    await user.click(screen.getByRole("menuitem", { name: "Share" }));
    const email = await screen.findByRole("menuitem", { name: "Email" });
    expect(screen.getByRole("menu", { name: "File" })).toBeInTheDocument();
    expect(onSelect).not.toHaveBeenCalled();

    await user.click(email);
    expect(onSelect).toHaveBeenCalledWith("email");
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });

  it("opens when the pointer rests on its item, and closes when it rests on a sibling", async () => {
    const user = userEvent.setup();
    render(<Menu />, { wrapper: wrap });
    await openMenu(user);
    await user.hover(screen.getByRole("menuitem", { name: "Share" }));
    await screen.findByRole("menuitem", { name: "Email" });

    await user.hover(screen.getByRole("menuitem", { name: "Rename" }));
    await waitFor(() => expect(screen.queryByRole("menu", { name: "Share" })).toBeNull());
  });

  it("moves to an item by its first letters", async () => {
    const user = userEvent.setup();
    render(<Menu />, { wrapper: wrap });
    await openMenu(user);
    await focusOn("New file");
    await user.keyboard("r");
    await focusOn("Rename");
    await user.keyboard("{ArrowUp}{ArrowRight}");
    await focusOn("Email");
    await user.keyboard("e");
    await focusOn("Export");
  });

  it("does not open when disabled", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown trigger={<Button>File</Button>}>
        <Column padding="4" gap="2">
          <Option value="new" label="New file" />
          <Submenu label="Share" disabled>
            <Option value="email" label="Email" />
          </Submenu>
        </Column>
      </Dropdown>,
      { wrapper: wrap },
    );
    await openMenu(user);
    const share = screen.getByRole("menuitem", { name: "Share" });
    expect(share).toHaveAttribute("aria-disabled", "true");
    await user.click(share);
    await user.hover(share);
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(screen.queryByRole("menu", { name: "Share" })).toBeNull();
  });

  it("works in a context menu", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Dropdown openOn="contextmenu" onSelect={onSelect} trigger={<p>Canvas</p>}>
        {items}
      </Dropdown>,
      { wrapper: wrap },
    );
    fireEvent.contextMenu(screen.getByText("Canvas"));
    await screen.findByRole("menu");
    await focusOn("New file");
    await user.keyboard("{ArrowDown}{ArrowRight}");
    await focusOn("Email");
    // Escape closes the submenu, not the context menu.
    await user.keyboard("{Escape}");
    await focusOn("Share");
    expect(screen.getAllByRole("menu")).toHaveLength(1);

    await user.keyboard("{Enter}");
    await focusOn("Email");
    await user.click(screen.getByRole("menuitem", { name: "Copy link" }));
    expect(onSelect).toHaveBeenCalledWith("link");
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });
});

describe('Dropdown openOn="hover"', () => {
  const HoverMenu = (props: Partial<React.ComponentProps<typeof Dropdown>>) => (
    <>
      <Dropdown
        openOn="hover"
        openDelay={10}
        closeDelay={50}
        trigger={<Button variant="secondary">Products</Button>}
        {...props}
      >
        {items}
      </Dropdown>
      <p>Outside</p>
    </>
  );

  it("opens when the pointer rests on the trigger, and leaves focus where it was", async () => {
    const user = userEvent.setup();
    render(<HoverMenu />, { wrapper: wrap });
    const trigger = screen.getByRole("button", { name: "Products" });
    await user.hover(trigger);
    await screen.findByRole("menu", { name: "Products" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(document.body).toHaveFocus();
  });

  it("stays open while the pointer is in a submenu, and closes once it has left the menu", async () => {
    const user = userEvent.setup();
    render(<HoverMenu />, { wrapper: wrap });
    await user.hover(screen.getByRole("button", { name: "Products" }));
    await user.hover(await screen.findByRole("menuitem", { name: "Share" }));
    await screen.findByRole("menu", { name: "Share" });
    await user.hover(await screen.findByRole("menuitem", { name: "Email" }));
    await new Promise((resolve) => setTimeout(resolve, 120));
    expect(screen.getByRole("menu", { name: "Products" })).toBeInTheDocument();

    await user.hover(screen.getByText("Outside"));
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });

  it("does not open when the pointer only passes over the trigger", async () => {
    const user = userEvent.setup();
    render(<HoverMenu openDelay={150} />, { wrapper: wrap });
    await user.hover(screen.getByRole("button", { name: "Products" }));
    await user.unhover(screen.getByRole("button", { name: "Products" }));
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("stays open after a click, and an arrow key moves focus in", async () => {
    const user = userEvent.setup();
    render(<HoverMenu />, { wrapper: wrap });
    const trigger = screen.getByRole("button", { name: "Products" });
    await user.hover(trigger);
    await screen.findByRole("menu", { name: "Products" });
    await user.click(trigger);
    await focusOn("New file");
    await user.hover(screen.getByText("Outside"));
    await new Promise((resolve) => setTimeout(resolve, 120));
    expect(screen.getByRole("menu", { name: "Products" })).toBeInTheDocument();
  });

  it("an arrow key on the trigger of a hover-opened panel moves focus in", async () => {
    const user = userEvent.setup();
    render(<HoverMenu />, { wrapper: wrap });
    const trigger = screen.getByRole("button", { name: "Products" });
    act(() => trigger.focus());
    await user.hover(trigger);
    await screen.findByRole("menu", { name: "Products" });
    expect(trigger).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    await focusOn("New file");
  });

  it("opens from the keyboard as a click does", async () => {
    const user = userEvent.setup();
    render(<HoverMenu />, { wrapper: wrap });
    await user.tab();
    await user.keyboard("{Enter}");
    await screen.findByRole("menu", { name: "Products" });
    await focusOn("New file");
  });
});

describe("the pointer's safe path into a submenu", () => {
  const panel = { left: 200, right: 360, top: 100, bottom: 260 } as DOMRect;

  it("covers the wedge from the exit point to the panel, and the panel", () => {
    const polygon = gracePolygon({ x: 190, y: 120 }, panel);
    expect(pointInPolygon({ x: 195, y: 140 }, polygon)).toBe(true);
    expect(pointInPolygon({ x: 199, y: 250 }, polygon)).toBe(true);
    expect(pointInPolygon({ x: 300, y: 200 }, polygon)).toBe(true);
    // Straight down, away from the panel: the next item, not the path.
    expect(pointInPolygon({ x: 160, y: 160 }, polygon)).toBe(false);
    expect(pointInPolygon({ x: 195, y: 280 }, polygon)).toBe(false);
  });

  it("mirrors for a panel that opened on the left", () => {
    const left = { left: 20, right: 180, top: 100, bottom: 260 } as DOMRect;
    const polygon = gracePolygon({ x: 190, y: 120 }, left);
    expect(pointInPolygon({ x: 185, y: 140 }, polygon)).toBe(true);
    expect(pointInPolygon({ x: 230, y: 140 }, polygon)).toBe(false);
  });
});
