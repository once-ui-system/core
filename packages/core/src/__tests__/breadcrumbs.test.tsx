import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it } from "vitest";
import { type BreadcrumbItem, Breadcrumbs } from "../components/Breadcrumbs";
import { type AdapterLinkProps, AdapterProvider } from "../contexts/AdapterProvider";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const trail: BreadcrumbItem[] = [
  { label: "Docs", href: "/docs", prefixIcon: "home" },
  { label: "Guides" },
  { label: "Editor", href: "/docs/editor" },
  { label: "Shortcuts" },
];

const long: BreadcrumbItem[] = [
  { label: "Home", href: "/" },
  { label: "Org", href: "/org" },
  { label: "Team", href: "/org/team" },
  { label: "Project", href: "/org/team/project" },
  { label: "Files", href: "/org/team/project/files" },
  { label: "Report.pdf" },
];

/**
 * Stack's docs draw the trail as a Row of text and chevrons: no landmark, no
 * list, the chevrons read aloud, and nothing marks the current page.
 */
describe("Breadcrumbs", () => {
  it("is a navigation landmark named Breadcrumb holding an ordered list", () => {
    render(<Breadcrumbs items={trail} />, { wrapper: wrap });
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    const list = within(nav).getByRole("list");
    expect(list.tagName).toBe("OL");
    expect(within(list).getAllByRole("listitem")).toHaveLength(4);
  });

  it("takes a translated landmark name", () => {
    render(<Breadcrumbs items={trail} aria-label="Fil d'Ariane" />, { wrapper: wrap });
    expect(screen.getByRole("navigation", { name: "Fil d'Ariane" })).toBeInTheDocument();
  });

  it("links the crumbs that have an href and prints the rest", () => {
    render(<Breadcrumbs items={trail} />, { wrapper: wrap });
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("href", "/docs");
    expect(screen.getByRole("link", { name: "Editor" })).toHaveAttribute("href", "/docs/editor");
    expect(screen.queryByRole("link", { name: "Guides" })).toBeNull();
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("marks the last crumb as the current page, linked or not", () => {
    const { rerender } = render(<Breadcrumbs items={trail} />, { wrapper: wrap });
    const items = screen.getAllByRole("listitem");
    expect(within(items[3]).getByText("Shortcuts").closest("[aria-current]")).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(document.querySelectorAll('[aria-current="page"]')).toHaveLength(1);

    rerender(<Breadcrumbs items={[...trail.slice(0, 3)]} />);
    expect(screen.getByRole("link", { name: "Editor" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Docs" })).not.toHaveAttribute("aria-current");
  });

  it("hides the separators from assistive technology", () => {
    render(<Breadcrumbs items={trail} separator="/" />, { wrapper: wrap });
    const items = screen.getAllByRole("listitem");
    const separators = Array.from(document.querySelectorAll('[aria-hidden="true"]')).filter(
      (el) => el.textContent === "/",
    );
    // One between each pair of crumbs, none before the first.
    expect(separators.map((el) => el.closest("li"))).toEqual(items.slice(1));
    expect(items[1]).toHaveTextContent("/Guides");
    expect(screen.getByRole("link", { name: "Editor" })).toBeInTheDocument();
  });

  it("renders internal links through the app's Link adapter", () => {
    const CustomLink = ({ href, children, ...props }: AdapterLinkProps) => (
      <a href={href} data-adapter-link="true" {...props}>
        {children}
      </a>
    );
    render(
      <AdapterProvider adapters={{ Link: CustomLink }}>
        <Breadcrumbs items={trail} />
      </AdapterProvider>,
      { wrapper: wrap },
    );
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("data-adapter-link", "true");
  });

  it("collapses a long trail to the first crumb, a button and the last maxItems - 1", () => {
    render(<Breadcrumbs items={long} maxItems={3} />, { wrapper: wrap });
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(4);
    expect(items[0]).toHaveTextContent("Home");
    expect(within(items[1]).getByRole("button", { name: "Show 3 more" })).toBeInTheDocument();
    expect(items[2]).toHaveTextContent("Files");
    expect(items[3]).toHaveTextContent("Report.pdf");
    expect(screen.queryByText("Org")).toBeNull();
  });

  it("expands in place and moves focus to the first crumb it revealed", async () => {
    const user = userEvent.setup();
    render(<Breadcrumbs items={long} maxItems={3} />, { wrapper: wrap });
    await user.click(screen.getByRole("button", { name: "Show 3 more" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(6);
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.getByRole("link", { name: "Org" })).toHaveFocus();
  });

  it("does not collapse a trail that fits, and never below two crumbs", () => {
    const { rerender } = render(<Breadcrumbs items={trail} maxItems={4} />, { wrapper: wrap });
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(screen.queryByRole("button")).toBeNull();

    rerender(<Breadcrumbs items={long} maxItems={1} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("Home");
    expect(items[2]).toHaveTextContent("Report.pdf");
  });

  it("has no axe violations, full and collapsed", async () => {
    const { container, rerender } = render(<Breadcrumbs items={trail} />, { wrapper: wrap });
    await expectNoAxeViolations(container);
    rerender(<Breadcrumbs items={long} maxItems={3} />);
    await expectNoAxeViolations(container);
  });
});
