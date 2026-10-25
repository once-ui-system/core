import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Nav } from "../components/Nav";
import { NavGroup } from "../components/NavGroup";
import { NavItem } from "../components/NavItem";
import { LayoutProvider } from "../contexts/LayoutProvider";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const rail = (props: Partial<React.ComponentProps<typeof Nav>> = {}) => (
  <Nav aria-label="Editor" collapsed expandOnHover {...props}>
    <NavItem icon="home" label="Pages" selected />
    <NavItem icon="inbox" label="Inbox" badge={3} />
    <NavGroup icon="sparkle" label="Presets" defaultOpen>
      <NavItem label="Saved" />
    </NavGroup>
  </Nav>
);

const nav = () => screen.getByRole("navigation", { name: "Editor" });

/** jsdom has no PointerEvent, so the type rides on a plain event the way a browser's would. */
const pointer = (type: "pointerOver" | "pointerOut", el: Element, pointerType: string) => {
  const event = new Event(type === "pointerOver" ? "pointerover" : "pointerout", {
    bubbles: true,
  });
  Object.assign(event, { pointerType });
  fireEvent(el, event);
};

afterEach(() => {
  vi.useRealTimers();
});

/**
 * An icon rail in place of a tooltip per icon: collapsed, a row is its icon
 * and still answers to its label; a resting mouse or the keyboard opens it.
 */
describe("Nav collapsed", () => {
  it("keeps each row named by its label while icons only", () => {
    render(rail({ expandOnHover: false }), { wrapper: wrap });
    expect(nav().getAttribute("data-collapsed")).toBe("collapsed");
    expect(screen.getByRole("button", { name: "Pages" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Presets" })).toBeDefined();
  });

  it("drops badges and closes groups while collapsed", () => {
    render(rail({ expandOnHover: false }), { wrapper: wrap });
    expect(screen.queryByLabelText("3 unread")).toBeNull();
    expect(screen.queryByRole("button", { name: "Saved" })).toBeNull();
  });

  it("opens on a resting mouse and closes after it leaves", () => {
    vi.useFakeTimers();
    render(rail(), { wrapper: wrap });
    const row = screen.getByRole("button", { name: "Pages" });
    pointer("pointerOver", row, "mouse");
    expect(nav().getAttribute("data-collapsed")).toBe("collapsed");
    act(() => vi.advanceTimersByTime(200));
    expect(nav().getAttribute("data-collapsed")).toBe("expanded");
    expect(screen.getByLabelText("3 unread")).toBeDefined();
    expect(screen.getByRole("button", { name: "Saved" })).toBeDefined();
    pointer("pointerOut", row, "mouse");
    act(() => vi.advanceTimersByTime(300));
    expect(nav().getAttribute("data-collapsed")).toBe("collapsed");
  });

  it("ignores touch", () => {
    vi.useFakeTimers();
    render(rail(), { wrapper: wrap });
    pointer("pointerOver", screen.getByRole("button", { name: "Pages" }), "touch");
    act(() => vi.advanceTimersByTime(500));
    expect(nav().getAttribute("data-collapsed")).toBe("collapsed");
  });

  it("opens for the keyboard and closes on Escape", async () => {
    const user = userEvent.setup();
    render(rail(), { wrapper: wrap });
    await user.tab();
    expect(nav().getAttribute("data-collapsed")).toBe("expanded");
    await user.keyboard("{Escape}");
    expect(nav().getAttribute("data-collapsed")).toBe("collapsed");
  });

  it("stays put without expandOnHover", () => {
    vi.useFakeTimers();
    render(rail({ expandOnHover: false }), { wrapper: wrap });
    pointer("pointerOver", screen.getByRole("button", { name: "Pages" }), "mouse");
    act(() => vi.advanceTimersByTime(500));
    expect(nav().getAttribute("data-collapsed")).toBe("collapsed");
  });

  it("leaves a plain Nav alone", () => {
    render(
      <Nav aria-label="Editor">
        <NavItem icon="home" label="Pages" />
      </Nav>,
      { wrapper: wrap },
    );
    expect(nav().hasAttribute("data-collapsed")).toBe(false);
  });
});
