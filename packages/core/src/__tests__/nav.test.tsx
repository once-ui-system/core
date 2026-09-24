import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NavGroup } from "../components/NavGroup";
import { NavItem } from "../components/NavItem";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { selectNavHref } from "../utils/navMatch";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * The matcher is the part every sidebar in the fleet got subtly wrong: an
 * equality check misses a nested route, and a prefix check lights the parent
 * up alongside its child.
 */
describe("selectNavHref", () => {
  const hrefs = ["/settings", "/settings/billing", "/settings/billing/invoices"];

  it("takes the deepest href the path is under", () => {
    expect(selectNavHref("/settings/billing/invoices/42", hrefs)).toBe(
      "/settings/billing/invoices",
    );
    expect(selectNavHref("/settings/billing", hrefs)).toBe("/settings/billing");
  });

  it("matches the parent only when nothing deeper does", () => {
    expect(selectNavHref("/settings", hrefs)).toBe("/settings");
    expect(selectNavHref("/settings/profile", hrefs)).toBe("/settings");
  });

  it("does not match a sibling that merely shares a prefix", () => {
    expect(selectNavHref("/settings-v2", hrefs)).toBeNull();
  });

  it("returns null when nothing matches", () => {
    expect(selectNavHref("/inbox", hrefs)).toBeNull();
  });
});

describe("NavItem", () => {
  it("renders its label and marks the current row", () => {
    render(<NavItem href="/projects" icon="home" label="Projects" selected />, { wrapper: wrap });
    expect(screen.getByText("Projects")).toBeDefined();
  });

  it("caps a count at 9+", () => {
    render(<NavItem href="/inbox" label="Inbox" badge={42} />, { wrapper: wrap });
    expect(screen.getByText("9+")).toBeDefined();
    expect(screen.getByLabelText("42 unread")).toBeDefined();
  });

  it("shows nothing trailing for a zero count", () => {
    const { container } = render(<NavItem href="/inbox" label="Inbox" badge={0} />, {
      wrapper: wrap,
    });
    expect(container.querySelector("[aria-label$='unread']")).toBeNull();
  });
});

describe("NavGroup", () => {
  it("hides its children until it is opened", async () => {
    render(
      <NavGroup label="Settings" icon="settings">
        <NavItem href="/settings/billing" label="Billing" />
      </NavGroup>,
      { wrapper: wrap },
    );
    // Accordion keeps the content mounted, so height is what collapses.
    expect(screen.getByText("Billing")).toBeDefined();
    await userEvent.click(screen.getByText("Settings"));
    expect(screen.getByText("Billing")).toBeDefined();
  });

  it("hands the open state over when controlled", async () => {
    const onToggle = vi.fn();
    render(
      <NavGroup label="Settings" open={false} onToggle={onToggle}>
        <NavItem href="/settings/billing" label="Billing" />
      </NavGroup>,
      { wrapper: wrap },
    );
    await userEvent.click(screen.getByText("Settings"));
    expect(onToggle).toHaveBeenCalledOnce();
  });
});
