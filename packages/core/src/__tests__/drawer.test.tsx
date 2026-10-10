import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { createRef, useRef, useState } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Drawer } from "../components/Drawer";
import styles from "../components/Drawer.module.scss";
import { resetScrollLockState } from "../components/ScrollLock";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";
import { resetDialogState } from "../test/dialogTestUtils";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

type DrawerProps = React.ComponentProps<typeof Drawer>;

const renderDrawer = (props: Partial<DrawerProps> = {}) =>
  render(
    <Drawer open onClose={() => {}} title="Filters" {...props}>
      {props.children ?? <button type="button">Apply</button>}
    </Drawer>,
    { wrapper: wrap },
  );

/**
 * The fleet's mobile navs are an Animation-wrapped fixed Column: no dialog
 * role, no focus trap, Escape does nothing, focus never comes back, and the
 * page scrolls underneath. One of them sets `body.style.overflow` by hand.
 */
const Host = (props: Partial<DrawerProps>) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open menu
      </button>
      <Drawer open={open} onClose={() => setOpen(false)} title="Menu" {...props}>
        <button type="button">First link</button>
        <button type="button">Last link</button>
      </Drawer>
    </>
  );
};

beforeEach(() => {
  resetScrollLockState();
  resetDialogState();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Drawer: rendering", () => {
  it("renders nothing while closed", () => {
    renderDrawer({ open: false });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders a modal dialog into a portal on the body", () => {
    const { container } = renderDrawer();
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(container).not.toContainElement(dialog);
    expect(document.body).toContainElement(dialog);
  });

  it("is named by its title and described by its description", () => {
    renderDrawer({ description: "Narrow the list" });
    const dialog = screen.getByRole("dialog", { name: "Filters" });
    expect(dialog).toHaveAccessibleDescription("Narrow the list");
    expect(screen.getByRole("heading", { name: "Filters" })).toBeInTheDocument();
  });

  it("is named by aria-label when it has no title", () => {
    renderDrawer({ title: undefined, "aria-label": "Navigation" });
    expect(screen.getByRole("dialog", { name: "Navigation" })).toBeInTheDocument();
  });

  it("is named by a ReactNode title", () => {
    renderDrawer({ title: <span>Cart (2)</span> });
    expect(screen.getByRole("dialog", { name: "Cart (2)" })).toBeInTheDocument();
  });

  it("slides from the side it is given, at the size it is given", () => {
    renderDrawer({ side: "bottom", size: "l" });
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveClass(styles.panel, styles.bottom, styles.l);
    expect(dialog).toHaveAttribute("data-side", "bottom");
  });

  it("defaults to the right edge at size m", () => {
    renderDrawer();
    expect(screen.getByRole("dialog")).toHaveClass(styles.right, styles.m);
  });

  it("renders a footer", () => {
    renderDrawer({ footer: <button type="button">Save</button> });
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("hides the close button with showClose={false}", () => {
    renderDrawer({ showClose: false });
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  });

  it("keeps a flush drawer's title for screen readers only", () => {
    renderDrawer({ flush: true });
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.getByRole("dialog", { name: "Filters" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("forwards its ref to the dialog element", () => {
    const ref = createRef<HTMLDivElement>();
    renderDrawer({ ref });
    expect(ref.current).toBe(screen.getByRole("dialog"));
  });

  it("does not throw when rendered open on the server", () => {
    expect(() =>
      renderToString(
        <LayoutProvider>
          <Drawer open onClose={() => {}} title="Server">
            Content
          </Drawer>
        </LayoutProvider>,
      ),
    ).not.toThrow();
  });

  it("slides in after a tick and unmounts once it has slid out", () => {
    vi.useFakeTimers();
    const { rerender } = renderDrawer();
    expect(screen.getByRole("dialog")).not.toHaveClass(styles.open);
    act(() => vi.advanceTimersByTime(0));
    expect(screen.getByRole("dialog")).toHaveClass(styles.open);

    rerender(
      <Drawer open={false} onClose={() => {}} title="Filters">
        <button type="button">Apply</button>
      </Drawer>,
    );
    expect(screen.getByRole("dialog", { hidden: true })).not.toHaveClass(styles.open);
    act(() => vi.advanceTimersByTime(299));
    expect(screen.queryByRole("dialog", { hidden: true })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1));
    expect(screen.queryByRole("dialog", { hidden: true })).toBeNull();
  });
});

describe("Drawer: closing", () => {
  it("asks to close on Escape", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderDrawer({ onClose });
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("leaves Escape to a control inside that handles it", () => {
    const onClose = vi.fn();
    renderDrawer({
      onClose,
      children: (
        <input
          aria-label="Search"
          onKeyDown={(event) => {
            if (event.key === "Escape") event.preventDefault();
          }}
        />
      ),
    });
    fireEvent.keyDown(screen.getByLabelText("Search"), { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes on Escape when focus has fallen back to the body", () => {
    const onClose = vi.fn();
    renderDrawer({ onClose });
    (document.activeElement as HTMLElement | null)?.blur();
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("asks to close on an overlay click, unless closeOnClickaway is off", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { rerender } = renderDrawer({ onClose });
    const overlay = document.querySelector("[data-drawer-overlay]") as HTMLElement;
    await user.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(
      <Drawer open onClose={onClose} title="Filters" closeOnClickaway={false}>
        <button type="button">Apply</button>
      </Drawer>,
    );
    await user.click(document.querySelector("[data-drawer-overlay]") as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close on a click inside the drawer", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderDrawer({ onClose });
    await user.click(screen.getByRole("button", { name: "Apply" }));
    await user.click(screen.getByRole("heading", { name: "Filters" }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("asks to close from the close button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderDrawer({ onClose });
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("Drawer: focus", () => {
  it("moves focus into the drawer on open, and back to the trigger on close", async () => {
    const user = userEvent.setup();
    render(<Host />, { wrapper: wrap });
    const trigger = screen.getByRole("button", { name: "Open menu" });

    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Menu" });
    expect(dialog).toContainElement(document.activeElement as HTMLElement);

    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
  });

  it("focuses initialFocusRef on open", async () => {
    const user = userEvent.setup();
    const Focused = () => {
      const [open, setOpen] = useState(false);
      const input = useRef<HTMLInputElement>(null);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open
          </button>
          <Drawer open={open} onClose={() => setOpen(false)} title="Rename" initialFocusRef={input}>
            <input ref={input} aria-label="Name" />
          </Drawer>
        </>
      );
    };
    render(<Focused />, { wrapper: wrap });
    await user.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByLabelText("Name")).toHaveFocus();
  });

  it("returns focus to returnFocusRef when given", async () => {
    const user = userEvent.setup();
    const Returning = () => {
      const [open, setOpen] = useState(false);
      const target = useRef<HTMLButtonElement>(null);
      return (
        <>
          <button type="button" ref={target}>
            Elsewhere
          </button>
          <button type="button" onClick={() => setOpen(true)}>
            Open
          </button>
          <Drawer open={open} onClose={() => setOpen(false)} title="Menu" returnFocusRef={target}>
            Content
          </Drawer>
        </>
      );
    };
    render(<Returning />, { wrapper: wrap });
    expect(document.body).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Open" }));
    await user.keyboard("{Escape}");
    expect(screen.getByRole("button", { name: "Elsewhere" })).toHaveFocus();
  });

  it("keeps Tab inside the drawer, in both directions", async () => {
    const user = userEvent.setup();
    render(<Host showClose={false} />, { wrapper: wrap });
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    const first = screen.getByRole("button", { name: "First link" });
    const last = screen.getByRole("button", { name: "Last link" });

    expect(first).toHaveFocus();
    await user.tab();
    expect(last).toHaveFocus();
    await user.tab();
    expect(first).toHaveFocus();
    await user.tab({ shift: true });
    expect(last).toHaveFocus();
  });

  it("gives focus back when unmounted while open", () => {
    const opener = document.createElement("button");
    document.body.appendChild(opener);
    opener.focus();
    const { unmount } = renderDrawer();
    expect(opener).not.toHaveFocus();
    unmount();
    expect(opener).toHaveFocus();
  });

  it("does not take focus when it mounts closed", () => {
    const elsewhere = document.createElement("button");
    document.body.appendChild(elsewhere);
    elsewhere.focus();
    const target = { current: document.createElement("button") };
    document.body.appendChild(target.current);
    renderDrawer({ open: false, returnFocusRef: target });
    expect(elsewhere).toHaveFocus();
  });
});

describe("Drawer: the page behind", () => {
  it("makes the rest of the page inert while open, and restores it on close", async () => {
    const user = userEvent.setup();
    const { container } = render(<Host />, { wrapper: wrap });
    const page = container as HTMLElement;

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(page.inert).toBe(true);

    await user.keyboard("{Escape}");
    expect(page.inert).toBe(false);
  });

  it("leaves a node that was already inert as it found it", () => {
    const alreadyInert = document.createElement("div");
    alreadyInert.inert = true;
    document.body.appendChild(alreadyInert);
    const { rerender } = renderDrawer();
    rerender(
      <Drawer open={false} onClose={() => {}} title="Filters">
        Content
      </Drawer>,
    );
    expect(alreadyInert.inert).toBe(true);
  });

  it("is itself inert while it slides out", () => {
    const { rerender } = renderDrawer();
    rerender(
      <Drawer open={false} onClose={() => {}} title="Filters">
        Content
      </Drawer>,
    );
    const dialog = screen.getByRole("dialog", { hidden: true });
    expect(dialog.closest("[inert]")).not.toBeNull();
  });

  it("locks page scroll while open and allows it inside the drawer", () => {
    const { rerender } = renderDrawer();
    const wheel = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 80 });
    document.body.dispatchEvent(wheel);
    expect(wheel.defaultPrevented).toBe(true);

    rerender(
      <Drawer open={false} onClose={() => {}} title="Filters">
        Content
      </Drawer>,
    );
    const after = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 80 });
    document.body.dispatchEvent(after);
    expect(after.defaultPrevented).toBe(false);
  });
});

describe("Drawer: accessibility", () => {
  it("has no axe violations open, with a title, description and footer", async () => {
    renderDrawer({
      description: "Narrow the list",
      footer: <button type="button">Save</button>,
    });
    await expectNoAxeViolations(screen.getByRole("dialog"));
  });

  it("has no axe violations flush, from the left", async () => {
    renderDrawer({ flush: true, side: "left", size: "s" });
    await expectNoAxeViolations(screen.getByRole("dialog"));
  });
});
