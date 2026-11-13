/* Mirrors core's packages/core/src/modules/ai/cube/math.ts, unchanged, so the phone turns
   the cube with the same numbers as the browser. Keep the two in step. */

/* Just enough linear algebra for the cube mascot: column-major 4×4 matrices and quaternions. */

export type Vec3 = [number, number, number];
export type Quat = [number, number, number, number];
export type Mat4 = Float32Array;

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (a: number, b: number, value: number) => {
  const t = clamp((value - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

export const identity = (): Mat4 => {
  const m = new Float32Array(16);
  m[0] = m[5] = m[10] = m[15] = 1;
  return m;
};

export function multiply(a: Mat4, b: Mat4, out: Mat4 = new Float32Array(16)): Mat4 {
  for (let c = 0; c < 4; c++) {
    const b0 = b[c * 4];
    const b1 = b[c * 4 + 1];
    const b2 = b[c * 4 + 2];
    const b3 = b[c * 4 + 3];
    for (let r = 0; r < 4; r++) {
      out[c * 4 + r] = a[r] * b0 + a[4 + r] * b1 + a[8 + r] * b2 + a[12 + r] * b3;
    }
  }
  return out;
}

export function perspective(fovY: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1 / Math.tan(fovY / 2);
  const m = new Float32Array(16);
  m[0] = f / aspect;
  m[5] = f;
  m[10] = (far + near) / (near - far);
  m[11] = -1;
  m[14] = (2 * far * near) / (near - far);
  return m;
}

/** A camera at `eye` looking at the origin, as a view matrix. */
export function lookAtOrigin(eye: Vec3): Mat4 {
  const len = Math.hypot(...eye) || 1;
  const z: Vec3 = [eye[0] / len, eye[1] / len, eye[2] / len];
  let x: Vec3 = [z[2], 0, -z[0]]; // up × z, with up = +y
  const xl = Math.hypot(...x) || 1;
  x = [x[0] / xl, x[1] / xl, x[2] / xl];
  const y: Vec3 = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
  const m = identity();
  m[0] = x[0];
  m[4] = x[1];
  m[8] = x[2];
  m[1] = y[0];
  m[5] = y[1];
  m[9] = y[2];
  m[2] = z[0];
  m[6] = z[1];
  m[10] = z[2];
  m[12] = -(x[0] * eye[0] + x[1] * eye[1] + x[2] * eye[2]);
  m[13] = -(y[0] * eye[0] + y[1] * eye[1] + y[2] * eye[2]);
  m[14] = -(z[0] * eye[0] + z[1] * eye[1] + z[2] * eye[2]);
  return m;
}

/** Translation, rotation (a quaternion) and scale in one matrix. */
export function compose(p: Vec3, q: Quat, s: Vec3, out: Mat4 = new Float32Array(16)): Mat4 {
  const [x, y, z, w] = q;
  const x2 = x + x;
  const y2 = y + y;
  const z2 = z + z;
  const xx = x * x2;
  const xy = x * y2;
  const xz = x * z2;
  const yy = y * y2;
  const yz = y * z2;
  const zz = z * z2;
  const wx = w * x2;
  const wy = w * y2;
  const wz = w * z2;
  out[0] = (1 - (yy + zz)) * s[0];
  out[1] = (xy + wz) * s[0];
  out[2] = (xz - wy) * s[0];
  out[3] = 0;
  out[4] = (xy - wz) * s[1];
  out[5] = (1 - (xx + zz)) * s[1];
  out[6] = (yz + wx) * s[1];
  out[7] = 0;
  out[8] = (xz + wy) * s[2];
  out[9] = (yz - wx) * s[2];
  out[10] = (1 - (xx + yy)) * s[2];
  out[11] = 0;
  out[12] = p[0];
  out[13] = p[1];
  out[14] = p[2];
  out[15] = 1;
  return out;
}

/** The inverse transpose of the upper 3×3, for transforming normals. */
export function normalMatrix(m: Mat4, out: Float32Array = new Float32Array(9)): Float32Array {
  const a = m[0];
  const b = m[1];
  const c = m[2];
  const d = m[4];
  const e = m[5];
  const f = m[6];
  const g = m[8];
  const h = m[9];
  const i = m[10];
  const A = e * i - f * h;
  const B = -(d * i - f * g);
  const C = d * h - e * g;
  const det = a * A + b * B + c * C || 1;
  const inv = 1 / det;
  // The inverse's transpose, so normals turn with the model rather than against it.
  out[0] = A * inv;
  out[1] = B * inv;
  out[2] = C * inv;
  out[3] = (-(b * i) + c * h) * inv;
  out[4] = (a * i - c * g) * inv;
  out[5] = (-(a * h) + b * g) * inv;
  out[6] = (b * f - c * e) * inv;
  out[7] = (-(a * f) + c * d) * inv;
  out[8] = (a * e - b * d) * inv;
  return out;
}

export const quatIdentity = (): Quat => [0, 0, 0, 1];

export function quatAxisAngle(axis: 0 | 1 | 2, angle: number): Quat {
  const s = Math.sin(angle / 2);
  const q: Quat = [0, 0, 0, Math.cos(angle / 2)];
  q[axis] = s;
  return q;
}

export function quatMultiply(a: Quat, b: Quat): Quat {
  const [ax, ay, az, aw] = a;
  const [bx, by, bz, bw] = b;
  return [
    ax * bw + aw * bx + ay * bz - az * by,
    ay * bw + aw * by + az * bx - ax * bz,
    az * bw + aw * bz + ax * by - ay * bx,
    aw * bw - ax * bx - ay * by - az * bz,
  ];
}

/** Rotation by Euler angles applied in X, then Y, then Z order (as a matrix product Rx·Ry·Rz). */
export function quatEuler(x: number, y: number, z: number): Quat {
  return quatMultiply(quatMultiply(quatAxisAngle(0, x), quatAxisAngle(1, y)), quatAxisAngle(2, z));
}

/** The rotation that takes +z to the unit vector `n`. */
export function quatFromZ(n: Vec3): Quat {
  const d = n[2];
  if (d < -0.999999) return [1, 0, 0, 0];
  const q: Quat = [-n[1], n[0], 0, 1 + d];
  const l = Math.hypot(...q);
  return [q[0] / l, q[1] / l, q[2] / l, q[3] / l];
}

export function rotate(q: Quat, v: Vec3): Vec3 {
  const [x, y, z, w] = q;
  const ix = w * v[0] + y * v[2] - z * v[1];
  const iy = w * v[1] + z * v[0] - x * v[2];
  const iz = w * v[2] + x * v[1] - y * v[0];
  const iw = -x * v[0] - y * v[1] - z * v[2];
  return [
    ix * w + iw * -x + iy * -z - iz * -y,
    iy * w + iw * -y + iz * -x - ix * -z,
    iz * w + iw * -z + ix * -y - iy * -x,
  ];
}

/** Snaps a rotation to the nearest exact quarter turn, so turns never drift. */
export function snapQuarterTurns(q: Quat): Quat {
  const ex = rotate(q, [1, 0, 0]).map(Math.round) as Vec3;
  const ey = rotate(q, [0, 1, 0]).map(Math.round) as Vec3;
  const ez = rotate(q, [0, 0, 1]).map(Math.round) as Vec3;
  // Matrix (columns ex, ey, ez) to quaternion.
  const m00 = ex[0];
  const m11 = ey[1];
  const m22 = ez[2];
  const trace = m00 + m11 + m22;
  let out: Quat;
  if (trace > 0) {
    const s = 0.5 / Math.sqrt(trace + 1);
    out = [(ey[2] - ez[1]) * s, (ez[0] - ex[2]) * s, (ex[1] - ey[0]) * s, 0.25 / s];
  } else if (m00 > m11 && m00 > m22) {
    const s = 2 * Math.sqrt(1 + m00 - m11 - m22);
    out = [0.25 * s, (ey[0] + ex[1]) / s, (ez[0] + ex[2]) / s, (ey[2] - ez[1]) / s];
  } else if (m11 > m22) {
    const s = 2 * Math.sqrt(1 + m11 - m00 - m22);
    out = [(ey[0] + ex[1]) / s, 0.25 * s, (ez[1] + ey[2]) / s, (ez[0] - ex[2]) / s];
  } else {
    const s = 2 * Math.sqrt(1 + m22 - m00 - m11);
    out = [(ez[0] + ex[2]) / s, (ez[1] + ey[2]) / s, 0.25 * s, (ex[1] - ey[0]) / s];
  }
  return out;
}
