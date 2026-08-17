import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { Cursor } from "../components/Cursor";

describe("Cursor", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
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
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  });

  it("renders hidden span initially and does not show portal", () => {
    const { container } = render(
      <div>
        <Cursor cursor={<div data-testid="custom-cursor">Custom Pointer</div>} />
        <span>Content</span>
      </div>,
    );

    const hiddenSpan = container.querySelector("span[style*='display: none']");
    expect(hiddenSpan).toBeInTheDocument();
    expect(screen.queryByTestId("custom-cursor")).not.toBeInTheDocument();
  });

  it("shows custom cursor on parent hover for non-touch devices", () => {
    render(
      <div data-testid="parent-container">
        <Cursor cursor={<div data-testid="custom-cursor">Custom Pointer</div>} />
        <span>Hover Target</span>
      </div>,
    );

    const parent = screen.getByTestId("parent-container");
    fireEvent.mouseEnter(parent);

    expect(screen.getByTestId("custom-cursor")).toBeInTheDocument();

    fireEvent.mouseLeave(parent);
    expect(screen.queryByTestId("custom-cursor")).not.toBeInTheDocument();
  });

  it("supports elementRef prop to track hover on a specified target element", () => {
    const target = document.createElement("div");
    document.body.appendChild(target);
    const elementRef = { current: target };

    render(
      <div>
        <Cursor
          elementRef={elementRef}
          cursor={<div data-testid="custom-cursor">Target Pointer</div>}
        />
      </div>,
    );

    fireEvent.mouseEnter(target);
    expect(screen.getByTestId("custom-cursor")).toBeInTheDocument();

    fireEvent.mouseLeave(target);
    expect(screen.queryByTestId("custom-cursor")).not.toBeInTheDocument();

    document.body.removeChild(target);
  });

  it("updates position on mouse move", () => {
    render(
      <div data-testid="parent-container">
        <Cursor cursor={<div data-testid="custom-cursor">Custom Pointer</div>} />
      </div>,
    );

    const parent = screen.getByTestId("parent-container");
    fireEvent.mouseEnter(parent);

    const cursor = screen.getByTestId("custom-cursor");
    const portalFlex = cursor.parentElement as HTMLElement;
    expect(portalFlex).toBeInTheDocument();

    fireEvent.mouseMove(document, { clientX: 120, clientY: 250 });
    expect(portalFlex.style.left).toBe("120px");
    expect(portalFlex.style.top).toBe("250px");
  });

  it("does not render cursor portal on touch devices", () => {
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

    render(
      <div data-testid="parent-container">
        <Cursor cursor={<div data-testid="custom-cursor">Custom Pointer</div>} />
      </div>,
    );

    const parent = screen.getByTestId("parent-container");
    fireEvent.mouseEnter(parent);

    expect(screen.queryByTestId("custom-cursor")).not.toBeInTheDocument();
  });

  it("forwards ref to the portal Flex element and applies custom classes and styles", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <div data-testid="parent-container">
        <Cursor
          ref={ref}
          cursor={<div>Ref Cursor</div>}
          className="custom-cursor-class"
          style={{ opacity: 0.8 }}
          zIndex={5}
        />
      </div>,
    );

    const parent = screen.getByTestId("parent-container");
    fireEvent.mouseEnter(parent);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass("custom-cursor-class");
    expect(ref.current?.style.opacity).toBe("0.8");
  });
});
