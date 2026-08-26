import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WeatherFx, weatherFxVariants } from "../components/WeatherFx";

describe("WeatherFx", () => {
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
      bezierCurveTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      createLinearGradient: vi.fn().mockReturnValue({
        addColorStop: vi.fn(),
      }),
      globalAlpha: 1,
      fillStyle: "#000",
      strokeStyle: "#000",
      lineWidth: 1,
      lineCap: "round",
      lineJoin: "round",
      shadowBlur: 0,
      shadowColor: "#000",
    } as unknown as CanvasRenderingContext2D);
  });

  it("renders WeatherFx container and canvas element", () => {
    const { container } = render(<WeatherFx />);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toBeInTheDocument();
    expect(root).toHaveClass("relative", "overflow-hidden", "w-full", "h-full");

    const canvas = root.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveClass("pointer-events-none", "absolute", "inset-0", "size-full");
  });

  it("forwards ref to the root HTMLDivElement", () => {
    const ref = createRef<HTMLDivElement>();
    render(<WeatherFx ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("renders children properly", () => {
    render(
      <WeatherFx>
        <div data-testid="weather-child">Weather Forecast</div>
      </WeatherFx>,
    );

    expect(screen.getByTestId("weather-child")).toBeInTheDocument();
    expect(screen.getByText("Weather Forecast")).toBeInTheDocument();
  });

  it("merges custom className and style", () => {
    const { container } = render(<WeatherFx className="custom-weather" style={{ opacity: 0.8 }} />);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass("custom-weather", "relative", "overflow-hidden");
    expect(root.style.opacity).toBe("0.8");
  });

  it("exports weatherFxVariants CVA function", () => {
    expect(weatherFxVariants()).toContain("relative");
    expect(weatherFxVariants()).toContain("overflow-hidden");
    expect(weatherFxVariants({ className: "extra-class" })).toContain("extra-class");
  });

  it("renders snow type without crashing", () => {
    const { container } = render(<WeatherFx type="snow" intensity={20} speed={1.5} />);
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });

  it("renders leaves type without crashing", () => {
    const { container } = render(<WeatherFx type="leaves" angle={15} intensity={10} />);
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });

  it("renders lightning type without crashing", () => {
    const { container } = render(<WeatherFx type="lightning" intensity={40} />);
    const canvas = container.querySelector("canvas");
    expect(canvas).toBeInTheDocument();
  });

  it("supports click trigger and invokes onClick callback", () => {
    const handleClick = vi.fn();
    const { container } = render(<WeatherFx trigger="click" onClick={handleClick} />);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass("cursor-interactive");

    fireEvent.click(root, { clientX: 100, clientY: 50 });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("handles mouseEnter and mouseLeave events and calls callbacks", () => {
    const handleMouseEnter = vi.fn();
    const handleMouseLeave = vi.fn();

    const { container } = render(
      <WeatherFx trigger="hover" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} />,
    );
    const root = container.firstElementChild as HTMLElement;

    fireEvent.mouseEnter(root);
    expect(handleMouseEnter).toHaveBeenCalledTimes(1);

    fireEvent.mouseLeave(root);
    expect(handleMouseLeave).toHaveBeenCalledTimes(1);
  });

  it("supports manual trigger with active prop toggle", () => {
    const { rerender, container } = render(<WeatherFx trigger="manual" active={false} />);
    expect(container.querySelector("canvas")).toBeInTheDocument();

    rerender(<WeatherFx trigger="manual" active={true} />);
    expect(container.querySelector("canvas")).toBeInTheDocument();
  });

  it("respects reducedMotion=true by disabling animations", () => {
    const rafSpy = vi.spyOn(window, "requestAnimationFrame");
    render(<WeatherFx reducedMotion={true} />);

    expect(rafSpy).not.toHaveBeenCalled();
    rafSpy.mockRestore();
  });
});
