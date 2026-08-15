import { fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Arrow, arrowHeadVariants, arrowVariants } from "../components/Arrow";

describe("Arrow", () => {
  it("renders default inactive arrow", () => {
    const { container } = render(<Arrow />);
    const root = container.firstElementChild;
    expect(root).toBeInTheDocument();
    expect(root).toHaveClass("h-16", "w-0", "invisible");
    expect((root as HTMLElement).style.transform).toBe("scale(0.8)");
  });

  it("renders active arrow when active prop is true", () => {
    const { container } = render(<Arrow active />);
    const root = container.firstElementChild;
    expect(root).toHaveClass("w-16", "visible");

    const heads = root?.querySelectorAll(":scope > div");
    expect(heads?.length).toBe(2);
    expect(heads?.[0]).toHaveClass("w-8", "rotate-45", "bg-brand-on-background-strong");
    expect(heads?.[1]).toHaveClass("w-8", "-rotate-45", "bg-brand-on-background-strong");
  });

  it("renders onSolid color variant", () => {
    const { container } = render(<Arrow active color="onSolid" />);
    const heads = container.firstElementChild?.querySelectorAll(":scope > div");
    expect(heads?.[0]).toHaveClass("bg-brand-on-solid-strong");
    expect(heads?.[1]).toHaveClass("bg-brand-on-solid-strong");
  });

  it("responds to mouseenter and mouseleave on trigger element", () => {
    const triggerBtn = document.createElement("button");
    triggerBtn.id = "hover-target";
    document.body.appendChild(triggerBtn);

    const { container } = render(<Arrow trigger="#hover-target" />);
    const root = container.firstElementChild;
    expect(root).toHaveClass("w-0", "invisible");

    fireEvent.mouseEnter(triggerBtn);
    expect(root).toHaveClass("w-16", "visible");

    fireEvent.mouseLeave(triggerBtn);
    expect(root).toHaveClass("w-0", "invisible");

    document.body.removeChild(triggerBtn);
  });

  it("applies custom scale, style, and className", () => {
    const { container } = render(
      <Arrow scale={1.2} className="custom-arrow" style={{ opacity: 0.7 }} />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveClass("custom-arrow");
    expect(root.style.transform).toBe("scale(1.2)");
    expect(root.style.opacity).toBe("0.7");
  });

  it("forwards ref to the root element", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Arrow ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("exports arrowVariants and arrowHeadVariants for composability", () => {
    expect(arrowVariants({ active: true })).toContain("w-16");
    expect(arrowVariants({ active: false })).toContain("w-0");

    expect(arrowHeadVariants({ active: true, position: "top", color: "onBackground" })).toContain(
      "rotate-45",
    );
    expect(arrowHeadVariants({ active: true, position: "bottom", color: "onSolid" })).toContain(
      "-rotate-45",
    );
  });
});
