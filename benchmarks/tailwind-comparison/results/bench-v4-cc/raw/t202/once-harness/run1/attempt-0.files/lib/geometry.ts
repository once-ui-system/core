import { EVENT, type SeatTable } from "./data";

export const ROOM_W = EVENT.room_m.width;
export const ROOM_D = EVENT.room_m.depth;

export const ROUND_D = 1.6;
export const SEAT_D = 0.85;
export const RING_R = 1.25;
export const LONG_W = 7;
export const LONG_H = 1;
export const SEAT_OFFSET = 0.5;

export type Pt = { x: number; y: number };

/** Centre and size of the table top, in metres. For a long table x/y is its top-left corner. */
export function tableBody(t: SeatTable): { cx: number; cy: number; w: number; h: number } {
  if (t.shape === "round") return { cx: t.x, cy: t.y, w: ROUND_D, h: ROUND_D };
  return { cx: t.x + LONG_W / 2, cy: t.y + LONG_H / 2, w: LONG_W, h: LONG_H };
}

/** Seat centres in metres, numbered clockwise from the top. */
export function seatPoints(t: SeatTable): Pt[] {
  const pts: Pt[] = [];
  if (t.shape === "round") {
    for (let i = 0; i < t.seats; i++) {
      const a = (-90 + (i * 360) / t.seats) * (Math.PI / 180);
      pts.push({ x: t.x + RING_R * Math.cos(a), y: t.y + RING_R * Math.sin(a) });
    }
    return pts;
  }
  const top = Math.ceil(t.seats / 2);
  const bottom = t.seats - top;
  for (let i = 0; i < top; i++) {
    pts.push({ x: t.x + ((i + 0.5) * LONG_W) / top, y: t.y - SEAT_OFFSET });
  }
  for (let j = 0; j < bottom; j++) {
    pts.push({
      x: t.x + LONG_W - ((j + 0.5) * LONG_W) / bottom,
      y: t.y + LONG_H + SEAT_OFFSET,
    });
  }
  return pts;
}

export function pctX(m: number): string {
  return `${(m / ROOM_W) * 100}%`;
}

export function pctY(m: number): string {
  return `${(m / ROOM_D) * 100}%`;
}

export function dist(a: Pt, b: Pt): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
