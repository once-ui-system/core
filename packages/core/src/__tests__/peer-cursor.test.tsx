import { act, fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PeerCursor, PeerCursors, peerColor, usePeerPointer } from "../components/PeerCursor.js";
import { schemes } from "../types.js";

describe("peerColor", () => {
  it("gives the same palette hue for the same id", () => {
    expect(peerColor("ada")).toBe(peerColor("ada"));
    expect(schemes).toContain(peerColor("ada"));
  });

  it("spreads ids over several hues", () => {
    const hues = new Set(Array.from({ length: 40 }, (_, i) => peerColor(`user-${i}`)));
    expect(hues.size).toBeGreaterThan(5);
  });
});

describe("PeerCursor", () => {
  it("shows the name and places the tip at x, y", () => {
    const { container } = render(<PeerCursor name="Mira Holt" x={40} y={12} smooth={false} />);
    expect(screen.getByText("Mira Holt")).toBeTruthy();
    const node = container.firstElementChild as HTMLElement;
    expect(node.style.transform).toContain("translate3d(40px, 12px, 0)");
  });

  it("takes its colour from scheme, or from the id", () => {
    const { container, rerender } = render(<PeerCursor name="A" x={0} y={0} scheme="cyan" />);
    const node = container.firstElementChild as HTMLElement;
    expect(node.style.getPropertyValue("--peer-cursor-color")).toBe("var(--scheme-cyan-600)");
    rerender(<PeerCursor id="u-1" name="A" x={0} y={0} />);
    expect(node.style.getPropertyValue("--peer-cursor-color")).toBe(
      `var(--scheme-${peerColor("u-1")}-600)`,
    );
  });

  it("folds the label when idle, but not while a message is up", () => {
    const { container, rerender } = render(<PeerCursor name="A" x={0} y={0} idle />);
    const node = container.firstElementChild as HTMLElement;
    expect(node.hasAttribute("data-idle")).toBe(true);
    rerender(<PeerCursor name="A" x={0} y={0} idle message="Look here" />);
    expect(node.hasAttribute("data-idle")).toBe(false);
    expect(screen.getByText("Look here")).toBeTruthy();
  });

  describe("gliding", () => {
    let frames: FrameRequestCallback[] = [];
    let now = 0;
    beforeEach(() => {
      frames = [];
      now = 0;
      vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
        frames.push(cb);
        return frames.length;
      });
      vi.stubGlobal("cancelAnimationFrame", () => {});
    });
    afterEach(() => vi.unstubAllGlobals());
    const tick = (ms: number) => {
      now += ms;
      const run = frames;
      frames = [];
      for (const cb of run) cb(now);
    };

    it("moves part of the way each frame and settles on the target", () => {
      const { container, rerender } = render(<PeerCursor name="A" x={0} y={0} />);
      const node = container.firstElementChild as HTMLElement;
      rerender(<PeerCursor name="A" x={100} y={0} />);
      act(() => tick(16));
      act(() => tick(16));
      const mid = Number(/translate3d\(([\d.]+)px/.exec(node.style.transform)?.[1]);
      expect(mid).toBeGreaterThan(0);
      expect(mid).toBeLessThan(100);
      for (let i = 0; i < 60; i++) act(() => tick(16));
      expect(node.style.transform).toContain("translate3d(100px, 0px, 0)");
      expect(frames.length).toBe(0);
    });

    it("jumps when smooth is off", () => {
      const { container, rerender } = render(<PeerCursor name="A" x={0} y={0} smooth={false} />);
      rerender(<PeerCursor name="A" x={300} y={200} smooth={false} />);
      const node = container.firstElementChild as HTMLElement;
      expect(node.style.transform).toContain("translate3d(300px, 200px, 0)");
      expect(frames.length).toBe(0);
    });
  });
});

describe("PeerCursors", () => {
  it("draws one cursor per peer in px, hidden from screen readers", () => {
    const { container } = render(
      <div style={{ position: "relative" }}>
        <PeerCursors
          units="px"
          smooth={false}
          peers={[
            { id: "1", name: "Mira Holt", x: 10, y: 20 },
            { id: "2", name: "Teo Varga", x: 30, y: 40 },
          ]}
        />
      </div>,
    );
    const layer = container.querySelector("[aria-hidden='true']") as HTMLElement;
    expect(layer.children.length).toBe(2);
    expect((layer.children[1] as HTMLElement).style.transform).toContain(
      "translate3d(30px, 40px, 0)",
    );
  });

  it("maps positions through project and sets the scale variable", () => {
    const { container } = render(
      <PeerCursors
        units="px"
        smooth={false}
        scale={0.5}
        project={(x, y) => ({ x: x * 2, y: y * 2 })}
        peers={[{ id: "1", name: "Mira Holt", x: 10, y: 20 }]}
      />,
    );
    const layer = container.firstElementChild as HTMLElement;
    expect(layer.style.getPropertyValue("--peer-cursor-scale")).toBe("0.5");
    expect((layer.firstElementChild as HTMLElement).style.transform).toContain(
      "translate3d(20px, 40px, 0)",
    );
  });
});

describe("usePeerPointer", () => {
  function Surface({ onMove }: { onMove: (p: { x: number; y: number } | null) => void }) {
    const ref = useRef<HTMLDivElement>(null);
    usePeerPointer(ref, onMove, { interval: 50 });
    return <div ref={ref} data-testid="surface" />;
  }

  const move = (el: HTMLElement, clientX: number, clientY: number) => {
    const event = new MouseEvent("pointermove", { clientX, clientY, bubbles: true });
    Object.defineProperty(event, "pointerType", { value: "mouse" });
    fireEvent(el, event);
  };

  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("reports fractions of the element, throttled with a trailing report, and null on leave", () => {
    const onMove = vi.fn();
    render(<Surface onMove={onMove} />);
    const el = screen.getByTestId("surface");
    el.getBoundingClientRect = () =>
      ({ left: 100, top: 50, width: 200, height: 100, right: 300, bottom: 150 }) as DOMRect;

    vi.advanceTimersByTime(100);
    move(el, 200, 100);
    expect(onMove).toHaveBeenLastCalledWith({ x: 0.5, y: 0.5 });
    move(el, 300, 150);
    expect(onMove).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(60);
    expect(onMove).toHaveBeenLastCalledWith({ x: 1, y: 1 });

    fireEvent.pointerLeave(el);
    expect(onMove).toHaveBeenLastCalledWith(null);
  });
});
