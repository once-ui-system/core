import { act, render, screen } from "@testing-library/react";
import type React from "react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RevealFx } from "../RevealFx.js";
import styles from "../RevealFx.module.scss";
import { LayoutProvider } from "@once-ui-system/core";
import { expectNoAxeViolations } from "../test/axe.js";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LayoutProvider>{children}</LayoutProvider>
);

const root = (container: HTMLElement) => container.firstElementChild as HTMLElement;
const state = (container: HTMLElement) => {
  const el = root(container);
  if (el.classList.contains(styles.revealedNoMask as string)) return "done";
  if (el.classList.contains(styles.revealed as string)) return "revealing";
  if (el.classList.contains(styles.hidden as string)) return "hidden";
  return "unknown";
};
const advance = (ms: number) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

/**
 * RevealFx un-masks its children after `delay` ms over `speed`, then drops
 * the mask. Controlled by `revealed`, it shows only when told to: the delay
 * timer must not reveal content the caller is holding back.
 */
describe("RevealFx", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps its children in the document while hidden", async () => {
    const { container } = render(
      <RevealFx>
        <h2>Welcome</h2>
      </RevealFx>,
      { wrapper },
    );
    expect(screen.getByRole("heading", { name: "Welcome" })).toBeInTheDocument();
    expect(state(container)).toBe("hidden");
    vi.useRealTimers();
    await expectNoAxeViolations(container);
  });

  it("reveals after `delay`, then drops the mask after `speed`", () => {
    const { container } = render(
      <RevealFx delay={300} duration={1000}>
        Hi
      </RevealFx>,
      { wrapper },
    );
    advance(299);
    expect(state(container)).toBe("hidden");
    advance(1);
    expect(state(container)).toBe("revealing");
    expect(root(container).style.transitionDuration).toBe("1000ms");
    advance(1000);
    expect(state(container)).toBe("done");
  });

  it("takes a numeric speed in ms", () => {
    const { container } = render(<RevealFx duration={500}>Hi</RevealFx>, { wrapper });
    expect(root(container).style.transitionDuration).toBe("500ms");
    advance(500);
    expect(state(container)).toBe("done");
  });

  it("starts revealed with revealedByDefault", () => {
    const { container } = render(<RevealFx defaultRevealed>Hi</RevealFx>, { wrapper });
    expect(state(container)).toBe("revealing");
  });

  it("slides in from translateY", () => {
    const { container, rerender } = render(<RevealFx translateY="2rem">Hi</RevealFx>, { wrapper });
    expect(root(container).style.transform).toBe("translateY(2rem)");
    rerender(<RevealFx translateY="16">Hi</RevealFx>);
    expect(root(container).style.transform).toBe("translateY(var(--static-space-16))");
    advance(0);
    expect(root(container).style.transform).toBe("translateY(0)");
  });

  it("stays hidden while revealed is false, however long it waits", () => {
    const { container, rerender } = render(<RevealFx revealed={false}>Hi</RevealFx>, {
      wrapper,
    });
    advance(10_000);
    expect(state(container)).toBe("hidden");
    rerender(<RevealFx revealed>Hi</RevealFx>);
    expect(state(container)).toBe("revealing");
    advance(2000);
    expect(state(container)).toBe("done");
  });

  it("hides again when revealed turns false", () => {
    const { container, rerender } = render(<RevealFx revealed>Hi</RevealFx>, { wrapper });
    advance(2000);
    rerender(<RevealFx revealed={false}>Hi</RevealFx>);
    expect(state(container)).toBe("hidden");
  });

  it("clears its timers on unmount and keeps className, style and ref", () => {
    const ref = createRef<HTMLDivElement>();
    const { container, unmount } = render(
      <RevealFx ref={ref} className="hero" style={{ color: "red" }} delay={100}>
        Hi
      </RevealFx>,
      { wrapper },
    );
    expect(ref.current).toBe(root(container));
    expect(root(container)).toHaveClass("hero");
    expect(root(container).style.color).toBe("red");
    advance(100);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
