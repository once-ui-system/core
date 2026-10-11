import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Column } from "../components/Column";
import { ContextMenu } from "../components/ContextMenu";
import { Option } from "../components/Option";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const items = (
  <Column padding="4" gap="2">
    <Option value="open" label="Open" />
    <Option value="rename" label="Rename" />
    <Option value="archive" label="Archive" disabled />
    <Option value="delete" label="Delete" />
  </Column>
);

const Target = (props: Partial<React.ComponentProps<typeof ContextMenu>>) => (
  <ContextMenu dropdown={items} {...props}>
    <button type="button">Clip</button>
  </ContextMenu>
);

const menu = () => screen.findByRole("menu");
const item = (name: string) => screen.getByRole("menuitem", { name });

/** The menu focuses its first item 50ms after it opens. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 80));

const sizeMenusAs = (width: number, height: number) => {
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(width);
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(height);
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ContextMenu position", () => {
  it("opens at the pointer", async () => {
    render(<Target />, { wrapper: wrap });
    fireEvent.contextMenu(screen.getByRole("button", { name: "Clip" }), {
      clientX: 120,
      clientY: 80,
    });

    const panel = await menu();
    expect(panel.style.left).toBe("120px");
    expect(panel.style.top).toBe("80px");
  });

  it("opens above and to the left of a pointer near the bottom-right corner", async () => {
    sizeMenusAs(200, 150);
    render(<Target />, { wrapper: wrap });
    fireEvent.contextMenu(screen.getByRole("button", { name: "Clip" }), {
      clientX: window.innerWidth - 50,
      clientY: window.innerHeight - 40,
    });

    const panel = await menu();
    expect(panel.style.left).toBe(`${window.innerWidth - 50 - 200}px`);
    expect(panel.style.top).toBe(`${window.innerHeight - 40 - 150}px`);
  });

  /**
   * `placement` was declared, documented as "where the menu opens relative to
   * the pointer", and never read. The default is where the menu has always
   * opened, its top-left corner at the pointer: "bottom-start".
   */
  it.each([
    ["bottom-end", 300, 300],
    ["top-start", 500, 150],
    ["top-end", 300, 150],
    ["left", 300, 225],
    ["right-end", 500, 150],
  ] as const)("opens %s of the pointer", async (placement, left, top) => {
    sizeMenusAs(200, 150);
    render(<Target placement={placement} />, { wrapper: wrap });
    fireEvent.contextMenu(screen.getByRole("button", { name: "Clip" }), {
      clientX: 500,
      clientY: 300,
    });

    const panel = await menu();
    expect(panel.style.left).toBe(`${left}px`);
    expect(panel.style.top).toBe(`${top}px`);
  });

  it("opens on the other side of the pointer when its placement would leave the screen", async () => {
    sizeMenusAs(200, 150);
    render(<Target placement="top-end" />, { wrapper: wrap });
    // Up and to the left of a pointer near the top-left corner: no room.
    fireEvent.contextMenu(screen.getByRole("button", { name: "Clip" }), {
      clientX: 50,
      clientY: 40,
    });

    const panel = await menu();
    expect(panel.style.left).toBe("50px");
    expect(panel.style.top).toBe("40px");
  });

  it("opens at the element when the keyboard opened it", async () => {
    render(<Target />, { wrapper: wrap });
    const clip = screen.getByRole("button", { name: "Clip" });
    vi.spyOn(clip, "getBoundingClientRect").mockReturnValue({
      left: 40,
      top: 200,
      right: 140,
      bottom: 232,
      width: 100,
      height: 32,
      x: 40,
      y: 200,
      toJSON: () => ({}),
    });
    // Shift+F10 or the Menu key: a contextmenu event with no pointer position.
    fireEvent.contextMenu(clip, { clientX: 0, clientY: 0 });

    const panel = await menu();
    expect(panel.style.left).toBe("40px");
    expect(panel.style.top).toBe("232px");
  });
});

describe("ContextMenu semantics and keyboard", () => {
  it("is a menu of menu items, with no listbox or option roles inside", async () => {
    render(<Target />, { wrapper: wrap });
    fireEvent.contextMenu(screen.getByRole("button", { name: "Clip" }));

    const panel = await menu();
    expect(screen.getAllByRole("menuitem")).toHaveLength(4);
    expect(panel.querySelector('[role="listbox"], [role="option"]')).toBeNull();
    expect(item("Open")).not.toHaveAttribute("aria-selected");
  });

  it("moves through the enabled items with the arrow keys, Home and End", async () => {
    const user = userEvent.setup();
    render(<Target />, { wrapper: wrap });
    fireEvent.contextMenu(screen.getByRole("button", { name: "Clip" }));
    await menu();
    await settle();

    expect(item("Open")).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(item("Rename")).toHaveFocus();
    // Archive is disabled: skipped.
    await user.keyboard("{ArrowDown}");
    expect(item("Delete")).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(item("Open")).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(item("Delete")).toHaveFocus();
    await user.keyboard("{Home}");
    expect(item("Open")).toHaveFocus();
    await user.keyboard("{End}");
    expect(item("Delete")).toHaveFocus();
  });

  it("runs an item with Enter and closes", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Target onSelect={onSelect} />, { wrapper: wrap });
    fireEvent.contextMenu(screen.getByRole("button", { name: "Clip" }));
    await menu();
    await settle();

    await user.keyboard("{ArrowDown}{Enter}");
    expect(onSelect).toHaveBeenCalledWith("rename");
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });

  it("closes with Escape and gives focus back", async () => {
    const user = userEvent.setup();
    render(<Target />, { wrapper: wrap });
    const clip = screen.getByRole("button", { name: "Clip" });
    act(() => clip.focus());
    fireEvent.contextMenu(clip);
    await menu();
    await settle();
    expect(item("Open")).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(clip).toHaveFocus();
  });

  it("has no axe violations while open", async () => {
    render(<Target />, { wrapper: wrap });
    fireEvent.contextMenu(screen.getByRole("button", { name: "Clip" }));
    await menu();
    await settle();

    await expectNoAxeViolations(document.body);
  });
});

/**
 * The trigger sat in a Flex: a flex box, `position: relative`, that became
 * the containing block of whatever it wrapped. Kinetic hand-rolled its
 * timeline's context menu because an absolutely positioned block inside that
 * wrapper positioned against the wrapper instead of its lane.
 */
describe("ContextMenu wrapper", () => {
  it("keeps today's Flex wrapper by default", () => {
    const { container } = render(<Target />, { wrapper: wrap });
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveClass("display-flex");
    expect(wrapper).not.toHaveClass("fill-width");
  });

  // `fillWidth` was declared and never applied. Stack and Shorty pass it on a
  // timeline that has to span its column.
  it("fills its container's width with `fillWidth`", () => {
    const { container } = render(<Target fillWidth />, { wrapper: wrap });
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveClass("fill-width");
  });

  it("adds no box with `contents`, and still opens", async () => {
    const { container } = render(
      <ContextMenu dropdown={items} contents>
        <div data-testid="block" style={{ position: "absolute", left: 40 }}>
          Block
        </div>
      </ContextMenu>,
      { wrapper: wrap },
    );

    // No box: its display is `contents`, which outranks the Flex's display
    // class, so it neither lays the block out nor contains its positioning.
    const wrapper = screen.getByTestId("block").parentElement as HTMLElement;
    expect(wrapper.parentElement).toBe(container);
    expect(wrapper.style.display).toBe("contents");
    expect(getComputedStyle(wrapper).display).toBe("contents");

    fireEvent.contextMenu(screen.getByTestId("block"), { clientX: 10, clientY: 10 });
    expect(await menu()).toBeInTheDocument();
  });

  it("does not open when disabled", () => {
    render(<Target disabled />, { wrapper: wrap });
    fireEvent.contextMenu(screen.getByRole("button", { name: "Clip" }));
    expect(screen.queryByRole("menu")).toBeNull();
  });
});
