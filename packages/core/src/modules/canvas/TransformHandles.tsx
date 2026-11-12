"use client";

import classNames from "clsx";
import {
  type KeyboardEvent,
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import styles from "./Canvas.module.css";
import { useCanvas } from "./CanvasContext.js";
import {
  type CanvasHandle,
  type CanvasPoint,
  type CanvasRect,
  HANDLE_DIRECTION,
  rectCenter,
  resizeRect,
  rotatePoint,
  rotateRect,
  worldToScreen,
} from "./geometry.js";

type ResizeHandle = Exclude<CanvasHandle, "rotate">;

export interface CanvasTransformInfo {
  handle: CanvasHandle;
  phase: "start" | "move" | "end";
  /** The box when the gesture began. */
  start: CanvasRect;
}

export interface TransformHandlesLabels {
  /** Read out for each handle, `{handle}` replaced by its name below. */
  resize: string;
  rotate: string;
  handles: Record<ResizeHandle, string>;
}

const DEFAULT_LABELS: TransformHandlesLabels = {
  resize: "Resize from the {handle}",
  rotate: "Rotate",
  handles: {
    n: "top edge",
    ne: "top-right corner",
    e: "right edge",
    se: "bottom-right corner",
    s: "bottom edge",
    sw: "bottom-left corner",
    w: "left edge",
    nw: "top-left corner",
  },
};

export interface TransformHandlesProps {
  /** The selection's box in world units. For several things, their bounds (`rectsBounds`). */
  rect: CanvasRect;
  /** Hears every step of a resize or turn, with the box it gives. */
  onTransform: (next: CanvasRect, info: CanvasTransformInfo) => void;
  /** Default true. */
  resizable?: boolean;
  /** Draws the turn handle above the box. Default true. */
  rotatable?: boolean;
  /** Always keep the box's proportions, as for an image. Shift does it otherwise. */
  keepRatio?: boolean;
  /** Smallest width and height, in world units. Default 1. */
  minSize?: number;
  /** Degrees a turn snaps to while Shift is held. Default 15. */
  rotationStep?: number;
  /** Which resize handles to draw. Default all eight. */
  handles?: ResizeHandle[];
  /** Adjusts a resized box before it's reported: snap it to a grid or to other things. */
  snap?: (rect: CanvasRect, handle: ResizeHandle) => CanvasRect;
  /**
   * The readout under the box. Default its width × height; false for none, or
   * anything else to draw instead.
   */
  sizeLabel?: ReactNode | false;
  labels?: Partial<TransformHandlesLabels>;
  className?: string;
}

const CURSORS = ["ew-resize", "nwse-resize", "ns-resize", "nesw-resize"];

/** The resize cursor for a handle, following the box as it turns. */
const cursorFor = (handle: ResizeHandle, rotation: number) => {
  const [dx, dy] = HANDLE_DIRECTION[handle];
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI + rotation;
  const index = Math.round((((deg % 180) + 180) % 180) / 45) % 4;
  return CURSORS[index];
};

const ALL: ResizeHandle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"];

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * Resize and turn handles around a selection, drawn in screen space so they
 * keep their size at any zoom. Shift keeps the proportions (or snaps a turn),
 * Alt resizes from the centre, and with a handle focused the arrow keys move
 * that side by one unit (ten with Shift).
 *
 * It doesn't move anything itself: `onTransform` hears the new box and the
 * app applies it, to one thing or, through `mapRect`, to each of several.
 */
export function TransformHandles({
  rect,
  onTransform,
  resizable = true,
  rotatable = true,
  keepRatio = false,
  minSize = 1,
  rotationStep = 15,
  handles,
  snap,
  sizeLabel,
  labels: labelsProp,
  className,
}: TransformHandlesProps) {
  const { view, overlay, clientToWorld } = useCanvas();
  const labels = {
    ...DEFAULT_LABELS,
    ...labelsProp,
    handles: { ...DEFAULT_LABELS.handles, ...labelsProp?.handles },
  };
  const active = useRef<{
    handle: CanvasHandle;
    start: CanvasRect;
    from: CanvasPoint;
    pointerId: number;
  } | null>(null);
  if (!overlay) return null;

  const rotation = rect.rotation ?? 0;
  const c = worldToScreen(rectCenter(rect), view);
  const w = rect.width * view.zoom;
  const h = rect.height * view.zoom;

  const apply = (
    e: { clientX: number; clientY: number; shiftKey: boolean; altKey: boolean },
    phase: "move" | "end",
  ) => {
    const a = active.current;
    if (!a) return;
    const point = clientToWorld(e.clientX, e.clientY);
    let next: CanvasRect;
    if (a.handle === "rotate") {
      next = rotateRect(a.start, a.from, point, { step: e.shiftKey ? rotationStep : undefined });
    } else {
      next = resizeRect(a.start, a.handle, point, {
        keepRatio: keepRatio || e.shiftKey,
        fromCenter: e.altKey,
        minSize,
      });
      if (snap) next = snap(next, a.handle);
    }
    onTransform(next, { handle: a.handle, phase, start: a.start });
  };

  const onPointerDown = (handle: CanvasHandle) => (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    active.current = {
      handle,
      start: rect,
      from: clientToWorld(e.clientX, e.clientY),
      pointerId: e.pointerId,
    };
    onTransform(rect, { handle, phase: "start", start: rect });
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (active.current?.pointerId !== e.pointerId) return;
    apply(e, "move");
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (active.current?.pointerId !== e.pointerId) return;
    apply(e, "end");
    active.current = null;
  };

  // Arrow keys move the focused handle's side or corner, in the box's own
  // axes, as precise resizing without a pointer.
  const onKeyDown = (handle: CanvasHandle) => (e: KeyboardEvent<HTMLButtonElement>) => {
    const keys: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const k = keys[e.key];
    if (!k) return;
    e.preventDefault();
    e.stopPropagation();
    const by = e.shiftKey ? 10 : 1;
    if (handle === "rotate") {
      const turn = (k[0] || k[1]) * (e.shiftKey ? rotationStep : 1);
      onTransform({ ...rect, rotation: rotation + turn }, { handle, phase: "end", start: rect });
      return;
    }
    const [dx, dy] = HANDLE_DIRECTION[handle];
    const center = rectCenter(rect);
    const at = rotatePoint(
      {
        x: center.x + (dx * rect.width) / 2 + k[0] * by,
        y: center.y + (dy * rect.height) / 2 + k[1] * by,
      },
      rotation,
      center,
    );
    let next = resizeRect(rect, handle, at, { keepRatio, minSize });
    if (snap) next = snap(next, handle);
    onTransform(next, { handle, phase: "end", start: rect });
  };

  const handleProps = (handle: CanvasHandle) => ({
    type: "button" as const,
    tabIndex: 0,
    onPointerDown: onPointerDown(handle),
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
    onKeyDown: onKeyDown(handle),
    "aria-label":
      handle === "rotate"
        ? labels.rotate
        : labels.resize.replace("{handle}", labels.handles[handle]),
  });

  const pos = (handle: ResizeHandle) => {
    const [dx, dy] = HANDLE_DIRECTION[handle];
    return { left: `${50 + dx * 50}%`, top: `${50 + dy * 50}%` };
  };

  const readout =
    sizeLabel === false ? null : (sizeLabel ?? `${round(rect.width)} × ${round(rect.height)}`);
  // Edges hide on a box too small to grab them apart from the corners.
  const small = Math.min(w, h) < 24;

  return createPortal(
    <div
      className={classNames(styles.frame, className)}
      data-canvas-ui=""
      style={{
        width: w,
        height: h,
        transform: `translate(${c.x - w / 2}px, ${c.y - h / 2}px) rotate(${rotation}deg)`,
      }}
    >
      {resizable &&
        (handles ?? ALL).map((handle) => {
          const corner = handle.length === 2;
          if (!corner && small) return null;
          return (
            <button
              key={handle}
              {...handleProps(handle)}
              className={classNames(
                styles.handle,
                corner
                  ? styles.corner
                  : [styles.edge, handle === "e" || handle === "w" ? styles.edgeX : styles.edgeY],
              )}
              style={{ ...pos(handle), cursor: cursorFor(handle, rotation) }}
            />
          );
        })}
      {rotatable && (
        <>
          <span className={styles.stem} style={{ top: -20, height: 20 }} />
          <button
            {...handleProps("rotate")}
            className={classNames(styles.handle, styles.rotate)}
            style={{ left: "50%", top: -24 }}
          />
        </>
      )}
      {readout != null && (
        <div
          className={styles.sizeLabel}
          style={{ top: `calc(100% + 0.5rem)`, rotate: `${-rotation}deg` }}
        >
          {readout}
        </div>
      )}
    </div>,
    overlay,
  );
}
