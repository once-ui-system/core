import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Text } from "../components/Text";

describe("Text", () => {
  it("renders default span and inherits typography by default", () => {
    const { container } = render(<Text>Default Text</Text>);
    const text = screen.getByText("Default Text");
    expect(text).toBeInTheDocument();
    expect(text.tagName).toBe("SPAN");
    expect(container.firstElementChild).not.toHaveClass("flex");
  });

  it("renders polymorphic as element correctly", () => {
    const { rerender, container } = render(<Text as="p">Paragraph Text</Text>);
    expect(container.firstElementChild?.tagName).toBe("P");

    rerender(<Text as="div">Div Text</Text>);
    expect(container.firstElementChild?.tagName).toBe("DIV");

    rerender(<Text as="label">Label Text</Text>);
    expect(container.firstElementChild?.tagName).toBe("LABEL");

    rerender(<Text as="code">Code Text</Text>);
    expect(container.firstElementChild?.tagName).toBe("CODE");
  });

  it("renders variant classes correctly", () => {
    const { container, rerender } = render(<Text variant="body-strong-m">Body Strong M</Text>);
    expect(container.firstElementChild).toHaveClass("font-body", "font-strong", "font-m");

    rerender(<Text variant="label-default-s">Label Default S</Text>);
    expect(container.firstElementChild).toHaveClass("font-label", "font-default", "font-s");

    rerender(<Text variant="code-medium-xs">Code Medium XS</Text>);
    expect(container.firstElementChild).toHaveClass("font-code", "font-medium", "font-xs");
  });

  it("renders custom size and weight when variant is not provided", () => {
    const { container } = render(
      <Text size="s" weight="medium">
        Custom Size Weight
      </Text>,
    );
    expect(container.firstElementChild).toHaveClass("font-s", "font-medium");
  });

  it("renders font family override", () => {
    const { container } = render(
      <Text variant="body-default-m" family="display">
        Display Family Text
      </Text>,
    );
    expect(container.firstElementChild).toHaveClass("font-family-display");
  });

  it("renders onBackground and onSolid colors", () => {
    const { container, rerender } = render(<Text onBackground="brand-medium">Brand Text</Text>);
    expect(container.firstElementChild).toHaveClass("brand-on-background-medium");

    rerender(<Text onSolid="success-strong">Success Text</Text>);
    expect(container.firstElementChild).toHaveClass("success-on-solid-strong");
  });

  it("renders spacing props correctly", () => {
    const { container, rerender } = render(
      <Text padding="8" marginX="16" marginTop="4">
        Spaced Text
      </Text>,
    );
    expect(container.firstElementChild).toHaveClass("p-8", "mx-16", "mt-4");

    rerender(<Text padding={12}>Numeric Padding</Text>);
    expect(container.firstElementChild).toHaveClass("p-[12px]");
  });

  it("renders alignment, wrapping, truncate, and opacity", () => {
    const { container } = render(
      <Text align="right" wrap="nowrap" truncate opacity={50}>
        Formatted Text
      </Text>,
    );
    expect(container.firstElementChild).toHaveClass(
      "text-right",
      "text-nowrap",
      "truncate",
      "opacity-50",
    );
  });

  it("renders responsive breakpoint classes", () => {
    const { container } = render(
      <Text s={{ align: "center", size: "s" }} m={{ hide: true }}>
        Responsive Text
      </Text>,
    );
    expect(container.firstElementChild).toHaveClass("s:text-center", "s:font-s", "m:hidden");
  });

  it("merges custom className and preserves style", () => {
    const { container } = render(
      <Text className="custom-text-class" style={{ textDecoration: "underline" }}>
        Styled Text
      </Text>,
    );
    const element = container.firstElementChild as HTMLElement;
    expect(element).toHaveClass("custom-text-class");
    expect(element.style.textDecoration).toBe("underline");
  });

  it("warns when variant and size/weight are both passed", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Text variant="body-strong-m" size="l">
        Warning Text
      </Text>,
    );
    expect(warnSpy).toHaveBeenCalledWith("When 'variant' is set, 'size' and 'weight' are ignored.");
    warnSpy.mockRestore();
  });

  it("warns when both onBackground and onSolid are passed", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      <Text onBackground="brand-medium" onSolid="danger-strong">
        Warning Color Text
      </Text>,
    );
    expect(warnSpy).toHaveBeenCalledWith(
      "You cannot use both 'onBackground' and 'onSolid' props simultaneously. Only one will be applied.",
    );
    warnSpy.mockRestore();
  });
});
