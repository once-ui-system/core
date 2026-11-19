import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Scroller } from "../components/Scroller";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const items = ["One", "Two", "Three", "Four"].map((n) => <span key={n}>{n}</span>);

const previous = () => screen.getByRole("button", { name: "Previous" });
const next = () => screen.getByRole("button", { name: "Next" });
const track = () => screen.getByRole("group", { name: "Items" });
const offset = () =>
  (track().firstElementChild as HTMLElement).style.transform.match(
    /translate3d\((-?[\d.]+)px/,
  )?.[1];

/** A 100px tile in a 100px viewport: one tile per view, 100px per step. */
beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(100);
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(100);
  Object.assign(HTMLElement.prototype, {
    setPointerCapture: vi.fn(),
    releasePointerCapture: vi.fn(),
    hasPointerCapture: vi.fn(() => true),
  });
});

/**
 * A run of tiles moved by Previous/Next, the arrow keys, markers and a drag.
 * Without wrap-around the controls disable at either end; the front item is
 * reported through onActiveChange and can be set with `active`.
 */
describe("ScrollContainer: controls", () => {
  it("renders the items with named controls and passes axe", async () => {
    const { container } = render(<Scroller markers>{items}</Scroller>, { wrapper });
    expect(screen.getByText("Three")).toBeInTheDocument();
    expect(previous()).toBeDisabled();
    expect(next()).toBeEnabled();
    expect(track()).toHaveAttribute("tabindex", "0");
    await expectNoAxeViolations(container);
  });

  it("moves one step per Next and Previous, and stops at the end", async () => {
    const user = userEvent.setup();
    const onActiveChange = vi.fn();
    render(<Scroller onActiveChange={onActiveChange}>{items}</Scroller>, { wrapper });
    await user.click(next());
    expect(offset()).toBe("-100");
    await user.click(next());
    await user.click(next());
    expect(next()).toBeDisabled();
    expect(onActiveChange.mock.calls.map(([i]) => i)).toEqual([1, 2, 3]);
    await user.click(previous());
    expect(onActiveChange).toHaveBeenLastCalledWith(2);
    expect(offset()).toBe("-200");
  });

  it("moves by `step`", async () => {
    const user = userEvent.setup();
    render(<Scroller step={2}>{items}</Scroller>, { wrapper });
    await user.click(next());
    expect(offset()).toBe("-200");
  });

  it("answers ArrowLeft and ArrowRight on the focused track", async () => {
    const user = userEvent.setup();
    const onActiveChange = vi.fn();
    render(<Scroller onActiveChange={onActiveChange}>{items}</Scroller>, { wrapper });
    track().focus();
    await user.keyboard("{ArrowRight}{ArrowRight}");
    expect(onActiveChange).toHaveBeenLastCalledWith(2);
    await user.keyboard("{ArrowLeft}");
    expect(onActiveChange).toHaveBeenLastCalledWith(1);
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(offset()).toBe("0");
  });

  it("does not report on mount", () => {
    const onActiveChange = vi.fn();
    render(<Scroller onActiveChange={onActiveChange}>{items}</Scroller>, { wrapper });
    expect(onActiveChange).not.toHaveBeenCalled();
  });
});

describe("ScrollContainer: markers and `active`", () => {
  it("marks the front item and jumps to a marker", async () => {
    const user = userEvent.setup();
    render(<Scroller markers="bottom">{items}</Scroller>, { wrapper });
    const marker = (n: number) => screen.getByRole("button", { name: `Go to item ${n} of 4` });
    expect(marker(1)).toHaveAttribute("aria-current", "true");
    await user.click(marker(3));
    expect(marker(3)).toHaveAttribute("aria-current", "true");
    expect(marker(1)).not.toHaveAttribute("aria-current");
    expect(offset()).toBe("-200");
  });

  it("moves to `active` and keeps up with the host", async () => {
    const user = userEvent.setup();
    const Host = () => {
      const [active, setActive] = useState(0);
      return (
        <>
          <Scroller active={active} onActiveChange={setActive}>
            {items}
          </Scroller>
          <button type="button" onClick={() => setActive(3)}>
            Last
          </button>
          <output>{active}</output>
        </>
      );
    };
    render(<Host />, { wrapper });
    await user.click(screen.getByRole("button", { name: "Last" }));
    expect(offset()).toBe("-300");
    await user.click(previous());
    expect(screen.getByRole("status")).toHaveTextContent("2");
  });
});

describe("ScrollContainer: infinite", () => {
  it("never disables the controls, and hides and disables the copies", async () => {
    const { container } = render(
      <Scroller infinite>
        {["One", "Two"].map((n) => (
          <a key={n} href={`#${n}`}>
            {n}
          </a>
        ))}
      </Scroller>,
      { wrapper },
    );
    expect(previous()).toBeEnabled();
    expect(next()).toBeEnabled();
    const tiles = Array.from((track().firstElementChild as HTMLElement).children);
    expect(tiles).toHaveLength(6);
    const copies = tiles.filter((t) => t.getAttribute("aria-hidden") === "true");
    expect(copies).toHaveLength(4);
    for (const copy of copies) expect(copy).toHaveAttribute("inert");
    expect(screen.getAllByRole("link")).toHaveLength(2);
    await expectNoAxeViolations(container);
  });

  it("wraps from the first item back to the last", async () => {
    const user = userEvent.setup();
    const onActiveChange = vi.fn();
    render(
      <Scroller infinite onActiveChange={onActiveChange}>
        {items}
      </Scroller>,
      {
        wrapper,
      },
    );
    await user.click(previous());
    expect(onActiveChange).toHaveBeenLastCalledWith(3);
    // Still in the copy before the real run until the transition ends.
    expect(offset()).toBe("-300");
    act(() => {
      fireEvent.transitionEnd(track().firstElementChild as HTMLElement, {
        propertyName: "transform",
      });
    });
    expect(offset()).toBe("-700");
    expect(onActiveChange).toHaveBeenCalledTimes(1);
  });
});

describe("ScrollContainer: drag", () => {
  const dragBy = (dx: number) => {
    const el = track();
    fireEvent.pointerDown(el, { button: 0, clientX: 200, clientY: 0, pointerId: 1 });
    fireEvent.pointerMove(el, { clientX: 200 + dx / 2, clientY: 0, pointerId: 1 });
    fireEvent.pointerMove(el, { clientX: 200 + dx, clientY: 0, pointerId: 1 });
    fireEvent.pointerUp(el, { clientX: 200 + dx, clientY: 0, pointerId: 1 });
  };

  it("advances when dragged left past the commit distance", () => {
    const onActiveChange = vi.fn();
    render(<Scroller onActiveChange={onActiveChange}>{items}</Scroller>, { wrapper });
    dragBy(-60);
    expect(onActiveChange).toHaveBeenLastCalledWith(1);
  });

  it("ignores a mostly vertical gesture", () => {
    const onActiveChange = vi.fn();
    render(<Scroller onActiveChange={onActiveChange}>{items}</Scroller>, { wrapper });
    const el = track();
    fireEvent.pointerDown(el, { button: 0, clientX: 200, clientY: 0 });
    fireEvent.pointerMove(el, { clientX: 205, clientY: 80 });
    fireEvent.pointerUp(el, { clientX: 205, clientY: 80 });
    expect(onActiveChange).not.toHaveBeenCalled();
  });

  it("does not move with draggable={false}", () => {
    const onActiveChange = vi.fn();
    render(
      <Scroller draggable={false} onActiveChange={onActiveChange}>
        {items}
      </Scroller>,
      {
        wrapper,
      },
    );
    dragBy(-80);
    expect(onActiveChange).not.toHaveBeenCalled();
  });
});
