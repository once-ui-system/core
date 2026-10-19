import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it } from "vitest";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const trail = [
  { label: "Home", href: "/", prefixIcon: "home" as const },
  { label: "Docs", href: "/docs" },
  { label: "Components", href: "/docs/components" },
  { label: "Layout" },
  { label: "Breadcrumbs", href: "/docs/components/breadcrumbs" },
];

/**
 * Keyboard use of the trail: Tab walks the links in order, the collapsed
 * "more" button expands from Enter or Space and hands focus to what it
 * revealed, and the Tab order continues from there.
 */
describe("Breadcrumbs: keyboard", () => {
  it("tabs through the links in order and skips plain-text crumbs", async () => {
    const user = userEvent.setup();
    render(<Breadcrumbs items={trail} />, { wrapper });
    const order: string[] = [];
    for (let i = 0; i < 4; i++) {
      await user.tab();
      order.push(document.activeElement?.textContent ?? "");
    }
    expect(order).toEqual(["Home", "Docs", "Components", "Breadcrumbs"]);
  });

  it("expands with Enter, focuses the first revealed crumb and keeps going", async () => {
    const user = userEvent.setup();
    const { container } = render(<Breadcrumbs items={trail} maxItems={3} />, { wrapper });
    expect(screen.getAllByRole("listitem")).toHaveLength(4);

    await user.tab();
    await user.tab();
    const more = screen.getByRole("button", { name: "Show 2 more" });
    expect(more).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(screen.queryByRole("button", { name: /more/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    expect(screen.getByRole("link", { name: "Docs" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("link", { name: "Components" })).toHaveFocus();
    await expectNoAxeViolations(container);
  });

  it("expands with Space too", async () => {
    const user = userEvent.setup();
    render(<Breadcrumbs items={trail} maxItems={2} />, { wrapper });
    screen.getByRole("button", { name: "Show 3 more" }).focus();
    await user.keyboard(" ");
    expect(screen.getByRole("link", { name: "Docs" })).toHaveFocus();
  });

  it("marks the current page on the last crumb only", () => {
    render(<Breadcrumbs items={trail} />, { wrapper });
    const current = document.querySelectorAll('[aria-current="page"]');
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent("Breadcrumbs");
  });

  it("renders a custom separator between crumbs only", () => {
    render(<Breadcrumbs items={trail.slice(0, 3)} separator="/" />, { wrapper });
    const separators = Array.from(document.querySelectorAll('[aria-hidden="true"]')).filter(
      (el) => el.textContent === "/",
    );
    expect(separators).toHaveLength(2);
  });

  it("renders an empty list for no items", async () => {
    const { container } = render(<Breadcrumbs items={[]} />, { wrapper });
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
    await expectNoAxeViolations(container);
  });

  it("forwards the ref to the nav", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Breadcrumbs ref={ref} items={trail} />, { wrapper });
    expect(ref.current).toBe(screen.getByRole("navigation"));
  });
});
