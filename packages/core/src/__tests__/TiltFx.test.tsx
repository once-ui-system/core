import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TiltFx, tiltFxVariants } from "../components/TiltFx";

describe("TiltFx", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "Date"] });
    vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
      matches: query.includes("pointer: fine"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 1;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("renders default TiltFx container with transition and overflow-hidden classes", () => {
    const { container } = render(<TiltFx />);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toBeInTheDocument();
    expect(root).toHaveClass("transition-transform", "duration-300", "ease-out", "overflow-hidden");
  });

  it("forwards ref to the root HTMLDivElement", () => {
    const ref = createRef<HTMLDivElement>();
    render(<TiltFx ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("supports callback refs", () => {
    let node: HTMLDivElement | null = null;
    render(
      <TiltFx
        ref={(el) => {
          node = el;
        }}
      />,
    );

    expect(node).toBeInstanceOf(HTMLDivElement);
  });

  it("renders children properly", () => {
    render(
      <TiltFx>
        <div data-testid="tilt-child">Child Content</div>
      </TiltFx>,
    );

    expect(screen.getByTestId("tilt-child")).toBeInTheDocument();
    expect(screen.getByText("Child Content")).toBeInTheDocument();
  });

  it("merges custom className and style", () => {
    const { container } = render(
      <TiltFx className="custom-tilt-class" style={{ zIndex: 10 }}>
        <span>Content</span>
      </TiltFx>,
    );
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass("custom-tilt-class", "transition-transform");
    expect(root.style.zIndex).toBe("10");
  });

  it("exports tiltFxVariants CVA function", () => {
    expect(tiltFxVariants()).toContain("transition-transform duration-300 ease-out");
    expect(tiltFxVariants({ className: "custom-class" })).toContain("custom-class");
  });

  it("applies 3D tilt transform on mouse move and resets on mouse leave", () => {
    const onMouseMove = vi.fn();
    const onMouseLeave = vi.fn();

    const { container } = render(
      <TiltFx onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} intensity={2}>
        <div>Card</div>
      </TiltFx>,
    );
    const root = container.firstElementChild as HTMLElement;

    vi.spyOn(root, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      width: 200,
      height: 200,
      right: 200,
      bottom: 200,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    // Move to bottom-right corner (clientX: 200, clientY: 200)
    // deltaX = (200 - 100) / 100 = 1
    // deltaY = (200 - 100) / 100 = 1
    // rotateX = -1 * 2 * 2 = -4deg
    // rotateY = -1 * 2 * 2 = -4deg
    // translateZ = 30 * 2 = 60px
    fireEvent.mouseMove(root, { clientX: 200, clientY: 200 });

    expect(onMouseMove).toHaveBeenCalled();
    expect(root.style.transform).toBe(
      "perspective(1000px) translate3d(0, 0, 60px) rotateX(-4deg) rotateY(-4deg)",
    );

    // Mouse leave resets transform after timeout
    fireEvent.mouseLeave(root);
    expect(onMouseLeave).toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(root.style.transform).toBe(
      "perspective(1000px) translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg)",
    );
  });

  it("does not tilt when reducedMotion is true", () => {
    const { container } = render(
      <TiltFx reducedMotion={true}>
        <div>Card</div>
      </TiltFx>,
    );
    const root = container.firstElementChild as HTMLElement;

    vi.spyOn(root, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      width: 200,
      height: 200,
      right: 200,
      bottom: 200,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    fireEvent.mouseMove(root, { clientX: 200, clientY: 200 });
    expect(root.style.transform).toBe("");
  });

  it("does not tilt on touch devices without fine pointer", () => {
    vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    Object.defineProperty(window, "ontouchstart", { value: {}, configurable: true });

    const { container } = render(
      <TiltFx>
        <div>Card</div>
      </TiltFx>,
    );
    const root = container.firstElementChild as HTMLElement;

    vi.spyOn(root, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      width: 200,
      height: 200,
      right: 200,
      bottom: 200,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    fireEvent.mouseMove(root, { clientX: 200, clientY: 200 });
    expect(root.style.transform).toBe("");
  });
});
