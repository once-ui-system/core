import { act, render } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TypeFx, typeFxCursorVariants, typeFxVariants } from "../components/TypeFx";

describe("TypeFx", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("renders with single word and types character by character", async () => {
    const { container } = render(<TypeFx words="Hello" speed={50} trigger="instant" />);
    const root = container.firstElementChild as HTMLElement;

    expect(root).toBeInTheDocument();
    expect(root).toHaveClass("inline-block");

    // Initially at 0ms, displayText is "" and cursor "|" is visible
    expect(root.textContent).toBe("|");

    // Advance 50ms (first char 'H')
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });
    expect(root.textContent).toBe("H|");

    // Advance 100ms ('He', 'Hel')
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(root.textContent).toBe("Hel|");

    // Advance until complete (300ms) -> 'Hello' without cursor (isComplete = true)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });
    expect(root.textContent).toBe("Hello");
  });

  it("forwards ref to the root element", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<TypeFx ref={ref} words="Ref Test" />);

    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
  });

  it("merges custom className and style", () => {
    const { container } = render(
      <TypeFx words="Custom" className="custom-typefx-class" style={{ letterSpacing: "1px" }} />,
    );
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveClass("custom-typefx-class", "inline-block");
    expect(root.style.letterSpacing).toBe("1px");
  });

  it("renders children prefix alongside typed text", async () => {
    const { container } = render(
      <TypeFx words="World" speed={50}>
        Hello{" "}
      </TypeFx>,
    );
    const root = container.firstElementChild as HTMLElement;

    // Advance to full word completion
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(root.textContent).toBe("Hello World");
  });

  it("handles delay before typing begins", async () => {
    const { container } = render(<TypeFx words="Delayed" speed={50} delay={200} />);
    const root = container.firstElementChild as HTMLElement;

    // At 100ms (during delay), nothing typed yet
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(root.textContent).toBe("|");

    // At 250ms (after delay + 1 char), 'D' is typed
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });
    expect(root.textContent).toBe("D|");
  });

  it("cycles through multiple words with typing, holding, deleting, and looping", async () => {
    const words = ["One", "Two"];
    const { container } = render(<TypeFx words={words} speed={50} hold={100} loop={true} />);
    const root = container.firstElementChild as HTMLElement;

    // Type "One" (4 steps * 50ms = 200ms)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(root.textContent).toBe("One|");

    // Hold (100ms)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(root.textContent).toBe("One|");

    // Delete "One" (backspace speed is 25ms: 4 steps * 25ms = 100ms) + gap (50ms)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });

    // Type "Two" (4 steps * 50ms = 200ms)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(root.textContent).toBe("Two|");
  });

  it("stops and completes when loop is false after cycling through words", async () => {
    const words = ["First", "Second"];
    const { container } = render(<TypeFx words={words} speed={20} hold={50} loop={false} />);
    const root = container.firstElementChild as HTMLElement;

    // Advance enough time for First (type + hold + delete) and Second (type + hold + delete)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    // Should finish loop and hide cursor
    expect(root.querySelector("span[aria-hidden='true']")).not.toBeInTheDocument();
  });

  it("handles custom trigger and restarts on subsequent triggers", async () => {
    let triggerFunction: (() => void) | undefined;

    const { container } = render(
      <TypeFx
        words="Custom Trigger"
        speed={50}
        trigger="custom"
        onTrigger={(fn: () => void) => {
          triggerFunction = fn;
        }}
      />,
    );
    const root = container.firstElementChild as HTMLElement;

    expect(triggerFunction).toBeDefined();

    // Before triggering, text is empty and cursor is hidden
    expect(root.textContent).toBe("");

    // Invoke trigger
    await act(async () => {
      triggerFunction?.();
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(root.textContent).toContain("C");

    // Advance to completion
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(root.textContent).toBe("Custom Trigger");

    // Trigger again to restart
    await act(async () => {
      triggerFunction?.();
      await vi.advanceTimersByTimeAsync(60);
    });
    expect(root.textContent).toBe("C|");
  });

  it("handles empty words array gracefully", async () => {
    const { container } = render(<TypeFx words={[]} />);
    const root = container.firstElementChild as HTMLElement;

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(root).toBeInTheDocument();
    expect(root.querySelector("span[aria-hidden='true']")).not.toBeInTheDocument();
  });

  it("handles unmount gracefully during active typing", async () => {
    const { unmount } = render(<TypeFx words="Unmounting" speed={100} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });

    expect(() => unmount()).not.toThrow();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
  });

  it("exports typeFxVariants and typeFxCursorVariants CVA functions", () => {
    expect(typeFxVariants()).toBe("inline-block");
    expect(typeFxVariants({ className: "extra" })).toContain("inline-block");
    expect(typeFxVariants({ className: "extra" })).toContain("extra");

    expect(typeFxCursorVariants()).toContain("opacity-50");
    expect(typeFxCursorVariants()).toContain("select-none");
    expect(typeFxCursorVariants({ className: "cursor-extra" })).toContain("cursor-extra");
  });
});
