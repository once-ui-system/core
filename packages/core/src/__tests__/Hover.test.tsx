import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Hover } from "../components/Hover";

describe("Hover", () => {
  beforeEach(() => {
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
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("renders trigger element and does not display overlay by default", () => {
    render(<Hover trigger={<div>Hover Trigger</div>} overlay={<div>Overlay Content</div>} />);

    expect(screen.getByText("Hover Trigger")).toBeInTheDocument();
    expect(screen.queryByText("Overlay Content")).not.toBeInTheDocument();
  });

  it("shows overlay on mouseEnter and hides on mouseLeave with animate-fadeIn", () => {
    const { container } = render(
      <Hover
        trigger={<div>Hover Target</div>}
        overlay={<div data-testid="overlay-box">Visible Overlay</div>}
      />,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    fireEvent.mouseEnter(wrapper);

    const overlay = screen.getByTestId("overlay-box");
    expect(overlay).toBeInTheDocument();
    expect(overlay.parentElement).toHaveClass(
      "animate-fadeIn",
      "pointer-events-none",
      "absolute",
      "top-0",
      "left-0",
      "right-0",
      "bottom-0",
    );

    fireEvent.mouseLeave(wrapper);
    expect(screen.queryByTestId("overlay-box")).not.toBeInTheDocument();
  });

  it("shows overlay on focus and hides on blur", () => {
    const { container } = render(
      <Hover
        trigger={<button type="button">Focus Button</button>}
        overlay={<div>Focused Overlay</div>}
      />,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    fireEvent.focus(wrapper);
    expect(screen.getByText("Focused Overlay")).toBeInTheDocument();

    fireEvent.blur(wrapper);
    expect(screen.queryByText("Focused Overlay")).not.toBeInTheDocument();
  });

  it("respects delay and hideDelay props", () => {
    vi.useFakeTimers();

    const { container } = render(
      <Hover
        delay={300}
        hideDelay={200}
        trigger={<div>Delayed Trigger</div>}
        overlay={<div>Delayed Overlay</div>}
      />,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    fireEvent.mouseEnter(wrapper);

    // Should not show immediately
    expect(screen.queryByText("Delayed Overlay")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(screen.queryByText("Delayed Overlay")).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByText("Delayed Overlay")).toBeInTheDocument();

    // Mouse leave with hide delay
    fireEvent.mouseLeave(wrapper);
    expect(screen.getByText("Delayed Overlay")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(199);
    });
    expect(screen.getByText("Delayed Overlay")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByText("Delayed Overlay")).not.toBeInTheDocument();
  });

  it("does not show overlay when disabled", () => {
    const { container } = render(
      <Hover
        disabled={true}
        trigger={<div>Disabled Trigger</div>}
        overlay={<div>Disabled Overlay</div>}
      />,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    fireEvent.mouseEnter(wrapper);
    expect(screen.queryByText("Disabled Overlay")).not.toBeInTheDocument();

    fireEvent.focus(wrapper);
    expect(screen.queryByText("Disabled Overlay")).not.toBeInTheDocument();
  });

  it("applies pointer-events-auto when interactive is true", () => {
    const { container } = render(
      <Hover
        interactive={true}
        trigger={<div>Interactive Trigger</div>}
        overlay={<button type="button">Action Inside Overlay</button>}
      />,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    fireEvent.mouseEnter(wrapper);

    const btn = screen.getByRole("button", { name: "Action Inside Overlay" });
    expect(btn).toBeInTheDocument();
    expect(btn.parentElement).toHaveClass("pointer-events-auto");
  });

  it("handles touch modes correctly", () => {
    // Mock touch device (hasTouch: true, hasPointer: false)
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

    // touch="display" should always show overlay
    const { rerender } = render(
      <Hover
        touch="display"
        trigger={<div>Touch Target</div>}
        overlay={<div>Touch Display Overlay</div>}
      />,
    );
    expect(screen.getByText("Touch Display Overlay")).toBeInTheDocument();

    // touch="disable" should never show overlay
    rerender(
      <Hover
        touch="disable"
        trigger={<div>Touch Target</div>}
        overlay={<div>Touch Display Overlay</div>}
      />,
    );
    expect(screen.queryByText("Touch Display Overlay")).not.toBeInTheDocument();
  });

  it("forwards ref to the wrapper HTMLDivElement", () => {
    const ref = createRef<HTMLDivElement>();
    render(<Hover ref={ref} trigger={<div>Ref Trigger</div>} overlay={<div>Ref Overlay</div>} />);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it("applies custom className, style, and renders extra children", () => {
    const { container } = render(
      <Hover
        className="custom-hover-wrapper"
        style={{ opacity: 0.95 }}
        trigger={<div>Trigger</div>}
        overlay={<div>Overlay</div>}
      >
        <span data-testid="extra-child">Extra Child</span>
      </Hover>,
    );

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-hover-wrapper");
    expect(wrapper.style.opacity).toBe("0.95");
    expect(screen.getByTestId("extra-child")).toBeInTheDocument();
  });
});
