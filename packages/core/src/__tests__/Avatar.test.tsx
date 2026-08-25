import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Avatar, avatarVariants } from "../components/Avatar";

describe("Avatar", () => {
  it("renders default empty avatar with person icon", () => {
    const { container } = render(<Avatar />);
    const avatar = container.querySelector('[role="img"]');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveClass(
      "relative",
      "flex",
      "items-center",
      "justify-center",
      "w-32",
      "min-w-32",
      "h-32",
      "min-h-32",
      "rounded-full",
    );
    expect(screen.getByLabelText("Empty avatar")).toBeInTheDocument();
  });

  it("renders with custom empty icon", () => {
    render(<Avatar empty icon="sparkle" />);
    expect(screen.getByLabelText("Empty avatar")).toBeInTheDocument();
  });

  it("renders with initials value", () => {
    render(<Avatar value="JD" />);
    expect(screen.getByText("JD")).toBeInTheDocument();
    expect(screen.getByLabelText("Avatar with initials JD")).toBeInTheDocument();
  });

  it("renders with image src", () => {
    const { container } = render(<Avatar src="https://example.com/avatar.png" />);
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img?.getAttribute("src")).toContain("https%3A%2F%2Fexample.com%2Favatar.png");
    expect(img).toHaveAttribute("alt", "Avatar");
  });

  it("renders with unoptimized image src", () => {
    const { container } = render(<Avatar src="https://example.com/avatar.png" unoptimized />);
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/avatar.png");
  });

  it("throws error when both value and src are provided", () => {
    expect(() => {
      render(<Avatar value="JD" src="https://example.com/avatar.png" />);
    }).toThrow("Avatar cannot have both 'value' and 'src' props.");
  });

  it("renders skeleton in loading state", () => {
    render(<Avatar loading />);
    const skeleton = screen.getByLabelText("Loading avatar");
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute("aria-busy", "true");
  });

  it("renders status indicator with specified color", () => {
    const { container } = render(<Avatar value="AB" statusIndicator={{ color: "green" }} />);
    const indicator = container.querySelector('[aria-label="Status: green"]');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass(
      "box-content",
      "translate-x-2",
      "translate-y-2",
      "bottom-0",
      "right-0",
    );
  });

  it("positions status indicator properly for xl size", () => {
    const { container } = render(
      <Avatar size="xl" value="AB" statusIndicator={{ color: "green" }} />,
    );
    const indicator = container.querySelector('[aria-label="Status: green"]');
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveClass(
      "box-content",
      "translate-x-2",
      "translate-y-2",
      "bottom-16",
      "right-16",
    );
  });

  it("supports all TShirtSizes", () => {
    const sizes = ["xs", "s", "m", "l", "xl"] as const;
    const sizeClasses = {
      xs: ["w-20", "min-w-20", "h-20", "min-h-20"],
      s: ["w-24", "min-w-24", "h-24", "min-h-24"],
      m: ["w-32", "min-w-32", "h-32", "min-h-32"],
      l: ["w-48", "min-w-48", "h-48", "min-h-48"],
      xl: ["w-160", "min-w-160", "h-160", "min-h-160"],
    };

    for (const size of sizes) {
      const { container } = render(<Avatar size={size} value="JD" />);
      const avatar = container.querySelector('[role="img"]');
      expect(avatar).toBeInTheDocument();
      for (const cls of sizeClasses[size]) {
        expect(avatar).toHaveClass(cls);
      }
    }
  });

  it("supports custom size as a number (rem)", () => {
    const { container } = render(<Avatar size={4} value="JD" />);
    const avatar = container.querySelector('[role="img"]') as HTMLElement;
    expect(avatar).toBeInTheDocument();
    expect(avatar.style.width).toBe("4rem");
    expect(avatar.style.height).toBe("4rem");
    expect(avatar.style.minWidth).toBe("4rem");
    expect(avatar.style.minHeight).toBe("4rem");
  });

  it("forwards ref to div element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Avatar ref={ref} value="JD" />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges custom className and style", () => {
    const { container } = render(
      <Avatar value="JD" className="custom-avatar-class" style={{ opacity: 0.85 }} />,
    );
    const avatar = container.querySelector('[role="img"]') as HTMLElement;
    expect(avatar).toHaveClass("custom-avatar-class");
    expect(avatar.style.opacity).toBe("0.85");
  });

  it("exports avatarVariants function", () => {
    const defaultClasses = avatarVariants();
    expect(defaultClasses).toContain("relative");
    expect(defaultClasses).toContain("flex");
    expect(defaultClasses).toContain("w-32");

    const xlClasses = avatarVariants({ size: "xl" });
    expect(xlClasses).toContain("w-160");
  });
});
