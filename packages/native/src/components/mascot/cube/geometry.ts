/* The outlines from core's packages/core/src/modules/ai/cube/geometry.ts, unchanged: the eye,
   brow and tile shapes the cube mascot's face is drawn with. The meshes there feed WebGL, which a
   phone does not have, so they are left out; the pieces are drawn as projected SVG polygons. */

export type Point = [number, number];

/* ---------- outlines, counter-clockwise, around 0,0 ---------- */

function arc(cx: number, cy: number, r: number, from: number, to: number, steps: number) {
  const out: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = from + ((to - from) * i) / steps;
    out.push([cx + Math.cos(t) * r, cy + Math.sin(t) * r]);
  }
  return out;
}

export const circleOutline = (r: number, steps = 48): Point[] =>
  arc(0, 0, r, 0, Math.PI * 2, steps).slice(0, -1);

/** A capsule: `halfLength` from the middle to each end's center, along x (`horizontal`) or y. */
export function capsuleOutline(halfLength: number, radius: number, horizontal: boolean): Point[] {
  const pts = horizontal
    ? [
        ...arc(halfLength, 0, radius, -Math.PI / 2, Math.PI / 2, 16),
        ...arc(-halfLength, 0, radius, Math.PI / 2, Math.PI * 1.5, 16),
      ]
    : [
        ...arc(0, -halfLength, radius, Math.PI, Math.PI * 2, 16),
        ...arc(0, halfLength, radius, 0, Math.PI, 16),
      ];
  return pts;
}

/**
 * The Once UI tile: a square turned 45°, a little wider than tall, with a big round top and
 * every other corner rounded too. `cut` is how far along the two edges each rounding starts.
 */
export function tileOutline(): Point[] {
  const corners: Point[] = [
    [0, -0.5],
    [0.5, 0],
    [0, 0.5],
    [-0.5, 0],
  ];
  const cut = [0.16, 0.16, 0.27, 0.16];
  const edge = Math.SQRT1_2;
  const along = (from: Point, to: Point, d: number): Point => [
    from[0] + ((to[0] - from[0]) * d) / edge,
    from[1] + ((to[1] - from[1]) * d) / edge,
  ];
  const out: Point[] = [];
  for (let i = 0; i < 4; i++) {
    const prev = corners[(i + 3) % 4];
    const cur = corners[i];
    const next = corners[(i + 1) % 4];
    const a = along(cur, prev, cut[i]);
    const b = along(cur, next, cut[i]);
    // A cubic with 0.55 handles: close to a circular arc.
    const c1: Point = [a[0] + (cur[0] - a[0]) * 0.55, a[1] + (cur[1] - a[1]) * 0.55];
    const c2: Point = [b[0] + (cur[0] - b[0]) * 0.55, b[1] + (cur[1] - b[1]) * 0.55];
    for (let s = 0; s <= 10; s++) {
      const t = s / 10;
      const m = 1 - t;
      out.push([
        m ** 3 * a[0] + 3 * m * m * t * c1[0] + 3 * m * t * t * c2[0] + t ** 3 * b[0],
        (m ** 3 * a[1] + 3 * m * m * t * c1[1] + 3 * m * t * t * c2[1] + t ** 3 * b[1]) * 0.86,
      ]);
    }
  }
  return out;
}
