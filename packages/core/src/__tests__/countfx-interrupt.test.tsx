import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CountFx } from "../components/CountFx";

/**
 * jsdom has no frame loop, so drive one by hand: each rAF callback lands in
 * `pending` and runs only when the test flushes it with a chosen timestamp.
 * cancelAnimationFrame has to genuinely cancel here — the bug under test lives
 * in the gap between a cancelled frame and the effect's early return.
 *
 * Timestamps are non-zero throughout: `animate` seeds its start time with
 * `if (!startTime)`, so a literal 0 would never stick.
 */
let pending: Map<number, FrameRequestCallback>;
let nextFrameId: number;
let realRaf: typeof globalThis.requestAnimationFrame;
let realCaf: typeof globalThis.cancelAnimationFrame;

const flush = (timestamp: number) => {
  const due = Array.from(pending.values());
  pending.clear();
  act(() => {
    for (const frame of due) frame(timestamp);
  });
};

beforeEach(() => {
  pending = new Map();
  nextFrameId = 0;
  realRaf = globalThis.requestAnimationFrame;
  realCaf = globalThis.cancelAnimationFrame;
  globalThis.requestAnimationFrame = ((frame: FrameRequestCallback) => {
    const id = ++nextFrameId;
    pending.set(id, frame);
    return id;
  }) as typeof globalThis.requestAnimationFrame;
  globalThis.cancelAnimationFrame = ((id: number) => {
    pending.delete(id);
  }) as typeof globalThis.cancelAnimationFrame;
});

afterEach(() => {
  globalThis.requestAnimationFrame = realRaf;
  globalThis.cancelAnimationFrame = realCaf;
});

describe("CountFx", () => {
  it("settles exactly on the target value", () => {
    const { rerender } = render(<CountFx value={9.99} decimals={2} speed={1000} easing="linear" />);
    expect(screen.getByText("9.99")).toBeInTheDocument();

    rerender(<CountFx value={8.33} decimals={2} speed={1000} easing="linear" />);
    flush(100);
    flush(1100);

    expect(screen.getByText("8.33")).toBeInTheDocument();
  });

  it("reaches the target when the value reverts mid-animation", () => {
    const { rerender } = render(<CountFx value={9.99} decimals={2} speed={1000} easing="linear" />);

    rerender(<CountFx value={8.33} decimals={2} speed={1000} easing="linear" />);
    flush(100);
    flush(600);
    // Halfway down, so the revert below genuinely interrupts a run in flight.
    expect(screen.getByText("9.16")).toBeInTheDocument();

    // The pricing toggle clicked a second time, inside the animation window.
    rerender(<CountFx value={9.99} decimals={2} speed={1000} easing="linear" />);
    flush(700);
    flush(1700);

    expect(screen.getByText("9.99")).toBeInTheDocument();
  });

  it("reverses from where the interrupted run got to, not from its origin", () => {
    const { rerender } = render(<CountFx value={0} decimals={0} speed={1000} easing="linear" />);

    rerender(<CountFx value={100} decimals={0} speed={1000} easing="linear" />);
    flush(100);
    flush(600);
    expect(screen.getByText("50")).toBeInTheDocument();

    // Back to 0 from 50, so half the distance covers it in the same time.
    rerender(<CountFx value={0} decimals={0} speed={1000} easing="linear" />);
    flush(700);
    flush(1200);
    expect(screen.getByText("25")).toBeInTheDocument();

    flush(1700);
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
