import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { ToggleButton, toggleButtonVariants } from "../components/ToggleButton";

describe("ToggleButton", () => {
  it("renders default button with ghost variant and m size", () => {
    const { container } = render(<ToggleButton>Toggle</ToggleButton>);
    const button = screen.getByRole("button", { name: "Toggle" });
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe("BUTTON");
    expect(container.firstElementChild).toHaveClass(
      "border-transparent",
      "text-neutral-on-background-strong",
      "py-4",
      "px-8",
      "min-h-32",
      "h-32",
      "gap-8",
      "w-fit",
      "justify-center",
      "rounded-m",
      "cursor-interactive",
    );
  });

  it("renders all variants correctly", () => {
    const { container, rerender } = render(<ToggleButton variant="ghost">Ghost</ToggleButton>);
    expect(container.firstElementChild).toHaveClass(
      "border-transparent",
      "text-neutral-on-background-strong",
    );

    rerender(<ToggleButton variant="outline">Outline</ToggleButton>);
    expect(container.firstElementChild).toHaveClass(
      "border-neutral-alpha-weak",
      "text-neutral-on-background-strong",
    );

    rerender(<ToggleButton variant="subtle">Subtle</ToggleButton>);
    expect(container.firstElementChild).toHaveClass(
      "border-transparent",
      "text-neutral-on-background-strong",
    );
  });

  it("renders selected state correctly across variants", () => {
    const { container, rerender } = render(
      <ToggleButton variant="ghost" selected>
        Selected Ghost
      </ToggleButton>,
    );
    expect(container.firstElementChild).toHaveClass(
      "bg-neutral-alpha-medium",
      "border-neutral-alpha-weak",
    );
    expect(container.firstElementChild).toHaveAttribute("aria-pressed", "true");

    rerender(
      <ToggleButton variant="outline" selected>
        Selected Outline
      </ToggleButton>,
    );
    expect(container.firstElementChild).toHaveClass(
      "bg-neutral-alpha-medium",
      "border-neutral-alpha-weak",
    );
    expect(container.firstElementChild).toHaveAttribute("aria-pressed", "true");

    rerender(
      <ToggleButton variant="subtle" selected>
        Selected Subtle
      </ToggleButton>,
    );
    expect(container.firstElementChild).toHaveClass(
      "bg-neutral-alpha-medium",
      "border-transparent",
    );
    expect(container.firstElementChild).toHaveAttribute("aria-pressed", "true");
  });

  it("renders all sizes correctly", () => {
    const { container, rerender } = render(<ToggleButton size="xs">XS</ToggleButton>);
    expect(container.firstElementChild).toHaveClass(
      "py-2",
      "px-8",
      "min-h-20",
      "h-20",
      "gap-8",
      "rounded-xs",
    );

    rerender(<ToggleButton size="s">S</ToggleButton>);
    expect(container.firstElementChild).toHaveClass(
      "py-2",
      "px-8",
      "min-h-24",
      "h-24",
      "gap-8",
      "rounded-s",
    );

    rerender(<ToggleButton size="m">M</ToggleButton>);
    expect(container.firstElementChild).toHaveClass(
      "py-4",
      "px-8",
      "min-h-32",
      "h-32",
      "gap-8",
      "rounded-m",
    );

    rerender(<ToggleButton size="l">L</ToggleButton>);
    expect(container.firstElementChild).toHaveClass(
      "py-8",
      "px-16",
      "min-h-40",
      "h-40",
      "gap-8",
      "rounded-l",
    );

    rerender(<ToggleButton size="xl">XL</ToggleButton>);
    expect(container.firstElementChild).toHaveClass(
      "py-12",
      "px-20",
      "min-h-48",
      "h-48",
      "gap-8",
      "rounded-xl",
    );
  });

  it("renders fillWidth correctly", () => {
    const { container, rerender } = render(<ToggleButton fillWidth>Filled</ToggleButton>);
    expect(container.firstElementChild).toHaveClass("w-full");

    rerender(<ToggleButton fillWidth={false}>Fit</ToggleButton>);
    expect(container.firstElementChild).toHaveClass("w-fit");
  });

  it("renders horizontal alignment correctly", () => {
    const { container, rerender } = render(<ToggleButton horizontal="start">Start</ToggleButton>);
    expect(container.firstElementChild).toHaveClass("justify-start");

    rerender(<ToggleButton horizontal="center">Center</ToggleButton>);
    expect(container.firstElementChild).toHaveClass("justify-center");

    rerender(<ToggleButton horizontal="end">End</ToggleButton>);
    expect(container.firstElementChild).toHaveClass("justify-end");

    rerender(<ToggleButton horizontal="between">Between</ToggleButton>);
    expect(container.firstElementChild).toHaveClass("justify-between");
  });

  it("renders custom radius and radius none", () => {
    const { container, rerender } = render(<ToggleButton radius="none">No Radius</ToggleButton>);
    expect(container.firstElementChild).toHaveClass("rounded-none");

    rerender(
      <ToggleButton radius="top" size="m">
        Top Radius
      </ToggleButton>,
    );
    expect(container.firstElementChild).toHaveClass("rounded-t-m");

    rerender(
      <ToggleButton radius="left" size="m">
        Left Radius
      </ToggleButton>,
    );
    expect(container.firstElementChild).toHaveClass("rounded-l-m");

    rerender(
      <ToggleButton radius="right" size="m">
        Right Radius
      </ToggleButton>,
    );
    expect(container.firstElementChild).toHaveClass("rounded-r-m");

    rerender(
      <ToggleButton radius="bottom-right" size="l">
        Bottom Right
      </ToggleButton>,
    );
    expect(container.firstElementChild).toHaveClass("rounded-br-l");
  });

  it("renders data-border when rounded is true", () => {
    const { container } = render(<ToggleButton rounded>Rounded</ToggleButton>);
    expect(container.firstElementChild).toHaveAttribute("data-border", "rounded");
  });

  it("renders disabled state correctly", () => {
    const { container } = render(<ToggleButton disabled>Disabled</ToggleButton>);
    const button = screen.getByRole("button", { name: "Disabled" });
    expect(button).toBeDisabled();
    expect(container.firstElementChild).toHaveAttribute("data-disabled", "true");
    expect(container.firstElementChild).toHaveClass("cursor-not-allowed");
  });

  it("renders as an anchor when href is provided", () => {
    render(<ToggleButton href="https://example.com">External Link</ToggleButton>);
    const link = screen.getByRole("link", { name: "External Link" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });

  it("renders prefix and suffix icons", () => {
    const { container } = render(
      <ToggleButton prefixIcon="chevronLeft" suffixIcon="chevronRight">
        With Icons
      </ToggleButton>,
    );
    expect(container.querySelectorAll("svg").length).toBe(2);
  });

  it("renders label prop and children correctly", () => {
    render(<ToggleButton label="Label Prop" />);
    expect(screen.getByText("Label Prop")).toBeInTheDocument();
  });

  it("forwards ref to button element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<ToggleButton ref={ref}>Ref Button</ToggleButton>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("merges custom className and preserves style", () => {
    const { container } = render(
      <ToggleButton className="custom-toggle" style={{ opacity: 0.8 }}>
        Custom
      </ToggleButton>,
    );
    expect(container.firstElementChild).toHaveClass("custom-toggle");
    expect((container.firstElementChild as HTMLElement).style.opacity).toBe("0.8");
  });

  it("exports toggleButtonVariants function for composability", () => {
    const classes = toggleButtonVariants({ variant: "outline", size: "s", selected: true });
    expect(classes).toContain("border-neutral-alpha-weak");
    expect(classes).toContain("bg-neutral-alpha-medium");
    expect(classes).toContain("h-24");
  });
});
