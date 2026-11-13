import { act } from "@testing-library/react";
import { type Mock, vi } from "vitest";

/**
 * Helpers for the motion/canvas effects: jsdom has no layout, no canvas, no
 * real IntersectionObserver and never runs animation frames on its own.
 */

/** Makes every observed element report as on screen, the way a visible effect would. */
export function installIntersectingObserver(isIntersecting = true) {
  const observers: { callback: IntersectionObserverCallback; disconnected: boolean }[] = [];
  class VisibleObserver {
    readonly root = null;
    readonly rootMargin = "";
    readonly thresholds: number[] = [];
    private record: { callback: IntersectionObserverCallback; disconnected: boolean };
    constructor(callback: IntersectionObserverCallback) {
      this.record = { callback, disconnected: false };
      observers.push(this.record);
    }
    observe(target: Element) {
      this.record.callback(
        [{ isIntersecting, target } as unknown as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      );
    }
    unobserve() {}
    disconnect() {
      this.record.disconnected = true;
    }
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }
  Object.defineProperty(globalThis, "IntersectionObserver", {
    configurable: true,
    writable: true,
    value: VisibleObserver,
  });
  return observers;
}

/** Answers `(prefers-reduced-motion: reduce)` with `reduce`; every other query with false. */
export function mockReducedMotion(reduce: boolean): Mock<(query: string) => MediaQueryList> {
  const matchMedia = vi.fn((query: string) => ({
    matches: query.includes("prefers-reduced-motion") ? reduce : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: matchMedia,
  });
  return matchMedia;
}

/**
 * Replaces requestAnimationFrame with a queue the test steps by hand, so a
 * loop neither runs away nor never runs. `pending()` lists the frames that are
 * requested and not cancelled.
 */
export function controlAnimationFrames() {
  let nextId = 1;
  const queue = new Map<number, FrameRequestCallback>();
  const request = vi
    .spyOn(window, "requestAnimationFrame")
    .mockImplementation((callback: FrameRequestCallback) => {
      const id = nextId++;
      queue.set(id, callback);
      return id;
    });
  const cancel = vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id: number) => {
    queue.delete(id);
  });
  let now = 0;
  const step = (count = 1, frameMs = 16) => {
    for (let i = 0; i < count; i++) {
      now += frameMs;
      const due = Array.from(queue.entries());
      queue.clear();
      act(() => {
        for (const [, callback] of due) callback(now);
      });
    }
  };
  return { request, cancel, step, pending: () => Array.from(queue.keys()) };
}

/**
 * jsdom has no canvas backend. A 2D context whose every method is a no-op and
 * whose every property reads back what was written is enough for an effect's
 * draw loop to run. `calls` counts method calls by name.
 */
export function fakeCanvasContext() {
  const calls = new Map<string, number>();
  const store: Record<string | symbol, unknown> = {};
  const gradient = { addColorStop: () => {} };
  const ctx = new Proxy(store, {
    get(target, prop) {
      if (prop in target) return target[prop];
      if (prop === "canvas") return undefined;
      if (prop === "createLinearGradient" || prop === "createRadialGradient") {
        return () => gradient;
      }
      if (prop === "measureText") {
        return (text: string) => ({ width: text.length * 8 });
      }
      if (prop === "getImageData" || prop === "createImageData") {
        return (_x: number, _y: number, w = 1, h = 1) => ({
          width: w,
          height: h,
          data: new Uint8ClampedArray(Math.max(1, w * h * 4)),
        });
      }
      if (prop === "then") return undefined;
      return (..._args: unknown[]) => {
        calls.set(String(prop), (calls.get(String(prop)) ?? 0) + 1);
      };
    },
    set(target, prop, value) {
      target[prop] = value;
      return true;
    },
  });
  const getContext = vi
    .spyOn(HTMLCanvasElement.prototype, "getContext")
    .mockImplementation((() => ctx) as unknown as HTMLCanvasElement["getContext"]);
  return { ctx, calls, getContext };
}

/** Drops the observer installed above; the global setup puts its inert mock back after each test. */
export function resetIntersectionObserver() {
  Reflect.deleteProperty(globalThis, "IntersectionObserver");
}
