import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Animation } from "../components/Animation";

describe("Animation", () => {
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
  });

  it("renders active children animation with animated styles and custom props", () => {
    const { container } = render(
      <Animation
        active
        fade={0}
        scale={0.8}
        blur={4}
        slideUp={1}
        duration={400}
        easing="spring"
        transformOrigin="top left"
        className="custom-animation-class"
        style={{ color: "red" }}
      >
        <div>Animated Content</div>
      </Animation>,
    );

    const root = container.firstElementChild as HTMLElement;
    expect(screen.getByText("Animated Content")).toBeInTheDocument();
    expect(root).toHaveClass("custom-animation-class");
    expect(root.style.color).toBe("red");
    expect(root.style.transformOrigin).toBe("top left");
    expect(root.style.transition).toContain("400ms");
    expect(root.style.transition).toContain("cubic-bezier");
    expect(root.style.opacity).toBe("1");
    expect(root.style.filter).toBe("blur(0px)");
    expect(root.style.transform).toContain("scale(1)");
    expect(root.style.transform).toContain("translateY(0)");
  });

  it("applies inactive animation transforms when inactive by default", () => {
    const { container } = render(
      <Animation fade={0.2} scale={0.5} blur={10} slideDown={2} slideLeft={3}>
        <div>Inactive Content</div>
      </Animation>,
    );

    const root = container.firstElementChild as HTMLElement;
    expect(root.style.opacity).toBe("0.2");
    expect(root.style.filter).toBe("blur(10px)");
    expect(root.style.transform).toContain("scale(0.5)");
    expect(root.style.transform).toContain("translateY(-2rem)");
    expect(root.style.transform).toContain("translateX(3rem)");
  });

  it("inverts animation states when reverse is true", () => {
    const { container } = render(
      <Animation fade={0.2} scale={0.5} reverse>
        <div>Reversed Inactive Content</div>
      </Animation>,
    );

    const root = container.firstElementChild as HTMLElement;
    // When inactive (effectiveActive=false) and reverse=true, shouldAnimate=true (active visual state)
    expect(root.style.opacity).toBe("1");
    expect(root.style.transform).toContain("scale(1)");
  });

  it("supports slideRight, zoomIn, and zoomOut animation configs", () => {
    const { container } = render(
      <Animation active slideRight={1.5} zoomIn={1.2} zoomOut={0.8}>
        <div>Zoom and Slide</div>
      </Animation>,
    );

    const root = container.firstElementChild as HTMLElement;
    expect(root.style.transform).toContain("translateX(0)");
    expect(root.style.transform).toContain("scale(1.2)");
    expect(root.style.transform).toContain("scale(0.8)");
  });

  it("forwards ref to the wrapper HTMLDivElement", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Animation ref={ref}>
        <div>Ref Content</div>
      </Animation>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current?.textContent).toBe("Ref Content");
  });

  it("handles trigger in hover mode", () => {
    const { container } = render(
      <Animation trigger={<button type="button">Hover Button</button>} triggerType="hover" fade={0}>
        <div>Hover Popup Content</div>
      </Animation>,
    );

    expect(screen.getByRole("button", { name: "Hover Button" })).toBeInTheDocument();
    const triggerWrapper = container.querySelector("button")?.parentElement as HTMLElement;
    const content = screen.getByText("Hover Popup Content").parentElement as HTMLElement;

    // Initially inactive
    expect(content.style.opacity).toBe("0");
    expect(content.style.pointerEvents).toBe("none");

    // Hover trigger
    fireEvent.mouseEnter(triggerWrapper);
    expect(content.style.opacity).toBe("1");
    expect(content.style.pointerEvents).toBe("auto");

    // Leave container
    const root = container.firstElementChild as HTMLElement;
    fireEvent.mouseLeave(root);
    expect(content.style.opacity).toBe("0");
  });

  it("supports hover delay", () => {
    vi.useFakeTimers();

    render(
      <Animation trigger={<div>Delayed Trigger</div>} triggerType="hover" delay={300} fade={0}>
        <div>Delayed Content</div>
      </Animation>,
    );

    const triggerWrapper = screen.getByText("Delayed Trigger").parentElement as HTMLElement;
    const content = screen.getByText("Delayed Content").parentElement as HTMLElement;

    fireEvent.mouseEnter(triggerWrapper);
    expect(content.style.opacity).toBe("0");

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(content.style.opacity).toBe("1");

    vi.useRealTimers();
  });

  it("handles trigger in click mode", () => {
    render(
      <Animation trigger={<button type="button">Toggle</button>} triggerType="click" fade={0}>
        <div>Click Popup Content</div>
      </Animation>,
    );

    const triggerButton = screen.getByRole("button", { name: "Toggle" });
    const content = screen.getByText("Click Popup Content").parentElement as HTMLElement;

    expect(content.style.opacity).toBe("0");

    fireEvent.click(triggerButton.parentElement as HTMLElement);
    expect(content.style.opacity).toBe("1");

    fireEvent.click(triggerButton.parentElement as HTMLElement);
    expect(content.style.opacity).toBe("0");
  });

  it("respects controlled active prop", () => {
    const { rerender } = render(
      <Animation trigger={<div>Controlled Trigger</div>} active={false} fade={0}>
        <div>Controlled Content</div>
      </Animation>,
    );

    const content = screen.getByText("Controlled Content").parentElement as HTMLElement;
    expect(content.style.opacity).toBe("0");

    rerender(
      <Animation trigger={<div>Controlled Trigger</div>} active={true} fade={0}>
        <div>Controlled Content</div>
      </Animation>,
    );

    expect(content.style.opacity).toBe("1");
  });

  it("renders in portal mode when active", async () => {
    render(
      <Animation
        trigger={<button type="button">Portal Trigger</button>}
        triggerType="hover"
        portal
        placement="bottom"
        offsetDistance="16"
        className="portal-content-class"
      >
        <div data-testid="portal-content">Portal Popup</div>
      </Animation>,
    );

    const trigger = screen.getByRole("button", { name: "Portal Trigger" })
      .parentElement as HTMLElement;
    expect(screen.queryByTestId("portal-content")).not.toBeInTheDocument();

    fireEvent.mouseEnter(trigger);

    const portalContent = screen.getByTestId("portal-content");
    expect(portalContent).toBeInTheDocument();

    const portalWrapper = portalContent.parentElement as HTMLElement;
    expect(portalWrapper).toHaveClass("portal-content-class");
    expect(portalWrapper.parentElement).toBe(document.body);
  });

  it("handles touch device behavior with touch='disable' and touch='display'", () => {
    // Mock touch device
    vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
      matches: false, // pointer: fine is false
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    Object.defineProperty(window.navigator, "maxTouchPoints", {
      value: 5,
      configurable: true,
    });

    const { rerender } = render(
      <Animation trigger={<div>Touch Target</div>} triggerType="hover" touch="disable" fade={0}>
        <div>Touch Disabled Content</div>
      </Animation>,
    );

    const triggerWrapper = screen.getByText("Touch Target").parentElement as HTMLElement;
    fireEvent.mouseEnter(triggerWrapper);

    const disabledContent = screen.getByText("Touch Disabled Content").parentElement as HTMLElement;
    expect(disabledContent.style.opacity).toBe("0");

    rerender(
      <Animation trigger={<div>Touch Target</div>} triggerType="hover" touch="display" fade={0}>
        <div>Touch Display Content</div>
      </Animation>,
    );

    const displayContent = screen.getByText("Touch Display Content").parentElement as HTMLElement;
    expect(displayContent.style.opacity).toBe("1");
  });
});
