import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Heading } from "../components/Heading";

describe("Heading", () => {
  it("renders default h1 with default font-m, font-strong, neutral-on-background-strong, and text-balance", () => {
    const { container } = render(<Heading>Main Heading</Heading>);
    const heading = screen.getByText("Main Heading");
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe("H1");
    expect(container.firstElementChild).toHaveClass(
      "font-m",
      "font-strong",
      "neutral-on-background-strong",
      "text-balance",
    );
  });

  it("renders polymorphic as element correctly", () => {
    const { rerender, container } = render(<Heading as="h2">Heading 2</Heading>);
    expect(container.firstElementChild?.tagName).toBe("H2");

    rerender(<Heading as="h3">Heading 3</Heading>);
    expect(container.firstElementChild?.tagName).toBe("H3");

    rerender(<Heading as="p">Paragraph Heading</Heading>);
    expect(container.firstElementChild?.tagName).toBe("P");

    rerender(<Heading as="span">Span Heading</Heading>);
    expect(container.firstElementChild?.tagName).toBe("SPAN");
  });

  it("renders variant classes correctly", () => {
    const { container, rerender } = render(
      <Heading variant="heading-strong-xl">Heading XL</Heading>,
    );
    expect(container.firstElementChild).toHaveClass("font-heading", "font-strong", "font-xl");

    rerender(<Heading variant="display-default-m">Display M</Heading>);
    expect(container.firstElementChild).toHaveClass("font-display", "font-default", "font-m");

    rerender(<Heading variant="body-medium-s">Body S</Heading>);
    expect(container.firstElementChild).toHaveClass("font-body", "font-medium", "font-s");
  });

  it("renders custom size and weight when variant is not provided", () => {
    const { container } = render(
      <Heading size="l" weight="medium">
        Custom Size Weight
      </Heading>,
    );
    expect(container.firstElementChild).toHaveClass("font-l", "font-medium");
  });

  it("renders font family override", () => {
    const { container } = render(
      <Heading variant="heading-strong-m" family="code">
        Code Family Heading
      </Heading>,
    );
    expect(container.firstElementChild).toHaveClass("font-family-code");
  });

  it("renders onBackground and onSolid colors", () => {
    const { container, rerender } = render(
      <Heading onBackground="brand-medium">Brand Heading</Heading>,
    );
    expect(container.firstElementChild).toHaveClass("brand-on-background-medium");

    rerender(<Heading onSolid="danger-strong">Danger Heading</Heading>);
    expect(container.firstElementChild).toHaveClass("danger-on-solid-strong");
  });

  it("renders spacing props correctly", () => {
    const { container, rerender } = render(
      <Heading padding="16" margin="8" paddingX="24" marginTop="12">
        Spaced Heading
      </Heading>,
    );
    expect(container.firstElementChild).toHaveClass("p-16", "m-8", "px-24", "mt-12");

    rerender(<Heading padding={20}>Numeric Padding</Heading>);
    expect(container.firstElementChild).toHaveClass("p-[20px]");
  });

  it("renders alignment, wrapping, truncate, and opacity", () => {
    const { container, rerender } = render(
      <Heading align="center" wrap="nowrap" truncate opacity={70}>
        Aligned Heading
      </Heading>,
    );
    expect(container.firstElementChild).toHaveClass(
      "text-center",
      "text-nowrap",
      "truncate",
      "opacity-70",
    );

    rerender(
      <Heading align="right" wrap="balance">
        Right Balanced
      </Heading>,
    );
    expect(container.firstElementChild).toHaveClass("text-right", "text-balance");
  });

  it("renders responsive breakpoint classes", () => {
    const { container } = render(
      <Heading s={{ align: "center", padding: "8" }} m={{ hide: true }}>
        Responsive Heading
      </Heading>,
    );
    expect(container.firstElementChild).toHaveClass("s:text-center", "s:p-8", "m:hidden");
  });

  it("merges custom className and preserves style", () => {
    const { container } = render(
      <Heading className="custom-heading-class" style={{ letterSpacing: "2px" }}>
        Styled Heading
      </Heading>,
    );
    const element = container.firstElementChild as HTMLElement;
    expect(element).toHaveClass("custom-heading-class");
    expect(element.style.letterSpacing).toBe("2px");
  });

  it("warns when variant and size/weight are both passed", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Heading variant="heading-strong-xl" size="s">
        Warning Heading
      </Heading>,
    );
    expect(warnSpy).toHaveBeenCalledWith("When 'variant' is set, 'size' and 'weight' are ignored.");
    warnSpy.mockRestore();
  });

  it("warns when both onBackground and onSolid are passed", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Heading onBackground="brand-medium" onSolid="danger-strong">
        Warning Color Heading
      </Heading>,
    );
    expect(warnSpy).toHaveBeenCalledWith(
      "You cannot use both 'onBackground' and 'onSolid' props simultaneously. Only one will be applied.",
    );
    warnSpy.mockRestore();
  });
});
