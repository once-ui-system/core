import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CelebrationFx, celebrationFxVariants } from "../components/CelebrationFx";

describe("CelebrationFx", () => {
  beforeEach(() => {
    // Mock getBoundingClientRect
    Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
      width: 500,
      height: 300,
      top: 0,
      left: 0,
      bottom: 300,
      right: 500,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    // Mock HTMLCanvasElement getContext
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      setTransform: vi.fn(),
      scale: vi.fn(),
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      globalAlpha: 1,
      fillStyle: "#000",
    } as unknown as CanvasRenderingContext2D);
  });

  it("renders CelebrationFx container and canvas element", () => {
    const { container } = render(<CelebrationFx />);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toBeInTheDocument();
    expect(root).toHaveClass("relative", "overflow-hidden", "w-full", "h-full");

    const canvas = root.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveClass("pointer-events-none", "absolute", "inset-0", "size-full");
  });

  it("forwards ref to the root HTMLDivElement", () => {
    const ref = createRef<HTMLDivElement>();
    render(<CelebrationFx ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("renders children properly", () => {
    render(
      <CelebrationFx>
        <div data-testid="celebration-child">Winner Winner!</div>
      </CelebrationFx>,
    );

    expect(screen.getByTestId("celebration-child")).toBeInTheDocument();
    expect(screen.getByText("Winner Winner!")).toBeInTheDocument();
  });

  it("merges custom className and style", () => {
    const { container } = render(
      <CelebrationFx className="custom-celebration" style={{ opacity: 0.9 }} />,
    );
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass("custom-celebration", "relative", "overflow-hidden");
    expect(root.style.opacity).toBe("0.9");
  });

  it("exports celebrationFxVariants CVA function", () => {
    expect(celebrationFxVariants()).toContain("relative");
    expect(celebrationFxVariants()).toContain("overflow-hidden");
    expect(celebrationFxVariants({ className: "extra-class" })).toContain("extra-class");
  });

  it("renders fireworks type without crashing", () => {
    const { container } = render(<CelebrationFx type="fireworks" />);
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });

  it("supports click trigger and invokes onClick callback", () => {
    const handleClick = vi.fn();
    const { container } = render(<CelebrationFx trigger="click" onClick={handleClick} />);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass("cursor-interactive");

    fireEvent.click(root, { clientX: 100, clientY: 50 });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("supports fireworks click trigger", () => {
    const handleClick = vi.fn();
    const { container } = render(
      <CelebrationFx type="fireworks" trigger="click" onClick={handleClick} />,
    );
    const root = container.firstElementChild as HTMLElement;

    fireEvent.click(root, { clientX: 150, clientY: 80 });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("handles mouseEnter and mouseLeave events and calls callbacks", () => {
    const handleMouseEnter = vi.fn();
    const handleMouseLeave = vi.fn();

    const { container } = render(
      <CelebrationFx
        trigger="hover"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />,
    );
    const root = container.firstElementChild as HTMLElement;

    fireEvent.mouseEnter(root);
    expect(handleMouseEnter).toHaveBeenCalledTimes(1);

    fireEvent.mouseLeave(root);
    expect(handleMouseLeave).toHaveBeenCalledTimes(1);
  });

  it("supports manual trigger with active prop toggle", () => {
    const { rerender, container } = render(<CelebrationFx trigger="manual" active={false} />);
    expect(container.querySelector("canvas")).toBeInTheDocument();

    rerender(<CelebrationFx trigger="manual" active={true} />);
    expect(container.querySelector("canvas")).toBeInTheDocument();
  });

  it("respects reducedMotion=true by disabling animations", () => {
    const rafSpy = vi.spyOn(window, "requestAnimationFrame");
    render(<CelebrationFx reducedMotion={true} />);

    // With reducedMotion active, requestAnimationFrame should not be invoked
    expect(rafSpy).not.toHaveBeenCalled();
    rafSpy.mockRestore();
  });
});
