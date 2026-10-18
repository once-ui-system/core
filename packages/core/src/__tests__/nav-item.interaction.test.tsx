import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { NavItem } from "../components/NavItem";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

/**
 * A sidebar row: a link (or a button) named by its label, that tells
 * assistive tech when it is the current page, and whose count reaches a
 * screen reader as the real number even when it prints "9+".
 */
describe("NavItem: rendering", () => {
  it("renders a named link and passes axe", async () => {
    const { container } = render(<NavItem href="/projects" icon="home" label="Projects" />, {
      wrapper,
    });
    const link = screen.getByRole("link", { name: "Projects" });
    expect(link).toHaveAttribute("href", "/projects");
    expect(link).not.toHaveAttribute("aria-current");
    await expectNoAxeViolations(container);
  });

  it("marks the selected row as the current page", async () => {
    const { container } = render(<NavItem href="/projects" label="Projects" selected />, {
      wrapper,
    });
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute("aria-current", "page");
    await expectNoAxeViolations(container);
  });

  it("lets the caller set aria-current itself", () => {
    render(<NavItem href="/projects" label="Projects" selected aria-current="location" />, {
      wrapper,
    });
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute(
      "aria-current",
      "location",
    );
  });

  it("names a badge by the real count and passes axe", async () => {
    const { container } = render(<NavItem href="/inbox" label="Inbox" badge={42} />, {
      wrapper,
    });
    expect(screen.getByText("9+")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Inbox 42 unread" })).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("prints a small count as is", () => {
    render(<NavItem href="/inbox" label="Inbox" badge={3} />, { wrapper });
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows a hidden dot for indicator, and no dot when a badge is given", () => {
    const { container, rerender } = render(<NavItem href="/inbox" label="Inbox" indicator />, {
      wrapper,
    });
    const dots = () => container.querySelectorAll('[aria-hidden="true"]');
    expect(dots()).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Inbox" })).toBeInTheDocument();
    rerender(<NavItem href="/inbox" label="Inbox" indicator badge={2} />);
    expect(dots()).toHaveLength(0);
  });
});

describe("NavItem: interaction", () => {
  it("is a button that fires on click, Enter and Space without an href", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<NavItem label="Settings" onClick={onClick} />, { wrapper });
    const button = screen.getByRole("button", { name: "Settings" });
    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it("does not fire when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<NavItem label="Settings" onClick={onClick} disabled />, { wrapper });
    await user.click(screen.getByRole("button", { name: "Settings" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("forwards the ref to the link", () => {
    const ref = { current: null as HTMLElement | null };
    render(<NavItem ref={ref} href="/projects" label="Projects" />, { wrapper });
    expect(ref.current).toBe(screen.getByRole("link", { name: "Projects" }));
  });
});
