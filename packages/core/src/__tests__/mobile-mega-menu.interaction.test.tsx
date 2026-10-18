import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { type MenuGroup, MegaMenu } from "../modules/navigation/MegaMenu";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const groups: MenuGroup[] = [
  {
    id: "product",
    label: "Product",
    sections: [
      { links: [{ label: "Pricing", href: "/#pricing", icon: "check" }] },
      { title: "Learn", links: [{ label: "Docs", href: "/docs", description: "Guides" }] },
    ],
  },
  { id: "blog", label: "Blog", href: "/blog", suffixIcon: "chevronRight" },
];

const header = (name: string) => screen.getByRole("button", { name });

/**
 * The phone menu: groups are accordions (titled sections nest a second
 * level), plain groups are links, and following any link calls onClose.
 * Links inside a closed group are out of the Tab order.
 */
describe("MobileMegaMenu: keyboard", () => {
  it("keeps a closed group's links inert, and tabs into them once it is open", async () => {
    const user = userEvent.setup();
    render(<MegaMenu collapseBelow="always" menuGroups={groups} />, { wrapper });
    const panel = () =>
      document.getElementById(header("Product").getAttribute("aria-controls") as string);
    // user-event's Tab ignores `inert`; the browser does not.
    expect(panel()).toHaveAttribute("inert");

    await user.tab();
    expect(header("Product")).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(header("Product")).toHaveAttribute("aria-expanded", "true");
    expect(panel()).not.toHaveAttribute("inert");
    await user.tab();
    expect(screen.getByRole("link", { name: "Pricing" })).toHaveFocus();
    await user.tab();
    expect(header("Learn")).toHaveFocus();
    await user.keyboard(" ");
    await user.tab();
    expect(screen.getByRole("link", { name: "Docs" })).toHaveFocus();
  });

  it("calls onClose when a link is followed with Enter", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<MegaMenu collapseBelow="always" menuGroups={groups} onClose={onClose} />, { wrapper });
    await user.click(header("Product"));
    screen.getByRole("link", { name: "Pricing" }).focus();
    await user.keyboard("{Enter}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("MobileMegaMenu: rendering", () => {
  it("renders a plain group as a link that calls onClose", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = render(
      <MegaMenu collapseBelow="always" menuGroups={groups} onClose={onClose} />,
      {
        wrapper,
      },
    );
    const blog = screen.getByRole("link", { name: "Blog" });
    expect(blog).toHaveAttribute("href", "/blog");
    await expectNoAxeViolations(container);
    await user.click(blog);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows a link's description and passes axe fully open", async () => {
    const user = userEvent.setup();
    const { container } = render(<MegaMenu collapseBelow="always" menuGroups={groups} />, {
      wrapper,
    });
    await user.click(header("Product"));
    await user.click(header("Learn"));
    expect(screen.getByText("Guides")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("does not throw without onClose", async () => {
    const user = userEvent.setup();
    render(<MegaMenu collapseBelow="always" menuGroups={groups} />, { wrapper });
    await user.click(screen.getByRole("link", { name: "Blog" }));
  });
});
