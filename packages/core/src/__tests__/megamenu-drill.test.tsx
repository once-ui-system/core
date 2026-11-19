import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { MegaMenu } from "../modules/navigation/MegaMenu";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const groups = [
  {
    id: "product",
    label: "Product",
    sections: [
      { links: [{ label: "Pricing", href: "/#pricing" }] },
      { title: "Learn", links: [{ label: "Docs", href: "/docs", description: "Guides" }] },
    ],
  },
  { id: "blog", label: "Blog", href: "/blog" },
];

describe('MegaMenu collapseAs="drill"', () => {
  it("lists the groups, drills into one, and comes back to the group it opened", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = render(
      <MegaMenu collapseBelow="always" collapseAs="drill" menuGroups={groups} onClose={onClose} />,
      { wrapper: wrap },
    );

    expect(screen.getByRole("link", { name: "Blog" })).toHaveAttribute("href", "/blog");
    expect(screen.queryByRole("link", { name: /^Docs/ })).toBeNull();

    await user.click(screen.getByRole("button", { name: "Product" }));
    const back = screen.getByRole("button", { name: "Back from Product" });
    expect(back).toHaveFocus();
    expect(screen.getByRole("heading", { name: "Learn" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /^Docs/ })).toHaveAttribute("href", "/docs");
    expect(screen.queryByRole("link", { name: "Blog" })).toBeNull();
    expect(container.querySelector('[role="option"]')).toBeNull();
    await expectNoAxeViolations(container);

    await user.click(back);
    expect(screen.getByRole("button", { name: "Product" })).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Product" }));
    await user.click(screen.getByRole("link", { name: "Pricing" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("keeps the accordion as the default", () => {
    render(<MegaMenu collapseBelow="always" menuGroups={groups} />, { wrapper: wrap });
    expect(screen.queryByRole("button", { name: "Back from Product" })).toBeNull();
    expect(screen.queryByText("Product")).not.toBeNull();
  });
});
