import { act, render } from "@testing-library/react";
import type React from "react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FadingLettersFx } from "../components/FadingLettersFx";
import styles from "../components/FadingLettersFx.module.scss";
import { TypeFx } from "../components/TypeFx";
import { LayoutProvider } from "../contexts/LayoutProvider";
import { expectNoAxeViolations } from "../test/axe";
import { mockReducedMotion } from "../test/fxTestUtils";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const advance = async (ms: number) => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
};

/** What is typed so far, without the blinking cursor. */
const typed = (container: HTMLElement) => {
  // The typing is drawn in an aria-hidden span; screen readers get the words whole.
  const el = container.querySelector('[aria-hidden="true"]') as HTMLElement;
  const cursor = el.querySelector("span[style*='opacity']");
  return (el.textContent ?? "").slice(0, cursor ? -1 : undefined);
};
const hasCursor = (container: HTMLElement) =>
  Boolean(container.querySelector("span[style*='opacity']"));

/**
 * TypeFx types each word a letter per `speed` ms, holds it for `hold` ms,
 * deletes it at double speed and moves on, looping unless `loop` is false. A
 * single word is typed once and the cursor goes away.
 */
describe("TypeFx", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("types a single word once and drops the cursor", async () => {
    const { container } = render(<TypeFx words="Hello" speed={10} />, { wrapper });
    expect(hasCursor(container)).toBe(true);
    await advance(35);
    expect(typed(container)).toBe("Hel");
    await advance(100);
    expect(typed(container)).toBe("Hello");
    expect(hasCursor(container)).toBe(false);
    vi.useRealTimers();
    await expectNoAxeViolations(container);
  });

  it("waits for `delay` before typing", async () => {
    const { container } = render(<TypeFx words="Hi" speed={10} delay={200} />, { wrapper });
    await advance(150);
    expect(typed(container)).toBe("");
    await advance(100);
    expect(typed(container)).toBe("Hi");
  });

  it("cycles through words: type, hold, delete, next, and loops", async () => {
    const { container } = render(<TypeFx words={["ab", "cd"]} speed={10} hold={100} />, {
      wrapper,
    });
    await advance(25);
    expect(typed(container)).toBe("ab");
    await advance(90);
    expect(typed(container)).toBe("ab");
    await advance(60); // deleting at 5ms a letter, then a 10ms pause
    await advance(25);
    expect(typed(container)).toBe("cd");
    await advance(100 + 15 + 10 + 25);
    expect(typed(container)).toBe("ab");
  });

  it("stops after the last word without loop", async () => {
    const { container } = render(
      <TypeFx words={["ab", "cd"]} speed={10} hold={50} loop={false} />,
      { wrapper },
    );
    await advance(1000);
    // It ends on the last word, typed out, not on an empty line.
    expect(typed(container)).toBe("cd");
    expect(hasCursor(container)).toBe(false);
    await advance(1000);
    expect(typed(container)).toBe("cd");
    expect(vi.getTimerCount()).toBe(0);
  });

  // Every word was typed out letter by letter whatever the motion preference.
  it("shows the word it settles on at once under reduced motion", async () => {
    mockReducedMotion(true);
    const { container } = render(
      <>
        <TypeFx words={["ab", "cd"]} speed={10} loop={false} />
        <TypeFx words={["ef", "gh"]} speed={10} />
      </>,
      { wrapper },
    );
    await advance(0);
    const [once, looping] = Array.from(container.children) as HTMLElement[];
    expect(once.querySelector('[aria-hidden="true"]')?.textContent).toBe("cd");
    expect(looping.querySelector('[aria-hidden="true"]')?.textContent).toBe("ef");
    expect(hasCursor(container)).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("waits for the function handed to onTrigger with trigger custom", async () => {
    let start: (() => void) | undefined;
    const { container } = render(
      <TypeFx
        words="Go"
        speed={10}
        trigger="custom"
        onTrigger={(fn: () => void) => {
          start = fn;
        }}
      />,
      { wrapper },
    );
    await advance(500);
    expect(typed(container)).toBe("");
    act(() => start?.());
    await advance(50);
    expect(typed(container)).toBe("Go");
  });

  it("restarts when the words change", async () => {
    const { container, rerender } = render(<TypeFx words="One" speed={10} />, { wrapper });
    await advance(100);
    rerender(<TypeFx words="Two" speed={10} />);
    await advance(15);
    expect(typed(container)).toBe("T");
    await advance(100);
    expect(typed(container)).toBe("Two");
  });

  it("renders children before the text and forwards its ref", () => {
    const ref = createRef<HTMLSpanElement>();
    const { container } = render(
      <TypeFx ref={ref} words="x">
        Say:{" "}
      </TypeFx>,
      { wrapper },
    );
    expect(ref.current).toBe(container.firstElementChild);
    expect(container.textContent?.startsWith("Say: ")).toBe(true);
  });

  it("stops typing on unmount", async () => {
    const { unmount } = render(<TypeFx words={["ab", "cd"]} speed={10} />, { wrapper });
    await advance(15);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

/**
 * FadingLettersFx splits text into per-letter spans with staggered entry
 * delays. The letters are animation, not content: the text must still read,
 * copy and index as itself, words apart.
 */
describe("FadingLettersFx", () => {
  it("keeps the text readable as words", async () => {
    const { container } = render(
      <FadingLettersFx as="p" text="Hello brave world" animationState="visible" />,
      { wrapper },
    );
    expect(container.textContent).toBe("Hello brave world");
    await expectNoAxeViolations(container);
  });

  it("staggers entry by word and letter, offset by messageIdx", () => {
    const { container } = render(
      <FadingLettersFx text="ab cd" animationState="entering" messageIdx={1} />,
      { wrapper },
    );
    const letters = Array.from(container.querySelectorAll<HTMLElement>("[data-letter]"));
    expect(letters.map((l) => l.dataset.letter)).toEqual(["a", "b", "c", "d"]);
    expect(letters.map((l) => l.style.getPropertyValue("--entry-delay"))).toEqual([
      "2500ms",
      "2540ms",
      "2700ms",
      "2740ms",
    ]);
    expect(letters.every((l) => l.classList.contains(styles.entering as string))).toBe(true);
  });

  it("marks letters by animation state", () => {
    const { container, rerender } = render(<FadingLettersFx text="a" animationState="exiting" />, {
      wrapper,
    });
    const letter = () => container.querySelector("[data-letter]") as HTMLElement;
    expect(letter()).toHaveClass(styles.exiting as string);
    rerender(<FadingLettersFx text="a" animationState="visible" />);
    expect(letter()).not.toHaveClass(styles.exiting as string);
    expect(letter()).not.toHaveClass(styles.entering as string);
  });

  it("forwards its ref and keeps a caller style", () => {
    const ref = createRef<HTMLSpanElement>();
    const { container } = render(
      <FadingLettersFx ref={ref} text="a" animationState="visible" style={{ color: "red" }} />,
      { wrapper },
    );
    expect(ref.current).toBe(container.firstElementChild);
    expect(ref.current?.style.display).toBe("contents");
    expect(ref.current?.style.color).toBe("red");
  });
});
