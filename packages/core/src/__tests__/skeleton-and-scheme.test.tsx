import { render } from "@testing-library/react";
import { describe, expect, expectTypeOf, it } from "vitest";
import { Flex } from "../components/Flex";
import { Skeleton } from "../components/Skeleton";
import { StatusIndicator } from "../components/StatusIndicator";
import { Tag } from "../components/Tag";
import { LayoutProvider } from "../contexts/LayoutProvider";
import type { SizeProps } from "../interfaces";

const wrap = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

describe("Skeleton", () => {
  it("takes width from Flex rather than a second scale", () => {
    const { container } = render(<Skeleton shape="line" width="80%" />, { wrapper: wrap });
    expect(container.firstElementChild).toHaveStyle({ width: "80%" });
  });

  // The shape's default radius used to be set after the caller's props, so a
  // `block` dropped any radius it was given.
  it("keeps a radius the caller passes", () => {
    const { container } = render(<Skeleton shape="block" radius="l" />, { wrapper: wrap });
    expect(container.firstElementChild?.className).toMatch(/radius-l\b/);
  });

  it("rounds a line fully unless told otherwise", () => {
    const { container: line } = render(<Skeleton shape="line" />, { wrapper: wrap });
    expect(line.firstElementChild?.className).toMatch(/radius-full/);
    const { container: square } = render(<Skeleton shape="line" radius="s" />, { wrapper: wrap });
    expect(square.firstElementChild?.className).toMatch(/radius-s\b/);
  });

  // Models write `shape="block"` without a radius and got square corners.
  it("rounds a block by default", () => {
    const { container } = render(<Skeleton shape="block" />, { wrapper: wrap });
    expect(container.firstElementChild?.className).toMatch(/radius-l\b/);
    const { container: square } = render(<Skeleton shape="block" radius="xs" />, { wrapper: wrap });
    expect(square.firstElementChild?.className).toMatch(/radius-xs\b/);
  });

  // Two generating skeletons side by side used to light up in step.
  it("starts each generating skeleton's fields at its own point", () => {
    const { container } = render(
      <>
        <Skeleton shape="block" effect="generating" />
        <Skeleton shape="block" effect="generating" />
      </>,
      { wrapper: wrap },
    );
    const delays = [...container.querySelectorAll<HTMLElement>("[aria-hidden] > span")].map(
      (field) => field.style.animationDelay,
    );
    expect(delays).toHaveLength(6);
    expect(delays.every((delay) => delay.startsWith("-"))).toBe(true);
    expect(new Set(delays.slice(0, 3)).size).toBe(3);
    expect(delays.slice(0, 3)).not.toEqual(delays.slice(3));
  });

  it("pulses by default and is not busy", () => {
    const { container } = render(<Skeleton shape="block" />, { wrapper: wrap });
    expect(container.firstElementChild?.className).not.toMatch(/generating/);
    expect(container.firstElementChild).not.toHaveAttribute("aria-busy");
  });

  it('effect="generating" draws the mist, says it is busy and keeps its children', () => {
    const { container, getByText } = render(
      <Skeleton shape="block" effect="generating" aria-label="Painting logos">
        Painting logos…
      </Skeleton>,
      { wrapper: wrap },
    );
    const el = container.firstElementChild;
    expect(el?.className).toMatch(/generating/);
    expect(el).toHaveAttribute("aria-busy", "true");
    expect(el).toHaveAttribute("role", "status");
    expect(getByText("Painting logos…")).toBeInTheDocument();
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

  // minWidth/maxWidth keep Flex's container sizes: `<Skeleton maxWidth="l">`
  // caps a placeholder at the content column, as 2.x apps write it.
  it("takes Flex's container sizes on minWidth and maxWidth", () => {
    const capped = <Skeleton maxWidth="l" />;
    const floored = <Skeleton minWidth="xs" />;
    // @ts-expect-error — width stays strict: "m" is not a Skeleton length
    const wide = <Skeleton width="m" />;
    expect([capped, floored, wide]).toHaveLength(3);
    type SkeletonProps = React.ComponentProps<typeof Skeleton>;
    expectTypeOf<SkeletonProps["maxWidth"]>().toEqualTypeOf<SizeProps["maxWidth"]>();
    expectTypeOf<SkeletonProps["minWidth"]>().toEqualTypeOf<SizeProps["minWidth"]>();
  });

  it('renders maxWidth="l" as Flex does', () => {
    const { container } = render(<Skeleton shape="line" maxWidth="l" />, { wrapper: wrap });
    const { container: flex } = render(<Flex maxWidth="l" />, { wrapper: wrap });
    const el = container.firstElementChild as HTMLElement;
    const ref = flex.firstElementChild as HTMLElement;
    expect(ref.classList.contains("max-width-l")).toBe(true);
    expect(el.classList.contains("max-width-l")).toBe(true);
    expect(el.style.maxWidth).toBe(ref.style.maxWidth);
  });

  it('renders minWidth="m" as Flex does', () => {
    const { container } = render(<Skeleton shape="line" minWidth="m" />, { wrapper: wrap });
    const { container: flex } = render(<Flex minWidth="m" />, { wrapper: wrap });
    const el = container.firstElementChild as HTMLElement;
    const ref = flex.firstElementChild as HTMLElement;
    expect(ref.style.minWidth).toBe("var(--responsive-width-m)");
    expect(el.style.minWidth).toBe(ref.style.minWidth);
    const layout = (c: HTMLElement) =>
      [...c.classList].filter((name) => /^min-width/.test(name)).sort();
    expect(layout(el)).toEqual(layout(ref));
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
