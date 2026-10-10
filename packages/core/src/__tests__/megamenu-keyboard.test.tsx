import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { MegaMenu, type MenuGroup } from "../modules/navigation/MegaMenu";
import { expectNoAxeViolations } from "../test/axe";

/**
 * MegaMenu keyboard access, as the 2.0.0-alpha.3 changelog describes it: a
 * group with a panel and no `href` is a button with `aria-expanded` and
 * `aria-controls` that toggles on Enter or Space; a trigger that is also a link
 * opens its panel on keyboard focus; Tab moves from an open trigger into its
 * panel and on to the next trigger, Shift+Tab comes back, ArrowDown opens a
 * panel and the arrows move within it, and Escape closes it and returns focus
 * to the trigger.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const groups: MenuGroup[] = [
  {
    id: "products",
    label: "Products",
    sections: [
      {
        title: "Build",
        links: [
          { label: "Core", href: "/core" },
          { label: "Blocks", href: "/blocks" },
          { label: "Icons", href: "/icons" },
        ],
      },
    ],
  },
  {
    id: "resources",
    label: "Resources",
    sections: [{ links: [{ label: "Docs", href: "/docs" }] }],
  },
  { id: "pricing", label: "Pricing", href: "/pricing" },
  {
    id: "company",
    label: "Company",
    href: "/company",
    sections: [{ links: [{ label: "About", href: "/about" }] }],
  },
];

const renderMenu = () =>
  render(
    <>
      <MegaMenu menuGroups={groups} />
      <button type="button">After the menu</button>
    </>,
    { wrapper },
  );

const trigger = (name: string) => screen.getByRole("button", { name });
const link = (name: string) => screen.getByRole("link", { name });

describe("MegaMenu keyboard", () => {
  beforeEach(() => {
    // jsdom does no layout, so every element reports no boxes and MegaMenu's
    // "is this item visible" filter would find nothing to focus. Report one box
    // each; hidden panels are still excluded by their `visibility`.
    vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
      new DOMRect(0, 0, 10, 10),
    ] as unknown as DOMRectList);
  });

  it("renders a group with a panel and no href as a collapsed button", () => {
    renderMenu();
    const products = trigger("Products");
    expect(products.tagName).toBe("BUTTON");
    expect(products).toHaveAttribute("aria-expanded", "false");
    expect(products).not.toHaveAttribute("aria-controls");
  });

  it("renders a group without a panel as a plain link, with no disclosure state", () => {
    renderMenu();
    const pricing = link("Pricing");
    expect(pricing).toHaveAttribute("href", "/pricing");
    expect(pricing).not.toHaveAttribute("aria-expanded");
  });

  it("toggles the panel with Enter and Space, pointing aria-controls at it", async () => {
    const user = userEvent.setup();
    renderMenu();
    const products = trigger("Products");
    products.focus();

    await user.keyboard("{Enter}");
    expect(products).toHaveAttribute("aria-expanded", "true");
    const panel = document.getElementById(products.getAttribute("aria-controls") ?? "");
    expect(panel).not.toBeNull();
    expect(panel).toContainElement(link("Core"));

    await user.keyboard("{Enter}");
    expect(products).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: "Core" })).toBeNull();

    await user.keyboard(" ");
    expect(products).toHaveAttribute("aria-expanded", "true");
  });

  it("opens on a pointer click and stays open on a second one", async () => {
    const user = userEvent.setup();
    renderMenu();
    const products = trigger("Products");
    await user.click(products);
    expect(products).toHaveAttribute("aria-expanded", "true");
    // Hovering has usually opened the panel already; a toggle would shut it.
    await user.click(products);
    expect(products).toHaveAttribute("aria-expanded", "true");
  });

  it("opens with ArrowDown and focuses the panel's first item", async () => {
    renderMenu();
    const products = trigger("Products");
    products.focus();
    fireEvent.keyDown(products, { key: "ArrowDown" });
    expect(products).toHaveAttribute("aria-expanded", "true");
    await waitFor(() => expect(link("Core")).toHaveFocus());
  });

  it("moves through the panel with the arrow keys, wrapping at both ends", async () => {
    const user = userEvent.setup();
    renderMenu();
    trigger("Products").focus();
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(link("Core")).toHaveFocus());

    await user.keyboard("{ArrowDown}");
    expect(link("Blocks")).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(link("Icons")).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(link("Core")).toHaveFocus();
    await user.keyboard("{ArrowUp}");
    expect(link("Icons")).toHaveFocus();
  });

  it("tabs from an open trigger into its panel, and Shift+Tab comes back", async () => {
    const user = userEvent.setup();
    renderMenu();
    const products = trigger("Products");
    products.focus();
    await user.keyboard("{Enter}");

    await user.tab();
    expect(link("Core")).toHaveFocus();

    await user.tab({ shift: true });
    expect(products).toHaveFocus();
    expect(products).toHaveAttribute("aria-expanded", "true");
  });

  it("tabs from the panel's last item to the next trigger and closes the panel", async () => {
    const user = userEvent.setup();
    renderMenu();
    const products = trigger("Products");
    products.focus();
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(link("Core")).toHaveFocus());
    await user.keyboard("{ArrowUp}");
    expect(link("Icons")).toHaveFocus();

    await user.tab();
    expect(trigger("Resources")).toHaveFocus();
    expect(products).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on Escape from inside the panel and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    renderMenu();
    const products = trigger("Products");
    products.focus();
    await user.keyboard("{ArrowDown}");
    await waitFor(() => expect(link("Core")).toHaveFocus());

    await user.keyboard("{Escape}");
    expect(products).toHaveAttribute("aria-expanded", "false");
    expect(products).toHaveFocus();
  });

  it("closes on Escape from the trigger", async () => {
    const user = userEvent.setup();
    renderMenu();
    const products = trigger("Products");
    products.focus();
    await user.keyboard("{Enter}");
    await user.keyboard("{Escape}");
    expect(products).toHaveAttribute("aria-expanded", "false");
    expect(products).toHaveFocus();
  });

  it("closes the open panel when focus moves to another trigger", async () => {
    const user = userEvent.setup();
    renderMenu();
    const products = trigger("Products");
    products.focus();
    await user.keyboard("{Enter}");

    act(() => trigger("Resources").focus());
    expect(products).toHaveAttribute("aria-expanded", "false");
  });

  it("closes the panel when focus leaves the menu", async () => {
    const user = userEvent.setup();
    renderMenu();
    const products = trigger("Products");
    products.focus();
    await user.keyboard("{Enter}");

    await user.click(screen.getByRole("button", { name: "After the menu" }));
    expect(products).toHaveAttribute("aria-expanded", "false");
  });

  it("opens a link trigger's panel when the keyboard reaches it, not on pointer focus", () => {
    renderMenu();
    const company = link("Company");

    // Focus that is not :focus-visible (a pointer, or a script) leaves it shut.
    act(() => company.focus());
    expect(company).toHaveAttribute("aria-expanded", "false");
    act(() => link("Pricing").focus());

    // jsdom never matches :focus-visible, so stand in for the browser's
    // verdict on keyboard focus.
    const matches = Element.prototype.matches;
    vi.spyOn(Element.prototype, "matches").mockImplementation(function (
      this: Element,
      selector: string,
    ) {
      return selector === ":focus-visible" || matches.call(this, selector);
    });
    act(() => company.focus());
    expect(company).toHaveAttribute("aria-expanded", "true");
    expect(link("About")).toBeInTheDocument();
  });

  it("has no axe violations with a panel open", async () => {
    const user = userEvent.setup();
    const { container } = renderMenu();
    trigger("Products").focus();
    await user.keyboard("{Enter}");
    await expectNoAxeViolations(container);
  });
});
