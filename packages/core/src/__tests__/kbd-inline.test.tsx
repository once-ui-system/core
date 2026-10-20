import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Input } from "../components/Input";
import { Kbd } from "../components/Kbd";
import { LayoutProvider } from "../contexts/LayoutProvider";

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

  // "Ctrl K" in an Input's suffix broke onto two lines: the cap stood 38px
  // tall and stretched a 32px xxs field to 40px (measured in Chromium).
  it("stays on one line and keeps its width in a tight row", () => {
    const { container } = render(
      <Input id="search" size="xxs" placeholder="Search" suffix={<Kbd>Ctrl K</Kbd>} />,
      { wrapper: wrap },
    );
    const el = container.querySelector("kbd") as HTMLElement;
    expect(el.style.whiteSpace).toBe("nowrap");
    expect(el.style.flexShrink).toBe("0");
  });

  it("merges a caller's style over its own", () => {
    const { container } = render(<Kbd style={{ whiteSpace: "normal", color: "red" }}>Esc</Kbd>, {
      wrapper: wrap,
    });
    const el = container.querySelector("kbd") as HTMLElement;
    expect(el.style.whiteSpace).toBe("normal");
    expect(el.style.flexShrink).toBe("0");
    expect(el.style.color).toBe("red");
  });

  it("can still be overridden", () => {
    const { container } = render(<Kbd inline={false}>Esc</Kbd>, { wrapper: wrap });
    expect((container.querySelector("kbd") as HTMLElement).className).toContain("display-flex");
  });
});
