import { TABLES, type Table } from "@/lib/data";

export type SeatPoint = { dx: number; dy: number };

export type TableGeometry = {
  round: boolean;
  bodyW: number;
  bodyH: number;
  haloW: number;
  haloH: number;
  seatD: number;
  seats: SeatPoint[];
};

export function tableGeometry(t: Table): TableGeometry {
  if (t.shape === "round") {
    const bodyD = 1.4 + 0.05 * t.seats;
    const seatD = 0.9;
    const ring = bodyD / 2 + 0.1 + seatD / 2;
    const seats: SeatPoint[] = [];
    for (let i = 0; i < t.seats; i++) {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / t.seats;
      seats.push({ dx: Math.cos(angle) * ring, dy: Math.sin(angle) * ring });
    }
    const halo = 2 * (ring + seatD / 2 + 0.12);
    return { round: true, bodyW: bodyD, bodyH: bodyD, haloW: halo, haloH: halo, seatD, seats };
  }

  const seatD = 0.8;
  const pitch = 0.95;
  const perSide = Math.ceil(t.seats / 2);
  const bodyW = perSide * pitch + 0.1;
  const bodyH = 1;
  const offset = bodyH / 2 + 0.05 + seatD / 2;
  const rot = ((t.rotation ?? 0) * Math.PI) / 180;
  const seats: SeatPoint[] = [];
  for (let i = 0; i < t.seats; i++) {
    const top = i < perSide;
    const count = top ? perSide : t.seats - perSide;
    const index = top ? i : i - perSide;
    const dx = (index - (count - 1) / 2) * pitch;
    const dy = top ? -offset : offset;
    seats.push({
      dx: dx * Math.cos(rot) - dy * Math.sin(rot),
      dy: dx * Math.sin(rot) + dy * Math.cos(rot),
    });
  }
  return {
    round: false,
    bodyW,
    bodyH,
    haloW: (perSide - 1) * pitch + seatD + 0.5,
    haloH: 2 * (offset + seatD / 2 + 0.12),
    seatD,
    seats,
  };
}

export const GEOMETRY: Record<string, TableGeometry> = Object.fromEntries(
  TABLES.map((t) => [t.id, tableGeometry(t)]),
);
