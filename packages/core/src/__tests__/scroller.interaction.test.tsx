import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Scroller } from "../components/Scroller";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/** jsdom lays nothing out: give every element a 400px viewport over 1000px of content. */
const layout = { scroll: 1000, client: 400 };
let scrollBy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  layout.scroll = 1000;
  layout.client = 400;
  vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockImplementation(() => layout.scroll);
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(() => layout.scroll);
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(() => layout.client);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(() => layout.client);
  scrollBy = vi.fn();
  Object.defineProperty(HTMLElement.prototype, "scrollBy", {
    configurable: true,
    writable: true,
    value: scrollBy,
  });
});

afterEach(() => {
  delete (HTMLElement.prototype as { scrollBy?: unknown }).scrollBy;
});

const viewport = () => screen.getByText("Item 1").parentElement as HTMLElement;

const scrollViewportTo = (position: number, axis: "scrollLeft" | "scrollTop" = "scrollLeft") => {
  act(() => {
    viewport()[axis] = position;
    fireEvent.scroll(viewport());
  });
};

const Items = (props: Partial<React.ComponentProps<typeof Scroller>>) => (
  <Scroller {...props}>
    {[1, 2, 3].map((n) => (
      <button key={n} type="button">
        Item {n}
      </button>
    ))}
  </Scroller>
);

/**
 * A strip that scrolls on its own, with previous/next buttons that only
 * appear while there is somewhere to scroll. Each child reports its index to
 * `onItemClick`, once per activation.
 */
describe("Scroller: scroll buttons", () => {
  it("shows only Next at the start of overflowing content, and passes axe", async () => {
    const { container } = render(<Items />, { wrapper });
    expect(screen.getByRole("button", { name: "Scroll Next" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Scroll Previous" })).not.toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("shows no buttons when the content fits", () => {
    layout.scroll = 400;
    render(<Items />, { wrapper });
    expect(screen.queryByRole("button", { name: /Scroll/ })).not.toBeInTheDocument();
  });

  it("shows both in the middle and only Previous at the end", () => {
    render(<Items />, { wrapper });
    scrollViewportTo(300);
    expect(screen.getByRole("button", { name: "Scroll Previous" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Scroll Next" })).toBeInTheDocument();
    scrollViewportTo(600);
    expect(screen.queryByRole("button", { name: "Scroll Next" })).not.toBeInTheDocument();
  });

  it("scrolls by half a viewport, once per click or key", async () => {
    const user = userEvent.setup();
    render(<Items />, { wrapper });
    await user.click(screen.getByRole("button", { name: "Scroll Next" }));
    expect(scrollBy).toHaveBeenLastCalledWith({ left: 200, behavior: "smooth" });
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(scrollBy).toHaveBeenCalledTimes(3);

    scrollViewportTo(300);
    await user.click(screen.getByRole("button", { name: "Scroll Previous" }));
    expect(scrollBy).toHaveBeenLastCalledWith({ left: -200, behavior: "smooth" });
  });

  it("scrolls vertically in a column", async () => {
    const user = userEvent.setup();
    render(<Items direction="column" />, { wrapper });
    await user.click(screen.getByRole("button", { name: "Scroll Next" }));
    expect(scrollBy).toHaveBeenLastCalledWith({ top: 200, behavior: "smooth" });
    scrollViewportTo(300, "scrollTop");
    expect(screen.getByRole("button", { name: "Scroll Previous" })).toBeInTheDocument();
  });

  it("takes translated button names", () => {
    render(<Items labels={{ next: "Weiter" }} />, { wrapper });
    scrollViewportTo(300);
    expect(screen.getByRole("button", { name: "Weiter" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Scroll Previous" })).toBeInTheDocument();
  });
});

describe("Scroller: items", () => {
  it("reports the index of a clicked item and keeps the item's own onClick", async () => {
    const user = userEvent.setup();
    const onItemClick = vi.fn();
    const onClick = vi.fn();
    render(
      <Scroller onItemClick={onItemClick}>
        <button type="button">Item 1</button>
        <button type="button" onClick={onClick}>
          Item 2
        </button>
      </Scroller>,
      { wrapper },
    );
    await user.click(screen.getByRole("button", { name: "Item 2" }));
    expect(onItemClick).toHaveBeenCalledExactlyOnceWith(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("reports a button item once per Enter or Space, not twice", async () => {
    const user = userEvent.setup();
    const onItemClick = vi.fn();
    const onClick = vi.fn();
    render(
      <Scroller onItemClick={onItemClick}>
        <button type="button" onClick={onClick}>
          Item 1
        </button>
      </Scroller>,
      { wrapper },
    );
    screen.getByRole("button", { name: "Item 1" }).focus();
    await user.keyboard("{Enter}");
    expect(onItemClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
    await user.keyboard(" ");
    expect(onItemClick).toHaveBeenCalledTimes(2);
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("activates a focusable non-button item from Enter and Space", async () => {
    const user = userEvent.setup();
    const onItemClick = vi.fn();
    render(
      <Scroller onItemClick={onItemClick}>
        {/* biome-ignore lint/a11y/useSemanticElements: a non-native item is what this tests. */}
        <div role="button" tabIndex={0}>
          Item 1
        </div>
      </Scroller>,
      { wrapper },
    );
    screen.getByRole("button", { name: "Item 1" }).focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onItemClick).toHaveBeenCalledTimes(2);
    expect(onItemClick).toHaveBeenCalledWith(0);
  });

  it("forwards the ref to the outer container", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Items ref={ref} />, { wrapper });
    expect(ref.current).toContainElement(viewport());
  });
});
