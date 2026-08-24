import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Badge, badgeVariants } from "../components/Badge";

describe("Badge", () => {
  it("renders default badge with title", () => {
    const { container } = render(<Badge title="New Feature" />);
    expect(screen.getByText("New Feature")).toBeInTheDocument();

    const badge = container.querySelector("#badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass(
      "relative",
      "inline-flex",
      "items-center",
      "px-20",
      "py-12",
      "w-fit",
      "rounded-full",
      "bg-neutral-background-weak",
      "text-brand-on-background-strong",
      "border-brand-alpha-medium",
      "font-label",
      "font-s",
      "font-strong",
    );
  });

  it("renders with children when provided", () => {
    render(<Badge>Custom Children</Badge>);
    expect(screen.getByText("Custom Children")).toBeInTheDocument();
  });

  it("renders with icon", () => {
    const { container } = render(<Badge title="With Icon" icon="check" />);
    const icon = container.querySelector("svg");
    expect(icon).toBeInTheDocument();
    expect(screen.getByText("With Icon")).toBeInTheDocument();
  });

  it("renders with effect animation enabled by default", () => {
    const { container } = render(<Badge title="Effect" />);
    const badge = container.querySelector("#badge");
    expect(badge).toHaveClass(
      "overflow-hidden",
      "before:content-['']",
      "before:opacity-0",
      "before:rounded-full",
      "before:absolute",
      "before:w-full",
      "before:h-full",
      "before:animate-shineDefault",
      "hover:before:animate-shineHover",
    );
  });

  it("disables effect animation when effect is false", () => {
    const { container } = render(<Badge title="No Effect" effect={false} />);
    const badge = container.querySelector("#badge");
    expect(badge).not.toHaveClass("overflow-hidden");
    expect(badge).not.toHaveClass("before:animate-shineDefault");
  });

  it("renders without arrow by default when no href is provided", () => {
    const { container } = render(<Badge title="No Arrow" />);
    // Arrow uses Flex elements with arrowHeadVariants
    expect(container.querySelector("[class*='origin-[right_center]']")).not.toBeInTheDocument();
  });

  it("renders with arrow when arrow is explicitly true", () => {
    const { container } = render(<Badge title="Explicit Arrow" arrow={true} />);
    expect(container.querySelector("[class*='origin-[right_center]']")).toBeInTheDocument();
  });

  it("renders as a link when href is provided", () => {
    const { container } = render(<Badge title="Link Badge" href="https://example.com" />);
    const link = container.querySelector("a");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(screen.getByText("Link Badge")).toBeInTheDocument();
    // Default arrow is true when href is provided
    expect(container.querySelector("[class*='origin-[right_center]']")).toBeInTheDocument();
  });

  it("renders link badge without arrow when arrow is explicitly false", () => {
    const { container } = render(
      <Badge title="Link No Arrow" href="https://example.com" arrow={false} />,
    );
    const link = container.querySelector("a");
    expect(link).toBeInTheDocument();
    expect(container.querySelector("[class*='origin-[right_center]']")).not.toBeInTheDocument();
  });

  it("supports custom id prop", () => {
    const { container } = render(<Badge title="Custom ID" id="custom-badge-id" arrow={true} />);
    const badge = container.querySelector("#custom-badge-id");
    expect(badge).toBeInTheDocument();
  });

  it("forwards ref to div element when href is not provided", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Badge ref={ref} title="Ref Badge" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("forwards ref to anchor element when href is provided", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(<Badge ref={ref} title="Ref Link Badge" href="https://example.com" />);
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });

  it("merges custom className and style", () => {
    const { container } = render(
      <Badge title="Custom Style" className="custom-badge-class" style={{ opacity: 0.85 }} />,
    );
    const badge = container.querySelector("#badge");
    expect(badge).toHaveClass("custom-badge-class");
    expect((badge as HTMLElement).style.opacity).toBe("0.85");
  });

  it("exports badgeVariants function for composability", () => {
    const defaultClasses = badgeVariants();
    expect(defaultClasses).toContain("relative");
    expect(defaultClasses).toContain("inline-flex");
    expect(defaultClasses).toContain("overflow-hidden");
    expect(defaultClasses).toContain("before:animate-shineDefault");

    const noEffectClasses = badgeVariants({ effect: false });
    expect(noEffectClasses).toContain("relative");
    expect(noEffectClasses).toContain("inline-flex");
    expect(noEffectClasses).not.toContain("overflow-hidden");
  });
});
