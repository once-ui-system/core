import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Column } from "../components/Column";
import { Dropdown } from "../components/Dropdown";
import { Option } from "../components/Option";
import { resetScrollLockState } from "../components/ScrollLock";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";
import { failOnConsoleError } from "../test/failOnConsoleError";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

failOnConsoleError();
beforeEach(() => resetScrollLockState());

const onRename = vi.fn();
beforeEach(() => onRename.mockClear());

const items = (
  <Column padding="4" gap="2">
    <Option value="open" label="Open" />
    <Option value="rename" label="Rename" onClick={onRename} />
    <Option value="delete" label="Delete" />
  </Column>
);

const Target = (props: Partial<React.ComponentProps<typeof Dropdown>>) => (
  <>
    <Dropdown openOn="contextmenu" trigger={<button type="button">Clip</button>} {...props}>
      {items}
    </Dropdown>
    <p>Outside</p>
  </>
);

const clip = () => screen.getByRole("button", { name: "Clip" });
const menu = () => screen.queryByRole("menu");
const item = (name: string) => screen.getByRole("menuitem", { name });

/** Opened, with focus on its first item (it lands there 50ms after opening). */
const openMenu = async (init?: MouseEventInit) => {
  // A right-click's mousedown focuses the button first.
  act(() => clip().focus());
  fireEvent.contextMenu(clip(), init);
  await screen.findByRole("menu");
  await waitFor(() => expect(item("Open")).toHaveFocus());
};

/**
 * ContextMenu beyond position and keyboard (context-menu.test.tsx): it
 * reports each pick and each open change once, follows a controlled `open`,
 * opens on Ctrl+click for a one-button mouse, and closes on a press outside.
 * Picking closed it two or three times over: Dropdown's onSelect closed it,
 * the panel's click handler closed it again 50ms later, and Enter on the
 * focused item closed it a third time.
 */
describe("ContextMenu", () => {
  it("renders only its children until opened, and suppresses the native menu", () => {
    render(<Target />, { wrapper: wrap });
    expect(menu()).toBeNull();
    const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
    clip().dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it("opens on Ctrl+click and on Cmd+click, but not on a plain click", async () => {
    const user = userEvent.setup();
    render(<Target />, { wrapper: wrap });
    await user.click(clip());
    expect(menu()).toBeNull();

    fireEvent.click(clip(), { ctrlKey: true, clientX: 5, clientY: 5 });
    expect(await screen.findByRole("menu")).toBeInTheDocument();
    await waitFor(() => expect(item("Open")).toHaveFocus());
    await user.keyboard("{Escape}");
    expect(menu()).toBeNull();

    fireEvent.click(clip(), { metaKey: true, clientX: 5, clientY: 5 });
    expect(await screen.findByRole("menu")).toBeInTheDocument();
  });

  it("reports a clicked item's value and the close once each", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onOpenChange = vi.fn();
    render(<Target onSelect={onSelect} onOpenChange={onOpenChange} />, { wrapper: wrap });
    await openMenu({ clientX: 10, clientY: 10 });

    await user.click(item("Delete"));
    expect(onSelect.mock.calls).toEqual([["delete"]]);
    expect(menu()).toBeNull();
    await new Promise((resolve) => setTimeout(resolve, 80));
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it("runs an item from Enter once, with its own onClick, and closes once", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onOpenChange = vi.fn();
    render(<Target onSelect={onSelect} onOpenChange={onOpenChange} />, { wrapper: wrap });
    await openMenu();

    await user.keyboard("{ArrowDown}{Enter}");
    expect(onRename.mock.calls).toEqual([["rename"]]);
    expect(onSelect.mock.calls).toEqual([["rename"]]);
    await waitFor(() => expect(menu()).toBeNull());
    await new Promise((resolve) => setTimeout(resolve, 80));
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
    expect(clip()).toHaveFocus();
  });

  it("runs an item from Space", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Target onSelect={onSelect} />, { wrapper: wrap });
    await openMenu();
    await user.keyboard("{End} ");
    expect(onSelect.mock.calls).toEqual([["delete"]]);
  });

  it("stays open after a pick with closeAfterClick={false}", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Target onSelect={onSelect} closeAfterClick={false} />, { wrapper: wrap });
    await openMenu();
    await user.click(item("Open"));
    await user.keyboard("{ArrowDown}{Enter}");
    await new Promise((resolve) => setTimeout(resolve, 80));
    expect(onSelect.mock.calls).toEqual([["open"], ["rename"]]);
    expect(menu()).toBeInTheDocument();
  });

  it("closes on a press outside", async () => {
    render(<Target />, { wrapper: wrap });
    await openMenu();
    fireEvent.mouseDown(screen.getByText("Outside"));
    expect(menu()).toBeNull();
  });

  it("keeps Tab inside the menu", async () => {
    const user = userEvent.setup();
    render(<Target />, { wrapper: wrap });
    await openMenu();
    await user.keyboard("{End}");
    await user.tab();
    expect(item("Open")).toHaveFocus();
    await user.tab({ shift: true });
    expect(item("Delete")).toHaveFocus();
  });

  it("follows a controlled `open`", async () => {
    const Controlled = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Dropdown
            openOn="contextmenu"
            trigger={<button type="button">Clip</button>}
            open={open}
            onOpenChange={setOpen}
          >
            {items}
          </Dropdown>
          <button type="button" onClick={() => setOpen(false)}>
            Force close
          </button>
        </>
      );
    };
    render(<Controlled />, { wrapper: wrap });
    await openMenu();
    fireEvent.click(screen.getByRole("button", { name: "Force close" }));
    expect(menu()).toBeNull();
  });

  it("asks onOpenChange and stays shut when controlled closed", () => {
    const onOpenChange = vi.fn();
    render(<Target open={false} onOpenChange={onOpenChange} />, { wrapper: wrap });
    fireEvent.contextMenu(clip());
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(menu()).toBeNull();
  });

  it("marks itself disabled and opens on neither gesture", async () => {
    const { container } = render(<Target disabled />, { wrapper: wrap });
    expect(container.firstElementChild).toHaveAttribute("aria-disabled", "true");
    fireEvent.contextMenu(clip());
    fireEvent.click(clip(), { ctrlKey: true });
    expect(menu()).toBeNull();
    await expectNoAxeViolations(container);
  });
});
