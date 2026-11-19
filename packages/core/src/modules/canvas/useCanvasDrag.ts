"use client";

import { type PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef } from "react";
import { useCanvasApi } from "./CanvasContext.js";
import type { CanvasPoint } from "./geometry.js";

export interface CanvasDragState {
  /** Where the pointer went down, in world units. */
  origin: CanvasPoint;
  /** Where it is now, in world units. */
  point: CanvasPoint;
  /** `point − origin`: how far to move what's being dragged. */
  delta: CanvasPoint;
  /** The pointer event behind this step (for Shift, Alt and the like). */
  event: PointerEvent;
}

export interface CanvasDragOptions {
  /** The pointer moved past the threshold: the drag begins. */
  onStart?: (state: CanvasDragState) => void;
  onMove?: (state: CanvasDragState) => void;
  /** `moved` is false for a press that never passed the threshold: a click. */
  onEnd?: (state: CanvasDragState & { moved: boolean }) => void;
  /** Screen px the pointer travels before a press counts as a drag. Default 3. */
  threshold?: number;
}

/**
 * Turns a press on something in the canvas into a drag measured in world
 * units, whatever the zoom, and keeps measuring if the view moves mid-drag.
 *
 * ```tsx
 * const drag = useCanvasDrag();
 * <CanvasItem onPointerDown={(e) => drag(e, { onMove: ({ delta }) => move(id, delta) })} />
 * ```
 */
export function useCanvasDrag() {
  const api = useCanvasApi();
  const cleanup = useRef<(() => void) | null>(null);
  useEffect(() => () => cleanup.current?.(), []);

  return useCallback(
    (event: ReactPointerEvent | PointerEvent, options: CanvasDragOptions) => {
      const native = "nativeEvent" in event ? event.nativeEvent : event;
      if (native.button !== 0) return;
      cleanup.current?.();
      const { threshold = 3 } = options;
      const pointerId = native.pointerId;
      const sx = native.clientX;
      const sy = native.clientY;
      const origin = api.clientToWorld(sx, sy);
      let moved = false;
      let last: CanvasDragState = { origin, point: origin, delta: { x: 0, y: 0 }, event: native };

      const state = (e: PointerEvent): CanvasDragState => {
        const point = api.clientToWorld(e.clientX, e.clientY);
        return { origin, point, delta: { x: point.x - origin.x, y: point.y - origin.y }, event: e };
      };
      const onMove = (e: PointerEvent) => {
        if (e.pointerId !== pointerId) return;
        if (!moved) {
          if (Math.abs(e.clientX - sx) + Math.abs(e.clientY - sy) < threshold) return;
          moved = true;
          last = state(e);
          options.onStart?.(last);
        } else {
          last = state(e);
        }
        options.onMove?.(last);
      };
      const onUp = (e: PointerEvent) => {
        if (e.pointerId !== pointerId) return;
        stop();
        options.onEnd?.({ ...(moved ? state(e) : last), moved });
      };
      const stop = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        cleanup.current = null;
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
      cleanup.current = stop;
    },
    [api],
  );
}
