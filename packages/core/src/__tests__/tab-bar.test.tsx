import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Nav } from "../components/Nav";
import { NavItem } from "../components/NavItem";
import { Sidebar, SidebarContent, SidebarProvider } from "../components/Sidebar";
import { TabBar, TabBarItem, TabBarSidebarTrigger } from "../components/TabBar";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const bar = (more?: React.ReactNode) => (
  <TabBar aria-label="Product">
    <TabBarItem href="/" icon="home" label="Overview" selected />
    <TabBarItem href="/clients" icon="people" label="Clients" badge={12} />
    <TabBarItem href="/inbox" icon="inbox" label="Inbox" badge />
    {more}
  </TabBar>
);

describe("TabBar", () => {
  it("is a named navigation whose current item is the page", () => {
    render(bar(), { wrapper: wrap });
    const nav = screen.getByRole("navigation", { name: "Product" });
    const overview = screen.getByRole("link", { name: "Overview" });
    expect(nav.contains(overview)).toBe(true);
    expect(overview.getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: /Clients/ }).getAttribute("aria-current")).toBeNull();
  });

  it("caps a count at 9+ and reads it as unread", () => {
    render(bar(), { wrapper: wrap });
    const clients = screen.getByRole("link", { name: /Clients/ });
    expect(clients.textContent).toContain("9+");
    expect(clients.textContent).toContain("12 unread");
  });

  it("leaves room for itself unless told not to", () => {
    const { container, rerender } = render(bar(), { wrapper: wrap });
    expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0);
    rerender(
      <TabBar aria-label="Product" spacer={false}>
        <TabBarItem href="/" icon="home" label="Overview" />
      </TabBar>,
    );
    expect(container.firstElementChild?.tagName).toBe("NAV");
  });

  it("has no axe violations", async () => {
    const { container } = render(bar(), { wrapper: wrap });
    await expectNoAxeViolations(container);
  });
});

describe("TabBarSidebarTrigger on a phone", () => {
  beforeEach(() => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: query.includes("max-width"),
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as unknown as MediaQueryList,
    );
  });

  it("opens the sidebar as a sheet from the bottom, and a link inside closes it", async () => {
    const user = userEvent.setup();
    render(
      <SidebarProvider>
        <Sidebar aria-label="Workspace" mobileSide="bottom">
          <SidebarContent>
            <Nav aria-label="Everything">
              <NavItem icon="settings" label="Settings" href="/settings" />
            </Nav>
          </SidebarContent>
        </Sidebar>
        {bar(<TabBarSidebarTrigger />)}
      </SidebarProvider>,
      { wrapper: wrap },
    );
    const more = screen.getByRole("button", { name: "More" });
    expect(more.getAttribute("aria-expanded")).toBe("false");
    await user.click(more);
    expect(more.getAttribute("aria-expanded")).toBe("true");
    const dialog = await screen.findByRole("dialog");
    expect(dialog.getAttribute("data-side")).toBe("bottom");
    fireEvent.click(await screen.findByRole("link", { name: "Settings" }));
    expect(more.getAttribute("aria-expanded")).toBe("false");
  });
});
