import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdapterProvider } from "../contexts/AdapterProvider";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { MegaMenu, type MenuGroup } from "../modules/navigation/MegaMenu";
import { expectNoAxeViolations } from "../test/axe";

const groups: MenuGroup[] = [
  {
    id: "products",
    label: "Products",
    suffixIcon: "chevronDown",
    sections: [
      {
        title: "Build",
        links: [
          { label: "Core", href: "/core", description: "The component library", icon: "check" },
          { label: "Blocks", href: "/blocks" },
        ],
      },
    ],
  },
  {
    id: "custom",
    label: "Custom",
    content: <a href="/custom-thing">Custom thing</a>,
  },
  { id: "pricing", label: "Pricing", href: "/pricing" },
];

let pathname = "/";
const usePathname = () => pathname;

const Menu = () => (
  <LayoutProvider>
    <AdapterProvider adapters={{ usePathname }}>
      <MegaMenu menuGroups={groups} />
    </AdapterProvider>
  </LayoutProvider>
);

const trigger = (name: string) => screen.getByRole("button", { name });
/** The Row each trigger sits in carries the hover handlers. */
const hoverZone = (name: string) =>
  (screen.getByText(name).closest("a, button") as HTMLElement).parentElement as HTMLElement;
const panelOpen = () => screen.queryByRole("link", { name: /Core/ }) !== null;
const flushFrames = () =>
  act(() => {
    vi.advanceTimersByTime(32);
  });

beforeEach(() => {
  pathname = "/";
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

/**
 * Pointer and routing behaviour around the panel (megamenu-keyboard.test.tsx
 * has the keyboard): hover opens, leaving closes after a 100ms grace that
 * re-entering cancels, a link inside closes it, a route change closes it,
 * and the trigger for the current route is shown selected.
 */
describe("MegaMenu: pointer", () => {
  it("opens on hover and closes 100ms after the pointer leaves", () => {
    render(<Menu />);
    fireEvent.mouseEnter(hoverZone("Products"));
    flushFrames();
    expect(trigger("Products")).toHaveAttribute("aria-expanded", "true");
    expect(panelOpen()).toBe(true);

    fireEvent.mouseLeave(hoverZone("Products"));
    act(() => {
      vi.advanceTimersByTime(99);
    });
    expect(panelOpen()).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(panelOpen()).toBe(false);
  });

  it("stays open while the pointer crosses into the panel", () => {
    render(<Menu />);
    fireEvent.mouseEnter(hoverZone("Products"));
    flushFrames();
    fireEvent.mouseLeave(hoverZone("Products"));
    const panel = document.getElementById(
      trigger("Products").getAttribute("aria-controls") as string,
    )?.parentElement?.parentElement as HTMLElement;
    fireEvent.mouseEnter(panel);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(panelOpen()).toBe(true);
    fireEvent.mouseLeave(panel);
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(panelOpen()).toBe(false);
  });

  it("closes the panel when the pointer reaches a group without one", () => {
    render(<Menu />);
    fireEvent.mouseEnter(hoverZone("Products"));
    flushFrames();
    fireEvent.mouseEnter(hoverZone("Pricing"));
    expect(panelOpen()).toBe(false);
  });

  it("closes when a link in the panel is followed", () => {
    render(<Menu />);
    fireEvent.click(trigger("Products"));
    const core = screen.getByRole("link", { name: /Core/ });
    expect(core).toHaveAttribute("href", "/core");
    expect(core).toHaveTextContent("The component library");
    fireEvent.click(core);
    expect(panelOpen()).toBe(false);
  });

  it("renders a group's custom content in its panel", () => {
    render(<Menu />);
    fireEvent.click(trigger("Custom"));
    expect(trigger("Custom")).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Custom thing" })).toBeVisible();
  });

  it("passes axe with the custom panel open", async () => {
    vi.useRealTimers();
    const { container } = render(<Menu />);
    fireEvent.click(trigger("Custom"));
    await expectNoAxeViolations(container);
  });
});

describe("MegaMenu: routing", () => {
  it("closes the open panel when the route changes", () => {
    const { rerender } = render(<Menu />);
    fireEvent.click(trigger("Products"));
    expect(panelOpen()).toBe(true);
    pathname = "/core";
    rerender(<Menu />);
    expect(panelOpen()).toBe(false);
  });

  it("shows the trigger for the current route as selected", () => {
    pathname = "/pricing/teams";
    render(<Menu />);
    expect(screen.getByRole("link", { name: "Pricing" }).className).toMatch(/selected/);
    expect(trigger("Products").className).not.toMatch(/selected/);
  });
});
