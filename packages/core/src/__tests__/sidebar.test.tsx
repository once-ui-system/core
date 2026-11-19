import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Nav } from "../components/Nav";
import { NavGroup } from "../components/NavGroup";
import { NavItem } from "../components/NavItem";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "../components/Sidebar";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";
import {
  parseSidebarCookie,
  serializeSidebarCookie,
  sidebarCookieName,
} from "../utils/sidebarCookie";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

type ProviderProps = React.ComponentProps<typeof SidebarProvider>;
type FrameProps = Omit<React.ComponentProps<typeof Sidebar>, keyof ProviderProps>;

const app = (provider: Partial<ProviderProps> = {}, frame: Partial<FrameProps> = {}) => (
  <SidebarProvider {...provider}>
    <SidebarTrigger />
    <Sidebar aria-label="Workspace" {...frame}>
      <SidebarHeader>Fjell</SidebarHeader>
      <SidebarContent>
        <Nav density="compact" aria-label="Product">
          <NavItem icon="home" label="Dashboard" href="/" selected />
          <NavGroup icon="people" label="Manage">
            <NavItem label="Users" href="/users" />
            <NavItem label="Billing" href="/billing" />
          </NavGroup>
        </Nav>
      </SidebarContent>
      <SidebarFooter>Ada</SidebarFooter>
    </Sidebar>
  </SidebarProvider>
);

const aside = () => screen.getByRole("complementary", { name: "Workspace" });
const handle = () => screen.getByRole("separator", { name: "Resize sidebar" });
const nav = () => screen.getByRole("navigation", { name: "Product" });

const clearCookies = () => {
  for (const part of document.cookie.split(";")) {
    const name = part.split("=")[0]?.trim();
    // biome-ignore lint/suspicious/noDocumentCookie: jsdom has no Cookie Store API.
    if (name) document.cookie = `${name}=; path=/; max-age=0`;
  }
};

beforeEach(clearCookies);
afterEach(() => {
  vi.restoreAllMocks();
  clearCookies();
});

describe("Sidebar", () => {
  it("lays out header, content and footer in an aside, open at the default width", () => {
    render(app(), { wrapper: wrap });
    expect(aside().getAttribute("data-state")).toBe("open");
    expect(aside().style.getPropertyValue("--sidebar-width")).toBe("256px");
    expect(within(aside()).getByText("Fjell")).toBeDefined();
    expect(within(aside()).getByText("Ada")).toBeDefined();
    expect(nav().getAttribute("data-collapsed")).toBeNull();
  });

  it("folds into an icon rail from the trigger, and the Nav follows it", async () => {
    const user = userEvent.setup();
    render(app(), { wrapper: wrap });
    const trigger = screen.getByRole("button", { name: "Collapse sidebar" });
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    await user.click(trigger);
    expect(aside().getAttribute("data-state")).toBe("rail");
    expect(nav().getAttribute("data-collapsed")).toBe("collapsed");
    // Icons only, still named by their labels.
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeDefined();
    const expand = screen.getByRole("button", { name: "Expand sidebar" });
    expect(expand.getAttribute("aria-expanded")).toBe("false");
    await user.click(expand);
    expect(aside().getAttribute("data-state")).toBe("open");
  });

  it("toggles on mod+b outside text fields, and not while typing", async () => {
    const user = userEvent.setup();
    render(
      <>
        {app()}
        <input aria-label="Search" />
      </>,
      { wrapper: wrap },
    );
    await user.keyboard("{Control>}b{/Control}");
    expect(aside().getAttribute("data-state")).toBe("rail");
    await user.click(screen.getByLabelText("Search"));
    await user.keyboard("{Control>}b{/Control}");
    expect(aside().getAttribute("data-state")).toBe("rail");
  });

  it("names its shortcut for assistive tech", () => {
    render(app(), { wrapper: wrap });
    const trigger = screen.getByRole("button", { name: "Collapse sidebar" });
    expect(trigger.getAttribute("aria-keyshortcuts")).toBe("Control+B");
  });

  it("resizes from the keyboard in 8px steps, 32 with Shift, within its range", () => {
    render(app({ minWidth: 200, maxWidth: 320 }), { wrapper: wrap });
    const sep = handle();
    expect(sep.getAttribute("aria-valuenow")).toBe("256");
    fireEvent.keyDown(sep, { key: "ArrowRight" });
    expect(sep.getAttribute("aria-valuenow")).toBe("264");
    fireEvent.keyDown(sep, { key: "ArrowRight", shiftKey: true });
    expect(sep.getAttribute("aria-valuenow")).toBe("296");
    fireEvent.keyDown(sep, { key: "End" });
    expect(sep.getAttribute("aria-valuenow")).toBe("320");
    fireEvent.keyDown(sep, { key: "ArrowRight" });
    expect(sep.getAttribute("aria-valuenow")).toBe("320");
    fireEvent.keyDown(sep, { key: "Home" });
    expect(sep.getAttribute("aria-valuenow")).toBe("200");
  });

  it("folds when the keyboard shrinks it past the minimum, and opens again", () => {
    render(app({ defaultWidth: 204, minWidth: 200 }), { wrapper: wrap });
    fireEvent.keyDown(handle(), { key: "ArrowLeft" });
    expect(aside().getAttribute("data-state")).toBe("rail");
    expect(handle().getAttribute("aria-valuetext")).toBe("Collapsed");
    fireEvent.keyDown(handle(), { key: "ArrowRight" });
    expect(aside().getAttribute("data-state")).toBe("open");
    fireEvent.keyDown(handle(), { key: "Enter" });
    expect(aside().getAttribute("data-state")).toBe("rail");
  });

  it("follows a drag and commits once, folding past the minimum", () => {
    const onWidthChange = vi.fn();
    render(app({ onWidthChange, minWidth: 200 }), { wrapper: wrap });
    const sep = handle();
    fireEvent.pointerDown(sep, { button: 0, clientX: 256, pointerId: 1 });
    expect(aside().hasAttribute("data-resizing")).toBe(true);
    fireEvent.pointerMove(sep, { clientX: 300, pointerId: 1 });
    fireEvent.pointerMove(sep, { clientX: 320, pointerId: 1 });
    expect(aside().style.getPropertyValue("--sidebar-width")).toBe("320px");
    expect(onWidthChange).not.toHaveBeenCalled();
    fireEvent.pointerUp(sep, { pointerId: 1 });
    expect(onWidthChange).toHaveBeenCalledTimes(1);
    expect(onWidthChange).toHaveBeenCalledWith(320);
    expect(aside().hasAttribute("data-resizing")).toBe(false);

    fireEvent.pointerDown(sep, { button: 0, clientX: 320, pointerId: 2 });
    fireEvent.pointerMove(sep, { clientX: 100, pointerId: 2 });
    expect(aside().getAttribute("data-state")).toBe("rail");
    fireEvent.pointerUp(sep, { pointerId: 2 });
    expect(aside().getAttribute("data-state")).toBe("rail");
    // The width it had is kept for when it opens again.
    expect(aside().style.getPropertyValue("--sidebar-width")).toBe("320px");
  });

  it("resets to the default width, open, on a double-click", () => {
    render(app({ defaultWidth: 240 }), { wrapper: wrap });
    fireEvent.keyDown(handle(), { key: "End" });
    fireEvent.keyDown(handle(), { key: "Enter" });
    expect(aside().getAttribute("data-state")).toBe("rail");
    fireEvent.doubleClick(handle());
    expect(aside().getAttribute("data-state")).toBe("open");
    expect(handle().getAttribute("aria-valuenow")).toBe("240");
  });

  it("can be controlled", async () => {
    const user = userEvent.setup();
    const onCollapsedChange = vi.fn();
    render(app({ collapsed: false, onCollapsedChange }), { wrapper: wrap });
    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(onCollapsedChange).toHaveBeenCalledWith(true);
    // The host kept it open.
    expect(aside().getAttribute("data-state")).toBe("open");
  });

  it("opens a group's rows in a menu beside its icon while a rail", async () => {
    const user = userEvent.setup();
    render(app({ defaultCollapsed: true }), { wrapper: wrap });
    expect(screen.queryByRole("link", { name: "Users" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Manage" }));
    expect(await screen.findByRole("link", { name: "Users" })).toBeDefined();
    expect(screen.getByRole("link", { name: "Billing" })).toBeDefined();
  });

  it("slides off canvas and takes its contents out of reach with collapsible offcanvas", async () => {
    const user = userEvent.setup();
    render(app({}, { collapsible: "offcanvas" }), { wrapper: wrap });
    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(aside().getAttribute("data-state")).toBe("hidden");
    const panel = aside().firstElementChild as HTMLElement;
    expect(panel.inert).toBe(true);
    expect(screen.queryByRole("separator")).toBeNull();
    // The Nav keeps its labels for when it slides back.
    expect(nav().getAttribute("data-collapsed")).toBeNull();
  });

  it("stays open with collapsible false", async () => {
    const user = userEvent.setup();
    render(app({}, { collapsible: false }), { wrapper: wrap });
    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(aside().getAttribute("data-state")).toBe("open");
  });

  it("peeks over the page from the rail with expandOnHover", () => {
    vi.useFakeTimers();
    try {
      render(app({ defaultCollapsed: true }, { expandOnHover: true }), { wrapper: wrap });
      const panel = aside().firstElementChild as HTMLElement;
      const event = new Event("pointerover", { bubbles: true });
      Object.assign(event, { pointerType: "mouse" });
      fireEvent(panel, event);
      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(panel.hasAttribute("data-peek")).toBe(true);
      // Its footprint is still the rail.
      expect(aside().getAttribute("data-state")).toBe("rail");
      expect(nav().getAttribute("data-collapsed")).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  it("works on its own, without a provider", async () => {
    const user = userEvent.setup();
    render(
      <Sidebar aria-label="Workspace" defaultWidth={280}>
        <SidebarHeader>
          <SidebarTrigger />
        </SidebarHeader>
      </Sidebar>,
      { wrapper: wrap },
    );
    expect(aside().style.getPropertyValue("--sidebar-width")).toBe("280px");
    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(aside().getAttribute("data-state")).toBe("rail");
  });

  it("has no axe violations open or as a rail", async () => {
    const { container, rerender } = render(app(), { wrapper: wrap });
    await expectNoAxeViolations(container);
    rerender(app({ defaultCollapsed: true }));
    await expectNoAxeViolations(container);
  });
});

describe("Sidebar persistence", () => {
  it("writes the cookie on a change, not on mount", async () => {
    const user = userEvent.setup();
    render(app({ persist: "app" }), { wrapper: wrap });
    expect(document.cookie).not.toContain(sidebarCookieName("app"));
    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(document.cookie).toContain(`${sidebarCookieName("app")}=256:1`);
    fireEvent.keyDown(handle(), { key: "ArrowRight" });
    expect(document.cookie).toContain(`${sidebarCookieName("app")}=256:0`);
  });

  it("reads back what it wrote", () => {
    expect(parseSidebarCookie(serializeSidebarCookie({ width: 287.6, collapsed: true }))).toEqual({
      width: 288,
      collapsed: true,
    });
    expect(parseSidebarCookie("240:0")).toEqual({ width: 240, collapsed: false });
    expect(parseSidebarCookie(encodeURIComponent("240:1"))).toEqual({
      width: 240,
      collapsed: true,
    });
  });

  it("ignores what it cannot read, field by field", () => {
    expect(parseSidebarCookie(undefined)).toEqual({});
    expect(parseSidebarCookie("")).toEqual({});
    expect(parseSidebarCookie("wide:1")).toEqual({ collapsed: true });
    expect(parseSidebarCookie("300:maybe")).toEqual({ width: 300 });
    expect(parseSidebarCookie("-5:0")).toEqual({ collapsed: false });
  });

  it("names the cookie safely", () => {
    expect(sidebarCookieName("stack product")).toBe("once-ui-sidebar-stack-product");
  });
});

describe("Sidebar on a phone", () => {
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

  it("is a drawer that the trigger opens, and a link inside closes", async () => {
    const user = userEvent.setup();
    render(app(), { wrapper: wrap });
    expect(screen.queryByRole("complementary", { name: "Workspace" })).toBeNull();
    const trigger = screen.getByRole("button", { name: "Open menu" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await user.click(trigger);
    const dashboard = await screen.findByRole("link", { name: "Dashboard" });
    // Full labels in the drawer, whatever the desktop state.
    expect(nav().getAttribute("data-collapsed")).toBeNull();
    fireEvent.click(dashboard);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });
});

describe("useSidebar", () => {
  it("explains itself outside a provider", () => {
    const Probe = () => {
      useSidebar();
      return null;
    };
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(/SidebarProvider/);
  });
});
