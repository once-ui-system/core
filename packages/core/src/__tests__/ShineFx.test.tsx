import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { ShineFx, shineFxVariants } from "../components/ShineFx";

describe("ShineFx", () => {
  it("renders text content with base and default gradient classes", () => {
    const { container } = render(<ShineFx>Shine Bright</ShineFx>);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toBeInTheDocument();
    expect(root.tagName.toLowerCase()).toBe("span");
    expect(root).toHaveClass("inline-block", "bg-clip-text", "animate-shine");
    expect(root.textContent).toBe("Shine Bright");
  });

  it("applies default style properties for animation duration and base opacity", () => {
    const { container } = render(<ShineFx>Shine</ShineFx>);
    const root = container.firstElementChild as HTMLElement;

    expect(root.style.animationDuration).toBe("1s");
    expect(root.style.getPropertyValue("--shine-base-opacity")).toBe("0.3");
  });

  it("allows custom speed and baseOpacity props", () => {
    const { container } = render(
      <ShineFx speed={3.5} baseOpacity={0.75}>
        Custom Props
      </ShineFx>,
    );
    const root = container.firstElementChild as HTMLElement;

    expect(root.style.animationDuration).toBe("3.5s");
    expect(root.style.getPropertyValue("--shine-base-opacity")).toBe("0.75");
  });

  it("renders inverse gradient variant when inverse is true", () => {
    const { container } = render(<ShineFx inverse>Inverse Shine</ShineFx>);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass(
      "bg-[linear-gradient(120deg,currentColor_40%,color-mix(in_srgb,currentColor,transparent_calc((1-var(--shine-base-opacity,0.3))*100%))_50%,currentColor_60%)]",
    );
  });

  it("applies disabled classes when disabled prop is true", () => {
    const { container } = render(<ShineFx disabled>Disabled Shine</ShineFx>);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass(
      "animate-none",
      "[-webkit-text-fill-color:inherit]",
      "bg-none",
      "[-webkit-background-clip:unset]",
      "[background-clip:unset]",
    );
  });

  it("disables animation when reducedMotion is true", () => {
    const { container } = render(<ShineFx reducedMotion={true}>Reduced Motion Shine</ShineFx>);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass("animate-none", "bg-none");
  });

  it("keeps animation active when reducedMotion is false", () => {
    const { container } = render(<ShineFx reducedMotion={false}>Active Motion Shine</ShineFx>);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass("animate-shine");
  });

  it("forwards ref to the root HTMLSpanElement", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<ShineFx ref={ref}>Ref Forwarding Test</ShineFx>);

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current?.textContent).toBe("Ref Forwarding Test");
  });

  it("merges custom className and style", () => {
    const { container } = render(
      <ShineFx className="custom-shine-class" style={{ letterSpacing: "1px", zIndex: 5 }}>
        Styled Shine
      </ShineFx>,
    );
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass("custom-shine-class", "inline-block");
    expect(root.style.letterSpacing).toBe("1px");
    expect(root.style.zIndex).toBe("5");
    expect(root.style.animationDuration).toBe("1s");
  });

  it("supports text styling props via Text component", () => {
    const { container } = render(
      <ShineFx variant="heading-default-xl" onBackground="brand-medium">
        Heading Shine
      </ShineFx>,
    );
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass(
      "font-heading",
      "font-default",
      "font-xl",
      "text-brand-on-background-medium",
    );
    expect(screen.getByText("Heading Shine")).toBeInTheDocument();
  });

  it("exports shineFxVariants CVA function", () => {
    const defaultClasses = shineFxVariants();
    expect(defaultClasses).toContain("inline-block");
    expect(defaultClasses).toContain("animate-shine");
    expect(defaultClasses).toContain("bg-[linear-gradient");

    const inverseClasses = shineFxVariants({ inverse: true });
    expect(inverseClasses).toContain(
      "bg-[linear-gradient(120deg,currentColor_40%,color-mix(in_srgb,currentColor,transparent_calc((1-var(--shine-base-opacity,0.3))*100%))_50%,currentColor_60%)]",
    );

    const disabledClasses = shineFxVariants({ disabled: true });
    expect(disabledClasses).toContain("animate-none");
    expect(disabledClasses).toContain("bg-none");

    const withCustomClass = shineFxVariants({ className: "extra-class" });
    expect(withCustomClass).toContain("extra-class");
  });
});
