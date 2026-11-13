import type { Fixture, Table } from "./data";

export type Point = { x: number; y: number };

export const SEAT_R = 0.4;
const SPACING = 1.1;
const DEPTH = 0.9;

export function roundRadius(t: Table): number {
  return t.seats > 6 ? 0.95 : 0.8;
}

export function longSize(t: Table) {
  const perSide = Math.ceil(t.seats / 2);
  return { perSide, w: perSide * SPACING + 0.4, d: DEPTH };
}

/** Seat centres in room metres, seat 0 first. */
export function seatPoints(t: Table): Point[] {
  const pts: Point[] = [];
  if (t.shape === "round") {
    const ring = roundRadius(t) + 0.55;
    for (let i = 0; i < t.seats; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
      pts.push({ x: t.x + ring * Math.cos(a), y: t.y + ring * Math.sin(a) });
    }
    return pts;
  }
  const rot = ((t.rotation ?? 0) * Math.PI) / 180;
  const { perSide } = longSize(t);
  const bottom = t.seats - perSide;
  for (let i = 0; i < t.seats; i++) {
    const row = i < perSide ? 0 : 1;
    const count = row === 0 ? perSide : bottom;
    const col = row === 0 ? i : i - perSide;
    const lx = (col - (count - 1) / 2) * SPACING;
    const ly = (row === 0 ? -1 : 1) * (DEPTH / 2 + 0.45);
    pts.push({
      x: t.x + lx * Math.cos(rot) - ly * Math.sin(rot),
      y: t.y + lx * Math.sin(rot) + ly * Math.cos(rot),
    });
  }
  return pts;
}

/** Distance in metres from a point to the nearest edge of a fixture. */
export function distanceToFixture(px: number, py: number, f: Fixture): number {
  const dx = Math.max(f.x - px, 0, px - (f.x + f.w));
  const dy = Math.max(f.y - py, 0, py - (f.y + f.h));
  return Math.hypot(dx, dy);
}
