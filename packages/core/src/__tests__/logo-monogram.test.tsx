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
    // Named by its visible text, not a label: axe 4.14 counts the aria-hidden
    // monogram as visible text a label would have to contain.
    expect(screen.getByRole("link")).not.toHaveAttribute("aria-label");
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
    expect(screen.getByText("Acme").parentElement?.style.marginLeft).toBe("");
    // The name's slot and the name: no mark.
    expect(container.querySelectorAll("span")).toHaveLength(2);
  });

  it("spaces the text from the mark like an icon", () => {
    render(<Logo text="Acme" monogram />, { wrapper });
    expect(screen.getByText("Acme").parentElement?.style.marginLeft).toBe("0.25em");
  });
});

describe("Logo tone", () => {
  it("draws the monogram on a tile in the tone", () => {
    const { container } = render(<Logo text="Acme" monogram="A" tone="brand" />, { wrapper });
    const mark = container.querySelector('[data-monogram="letters"]') as HTMLElement;
    expect(mark.style.background).toBe("var(--brand-solid-strong)");
    expect(mark.style.color).toBe("var(--brand-on-solid-strong)");
  });

  it("keeps the bare mark in the text colour without a tone", () => {
    const { container } = render(<Logo text="Acme" monogram />, { wrapper });
    const mark = container.querySelector('[data-monogram="shape"]') as HTMLElement;
    expect(mark.style.background).toBe("");
    expect(mark.style.color).toBe("var(--neutral-on-background-strong)");
  });

  it("draws a symbol from the icon set as the mark, on the tile", () => {
    const { container } = render(<Logo text="Pawly" symbol="paw" tone="brand" />, { wrapper });
    const mark = container.querySelector('[data-monogram="symbol"]') as HTMLElement;
    expect(mark.style.background).toBe("var(--brand-solid-strong)");
    expect(mark.getAttribute("aria-hidden")).toBe("true");
    expect(mark.querySelector("svg")).not.toBeNull();
    expect(container.querySelector('[data-monogram="letters"]')).toBeNull();
  });

  it("lets a real icon win over the symbol", () => {
    const { container } = render(<Logo text="Pawly" symbol="paw" icon="/logo.svg" />, { wrapper });
    expect(container.querySelector("[data-monogram]")).toBeNull();
  });
});
