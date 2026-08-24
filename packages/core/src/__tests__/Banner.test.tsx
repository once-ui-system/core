import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Banner } from "../components/Banner";

describe("Banner", () => {
  it("renders default banner with children and default classes", () => {
    const { container } = render(<Banner>Free shipping on orders over $50</Banner>);
    expect(screen.getByText("Free shipping on orders over $50")).toBeInTheDocument();

    const banner = container.firstElementChild;
    expect(banner).toBeInTheDocument();
    expect(banner).toHaveClass(
      "w-full",
      "px-16",
      "py-8",
      "bg-brand-solid-medium",
      "text-brand-on-solid-strong",
      "font-label",
      "font-s",
      "font-default",
      "text-center",
      "justify-center",
      "items-center",
      "gap-12",
    );
  });

  it("forwards ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Banner ref={ref}>Ref Banner</Banner>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("allows prop overrides", () => {
    const { container } = render(
      <Banner
        solid="success-medium"
        onSolid="success-strong"
        radius="s"
        horizontal="between"
        gap="16"
      >
        Custom Banner
      </Banner>,
    );

    const banner = container.firstElementChild;
    expect(banner).toHaveClass(
      "bg-success-solid-medium",
      "text-success-on-solid-strong",
      "rounded-s",
      "justify-between",
      "gap-16",
    );
  });

  it("merges custom className and style", () => {
    const { container } = render(
      <Banner className="custom-banner-class" style={{ opacity: 0.9 }}>
        Styled Banner
      </Banner>,
    );

    const banner = container.firstElementChild;
    expect(banner).toHaveClass("custom-banner-class");
    expect((banner as HTMLElement).style.opacity).toBe("0.9");
  });
});
