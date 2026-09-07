import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Pulse, Skeleton, Tag } from "../components";
import { LayoutProvider } from "../contexts";

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
  it("Pulse colours from scheme", () => {
    const { container } = render(<Pulse scheme="danger" />, { wrapper: wrap });
    expect(container.innerHTML).toMatch(/danger/);
  });

  it("Tag colours from scheme", () => {
    const { container } = render(<Tag scheme="success" label="Live" />, { wrapper: wrap });
    expect(container.innerHTML).toMatch(/success/);
  });

  it("Tag still honours the gradient scheme", () => {
    // The gradient path takes a different branch: it applies the module's
    // gradient class instead of a scheme-derived background, so assert the
    // branch rather than a colour token that branch deliberately omits.
    const { container } = render(<Tag scheme="gradient" label="New" />, { wrapper: wrap });
    const plain = render(<Tag scheme="neutral" label="New" />, { wrapper: wrap });
    expect(container.firstElementChild?.className).not.toEqual(
      plain.container.firstElementChild?.className,
    );
  });
});
