import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Nav, NavSection } from "../components/Nav";
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

/**
 * Nav sets the look once for every row inside it. Outside a Nav the rows keep
 * the look they always had, so nothing that predates it moves.
 */
describe("Nav", () => {
  const link = (name: string) => screen.getByRole("link", { name }) as HTMLElement;

  it("leaves a bare NavItem at 40px with a full-contrast label", () => {
    render(<NavItem href="/a" label="Alpha" selected />, { wrapper: wrap });
    expect(link("Alpha").className).toMatch(/_l_/);
    expect(link("Alpha").getAttribute("aria-current")).toBe("page");
    const text = screen.getByText("Alpha").parentElement as HTMLElement;
    expect(text.className).toMatch(/font-default font-m/);
    expect(text.className).not.toMatch(/on-background-weak/);
  });

  it("drops rows to the small label when compact", () => {
    render(
      <Nav density="compact">
        <NavItem href="/a" label="Alpha" />
      </Nav>,
      { wrapper: wrap },
    );
    expect(link("Alpha").className).toMatch(/_m_/);
    expect((screen.getByText("Alpha").parentElement as HTMLElement).className).toMatch(
      /font-default font-s/,
    );
  });

  it("lets an explicit size beat the nav's density", () => {
    render(
      <Nav density="compact">
        <NavItem href="/a" label="Alpha" size="l" />
        <NavItem href="/b" label="Beta" />
      </Nav>,
      { wrapper: wrap },
    );
    expect(link("Alpha").className).not.toBe(link("Beta").className);
  });

  it("sets the current row in strong and dims the rest unless solid", () => {
    render(
      <Nav variant="subtle">
        <NavItem href="/a" label="Alpha" selected />
        <NavItem href="/b" label="Beta" />
      </Nav>,
      { wrapper: wrap },
    );
    const alpha = screen.getByText("Alpha").parentElement as HTMLElement;
    const beta = screen.getByText("Beta").parentElement as HTMLElement;
    expect(alpha.className).toMatch(/neutral-on-background-strong font-label font-strong/);
    expect(beta.className).toMatch(/neutral-on-background-weak font-label font-default/);
  });

  it("keeps the current row marked for assistive tech when minimal drops the fill", () => {
    render(
      <Nav variant="minimal">
        <NavItem href="/a" label="Alpha" selected />
      </Nav>,
      { wrapper: wrap },
    );
    expect(link("Alpha").getAttribute("aria-current")).toBe("page");
    expect(link("Alpha").className).toMatch(/quiet/);
  });

  it("draws the rail only when asked", () => {
    const group = (rail: boolean) => (
      <Nav rail={rail}>
        <NavGroup label="Settings" defaultOpen>
          <NavItem href="/settings/billing" label="Billing" />
        </NavGroup>
      </Nav>
    );
    const { container, rerender } = render(group(true), { wrapper: wrap });
    const lines = () =>
      container.querySelectorAll("[class*='neutral-background-alpha-medium']").length;
    const withRail = lines();
    rerender(group(false));
    expect(lines()).toBe(withRail - 1);
  });

  it("renders a section heading with its action", () => {
    render(
      <Nav aria-label="Product">
        <NavSection label="Projects" action={<button type="button">Add</button>}>
          <NavItem href="/p" label="Overview" />
        </NavSection>
      </Nav>,
      { wrapper: wrap },
    );
    expect(screen.getByRole("navigation", { name: "Product" })).toBeDefined();
    expect(screen.getByText("Projects")).toBeDefined();
    expect(screen.getByRole("button", { name: "Add" })).toBeDefined();
  });
});
