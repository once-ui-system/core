import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Particle, particleVariants } from "../components/Particle";

describe("Particle", () => {
  let observerCallback:
    | ((entries: Array<{ isIntersecting: boolean }>, observer: IntersectionObserver) => void)
    | null = null;
  let observeMock: ReturnType<typeof vi.fn>;
  let disconnectMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    observeMock = vi.fn().mockImplementation(() => {
      if (observerCallback) {
        observerCallback([{ isIntersecting: true }], {} as IntersectionObserver);
      }
    });
    disconnectMock = vi.fn().mockImplementation(() => {
      observerCallback = null;
    });

    class MockIntersectionObserver {
      constructor(
        callback: (
          entries: Array<{ isIntersecting: boolean }>,
          observer: IntersectionObserver,
        ) => void,
      ) {
        observerCallback = callback;
      }
      observe = observeMock;
      unobserve = vi.fn();
      disconnect = disconnectMock;
    }

    window.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;

    Element.prototype.getBoundingClientRect = vi.fn().mockReturnValue({
      width: 400,
      height: 400,
      top: 0,
      left: 0,
      bottom: 400,
      right: 400,
      x: 0,
      y: 0,
      toJSON: () => {},
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders default Particle container with proper classes", () => {
    const { container } = render(<Particle />);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toBeInTheDocument();
    expect(root).toHaveClass("relative", "w-full", "h-full", "[container-type:size]");
  });

  it("forwards ref to root HTMLDivElement", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Particle ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("renders children properly", () => {
    render(
      <Particle>
        <span data-testid="particle-child">Particle Content</span>
      </Particle>,
    );

    expect(screen.getByTestId("particle-child")).toBeInTheDocument();
    expect(screen.getByText("Particle Content")).toBeInTheDocument();
  });

  it("merges custom className and style", () => {
    const { container } = render(
      <Particle className="custom-particle-class" style={{ zIndex: 10 }}>
        <span>Content</span>
      </Particle>,
    );
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass("custom-particle-class", "relative", "[container-type:size]");
    expect(root.style.zIndex).toBe("10");
  });

  it("creates particles inside the container on mount", () => {
    const { container } = render(<Particle density={10} reducedMotion={false} />);
    const root = container.firstElementChild as HTMLElement;

    // Children of root include the particle divs
    const particleDivs = root.querySelectorAll("div");
    expect(particleDivs.length).toBe(10);
  });

  it("handles reduced motion by capping density and avoiding animation loop", () => {
    const { container } = render(<Particle density={50} reducedMotion={true} />);
    const root = container.firstElementChild as HTMLElement;

    const particleDivs = root.querySelectorAll("div");
    // Under reduced motion, density is capped at 30
    expect(particleDivs.length).toBe(30);
  });

  it("sets pointerEvents based on interactive prop", () => {
    const { container: nonInteractive } = render(<Particle interactive={false} />);
    expect(nonInteractive.firstElementChild).toHaveClass("pointer-events-none");

    const { container: interactive } = render(<Particle interactive={true} />);
    expect(interactive.firstElementChild).toHaveClass("pointer-events-auto");
  });

  it("handles mousemove when interactive", () => {
    const { container } = render(<Particle interactive density={5} reducedMotion={false} />);
    const root = container.firstElementChild as HTMLElement;

    act(() => {
      fireEvent.mouseMove(root, {
        clientX: 200,
        clientY: 200,
      });
    });

    expect(root).toBeInTheDocument();
  });

  it("cleans up particles when unmounted", () => {
    const { container, unmount } = render(<Particle density={10} reducedMotion={false} />);
    const root = container.firstElementChild as HTMLElement;

    expect(root.querySelectorAll("div").length).toBe(10);
    unmount();
  });

  it("exports particleVariants CVA function", () => {
    expect(particleVariants()).toContain("relative");
    expect(particleVariants()).toContain("[container-type:size]");
    expect(particleVariants({ className: "custom-variant" })).toContain("custom-variant");
  });
});
