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

/**
 * A tube along points in the xy plane, written into `into` so a moving mouth reuses its buffers.
 * `closed` joins the last point back to the first, so a loop has no seam.
 */
export function tube(
  points: Point[],
  radius: number,
  sides = 8,
  into?: MeshData,
  closed = false,
): MeshData {
  const n = points.length;
  const count = n * (sides + 1);
  const segments = closed ? n : n - 1;
  const mesh: MeshData = into ?? {
    positions: new Float32Array(count * 3),
    normals: new Float32Array(count * 3),
    indices: new Uint16Array(segments * sides * 6),
  };
  for (let i = 0; i < n; i++) {
    const prev = closed ? points[(i - 1 + n) % n] : points[Math.max(0, i - 1)];
    const next = closed ? points[(i + 1) % n] : points[Math.min(n - 1, i + 1)];
    let tx = next[0] - prev[0];
    let ty = next[1] - prev[1];
    // A shut loop folds back on itself at its corners; there, run along the next stretch.
    if (Math.hypot(tx, ty) < 1e-6) {
      tx = next[0] - points[i][0];
      ty = next[1] - points[i][1];
    }
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
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j < sides; j++) {
        const a = i * (sides + 1) + j;
        const c = ((i + 1) % n) * (sides + 1) + j;
        mesh.indices.set([a, c, a + 1, a + 1, c, c + 1], k);
        k += 6;
      }
    }
  }
  return mesh;
}

/** The twenty faces of a regular icosahedron with circumradius 1, wound outward, as corner indices. */
function icosahedron() {
  const phi = (1 + Math.sqrt(5)) / 2;
  const raw: [number, number, number][] = [];
  for (const a of [-1, 1]) {
    for (const b of [-phi, phi]) raw.push([0, a, b], [a, b, 0], [b, 0, a]);
  }
  const vertices = raw.map((v) => {
    const l = Math.hypot(...v);
    return v.map((c) => c / l) as [number, number, number];
  });
  // The edge of an icosahedron with circumradius 1.
  const edge = 4 / Math.sqrt(10 + 2 * Math.sqrt(5));
  const near = (i: number, j: number) =>
    Math.abs(Math.hypot(...vertices[i].map((c, k) => c - vertices[j][k])) - edge) < 0.01;
  const faces: [number, number, number][] = [];
  for (let i = 0; i < 12; i++) {
    for (let j = i + 1; j < 12; j++) {
      for (let k = j + 1; k < 12; k++) {
        if (!near(i, j) || !near(j, k) || !near(i, k)) continue;
        const [a, b, c] = [vertices[i], vertices[j], vertices[k]];
        const u = b.map((v, n) => v - a[n]);
        const w = c.map((v, n) => v - a[n]);
        const cross = [
          u[1] * w[2] - u[2] * w[1],
          u[2] * w[0] - u[0] * w[2],
          u[0] * w[1] - u[1] * w[0],
        ];
        faces.push(cross[0] * a[0] + cross[1] * a[1] + cross[2] * a[2] > 0 ? [i, j, k] : [i, k, j]);
      }
    }
  }
  return { vertices, faces };
}

/**
 * A d20 with circumradius 1, each face split into a triangle grid with its own vertices, so the
 * edges stay crisp once it is flat. It rests with one face toward +z and the point of that face up,
 * like the die on once-ui.com. `face` gives each vertex's face, `normals` start as the face normals.
 */
export function icosaGrid(segments: number): MeshData & {
  face: Uint8Array;
  faceNormals: Float32Array;
  faceCenters: Float32Array;
} {
  const { vertices, faces } = icosahedron();
  // Turn the rest pose: the first face's normal to +z, then its first corner straight up.
  const [f0a, f0b, f0c] = faces[0].map((i) => vertices[i]);
  const n0 = [0, 1, 2].map((k) => (f0a[k] + f0b[k] + f0c[k]) / 3);
  const nl = Math.hypot(...n0);
  const z = n0.map((c) => c / nl);
  const up = f0a.map((c, k) => c - z[k] * (f0a[0] * z[0] + f0a[1] * z[1] + f0a[2] * z[2]));
  const ul = Math.hypot(...up);
  const y = up.map((c) => c / ul);
  const x = [y[1] * z[2] - y[2] * z[1], y[2] * z[0] - y[0] * z[2], y[0] * z[1] - y[1] * z[0]];
  const turn = (v: number[]): [number, number, number] => [
    v[0] * x[0] + v[1] * x[1] + v[2] * x[2],
    v[0] * y[0] + v[1] * y[1] + v[2] * y[2],
    v[0] * z[0] + v[1] * z[1] + v[2] * z[2],
  ];
  const corners = vertices.map(turn);

  const perFace = ((segments + 1) * (segments + 2)) / 2;
  const count = perFace * 20;
  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const face = new Uint8Array(count);
  const faceNormals = new Float32Array(60);
  const faceCenters = new Float32Array(60);
  const indices = new Uint16Array(segments * segments * 3 * 20);
  const groups: { start: number; count: number }[] = [];
  let v = 0;
  let k = 0;
  faces.forEach(([ia, ib, ic], f) => {
    const [a, b, c] = [corners[ia], corners[ib], corners[ic]];
    const center = [0, 1, 2].map((n) => (a[n] + b[n] + c[n]) / 3);
    const cl = Math.hypot(...center);
    faceCenters.set(center, f * 3);
    faceNormals.set(
      center.map((n) => n / cl),
      f * 3,
    );
    const base = v;
    const row = (i: number) => base + (i * (i + 1)) / 2;
    for (let i = 0; i <= segments; i++) {
      for (let j = 0; j <= i; j++) {
        // From corner a down the rows toward b and c.
        const s = i / segments;
        const t = i === 0 ? 0 : j / i;
        for (let n = 0; n < 3; n++) {
          positions[v * 3 + n] = a[n] + s * (b[n] - a[n]) + s * t * (c[n] - b[n]);
          normals[v * 3 + n] = center[n] / cl;
        }
        face[v] = f;
        v++;
      }
    }
    const start = k;
    for (let i = 0; i < segments; i++) {
      for (let j = 0; j <= i; j++) {
        const p = row(i) + j;
        const q = row(i + 1) + j;
        indices.set([p, q, q + 1], k);
        k += 3;
        if (j < i) {
          indices.set([p, q + 1, p + 1], k);
          k += 3;
        }
      }
    }
    groups.push({ start, count: k - start });
  });
  return { positions, normals, indices, groups, face, faceNormals, faceCenters };
}
