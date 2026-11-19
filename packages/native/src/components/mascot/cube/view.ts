/* The cube mascot as flat shapes for react-native-svg. Core's view.ts draws the same scene with
   WebGL; a phone has no WebGL here, so this projects it with core's camera (eye at 0, 0.25, 6.6,
   a 30° field of view) into the mascot's 200 × 200 box instead: every piece's faces are
   projected, the ones turned away dropped, the pieces drawn far to near (the painter's
   algorithm) and each face filled with its side's color, shaded by the way it faces. The face
   (eyes, brows, mouth) is projected onto the front the same way. `rounded`, `blobAt`,
   `cubeSides` and the look types are core's, unchanged. */

import { capsuleOutline, circleOutline, type Point, tileOutline } from "./geometry";
import {
  clamp,
  compose,
  lookAtOrigin,
  type Mat4,
  mix,
  multiply,
  perspective,
  type Quat,
  quatAxisAngle,
  quatEuler,
  quatMultiply,
  rotate,
  smooth,
  type Vec3,
} from "./math";
import type { CubeInput, CubeMotion } from "./state";

export type RGB = [number, number, number];
export type CubeSide = "top" | "front" | "right" | "bottom" | "back" | "left";
export type CubeEyes = "round" | "pill" | "tile" | "wide" | "dot";

export interface CubeLook {
  /** The blob's color, which is also the front of the cube. */
  color: RGB;
  sides: Record<CubeSide, RGB>;
  eyeColor: RGB;
  roundness: number;
  aspect: number;
  eyes: CubeEyes;
  eyeSize: number;
  eyeSpacing: number;
  eyeHeight: number;
  brows: boolean;
  mouth: boolean;
  cheeks: boolean;
  /** `flat` paints the features on, unlit. */
  face: "3d" | "flat";
  /** `solid` drops the light entirely: every surface one flat color. */
  surface: "glossy" | "matte" | "solid";
}

/* BoxGeometry face order +x, -x, +y, -y, +z, -z. */
const FACE_SIDE: CubeSide[] = ["right", "left", "top", "bottom", "front", "back"];
const BEVEL = 0.2;
const GAP = 0.04;
const BLOB_R = 1.12;
const DARK: RGB = [0.067, 0.071, 0.086];
const WHITE: RGB = [1, 1, 1];
/** Points round the mouth's outline, from its left corner. */
const MOUTH_POINTS = 25;

const CLASSIC: Record<Exclude<CubeSide, "front">, RGB> = {
  top: [0.957, 0.957, 0.949],
  right: [0.91, 0.2, 0.235],
  bottom: [1, 0.831, 0.231],
  back: [0.184, 0.42, 1],
  left: [1, 0.541, 0.122],
};

export const mixRGB = (a: RGB, b: RGB, t: number): RGB => [
  mix(a[0], b[0], t),
  mix(a[1], b[1], t),
  mix(a[2], b[2], t),
];

/** The six sides from a preset or a color per side; the front follows the body color unless set. */
export function cubeSides(
  sides: "classic" | "tints" | "mono" | Partial<Record<CubeSide, string>> | undefined,
  color: RGB,
  resolve: (css: string) => RGB,
): Record<CubeSide, RGB> {
  const white: RGB = [1, 1, 1];
  const black: RGB = [0, 0, 0];
  if (sides === "mono") {
    return { front: color, top: color, right: color, bottom: color, back: color, left: color };
  }
  if (sides === "tints") {
    return {
      front: color,
      top: mixRGB(color, white, 0.8),
      right: mixRGB(color, black, 0.25),
      bottom: mixRGB(color, black, 0.55),
      back: mixRGB(color, white, 0.3),
      left: mixRGB(color, white, 0.5),
    };
  }
  const out: Record<CubeSide, RGB> = { front: color, ...CLASSIC };
  if (typeof sides === "object") {
    for (const [side, css] of Object.entries(sides)) {
      if (css) out[side as CubeSide] = resolve(css);
    }
  }
  return out;
}

/** `#rrggbb` (or `#rgb`) as 0–1 RGB; `fallback` for anything else. */
export function hexToRGB(hex: string, fallback: RGB = [0.45, 0.5, 0.95]): RGB {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3 || h.length === 4) h = [...h.slice(0, 3)].map((c) => c + c).join("");
  const value = Number.parseInt(h.slice(0, 6), 16);
  if (h.length < 6 || Number.isNaN(value)) return fallback;
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

export function rgbToHex([r, g, b]: RGB) {
  const c = (v: number) =>
    Math.round(clamp(v, 0, 1) * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** A point on a rounded box of half-size 1 with corner radius r, and its normal, for a point p on the box. */
function rounded(px: number, py: number, pz: number, r: number, out: Float32Array) {
  const lim = 1 - r;
  const qx = clamp(px, -lim, lim);
  const qy = clamp(py, -lim, lim);
  const qz = clamp(pz, -lim, lim);
  let dx = px - qx;
  let dy = py - qy;
  let dz = pz - qz;
  const len = Math.hypot(dx, dy, dz);
  if (len < 1e-6) {
    out.set([px, py, pz, 0, 0, 1]);
    return out;
  }
  dx /= len;
  dy /= len;
  dz /= len;
  out[0] = qx + dx * r;
  out[1] = qy + dy * r;
  out[2] = qz + dz * r;
  out[3] = dx;
  out[4] = dy;
  out[5] = dz;
  return out;
}

/** A point on the blob, a soft pebble a little shallower than wide, and its normal. */
export function blobAt(
  gx: number,
  gy: number,
  gz: number,
  look: Pick<CubeLook, "roundness" | "aspect">,
  out: Float32Array,
) {
  rounded(gx, gy, gz, mix(0.32, 1, clamp(look.roundness, 0, 1)), out);
  const aspect = clamp(look.aspect, 0.6, 1.6);
  const sx = BLOB_R * Math.sqrt(aspect);
  const sy = BLOB_R / Math.sqrt(aspect);
  const sz = BLOB_R * 0.9;
  out[0] *= sx;
  out[1] *= sy;
  out[2] *= sz;
  const nx = out[3] / sx;
  const ny = out[4] / sy;
  const nz = out[5] / sz;
  const l = Math.hypot(nx, ny, nz) || 1;
  out[3] = nx / l;
  out[4] = ny / l;
  out[5] = nz / l;
  return out;
}

function outline(eyes: CubeEyes) {
  if (eyes === "pill") return capsuleOutline(0.23, 0.27, false);
  if (eyes === "wide") return capsuleOutline(0.28, 0.2, true);
  if (eyes === "dot") return circleOutline(0.26);
  if (eyes === "tile") return tileOutline();
  return circleOutline(0.42);
}

/* ---------- projection ---------- */

const EYE: Vec3 = [0, 0.25, 6.6];
const VIEW_PROJECTION = multiply(perspective((30 * Math.PI) / 180, 1, 0.1, 50), lookAtOrigin(EYE));
/** Half the 200 box, in clip space: core's canvas spills 12% past the element on every side. */
const HALF = 124;

/** `m` applied to a point. */
function apply(m: Mat4, p: Vec3): Vec3 {
  return [
    m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
    m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
    m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14],
  ];
}

/** A world point in the 200 × 200 box: x, y and its distance from the camera. */
export function project(world: Vec3): Vec3 {
  const m = VIEW_PROJECTION;
  const [x, y, z] = world;
  const cx = m[0] * x + m[4] * y + m[8] * z + m[12];
  const cy = m[1] * x + m[5] * y + m[9] * z + m[13];
  const w = m[3] * x + m[7] * y + m[11] * z + m[15];
  return [100 + (cx / w) * HALF, 100 - (cy / w) * HALF, w];
}

const f = (v: number) => v.toFixed(1);
const pathOf = (points: Vec3[], close = true) =>
  `M${points.map((p) => `${f(p[0])} ${f(p[1])}`).join("L")}${close ? "Z" : ""}`;

/** Twice the signed area in the box (y down): below 0 runs clockwise on screen. */
function area(points: Vec3[]) {
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i];
    const b = points[(i + 1) % points.length];
    sum += a[0] * b[1] - b[0] * a[1];
  }
  return sum;
}

/* The shader's lights, for one flat face at a time. */
const unit = (v: Vec3): Vec3 => {
  const l = Math.hypot(...v) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const SKY: RGB = [0.87, 0.9, 1];
const GROUND: RGB = [0.1, 0.11, 0.13];
const LIGHTS: [Vec3, RGB, number, number][] = [
  [unit([3, 5, 6]), [1, 1, 1], 0.85, 1],
  [unit([-5, 2, -4]), [0.62, 0.69, 1], 0.45, 0.4],
  [unit([-3, -2, 5]), [1, 1, 1], 0.25, 0.5],
];

/** A color lit as core's shader lights it, for a face turned to `normal` at `at`. */
export function shade(color: RGB, normal: Vec3, at: Vec3, gloss: number): RGB {
  const v = unit([EYE[0] - at[0], EYE[1] - at[1], EYE[2] - at[2]]);
  let n = unit(normal);
  if (dot(n, v) < 0) n = [-n[0], -n[1], -n[2]];
  const ambient = mixRGB(GROUND, SKY, 0.5 * n[1] + 0.5);
  const out: RGB = [
    color[0] * ambient[0] * 0.75,
    color[1] * ambient[1] * 0.75,
    color[2] * ambient[2] * 0.75,
  ];
  for (const [dir, light, strength, specular] of LIGHTS) {
    const d = Math.max(dot(n, dir), 0);
    const h = unit([dir[0] + v[0], dir[1] + v[1], dir[2] + v[2]]);
    const nh = Math.max(dot(n, h), 0);
    // A whole face takes one value here, so the highlight is softened to keep it from flashing.
    const s = nh ** mix(12, 70, gloss) * specular * (0.15 + gloss) * 0.5;
    for (let i = 0; i < 3; i++) out[i] += (color[i] * light[i] * d + s) * strength;
  }
  return out;
}

/* ---------- the scene ---------- */

export interface CubeShape {
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
}

export interface CubeScene {
  /** The flat mascot's body, around its center (100, 104): where it goes and how it scales. */
  blob: { x: number; y: number; sx: number; sy: number; opacity: number };
  shadow: { scale: number; opacity: number };
  /** The dark core that shows between the pieces as a layer turns. */
  core: { cx: number; cy: number; r: number; fill: string } | null;
  /** Every visible face of the pieces, far to near. */
  pieces: CubeShape[];
  piecesOpacity: number;
  /** Eyes, brows, cheeks and mouth, projected onto the front. */
  features: CubeShape[];
  faceOpacity: number;
}

/** Points along the edge of a face's square, counter-clockwise about its outward axis. */
const PERIMETER: Point[] = (() => {
  const steps = 4;
  const out: Point[] = [];
  const corners: Point[] = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ];
  for (let c = 0; c < 4; c++) {
    const [ax, ay] = corners[c];
    const [bx, by] = corners[(c + 1) % 4];
    for (let i = 0; i < steps; i++) {
      // More points near the corners, as core's mesh has, so the bevels stay round.
      const t = i / steps;
      const warp = (v: number) => Math.sign(v) * Math.abs(v) ** 0.6;
      out.push([warp(mix(ax, bx, t)), warp(mix(ay, by, t))]);
    }
  }
  return out;
})();

/** The scene at this frame, from the motion and the resolved look. */
export function cubeScene(motion: CubeMotion, look: CubeLook, input: CubeInput): CubeScene {
  const m = motion.morph;
  const t = new Float32Array(6);
  const u = new Float32Array(6);
  const solid = look.surface === "solid";
  const gloss = look.surface === "glossy" ? 0.6 : 0.05;
  const paint = (color: RGB, normal: Vec3, at: Vec3) =>
    rgbToHex(solid ? color : shade(color, normal, at, gloss));

  const lift = motion.hopHeight(input.personality) + motion.breathe;
  const fit = mix(1, 0.8, m) * (input.state === "speaking" ? 1 + input.level * 0.04 : 1);
  const rootQ = quatEuler(motion.rot.x, motion.rot.y, 0);
  const root = compose([0, lift, 0], rootQ, [
    fit * (1 + motion.breathe * 0.6),
    fit * (1 - motion.breathe * 0.4),
    fit * (1 + motion.breathe * 0.6),
  ]);
  const spinQ = quatAxisAngle(2, motion.rot.spin);
  const spin = multiply(root, compose([0, 0, 0], spinQ, [1, 1, 1]));

  // The flat body stands in for core's blob mesh: placed on the projected center, it fades out
  // as the pieces firm into the cube.
  const center = project(apply(root, [0, 0, 0]));
  const blob = {
    x: center[0],
    y: center[1],
    sx: fit * (1 + motion.breathe * 0.6),
    sy: fit * (1 - motion.breathe * 0.4),
    opacity: 1 - smooth(0.1, 0.6, m),
  };
  const shadow = {
    scale: (1 - lift * 0.4) * mix(1, 0.85, m),
    opacity: clamp(1 - lift * 1.5, 0, 1),
  };

  const pieces: CubeShape[] = [];
  let core: CubeScene["core"] = null;
  if (m >= 0.01) {
    const body = mixRGB(look.color, DARK, clamp((m - 0.15) / 0.5, 0, 1));
    const k = clamp((m - 0.3) / 0.6, 0, 1);
    if (m > 0.6) {
      const s = clamp((m - 0.6) / 0.4, 0.01, 1);
      const edge = project(apply(spin, [0.9 * s, 0, 0]));
      const mid = project(apply(spin, [0, 0, 0]));
      core = {
        cx: mid[0],
        cy: mid[1],
        r: Math.hypot(edge[0] - mid[0], edge[1] - mid[1]),
        fill: rgbToHex(solid ? body : mixRGB(body, DARK, 0.4)),
      };
    }
    const h = 0.5 * (1 - GAP);
    const order = motion.cubies.map((cubie, index) => {
      const model = multiply(spin, compose([0, 0, 0], cubie.q, [1, 1, 1]));
      return { cubie, index, model, depth: project(apply(model, cubie.home))[2] };
    });
    order.sort((a, b) => b.depth - a.depth);
    for (const { cubie, model } of order) {
      const H = cubie.home;
      const turn = quatMultiply(quatMultiply(rootQ, spinQ), cubie.q);
      for (let face = 0; face < 6; face++) {
        const axis = face >> 1;
        const sign = face & 1 ? -1 : 1;
        const side = Math.sign(H[axis]) === sign ? FACE_SIDE[face] : "body";
        const a = (axis + 1) % 3;
        const b = (axis + 2) % 3;
        const points: Vec3[] = [];
        let mid: Vec3 = [0, 0, 0];
        for (const [pu, pw] of PERIMETER) {
          const l: Vec3 = [0, 0, 0];
          l[axis] = sign;
          l[a] = pu;
          l[b] = pw;
          rounded(l[0], l[1], l[2], BEVEL, t);
          let p: Vec3 = [H[0] + t[0] * h, H[1] + t[1] * h, H[2] + t[2] * h];
          if (m < 1) {
            blobAt(H[0] + l[0] * 0.5, H[1] + l[1] * 0.5, H[2] + l[2] * 0.5, look, u);
            p = [mix(u[0], p[0], m), mix(u[1], p[1], m), mix(u[2], p[2], m)];
          }
          const world = apply(model, p);
          mid = [mid[0] + world[0], mid[1] + world[1], mid[2] + world[2]];
          points.push(project(world));
        }
        // Back-face culling: a face whose outline runs the wrong way round on screen faces away.
        if (area(points) * sign >= 0) continue;
        const normal: Vec3 = [0, 0, 0];
        normal[axis] = sign;
        const count = PERIMETER.length;
        const color = side === "body" ? body : mixRGB(look.color, look.sides[side], k);
        const fill = paint(color, rotate(turn, normal), [
          mid[0] / count,
          mid[1] / count,
          mid[2] / count,
        ]);
        // A hairline of the same color closes the seams react-native-svg's antialiasing leaves.
        pieces.push({ d: pathOf(points), fill, stroke: fill, strokeWidth: 0.6 });
      }
    }
  }

  return {
    blob,
    shadow,
    core,
    pieces,
    piecesOpacity: smooth(0, 0.3, m),
    features: motion.face < 0.005 ? [] : faceShapes(motion, look, input, root),
    faceOpacity: motion.face,
  };
}

/** The face as core's drawFace places it, each feature an outline projected from the front. */
function faceShapes(motion: CubeMotion, look: CubeLook, input: CubeInput, root: Mat4) {
  const out: CubeShape[] = [];
  const amt = motion.face;
  const m = motion.morph;
  const pose = motion.pose;
  const t = new Float32Array(6);
  const flat = look.face === "flat" || look.surface === "solid";
  const curve = flat ? 1 : 0.35;
  const raise = flat ? 0.008 : 0.02;
  const front = 0.5 + 0.5 * (1 - GAP);
  const grow = mix(0.55, 1, amt);
  const ink = rgbToHex(look.eyeColor);
  const lx = input.lookX;
  const ly = -input.lookY;
  const blinkY = 1 - 0.93 * motion.blink;
  const spread =
    0.28 * clamp(look.eyeSpacing, 0.6, 1.5) * mix(1, clamp(look.aspect, 0.6, 1.6), 0.6);
  const eyeY = 0.02 - clamp(look.eyeHeight, -1, 1) * 0.25;
  const place = (x: number, y: number) => {
    blobAt(clamp(x / BLOB_R, -1, 1), clamp(y / BLOB_R, -1, 1), 1, look, t);
    return t;
  };
  const tilt = (k: number, z: number): Quat =>
    quatEuler(-Math.asin(clamp(t[4], -1, 1)) * k, Math.asin(clamp(t[3], -1, 1)) * k, z);
  const shape = (model: Mat4, pts: Point[]) =>
    pts.map(([x, y]) => project(apply(model, [x, y, 0])));
  /** How long one unit of `model` is in the box, for stroke widths. */
  const scaleOf = (model: Mat4) => {
    const a = project(apply(model, [0, 0, 0]));
    const b = project(apply(model, [1, 0, 0]));
    return Math.hypot(b[0] - a[0], b[1] - a[1]);
  };

  for (const side of [-1, 1] as const) {
    const left = side < 0;
    // Cheek, under the eye.
    if (look.cheeks) {
      place(side * (spread + 0.12), eyeY - 0.15);
      const model = multiply(
        root,
        compose([t[0], t[1], mix(t[2], front, m) + 0.01], tilt(1, 0), [
          0.26 * grow,
          0.15 * grow,
          1,
        ]),
      );
      out.push({
        d: pathOf(shape(model, circleOutline(0.36, 24))),
        fill: rgbToHex([1, 0.45, 0.5]),
        opacity: 0.4,
      });
    }
    // Eye.
    place(side * spread, eyeY);
    const sx = left ? pose.esxL : pose.esxR;
    const sy = left ? pose.esyL : pose.esyR;
    const size = 0.4 * look.eyeSize * grow;
    const eyeModel = multiply(
      root,
      compose(
        [t[0] + lx * 0.06, t[1] + ly * 0.05 + pose.edy, mix(t[2], front, m) + raise],
        tilt(curve, (left ? pose.etL : pose.etR) * side),
        [size * sx, size * sy * blinkY, size],
      ),
    );
    out.push({ d: pathOf(shape(eyeModel, outline(look.eyes))), fill: ink });
    if (!flat && sy * blinkY > 0.4) {
      for (const [x, y, r] of [
        [0.14, 0.16, 0.1],
        [-0.12, -0.14, 0.045],
      ]) {
        const glint = circleOutline(r, 16).map(([px, py]) => [px + x, py + y] as Point);
        out.push({ d: pathOf(shape(eyeModel, glint)), fill: rgbToHex(WHITE) });
      }
    }
    // Brow.
    if (look.brows) {
      place(
        side * spread * 1.04,
        eyeY + 0.25 * Math.sqrt(look.eyeSize) + (left ? pose.byL : pose.byR) - 0.02 * motion.blink,
      );
      const s = grow * mix(0.85, 1, look.eyeSize - 0.5);
      const model = multiply(
        root,
        compose(
          [t[0] + lx * 0.06, t[1] + ly * 0.05, mix(t[2], front, m) + raise],
          tilt(Math.max(curve, 0.5), side * (left ? pose.baL : pose.baR)),
          [s, s, s],
        ),
      );
      out.push({ d: pathOf(shape(model, capsuleOutline(0.16, 0.05, true))), fill: ink });
    }
  }

  if (look.mouth) {
    place(0, eyeY - 0.22);
    const at: Vec3 = [t[0] + lx * 0.04, t[1] + ly * 0.04 - 0.02, mix(t[2], front, m) + raise];
    const q = tilt(1, pose.tilt);
    // One outline, as on the web: the mood's line along the top and back along the bottom, so a
    // talking smile parts into an open mouth instead of showing a ring over the line.
    const w = mix(pose.width + 0.005, 0.065, pose.open * 0.6);
    const depth = pose.open * 0.16;
    const pts: Point[] = [];
    for (let i = 0; i < MOUTH_POINTS - 1; i++) {
      const a = (i / (MOUTH_POINTS - 1)) * Math.PI * 2;
      const v = -Math.cos(a);
      const top = Math.sin(a) >= 0;
      const bend = top ? pose.curve * (1 - pose.open * 0.7) : pose.curve;
      const line = bend * 0.1 * (v * v - 1) + pose.curve * 0.05;
      pts.push([v * w, line + (top ? 0.35 : -0.65) * depth * Math.abs(Math.sin(a))]);
    }
    const model = multiply(root, compose(at, q, [grow, grow, grow]));
    out.push({
      d: pathOf(shape(model, pts)),
      stroke: ink,
      strokeWidth: 0.048 * scaleOf(model),
    });
  }
  return out;
}
