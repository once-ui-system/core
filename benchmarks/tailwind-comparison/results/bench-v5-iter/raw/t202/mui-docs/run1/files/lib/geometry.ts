import type { PlanTable } from "./data";

/** Seat radius in metres, as drawn on the plan. */
export const SEAT_R = 0.4;

export interface SeatSpot {
  /** Position relative to the table centre, in metres. */
  x: number;
  y: number;
  /** Unit vector pointing away from the table, used to place name labels. */
  dx: number;
  dy: number;
}

export function roundBodyRadius(t: PlanTable): number {
  return t.seats > 6 ? 0.82 : 0.72;
}

export function seatRingRadius(t: PlanTable): number {
  return roundBodyRadius(t) + SEAT_R + 0.08;
}

export const LONG_W = 5.8;
export const LONG_H = 1.0;

/** Outer radius of everything belonging to a table (seats included), for rings and hit areas. */
export function tableReach(t: PlanTable): number {
  if (t.shape === "round") return seatRingRadius(t) + SEAT_R;
  return Math.hypot(LONG_W / 2, LONG_H / 2 + SEAT_R * 2);
}

export function seatSpots(t: PlanTable): SeatSpot[] {
  if (t.shape === "round") {
    const r = seatRingRadius(t);
    return Array.from({ length: t.seats }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
      return { x: Math.cos(a) * r, y: Math.sin(a) * r, dx: Math.cos(a), dy: Math.sin(a) };
    });
  }
  const perSide = Math.ceil(t.seats / 2);
  const gap = (LONG_W - 0.9) / perSide;
  const yOff = LONG_H / 2 + SEAT_R + 0.08;
  return Array.from({ length: t.seats }, (_, i) => {
    const top = i < perSide;
    const k = top ? i : i - perSide;
    const x = (k - (perSide - 1) / 2) * gap;
    return { x, y: top ? -yOff : yOff, dx: 0, dy: top ? -1 : 1 };
  });
}
