import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_CHARSET,
  defaultCharset,
  LetterFx,
  letterFxVariants,
  SPEED_SETTINGS,
} from "../components/LetterFx";

describe("LetterFx", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("renders text content directly into span element", () => {
    const { container } = render(<LetterFx>Hello Once UI</LetterFx>);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toBeInTheDocument();
    expect(root.tagName.toLowerCase()).toBe("span");
    expect(root).toHaveClass("inline-block");
    expect(root.textContent).toBe("Hello Once UI");
  });

  it("forwards ref to the root HTMLSpanElement", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<LetterFx ref={ref}>Ref Forwarding Test</LetterFx>);

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current?.textContent).toBe("Ref Forwarding Test");
  });

  it("merges custom className and style", () => {
    const { container } = render(
      <LetterFx className="custom-letter-class" style={{ letterSpacing: "2px" }}>
        Styled Text
      </LetterFx>,
    );
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass("custom-letter-class", "inline-block");
    expect(root.style.letterSpacing).toBe("2px");
  });

  it("supports number as children", () => {
    const { container } = render(<LetterFx>{42}</LetterFx>);
    const root = container.firstElementChild as HTMLElement;

    expect(root.textContent).toBe("42");
  });

  it("runs scramble animation automatically when trigger is 'instant'", async () => {
    const { container } = render(
      <LetterFx trigger="instant" speed="fast">
        Instant Text
      </LetterFx>,
    );
    const root = container.firstElementChild as HTMLElement;

    // Advance through random phase (INITIAL_RANDOM_DURATION = 100ms) + reveal phase
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });
    // Text should be randomized or partially revealed
    expect(root.textContent?.length).toBe("Instant Text".length);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    // Final text should be fully revealed
    expect(root.textContent).toBe("Instant Text");
  });

  it("triggers scramble animation on hover (mouseOver and focus)", async () => {
    const handleMouseOver = vi.fn();
    const handleFocus = vi.fn();

    const { container } = render(
      <LetterFx trigger="hover" speed="fast" onMouseOver={handleMouseOver} onFocus={handleFocus}>
        Hover Test
      </LetterFx>,
    );
    const root = container.firstElementChild as HTMLElement;

    expect(root.textContent).toBe("Hover Test");

    // Mouse over triggers animation and user callback
    await act(async () => {
      fireEvent.mouseOver(root);
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(handleMouseOver).toHaveBeenCalledTimes(1);
    expect(root.textContent).toBe("Hover Test");

    // Focus triggers animation and user callback
    await act(async () => {
      fireEvent.focus(root);
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(handleFocus).toHaveBeenCalledTimes(1);
    expect(root.textContent).toBe("Hover Test");
  });

  it("handles custom trigger with onTrigger callback", async () => {
    let triggerFunction: (() => void) | undefined;

    const { container } = render(
      <LetterFx
        trigger="custom"
        speed="fast"
        onTrigger={(fn) => {
          triggerFunction = fn;
        }}
      >
        Custom Trigger
      </LetterFx>,
    );
    const root = container.firstElementChild as HTMLElement;

    expect(triggerFunction).toBeDefined();
    expect(root.textContent).toBe("Custom Trigger");

    // Invoke trigger function
    await act(async () => {
      triggerFunction?.();
      await vi.advanceTimersByTimeAsync(50);
    });
    expect(root.textContent?.length).toBe("Custom Trigger".length);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(root.textContent).toBe("Custom Trigger");
  });

  it("uses custom charset string or array during animation", async () => {
    const customCharset = "XYZ";
    let triggerFunction: (() => void) | undefined;

    const { container } = render(
      <LetterFx
        trigger="custom"
        speed="fast"
        charset={customCharset}
        onTrigger={(fn) => {
          triggerFunction = fn;
        }}
      >
        AAA
      </LetterFx>,
    );
    const root = container.firstElementChild as HTMLElement;

    await act(async () => {
      triggerFunction?.();
      await vi.advanceTimersByTimeAsync(20);
    });

    // Check that characters belong to custom charset or final text
    const chars = (root.textContent || "").split("");
    for (const char of chars) {
      expect(["X", "Y", "Z", "A"]).toContain(char);
    }

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(root.textContent).toBe("AAA");
  });

  it("updates text when children prop changes", () => {
    const { rerender } = render(<LetterFx>Initial Text</LetterFx>);
    expect(screen.getByText("Initial Text")).toBeInTheDocument();

    rerender(<LetterFx>Updated Text</LetterFx>);
    expect(screen.getByText("Updated Text")).toBeInTheDocument();
  });

  it("handles unmount gracefully during active animation", async () => {
    const { unmount } = render(
      <LetterFx trigger="instant" speed="slow">
        Unmounting Component
      </LetterFx>,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });

    // Unmount while loop is in progress
    expect(() => unmount()).not.toThrow();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
  });

  it("exports letterFxVariants CVA function and constants", () => {
    expect(letterFxVariants()).toBe("inline-block");
    expect(letterFxVariants({ className: "extra-class" })).toContain("inline-block");
    expect(letterFxVariants({ className: "extra-class" })).toContain("extra-class");
    expect(defaultCharset).toEqual(DEFAULT_CHARSET);
    expect(defaultCharset.length).toBeGreaterThan(0);
    expect(SPEED_SETTINGS.fast.BASE_DELAY).toBe(10);
    expect(SPEED_SETTINGS.medium.BASE_DELAY).toBe(30);
    expect(SPEED_SETTINGS.slow.BASE_DELAY).toBe(60);
  });
});
