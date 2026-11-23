/**
 * A body outline as points, so accessories can sit on any body: the generated
 * superellipse, a canonical mascot's own path, or a `bodyPath` someone drew.
 * Plain math, no DOM, so `mascotSvg` can use it on the server.
 */

export type OutlinePoint = readonly [number, number];

const NUMBER = /-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi;
const COMMAND = /[MLHVCSQTAZ][^MLHVCSQTAZ]*/gi;
/** Points per curve: plenty for a 200 × 200 box. */
const STEPS = 12;

/** Every subpath of an SVG path as a polyline, curves and arcs flattened. Unknown input gives []. */
export function outlinePoints(d: string): OutlinePoint[][] {
  const shapes: OutlinePoint[][] = [];
  let current: OutlinePoint[] = [];
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;
  // The last control point, for S and T.
  let cx = 0;
  let cy = 0;
  let previous = "";

  const push = (px: number, py: number) => {
    current.push([px, py]);
    x = px;
    y = py;
  };

  for (const chunk of d.match(COMMAND) ?? []) {
    const letter = chunk[0];
    const upper = letter.toUpperCase();
    const rel = letter !== upper;
    const args = (chunk.slice(1).match(NUMBER) ?? []).map(Number);
    const ox = () => (rel ? x : 0);
    const oy = () => (rel ? y : 0);

    if (upper === "Z") {
      if (current.length) push(startX, startY);
      if (current.length > 1) shapes.push(current);
      current = [];
      previous = upper;
      continue;
    }

    const size = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7 }[upper] ?? 0;
    if (!size) return [];
    for (let i = 0; i + size <= args.length; i += size) {
      const a = args.slice(i, i + size);
      let command = upper;
      if (command === "M" && i > 0) command = "L";
      switch (command) {
        case "M": {
          if (current.length > 1) shapes.push(current);
          current = [];
          const px = a[0] + ox();
          const py = a[1] + oy();
          startX = px;
          startY = py;
          push(px, py);
          break;
        }
        case "L":
          push(a[0] + ox(), a[1] + oy());
          break;
        case "H":
          push(a[0] + ox(), y);
          break;
        case "V":
          push(x, a[0] + oy());
          break;
        case "C":
        case "S": {
          const reflect = previous === "C" || previous === "S";
          const c1x = command === "C" ? a[0] + ox() : reflect ? 2 * x - cx : x;
          const c1y = command === "C" ? a[1] + oy() : reflect ? 2 * y - cy : y;
          const j = command === "C" ? 2 : 0;
          const c2x = a[j] + ox();
          const c2y = a[j + 1] + oy();
          const ex = a[j + 2] + ox();
          const ey = a[j + 3] + oy();
          const sx = x;
          const sy = y;
          for (let k = 1; k <= STEPS; k++) {
            const t = k / STEPS;
            const u = 1 - t;
            push(
              u * u * u * sx + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * ex,
              u * u * u * sy + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * ey,
            );
          }
          cx = c2x;
          cy = c2y;
          break;
        }
        case "Q":
        case "T": {
          const reflect = previous === "Q" || previous === "T";
          const qx = command === "Q" ? a[0] + ox() : reflect ? 2 * x - cx : x;
          const qy = command === "Q" ? a[1] + oy() : reflect ? 2 * y - cy : y;
          const j = command === "Q" ? 2 : 0;
          const ex = a[j] + ox();
          const ey = a[j + 1] + oy();
          const sx = x;
          const sy = y;
          for (let k = 1; k <= STEPS; k++) {
            const t = k / STEPS;
            const u = 1 - t;
            push(
              u * u * sx + 2 * u * t * qx + t * t * ex,
              u * u * sy + 2 * u * t * qy + t * t * ey,
            );
          }
          cx = qx;
          cy = qy;
          break;
        }
        case "A":
          for (const point of arcPoints(x, y, a, ox(), oy())) push(point[0], point[1]);
          break;
      }
      previous = command;
    }
  }
  if (current.length > 1) shapes.push(current);
  return shapes;
}

/* An elliptical arc as points (SVG's endpoint to centre conversion). */
function arcPoints(x1: number, y1: number, a: number[], ox: number, oy: number): OutlinePoint[] {
  let [rx, ry] = [Math.abs(a[0]), Math.abs(a[1])];
  const phi = (a[2] * Math.PI) / 180;
  const large = a[3] !== 0;
  const sweep = a[4] !== 0;
  const x2 = a[5] + ox;
  const y2 = a[6] + oy;
  if (!rx || !ry) return [[x2, y2]];
  const cos = Math.cos(phi);
  const sin = Math.sin(phi);
  const dx = (x1 - x2) / 2;
  const dy = (y1 - y2) / 2;
  const x1p = cos * dx + sin * dy;
  const y1p = -sin * dx + cos * dy;
  const scale = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
  if (scale > 1) {
    rx *= Math.sqrt(scale);
    ry *= Math.sqrt(scale);
  }
  const num = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p;
  const den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
  const root = Math.sqrt(Math.max(0, num / den)) * (large === sweep ? -1 : 1);
  const cxp = (root * rx * y1p) / ry;
  const cyp = (-root * ry * x1p) / rx;
  const ccx = cos * cxp - sin * cyp + (x1 + x2) / 2;
  const ccy = sin * cxp + cos * cyp + (y1 + y2) / 2;
  const angle = (ux: number, uy: number, vx: number, vy: number) =>
    Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy);
  const start = angle(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry);
  let delta = angle((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
  if (!sweep && delta > 0) delta -= 2 * Math.PI;
  if (sweep && delta < 0) delta += 2 * Math.PI;
  const steps = Math.max(4, Math.ceil((Math.abs(delta) / (Math.PI / 2)) * STEPS));
  const points: OutlinePoint[] = [];
  for (let k = 1; k <= steps; k++) {
    const t = start + (delta * k) / steps;
    const ex = rx * Math.cos(t);
    const ey = ry * Math.sin(t);
    points.push([cos * ex - sin * ey + ccx, sin * ex + cos * ey + ccy]);
  }
  return points;
}

/** Each edge of the outline, for crossing tests. */
function edges(shapes: OutlinePoint[][]) {
  const out: [OutlinePoint, OutlinePoint][] = [];
  for (const shape of shapes) {
    for (let i = 1; i < shape.length; i++) out.push([shape[i - 1], shape[i]]);
  }
  return out;
}

/** What accessories need to know about a body outline. */
export interface OutlineMeasure {
  left: number;
  right: number;
  top: number;
  bottom: number;
  /** The highest point of the outline straight above or below x, or undefined off the body. */
  topAt: (x: number) => number | undefined;
  /** The left and right edges of the outline at height y, or undefined above or below it. */
  spanAt: (y: number) => readonly [number, number] | undefined;
}

/** Measures an SVG path for accessories. Returns undefined when the path can't be read. */
export function measureOutline(d: string): OutlineMeasure | undefined {
  const shapes = outlinePoints(d);
  const all = shapes.flat();
  if (all.length < 3) return undefined;
  const lines = edges(shapes);
  const xs = all.map((point) => point[0]);
  const ys = all.map((point) => point[1]);
  return {
    left: Math.min(...xs),
    right: Math.max(...xs),
    top: Math.min(...ys),
    bottom: Math.max(...ys),
    topAt: (x) => {
      let best: number | undefined;
      for (const [[ax, ay], [bx, by]] of lines) {
        if ((x < ax && x < bx) || (x > ax && x > bx)) continue;
        const y = ax === bx ? Math.min(ay, by) : ay + ((x - ax) / (bx - ax)) * (by - ay);
        if (best === undefined || y < best) best = y;
      }
      return best;
    },
    spanAt: (y) => {
      let low: number | undefined;
      let high: number | undefined;
      for (const [[ax, ay], [bx, by]] of lines) {
        if ((y < ay && y < by) || (y > ay && y > by)) continue;
        const x = ay === by ? Math.min(ax, bx) : ax + ((y - ay) / (by - ay)) * (bx - ax);
        const far = ay === by ? Math.max(ax, bx) : x;
        if (low === undefined || x < low) low = x;
        if (high === undefined || far > high) high = far;
      }
      return low === undefined || high === undefined ? undefined : [low, high];
    },
  };
}
