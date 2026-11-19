/**
 * Render styles for the mascot: the same character, drawn in another medium.
 * Each one is an SVG filter (or, for `lowpoly`, plain triangles), so it runs
 * live on the animated mascot with no WebGL, renders on the server through
 * `mascotSvg`, and falls back to the vector mascot where filters are missing.
 */

import type React from "react";
import { createElement } from "react";
import { type OutlinePoint, outlinePoints } from "./mascotOutline.js";
import { random } from "./mascotShape.js";

/**
 * How the mascot is drawn. `vector` (default) is the flat mascot. `fur` grows a soft coat on the
 * body (drawn hairs in clumped tufts), `plush` a felt one, `clay` models it in plasticine, `pixel` turns it into a sprite,
 * `lowpoly` cuts the body into lit facets and `toon` inks an outline around cel shading.
 */
export type MascotMedium = "vector" | "fur" | "plush" | "clay" | "pixel" | "lowpoly" | "toon";

export const MASCOT_MEDIUMS: readonly MascotMedium[] = [
  "vector",
  "fur",
  "plush",
  "clay",
  "pixel",
  "lowpoly",
  "toon",
];

export const isMascotMedium = (value: unknown): value is MascotMedium =>
  typeof value === "string" && (MASCOT_MEDIUMS as readonly string[]).includes(value);

/** Which part of the mascot a medium's filter wraps. */
export function mediumTarget(medium: MascotMedium): "none" | "skin" | "body" | "all" {
  switch (medium) {
    case "plush":
      return "skin";
    case "clay":
    case "toon":
      return "body";
    case "pixel":
      return "all";
    default:
      return "none";
  }
}

/** The filter region, in the 200 × 200 box with room for hats, thought bubbles and fur. */
const REGION = { x: -40, y: -40, width: 280, height: 280 } as const;

/** One filter primitive: its element, its attributes (React names) and its children. */
type Primitive = readonly [string, Record<string, string | number>, (readonly Primitive[])?];

const noise = (baseFrequency: string, numOctaves: number, seed: number, result: string) =>
  ["feTurbulence", { type: "fractalNoise", baseFrequency, numOctaves, seed, result }] as const;
const displace = (
  input: string,
  map: string,
  scale: number,
  result: string,
  x = "R",
  y = "G",
): Primitive => [
  "feDisplacementMap",
  { in: input, in2: map, scale, xChannelSelector: x, yChannelSelector: y, result },
];
const merge = (...inputs: string[]): Primitive => [
  "feMerge",
  {},
  inputs.map((input): Primitive => ["feMergeNode", { in: input }]),
];

/**
 * The primitives of a medium's filter, or [] for `vector` and `lowpoly`. Plain data, so the
 * component (`MediumFilter`) and the server's SVG string (`mediumFilterMarkup`) draw the same.
 * `cell` is the pixel size in the 200 × 200 box (8, the default, draws a 25 × 25 sprite).
 */
export function mediumPrimitives(medium: MascotMedium, cell = 8): readonly Primitive[] {
  switch (medium) {
    case "plush":
      return [
        // Short felt: a fuzzy edge, then a nap over the whole front, lit from the top left.
        noise("0.7", 2, 5, "nap"),
        displace("SourceGraphic", "nap", 5, "felt"),
        ["feGaussianBlur", { in: "SourceAlpha", stdDeviation: 9, result: "puff" }],
        [
          "feComposite",
          { in: "puff", in2: "nap", operator: "arithmetic", k2: 1, k3: 0.4, result: "height" },
        ],
        [
          "feDiffuseLighting",
          {
            in: "height",
            surfaceScale: 6,
            diffuseConstant: 1.05,
            lightingColor: "#fff",
            result: "lit",
          },
          [["feDistantLight", { azimuth: 225, elevation: 52 }]],
        ],
        [
          "feComposite",
          { in: "felt", in2: "lit", operator: "arithmetic", k1: 1.08, result: "shaded" },
        ],
        // Fibres: fine noise, darker and lighter flecks everywhere on the felt, face included.
        noise("1.1 0.8", 2, 13, "fibres"),
        [
          "feColorMatrix",
          {
            in: "fibres",
            type: "matrix",
            values: "0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 -1.8 0 0.85",
            result: "dark",
          },
        ],
        [
          "feColorMatrix",
          {
            in: "fibres",
            type: "matrix",
            values: "0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 2 0 -1",
            result: "bright",
          },
        ],
        ["feComposite", { in: "shaded", in2: "felt", operator: "in", result: "cloth" }],
        ["feComposite", { in: "dark", in2: "cloth", operator: "in", result: "darkIn" }],
        ["feComposite", { in: "bright", in2: "cloth", operator: "in", result: "brightIn" }],
        merge("cloth", "darkIn", "brightIn"),
      ];
    case "clay":
      return [
        // A soft height map from the silhouette, with thumbprints pressed in.
        ["feGaussianBlur", { in: "SourceAlpha", stdDeviation: 7, result: "puff" }],
        noise("0.045", 3, 9, "prints"),
        [
          "feComposite",
          { in: "puff", in2: "prints", operator: "arithmetic", k2: 1, k3: 0.12, result: "height" },
        ],
        [
          "feDiffuseLighting",
          {
            in: "height",
            surfaceScale: 7,
            diffuseConstant: 1.1,
            lightingColor: "#fff",
            result: "diffuse",
          },
          [["feDistantLight", { azimuth: 230, elevation: 48 }]],
        ],
        [
          "feSpecularLighting",
          {
            in: "height",
            surfaceScale: 7,
            specularConstant: 0.55,
            specularExponent: 14,
            lightingColor: "#fff",
            result: "spec",
          },
          [["feDistantLight", { azimuth: 230, elevation: 58 }]],
        ],
        [
          "feComposite",
          { in: "SourceGraphic", in2: "diffuse", operator: "arithmetic", k1: 1.12, result: "lit" },
        ],
        ["feComposite", { in: "spec", in2: "SourceAlpha", operator: "in", result: "gloss" }],
        [
          "feComposite",
          { in: "lit", in2: "gloss", operator: "arithmetic", k2: 1, k3: 0.6, result: "glossy" },
        ],
        ["feComposite", { in: "glossy", in2: "SourceAlpha", operator: "in" }],
      ];
    case "toon":
      // The cel bands are shapes (see Mascot); the filter inks a line around the silhouette.
      return [
        ["feMorphology", { in: "SourceAlpha", operator: "dilate", radius: 4, result: "fat" }],
        ["feFlood", { floodColor: "#111318" }],
        ["feComposite", { in2: "fat", operator: "in", result: "ink" }],
        merge("ink", "SourceGraphic"),
      ];
    case "pixel": {
      const half = cell / 2;
      return [
        // Thin features (brows, a mouth, pupils) grow first, so a sample can't miss them.
        [
          "feMorphology",
          { in: "SourceGraphic", operator: "erode", radius: cell * 0.3, result: "bold" },
        ],
        // One sample in the middle of every cell, tiled over the region...
        [
          "feFlood",
          {
            x: REGION.x + half - 1,
            y: REGION.y + half - 1,
            width: 2,
            height: 2,
            floodColor: "#000",
          },
        ],
        ["feComposite", { x: REGION.x, y: REGION.y, width: cell, height: cell }],
        ["feTile", { result: "grid" }],
        ["feComposite", { in: "bold", in2: "grid", operator: "in" }],
        // ...grown back into a square the size of the cell, with hard edges.
        ["feMorphology", { operator: "dilate", radius: half - 1, result: "cells" }],
        [
          "feComponentTransfer",
          { in: "cells", result: "sprite" },
          [["feFuncA", { type: "discrete", tableValues: "0 1 1" }]],
        ],
        // A one-pixel dark outline, on the same grid.
        ["feMorphology", { in: "sprite", operator: "dilate", radius: cell, result: "outer" }],
        ["feFlood", { floodColor: "#0b0d12" }],
        ["feComposite", { in2: "outer", operator: "in", result: "outline" }],
        merge("outline", "sprite"),
      ];
    }
    default:
      return [];
  }
}

const FILTER_ATTRS = {
  ...REGION,
  filterUnits: "userSpaceOnUse",
  primitiveUnits: "userSpaceOnUse",
  colorInterpolationFilters: "sRGB",
} as const;

function element([tag, attrs, children]: Primitive, key: number): React.ReactElement {
  return createElement(tag, { key, ...attrs }, children?.map(element));
}

/** The `<filter>` for a medium, or null when it draws without one. */
export function MediumFilter({
  id,
  medium,
  cell,
}: {
  id: string;
  medium: MascotMedium;
  cell?: number;
}) {
  const primitives = mediumPrimitives(medium, cell);
  if (!primitives.length) return null;
  return createElement("filter", { id, ...FILTER_ATTRS }, primitives.map(element));
}

/** The few presentation attributes React spells in camelCase; SVG wants them hyphenated. */
const HYPHENATED: Record<string, string> = {
  floodColor: "flood-color",
  floodOpacity: "flood-opacity",
  lightingColor: "lighting-color",
  colorInterpolationFilters: "color-interpolation-filters",
};

const attrs = (record: Record<string, string | number>) =>
  Object.entries(record)
    .map(([name, value]) => ` ${HYPHENATED[name] ?? name}="${value}"`)
    .join("");

function markup([tag, record, children]: Primitive): string {
  return children?.length
    ? `<${tag}${attrs(record)}>${children.map(markup).join("")}</${tag}>`
    : `<${tag}${attrs(record)}/>`;
}

/** The same filter as an SVG string, for `mascotSvg`. Empty when the medium draws without one. */
export function mediumFilterMarkup(id: string, medium: MascotMedium, cell?: number): string {
  const primitives = mediumPrimitives(medium, cell);
  if (!primitives.length) return "";
  return `<filter${attrs({ id, ...FILTER_ATTRS })}>${primitives.map(markup).join("")}</filter>`;
}

/* ------------------------------------------------------------------ low poly */

export interface Facet {
  points: string;
  /** -1 (in shade) to 1 (in full light). */
  light: number;
}

type P3 = [number, number, number];

/** Evenly spaced points along a closed polyline. */
function resample(points: readonly OutlinePoint[], count: number): OutlinePoint[] {
  const lengths = [0];
  for (let i = 1; i <= points.length; i++) {
    const [ax, ay] = points[i - 1];
    const [bx, by] = points[i % points.length];
    lengths.push(lengths[i - 1] + Math.hypot(bx - ax, by - ay));
  }
  const total = lengths[lengths.length - 1];
  const out: OutlinePoint[] = [];
  let seg = 1;
  for (let k = 0; k < count; k++) {
    const at = (k / count) * total;
    while (lengths[seg] < at && seg < lengths.length - 1) seg++;
    const [ax, ay] = points[seg - 1];
    const [bx, by] = points[seg % points.length];
    const span = lengths[seg] - lengths[seg - 1] || 1;
    const t = (at - lengths[seg - 1]) / span;
    out.push([ax + (bx - ax) * t, ay + (by - ay) * t]);
  }
  return out;
}

/** Bowyer–Watson Delaunay triangulation: fine for the few dozen points a body needs. */
function delaunay(points: readonly OutlinePoint[]): [number, number, number][] {
  const pts: OutlinePoint[] = [...points, [-1e4, -1e4], [1e4, -1e4], [100, 1e4]];
  const n = points.length;
  let tris: [number, number, number][] = [[n, n + 1, n + 2]];
  const circum = (t: [number, number, number]) => {
    const [ax, ay] = pts[t[0]];
    const [bx, by] = pts[t[1]];
    const [cx, cy] = pts[t[2]];
    const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
    const a2 = ax * ax + ay * ay;
    const b2 = bx * bx + by * by;
    const c2 = cx * cx + cy * cy;
    const ux = (a2 * (by - cy) + b2 * (cy - ay) + c2 * (ay - by)) / d;
    const uy = (a2 * (cx - bx) + b2 * (ax - cx) + c2 * (bx - ax)) / d;
    return [ux, uy, (ax - ux) ** 2 + (ay - uy) ** 2] as const;
  };
  for (let i = 0; i < n; i++) {
    const [px, py] = pts[i];
    const bad: [number, number, number][] = [];
    const keep: [number, number, number][] = [];
    for (const t of tris) {
      const [ux, uy, r2] = circum(t);
      if ((px - ux) ** 2 + (py - uy) ** 2 < r2) bad.push(t);
      else keep.push(t);
    }
    const edges = new Map<string, [number, number]>();
    for (const t of bad) {
      for (const [a, b] of [
        [t[0], t[1]],
        [t[1], t[2]],
        [t[2], t[0]],
      ] as const) {
        const key = a < b ? `${a}-${b}` : `${b}-${a}`;
        if (edges.has(key)) edges.delete(key);
        else edges.set(key, [a, b]);
      }
    }
    for (const [a, b] of edges.values()) keep.push([a, b, i]);
    tris = keep;
  }
  return tris.filter((t) => t.every((v) => v < n));
}

function inside([x, y]: OutlinePoint, polygon: readonly OutlinePoint[]) {
  let hit = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

/** Light from the top left, a little in front. */
const LIGHT: P3 = (() => {
  const v: P3 = [-0.55, -0.7, 0.75];
  const l = Math.hypot(...v);
  return [v[0] / l, v[1] / l, v[2] / l];
})();

/**
 * The body cut into flat-shaded triangles, as a low-poly model would be: a ring of points on the
 * outline, two smaller rings inside it raised into a dome, and a point at the top of the dome.
 * Plain math on the path, so it renders on the server too.
 */
export function lowPolyFacets(d: string, detail = 14): Facet[] {
  const shape = outlinePoints(d).sort((a, b) => b.length - a.length)[0];
  if (!shape || shape.length < 3) return [];
  const rim = resample(shape, detail);
  const xs = rim.map((p) => p[0]);
  const ys = rim.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2 + 6;
  const hw = (Math.max(...xs) - Math.min(...xs)) / 2;
  const hh = (Math.max(...ys) - Math.min(...ys)) / 2;

  const points: OutlinePoint[] = [...rim];
  const height: number[] = rim.map(() => 0);
  const rings = [
    { scale: 0.68, count: Math.round(detail * 0.72), turn: 0.5, z: 0.72 },
    { scale: 0.34, count: Math.max(4, Math.round(detail * 0.4)), turn: 0.25, z: 0.94 },
  ];
  for (const ring of rings) {
    const loop = resample(rim, ring.count);
    // Rotate half a step so the triangles alternate, as a hand-made mesh does.
    const shifted = loop.map((_, i) => {
      const a = loop[i];
      const b = loop[(i + 1) % loop.length];
      return [a[0] + (b[0] - a[0]) * ring.turn, a[1] + (b[1] - a[1]) * ring.turn] as OutlinePoint;
    });
    for (const [x, y] of shifted) {
      points.push([cx + (x - cx) * ring.scale, cy + (y - cy) * ring.scale]);
      height.push(ring.z);
    }
  }
  points.push([cx - hw * 0.08, cy - hh * 0.06]);
  height.push(1);

  return delaunay(points)
    .filter(([a, b, c]) => {
      const centroid: OutlinePoint = [
        (points[a][0] + points[b][0] + points[c][0]) / 3,
        (points[a][1] + points[b][1] + points[c][1]) / 3,
      ];
      return inside(centroid, rim);
    })
    .map(([a, b, c]) => {
      const v = [a, b, c].map(
        (i): P3 => [(points[i][0] - cx) / hw, (points[i][1] - cy) / hh, height[i] * 0.9],
      );
      const u: P3 = [v[1][0] - v[0][0], v[1][1] - v[0][1], v[1][2] - v[0][2]];
      const w: P3 = [v[2][0] - v[0][0], v[2][1] - v[0][1], v[2][2] - v[0][2]];
      let n: P3 = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
      if (n[2] < 0) n = [-n[0], -n[1], -n[2]];
      const len = Math.hypot(...n) || 1;
      const dot = (n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]) / len;
      return {
        points: [a, b, c]
          .map((i) => `${points[i][0].toFixed(2)},${points[i][1].toFixed(2)}`)
          .join(" "),
        light: Math.max(-1, Math.min(1, (dot - 0.62) * 2.4)),
      };
    });
}

/** A facet's colour: the body colour mixed toward white in light and toward black in shade. */
export function facetFill(light: number) {
  return light >= 0
    ? `color-mix(in oklab, var(--mascot-color), white ${Math.round(light * 30)}%)`
    : `color-mix(in oklab, var(--mascot-color), black ${Math.round(-light * 26)}%)`;
}

/* ---------------------------------------------------------------------- fur */

export interface FurLayer {
  /** Many tapered hairs in one path, all of the same shade. */
  d: string;
  /** -1 (in shade) to 1 (in full light), as for facets. */
  light: number;
}

const SHADES = 8;
/** One decimal, without a leading zero or a trailing ".0". */
const f1 = (value: number) => String(Math.round(value * 10) / 10).replace(/^(-?)0\./, "$1.");

/**
 * The body as fur: clumped tufts of tapered hairs that flow out from a crown on the top of the
 * head and fall with gravity, with longer tufts sticking out past the silhouette. Each hair is a
 * thin curved wedge; hairs of one shade and one depth share a path, so a coat is a few dozen
 * paths. Lower tufts are drawn first, so the hairs above fall over their roots. Plain math on the
 * path, seeded by it, so the coat is the same on every render and on the server.
 */
export function furStrands(d: string, density = 1): FurLayer[] {
  const shape = outlinePoints(d).sort((a, b) => b.length - a.length)[0];
  if (!shape || shape.length < 3) return [];
  const rim = resample(shape, 160);
  const xs = rim.map((p) => p[0]);
  const ys = rim.map((p) => p[1]);
  const left = Math.min(...xs);
  const right = Math.max(...xs);
  const top = Math.min(...ys);
  const bottom = Math.max(...ys);
  const cx = (left + right) / 2;
  const cy = (top + bottom) / 2;
  const hw = (right - left) / 2;
  const hh = (bottom - top) / 2;
  const rand = random(d);
  const crown: OutlinePoint = [cx - hw * 0.05, top + hh * 0.35];

  const unit = (x: number, y: number): OutlinePoint => {
    const l = Math.hypot(x, y) || 1;
    return [x / l, y / l];
  };
  const flow = (x: number, y: number) => {
    const [ox, oy] = unit(x - crown[0], y - crown[1]);
    return unit(ox, oy + 0.75);
  };
  const shadeAt = (x: number, y: number) => {
    const u = (x - cx) / hw;
    const v = (y - cy) / hh;
    const n: P3 = [u * 0.8, v * 0.8, Math.sqrt(Math.max(0.05, 1 - (u * u + v * v) * 0.64))];
    const len = Math.hypot(...n);
    return ((n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]) / len - 0.55) * 2.2;
  };

  type Tuft = { x: number; y: number; dx: number; dy: number; length: number; rim: boolean };
  const tufts: Tuft[] = [];
  // Tufts along the outline lean outward, so the silhouette is hair.
  const perimeter = rim.reduce(
    (sum, p, i) =>
      sum + Math.hypot(p[0] - rim[(i + 1) % rim.length][0], p[1] - rim[(i + 1) % rim.length][1]),
    0,
  );
  const edge = resample(shape, Math.round(perimeter / (6 / density)));
  edge.forEach(([x, y], i) => {
    const [ax, ay] = edge[(i + edge.length - 1) % edge.length];
    const [bx, by] = edge[(i + 1) % edge.length];
    let [nx, ny] = unit(by - ay, -(bx - ax));
    // Outward is away from the middle, whichever way the path winds.
    if (nx * (x - cx) + ny * (y - cy) < 0) [nx, ny] = [-nx, -ny];
    const [fx, fy] = flow(x, y);
    const [dx, dy] = unit(nx * 0.5 + fx * 0.5, ny * 0.5 + fy * 0.5);
    tufts.push({ x: x - dx * 5, y: y - dy * 5, dx, dy, length: 13 + rand() * 8, rim: true });
  });
  // Tufts over the body, on a jittered grid.
  const step = 9 / density;
  for (let y = top + step / 2; y < bottom; y += step) {
    for (let x = left + step / 2; x < right; x += step) {
      const px = x + (rand() - 0.5) * step * 0.8;
      const py = y + (rand() - 0.5) * step * 0.8;
      if (!inside([px, py], rim)) continue;
      const [fx, fy] = flow(px, py);
      const [dx, dy] = unit(fx + (rand() - 0.5) * 0.35, fy + (rand() - 0.5) * 0.35);
      tufts.push({ x: px, y: py, dx, dy, length: 15 + rand() * 7, rim: false });
    }
  }

  // Depth: rim tufts at the back, then the body from the bottom up.
  const BANDS = 6;
  const layers = new Map<string, string[]>();
  const add = (band: number, shade: number, hair: string) => {
    const key = `${band}:${shade}`;
    const list = layers.get(key);
    if (list) list.push(hair);
    else layers.set(key, [hair]);
  };
  for (const tuft of tufts) {
    const band = tuft.rim
      ? 0
      : 1 + Math.min(BANDS - 1, Math.floor(((bottom - tuft.y) / (bottom - top)) * BANDS));
    const tipX = tuft.x + tuft.dx * tuft.length;
    const tipY = tuft.y + tuft.dy * tuft.length;
    const bend = (rand() - 0.5) * 8;
    const base = shadeAt(tuft.x, tuft.y) + 0.25 - (tuft.rim ? 0.15 : 0);
    const hairs = 9;
    for (let h = 0; h < hairs; h++) {
      const a = rand() * Math.PI * 2;
      const r = Math.sqrt(rand()) * 4.5;
      const rx = tuft.x + Math.cos(a) * r;
      const ry = tuft.y + Math.sin(a) * r;
      // Tips gather toward the tuft's point, as wet or brushed fur clumps.
      const tx = tipX + (rand() - 0.5) * 4;
      const ty = tipY + (rand() - 0.5) * 4;
      const [ux, uy] = unit(tx - rx, ty - ry);
      const w = 0.45 + rand() * 0.5;
      const mx = (rx + tx) / 2 - uy * bend;
      const my = (ry + ty) / 2 + ux * bend;
      // Relative after the first point: shorter numbers, a lighter path.
      const lx = rx - uy * w;
      const ly = ry + ux * w;
      const hair = `M${f1(lx)} ${f1(ly)}q${f1(mx - lx)} ${f1(my - ly)} ${f1(tx - lx)} ${f1(ty - ly)}q${f1(mx - tx)} ${f1(my - ty)} ${f1(rx + uy * w - tx)} ${f1(ry - ux * w - ty)}z`;
      const light = Math.max(-1, Math.min(1, base + (rand() - 0.5) * 0.6));
      add(band, Math.round(((light + 1) / 2) * (SHADES - 1)), hair);
    }
  }

  const out: FurLayer[] = [];
  for (let band = 0; band <= BANDS; band++) {
    for (let shade = 0; shade < SHADES; shade++) {
      const hairs = layers.get(`${band}:${shade}`);
      if (hairs) out.push({ d: hairs.join(""), light: (shade / (SHADES - 1)) * 2 - 1 });
    }
  }
  return out;
}

/** A hair's colour: lighter and darker than facets, as fur has deep gaps and bright tips. */
export function hairFill(light: number) {
  return light >= 0
    ? `color-mix(in oklab, var(--mascot-color), white ${Math.round(light * 30)}%)`
    : `color-mix(in oklab, var(--mascot-color), black ${Math.round(-light * 38)}%)`;
}
