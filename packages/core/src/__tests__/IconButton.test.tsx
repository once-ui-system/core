import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { IconButton } from "../components/IconButton";

describe("IconButton", () => {
  it("renders default icon button with refresh icon and m size", () => {
    const { container } = render(<IconButton />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe("BUTTON");
    expect(container.firstElementChild).toHaveClass(
      "bg-brand-solid-medium",
      "text-brand-on-solid-strong",
      "size-32",
      "min-w-32",
      "min-h-32",
      "rounded-m",
      "cursor-interactive",
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders all sizes correctly", () => {
    const { container, rerender } = render(<IconButton size="xs" />);
    expect(container.firstElementChild).toHaveClass("size-20", "min-w-20", "min-h-20", "rounded-s");

    rerender(<IconButton size="s" />);
    expect(container.firstElementChild).toHaveClass("size-24", "min-w-24", "min-h-24", "rounded-m");

    rerender(<IconButton size="m" />);
    expect(container.firstElementChild).toHaveClass("size-32", "min-w-32", "min-h-32", "rounded-m");

    rerender(<IconButton size="l" />);
    expect(container.firstElementChild).toHaveClass("size-40", "min-w-40", "min-h-40", "rounded-l");

    rerender(<IconButton size="xl" />);
    expect(container.firstElementChild).toHaveClass("size-48", "min-w-48", "min-h-48", "rounded-l");
  });

  it("renders all variants correctly", () => {
    const { container, rerender } = render(<IconButton variant="secondary" />);
    expect(container.firstElementChild).toHaveClass(
      "border-neutral-alpha-weak",
      "text-neutral-on-background-strong",
    );

    rerender(<IconButton variant="danger" />);
    expect(container.firstElementChild).toHaveClass(
      "bg-danger-solid-medium",
      "text-danger-on-solid-strong",
    );

    rerender(<IconButton variant="ghost" />);
    expect(container.firstElementChild).toHaveClass(
      "border-none",
      "text-neutral-on-background-medium",
    );
  });

  it("renders custom radius and radius none", () => {
    const { container, rerender } = render(<IconButton radius="none" />);
    expect(container.firstElementChild).toHaveClass("rounded-none");

    rerender(<IconButton radius="top" size="m" />);
    expect(container.firstElementChild).toHaveClass("rounded-t-m");

    rerender(<IconButton radius="bottom-right" size="l" />);
    expect(container.firstElementChild).toHaveClass("rounded-br-l");
  });

  it("renders data-border when rounded is true", () => {
    const { container } = render(<IconButton rounded />);
    expect(container.firstElementChild).toHaveAttribute("data-border", "rounded");
  });

  it("renders disabled state correctly", () => {
    const { container } = render(<IconButton disabled />);
    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(container.firstElementChild).toHaveAttribute("data-disabled", "true");
    expect(container.firstElementChild).toHaveClass("cursor-not-allowed");
  });

  it("renders as an anchor when href is provided", () => {
    render(<IconButton href="https://example.com" icon="chevronRight" />);
    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });

  it("renders loading spinner when loading is true", () => {
    render(<IconButton loading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders custom children instead of icon", () => {
    render(<IconButton>Custom Icon</IconButton>);
    expect(screen.getByText("Custom Icon")).toBeInTheDocument();
  });

  it("renders tooltip when tooltip prop is provided", () => {
    render(<IconButton tooltip="Refresh data" />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Refresh data");
  });

  it("forwards ref to button element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<IconButton ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("merges custom className and preserves style", () => {
    const { container } = render(
      <IconButton className="custom-icon-btn" style={{ opacity: 0.7 }} />,
    );
    expect(container.firstElementChild).toHaveClass("custom-icon-btn");
    expect((container.firstElementChild as HTMLElement).style.opacity).toBe("0.7");
  });
});
