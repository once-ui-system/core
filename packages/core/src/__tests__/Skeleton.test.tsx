import { render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Skeleton, skeletonVariants } from "../components/Skeleton";

describe("Skeleton", () => {
  it("renders default skeleton (shape='line', width='m', height='m')", () => {
    const { container } = render(<Skeleton />);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toBeInTheDocument();
    expect(root).toHaveClass(
      "animate-skeleton",
      "inline-flex",
      "rounded-full",
      "w-1/2",
      "h-16",
      "min-h-16",
    );
  });

  it("forwards ref to the element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Skeleton ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("renders line shape with various widths", () => {
    const { container: cXs } = render(<Skeleton shape="line" width="xs" />);
    expect(cXs.firstElementChild).toHaveClass("w-[25%]");

    const { container: cS } = render(<Skeleton shape="line" width="s" />);
    expect(cS.firstElementChild).toHaveClass("w-[33%]");

    const { container: cM } = render(<Skeleton shape="line" width="m" />);
    expect(cM.firstElementChild).toHaveClass("w-1/2");

    const { container: cL } = render(<Skeleton shape="line" width="l" />);
    expect(cL.firstElementChild).toHaveClass("w-[75%]");

    const { container: cXl } = render(<Skeleton shape="line" width="xl" />);
    expect(cXl.firstElementChild).toHaveClass("w-full");
  });

  it("renders line shape with various heights", () => {
    const { container: cXs } = render(<Skeleton shape="line" height="xs" />);
    expect(cXs.firstElementChild).toHaveClass("h-8", "min-h-8");

    const { container: cS } = render(<Skeleton shape="line" height="s" />);
    expect(cS.firstElementChild).toHaveClass("h-12", "min-h-12");

    const { container: cM } = render(<Skeleton shape="line" height="m" />);
    expect(cM.firstElementChild).toHaveClass("h-16", "min-h-16");

    const { container: cL } = render(<Skeleton shape="line" height="l" />);
    expect(cL.firstElementChild).toHaveClass("h-20", "min-h-20");

    const { container: cXl } = render(<Skeleton shape="line" height="xl" />);
    expect(cXl.firstElementChild).toHaveClass("h-24", "min-h-24");
  });

  it("renders circle shape with various sizes", () => {
    const { container: cXs } = render(<Skeleton shape="circle" width="xs" />);
    expect(cXs.firstElementChild).toHaveClass(
      "rounded-full",
      "w-20",
      "min-w-20",
      "h-20",
      "min-h-20",
    );

    const { container: cS } = render(<Skeleton shape="circle" width="s" />);
    expect(cS.firstElementChild).toHaveClass(
      "rounded-full",
      "w-24",
      "min-w-24",
      "h-24",
      "min-h-24",
    );

    const { container: cM } = render(<Skeleton shape="circle" width="m" />);
    expect(cM.firstElementChild).toHaveClass(
      "rounded-full",
      "w-32",
      "min-w-32",
      "h-32",
      "min-h-32",
    );

    const { container: cL } = render(<Skeleton shape="circle" width="l" />);
    expect(cL.firstElementChild).toHaveClass(
      "rounded-full",
      "w-40",
      "min-w-40",
      "h-40",
      "min-h-40",
    );

    const { container: cXl } = render(<Skeleton shape="circle" width="xl" />);
    expect(cXl.firstElementChild).toHaveClass(
      "rounded-full",
      "w-160",
      "min-w-160",
      "h-160",
      "min-h-160",
    );
  });

  it("resolves circle size when only height is specified", () => {
    const { container } = render(<Skeleton shape="circle" height="l" />);
    expect(container.firstElementChild).toHaveClass("w-40", "min-w-40", "h-40", "min-h-40");
  });

  it("renders block shape correctly", () => {
    const { container } = render(<Skeleton shape="block" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("w-full", "h-full");
  });

  it("applies custom radius to block shape", () => {
    const { container } = render(<Skeleton shape="block" radius="m" />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("rounded-m");
  });

  it("applies animation delay variants", () => {
    const { container: d1 } = render(<Skeleton delay="1" />);
    expect(d1.firstElementChild).toHaveClass("[animation-delay:0.1s]");

    const { container: d2 } = render(<Skeleton delay="2" />);
    expect(d2.firstElementChild).toHaveClass("[animation-delay:0.2s]");

    const { container: d3 } = render(<Skeleton delay="3" />);
    expect(d3.firstElementChild).toHaveClass("[animation-delay:0.3s]");

    const { container: d4 } = render(<Skeleton delay="4" />);
    expect(d4.firstElementChild).toHaveClass("[animation-delay:0.4s]");

    const { container: d5 } = render(<Skeleton delay="5" />);
    expect(d5.firstElementChild).toHaveClass("[animation-delay:0.5s]");

    const { container: d6 } = render(<Skeleton delay="6" />);
    expect(d6.firstElementChild).toHaveClass("[animation-delay:0.6s]");
  });

  it("merges custom className and style", () => {
    const { container } = render(<Skeleton className="custom-skeleton" style={{ opacity: 0.8 }} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("custom-skeleton");
    expect(root.style.opacity).toBe("0.8");
  });

  it("passes through accessibility attributes", () => {
    const { container } = render(
      <Skeleton aria-busy="true" aria-label="Loading content" role="status" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("aria-busy", "true");
    expect(root).toHaveAttribute("aria-label", "Loading content");
    expect(root).toHaveAttribute("role", "status");
  });

  it("exports skeletonVariants for composability", () => {
    expect(skeletonVariants({ shape: "line", width: "xs", height: "xs" })).toContain("w-[25%]");
    expect(skeletonVariants({ shape: "line", width: "xs", height: "xs" })).toContain("h-8 min-h-8");
    expect(skeletonVariants({ shape: "circle", width: "l" })).toContain(
      "w-40 min-w-40 h-40 min-h-40",
    );
    expect(skeletonVariants({ shape: "block" })).toContain("w-full h-full");
    expect(skeletonVariants({ delay: "3" })).toContain("[animation-delay:0.3s]");
  });
});
