import { render, screen } from "@testing-library/react";
import type React from "react";
import { describe, expect, it } from "vitest";
import { Logo } from "../components/Logo";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { ToastProvider } from "../contexts/ToastProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>
    <ToastProvider>{children}</ToastProvider>
  </LayoutProvider>
);

/**
 * `monogram` gives a brand with no designed icon a mark drawn from theme
 * tokens, so nobody hand-draws a placeholder SVG.
 */
describe("Logo monogram", () => {
  it("shows the first letter of the text, upper-cased, in a tile at the logo's height", async () => {
    const { container } = render(<Logo text="acme" monogram href="/" size="l" />, { wrapper });
    const tile = screen.getByText("A");
    expect(tile).toHaveAttribute("aria-hidden", "true");
    expect(tile).toHaveClass("font-heading");
    expect(tile.style.width).toBe("var(--static-space-40)");
    expect(tile.style.height).toBe("var(--static-space-40)");
    expect(tile.style.backgroundColor).toBe("var(--brand-color-strong)");
    expect(tile.style.color).toBe("var(--static-white)");
    expect(tile.style.borderRadius).toContain("var(--radius-m)");
    // The text names the link; the tile adds nothing to the name.
    expect(screen.getByRole("link")).toHaveAccessibleName("acme");
    await expectNoAxeViolations(container);
  });

  it("takes one letter from a multi-word name, skipping leading punctuation", () => {
    render(<Logo text="  @holo zone" monogram />, { wrapper });
    expect(screen.getByText("H")).toHaveAttribute("aria-hidden", "true");
  });

  it("uses a string as the letters, as written", () => {
    render(<Logo text="Housing Market" monogram="Hm" />, { wrapper });
    expect(screen.getByText("Hm")).toHaveAttribute("aria-hidden", "true");
  });

  it("is a named image when there is no text beside it", () => {
    render(<Logo monogram="A" />, { wrapper });
    // Queried by text: jsdom cannot compute the tile's calc() font size, which
    // a role query asks it to.
    const tile = screen.getByText("A");
    expect(tile).toHaveAttribute("role", "img");
    expect(tile).toHaveAttribute("aria-label", "Trademark");
    expect(tile).not.toHaveAttribute("aria-hidden");
  });

  it("gives way to an icon", () => {
    const { container } = render(<Logo icon="/mark.svg" text="Acme" monogram />, { wrapper });
    expect(screen.queryByText("A")).toBeNull();
    expect(container.querySelectorAll("img")).toHaveLength(1);
    expect(container.querySelector("[aria-hidden]")).toBeNull();
  });

  it("changes nothing when not set", () => {
    const { container } = render(<Logo text="Acme" />, { wrapper });
    expect(screen.getByText("Acme").style.marginLeft).toBe("");
    expect(container.querySelectorAll("span")).toHaveLength(1);
  });

  it("spaces the text from the tile like an icon", () => {
    render(<Logo text="Acme" monogram />, { wrapper });
    expect(screen.getByText("Acme").style.marginLeft).toBe("calc(var(--static-space-32) / 4)");
  });
});
