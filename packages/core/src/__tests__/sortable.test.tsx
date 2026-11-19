import { act, fireEvent, render as rtlRender, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Nav, NavSection } from "../components/Nav.js";
import { NavItem } from "../components/NavItem.js";
import { arrayMove, Sortable, SortableHandle, SortableItem } from "../components/Sortable.js";
import { LayoutProvider } from "../contexts/LayoutProvider.js";
import { axeViolations } from "../test/axe.js";

/**
 * jsdom has no layout, so every box measures zero and a list with no size is
 * skipped as a drop target. Give each list and row a box of its own: rows are
 * 40px tall and stacked in document order.
 */
function fakeLayout() {
  const original = HTMLElement.prototype.getBoundingClientRect;
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
    this: HTMLElement,
  ) {
    if (this.hasAttribute("data-sortable-list") || this.hasAttribute("data-sortable-id")) {
      return {
        x: 0,
        y: 0,
        top: 0,
        left: 0,
        right: 200,
        bottom: 40,
        width: 200,
        height: 40,
        toJSON() {},
      } as DOMRect;
    }
    return original.call(this);
  });
}

const render = (ui: React.ReactElement) => rtlRender(ui, { wrapper: LayoutProvider });

const announcer = () => document.querySelector("[data-sortable-announcer]")?.textContent?.trim();

function List({ onReorder }: { onReorder?: (ids: string[]) => void }) {
  const [ids, setIds] = useState(["launch", "budget", "hiring"]);
  const names: Record<string, string> = {
    launch: "Launch plan",
    budget: "Budget",
    hiring: "Hiring",
  };
  return (
    <Sortable
      items={ids}
      onReorder={(next) => {
        setIds(next);
        onReorder?.(next);
      }}
    >
      {ids.map((id) => (
        <SortableItem key={id} id={id}>
          <button type="button">{names[id]}</button>
        </SortableItem>
      ))}
    </Sortable>
  );
}

const order = () => screen.getAllByRole("button").map((button) => button.textContent);

beforeEach(() => {
  fakeLayout();
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: query.includes("reduce"),
        media: query,
        addEventListener() {},
        removeEventListener() {},
        addListener() {},
        removeListener() {},
        onchange: null,
        dispatchEvent: () => false,
      }) as MediaQueryList,
  );
});

// A drag clears up a frame after it ends; let it, so the next test starts idle.
afterEach(async () => {
  await waitFor(() => expect(document.querySelector("[data-sortable-clone]")).toBeNull());
  vi.restoreAllMocks();
});

describe("arrayMove", () => {
  it("moves one entry and leaves the input alone", () => {
    const rows = ["a", "b", "c", "d"];
    expect(arrayMove(rows, 0, 2)).toEqual(["b", "c", "a", "d"]);
    expect(arrayMove(rows, 3, 0)).toEqual(["d", "a", "b", "c"]);
    expect(rows).toEqual(["a", "b", "c", "d"]);
  });
});

describe("Sortable with the keyboard", () => {
  it("picks a row up with Space, moves it with the arrows and drops it with Space", async () => {
    const onReorder = vi.fn();
    render(<List onReorder={onReorder} />);
    const launch = screen.getByRole("button", { name: "Launch plan" });
    launch.focus();

    fireEvent.keyDown(launch, { key: " " });
    expect(announcer()).toBe("Picked up Launch plan, 1 of 3.");

    fireEvent.keyDown(launch, { key: "ArrowDown" });
    expect(announcer()).toBe("Launch plan, 2 of 3.");
    fireEvent.keyDown(launch, { key: "ArrowDown" });
    fireEvent.keyDown(launch, { key: " " });

    expect(onReorder).toHaveBeenCalledWith(["budget", "hiring", "launch"]);
    await waitFor(() => expect(order()).toEqual(["Budget", "Hiring", "Launch plan"]));
    expect(announcer()).toBe("Dropped Launch plan at 3 of 3.");
    // Focus follows the row to its new place.
    await waitFor(() =>
      expect(document.activeElement).toBe(screen.getByRole("button", { name: "Launch plan" })),
    );
  });

  it("puts the row back on Escape", async () => {
    const onReorder = vi.fn();
    render(<List onReorder={onReorder} />);
    const budget = screen.getByRole("button", { name: "Budget" });
    budget.focus();
    fireEvent.keyDown(budget, { key: " " });
    fireEvent.keyDown(budget, { key: "ArrowUp" });
    fireEvent.keyDown(budget, { key: "Escape" });
    expect(onReorder).not.toHaveBeenCalled();
    expect(announcer()).toBe("Cancelled. Budget is back at 2 of 3.");
    await waitFor(() => expect(document.querySelector("[data-sortable-clone]")).toBeNull());
  });

  it("does not move past either end of a list that trades with no other", () => {
    const onReorder = vi.fn();
    render(<List onReorder={onReorder} />);
    const launch = screen.getByRole("button", { name: "Launch plan" });
    fireEvent.keyDown(launch, { key: " " });
    fireEvent.keyDown(launch, { key: "ArrowUp" });
    fireEvent.keyDown(launch, { key: " " });
    expect(onReorder).not.toHaveBeenCalled();
  });

  it("tells screen readers how to move a row", () => {
    render(<List />);
    const launch = screen.getByRole("button", { name: "Launch plan" });
    expect(launch).toHaveAccessibleDescription(/Press Space to pick up/);
  });

  it("takes translated announcements", async () => {
    render(
      <Sortable
        items={["a", "b"]}
        labels={{
          lifted: ({ item, position, total }) => `${item} angehoben, ${position} von ${total}.`,
        }}
      >
        <SortableItem id="a">
          <button type="button">Eins</button>
        </SortableItem>
        <SortableItem id="b">
          <button type="button">Zwei</button>
        </SortableItem>
      </Sortable>,
    );
    const eins = screen.getByRole("button", { name: "Eins" });
    fireEvent.keyDown(eins, { key: " " });
    expect(announcer()).toBe("Eins angehoben, 1 von 2.");
    fireEvent.keyDown(eins, { key: "Escape" });
    await waitFor(() => expect(document.querySelector("[data-sortable-clone]")).toBeNull());
  });
});

describe("Sortable groups", () => {
  function Sidebar({ onMove }: { onMove: (...args: unknown[]) => void }) {
    const [pinned, setPinned] = useState(["launch"]);
    const [projects, setProjects] = useState(["budget", "hiring"]);
    const move = (
      id: string,
      to: { list: string; index: number },
      from: { list: string; index: number },
    ) => {
      onMove(id, to, from);
      const sets = { pinned: setPinned, projects: setProjects };
      sets[from.list as keyof typeof sets]((rows) => rows.filter((row) => row !== id));
      sets[to.list as keyof typeof sets]((rows) => {
        const next = rows.slice();
        next.splice(to.index, 0, id);
        return next;
      });
    };
    return (
      <LayoutProvider>
        <Nav density="compact">
          <NavSection label="Pinned">
            <Sortable group="chats" name="pinned" label="Pinned" items={pinned} onMove={move}>
              {pinned.map((id) => (
                <SortableItem key={id} id={id}>
                  <NavItem href={`#${id}`} label={id} />
                </SortableItem>
              ))}
            </Sortable>
          </NavSection>
          <NavSection label="Projects">
            <Sortable group="chats" name="projects" label="Projects" items={projects} onMove={move}>
              {projects.map((id) => (
                <SortableItem key={id} id={id}>
                  <NavItem href={`#${id}`} label={id} />
                </SortableItem>
              ))}
            </Sortable>
          </NavSection>
        </Nav>
      </LayoutProvider>
    );
  }

  it("moves a row from one list into the next with the keyboard", async () => {
    const onMove = vi.fn();
    render(<Sidebar onMove={onMove} />);
    const launch = screen.getByRole("link", { name: "launch" });
    launch.focus();
    fireEvent.keyDown(launch, { key: " " });
    fireEvent.keyDown(launch, { key: "ArrowDown" });
    expect(announcer()).toBe("launch, 1 of 3 in Projects.");
    fireEvent.keyDown(launch, { key: "ArrowDown" });
    fireEvent.keyDown(launch, { key: " " });
    expect(onMove).toHaveBeenCalledWith(
      "launch",
      { list: "projects", index: 1 },
      { list: "pinned", index: 0 },
    );
    await waitFor(() =>
      expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual([
        "budget",
        "launch",
        "hiring",
      ]),
    );
  });

  it("keeps the nav's row spacing", () => {
    const { container } = render(<Sidebar onMove={() => {}} />);
    const list = container.querySelector("[data-sortable-list]");
    expect(list?.className).toMatch(/g-2/);
  });

  it("has no axe violations", async () => {
    const { container } = render(<Sidebar onMove={() => {}} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});

describe("Sortable handles and disabled rows", () => {
  it("lifts only from the handle when the list has handles", () => {
    const onReorder = vi.fn();
    render(
      <Sortable items={["a", "b"]} handle onReorder={onReorder}>
        <SortableItem id="a" label="First">
          <SortableHandle />
          <button type="button">Open first</button>
        </SortableItem>
        <SortableItem id="b" label="Second">
          <SortableHandle />
          <button type="button">Open second</button>
        </SortableItem>
      </Sortable>,
    );
    fireEvent.keyDown(screen.getByRole("button", { name: "Open first" }), { key: " " });
    expect(document.querySelector("[data-sortable-clone]")).toBeNull();

    const grip = screen.getByRole("button", { name: "Reorder First" });
    fireEvent.keyDown(grip, { key: " " });
    fireEvent.keyDown(grip, { key: "ArrowDown" });
    fireEvent.keyDown(grip, { key: " " });
    expect(onReorder).toHaveBeenCalledWith(["b", "a"], { id: "a", from: 0, to: 1 });
  });

  it("makes a row with nothing focusable a tab stop", () => {
    const { container } = render(
      <Sortable items={["a"]}>
        <SortableItem id="a">Plain text row</SortableItem>
      </Sortable>,
    );
    expect(container.querySelector("[data-sortable-id='a']")).toHaveAttribute("tabindex", "0");
  });

  it("leaves a disabled row where it is", () => {
    render(
      <Sortable items={["a", "b"]}>
        <SortableItem id="a" disabled>
          <button type="button">Locked</button>
        </SortableItem>
        <SortableItem id="b">
          <button type="button">Free</button>
        </SortableItem>
      </Sortable>,
    );
    fireEvent.keyDown(screen.getByRole("button", { name: "Locked" }), { key: " " });
    expect(document.querySelector("[data-sortable-clone]")).toBeNull();
  });
});

describe("Sortable with a pointer", () => {
  it("does not start a drag on a plain click", () => {
    const onReorder = vi.fn();
    render(<List onReorder={onReorder} />);
    const launch = screen.getByRole("button", { name: "Launch plan" });
    act(() => {
      launch.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          button: 0,
          pointerId: 1,
          clientX: 10,
          clientY: 10,
          pointerType: "mouse",
        }),
      );
      window.dispatchEvent(
        new PointerEvent("pointerup", { pointerId: 1, clientX: 10, clientY: 10 }),
      );
    });
    expect(document.querySelector("[data-sortable-clone]")).toBeNull();
    expect(onReorder).not.toHaveBeenCalled();
  });
});
