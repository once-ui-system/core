import { render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { NavGroup } from "../components/NavGroup";
import { NavItem } from "../components/NavItem";
import { LayoutProvider } from "../contexts/LayoutProvider";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * A group's badge sits at the end of its header, as an item's does, rather
 * than trailing the label: the label and the badge are siblings in a row
 * spread to both edges.
 */
describe("NavGroup badge", () => {
  it("puts a text badge at the header's end, after the label", () => {
    render(
      <NavGroup label="Selling" icon="store" badge="New">
        <NavItem href="/shop" label="Shop" />
      </NavGroup>,
      { wrapper },
    );
    const badge = screen.getByText("New");
    const label = screen.getByText("Selling");
    // the badge is not inside the label's own box
    expect(label.contains(badge)).toBe(false);
    const row = badge.closest("[class*='justify-between'], [class*='space-between']");
    expect(row).not.toBeNull();
    expect(row?.contains(label)).toBe(true);
  });

  it("hides a zero count and caps a large one at 9+", () => {
    const { rerender } = render(
      <NavGroup label="Inbox" badge={0}>
        <NavItem href="/a" label="A" />
      </NavGroup>,
      { wrapper },
    );
    expect(screen.queryByText("0")).toBeNull();
    rerender(
      <NavGroup label="Inbox" badge={12}>
        <NavItem href="/a" label="A" />
      </NavGroup>,
    );
    expect(screen.getByText("9+")).toBeInTheDocument();
    expect(screen.getByLabelText("12 unread")).toBeInTheDocument();
  });
});
