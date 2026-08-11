import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card } from "../components/Card";

describe("Card", () => {
  it("renders static card with default styles", () => {
    const { container } = render(<Card>Card Content</Card>);
    expect(screen.getByText("Card Content")).toBeInTheDocument();
    const outer = container.firstElementChild;
    expect(outer).toHaveClass("reset-button-styles");
    expect(outer).toHaveClass("w-full");
    expect(outer).not.toHaveClass("focus-ring");
  });

  it("renders interactive card with onClick and focus ring", () => {
    const { container } = render(<Card onClick={() => {}}>Interactive Card</Card>);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("focus-ring");
    expect(button).toHaveClass("rounded-l");

    const inner = container.querySelector(".hover\\:bg-neutral-alpha-weak");
    expect(inner).toBeInTheDocument();
  });

  it("renders interactive card with href as link", () => {
    render(<Card href="https://example.com">Link Card</Card>);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveClass("focus-ring");
  });

  it("merges custom className and custom radius", () => {
    const { container } = render(
      <Card radius="m" className="custom-card-class">
        Custom Card
      </Card>,
    );
    const inner = container.querySelector(".custom-card-class");
    expect(inner).toBeInTheDocument();
    expect(inner).toHaveClass("rounded-m");
  });
});
