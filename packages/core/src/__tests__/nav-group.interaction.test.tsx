import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { NavGroup } from "../components/NavGroup";
import { NavItem } from "../components/NavItem";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const Settings = (props: Partial<React.ComponentProps<typeof NavGroup>>) => (
  <NavGroup label="Settings" icon="settings" {...props}>
    <NavItem href="/settings/profile" label="Profile" />
    <NavItem href="/settings/billing" label="Billing" />
  </NavGroup>
);

const header = () => screen.getByRole("button", { name: "Settings" });
const panel = () => document.getElementById(header().getAttribute("aria-controls") as string);

/**
 * A collapsible group of nav rows: a disclosure header that opens from the
 * mouse and keyboard, uncontrolled from `defaultOpen` or driven by
 * `open`/`onToggle`, whose closed rows are out of reach.
 */
describe("NavGroup", () => {
  it("renders a closed disclosure with its rows unreachable, and passes axe", async () => {
    const { container } = render(<Settings />, { wrapper });
    expect(header()).toHaveAttribute("aria-expanded", "false");
    expect(panel()).toHaveAttribute("aria-hidden", "true");
    expect(panel()).toHaveAttribute("inert");
    await expectNoAxeViolations(container);
  });

  it("starts open with defaultOpen and passes axe", async () => {
    const { container } = render(<Settings defaultOpen />, { wrapper });
    expect(header()).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Profile" })).toBeVisible();
    await expectNoAxeViolations(container);
  });

  it("opens with Enter, then Tab reaches the rows", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Settings onOpenChange={onOpenChange} />, { wrapper });
    await user.tab();
    expect(header()).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(header()).toHaveAttribute("aria-expanded", "true");
    expect(onOpenChange).toHaveBeenCalledWith(true);
    await user.tab();
    expect(screen.getByRole("link", { name: "Profile" })).toHaveFocus();
  });

  it("closes again with Space", async () => {
    const user = userEvent.setup();
    render(<Settings defaultOpen />, { wrapper });
    header().focus();
    await user.keyboard(" ");
    expect(header()).toHaveAttribute("aria-expanded", "false");
  });

  it("follows `open` when controlled and reports toggles", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { rerender } = render(<Settings open={false} onOpenChange={onOpenChange} />, { wrapper });
    await user.click(header());
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(header()).toHaveAttribute("aria-expanded", "false");
    rerender(<Settings open onOpenChange={onOpenChange} />);
    expect(header()).toHaveAttribute("aria-expanded", "true");
  });

  it("keeps one group open at a time when the host owns the state", async () => {
    const user = userEvent.setup();
    const Sidebar = () => {
      const [open, setOpen] = useState<string | null>(null);
      const toggle = (id: string) => () => setOpen((o) => (o === id ? null : id));
      return (
        <>
          <NavGroup label="One" open={open === "one"} onOpenChange={toggle("one")}>
            <NavItem href="/1" label="Row 1" />
          </NavGroup>
          <NavGroup label="Two" open={open === "two"} onOpenChange={toggle("two")}>
            <NavItem href="/2" label="Row 2" />
          </NavGroup>
        </>
      );
    };
    render(<Sidebar />, { wrapper });
    const one = screen.getByRole("button", { name: "One" });
    const two = screen.getByRole("button", { name: "Two" });
    await user.click(one);
    await user.click(two);
    expect(one).toHaveAttribute("aria-expanded", "false");
    expect(two).toHaveAttribute("aria-expanded", "true");
    expect(one.getAttribute("aria-controls")).not.toBe(two.getAttribute("aria-controls"));
  });

  it("forwards the ref to its root", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Settings ref={ref} />, { wrapper });
    expect(ref.current).toContainElement(header());
  });
});
