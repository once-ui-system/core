import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { BlockQuote } from "../components/BlockQuote";

describe("BlockQuote", () => {
  it("renders children in blockquote with default both separators", () => {
    const { container } = render(<BlockQuote>The quote content</BlockQuote>);
    expect(screen.getByText("The quote content")).toBeInTheDocument();

    const blockquote = container.querySelector("blockquote");
    expect(blockquote).toBeInTheDocument();

    // Default separator="both" renders 2 Line separators + 1 blockquote
    expect(container.firstElementChild?.children.length).toBe(3);
  });

  it("renders separator variants (top, bottom, none)", () => {
    const { container, rerender } = render(<BlockQuote separator="top">Top only quote</BlockQuote>);
    expect(container.firstElementChild?.children.length).toBe(2);

    rerender(<BlockQuote separator="bottom">Bottom only quote</BlockQuote>);
    expect(container.firstElementChild?.children.length).toBe(2);

    rerender(<BlockQuote separator="none">No separator quote</BlockQuote>);
    expect(container.firstElementChild?.children.length).toBe(1);
  });

  it("renders preline and subline when provided", () => {
    render(
      <BlockQuote preline="Inspirational thought" subline="End of thought">
        Quote body
      </BlockQuote>,
    );
    expect(screen.getByText("Inspirational thought")).toBeInTheDocument();
    expect(screen.getByText("Quote body")).toBeInTheDocument();
    expect(screen.getByText("End of thought")).toBeInTheDocument();
  });

  it("renders author name and avatar", () => {
    const { container } = render(
      <BlockQuote
        author={{
          name: "Ada Lovelace",
          avatar: "https://example.com/ada.jpg",
        }}
      >
        Quote by Ada
      </BlockQuote>,
    );
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img?.getAttribute("src")).toContain("ada.jpg");
  });

  it("renders cite link with smart url formatting", () => {
    const { rerender } = render(
      <BlockQuote
        link={{
          href: "example.com/paper",
          label: "Source Paper",
        }}
      >
        Quote with cite
      </BlockQuote>,
    );
    const link = screen.getByRole("link", { name: /Source Paper/i });
    expect(link).toHaveAttribute("href", "https://example.com/paper");

    rerender(
      <BlockQuote
        link={{
          href: "https://secure.example.com",
        }}
      >
        Quote with secure cite
      </BlockQuote>,
    );
    const secureLink = screen.getByRole("link", { name: /https:\/\/secure\.example\.com/i });
    expect(secureLink).toHaveAttribute("href", "https://secure.example.com");
  });

  it("supports alignment props (left, center, right)", () => {
    const { container, rerender } = render(
      <BlockQuote align="left">Left Aligned Quote</BlockQuote>,
    );
    const leftBlockquote = container.querySelector("blockquote");
    expect(leftBlockquote).toHaveClass("text-left");

    rerender(<BlockQuote align="right">Right Aligned Quote</BlockQuote>);
    const rightBlockquote = container.querySelector("blockquote");
    expect(rightBlockquote).toHaveClass("text-right");

    rerender(<BlockQuote align="center">Center Aligned Quote</BlockQuote>);
    const centerBlockquote = container.querySelector("blockquote");
    expect(centerBlockquote).toHaveClass("text-center");
  });

  it("forwards ref to the blockquote element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<BlockQuote ref={ref}>Ref Quote</BlockQuote>);
    expect(ref.current?.tagName).toBe("BLOCKQUOTE");
  });

  it("merges custom className and style", () => {
    const { container } = render(
      <BlockQuote className="custom-quote-class" style={{ opacity: 0.9 }}>
        Styled Quote
      </BlockQuote>,
    );
    const blockquote = container.querySelector("blockquote");
    expect(blockquote).toHaveClass("custom-quote-class");
    expect(blockquote?.style.opacity).toBe("0.9");
  });
});
