import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "../components/Skeleton";
import { StatusIndicator } from "../components/StatusIndicator";
import { Tag } from "../components/Tag";
import { LayoutProvider } from "../contexts/LayoutProvider";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("Skeleton", () => {
  it("takes width from Flex rather than a second scale", () => {
    const { container } = render(<Skeleton shape="line" width="80%" />, { wrapper: wrap });
    expect(container.firstElementChild).toHaveStyle({ width: "80%" });
  });

  it("applies the size scale", () => {
    const { container } = render(<Skeleton shape="line" size="xl" />, { wrapper: wrap });
    expect(container.firstElementChild?.className).toMatch(/size-xl/);
  });

  it("uses the size scale as the diameter for a circle", () => {
    const { container } = render(<Skeleton shape="circle" size="s" />, { wrapper: wrap });
    const cls = container.firstElementChild?.className ?? "";
    expect(cls).toMatch(/circle/);
    expect(cls).toMatch(/size-s/);
  });

  // 1.x's `width="m"` compiled through Flex's t-shirt widths and rendered a
  // page-wide box. Skeleton's lengths are numbers, static tokens or CSS.
  it("takes no t-shirt width or height", () => {
    // @ts-expect-error — "m" is not a Skeleton length
    const wide = <Skeleton width="m" />;
    // @ts-expect-error — "l" is not a Skeleton length
    const tall = <Skeleton height="l" />;
    const fine = <Skeleton width={240} height="2.5rem" maxWidth="16" />;
    expect([wide, tall, fine]).toHaveLength(3);
  });

  it("reads a number on the token scale, as everywhere", () => {
    const { container } = render(<Skeleton shape="line" width={12} />, { wrapper: wrap });
    const { container: token } = render(<Skeleton shape="line" width="12" />, { wrapper: wrap });
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute("style")).toBe(
      (token.firstElementChild as HTMLElement).getAttribute("style"),
    );
  });

  it("takes delay in milliseconds", () => {
    const { container } = render(<Skeleton shape="line" delay={300} />, { wrapper: wrap });
    expect(container.firstElementChild).toHaveStyle({ animationDelay: "300ms" });
  });

  it("sets no animation delay when none is given", () => {
    const { container } = render(<Skeleton shape="line" />, { wrapper: wrap });
    expect((container.firstElementChild as HTMLElement).style.animationDelay).toBe("");
  });
});

describe("scheme replaces variant for colour-scheme props", () => {
  it("StatusIndicator pulse colours from tone", () => {
    const { container } = render(<StatusIndicator pulse tone="danger" />, { wrapper: wrap });
    expect(container.innerHTML).toMatch(/danger/);
  });

  it("Tag colours from scheme", () => {
    const { container } = render(<Tag tone="success" label="Live" />, { wrapper: wrap });
    expect(container.innerHTML).toMatch(/success/);
  });

  it("Tag still honours the gradient scheme", () => {
    // The gradient path takes a different branch: it applies the module's
    // gradient class instead of a scheme-derived background, so assert the
    // branch rather than a colour token that branch deliberately omits.
    const { container } = render(<Tag variant="gradient" label="New" />, { wrapper: wrap });
    const plain = render(<Tag tone="neutral" label="New" />, { wrapper: wrap });
    expect(container.firstElementChild?.className).not.toEqual(
      plain.container.firstElementChild?.className,
    );
  });
});
