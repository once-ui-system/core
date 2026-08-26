import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { ElementType } from "../components/ElementType";

describe("ElementType", () => {
  it("renders Flex container by default", () => {
    const { container } = render(<ElementType>Default Content</ElementType>);
    expect(screen.getByText("Default Content")).toBeInTheDocument();
    expect(container.firstElementChild?.tagName).toBe("DIV");
    expect(container.firstElementChild).toHaveClass("flex");
  });

  it("renders button when onClick is provided", () => {
    const handleClick = vi.fn();
    render(<ElementType onClick={handleClick}>Clickable</ElementType>);
    const button = screen.getByRole("button", { name: "Clickable" });
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe("BUTTON");

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders button when type is button, submit, or reset", () => {
    const { rerender } = render(<ElementType type="button">Button Type</ElementType>);
    expect(screen.getByRole("button", { name: "Button Type" })).toHaveAttribute("type", "button");

    rerender(<ElementType type="submit">Submit Type</ElementType>);
    expect(screen.getByRole("button", { name: "Submit Type" })).toHaveAttribute("type", "submit");

    rerender(<ElementType type="reset">Reset Type</ElementType>);
    expect(screen.getByRole("button", { name: "Reset Type" })).toHaveAttribute("type", "reset");
  });

  it("renders external link with target _blank and rel noreferrer", () => {
    const handleLinkClick = vi.fn();
    const handleClick = vi.fn();
    render(
      <ElementType href="https://example.com" onLinkClick={handleLinkClick} onClick={handleClick}>
        External Link
      </ElementType>,
    );

    const link = screen.getByRole("link", { name: "External Link" });
    expect(link).toBeInTheDocument();
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");

    fireEvent.click(link);
    expect(handleLinkClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders internal Next.js link for relative paths", () => {
    const handleLinkClick = vi.fn();
    const handleClick = vi.fn();
    render(
      <ElementType href="/dashboard" onLinkClick={handleLinkClick} onClick={handleClick}>
        Internal Link
      </ElementType>,
    );

    const link = screen.getByRole("link", { name: "Internal Link" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/dashboard");
    expect(link).not.toHaveAttribute("target");

    fireEvent.click(link);
    expect(handleLinkClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("sanitizes dangerous href and falls back to non-link element", () => {
    const { container } = render(
      // biome-ignore lint/security/noScriptUrl: testing XSS sanitization
      <ElementType href="javascript:alert('xss')">Safe Content</ElementType>,
    );
    expect(screen.getByText("Safe Content")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(container.firstElementChild?.tagName).toBe("DIV");
  });

  it("forwards ref to button element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <ElementType ref={ref} onClick={() => {}}>
        Ref Button
      </ElementType>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("forwards ref to anchor element", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <ElementType ref={ref} href="https://example.com">
        Ref Link
      </ElementType>,
    );
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });

  it("forwards ref to flex div element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<ElementType ref={ref}>Ref Div</ElementType>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges custom className and style props", () => {
    const { container } = render(
      <ElementType className="custom-element-type" style={{ zIndex: 10 }}>
        Styled
      </ElementType>,
    );
    expect(container.firstElementChild).toHaveClass("custom-element-type");
    expect((container.firstElementChild as HTMLElement).style.zIndex).toBe("10");
  });
});
