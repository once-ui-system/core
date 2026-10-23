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

const markOf = (container: HTMLElement) =>
  container.querySelector("[data-monogram]") as HTMLElement | null;

/**
 * `monogram` gives a brand with no designed icon a favicon-style mark: a bare
 * shape in the neutral text colour, so nobody hand-draws a placeholder SVG.
 */
describe("Logo monogram", () => {
  it("draws a bare shape at the icon's height in the neutral text colour", async () => {
    const { container } = render(<Logo text="Acme" monogram href="/" size="l" />, { wrapper });
    const mark = markOf(container) as HTMLElement;
    expect(mark).toHaveAttribute("data-monogram", "shape");
    expect(mark).toHaveAttribute("aria-hidden", "true");
    expect(mark.style.height).toBe("var(--static-space-40)");
    expect(mark.style.color).toBe("var(--neutral-on-background-strong)");
    // No tile: nothing behind or around the shape.
    expect(mark.style.background).toBe("");
    expect(mark.style.backgroundColor).toBe("");
    expect(mark.style.borderRadius).toBe("");
    expect(mark.style.boxShadow).toBe("");
    const path = mark.querySelector("svg path");
    expect(path).not.toBeNull();
    expect(mark.querySelector("svg")).toHaveAttribute("fill", "currentColor");
    expect(screen.getByRole("link")).toHaveAccessibleName("Acme");
    await expectNoAxeViolations(container);
  });

  it("gives a name the same shape every time, and different names can differ", () => {
    const d = (text: string) => {
      const { container, unmount } = render(<Logo text={text} monogram />, { wrapper });
      const value = markOf(container)?.querySelector("path")?.getAttribute("d");
      unmount();
      return value;
    };
    expect(d("Acme")).toBe(d("  acme "));
    const shapes = new Set(
      ["Acme", "Holo Zone", "Housing Market", "Once UI", "Xeso", "Nimbus"].map(d),
    );
    expect(shapes.size).toBeGreaterThan(1);
  });

  it("draws a string as a heavy glyph in the heading font", () => {
    const { container } = render(<Logo text="Housing Market" monogram="Hm" />, { wrapper });
    const mark = screen.getByText("Hm");
    expect(mark).toBe(markOf(container));
    expect(mark).toHaveAttribute("data-monogram", "letters");
    expect(mark).toHaveAttribute("aria-hidden", "true");
    expect(mark).toHaveClass("font-heading");
    expect(mark.style.color).toBe("var(--neutral-on-background-strong)");
    expect(mark.style.backgroundColor).toBe("");
  });

  it("is a named image when there is no text beside it", () => {
    const { container } = render(<Logo monogram />, { wrapper });
    // Queried by attribute: jsdom cannot compute the calc() sizes a role
    // query asks it for.
    const mark = markOf(container) as HTMLElement;
    expect(mark).toHaveAttribute("role", "img");
    expect(mark).toHaveAttribute("aria-label", "Trademark");
    expect(mark).not.toHaveAttribute("aria-hidden");
  });

  it("gives way to an icon", () => {
    const { container } = render(<Logo icon="/mark.svg" text="Acme" monogram="A" />, { wrapper });
    expect(markOf(container)).toBeNull();
    expect(screen.queryByText("A")).toBeNull();
    expect(container.querySelectorAll("img")).toHaveLength(1);
  });

  it("changes nothing when not set", () => {
    const { container } = render(<Logo text="Acme" />, { wrapper });
    expect(markOf(container)).toBeNull();
    expect(screen.getByText("Acme").style.marginLeft).toBe("");
    expect(container.querySelectorAll("span")).toHaveLength(1);
  });

  it("spaces the text from the mark like an icon", () => {
    render(<Logo text="Acme" monogram />, { wrapper });
    expect(screen.getByText("Acme").style.marginLeft).toBe("calc(var(--static-space-32) / 4)");
  });
});
