import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import type React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BlockQuote } from "../components/BlockQuote";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";

/**
 * BlockQuote set its children in a `<span>` (Text's default element), so a
 * quote made of paragraphs was `<p>` inside a span, which is invalid HTML; the
 * MDX map rendered its paragraphs as block spans to get around it. The quote
 * is set in a `<div>` now, with the same text classes and the same layout:
 * as a flex item, the span was a block box already.
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("BlockQuote", () => {
  it("sets its children in a block element that can hold paragraphs", () => {
    const { container } = render(
      <BlockQuote>
        <p>Ship small.</p>
        <p>Ship often.</p>
      </BlockQuote>,
      { wrapper },
    );
    const quote = container.querySelector("blockquote") as HTMLElement;
    const first = screen.getByText("Ship small.");
    expect(first.tagName).toBe("P");
    expect(quote).toContainElement(first);

    const content = first.parentElement as HTMLElement;
    expect(content.tagName).toBe("DIV");
    expect(content).toContainElement(screen.getByText("Ship often."));
    expect(container.querySelector("span p")).toBeNull();
  });

  it("keeps the quote's text style", () => {
    render(<BlockQuote>Ship small.</BlockQuote>, { wrapper });
    const content = screen.getByText("Ship small.");
    expect(content.tagName).toBe("DIV");
    expect(content).toHaveClass("font-heading", "font-strong", "font-xl");
    expect(content.style.textWrap).toBe("balance");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <BlockQuote author={{ name: "Lorant" }} link={{ href: "example.com", label: "Source" }}>
        <p>Ship small.</p>
      </BlockQuote>,
      { wrapper },
    );
    await expectNoAxeViolations(container);
  });

  it("renders on the server: no client directive", () => {
    const source = readFileSync(join(__dirname, "..", "components", "BlockQuote.tsx"), "utf8");
    expect(source.startsWith('"use client"')).toBe(false);
    expect(renderToString(<BlockQuote>Server quote</BlockQuote>)).toContain("Server quote");
  });
});
