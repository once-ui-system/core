import type { SeatTable } from "./data"

export const SEAT_R = 0.38
export const LONG_DEPTH = 1

export interface SeatPos {
  x: number
  y: number
}

export interface TableGeometry {
  /** centre of the table in metres */
  cx: number
  cy: number
  /** round tables */
  radius: number
  /** long tables: left, top, width, height */
  rect: { x: number; y: number; w: number; h: number } | null
  seats: SeatPos[]
  /** radius of the invisible hit area around table and seats */
  hitR: number
}

export function tableGeometry(t: SeatTable): TableGeometry {
  if (t.shape === "long") {
    // x, y are the top-left corner; one seat per metre, on the room side (south).
    const w = t.seats
    const h = LONG_DEPTH
    const seats: SeatPos[] = Array.from({ length: t.seats }, (_, i) => ({
      x: t.x + 0.5 + i,
      y: t.y + h + 0.5,
    }))
    return {
      cx: t.x + w / 2,
      cy: t.y + h / 2,
      radius: 0,
      rect: { x: t.x, y: t.y, w, h },
      seats,
      hitR: 0,
    }
  }
  const radius = t.seats <= 6 ? 0.8 : 0.95
  const ring = radius + 0.5
  const seats: SeatPos[] = Array.from({ length: t.seats }, (_, i) => {
    const a = (-90 + (i * 360) / t.seats) * (Math.PI / 180)
    return { x: t.x + ring * Math.cos(a), y: t.y + ring * Math.sin(a) }
  })
  return { cx: t.x, cy: t.y, radius, rect: null, seats, hitR: ring + SEAT_R + 0.1 }
}

export function distance(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by)
}
