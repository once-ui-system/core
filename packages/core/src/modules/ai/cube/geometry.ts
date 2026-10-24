/* Meshes for the cube mascot, built by hand so core needs no 3D library. Every outline here is
   convex, which keeps triangulation to simple fans. */

export interface MeshData {
  positions: Float32Array;
  normals: Float32Array;
  indices: Uint16Array;
  /** Index ranges drawn with their own color, such as the six faces of a box. */
  groups?: { start: number; count: number }[];
}

type Point = [number, number];

/**
 * A 2 × 2 × 2 box split into a grid on every face, in the order +x, -x, +y, -y, +z, -z.
 * Vertex positions are only a starting point: the scene bends them into a blob or a rounded piece.
 */
export function boxGrid(segments: number): MeshData {
  const perFace = (segments + 1) ** 2;
  const positions = new Float32Array(perFace * 6 * 3);
  const normals = new Float32Array(perFace * 6 * 3);
  const indices = new Uint16Array(segments * segments * 6 * 6);
  const groups: { start: number; count: number }[] = [];
  let v = 0;
  let k = 0;
  for (let face = 0; face < 6; face++) {
    const axis = face >> 1;
    const sign = face & 1 ? -1 : 1;
    const u = (axis + 1) % 3;
    const w = (axis + 2) % 3;
    const base = v;
    for (let j = 0; j <= segments; j++) {
      for (let i = 0; i <= segments; i++) {
        const p = [0, 0, 0];
        p[axis] = sign;
        p[u] = -1 + (2 * i) / segments;
        p[w] = -1 + (2 * j) / segments;
        positions.set(p, v * 3);
        normals[v * 3 + axis] = sign;
        v++;
      }
    }
    const start = k;
    for (let j = 0; j < segments; j++) {
      for (let i = 0; i < segments; i++) {
        const a = base + j * (segments + 1) + i;
        const b = a + 1;
        const c = a + segments + 1;
        const d = c + 1;
        if (sign > 0) indices.set([a, b, d, a, d, c], k);
        else indices.set([a, d, b, a, c, d], k);
        k += 6;
      }
    }
    groups.push({ start, count: k - start });
  }
  return { positions, normals, indices, groups };
}

export function sphere(radius: number, columns = 32, rows = 20): MeshData {
  const count = (columns + 1) * (rows + 1);
  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const indices = new Uint16Array(columns * rows * 6);
  let v = 0;
  for (let j = 0; j <= rows; j++) {
    const phi = (j / rows) * Math.PI;
    for (let i = 0; i <= columns; i++) {
      const theta = (i / columns) * Math.PI * 2;
      const n = [Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta)];
      normals.set(n, v * 3);
      positions.set(
        n.map((c) => c * radius),
        v * 3,
      );
      v++;
    }
  }
  let k = 0;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < columns; i++) {
      const a = j * (columns + 1) + i;
      const c = a + columns + 1;
      indices.set([a, c, a + 1, a + 1, c, c + 1], k);
      k += 6;
    }
  }
  return { positions, normals, indices };
}

/** A unit square in the xy plane, facing +z, for soft glows and the floor shadow. */
export function quad(): MeshData {
  return {
    positions: new Float32Array([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0]),
    normals: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1]),
    indices: new Uint16Array([0, 1, 2, 0, 2, 3]),
  };
}

export function torus(radius: number, tube: number, segments = 40, sides = 12): MeshData {
  const count = (segments + 1) * (sides + 1);
  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const indices = new Uint16Array(segments * sides * 6);
  let v = 0;
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    for (let j = 0; j <= sides; j++) {
      const b = (j / sides) * Math.PI * 2;
      const n = [Math.cos(b) * Math.cos(a), Math.cos(b) * Math.sin(a), Math.sin(b)];
      normals.set(n, v * 3);
      positions.set(
        [
          (radius + tube * Math.cos(b)) * Math.cos(a),
          (radius + tube * Math.cos(b)) * Math.sin(a),
          tube * Math.sin(b),
        ],
        v * 3,
      );
      v++;
    }
  }
  let k = 0;
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < sides; j++) {
      const a = i * (sides + 1) + j;
      const c = a + sides + 1;
      indices.set([a, c, a + 1, a + 1, c, c + 1], k);
      k += 6;
    }
  }
  return { positions, normals, indices };
}

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

function outlineNormals(pts: Point[]): Point[] {
  return pts.map((_, i) => {
    const prev = pts[(i + pts.length - 1) % pts.length];
    const next = pts[(i + 1) % pts.length];
    const dx = next[0] - prev[0];
    const dy = next[1] - prev[1];
    const l = Math.hypot(dx, dy) || 1;
    return [dy / l, -dx / l];
  });
}

/** A flat shape at z = 0, facing +z. */
export function flatShape(pts: Point[]): MeshData {
  const n = pts.length;
  const positions = new Float32Array((n + 1) * 3);
  const normals = new Float32Array((n + 1) * 3);
  const indices = new Uint16Array(n * 3);
  pts.forEach((p, i) => {
    positions.set([p[0], p[1], 0], i * 3);
    normals.set([0, 0, 1], i * 3);
  });
  normals.set([0, 0, 1], n * 3);
  for (let i = 0; i < n; i++) indices.set([n, i, (i + 1) % n], i * 3);
  return { positions, normals, indices };
}

/** A shape raised into a soft pillow: rounded edges rising from the outline to a flat top. */
export function pillowShape(pts: Point[], height = 0.14, bevel = 0.08, rings = 6): MeshData {
  const n = pts.length;
  const out = outlineNormals(pts);
  const positions = new Float32Array((n * (rings + 1) + 1) * 3);
  const normals = new Float32Array((n * (rings + 1) + 1) * 3);
  const indices = new Uint16Array(n * rings * 6 + n * 3);
  const base = -height * 0.35;
  for (let r = 0; r <= rings; r++) {
    const theta = (r / rings) * (Math.PI / 2);
    const inset = bevel * (1 - Math.cos(theta));
    for (let i = 0; i < n; i++) {
      const v = r * n + i;
      positions.set(
        [
          pts[i][0] - out[i][0] * inset,
          pts[i][1] - out[i][1] * inset,
          base + height * Math.sin(theta),
        ],
        v * 3,
      );
      normals.set(
        [out[i][0] * Math.cos(theta), out[i][1] * Math.cos(theta), Math.sin(theta)],
        v * 3,
      );
    }
  }
  const center = n * (rings + 1);
  positions.set([0, 0, base + height], center * 3);
  normals.set([0, 0, 1], center * 3);
  let k = 0;
  for (let r = 0; r < rings; r++) {
    for (let i = 0; i < n; i++) {
      const a = r * n + i;
      const b = r * n + ((i + 1) % n);
      indices.set([a, b, b + n, a, b + n, a + n], k);
      k += 6;
    }
  }
  for (let i = 0; i < n; i++) {
    indices.set([center, rings * n + i, rings * n + ((i + 1) % n)], k);
    k += 3;
  }
  return { positions, normals, indices };
}

/** A tube along points in the xy plane, written into `into` so a moving mouth reuses its buffers. */
export function tube(points: Point[], radius: number, sides = 8, into?: MeshData): MeshData {
  const n = points.length;
  const count = n * (sides + 1);
  const mesh: MeshData = into ?? {
    positions: new Float32Array(count * 3),
    normals: new Float32Array(count * 3),
    indices: new Uint16Array((n - 1) * sides * 6),
  };
  for (let i = 0; i < n; i++) {
    const prev = points[Math.max(0, i - 1)];
    const next = points[Math.min(n - 1, i + 1)];
    const tx = next[0] - prev[0];
    const ty = next[1] - prev[1];
    const tl = Math.hypot(tx, ty) || 1;
    const nx = -ty / tl;
    const ny = tx / tl;
    for (let j = 0; j <= sides; j++) {
      const a = (j / sides) * Math.PI * 2;
      const c = Math.cos(a);
      const s = Math.sin(a);
      const v = i * (sides + 1) + j;
      mesh.normals.set([nx * c, ny * c, s], v * 3);
      mesh.positions.set(
        [points[i][0] + nx * c * radius, points[i][1] + ny * c * radius, s * radius],
        v * 3,
      );
    }
  }
  if (!into) {
    let k = 0;
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < sides; j++) {
        const a = i * (sides + 1) + j;
        const c = a + sides + 1;
        mesh.indices.set([a, c, a + 1, a + 1, c, c + 1], k);
        k += 6;
      }
    }
  }
  return mesh;
}
