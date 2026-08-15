import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Tag, tagVariants } from "../components/Tag";

describe("Tag", () => {
  it("renders default tag with label", () => {
    const { container } = render(<Tag label="Featured" />);
    expect(screen.getByText("Featured")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass(
      "inline-flex",
      "items-center",
      "select-none",
      "whitespace-nowrap",
      "border",
      "border-solid",
      "rounded-s",
      "bg-neutral-background-weak",
      "border-neutral-alpha-medium",
      "text-neutral-on-background-medium",
      "px-8",
      "py-2",
    );
  });

  it("renders with children when label is omitted", () => {
    render(<Tag>Children Content</Tag>);
    expect(screen.getByText("Children Content")).toBeInTheDocument();
  });

  it("renders prefix and suffix icons", () => {
    const { container } = render(
      <Tag label="With Icons" prefixIcon="check" suffixIcon="chevronRight" />,
    );
    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBe(2);
  });

  it("renders all variant styles correctly", () => {
    const variants = [
      {
        variant: "neutral",
        bgClass: "bg-neutral-background-weak",
        textClass: "text-neutral-on-background-medium",
      },
      {
        variant: "brand",
        bgClass: "bg-brand-background-weak",
        textClass: "text-brand-on-background-medium",
      },
      {
        variant: "accent",
        bgClass: "bg-accent-background-weak",
        textClass: "text-accent-on-background-medium",
      },
      {
        variant: "info",
        bgClass: "bg-info-background-weak",
        textClass: "text-info-on-background-medium",
      },
      {
        variant: "danger",
        bgClass: "bg-danger-background-weak",
        textClass: "text-danger-on-background-medium",
      },
      {
        variant: "warning",
        bgClass: "bg-warning-background-weak",
        textClass: "text-warning-on-background-medium",
      },
      {
        variant: "success",
        bgClass: "bg-success-background-weak",
        textClass: "text-success-on-background-medium",
      },
    ] as const;

    for (const { variant, bgClass, textClass } of variants) {
      const { container } = render(<Tag label={variant} variant={variant} />);
      expect(container.firstElementChild).toHaveClass(bgClass, textClass);
    }
  });

  it("renders gradient variant correctly", () => {
    const { container } = render(<Tag label="Gradient" variant="gradient" />);
    expect(container.firstElementChild).toHaveClass(
      "text-brand-on-background-medium",
      "border-brand-border-medium",
    );
  });

  it("renders different sizes correctly", () => {
    const { container: smallContainer } = render(<Tag label="Small" size="s" />);
    expect(smallContainer.firstElementChild).toHaveClass("px-8", "py-1");

    const { container: mediumContainer } = render(<Tag label="Medium" size="m" />);
    expect(mediumContainer.firstElementChild).toHaveClass("px-8", "py-2");

    const { container: largeContainer } = render(<Tag label="Large" size="l" />);
    expect(largeContainer.firstElementChild).toHaveClass("px-12", "py-4");
  });

  it("forwards ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Tag ref={ref} label="Ref Tag" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges custom className and style", () => {
    const { container } = render(
      <Tag label="Custom" className="custom-tag-class" style={{ opacity: 0.8 }} />,
    );
    expect(container.firstElementChild).toHaveClass("custom-tag-class");
    expect((container.firstElementChild as HTMLElement).style.opacity).toBe("0.8");
  });

  it("exports tagVariants function for composability", () => {
    const neutralClasses = tagVariants({ variant: "neutral", size: "m" });
    expect(neutralClasses).toContain("bg-neutral-background-weak");
    expect(neutralClasses).toContain("px-8");
    expect(neutralClasses).toContain("py-2");

    const brandClasses = tagVariants({ variant: "brand", size: "s" });
    expect(brandClasses).toContain("bg-brand-background-weak");
    expect(brandClasses).toContain("px-8");
    expect(brandClasses).toContain("py-1");
  });
});
