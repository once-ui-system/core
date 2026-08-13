import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Kbd } from "../components/Kbd";

describe("Kbd", () => {
  it("renders kbd element with default classes and label", () => {
    const { container } = render(<Kbd label="⌘K" />);
    const kbd = screen.getByText("⌘K");
    expect(kbd).toBeInTheDocument();
    expect(container.firstElementChild?.tagName).toBe("KBD");

    expect(container.firstElementChild).toHaveClass(
      "min-w-32",
      "rounded-s",
      "px-4",
      "py-2",
      "bg-neutral-background-strong",
      "border-neutral-border-strong",
    );
  });

  it("renders children when label is not provided", () => {
    render(<Kbd>Ctrl + C</Kbd>);
    expect(screen.getByText("Ctrl + C")).toBeInTheDocument();
  });

  it("prioritizes label over children if both are provided", () => {
    render(<Kbd label="Esc">Escape</Kbd>);
    expect(screen.getByText("Esc")).toBeInTheDocument();
    expect(screen.queryByText("Escape")).not.toBeInTheDocument();
  });

  it("forwards ref to the kbd DOM element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Kbd ref={ref} label="Enter" />);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe("KBD");
  });

  it("merges custom className and preserves style", () => {
    const { container } = render(
      <Kbd label="Tab" className="custom-kbd-class" style={{ opacity: 0.8 }} />,
    );
    const element = container.firstElementChild as HTMLElement;
    expect(element).toHaveClass("custom-kbd-class");
    expect(element.style.opacity).toBe("0.8");
  });
});
