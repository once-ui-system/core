import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Mask, maskVariants } from "../components/Mask";

describe("Mask", () => {
  beforeEach(() => {
    class MockIntersectionObserver {
      callback: IntersectionObserverCallback;
      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback;
      }
      observe = vi.fn((el: HTMLElement) => {
        this.callback(
          [
            {
              isIntersecting: true,
              target: el,
            } as unknown as IntersectionObserverEntry,
          ],
          this as unknown as IntersectionObserver,
        );
      });
      unobserve = vi.fn();
      disconnect = vi.fn();
    }

    window.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exports maskVariants with CSS mask utilities", () => {
    const variants = maskVariants();
    expect(variants).toContain("[mask-size:100%_100%]");
    expect(variants).toContain("[-webkit-mask-size:100%_100%]");
    expect(variants).toContain("[mask-image:radial-gradient");
    expect(variants).toContain("[-webkit-mask-image:radial-gradient");
  });

  it("renders children inside masked container", () => {
    const { container } = render(
      <Mask>
        <span>Masked Content</span>
      </Mask>,
    );
    const maskEl = container.firstChild as HTMLElement;

    expect(maskEl).toBeInTheDocument();
    expect(maskEl).toHaveClass("w-full", "h-full", "overflow-hidden");
    expect(screen.getByText("Masked Content")).toBeInTheDocument();
  });

  it("applies static coordinate CSS variables for x, y, and radius", () => {
    const { container } = render(
      <Mask x={30} y={40} radius={25}>
        <span>Content</span>
      </Mask>,
    );
    const maskEl = container.firstChild as HTMLElement;

    expect(maskEl.style.getPropertyValue("--mask-position-x")).toBe("30%");
    expect(maskEl.style.getPropertyValue("--mask-position-y")).toBe("40%");
    expect(maskEl.style.getPropertyValue("--mask-radius")).toBe("25vh");
  });

  it("uses default radius of 50vh when x and y are set without explicit radius", () => {
    const { container } = render(
      <Mask x={50} y={50}>
        <span>Content</span>
      </Mask>,
    );
    const maskEl = container.firstChild as HTMLElement;

    expect(maskEl.style.getPropertyValue("--mask-position-x")).toBe("50%");
    expect(maskEl.style.getPropertyValue("--mask-position-y")).toBe("50%");
    expect(maskEl.style.getPropertyValue("--mask-radius")).toBe("50vh");
  });

  it("applies initial cursor CSS variables when cursor prop is true", () => {
    const { container } = render(
      <Mask cursor radius={35}>
        <span>Content</span>
      </Mask>,
    );
    const maskEl = container.firstChild as HTMLElement;

    expect(maskEl.style.getPropertyValue("--mask-position-x")).toBe("0px");
    expect(maskEl.style.getPropertyValue("--mask-position-y")).toBe("0px");
    expect(maskEl.style.getPropertyValue("--mask-radius")).toBe("35vh");
  });

  it("forwards ref to the root HTMLDivElement", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Mask ref={ref}>
        <span>Content</span>
      </Mask>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("merges custom className and style", () => {
    const { container } = render(
      <Mask className="custom-mask-class" style={{ opacity: 0.8 }}>
        <span>Content</span>
      </Mask>,
    );
    const maskEl = container.firstChild as HTMLElement;

    expect(maskEl).toHaveClass("custom-mask-class");
    expect(maskEl.style.opacity).toBe("0.8");
  });

  it("passes Flex props to root element", () => {
    const { container } = render(
      <Mask background="surface" padding="16">
        <span>Content</span>
      </Mask>,
    );
    const maskEl = container.firstChild as HTMLElement;

    expect(maskEl).toHaveClass("bg-surface", "p-16");
  });

  it("attaches mousemove listener and cleans up on unmount when cursor is true", () => {
    const addEventSpy = vi.spyOn(document, "addEventListener");
    const removeEventSpy = vi.spyOn(document, "removeEventListener");

    const { unmount } = render(
      <Mask cursor>
        <span>Content</span>
      </Mask>,
    );

    expect(addEventSpy).toHaveBeenCalledWith("mousemove", expect.any(Function), {
      passive: true,
    });

    unmount();

    expect(removeEventSpy).toHaveBeenCalledWith("mousemove", expect.any(Function));
  });
});
