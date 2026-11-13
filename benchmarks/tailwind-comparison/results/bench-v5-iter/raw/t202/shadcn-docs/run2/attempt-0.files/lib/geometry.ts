import type { TableDef } from "@/lib/data";

/** Diameter of a seat, in metres of floor space. */
export const SEAT_D = 0.9;

export interface TableFrame {
  /** Top-left of the frame (table plus its seats) in room metres. */
  left: number;
  top: number;
  width: number;
  height: number;
  /** The table top, relative to the frame. */
  surface: { x: number; y: number; w: number; h: number; round: boolean };
  /** Seat centres, relative to the frame. */
  seats: { x: number; y: number }[];
  /** Centre of the table in room metres. */
  centre: { x: number; y: number };
}

const ORBIT = 1.45;
const LONG_DEPTH = 1.3;
const LONG_GAP = 0.1;

export function tableFrame(t: TableDef): TableFrame {
  if (t.shape === "long") {
    const length = t.seats;
    const seatRow = SEAT_D + LONG_GAP;
    return {
      left: t.x,
      top: t.y - seatRow,
      width: length,
      height: seatRow + LONG_DEPTH,
      surface: { x: 0, y: seatRow, w: length, h: LONG_DEPTH, round: false },
      seats: Array.from({ length: t.seats }, (_, i) => ({ x: i + 0.5, y: SEAT_D / 2 })),
      centre: { x: t.x + length / 2, y: t.y + LONG_DEPTH / 2 },
    };
  }
  const radius = t.seats > 6 ? 0.8 : 0.75;
  const ext = ORBIT + SEAT_D / 2;
  return {
    left: t.x - ext,
    top: t.y - ext,
    width: ext * 2,
    height: ext * 2,
    surface: { x: ext - radius, y: ext - radius, w: radius * 2, h: radius * 2, round: true },
    seats: Array.from({ length: t.seats }, (_, i) => {
      const a = (i / t.seats) * Math.PI * 2 - Math.PI / 2;
      return { x: ext + Math.cos(a) * ORBIT, y: ext + Math.sin(a) * ORBIT };
    }),
    centre: { x: t.x, y: t.y },
  };
}

/** A length in room metres as a CSS value (the room sets --m to one metre). */
export function m(v: number): string {
  return `calc(var(--m) * ${v})`;
}
