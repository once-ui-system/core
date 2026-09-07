import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Book } from "../components";
import { LayoutProvider } from "../contexts";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("Book", () => {
  it("renders the cover art with an accessible name", () => {
    render(<Book src="/cover.jpg" alt="Cover of The Quiet Craft" />, { wrapper: wrap });
    expect(screen.getByRole("img", { name: "Cover of The Quiet Craft" })).toBeInTheDocument();
  });

  it("falls back to a generic cover label", () => {
    render(<Book src="/cover.jpg" />, { wrapper: wrap });
    expect(screen.getByRole("img", { name: "Book cover" })).toBeInTheDocument();
  });

  it("renders as a link when href is given", () => {
    render(<Book src="/c.jpg" href="/journal/quiet-craft" />, { wrapper: wrap });
    expect(screen.getByRole("link")).toHaveAttribute("href", "/journal/quiet-craft");
  });

  it("is not a link without href", () => {
    render(<Book src="/c.jpg" />, { wrapper: wrap });
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("renders overlay children above the cover", () => {
    render(<Book src="/c.jpg">The Quiet Craft</Book>, { wrapper: wrap });
    expect(screen.getByText("The Quiet Craft")).toBeInTheDocument();
  });

  it("renders a blank cover when no source is given", () => {
    render(<Book />, { wrapper: wrap });
    expect(screen.queryByRole("img")).toBeNull();
  });
});
