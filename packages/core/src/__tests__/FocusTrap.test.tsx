import { fireEvent, render, screen } from "@testing-library/react";
import { createRef, useRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { FocusTrap } from "../components/FocusTrap";

describe("FocusTrap", () => {
  it("renders children and applies custom className and style", () => {
    const { container } = render(
      <FocusTrap active={false} className="custom-trap" style={{ opacity: 0.8 }}>
        <button type="button">Inside Button</button>
      </FocusTrap>,
    );

    expect(screen.getByText("Inside Button")).toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass("custom-trap");
    expect((container.firstElementChild as HTMLElement).style.opacity).toBe("0.8");
    expect(container.firstElementChild).toHaveAttribute("tabIndex", "-1");
  });

  it("auto-focuses the first focusable element when active is true", () => {
    render(
      <FocusTrap active={true}>
        <button type="button">First</button>
        <button type="button">Second</button>
      </FocusTrap>,
    );

    const firstButton = screen.getByRole("button", { name: "First" });
    expect(document.activeElement).toBe(firstButton);
  });

  it("focuses initialFocusRef when provided", () => {
    const TestComponent = () => {
      const secondRef = useRef<HTMLButtonElement>(null);
      return (
        <FocusTrap active={true} initialFocusRef={secondRef}>
          <button type="button">First</button>
          <button ref={secondRef} type="button">
            Second
          </button>
        </FocusTrap>
      );
    };

    render(<TestComponent />);
    const secondButton = screen.getByRole("button", { name: "Second" });
    expect(document.activeElement).toBe(secondButton);
  });

  it("focuses the container itself when no focusable elements are present", () => {
    const { container } = render(
      <FocusTrap active={true}>
        <div>No interactive elements</div>
      </FocusTrap>,
    );

    expect(document.activeElement).toBe(container.firstElementChild);
  });

  it("restores focus to previous element when deactivated", () => {
    const TestComponent = () => {
      const [active, setActive] = useState(false);
      return (
        <div>
          <button type="button" onClick={() => setActive(true)}>
            Outside Button
          </button>
          <FocusTrap active={active}>
            <button type="button" onClick={() => setActive(false)}>
              Close Trap
            </button>
          </FocusTrap>
        </div>
      );
    };

    render(<TestComponent />);
    const outsideButton = screen.getByRole("button", { name: "Outside Button" });
    outsideButton.focus();
    expect(document.activeElement).toBe(outsideButton);

    fireEvent.click(outsideButton);
    const closeButton = screen.getByRole("button", { name: "Close Trap" });
    expect(document.activeElement).toBe(closeButton);

    fireEvent.click(closeButton);
    expect(document.activeElement).toBe(outsideButton);
  });

  it("restores focus to returnFocusRef when provided", () => {
    const TestComponent = () => {
      const [active, setActive] = useState(true);
      const targetRef = useRef<HTMLButtonElement>(null);

      return (
        <div>
          <button ref={targetRef} type="button">
            Specific Return Target
          </button>
          <FocusTrap active={active} returnFocusRef={targetRef}>
            <button type="button" onClick={() => setActive(false)}>
              Deactivate
            </button>
          </FocusTrap>
        </div>
      );
    };

    render(<TestComponent />);
    const deactivateButton = screen.getByRole("button", { name: "Deactivate" });
    fireEvent.click(deactivateButton);

    const targetButton = screen.getByRole("button", { name: "Specific Return Target" });
    expect(document.activeElement).toBe(targetButton);
  });

  it("traps Tab key navigation by wrapping around from last to first element", () => {
    const { container } = render(
      <FocusTrap active={true}>
        <button type="button">First</button>
        <button type="button">Second</button>
      </FocusTrap>,
    );

    const firstButton = screen.getByRole("button", { name: "First" });
    const secondButton = screen.getByRole("button", { name: "Second" });

    secondButton.focus();
    expect(document.activeElement).toBe(secondButton);

    const trapDiv = container.firstElementChild as HTMLElement;
    fireEvent.keyDown(trapDiv, { key: "Tab" });
    expect(document.activeElement).toBe(firstButton);
  });

  it("traps Shift+Tab key navigation by wrapping around from first to last element", () => {
    const { container } = render(
      <FocusTrap active={true}>
        <button type="button">First</button>
        <button type="button">Second</button>
      </FocusTrap>,
    );

    const firstButton = screen.getByRole("button", { name: "First" });
    const secondButton = screen.getByRole("button", { name: "Second" });

    firstButton.focus();
    expect(document.activeElement).toBe(firstButton);

    const trapDiv = container.firstElementChild as HTMLElement;
    fireEvent.keyDown(trapDiv, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(secondButton);
  });

  it("calls onEscape callback when Escape is pressed while active", () => {
    const handleEscape = vi.fn();
    const { container } = render(
      <FocusTrap active={true} onEscape={handleEscape}>
        <button type="button">First</button>
      </FocusTrap>,
    );

    const trapDiv = container.firstElementChild as HTMLElement;
    fireEvent.keyDown(trapDiv, { key: "Escape" });
    expect(handleEscape).toHaveBeenCalledTimes(1);
  });

  it("does not call onEscape when active is false", () => {
    const handleEscape = vi.fn();
    const { container } = render(
      <FocusTrap active={false} onEscape={handleEscape}>
        <button type="button">First</button>
      </FocusTrap>,
    );

    const trapDiv = container.firstElementChild as HTMLElement;
    fireEvent.keyDown(trapDiv, { key: "Escape" });
    expect(handleEscape).not.toHaveBeenCalled();
  });

  it("does not intercept arrow keys", () => {
    const handleKeyDown = vi.fn();
    const { container } = render(
      <FocusTrap active={true} onKeyDown={handleKeyDown}>
        <button type="button">First</button>
      </FocusTrap>,
    );

    const trapDiv = container.firstElementChild as HTMLElement;
    fireEvent.keyDown(trapDiv, { key: "ArrowDown" });
    expect(handleKeyDown).toHaveBeenCalledTimes(1);
  });

  it("forwards ref to container element", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <FocusTrap ref={ref} active={false}>
        <span>Content</span>
      </FocusTrap>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});
