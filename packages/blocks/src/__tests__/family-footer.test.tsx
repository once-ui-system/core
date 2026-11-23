import {
  DataThemeProvider,
  IconProvider,
  LayoutProvider,
  ThemeProvider,
  ToastProvider,
} from "@once-ui-system/core";
import { render, screen, within } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { FamilyFooter, familyFooterLabelsHu } from "../FamilyFooter.js";
import { familyHref, familyProducts, familySiblings } from "../family.js";
import { expectNoAxeViolations } from "../test/axe.js";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <LayoutProvider>
      <DataThemeProvider>
        <ToastProvider>
          <IconProvider>{children}</IconProvider>
        </ToastProvider>
      </DataThemeProvider>
    </LayoutProvider>
  </ThemeProvider>
);

const family = [
  { id: "fjell", name: "Fjell", line: "Trail maps for the north", href: "https://fjell.example" },
  { id: "ember", name: "Ember", line: "Bookings for small cafés", href: "https://ember.example/" },
  { id: "tide", name: "Tide", line: "Coming soon", href: "https://tide.example", live: false },
];
const parent = {
  name: "Halden & Co",
  href: "https://halden.example",
  legalHref: "https://halden.example/legal",
};

const footer = (props: Partial<React.ComponentProps<typeof FamilyFooter>> = {}) =>
  render(
    <FamilyFooter
      brand={{
        name: "Fjell",
        tagline: "Trail maps for the north",
        action: { label: "Start free", href: "/start" },
      }}
      current="fjell"
      products={family}
      parent={parent}
      year={2026}
      columns={[
        { title: "Product", links: [{ label: "Pricing", href: "/pricing", tag: "New" }] },
        { title: "Company", links: [{ label: "About", href: "/about" }] },
      ]}
      {...props}
    />,
    { wrapper: wrap },
  );

describe("familyHref", () => {
  it("adds ref=<from>-footer", () => {
    expect(familyHref("https://ember.example/", "fjell")).toBe(
      "https://ember.example/?ref=fjell-footer",
    );
  });

  it("keeps a ref the link already has, and the link's own query", () => {
    expect(familyHref("https://a.example/?ref=x&b=1", "fjell")).toBe(
      "https://a.example/?ref=x&b=1",
    );
    expect(familyHref("https://a.example/p?b=1", "fjell")).toBe(
      "https://a.example/p?b=1&ref=fjell-footer",
    );
  });

  it("leaves a relative link, or one with no product named, as it is", () => {
    expect(familyHref("/pricing", "fjell")).toBe("/pricing");
    expect(familyHref("https://a.example")).toBe("https://a.example");
  });
});

describe("familySiblings", () => {
  it("drops the current product and the ones not yet live", () => {
    expect(familySiblings(family, "fjell").map((p) => p.id)).toEqual(["ember"]);
  });

  it("ships the Dopler family with Sigilio held back until it is public", () => {
    const ids = familySiblings(familyProducts).map((p) => p.id);
    expect(ids).toEqual(["once-ui", "stack", "chirio", "aveiro", "frametic", "tavilio"]);
    for (const product of familyProducts) {
      const words = product.line.split(/\s+/).length;
      expect(words, product.name).toBeGreaterThanOrEqual(4);
      expect(words, product.name).toBeLessThanOrEqual(7);
    }
  });
});

describe("FamilyFooter", () => {
  it("is a contentinfo landmark with the brand band, columns, family row and co-brand bar", () => {
    footer();
    const root = screen.getByRole("contentinfo");
    expect(within(root).getByText("Trail maps for the north")).toBeInTheDocument();
    expect(within(root).getByRole("link", { name: /Start free/ })).toHaveAttribute(
      "href",
      "/start",
    );
    expect(within(root).getByRole("navigation", { name: "Footer" })).toBeInTheDocument();
    expect(
      within(root).getByRole("heading", { name: "More from Halden & Co" }),
    ).toBeInTheDocument();
    expect(within(root).getByText("© 2026 Halden & Co")).toBeInTheDocument();
  });

  it("links each live sibling with the ref, and leaves the current product out", () => {
    footer();
    const row = screen.getByRole("list", { name: "Other products" });
    const tiles = within(row).getAllByRole("link");
    expect(tiles).toHaveLength(1);
    expect(tiles[0]).toHaveAttribute("href", "https://ember.example/?ref=fjell-footer");
    expect(tiles[0]).toHaveTextContent("EmberBookings for small cafés");
  });

  it("names the parent in the co-brand bar and links to it", () => {
    footer();
    const by = screen.getByRole("link", { name: /A product by Halden & Co/ });
    expect(by).toHaveAttribute("href", "https://halden.example/?ref=fjell-footer");
  });

  it("links the family's shared legal page from the bar, and leaves it out without one", () => {
    const { unmount } = footer();
    expect(screen.getByRole("link", { name: "Legal" })).toHaveAttribute(
      "href",
      "https://halden.example/legal",
    );
    unmount();
    footer({ parent: { name: "Halden & Co", href: "https://halden.example" } });
    expect(screen.queryByRole("link", { name: "Legal" })).toBeNull();
  });

  it("drops the family row when there is no sibling to show", () => {
    footer({ products: [family[0]] });
    expect(screen.queryByRole("list", { name: "Other products" })).toBeNull();
  });

  it("keeps at most five columns", () => {
    const columns = Array.from({ length: 7 }, (_, i) => ({
      title: `Column ${i + 1}`,
      links: [{ label: `Link ${i + 1}`, href: `/l${i}` }],
    }));
    footer({ columns });
    expect(screen.getByText("Column 5")).toBeInTheDocument();
    expect(screen.queryByText("Column 6")).toBeNull();
  });

  it("credits Once UI except on Once UI's own site, and can drop the theme switch", () => {
    const { unmount } = footer({ themeSwitch: false });
    expect(screen.getByRole("link", { name: "Built with Once UI" })).toHaveAttribute(
      "href",
      "https://once-ui.com/?ref=fjell-footer",
    );
    expect(screen.queryByRole("radiogroup")).toBeNull();
    unmount();
    footer({ current: "once-ui" });
    expect(screen.queryByRole("link", { name: "Built with Once UI" })).toBeNull();
  });

  it("takes Hungarian labels, the parent named inside the phrase", () => {
    render(
      <FamilyFooter
        brand={{ name: "Tavilio" }}
        current="tavilio"
        year={2026}
        labels={familyFooterLabelsHu}
      />,
      { wrapper: wrap },
    );
    expect(screen.getByRole("heading", { name: "A Dopler további termékei" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /A Dopler terméke/ })).toBeInTheDocument();
  });

  it("draws a decoration behind the brand band, hidden from assistive tech", () => {
    footer({ decoration: <span data-testid="glow" /> });
    expect(screen.getByTestId("glow").parentElement).toHaveAttribute("aria-hidden", "true");
  });

  it("has no axe violations", async () => {
    const { container } = footer({
      social: [{ icon: "mail", label: "Email", href: "mailto:hi@fjell.example" }],
    });
    await expectNoAxeViolations(container);
  });
});
