import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as components from "../components";
import { Button } from "../components/Button";
import { Carousel } from "../components/Carousel";
import { Dropdown } from "../components/Dropdown";
import { EmojiPicker } from "../components/EmojiPicker";
import { HoverCard } from "../components/HoverCard";
import { Option } from "../components/Option";
import { Scroller } from "../components/Scroller";
import { Tooltip } from "../components/Tooltip";
import { User } from "../components/User";
import { LayoutProvider } from "../contexts/LayoutProvider";
import * as emoji from "../modules/emoji";
import { expectNoAxeViolations } from "../test/axe";

/**
 * 3.0 F1, F2, F4, F5: components folded into a survivor. Each block reaches
 * the old component's behaviour through the survivor's new API.
 */

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("the folded exports are gone", () => {
  it.each([
    "Modal",
    "Swiper",
    "ScrollContainer",
    "AutoScroll",
    "InfoTip",
    "Hover",
    "CursorCard",
    "DropdownWrapper",
    "ContextMenu",
    "EmojiPickerDropdown",
    "UserMenu",
  ])("%s is not exported", (name) => {
    expect(name in components).toBe(false);
  });

  it("keeps every survivor", () => {
    for (const name of [
      "Dialog",
      "Drawer",
      "Carousel",
      "Scroller",
      "Tooltip",
      "HoverCard",
      "Dropdown",
      "User",
    ]) {
      expect(name in components, name).toBe(true);
    }
    // F9: EmojiPicker survives on its own subpath, off the root barrel.
    expect("EmojiPicker" in emoji).toBe(true);
    expect("EmojiPicker" in components).toBe(false);
  });
});

describe('Carousel mode="snap" (2.x Swiper)', () => {
  const items = [
    { slide: <div>One</div>, alt: "one" },
    { slide: <div>Two</div>, alt: "two" },
    { slide: <div>Three</div>, alt: "three" },
  ];

  it("renders every slide on one track, with dots and a next arrow", () => {
    render(<Carousel mode="snap" items={items} />, { wrapper: wrap });
    for (const text of ["One", "Two", "Three"]) expect(screen.getByText(text)).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Go to slide/ })).toHaveLength(3);
    expect(screen.getByRole("button", { name: "Next slide" })).toBeInTheDocument();
    // Fade mode shows one slide at a time; snap lays them all out.
    expect(screen.queryByRole("button", { name: "Previous slide" })).toBeNull();
  });

  it("defaults to Swiper's 16 / 9 frame, and hides the dots with indicator={false}", () => {
    const { container } = render(<Carousel mode="snap" items={items} indicator={false} />, {
      wrapper: wrap,
    });
    expect(screen.queryAllByRole("button", { name: /Go to slide/ })).toHaveLength(0);
    expect(container.innerHTML).toMatch(/16 \/ 9/);
  });

  it("has no axe violations", async () => {
    const { container } = render(<Carousel mode="snap" items={items} controls="contained" />, {
      wrapper: wrap,
    });
    await expectNoAxeViolations(container);
  });
});

describe("Scroller auto (2.x AutoScroll)", () => {
  it("loops two copies of its children, with no controls", () => {
    render(
      <Scroller auto={{ speed: "slow", hover: "pause", reverse: true, gap: 24 }}>
        <span>Logo</span>
      </Scroller>,
      { wrapper: wrap },
    );
    expect(screen.getAllByText("Logo")).toHaveLength(2);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getAllByText("Logo")[0].parentElement).toHaveStyle({ marginRight: "24px" });
  });
});

describe("Scroller track mode (2.x ScrollContainer)", () => {
  const tiles = ["A", "B", "C", "D"].map((t) => <div key={t}>{t}</div>);

  it("turns its children into a draggable track with markers and controls", () => {
    render(
      <Scroller markers="bottom" tile={{ aspectRatio: "16/9" }}>
        {tiles}
      </Scroller>,
      { wrapper: wrap },
    );
    const track = screen.getByRole("group", { name: "Items" });
    expect(within(track).getByText("A")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Go to item/ })).toHaveLength(4);
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    expect(within(track).getByText("A").parentElement?.className).toMatch(/aspect-ratio|tile/);
  });

  it("reports the item that comes to the front", async () => {
    const onActiveChange = vi.fn();
    render(
      <Scroller markers onActiveChange={onActiveChange}>
        {tiles}
      </Scroller>,
      { wrapper: wrap },
    );
    fireEvent.click(screen.getByRole("button", { name: "Go to item 3 of 4" }));
    await waitFor(() => expect(onActiveChange).toHaveBeenCalledWith(2));
  });

  it("stays a plain scroll box without any track prop", () => {
    render(<Scroller>{tiles}</Scroller>, { wrapper: wrap });
    expect(screen.queryByRole("group", { name: "Items" })).toBeNull();
    expect(screen.getByText("A")).toBeInTheDocument();
  });
});

describe("Tooltip content (2.x InfoTip, and a trigger of your own)", () => {
  it("describes its own trigger and opens on hover", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Copied to the clipboard">
        <button type="button">Copy</button>
      </Tooltip>,
      { wrapper: wrap },
    );
    const trigger = screen.getByRole("button", { name: "Copy" });
    await user.hover(trigger);
    const tip = await screen.findByRole("tooltip");
    expect(tip).toHaveTextContent("Copied to the clipboard");
    expect(trigger).toHaveAccessibleDescription("Copied to the clipboard");
    await expectNoAxeViolations(document.body);
  });

  it("keeps the bare bubble for a label", () => {
    render(<Tooltip label="Close" />, { wrapper: wrap });
    expect(screen.getByRole("tooltip")).toHaveTextContent("Close");
  });
});

/**
 * jsdom defines `window.ontouchstart`, so Hover and CursorCard took every test
 * run for a touch device, where they show nothing by default. A pointer device
 * for these blocks.
 */
const asPointerDevice = () => {
  let saved: PropertyDescriptor | undefined;
  beforeEach(() => {
    saved = Object.getOwnPropertyDescriptor(window, "ontouchstart");
    delete (window as { ontouchstart?: unknown }).ontouchstart;
  });
  afterEach(() => {
    if (saved) Object.defineProperty(window, "ontouchstart", saved);
  });
};

describe('HoverCard placement="cover" (2.x Hover)', () => {
  asPointerDevice();

  it("draws its content over the trigger on hover, after the delay", async () => {
    vi.useFakeTimers();
    try {
      render(
        <HoverCard placement="cover" delay={100} trigger={<span>Card</span>}>
          <span>Overlay</span>
        </HoverCard>,
        { wrapper: wrap },
      );
      const wrapper = screen.getByText("Card").parentElement as HTMLElement;
      fireEvent.mouseEnter(wrapper);
      expect(screen.queryByText("Overlay")).toBeNull();
      act(() => {
        vi.advanceTimersByTime(100);
      });
      const overlay = screen.getByText("Overlay");
      expect(wrapper).toContainElement(overlay);
      fireEvent.mouseLeave(wrapper);
      expect(screen.queryByText("Overlay")).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows nothing while disabled", () => {
    render(
      <HoverCard placement="cover" disabled trigger={<span>Card</span>}>
        <span>Overlay</span>
      </HoverCard>,
      { wrapper: wrap },
    );
    fireEvent.mouseEnter(screen.getByText("Card").parentElement as HTMLElement);
    expect(screen.queryByText("Overlay")).toBeNull();
  });
});

describe('HoverCard placement="cursor" (2.x CursorCard)', () => {
  asPointerDevice();

  it("follows the pointer in a portal while it is over the trigger", () => {
    render(
      <HoverCard placement="cursor" trigger={<span>Hover zone</span>}>
        <span>Follower</span>
      </HoverCard>,
      { wrapper: wrap },
    );
    const zone = screen.getByText("Hover zone").parentElement as HTMLElement;
    fireEvent.mouseEnter(zone);
    fireEvent.mouseMove(document, { clientX: 120, clientY: 80 });
    const card = screen.getByText("Follower").parentElement as HTMLElement;
    expect(zone).not.toContainElement(card);
    expect(card.style.transform).toContain("120px");
    fireEvent.mouseLeave(zone);
    expect(screen.queryByText("Follower")).toBeNull();
  });
});

describe("Dropdown (2.x DropdownWrapper's API)", () => {
  const options = (
    <>
      <Option value="a" label="Alpha" />
      <Option value="b" label="Beta" />
    </>
  );

  it("opens its children from the trigger and reports the pick", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Dropdown trigger={<Button>Sort</Button>} onSelect={onSelect}>
        {options}
      </Dropdown>,
      { wrapper: wrap },
    );
    await user.click(screen.getByRole("button", { name: "Sort" }));
    await user.click(await screen.findByRole("option", { name: "Beta" }));
    expect(onSelect).toHaveBeenCalledWith("b");
  });

  it("still takes the content as `dropdown` for one minor", async () => {
    const user = userEvent.setup();
    render(<Dropdown trigger={<Button>Sort</Button>}>{options}</Dropdown>, {
      wrapper: wrap,
    });
    await user.click(screen.getByRole("button", { name: "Sort" }));
    expect(await screen.findByRole("option", { name: "Alpha" })).toBeInTheDocument();
  });

  it('opens at the pointer as a menu with openOn="contextmenu" (2.x ContextMenu)', async () => {
    render(
      <Dropdown openOn="contextmenu" trigger={<div>Region</div>}>
        {options}
      </Dropdown>,
      { wrapper: wrap },
    );
    fireEvent.contextMenu(screen.getByText("Region"), { clientX: 30, clientY: 40 });
    const menu = await screen.findByRole("menu");
    expect(within(menu).getByRole("menuitem", { name: "Alpha" })).toBeInTheDocument();
    await expectNoAxeViolations(document.body);
  });
});

// The emoji grid is a `role="group"` of buttons (it promised grid cells it
// never had); each emoji button is titled with its description.
const emojiButtons = () =>
  waitFor(() => {
    const buttons = document.querySelectorAll<HTMLElement>('[role="group"] button[title]');
    expect(buttons.length).toBeGreaterThan(0);
    return Array.from(buttons);
  });
const emojiGridShown = () => document.querySelector('[role="group"] button[title]') !== null;

describe("EmojiPicker trigger (2.x EmojiPickerDropdown)", () => {
  it("opens from its trigger and closes itself after a pick, uncontrolled", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<EmojiPicker trigger={<Button>React</Button>} onSelect={onSelect} />, {
      wrapper: wrap,
    });
    expect(emojiGridShown()).toBe(false);
    await user.click(screen.getByRole("button", { name: "React" }));
    await user.click((await emojiButtons())[0]);
    expect(onSelect).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(emojiGridShown()).toBe(false));
  });

  it("follows open and onOpenChange when controlled", async () => {
    const user = userEvent.setup();
    const Controlled = () => {
      const [open, setOpen] = useState(true);
      return (
        <>
          <span data-testid="state">{String(open)}</span>
          <EmojiPicker
            trigger={<Button>React</Button>}
            open={open}
            onOpenChange={setOpen}
            onSelect={() => {}}
          />
        </>
      );
    };
    render(<Controlled />, { wrapper: wrap });
    await user.click((await emojiButtons())[0]);
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("false"));
  });
});

describe("User dropdown (2.x UserMenu)", () => {
  it("is the trigger of a menu", async () => {
    const user = userEvent.setup();
    render(
      <User
        name="Lorant"
        subline="Admin"
        selected
        dropdown={<Option value="signout" label="Sign out" />}
      />,
      { wrapper: wrap },
    );
    expect(screen.getByText("Lorant")).toBeInTheDocument();
    await user.click(screen.getByText("Lorant"));
    expect(await screen.findByRole("option", { name: "Sign out" })).toBeInTheDocument();
  });

  it("renders a plain User without one", () => {
    const { container } = render(<User name="Lorant" />, { wrapper: wrap });
    expect(container.querySelector('[data-role="dropdown-wrapper"]')).toBeNull();
  });
});
