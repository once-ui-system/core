import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MatrixFx, matrixFxVariants } from "../components/MatrixFx";

describe("MatrixFx", () => {
  beforeEach(() => {
    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
      width: 400,
      height: 300,
      top: 0,
      left: 0,
      bottom: 300,
      right: 400,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    // Mock HTMLCanvasElement getContext
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      setTransform: vi.fn(),
      scale: vi.fn(),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      getImageData: vi.fn().mockReturnValue({
        data: new Uint8ClampedArray(400 * 300 * 4),
        width: 400,
        height: 300,
      }),
      putImageData: vi.fn(),
      globalAlpha: 1,
      fillStyle: "#000",
    } as unknown as CanvasRenderingContext2D);
  });

  it("renders MatrixFx container and canvas element", () => {
    const { container } = render(<MatrixFx />);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toBeInTheDocument();
    expect(root).toHaveClass("relative", "overflow-hidden", "w-full", "h-full");

    const canvas = root.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveClass("pointer-events-none", "absolute", "inset-0", "size-full");
  });

  it("forwards ref to the root HTMLDivElement", () => {
    const ref = createRef<HTMLDivElement>();
    render(<MatrixFx ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("renders children properly", () => {
    render(
      <MatrixFx>
        <div data-testid="matrix-child">Matrix Content</div>
      </MatrixFx>,
    );

    expect(screen.getByTestId("matrix-child")).toBeInTheDocument();
    expect(screen.getByText("Matrix Content")).toBeInTheDocument();
  });

  it("merges custom className and style", () => {
    const { container } = render(<MatrixFx className="custom-matrix" style={{ zIndex: 10 }} />);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass("custom-matrix", "relative", "overflow-hidden");
    expect(root.style.zIndex).toBe("10");
  });

  it("exports matrixFxVariants CVA function", () => {
    expect(matrixFxVariants()).toContain("relative");
    expect(matrixFxVariants()).toContain("overflow-hidden");
    expect(matrixFxVariants({ className: "extra-class" })).toContain("extra-class");
  });

  it("supports click trigger and invokes onClick callback", () => {
    const handleClick = vi.fn();
    const { container } = render(<MatrixFx trigger="click" onClick={handleClick} />);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass("cursor-interactive");

    fireEvent.click(root);
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Click again to leave
    fireEvent.click(root);
    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it("handles mouseEnter, mouseMove, and mouseLeave events and calls callbacks", () => {
    const handleMouseEnter = vi.fn();
    const handleMouseMove = vi.fn();
    const handleMouseLeave = vi.fn();

    const { container } = render(
      <MatrixFx
        trigger="hover"
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      />,
    );
    const root = container.firstElementChild as HTMLElement;

    fireEvent.mouseEnter(root);
    expect(handleMouseEnter).toHaveBeenCalledTimes(1);

    fireEvent.mouseMove(root);
    expect(handleMouseMove).toHaveBeenCalledTimes(1);

    fireEvent.mouseLeave(root);
    expect(handleMouseLeave).toHaveBeenCalledTimes(1);
  });

  it("supports manual trigger with active prop toggle", () => {
    const { rerender, container } = render(<MatrixFx trigger="manual" active={false} />);
    expect(container.querySelector("canvas")).toBeInTheDocument();

    rerender(<MatrixFx trigger="manual" active={true} />);
    expect(container.querySelector("canvas")).toBeInTheDocument();

    rerender(<MatrixFx trigger="manual" active={false} />);
    expect(container.querySelector("canvas")).toBeInTheDocument();
  });

  it("renders with mount and instant triggers", () => {
    const { container: mountContainer } = render(<MatrixFx trigger="mount" />);
    expect(mountContainer.querySelector("canvas")).toBeInTheDocument();

    const { container: instantContainer } = render(<MatrixFx trigger="instant" flicker />);
    expect(instantContainer.querySelector("canvas")).toBeInTheDocument();
  });

  it("supports ripple and wave bulge configurations", () => {
    const { container: rippleContainer } = render(
      <MatrixFx
        bulge={{
          type: "ripple",
          duration: 2,
          intensity: 15,
          repeat: false,
          delay: 200,
        }}
      />,
    );
    expect(rippleContainer.querySelector("canvas")).toBeInTheDocument();

    const { container: waveContainer } = render(
      <MatrixFx
        bulge={{
          type: "wave",
          duration: 3,
          intensity: 12,
          repeat: true,
        }}
      />,
    );
    expect(waveContainer.querySelector("canvas")).toBeInTheDocument();
  });

  it("supports revealFrom directions", () => {
    const directions = ["center", "top", "bottom", "left", "right"] as const;

    directions.forEach((dir) => {
      const { container } = render(<MatrixFx revealFrom={dir} trigger="instant" />);
      expect(container.querySelector("canvas")).toBeInTheDocument();
    });
  });

  it("respects reducedMotion=true by disabling animation loop", () => {
    const rafSpy = vi.spyOn(window, "requestAnimationFrame");
    render(<MatrixFx reducedMotion={true} />);

    // With reducedMotion active, requestAnimationFrame should not be scheduled
    expect(rafSpy).not.toHaveBeenCalled();
    rafSpy.mockRestore();
  });
});
