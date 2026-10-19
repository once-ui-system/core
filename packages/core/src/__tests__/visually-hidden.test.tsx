import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type React from "react";
import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SmartLink } from "../components/SmartLink";
import { VisuallyHidden } from "../components/VisuallyHidden";
import styles from "../components/VisuallyHidden.module.scss";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const SOURCE = join(__dirname, "..", "components");

/**
 * Studio carried its own `.srOnly` class for this, and ShowcaseMasonry an
 * inline style object: both the clip pattern, written out by hand. jsdom
 * computes no layout, so the visual half is pinned by reading the stylesheet
 * and the accessible half by querying the tree.
 */
describe("VisuallyHidden", () => {
  it("keeps its content in the accessibility tree", () => {
    render(
      <button type="button">
        <span aria-hidden="true">×</span>
        <VisuallyHidden>Close panel</VisuallyHidden>
      </button>,
      { wrapper: wrap },
    );
    expect(screen.getByRole("button", { name: "Close panel" })).toBeInTheDocument();
  });

  it("renders a span by default and the element `as` names", () => {
    const { container, rerender } = render(<VisuallyHidden>Text</VisuallyHidden>);
    expect(container.firstElementChild?.tagName).toBe("SPAN");
    rerender(<VisuallyHidden as="div">Text</VisuallyHidden>);
    expect(container.firstElementChild?.tagName).toBe("DIV");
  });

  it("applies the hiding class, and the reveal class only when focusable", () => {
    const { container, rerender } = render(<VisuallyHidden>Text</VisuallyHidden>);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveClass(styles.hidden);
    expect(el).not.toHaveClass(styles.focusable);
    rerender(<VisuallyHidden focusable>Text</VisuallyHidden>);
    expect(container.firstElementChild).toHaveClass(styles.hidden, styles.focusable);
  });

  it("merges a className and passes attributes through", () => {
    render(
      <VisuallyHidden className="extra" role="status" aria-live="polite">
        Saved
      </VisuallyHidden>,
    );
    const status = screen.getByRole("status");
    expect(status).toHaveClass("extra", styles.hidden);
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("Saved");
  });

  it("forwards its ref", () => {
    const ref = createRef<HTMLElement>();
    render(<VisuallyHidden ref={ref}>Text</VisuallyHidden>);
    expect(ref.current?.tagName).toBe("SPAN");
  });

  it("lets a skip link inside it take focus from the keyboard", async () => {
    const user = userEvent.setup();
    render(
      <>
        <VisuallyHidden focusable>
          <SmartLink href="#main">Skip to content</SmartLink>
        </VisuallyHidden>
        <main id="main">Content</main>
      </>,
      { wrapper: wrap },
    );
    await user.tab();
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveFocus();
  });

  it('renders the skip link itself with as="a" and an href', async () => {
    const user = userEvent.setup();
    render(
      <VisuallyHidden as="a" href="#main" focusable>
        Skip to content
      </VisuallyHidden>,
      { wrapper: wrap },
    );
    await user.tab();
    const link = screen.getByRole("link", { name: "Skip to content" });
    expect(link).toHaveAttribute("href", "#main");
    expect(link).toHaveFocus();
  });

  it("renders on the server: no hooks, no client directive", () => {
    const source = readFileSync(join(SOURCE, "VisuallyHidden.tsx"), "utf8");
    expect(source.startsWith('"use client"')).toBe(false);
    expect(renderToString(<VisuallyHidden>Server text</VisuallyHidden>)).toContain("Server text");
  });

  it("hides with the clip pattern and reveals on focus and focus-within", () => {
    const scss = readFileSync(join(SOURCE, "VisuallyHidden.module.scss"), "utf8").replace(
      /\/\*[\s\S]*?\*\//g,
      "",
    );
    expect(scss).toMatch(/\.hidden\s*\{[^}]*position:\s*absolute/);
    expect(scss).toMatch(/\.hidden\s*\{[^}]*clip-path:\s*inset\(50%\)/);
    expect(scss).not.toMatch(/display:\s*none|visibility:\s*hidden/);
    expect(scss).toMatch(
      /\.focusable:focus,\s*\.focusable:focus-within\s*\{[^}]*clip-path:\s*none/,
    );
  });

  it("has no axe violations as a control's label or as a skip link", async () => {
    const { container } = render(
      <>
        <VisuallyHidden focusable>
          <SmartLink href="#main">Skip to content</SmartLink>
        </VisuallyHidden>
        <button type="button">
          <span aria-hidden="true">⌘</span>
          <VisuallyHidden>Command palette</VisuallyHidden>
        </button>
        <VisuallyHidden as="div" role="status">
          3 results
        </VisuallyHidden>
      </>,
      { wrapper: wrap },
    );
    await expectNoAxeViolations(container);
  });
});
