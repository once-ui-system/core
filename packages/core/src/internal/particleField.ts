/**
 * The simulation behind ParticleFx, kept apart from the canvas so it can be
 * tested without one. Positions are in pixels of the field; nothing here
 * touches the DOM.
 */

/** A point in the shape's own box, both axes from -1 to 1. */
export type ShapePoint = readonly [number, number];

/**
 * What gathered particles form: a built-in mark, or your own points in a
 * -1…1 box (a logo traced to a few hundred points works well).
 */
export type ParticleShape = "star" | "ring" | "diamond" | ReadonlyArray<ShapePoint>;

/** Where the shape sits, as fractions of the field: centre x, centre y, and radius of the smaller side. */
export interface ParticleFocus {
  x?: number;
  y?: number;
  radius?: number;
}

export interface FieldOptions {
  width: number;
  height: number;
  count: number;
  shape?: ParticleShape;
  /** Share of particles that gather into the shape, 0 to 1. */
  gather?: number;
  focus?: ParticleFocus;
  /** Share of gathered particles that are sparks, 0 to 1. */
  sparks?: number;
  /** Smallest and largest particle size in px. */
  size?: number;
  random?: () => number;
}

export interface Field {
  count: number;
  width: number;
  height: number;
  /** Current position. */
  x: Float32Array;
  y: Float32Array;
  /** Home position the particle drifts around and springs back to. */
  hx: Float32Array;
  hy: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  size: Float32Array;
  phase: Float32Array;
  /** 1 for a spark: drawn larger, in the spark colour. */
  spark: Uint8Array;
  /** 1 for a particle that belongs to the shape. */
  gathered: Uint8Array;
  /** The shape's centre and radius in px, or null without a shape. */
  focus: { x: number; y: number; r: number } | null;
}

export interface StepOptions {
  /** Pointer position in px, or null when the pointer is away. */
  pointer: { x: number; y: number } | null;
  /** Reach of the pointer in px. */
  radius: number;
  mode: "repel" | "attract";
  /** Speed multiplier: how fast particles drift and settle. */
  speed: number;
  /** Elapsed time in ms. */
  time: number;
}

/** A point of a built-in or custom shape. `u` picks where along it, `v` how far in from the edge. */
export function shapePoint(shape: ParticleShape, u: number, v: number): ShapePoint {
  if (typeof shape !== "string") {
    if (shape.length === 0) return [0, 0];
    const [px, py] = shape[Math.min(shape.length - 1, Math.floor(u * shape.length))];
    const jitter = (v - 0.5) * 0.04;
    return [px + jitter, py - jitter];
  }
  const a = u * Math.PI * 2;
  if (shape === "ring") {
    const r = 1 - v * 0.12;
    return [Math.cos(a) * r, Math.sin(a) * r];
  }
  if (shape === "diamond") {
    // Uniform inside |x| + |y| <= 1, from a square turned by 45°.
    const p = u * 2 - 1;
    const q = v * 2 - 1;
    return [(p - q) / 2, (p + q) / 2];
  }
  // The four-point star: an astroid, filled densest toward its outline.
  const r = v ** 0.35;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return [Math.sign(c) * Math.abs(c) ** 3 * r, Math.sign(s) * Math.abs(s) ** 3 * r];
}

export function createField({
  width,
  height,
  count,
  shape,
  gather = 0.6,
  focus = {},
  sparks = 0,
  size = 2,
  random = Math.random,
}: FieldOptions): Field {
  const n = Math.max(0, Math.floor(count));
  const field: Field = {
    count: n,
    width,
    height,
    x: new Float32Array(n),
    y: new Float32Array(n),
    hx: new Float32Array(n),
    hy: new Float32Array(n),
    vx: new Float32Array(n),
    vy: new Float32Array(n),
    size: new Float32Array(n),
    phase: new Float32Array(n),
    spark: new Uint8Array(n),
    gathered: new Uint8Array(n),
    focus: null,
  };

  if (shape) {
    field.focus = {
      x: width * (focus.x ?? 0.5),
      y: height * (focus.y ?? 0.5),
      r: Math.min(width, height) * (focus.radius ?? 0.35),
    };
  }

  const gathered = field.focus ? Math.round(n * Math.min(1, Math.max(0, gather))) : 0;
  for (let i = 0; i < n; i++) {
    let hx: number;
    let hy: number;
    if (i < gathered && shape && field.focus) {
      const [sx, sy] = shapePoint(shape, random(), random());
      hx = field.focus.x + sx * field.focus.r;
      hy = field.focus.y + sy * field.focus.r;
      field.gathered[i] = 1;
      field.spark[i] = random() < sparks ? 1 : 0;
    } else {
      hx = random() * width;
      hy = random() * height;
    }
    field.hx[i] = hx;
    field.hy[i] = hy;
    field.x[i] = hx;
    field.y[i] = hy;
    field.size[i] = size * (0.4 + random() * 0.9);
    field.phase[i] = random() * Math.PI * 2;
  }
  return field;
}

/** Scatters every particle away from its home, for the gathering entrance. */
export function scatterField(field: Field, amount = 0.9, random = Math.random) {
  for (let i = 0; i < field.count; i++) {
    field.x[i] = field.hx[i] + (random() - 0.5) * field.width * amount;
    field.y[i] = field.hy[i] + (random() - 0.5) * field.height * amount;
  }
}

/** Advances the field by one frame. */
export function stepField(field: Field, { pointer, radius, mode, speed, time }: StepOptions) {
  const spring = 0.006 + 0.01 * Math.min(2, Math.max(0, speed));
  const damping = 0.88;
  const wander = 4;
  const r2 = radius * radius;
  const t = time * 0.001 * Math.max(0.05, speed);

  for (let i = 0; i < field.count; i++) {
    const phase = field.phase[i];
    // Each particle orbits its home a little, so the field never freezes.
    const tx = field.hx[i] + Math.sin(t + phase) * wander;
    const ty = field.hy[i] + Math.cos(t * 1.2 + phase) * wander;
    let vx = field.vx[i] + (tx - field.x[i]) * spring;
    let vy = field.vy[i] + (ty - field.y[i]) * spring;

    if (pointer && radius > 0) {
      const dx = field.x[i] - pointer.x;
      const dy = field.y[i] - pointer.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < r2) {
        const d = Math.sqrt(d2) + 0.001;
        const push = ((r2 - d2) / r2) * 1.6 * (mode === "attract" ? -0.35 : 1);
        vx += (dx / d) * push;
        vy += (dy / d) * push;
      }
    }

    vx *= damping;
    vy *= damping;
    field.vx[i] = vx;
    field.vy[i] = vy;
    field.x[i] += vx;
    field.y[i] += vy;
  }
}
