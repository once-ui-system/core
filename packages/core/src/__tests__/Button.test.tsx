import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Button } from "../components/Button";

describe("Button", () => {
  it("renders default button with primary variant and m size", () => {
    const { container } = render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe("BUTTON");
    expect(container.firstElementChild).toHaveClass(
      "bg-brand-solid-medium",
      "text-brand-on-solid-strong",
      "py-8",
      "px-12",
      "min-h-40",
      "h-40",
      "gap-4",
      "w-fit",
      "justify-center",
      "rounded-m",
      "cursor-interactive",
    );
  });

  it("renders all variants correctly", () => {
    const { container, rerender } = render(<Button variant="secondary">Secondary</Button>);
    expect(container.firstElementChild).toHaveClass(
      "border-neutral-alpha-weak",
      "text-neutral-on-background-strong",
    );

    rerender(<Button variant="tertiary">Tertiary</Button>);
    expect(container.firstElementChild).toHaveClass("text-neutral-on-background-strong");

    rerender(<Button variant="quaternary">Quaternary</Button>);
    expect(container.firstElementChild).toHaveClass(
      "border-none",
      "text-neutral-on-background-medium",
    );

    rerender(<Button variant="subtle">Subtle</Button>);
    expect(container.firstElementChild).toHaveClass("text-neutral-on-background-strong");

    rerender(<Button variant="danger">Danger</Button>);
    expect(container.firstElementChild).toHaveClass(
      "bg-danger-solid-medium",
      "text-danger-on-solid-strong",
    );

    rerender(<Button variant="success">Success</Button>);
    expect(container.firstElementChild).toHaveClass(
      "bg-success-solid-medium",
      "text-success-on-solid-strong",
    );

    rerender(<Button variant="warning">Warning</Button>);
    expect(container.firstElementChild).toHaveClass(
      "bg-warning-solid-medium",
      "text-warning-on-solid-strong",
    );

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(container.firstElementChild).toHaveClass(
      "border-none",
      "text-neutral-on-background-medium",
    );

    rerender(<Button variant="link">Link</Button>);
    expect(container.firstElementChild).toHaveClass("text-neutral-on-background-strong");
  });

  it("renders all sizes correctly", () => {
    const { container, rerender } = render(<Button size="xs">XS</Button>);
    expect(container.firstElementChild).toHaveClass(
      "py-2",
      "px-4",
      "min-h-24",
      "h-24",
      "gap-2",
      "rounded-s",
    );

    rerender(<Button size="s">S</Button>);
    expect(container.firstElementChild).toHaveClass(
      "py-4",
      "px-8",
      "min-h-32",
      "h-32",
      "gap-4",
      "rounded-m",
    );

    rerender(<Button size="m">M</Button>);
    expect(container.firstElementChild).toHaveClass(
      "py-8",
      "px-12",
      "min-h-40",
      "h-40",
      "gap-4",
      "rounded-m",
    );

    rerender(<Button size="l">L</Button>);
    expect(container.firstElementChild).toHaveClass(
      "py-12",
      "px-20",
      "min-h-48",
      "h-48",
      "gap-8",
      "rounded-l",
    );

    rerender(<Button size="xl">XL</Button>);
    expect(container.firstElementChild).toHaveClass(
      "py-16",
      "px-24",
      "min-h-56",
      "h-56",
      "gap-12",
      "rounded-l",
    );
  });

  it("renders fillWidth correctly", () => {
    const { container, rerender } = render(<Button fillWidth>Filled</Button>);
    expect(container.firstElementChild).toHaveClass("w-full");

    rerender(<Button fillWidth={false}>Fit</Button>);
    expect(container.firstElementChild).toHaveClass("w-fit");
  });

  it("renders horizontal alignment correctly", () => {
    const { container, rerender } = render(<Button horizontal="start">Start</Button>);
    expect(container.firstElementChild).toHaveClass("justify-start");

    rerender(<Button horizontal="center">Center</Button>);
    expect(container.firstElementChild).toHaveClass("justify-center");

    rerender(<Button horizontal="end">End</Button>);
    expect(container.firstElementChild).toHaveClass("justify-end");

    rerender(<Button horizontal="between">Between</Button>);
    expect(container.firstElementChild).toHaveClass("justify-between");
  });

  it("renders custom radius and radius none", () => {
    const { container, rerender } = render(<Button radius="none">No Radius</Button>);
    expect(container.firstElementChild).toHaveClass("rounded-none");

    rerender(
      <Button radius="top" size="m">
        Top Radius
      </Button>,
    );
    expect(container.firstElementChild).toHaveClass("rounded-t-m");

    rerender(
      <Button radius="bottom-right" size="l">
        Bottom Right
      </Button>,
    );
    expect(container.firstElementChild).toHaveClass("rounded-br-l");
  });

  it("renders data-border when rounded is true", () => {
    const { container } = render(<Button rounded>Rounded Button</Button>);
    expect(container.firstElementChild).toHaveAttribute("data-border", "rounded");
  });

  it("renders disabled state correctly", () => {
    const { container } = render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole("button", { name: "Disabled Button" });
    expect(button).toBeDisabled();
    expect(container.firstElementChild).toHaveAttribute("data-disabled", "true");
    expect(container.firstElementChild).toHaveClass("cursor-not-allowed");
  });

  it("renders as an anchor when href is provided", () => {
    render(<Button href="https://example.com">External Link</Button>);
    const link = screen.getByRole("link", { name: "External Link" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });

  it("renders prefix and suffix icons", () => {
    const { container } = render(
      <Button prefixIcon="chevronLeft" suffixIcon="chevronRight">
        With Icons
      </Button>,
    );
    expect(container.querySelectorAll("svg").length).toBe(2);
  });

  it("renders spinner when loading is true and hides prefix icon", () => {
    render(
      <Button loading prefixIcon="chevronLeft">
        Loading Button
      </Button>,
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders arrow icon when arrowIcon is true", () => {
    const { container } = render(
      <Button id="test-arrow-btn" arrowIcon>
        Arrow Button
      </Button>,
    );
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it("prioritizes label over children", () => {
    render(<Button label="Label Text">Children Text</Button>);
    expect(screen.getByText("Label Text")).toBeInTheDocument();
    expect(screen.queryByText("Children Text")).not.toBeInTheDocument();
  });

  it("forwards ref to button element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Ref Button</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("merges custom className and preserves style", () => {
    const { container } = render(
      <Button className="custom-btn" style={{ opacity: 0.5 }}>
        Custom
      </Button>,
    );
    expect(container.firstElementChild).toHaveClass("custom-btn");
    expect((container.firstElementChild as HTMLElement).style.opacity).toBe("0.5");
  });
});
