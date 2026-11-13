import type { TableDef } from "./data";

export type SeatSpot = { index: number; cx: number; cy: number };

export type TableGeometry = {
  /** footprint box in metres (top-left and size) */
  x: number;
  y: number;
  w: number;
  h: number;
  /** the tabletop itself, relative to the footprint, in metres */
  top: { x: number; y: number; w: number; h: number };
  seats: SeatSpot[];
  /** centre of the footprint in room metres */
  centre: { x: number; y: number };
};

export const SEAT_SIZE = 0.8;

export function tableGeometry(t: TableDef): TableGeometry {
  if (t.shape === "long") {
    // (x, y) is the top-left of the footprint: seats on both long sides.
    const w = 8;
    const h = 2.6;
    const perSide = Math.ceil(t.seats / 2);
    const pitch = w / perSide;
    const seats: SeatSpot[] = [];
    for (let i = 0; i < t.seats; i += 1) {
      const row = i < perSide ? 0 : 1;
      const col = row === 0 ? i : i - perSide;
      seats.push({ index: i, cx: pitch * (col + 0.5), cy: row === 0 ? 0.4 : h - 0.4 });
    }
    return {
      x: t.x,
      y: t.y,
      w,
      h,
      top: { x: 0.2, y: 0.9, w: w - 0.4, h: 0.8 },
      seats,
      centre: { x: t.x + w / 2, y: t.y + h / 2 },
    };
  }
  // (x, y) is the centre of a round table.
  const small = t.seats <= 6;
  const tableR = small ? 0.8 : 0.9;
  const ring = small ? 1.2 : 1.35;
  const half = ring + SEAT_SIZE / 2;
  const size = half * 2;
  const seats: SeatSpot[] = [];
  for (let i = 0; i < t.seats; i += 1) {
    const a = -Math.PI / 2 + (i / t.seats) * Math.PI * 2;
    seats.push({ index: i, cx: half + Math.cos(a) * ring, cy: half + Math.sin(a) * ring });
  }
  return {
    x: t.x - half,
    y: t.y - half,
    w: size,
    h: size,
    top: { x: half - tableR, y: half - tableR, w: tableR * 2, h: tableR * 2 },
    seats,
    centre: { x: t.x, y: t.y },
  };
}

export function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
