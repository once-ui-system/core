import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HoloFx, holoFxOverlayVariants, holoFxVariants } from "../components/HoloFx";

describe("HoloFx", () => {
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

  it("renders default HoloFx container with proper classes", () => {
    const { container } = render(<HoloFx />);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toBeInTheDocument();
    expect(root).toHaveClass("isolate", "z-0", "group/holo", "relative", "overflow-hidden");
  });

  it("forwards ref to root HTMLDivElement", () => {
    const ref = createRef<HTMLDivElement>();
    render(<HoloFx ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("renders children in base and overlays", () => {
    render(
      <HoloFx>
        <span data-testid="holo-child">Holographic Card</span>
      </HoloFx>,
    );

    const children = screen.getAllByTestId("holo-child");
    // Main child layer + burn overlay + shine overlay = 3 occurrences
    expect(children).toHaveLength(3);
    expect(children[0]).toBeInTheDocument();
  });

  it("merges custom className and style", () => {
    const { container } = render(
      <HoloFx className="custom-holo-class" style={{ zIndex: 10 }}>
        <span>Content</span>
      </HoloFx>,
    );
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass("custom-holo-class", "isolate", "group/holo");
    expect(root.style.zIndex).toBe("10");
  });

  it("renders burn, shine, and texture layers with default styles", () => {
    const { container } = render(
      <HoloFx>
        <span>Content</span>
      </HoloFx>,
    );
    const root = container.firstElementChild as HTMLElement;
    const layers = root.querySelectorAll(":scope > div");

    // Base, Burn, Shine, Texture = 4 layers
    expect(layers.length).toBe(4);

    const burnLayer = layers[1] as HTMLElement;
    const shineLayer = layers[2] as HTMLElement;
    const textureLayer = layers[3] as HTMLElement;

    // Overlay classes
    expect(burnLayer).toHaveClass("opacity-0", "pointer-events-none");
    expect(shineLayer).toHaveClass("opacity-0", "pointer-events-none");
    expect(textureLayer).toHaveClass("opacity-0", "pointer-events-none");

    // Default styles
    expect(burnLayer.style.getPropertyValue("--burn-opacity")).toBe("30%");
    expect(burnLayer.style.filter).toBe("brightness(0.2) contrast(2)");
    expect(burnLayer.style.mixBlendMode).toBe("color-dodge");

    expect(shineLayer.style.getPropertyValue("--shine-opacity")).toBe("30%");
    expect(shineLayer.style.mixBlendMode).toBe("color-dodge");

    expect(textureLayer.style.getPropertyValue("--texture-opacity")).toBe("10%");
    expect(textureLayer.style.backgroundImage).toContain("repeating-linear-gradient");
    expect(textureLayer.style.mixBlendMode).toBe("color-dodge");
  });

  it("applies custom burn, shine, and texture props", () => {
    const { container } = render(
      <HoloFx
        burn={{
          opacity: 50,
          filter: "brightness(0.5)",
          blending: "multiply",
          mask: { maskPosition: "50 50" },
        }}
        shine={{
          opacity: 80,
          blending: "screen",
          filter: "blur(2px)",
          mask: { maskPosition: "80 120" },
        }}
        texture={{
          opacity: 25,
          image: "url(/foil.png)",
          blending: "overlay",
          mask: { maskPosition: "20 40" },
        }}
      >
        <span>Content</span>
      </HoloFx>,
    );
    const root = container.firstElementChild as HTMLElement;
    const layers = root.querySelectorAll(":scope > div");

    const burnLayer = layers[1] as HTMLElement;
    const shineLayer = layers[2] as HTMLElement;
    const textureLayer = layers[3] as HTMLElement;

    expect(burnLayer.style.getPropertyValue("--burn-opacity")).toBe("50%");
    expect(burnLayer.style.filter).toBe("brightness(0.5)");
    expect(burnLayer.style.mixBlendMode).toBe("multiply");
    expect(burnLayer.style.maskImage).toContain("radial-gradient");

    expect(shineLayer.style.getPropertyValue("--shine-opacity")).toBe("80%");
    expect(shineLayer.style.mixBlendMode).toBe("screen");
    expect(shineLayer.style.filter).toBe("blur(2px)");
    expect(shineLayer.style.maskImage).toContain("radial-gradient");

    expect(textureLayer.style.getPropertyValue("--texture-opacity")).toBe("25%");
    expect(textureLayer.style.backgroundImage).toContain("/foil.png");
    expect(textureLayer.style.mixBlendMode).toBe("overlay");
    expect(textureLayer.style.maskImage).toContain("radial-gradient");
  });

  it("updates CSS custom properties on mousemove when active", () => {
    const { container } = render(
      <HoloFx reducedMotion={false}>
        <span>Interactive</span>
      </HoloFx>,
    );
    const root = container.firstElementChild as HTMLElement;

    act(() => {
      fireEvent.mouseMove(document, {
        clientX: 300,
        clientY: 300,
      });
    });

    expect(root.style.getPropertyValue("--gradient-pos-x")).toBe("50%");
    expect(root.style.getPropertyValue("--gradient-pos-y")).toBe("50%");
  });

  it("exports holoFxVariants and holoFxOverlayVariants CVA functions", () => {
    expect(holoFxVariants()).toContain("isolate");
    expect(holoFxVariants()).toContain("group/holo");
    expect(holoFxVariants({ className: "custom-variant" })).toContain("custom-variant");

    expect(holoFxOverlayVariants({ layer: "burn" })).toContain(
      "group-hover/holo:opacity-[var(--burn-opacity)]",
    );
    expect(holoFxOverlayVariants({ layer: "shine" })).toContain(
      "group-hover/holo:opacity-[var(--shine-opacity,var(--light-opacity))]",
    );
    expect(holoFxOverlayVariants({ layer: "texture" })).toContain(
      "group-hover/holo:opacity-[var(--texture-opacity)]",
    );
  });
});
