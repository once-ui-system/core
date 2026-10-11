import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { describe, expect, it, vi } from "vitest";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { MobileMegaMenu } from "../modules/navigation/MobileMegaMenu";
import { expectNoAxeViolations } from "../test/axe";

/**
 * MobileMegaMenu's sections are lists of links. They are drawn with Option,
 * which is a listbox option everywhere else, so they rendered as
 * `<a role="option">` with no listbox around them: invalid, and not links to
 * a screen reader or to getByRole("link").
 */

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

describe("MobileMegaMenu", () => {
  it("renders its section links as links, with no option role", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = render(<MobileMegaMenu menuGroups={groups} onClose={onClose} />, {
      wrapper: wrap,
    });
    await user.click(screen.getByText("Product"));
    await user.click(await screen.findByText("Learn"));

    expect(await screen.findByRole("link", { name: "Pricing" })).toHaveAttribute(
      "href",
      "/#pricing",
    );
    expect(screen.getByRole("link", { name: "Docs" })).toHaveAttribute("href", "/docs");
    expect(container.querySelector('[role="option"]')).toBeNull();
    expect(container.querySelector("[aria-selected]")).toBeNull();
    await expectNoAxeViolations(container);

    await user.click(screen.getByRole("link", { name: "Pricing" }));
    expect(onClose).toHaveBeenCalled();
  });
});
