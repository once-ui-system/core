import type React from "react";
import styles from "./Mascot.module.scss";

/*
 * Built-in accessories: chunky, flat, chibi pieces that fit any body the
 * mascot draws. Each one is placed from the body's own outline, so a beanie
 * hugs a block as well as a circle, and drawn in up to three layers: behind
 * the body (ears), on it (a hat), and in front of the face (a helmet's glass).
 */

/** The accessories the mascot draws itself. */
export type MascotAccessory =
  | "antenna"
  | "bow"
  | "beanie"
  | "headphones"
  | "sprout"
  | "helmet"
  | "crown"
  | "catEars"
  | "partyHat";

export const MASCOT_ACCESSORIES: readonly MascotAccessory[] = [
  "antenna",
  "bow",
  "beanie",
  "headphones",
  "sprout",
  "helmet",
  "crown",
  "catEars",
  "partyHat",
];

export const isMascotAccessory = (value: unknown): value is MascotAccessory =>
  typeof value === "string" && (MASCOT_ACCESSORIES as readonly string[]).includes(value);

/** The body as accessories see it: a superellipse around (100, 104). */
export interface AccessoryBody {
  /** Half the width. */
  a: number;
  /** Half the height. */
  b: number;
  /** Superellipse exponent: 2 is an ellipse, higher is squarer. */
  n: number;
}

const INK = "#1b1e24";
const GLASS = "#f4f7fb";

/** Each accessory's own color, unless `accessoryColor` is set. */
const TINT: Record<MascotAccessory, string> = {
  antenna: "#ffd24d",
  bow: "#ff4d8d",
  beanie: "#ff8a5c",
  headphones: "#7c5cff",
  sprout: "#3fbf6f",
  helmet: "#ff5a5f",
  crown: "#ffc93c",
  catEars: "#ff9ec4",
  partyHat: "#5ab8ff",
};

/** Where the top of the body is, `dx` from the middle (positive is right). */
function topAt(body: AccessoryBody, dx: number): number {
  const t = Math.min(1, Math.abs(dx) / body.a);
  return 104 - body.b * (1 - t ** body.n) ** (1 / body.n);
}

/** The normal pointing out of the top edge at `dx`, as an angle in degrees from straight up. */
function tiltAt(body: AccessoryBody, dx: number): number {
  const step = 1;
  const slope = (topAt(body, dx + step) - topAt(body, dx - step)) / (2 * step);
  return (Math.atan(slope) * 180) / Math.PI;
}

interface Layers {
  back?: React.ReactNode;
  on?: React.ReactNode;
  front?: React.ReactNode;
}

/** One accessory's pieces, in the mascot's 200 × 200 box. */
function draw(kind: MascotAccessory, body: AccessoryBody, tint: string): Layers {
  const top = topAt(body, 0);
  const s = Math.min(1.15, Math.max(0.8, body.a / 82));
  // Chibi proportions: small pieces drawn big and chunky, so they read at avatar size.
  const c = s * 1.45;

  switch (kind) {
    case "antenna": {
      const tip = top - 26 * c;
      return {
        on: (
          <g>
            <path
              d={`M100 ${top + 4} Q${100 + 8 * c} ${top - 12 * c} 100 ${tip}`}
              fill="none"
              stroke={INK}
              strokeWidth={8}
              strokeLinecap="round"
            />
            <circle cx={100} cy={tip - 4} r={11 * c} fill={tint} />
          </g>
        ),
      };
    }

    case "sprout": {
      const base = top + 3;
      const stem = top - 12 * c;
      return {
        on: (
          <g>
            <path
              d={`M100 ${base} L100 ${stem}`}
              stroke={tint}
              strokeWidth={6}
              strokeLinecap="round"
            />
            <ellipse
              cx={100 - 13 * c}
              cy={stem - 6 * c}
              rx={14 * c}
              ry={9 * c}
              fill={tint}
              transform={`rotate(-28 ${100 - 13 * c} ${stem - 6 * c})`}
            />
            <ellipse
              cx={100 + 14 * c}
              cy={stem - 9 * c}
              rx={16 * c}
              ry={10 * c}
              fill={tint}
              transform={`rotate(24 ${100 + 14 * c} ${stem - 9 * c})`}
            />
          </g>
        ),
      };
    }

    case "bow": {
      const dx = body.a * 0.5;
      const x = 100 + dx;
      const y = topAt(body, dx) + 4;
      const angle = tiltAt(body, dx);
      const loop = (side: 1 | -1) =>
        `M${x} ${y} C${x + side * 10 * c} ${y - 22 * c} ${x + side * 30 * c} ${y - 18 * c} ${x + side * 28 * c} ${y} C${x + side * 30 * c} ${y + 18 * c} ${x + side * 10 * c} ${y + 22 * c} ${x} ${y}Z`;
      return {
        on: (
          <g transform={`rotate(${angle + 12} ${x} ${y})`}>
            <path d={loop(-1)} fill={tint} />
            <path d={loop(1)} fill={tint} />
            <path
              d={loop(-1)}
              fill={INK}
              opacity={0.14}
              transform={`translate(${x} ${y}) scale(0.45) translate(${-x} ${-y})`}
            />
            <path
              d={loop(1)}
              fill={INK}
              opacity={0.14}
              transform={`translate(${x} ${y}) scale(0.45) translate(${-x} ${-y})`}
            />
            <rect
              x={x - 7 * c}
              y={y - 8 * c}
              width={14 * c}
              height={16 * c}
              rx={6 * c}
              fill={tint}
            />
          </g>
        ),
      };
    }

    case "beanie": {
      const dx = body.a * 0.84;
      const edge = topAt(body, dx) + 6;
      const crown = top - 22 * s;
      const brim = 13 * s;
      return {
        on: (
          <g>
            <path
              d={`M${100 - dx} ${edge} C${100 - dx} ${crown} ${100 + dx} ${crown} ${100 + dx} ${edge}Z`}
              fill={tint}
            />
            <path
              d={`M${100 - dx - 3} ${edge} Q100 ${edge - 20 * s} ${100 + dx + 3} ${edge} L${100 + dx + 3} ${edge + brim * 0.2} Q100 ${edge - 20 * s + brim} ${100 - dx - 3} ${edge + brim * 0.2}Z`}
              fill={tint}
            />
            <path
              d={`M${100 - dx - 3} ${edge} Q100 ${edge - 20 * s} ${100 + dx + 3} ${edge} L${100 + dx + 3} ${edge + brim * 0.2} Q100 ${edge - 20 * s + brim} ${100 - dx - 3} ${edge + brim * 0.2}Z`}
              fill={INK}
              opacity={0.16}
            />
            <circle cx={100} cy={crown + 4 * s} r={12 * s} fill={tint} />
          </g>
        ),
      };
    }

    case "headphones": {
      const reach = body.a + 4;
      const cupW = 22 * s;
      const cupH = 40 * s;
      return {
        on: (
          <g>
            <path
              d={`M${100 - reach + 6} 96 C${100 - reach + 6} ${top - 30 * s} ${100 + reach - 6} ${top - 30 * s} ${100 + reach - 6} 96`}
              fill="none"
              stroke={INK}
              strokeWidth={9}
              strokeLinecap="round"
            />
            {([-1, 1] as const).map((side) => (
              <g key={side}>
                <rect
                  x={side < 0 ? 100 - reach - cupW / 2 : 100 + reach - cupW / 2}
                  y={104 - cupH / 2}
                  width={cupW}
                  height={cupH}
                  rx={cupW / 2}
                  fill={INK}
                />
                <rect
                  x={side < 0 ? 100 - reach - cupW / 2 - 5 : 100 + reach - cupW / 2 + 5}
                  y={104 - cupH / 2 + 5}
                  width={cupW}
                  height={cupH - 10}
                  rx={cupW / 2}
                  fill={tint}
                />
              </g>
            ))}
          </g>
        ),
      };
    }

    case "helmet": {
      const r = Math.max(body.a, body.b) + 14;
      const cy = 100;
      const collarW = body.a * 1.15;
      const collarY = 104 + body.b - 4;
      return {
        back: <circle cx={100} cy={cy} r={r} fill={GLASS} opacity={0.12} />,
        front: (
          <g>
            <circle cx={100} cy={cy} r={r} fill="none" stroke={GLASS} strokeWidth={10} />
            <path
              d={`M100 ${cy - r} L100 ${cy - r - 12}`}
              stroke={GLASS}
              strokeWidth={6}
              strokeLinecap="round"
            />
            <circle cx={100} cy={cy - r - 16} r={7} fill={tint} />
            <rect
              x={100 - collarW / 2}
              y={collarY}
              width={collarW}
              height={26}
              rx={13}
              fill={GLASS}
            />
            <circle cx={100 - collarW * 0.22} cy={collarY + 13} r={4} fill={tint} />
            <circle cx={100} cy={collarY + 13} r={4} fill={INK} opacity={0.35} />
            <circle cx={100 + collarW * 0.22} cy={collarY + 13} r={4} fill={INK} opacity={0.35} />
          </g>
        ),
      };
    }

    case "crown": {
      const w = 26 * c;
      const base = top + 6;
      const h = 22 * c;
      const peak = (dx: number, tall: number) => `L${100 + dx} ${base - h * tall}`;
      return {
        on: (
          <g transform={`rotate(-10 100 ${base})`}>
            <path
              d={`M${100 - w} ${base} ${peak(-w, 1)} ${peak(-w / 2, 0.45)} ${peak(0, 1.15)} ${peak(w / 2, 0.45)} ${peak(w, 1)} L${100 + w} ${base}Z`}
              fill={tint}
              stroke={tint}
              strokeWidth={5}
              strokeLinejoin="round"
            />
            <circle cx={100 - w} cy={base - h - 4} r={4.5 * c} fill={tint} />
            <circle cx={100} cy={base - h * 1.15 - 4} r={4.5 * c} fill={tint} />
            <circle cx={100 + w} cy={base - h - 4} r={4.5 * c} fill={tint} />
            <circle cx={100} cy={base - h * 0.35} r={4 * c} fill={INK} opacity={0.3} />
          </g>
        ),
      };
    }

    case "catEars": {
      const ear = (side: 1 | -1) => {
        const dx = body.a * 0.52 * side;
        const x = 100 + dx;
        const y = topAt(body, dx) + 10;
        const angle = tiltAt(body, dx) + side * 8;
        const outer = `M${x - 20 * s} ${y} Q${x - 10 * s} ${y - 40 * s} ${x} ${y - 38 * s} Q${x + 10 * s} ${y - 40 * s} ${x + 20 * s} ${y}Z`;
        const inner = `M${x - 10 * s} ${y - 6} Q${x - 5 * s} ${y - 30 * s} ${x} ${y - 29 * s} Q${x + 5 * s} ${y - 30 * s} ${x + 10 * s} ${y - 6}Z`;
        return (
          <g key={side} transform={`rotate(${angle} ${x} ${y})`}>
            <path d={outer} className={styles.fill} />
            <path d={inner} fill={tint} />
          </g>
        );
      };
      return { back: <g>{[ear(-1), ear(1)]}</g> };
    }

    case "partyHat": {
      const dx = body.a * 0.28;
      const x = 100 + dx;
      const y = topAt(body, dx) + 6;
      const angle = tiltAt(body, dx) + 10;
      const half = 17 * c;
      const height = 42 * c;
      return {
        on: (
          <g transform={`rotate(${angle} ${x} ${y})`}>
            <path
              d={`M${x - half} ${y} L${x} ${y - height} L${x + half} ${y} Z`}
              fill={tint}
              stroke={tint}
              strokeWidth={4}
              strokeLinejoin="round"
            />
            <path
              d={`M${x - half * 0.62} ${y - height * 0.36} L${x + half * 0.62} ${y - height * 0.36}`}
              stroke={GLASS}
              strokeWidth={4}
              strokeLinecap="round"
            />
            <path
              d={`M${x - half * 0.32} ${y - height * 0.68} L${x + half * 0.32} ${y - height * 0.68}`}
              stroke={GLASS}
              strokeWidth={4}
              strokeLinecap="round"
            />
            <circle cx={x} cy={y - height - 4} r={8 * c} fill={GLASS} />
          </g>
        ),
      };
    }
  }
}

/** The pieces of every built-in accessory asked for, grouped by layer. */
export function accessoryLayers(
  kinds: MascotAccessory[],
  body: AccessoryBody,
  color?: string,
): Required<Layers> {
  const out: Required<Layers> = { back: null, on: null, front: null };
  const back: React.ReactNode[] = [];
  const on: React.ReactNode[] = [];
  const front: React.ReactNode[] = [];
  for (const kind of kinds) {
    const layers = draw(kind, body, color ?? TINT[kind]);
    if (layers.back) back.push(<g key={kind}>{layers.back}</g>);
    if (layers.on) on.push(<g key={kind}>{layers.on}</g>);
    if (layers.front) front.push(<g key={kind}>{layers.front}</g>);
  }
  out.back = back.length ? back : null;
  out.on = on.length ? on : null;
  out.front = front.length ? front : null;
  return out;
}
