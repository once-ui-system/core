/* Draws the cube mascot from CubeMotion: the blob or the eight pieces, the face, glows and shadow. */

import {
  boxGrid,
  capsuleOutline,
  circleOutline,
  flatShape,
  type MeshData,
  pillowShape,
  quad,
  sphere,
  tileOutline,
  torus,
  tube,
} from "./geometry";
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
  quatFromZ,
  quatIdentity,
  quatMultiply,
  type Vec3,
} from "./math";
import { type GpuMesh, type Material, Renderer, type RGB } from "./renderer";
import type { CubeInput, CubeMotion } from "./state";

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
const BEVEL = 0.1;
const GAP = 0.006;
const BLOB_R = 1.12;
const DARK: RGB = [0.067, 0.071, 0.086];
const WHITE: RGB = [1, 1, 1];

const mixRGB = (a: RGB, b: RGB, t: number): RGB => [
  mix(a[0], b[0], t),
  mix(a[1], b[1], t),
  mix(a[2], b[2], t),
];

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

interface Piece {
  mesh: GpuMesh;
  data: MeshData;
  base: Float32Array;
  home: Vec3;
  /** The look each face group takes: a side's color, or the dark body inside. */
  faces: (CubeSide | "body")[];
}

function outline(eyes: CubeEyes) {
  if (eyes === "pill") return capsuleOutline(0.23, 0.27, false);
  if (eyes === "wide") return capsuleOutline(0.28, 0.2, true);
  if (eyes === "dot") return circleOutline(0.26);
  if (eyes === "tile") return tileOutline();
  return circleOutline(0.42);
}

export class CubeView {
  private renderer: Renderer;
  private pieces: Piece[] = [];
  private blob: { mesh: GpuMesh; data: MeshData; base: Float32Array };
  private core: GpuMesh;
  private quad: GpuMesh;
  private ring: GpuMesh;
  private disc: GpuMesh;
  private mouth: { mesh: GpuMesh; data: MeshData };
  private shapes = new Map<string, GpuMesh>();
  private deformed = { morph: -1, key: "" };
  private t = new Float32Array(6);
  private u = new Float32Array(6);
  private m1 = new Float32Array(16);
  private m2 = new Float32Array(16);

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new Renderer(canvas);
    const r = this.renderer;
    for (const x of [-1, 1]) {
      for (const y of [-1, 1]) {
        for (const z of [-1, 1]) {
          const data = boxGrid(16);
          // More vertices near the edges, so the bevels stay crisp.
          const base = data.positions.map((v) => Math.sign(v) * Math.abs(v) ** 0.6);
          const home: Vec3 = [x * 0.5, y * 0.5, z * 0.5];
          const faces = FACE_SIDE.map((side, i) => {
            const axis = i >> 1;
            const sign = i & 1 ? -1 : 1;
            return Math.sign(home[axis]) === sign ? side : "body";
          });
          this.pieces.push({ mesh: r.mesh(data, true), data, base, home, faces });
        }
      }
    }
    const blob = boxGrid(40);
    this.blob = { data: blob, base: blob.positions.slice(), mesh: r.mesh(blob, true) };
    // Round, so a turning layer never uncovers a corner of it.
    this.core = r.mesh(sphere(0.9));
    this.quad = r.mesh(quad());
    this.ring = r.mesh(torus(0.07, 0.024, 32, 10));
    this.disc = r.mesh(flatShape(circleOutline(1, 24)));
    const mouth = tube(
      Array.from({ length: 9 }, (_, i) => [i / 4 - 1, 0] as [number, number]),
      0.024,
    );
    this.mouth = { data: mouth, mesh: r.mesh(mouth, true) };
  }

  private shape(kind: string, raised: boolean) {
    const key = `${kind}-${raised}`;
    let mesh = this.shapes.get(key);
    if (!mesh) {
      const pts = kind === "brow" ? capsuleOutline(0.16, 0.05, true) : outline(kind as CubeEyes);
      mesh = this.renderer.mesh(
        raised
          ? pillowShape(pts, kind === "brow" ? 0.08 : 0.14, kind === "brow" ? 0.04 : 0.08)
          : flatShape(pts),
      );
      this.shapes.set(key, mesh);
    }
    return mesh;
  }

  private deform(morph: number, look: CubeLook) {
    const key = `${look.roundness}|${look.aspect}`;
    const t = this.t;
    if (key !== this.deformed.key) {
      const { data, base } = this.blob;
      for (let i = 0; i < base.length; i += 3) {
        blobAt(base[i], base[i + 1], base[i + 2], look, t);
        data.positions.set(t.subarray(0, 3), i);
        data.normals.set(t.subarray(3, 6), i);
      }
      this.blob.mesh.update(data);
    }
    if (morph < 0.002 || (morph === this.deformed.morph && key === this.deformed.key)) {
      this.deformed = { morph, key };
      return;
    }
    this.deformed = { morph, key };
    const h = 0.5 * (1 - GAP);
    const u = this.u;
    for (const piece of this.pieces) {
      const { positions: P, normals: N } = piece.data;
      const B = piece.base;
      const H = piece.home;
      for (let i = 0; i < P.length; i += 3) {
        const lx = B[i];
        const ly = B[i + 1];
        const lz = B[i + 2];
        rounded(lx, ly, lz, BEVEL, t);
        const cx = H[0] + t[0] * h;
        const cy = H[1] + t[1] * h;
        const cz = H[2] + t[2] * h;
        if (morph < 1) {
          blobAt(H[0] + lx * 0.5, H[1] + ly * 0.5, H[2] + lz * 0.5, look, u);
          P[i] = mix(u[0], cx, morph);
          P[i + 1] = mix(u[1], cy, morph);
          P[i + 2] = mix(u[2], cz, morph);
          const nx = mix(u[3], t[3], morph);
          const ny = mix(u[4], t[4], morph);
          const nz = mix(u[5], t[5], morph);
          const l = Math.hypot(nx, ny, nz) || 1;
          N[i] = nx / l;
          N[i + 1] = ny / l;
          N[i + 2] = nz / l;
        } else {
          P[i] = cx;
          P[i + 1] = cy;
          P[i + 2] = cz;
          N[i] = t[3];
          N[i + 1] = t[4];
          N[i + 2] = t[5];
        }
      }
      piece.mesh.update(piece.data);
    }
  }

  private buildMouth(curve: number, width: number) {
    const pts: [number, number][] = [];
    for (let i = 0; i <= 8; i++) {
      const u = i / 4 - 1;
      pts.push([u * width, curve * 0.1 * (u * u - 1) + curve * 0.05]);
    }
    tube(pts, 0.024, 8, this.mouth.data);
    this.mouth.mesh.update(this.mouth.data);
  }

  render(motion: CubeMotion, look: CubeLook, input: CubeInput, width: number, height: number) {
    const r = this.renderer;
    const m = motion.morph;
    this.deform(m, look);

    const aspect = width / Math.max(1, height);
    const eye: Vec3 = [0, 0.25, 6.6];
    const viewProjection = multiply(
      perspective((30 * Math.PI) / 180, aspect, 0.1, 50),
      lookAtOrigin(eye),
    );
    r.begin(width, height, viewProjection, eye);

    const solid = look.surface === "solid";
    const gloss = look.surface === "glossy" ? 0.6 : 0.05;
    const lit = (color: RGB, opacity = 1): Material => ({
      color,
      mode: solid ? "unlit" : "lit",
      gloss,
      opacity,
    });

    // Floor shadow first, under everything.
    const lift = motion.hopHeight(input.personality) + motion.breathe;
    const shadowScale = 2.6 * (1 - lift * 0.4) * mix(1, 0.85, m);
    r.draw(
      this.quad,
      compose([0, -1.32, 0], quatAxisAngle(0, -Math.PI / 2), [shadowScale, shadowScale, 1]),
      { color: [0, 0, 0], mode: "glow", opacity: 0.55 - lift },
      undefined,
      false,
    );

    // Body.
    const fit = mix(1, 0.8, m) * (input.state === "speaking" ? 1 + input.level * 0.04 : 1);
    const rootQ = quatEuler(motion.rot.x, motion.rot.y, 0);
    const wide = 1 + motion.breathe * 0.6 + motion.squash * 0.6;
    const tall = 1 - motion.breathe * 0.4 - motion.squash;
    const root = compose([0, lift - motion.squash * 0.9, 0], rootQ, [
      fit * wide,
      fit * tall,
      fit * wide,
    ]);
    const spin = multiply(
      root,
      compose([0, 0, 0], quatAxisAngle(2, motion.rot.spin), [1, 1, 1]),
      this.m1,
    );
    const k = clamp((m - 0.3) / 0.6, 0, 1);
    const body = mixRGB(look.color, DARK, clamp((m - 0.15) / 0.5, 0, 1));
    if (m < 0.002) {
      r.draw(this.blob.mesh, spin, lit(look.color));
    } else {
      if (m > 0.6) {
        const s = clamp((m - 0.6) / 0.4, 0.01, 1);
        r.draw(
          this.core,
          multiply(spin, compose([0, 0, 0], quatIdentity(), [s, s, s]), this.m2),
          lit(body),
        );
      }
      motion.cubies.forEach((cubie, index) => {
        const piece = this.pieces[index];
        const model = multiply(spin, compose([0, 0, 0], cubie.q, [1, 1, 1]), this.m2);
        piece.faces.forEach((face, g) => {
          const color = face === "body" ? body : mixRGB(look.color, look.sides[face], k);
          r.draw(piece.mesh, model, lit(color), piece.mesh.groups?.[g]);
        });
      });
    }

    // A soft painted highlight on the blob, upper left, like the 2.4 mascot.
    const t = this.t;
    if (!solid && look.surface === "glossy" && m < 0.2) {
      blobAt(-0.5, 0.62, 1, look, t);
      const q = quatMultiply(quatFromZ([t[3], t[4], t[5]]), quatAxisAngle(2, 0.5));
      r.draw(
        this.quad,
        multiply(
          root,
          compose(
            [t[0] + t[3] * 0.012, t[1] + t[4] * 0.012, t[2] + t[5] * 0.012],
            q,
            [0.62, 0.34, 1],
          ),
          this.m2,
        ),
        { color: WHITE, mode: "glow", opacity: 0.55 * (1 - Math.min(1, m * 5)) ** 2 },
        undefined,
        false,
      );
    }

    this.drawFace(motion, look, input, root);
  }

  private drawFace(motion: CubeMotion, look: CubeLook, input: CubeInput, root: Mat4) {
    const amt = motion.face;
    if (amt < 0.005) return;
    const r = this.renderer;
    const m = motion.morph;
    const pose = motion.pose;
    const t = this.t;
    const flat = look.face === "flat" || look.surface === "solid";
    const curve = flat ? 1 : 0.35;
    const raise = flat ? 0.008 : 0.02;
    const front = 0.5 + 0.5 * (1 - GAP);
    const grow = mix(0.55, 1, amt);
    const ink: Material = {
      color: look.eyeColor,
      mode: flat ? "unlit" : "lit",
      gloss: 0.3,
      opacity: amt,
    };
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

    for (const side of [-1, 1] as const) {
      const left = side < 0;
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
      r.draw(this.shape(look.eyes, !flat), eyeModel, ink);
      if (!flat && sy * blinkY > 0.4) {
        const glint: Material = { color: WHITE, mode: "unlit", opacity: amt };
        r.draw(
          this.disc,
          multiply(eyeModel, compose([0.14, 0.16, 0.11], quatIdentity(), [0.1, 0.1, 1]), this.m2),
          glint,
        );
        r.draw(
          this.disc,
          multiply(
            eyeModel,
            compose([-0.12, -0.14, 0.11], quatIdentity(), [0.045, 0.045, 1]),
            this.m2,
          ),
          glint,
        );
      }
      // Brow.
      if (look.brows) {
        place(
          side * spread * 1.04,
          eyeY +
            0.25 * Math.sqrt(look.eyeSize) +
            (left ? pose.byL : pose.byR) -
            0.02 * motion.blink,
        );
        const s = grow * mix(0.85, 1, look.eyeSize - 0.5);
        r.draw(
          this.shape("brow", !flat),
          multiply(
            root,
            compose(
              [t[0] + lx * 0.06, t[1] + ly * 0.05, mix(t[2], front, m) + raise],
              tilt(Math.max(curve, 0.5), side * (left ? pose.baL : pose.baR)),
              [s, s, s],
            ),
            this.m2,
          ),
          ink,
        );
      }
      // Cheek.
      if (look.cheeks) {
        place(side * (spread + 0.12), eyeY - 0.15);
        r.draw(
          this.quad,
          multiply(
            root,
            compose([t[0], t[1], mix(t[2], front, m) + 0.01], tilt(1, 0), [
              0.26 * grow,
              0.15 * grow,
              1,
            ]),
            this.m2,
          ),
          { color: [1, 0.45, 0.5], mode: "glow", opacity: 0.5 * amt },
          undefined,
          false,
        );
      }
    }

    if (look.mouth) {
      place(0, eyeY - 0.22);
      const mx = t[0] + lx * 0.04;
      const my = t[1] + ly * 0.04 - 0.02;
      const mz = mix(t[2], front, m) + raise;
      const q = tilt(1, pose.tilt);
      if (pose.open < 0.85) {
        this.buildMouth(pose.curve, pose.width * (1 - pose.open * 0.9) + 0.005);
        r.draw(
          this.mouth.mesh,
          multiply(root, compose([mx, my, mz], q, [grow, grow, grow]), this.m2),
          ink,
        );
      }
      if (pose.open > 0.05) {
        const s = grow * Math.max(0.001, pose.open);
        r.draw(
          this.ring,
          multiply(root, compose([mx, my - 0.01, mz], q, [s * 0.9, s * 1.15, s]), this.m2),
          ink,
        );
      }
    }
  }

  dispose() {
    this.renderer.dispose();
  }
}
