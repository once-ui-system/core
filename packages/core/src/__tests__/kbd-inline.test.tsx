import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Kbd } from "../components/Kbd";
import { LayoutProvider } from "../contexts";

/**
 * A <kbd> is part of a sentence. Kbd renders a Flex, which is display: flex,
 * so without `inline` every key in prose broke the line and filled the column
 * — visible on the Scrubber page, where four of them stacked as full-width
 * bars between the words that described them.
 */
const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("Kbd", () => {
  it("sits in a line of text", () => {
    const { container } = render(<Kbd>Esc</Kbd>, { wrapper: wrap });
    const el = container.querySelector("kbd") as HTMLElement;
    expect(el.className).toContain("display-inline-flex");
    expect(el.className).not.toContain("display-flex");
  });

  it("hugs its label rather than filling the line", () => {
    const { container } = render(<Kbd>Esc</Kbd>, { wrapper: wrap });
    const el = container.querySelector("kbd") as HTMLElement;
    expect(el.className).toMatch(/\bfit\b/);
  });

  it("can still be overridden", () => {
    const { container } = render(<Kbd inline={false}>Esc</Kbd>, { wrapper: wrap });
    expect((container.querySelector("kbd") as HTMLElement).className).toContain("display-flex");
  });
});
