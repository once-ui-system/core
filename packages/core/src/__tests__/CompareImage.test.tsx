import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import {
  CompareImage,
  compareImageDragIconVariants,
  compareImageHitAreaVariants,
  compareImageVariants,
} from "../components/CompareImage";

describe("CompareImage", () => {
  const leftContent = {
    src: "https://example.com/before.jpg",
    alt: "Before image",
  };

  const rightContent = {
    src: "https://example.com/after.jpg",
    alt: "After image",
  };

  it("renders both left and right images with initial 50% clipPath", () => {
    render(<CompareImage leftContent={leftContent} rightContent={rightContent} />);

    const beforeImg = screen.getByAltText("Before image");
    const afterImg = screen.getByAltText("After image");

    expect(beforeImg).toBeInTheDocument();
    expect(afterImg).toBeInTheDocument();

    expect(beforeImg.parentElement).toHaveStyle({ clipPath: "inset(0 50% 0 0)" });
    expect(afterImg.parentElement).toHaveStyle({ clipPath: "inset(0 0 0 50%)" });
  });

  it("renders custom ReactNode contents", () => {
    render(
      <CompareImage
        leftContent={{ src: <div data-testid="left-custom">Left Side</div> }}
        rightContent={{ src: <div data-testid="right-custom">Right Side</div> }}
      />,
    );

    expect(screen.getByTestId("left-custom")).toBeInTheDocument();
    expect(screen.getByTestId("right-custom")).toBeInTheDocument();
  });

  it("forwards ref to root Flex and applies custom className and style", () => {
    const ref = createRef<HTMLDivElement>();
    const { container } = render(
      <CompareImage
        ref={ref}
        leftContent={leftContent}
        rightContent={rightContent}
        className="custom-compare-class"
        style={{ opacity: 0.9 }}
      />,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    const root = container.firstElementChild;
    expect(root).toHaveClass("custom-compare-class");
    expect(root).toHaveClass("relative", "select-none");
    expect((root as HTMLElement).style.opacity).toBe("0.9");
  });

  it("handles mouse dragging to update comparison position", () => {
    const { container } = render(
      <CompareImage leftContent={leftContent} rightContent={rightContent} />,
    );

    const root = container.firstElementChild as HTMLElement;
    root.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      right: 500,
      bottom: 300,
      width: 500,
      height: 300,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    const dragButton = screen.getByRole("button", { name: "Drag to compare" });

    // Mouse down on drag button
    act(() => {
      fireEvent.mouseDown(dragButton);
    });

    // Move to 70% (x = 350)
    act(() => {
      fireEvent.mouseMove(document, { clientX: 350 });
    });

    const beforeImg = screen.getByAltText("Before image");
    const afterImg = screen.getByAltText("After image");

    expect(beforeImg.parentElement).toHaveStyle({ clipPath: "inset(0 30% 0 0)" });
    expect(afterImg.parentElement).toHaveStyle({ clipPath: "inset(0 0 0 70%)" });

    // Mouse up
    act(() => {
      fireEvent.mouseUp(document);
    });

    // Move after mouseup should not change position
    act(() => {
      fireEvent.mouseMove(document, { clientX: 100 });
    });

    expect(beforeImg.parentElement).toHaveStyle({ clipPath: "inset(0 30% 0 0)" });
  });

  it("handles touch dragging to update position and clamps values", () => {
    const { container } = render(
      <CompareImage leftContent={leftContent} rightContent={rightContent} />,
    );

    const root = container.firstElementChild as HTMLElement;
    root.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      right: 400,
      bottom: 200,
      width: 400,
      height: 200,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    const dragButton = screen.getByRole("button", { name: "Drag to compare" });

    act(() => {
      fireEvent.touchStart(dragButton);
    });

    // Move past bounds (x = 500, width = 400 -> > 100%)
    act(() => {
      fireEvent.touchMove(document, {
        touches: [{ clientX: 500, clientY: 0 }],
      });
    });

    const beforeImg = screen.getByAltText("Before image");
    expect(beforeImg.parentElement).toHaveStyle({ clipPath: "inset(0 0% 0 0)" });

    // Move past left bound (x = -50 -> < 0%)
    act(() => {
      fireEvent.touchMove(document, {
        touches: [{ clientX: -50, clientY: 0 }],
      });
    });

    expect(beforeImg.parentElement).toHaveStyle({ clipPath: "inset(0 100% 0 0)" });

    act(() => {
      fireEvent.touchEnd(document);
    });
  });

  it("exports CVA variant generators correctly", () => {
    expect(compareImageVariants()).toContain("relative");
    expect(compareImageVariants()).toContain("select-none");
    expect(compareImageHitAreaVariants()).toContain("-translate-x-1/2");
    expect(compareImageHitAreaVariants()).toContain("cursor-col-resize");
    expect(compareImageDragIconVariants()).toContain("absolute");
    expect(compareImageDragIconVariants()).toContain("-translate-x-1/2");
    expect(compareImageDragIconVariants()).toContain("-translate-y-1/2");
  });
});
