/**
 * The geometry behind the canvas: points and boxes in world units, the camera
 * that maps them to the screen, resizing and rotating a box from one of its
 * handles, and snapping a box to its neighbours.
 *
 * Everything here is pure, so an app can run the same maths on the server, in
 * a worker, or in a test, and the components only draw what it returns.
 */

export interface CanvasPoint {
  x: number;
  y: number;
}

/**
 * A box in world units. `x` and `y` are the top-left corner of the box before
 * it turns; `rotation` is in degrees, clockwise, around the box's centre.
 */
export interface CanvasRect {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

/**
 * The camera: a world point `p` is drawn at `p * zoom + (x, y)` on screen, in
 * px from the canvas's top-left corner.
 */
export interface CanvasView {
  x: number;
  y: number;
  zoom: number;
}

/** The eight resize handles, named by compass point, and the rotate handle. */
export type CanvasHandle = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw" | "rotate";

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const RAD = Math.PI / 180;

export function rotatePoint(p: CanvasPoint, degrees: number, around: CanvasPoint = { x: 0, y: 0 }) {
  if (!degrees) return { x: p.x, y: p.y };
  const a = degrees * RAD;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const dx = p.x - around.x;
  const dy = p.y - around.y;
  return { x: around.x + dx * cos - dy * sin, y: around.y + dx * sin + dy * cos };
}

export function rectCenter(r: CanvasRect): CanvasPoint {
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
}

/** The four corners in world units, turned with the box: nw, ne, se, sw. */
export function rectCorners(r: CanvasRect): CanvasPoint[] {
  const c = rectCenter(r);
  const rot = r.rotation ?? 0;
  return [
    { x: r.x, y: r.y },
    { x: r.x + r.width, y: r.y },
    { x: r.x + r.width, y: r.y + r.height },
    { x: r.x, y: r.y + r.height },
  ].map((p) => rotatePoint(p, rot, c));
}

/** The upright box around a turned one. */
export function rectAABB(r: CanvasRect): CanvasRect {
  if (!r.rotation) return { x: r.x, y: r.y, width: r.width, height: r.height };
  return pointsBounds(rectCorners(r));
}

export function pointsBounds(points: CanvasPoint[]): CanvasRect {
  if (points.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

/** The upright box around every box given, turned ones included. Null for none. */
export function rectsBounds(rects: CanvasRect[]): CanvasRect | null {
  if (rects.length === 0) return null;
  return pointsBounds(rects.flatMap((r) => rectCorners(r)));
}

/** Two upright boxes overlap (touching edges count). Turned boxes test their upright bounds. */
export function rectsIntersect(a: CanvasRect, b: CanvasRect) {
  const p = rectAABB(a);
  const q = rectAABB(b);
  return (
    p.x <= q.x + q.width && q.x <= p.x + p.width && p.y <= q.y + q.height && q.y <= p.y + p.height
  );
}

/** `inner` lies wholly inside `outer` (by their upright bounds). */
export function rectContains(outer: CanvasRect, inner: CanvasRect) {
  const p = rectAABB(outer);
  const q = rectAABB(inner);
  return (
    q.x >= p.x && q.y >= p.y && q.x + q.width <= p.x + p.width && q.y + q.height <= p.y + p.height
  );
}

/** The point lies inside the box, turned or not. */
export function rectContainsPoint(r: CanvasRect, p: CanvasPoint) {
  const local = rotatePoint(p, -(r.rotation ?? 0), rectCenter(r));
  return local.x >= r.x && local.x <= r.x + r.width && local.y >= r.y && local.y <= r.y + r.height;
}

/** The box spanned by two points, whichever way round they are. */
export function rectFromPoints(a: CanvasPoint, b: CanvasPoint): CanvasRect {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    width: Math.abs(b.x - a.x),
    height: Math.abs(b.y - a.y),
  };
}

/**
 * Where `child` lands when its group's box goes from `from` to `to`: the move
 * and scale of a multi-selection's handles, applied to each thing in it.
 */
export function mapRect(child: CanvasRect, from: CanvasRect, to: CanvasRect): CanvasRect {
  const sx = from.width === 0 ? 1 : to.width / from.width;
  const sy = from.height === 0 ? 1 : to.height / from.height;
  const c = rectCenter(child);
  const width = child.width * sx;
  const height = child.height * sy;
  const cx = to.x + (c.x - from.x) * sx;
  const cy = to.y + (c.y - from.y) * sy;
  return { ...child, x: cx - width / 2, y: cy - height / 2, width, height };
}

/* ── Camera ─────────────────────────────────────────────────────────────── */

export function worldToScreen(p: CanvasPoint, view: CanvasView): CanvasPoint {
  return { x: p.x * view.zoom + view.x, y: p.y * view.zoom + view.y };
}

export function screenToWorld(p: CanvasPoint, view: CanvasView): CanvasPoint {
  return { x: (p.x - view.x) / view.zoom, y: (p.y - view.y) / view.zoom };
}

/** The camera zoomed to `zoom`, keeping the screen point `at` over the same world point. */
export function zoomAt(view: CanvasView, zoom: number, at: CanvasPoint): CanvasView {
  const ratio = zoom / view.zoom;
  return { zoom, x: at.x - (at.x - view.x) * ratio, y: at.y - (at.y - view.y) * ratio };
}

/** The camera that centres `rect` in a `width` × `height` screen with `padding` px around it. */
export function fitView(
  rect: CanvasRect,
  size: { width: number; height: number },
  {
    padding = 64,
    minZoom = 0.02,
    maxZoom = 1,
  }: { padding?: number; minZoom?: number; maxZoom?: number } = {},
): CanvasView {
  const b = rectAABB(rect);
  const w = Math.max(b.width, 1);
  const h = Math.max(b.height, 1);
  const zoom = clamp(
    Math.min((size.width - padding * 2) / w, (size.height - padding * 2) / h),
    minZoom,
    maxZoom,
  );
  return {
    zoom,
    x: size.width / 2 - (b.x + b.width / 2) * zoom,
    y: size.height / 2 - (b.y + b.height / 2) * zoom,
  };
}

/* ── Handles ────────────────────────────────────────────────────────────── */

/** Which way each resize handle pulls, in the box's own (unturned) axes. */
export const HANDLE_DIRECTION: Record<Exclude<CanvasHandle, "rotate">, [number, number]> = {
  n: [0, -1],
  ne: [1, -1],
  e: [1, 0],
  se: [1, 1],
  s: [0, 1],
  sw: [-1, 1],
  w: [-1, 0],
  nw: [-1, -1],
};

export interface ResizeOptions {
  /** Keep the width-to-height ratio of `start` (Shift in most editors). */
  keepRatio?: boolean;
  /** Grow from the centre instead of from the opposite side (Alt in most editors). */
  fromCenter?: boolean;
  /** Smallest width and height, in world units. Default 1. */
  minSize?: number;
}

/**
 * The box after dragging `handle` of `start` to the world point `pointer`.
 *
 * Works in the box's own axes, so a turned box resizes along its turned edges
 * and the side opposite the handle stays where it was on screen.
 */
export function resizeRect(
  start: CanvasRect,
  handle: Exclude<CanvasHandle, "rotate">,
  pointer: CanvasPoint,
  { keepRatio = false, fromCenter = false, minSize = 1 }: ResizeOptions = {},
): CanvasRect {
  const [dx, dy] = HANDLE_DIRECTION[handle];
  const rot = start.rotation ?? 0;
  const c = rectCenter(start);
  // The fixed point, in world units: the side or corner opposite the handle,
  // or the centre.
  const anchorLocal = fromCenter
    ? { x: 0, y: 0 }
    : { x: (-dx * start.width) / 2, y: (-dy * start.height) / 2 };
  const anchor = rotatePoint({ x: c.x + anchorLocal.x, y: c.y + anchorLocal.y }, rot, c);
  // The pointer, in the box's axes, measured from the fixed point.
  const v = rotatePoint({ x: pointer.x - anchor.x, y: pointer.y - anchor.y }, -rot);
  const span = fromCenter ? 2 : 1;

  let width = dx === 0 ? start.width : Math.max(minSize, v.x * dx * span);
  let height = dy === 0 ? start.height : Math.max(minSize, v.y * dy * span);

  if (keepRatio && start.width > 0 && start.height > 0) {
    const sx = width / start.width;
    const sy = height / start.height;
    const s = dx === 0 ? sy : dy === 0 ? sx : Math.max(sx, sy);
    width = Math.max(minSize, start.width * s);
    height = Math.max(minSize, start.height * s);
  }

  // The new centre: from the fixed point, half the new size along the handle's
  // pull (or no offset when growing from the centre).
  const offset = fromCenter
    ? { x: 0, y: 0 }
    : rotatePoint({ x: (dx * width) / 2, y: (dy * height) / 2 }, rot);
  const center = { x: anchor.x + offset.x, y: anchor.y + offset.y };
  return { ...start, x: center.x - width / 2, y: center.y - height / 2, width, height };
}

/**
 * The box's rotation after the rotate handle is dragged from `from` to `to`,
 * both world points. `step` snaps it (15 with Shift in most editors).
 */
export function rotateRect(
  start: CanvasRect,
  from: CanvasPoint,
  to: CanvasPoint,
  { step }: { step?: number } = {},
): CanvasRect {
  const c = rectCenter(start);
  const a0 = Math.atan2(from.y - c.y, from.x - c.x);
  const a1 = Math.atan2(to.y - c.y, to.x - c.x);
  let deg = (start.rotation ?? 0) + (a1 - a0) / RAD;
  if (step) deg = Math.round(deg / step) * step;
  deg = ((deg % 360) + 360) % 360;
  if (deg > 180) deg -= 360;
  return { ...start, rotation: Math.abs(deg) < 1e-9 ? 0 : deg };
}

/* ── Snapping ───────────────────────────────────────────────────────────── */

/** A line to draw while something snaps: vertical at `x` or horizontal at `y`, from `start` to `end` along it. */
export interface CanvasGuide {
  axis: "x" | "y";
  /** Where the line sits across its axis, in world units. */
  at: number;
  start: number;
  end: number;
  /** The gap between the two boxes along the line, in world units, when they don't overlap. */
  gap?: number;
}

export interface SnapResult {
  /** `rect` moved onto its snap. */
  rect: CanvasRect;
  dx: number;
  dy: number;
  guides: CanvasGuide[];
}

const edges = (r: CanvasRect, axis: "x" | "y") => {
  const b = rectAABB(r);
  return axis === "x"
    ? [b.x, b.x + b.width / 2, b.x + b.width]
    : [b.y, b.y + b.height / 2, b.y + b.height];
};

/**
 * Moves `rect` so one of its edges or its centre lines up with an edge or
 * centre of one of `targets`, when one is within `threshold` world units, and
 * returns the guides that show it. Pass `threshold` in screen px divided by
 * the zoom so snapping feels the same at every zoom.
 */
export function snapRect(
  rect: CanvasRect,
  targets: CanvasRect[],
  { threshold = 6, axes = ["x", "y"] }: { threshold?: number; axes?: Array<"x" | "y"> } = {},
): SnapResult {
  const best: Record<"x" | "y", { delta: number; at: number } | null> = { x: null, y: null };
  for (const axis of axes) {
    const mine = edges(rect, axis);
    for (const t of targets) {
      for (const theirs of edges(t, axis)) {
        for (const m of mine) {
          const delta = theirs - m;
          if (Math.abs(delta) > threshold) continue;
          const current = best[axis];
          if (!current || Math.abs(delta) < Math.abs(current.delta)) {
            best[axis] = { delta, at: theirs };
          }
        }
      }
    }
  }
  const dx = best.x?.delta ?? 0;
  const dy = best.y?.delta ?? 0;
  const moved = { ...rect, x: rect.x + dx, y: rect.y + dy };

  // Every target that lines up with the snapped box draws its guide, so three
  // boxes in a row show one line through all of them.
  const guides: CanvasGuide[] = [];
  const mb = rectAABB(moved);
  for (const axis of ["x", "y"] as const) {
    const snap = best[axis];
    if (!snap) continue;
    const across = axis === "x" ? "y" : "x";
    const mineAcross = [mb[across], mb[across] + (across === "x" ? mb.width : mb.height)];
    let start = mineAcross[0];
    let end = mineAcross[1];
    let gap: number | undefined;
    for (const t of targets) {
      if (!edges(t, axis).some((e) => Math.abs(e - snap.at) < 1e-6)) continue;
      const tb = rectAABB(t);
      const tStart = tb[across];
      const tEnd = tStart + (across === "x" ? tb.width : tb.height);
      start = Math.min(start, tStart);
      end = Math.max(end, tEnd);
      const between =
        tStart > mineAcross[1]
          ? tStart - mineAcross[1]
          : mineAcross[0] > tEnd
            ? mineAcross[0] - tEnd
            : 0;
      if (between > 0 && (gap === undefined || between < gap)) gap = between;
    }
    guides.push({ axis, at: snap.at, start, end, gap });
  }
  return { rect: moved, dx, dy, guides };
}

/** Rounds a value to a grid of `step` world units. */
export const snapToGrid = (value: number, step: number) =>
  step > 0 ? Math.round(value / step) * step : value;
