import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  Canvas,
  type CanvasApi,
  CanvasItem,
  type CanvasRect,
  type CanvasView,
  fitView,
  mapRect,
  rectAABB,
  rectContainsPoint,
  rectsBounds,
  rectsIntersect,
  resizeRect,
  rotateRect,
  screenToWorld,
  snapRect,
  TransformHandles,
  useCanvasDrag,
  worldToScreen,
  zoomAt,
} from "../modules/canvas/index";

const near = (a: number, b: number) => expect(a).toBeCloseTo(b, 6);
const nearRect = (a: CanvasRect, b: CanvasRect) => {
  near(a.x, b.x);
  near(a.y, b.y);
  near(a.width, b.width);
  near(a.height, b.height);
};

describe("camera maths", () => {
  it("round-trips world and screen points", () => {
    const view: CanvasView = { x: 40, y: -20, zoom: 2.5 };
    const p = { x: 13, y: 7 };
    const back = screenToWorld(worldToScreen(p, view), view);
    near(back.x, p.x);
    near(back.y, p.y);
  });

  it("keeps the point under the pointer when zooming", () => {
    const view: CanvasView = { x: 10, y: 20, zoom: 1 };
    const at = { x: 200, y: 150 };
    const before = screenToWorld(at, view);
    const after = screenToWorld(at, zoomAt(view, 3, at));
    near(after.x, before.x);
    near(after.y, before.y);
  });

  it("fits a box in the middle of the screen", () => {
    const view = fitView(
      { x: 100, y: 100, width: 200, height: 100 },
      { width: 800, height: 600 },
      { padding: 0, maxZoom: 10 },
    );
    near(view.zoom, 4);
    const c = worldToScreen({ x: 200, y: 150 }, view);
    near(c.x, 400);
    near(c.y, 300);
  });
});

describe("boxes", () => {
  it("bounds a turned box by its corners", () => {
    const b = rectAABB({ x: 0, y: 0, width: 100, height: 100, rotation: 45 });
    near(b.width, Math.SQRT2 * 100);
    near(b.x, 50 - (Math.SQRT2 * 100) / 2);
  });

  it("bounds several boxes", () => {
    expect(rectsBounds([])).toBeNull();
    expect(
      rectsBounds([
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 20, y: -5, width: 5, height: 5 },
      ]),
    ).toEqual({ x: 0, y: -5, width: 25, height: 15 });
  });

  it("tests overlap and points inside turned boxes", () => {
    expect(
      rectsIntersect({ x: 0, y: 0, width: 10, height: 10 }, { x: 5, y: 5, width: 10, height: 10 }),
    ).toBe(true);
    expect(
      rectsIntersect({ x: 0, y: 0, width: 10, height: 10 }, { x: 11, y: 0, width: 10, height: 10 }),
    ).toBe(false);
    const diamond = { x: 0, y: 0, width: 100, height: 100, rotation: 45 };
    expect(rectContainsPoint(diamond, { x: 50, y: 50 })).toBe(true);
    // A corner of the upright box lies outside the turned one.
    expect(rectContainsPoint(diamond, { x: 2, y: 2 })).toBe(false);
  });

  it("maps a child through its group's resize", () => {
    const from = { x: 0, y: 0, width: 100, height: 100 };
    const to = { x: 0, y: 0, width: 200, height: 50 };
    expect(mapRect({ x: 50, y: 50, width: 50, height: 50 }, from, to)).toEqual({
      x: 100,
      y: 25,
      width: 100,
      height: 25,
    });
  });
});

describe("resizeRect", () => {
  const box = { x: 0, y: 0, width: 100, height: 50 };

  it("pulls a corner and keeps the opposite one", () => {
    nearRect(resizeRect(box, "se", { x: 150, y: 80 }), { x: 0, y: 0, width: 150, height: 80 });
    nearRect(resizeRect(box, "nw", { x: -10, y: -10 }), { x: -10, y: -10, width: 110, height: 60 });
  });

  it("moves only one side from an edge", () => {
    nearRect(resizeRect(box, "e", { x: 130, y: 999 }), { x: 0, y: 0, width: 130, height: 50 });
    nearRect(resizeRect(box, "n", { x: 999, y: -20 }), { x: 0, y: -20, width: 100, height: 70 });
  });

  it("keeps the ratio and grows from the centre", () => {
    nearRect(resizeRect(box, "se", { x: 200, y: 60 }, { keepRatio: true }), {
      x: 0,
      y: 0,
      width: 200,
      height: 100,
    });
    nearRect(resizeRect(box, "e", { x: 110, y: 0 }, { fromCenter: true }), {
      x: -10,
      y: 0,
      width: 120,
      height: 50,
    });
  });

  it("never goes below the smallest size", () => {
    const r = resizeRect(box, "se", { x: -50, y: -50 }, { minSize: 4 });
    expect(r.width).toBe(4);
    expect(r.height).toBe(4);
  });

  it("resizes a turned box along its own edges", () => {
    const turned = { x: 0, y: 0, width: 100, height: 50, rotation: 90 };
    // Turned a quarter, the box's right edge faces down: its centre is
    // (50, 25), so its "e" side sits at y = 25 + 50 = 75.
    const r = resizeRect(turned, "e", { x: 50, y: 95 });
    near(r.width, 120);
    near(r.height, 50);
    // The west side stays put at y = 25 − 50 = −25.
    near(r.y + r.height / 2 - r.width / 2, -25);
  });
});

describe("rotateRect", () => {
  it("turns by the pointer's angle around the centre and snaps", () => {
    const box = { x: 0, y: 0, width: 100, height: 100 };
    near(rotateRect(box, { x: 50, y: -50 }, { x: 150, y: 50 }).rotation ?? 0, 90);
    near(rotateRect(box, { x: 50, y: -50 }, { x: 70, y: -50 }, { step: 15 }).rotation ?? 0, 15);
  });
});

describe("snapRect", () => {
  it("lines up edges within the threshold and returns guides", () => {
    const target = { x: 0, y: 0, width: 100, height: 100 };
    const moving = { x: 104, y: 200, width: 50, height: 50 };
    const r = snapRect(moving, [target], { threshold: 6 });
    expect(r.dx).toBe(-4);
    expect(r.rect.x).toBe(100);
    expect(r.guides).toEqual([{ axis: "x", at: 100, start: 0, end: 250, gap: 100 }]);
  });

  it("leaves a box alone when nothing is close", () => {
    const r = snapRect({ x: 300, y: 300, width: 10, height: 10 }, [
      { x: 0, y: 0, width: 10, height: 10 },
    ]);
    expect(r.dx).toBe(0);
    expect(r.dy).toBe(0);
    expect(r.guides).toEqual([]);
  });
});

describe("Canvas", () => {
  it("zooms with ⌘/Ctrl + wheel and pans with the wheel", () => {
    const onViewChange = vi.fn();
    render(<Canvas height={400} onViewChange={onViewChange} />);
    const canvas = screen.getByRole("application", { name: "Canvas" });
    fireEvent.wheel(canvas, { deltaX: 10, deltaY: 20 });
    expect(onViewChange).toHaveBeenLastCalledWith({ x: -10, y: -20, zoom: 1 });
    fireEvent.wheel(canvas, { deltaY: -100, ctrlKey: true, clientX: 0, clientY: 0 });
    expect(onViewChange.mock.lastCall?.[0].zoom).toBeGreaterThan(1);
  });

  it("draws a selection box on empty canvas and clicks through on a still press", () => {
    const onSelectionBox = vi.fn();
    const onBackgroundClick = vi.fn();
    render(
      <Canvas height={400} onSelectionBox={onSelectionBox} onBackgroundClick={onBackgroundClick} />,
    );
    const canvas = screen.getByRole("application", { name: "Canvas" });
    fireEvent.pointerDown(canvas, { pointerId: 1, button: 0, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(canvas, { pointerId: 1, clientX: 60, clientY: 40 });
    expect(onSelectionBox).toHaveBeenLastCalledWith(
      { x: 10, y: 10, width: 50, height: 30 },
      { phase: "start", additive: false },
    );
    fireEvent.pointerUp(canvas, { pointerId: 1, clientX: 60, clientY: 40 });
    expect(onSelectionBox).toHaveBeenLastCalledWith(null, { phase: "end", additive: false });
    expect(onBackgroundClick).not.toHaveBeenCalled();

    fireEvent.pointerDown(canvas, { pointerId: 2, button: 0, clientX: 10, clientY: 10 });
    fireEvent.pointerUp(canvas, { pointerId: 2, clientX: 10, clientY: 10 });
    expect(onBackgroundClick).toHaveBeenCalledTimes(1);
  });

  it("pans on an empty-canvas drag when there's no selection box", () => {
    const onViewChange = vi.fn();
    render(<Canvas height={400} onViewChange={onViewChange} />);
    const canvas = screen.getByRole("application", { name: "Canvas" });
    fireEvent.pointerDown(canvas, { pointerId: 1, button: 0, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(canvas, { pointerId: 1, clientX: 30, clientY: 15 });
    expect(onViewChange).toHaveBeenLastCalledWith({ x: 30, y: 15, zoom: 1 });
  });

  it("doesn't start a gesture from an item", () => {
    const onSelectionBox = vi.fn();
    render(
      <Canvas height={400} onSelectionBox={onSelectionBox}>
        <CanvasItem x={0} y={0} width={10} height={10} data-testid="item" />
      </Canvas>,
    );
    const item = screen.getByTestId("item");
    fireEvent.pointerDown(item, { pointerId: 1, button: 0, clientX: 1, clientY: 1 });
    fireEvent.pointerMove(item, { pointerId: 1, clientX: 50, clientY: 50 });
    expect(onSelectionBox).not.toHaveBeenCalled();
  });

  it("zooms from its controls and exposes its camera through a ref", () => {
    const handle: { api: CanvasApi | null } = { api: null };
    render(
      <Canvas
        height={400}
        ref={(a) => {
          handle.api = a;
        }}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(screen.getByRole("button", { name: "Zoom to 100%" }).textContent).toBe("125%");
    act(() => handle.api?.zoomTo(1));
    expect(screen.getByRole("button", { name: "Zoom to 100%" }).textContent).toBe("100%");
    expect(handle.api?.getView().zoom).toBe(1);
  });
});

describe("TransformHandles", () => {
  function Harness({ onChange }: { onChange: (r: CanvasRect) => void }) {
    const [rect, setRect] = useState<CanvasRect>({ x: 0, y: 0, width: 100, height: 50 });
    return (
      <Canvas height={400}>
        <TransformHandles
          rect={rect}
          onTransform={(next) => {
            setRect(next);
            onChange(next);
          }}
        />
      </Canvas>
    );
  }

  it("resizes from a corner with the pointer", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const handle = screen.getByRole("button", { name: "Resize from the bottom-right corner" });
    fireEvent.pointerDown(handle, { pointerId: 1, button: 0, clientX: 100, clientY: 50 });
    fireEvent.pointerMove(handle, { pointerId: 1, clientX: 140, clientY: 90 });
    fireEvent.pointerUp(handle, { pointerId: 1, clientX: 140, clientY: 90 });
    expect(onChange).toHaveBeenLastCalledWith({ x: 0, y: 0, width: 140, height: 90 });
  });

  it("resizes from the keyboard", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const handle = screen.getByRole("button", { name: "Resize from the right edge" });
    fireEvent.keyDown(handle, { key: "ArrowRight", shiftKey: true });
    expect(onChange).toHaveBeenLastCalledWith({ x: 0, y: 0, width: 110, height: 50 });
    fireEvent.keyDown(screen.getByRole("button", { name: "Rotate" }), { key: "ArrowRight" });
    expect(onChange.mock.lastCall?.[0].rotation).toBe(1);
  });

  it("shows the size", () => {
    render(<Harness onChange={() => {}} />);
    expect(screen.getByText("100 × 50")).toBeTruthy();
  });
});

describe("useCanvasDrag", () => {
  it("reports world deltas, divided by the zoom", () => {
    const onMove = vi.fn();
    const onEnd = vi.fn();
    function Dragger() {
      const drag = useCanvasDrag();
      return (
        <CanvasItem
          x={0}
          y={0}
          width={10}
          height={10}
          data-testid="item"
          onPointerDown={(e) =>
            drag(e, { onMove: ({ delta }) => onMove(delta), onEnd: ({ moved }) => onEnd(moved) })
          }
        />
      );
    }
    render(
      <Canvas height={400} defaultView={{ x: 0, y: 0, zoom: 2 }}>
        <Dragger />
      </Canvas>,
    );
    fireEvent.pointerDown(screen.getByTestId("item"), {
      pointerId: 1,
      button: 0,
      clientX: 0,
      clientY: 0,
    });
    fireEvent.pointerMove(window, { pointerId: 1, clientX: 40, clientY: 20 });
    fireEvent.pointerUp(window, { pointerId: 1, clientX: 40, clientY: 20 });
    expect(onMove).toHaveBeenLastCalledWith({ x: 20, y: 10 });
    expect(onEnd).toHaveBeenLastCalledWith(true);
  });
});
