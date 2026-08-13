import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { InlineCode } from "../components/InlineCode";

describe("InlineCode", () => {
  it("renders children with inline-flex span and typography/spacing classes", () => {
    const { container } = render(<InlineCode>npm install</InlineCode>);
    const element = screen.getByText("npm install");
    expect(element).toBeInTheDocument();
    expect(element.tagName).toBe("SPAN");

    expect(container.firstElementChild).toHaveClass(
      "inline-flex",
      "w-fit",
      "h-fit",
      "rounded-s",
      "px-4",
      "py-1",
      "font-family-code",
      "bg-neutral-alpha-weak",
      "text-[80%]",
      "leading-[125%]",
      "align-middle",
    );
  });

  it("forwards ref to the underlying element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<InlineCode ref={ref}>git status</InlineCode>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe("SPAN");
  });

  it("merges custom className and preserves custom style", () => {
    const { container } = render(
      <InlineCode className="custom-code" style={{ color: "red" }}>
        const x = 1;
      </InlineCode>,
    );
    const element = container.firstElementChild as HTMLElement;
    expect(element).toHaveClass("custom-code");
    expect(element.style.color).toBe("red");
  });
});
