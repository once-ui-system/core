import { event, fixtures, guests, tables, type Fixture, type Guest, type Rsvp, type Table } from "./data";

export const guestById: Record<string, Guest> = Object.fromEntries(guests.map((g) => [g.id, g]));
export const tableById: Record<string, Table> = Object.fromEntries(tables.map((t) => [t.id, t]));

export const STANDARD_MEAL = "Standard menu";

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "Awaiting reply",
  no: "Declined",
};

export const PARTY_COLORS: Record<string, string> = {
  Couple: "#a23b72",
  "Bride's family": "#2f6fb0",
  "Groom's family": "#b5581a",
  "University friends": "#26784a",
  "Work friends": "#6455b0",
  "Groom's football club": "#0e7c86",
  "Plus-ones": "#5f6b7a",
};

export const PARTIES: string[] = Array.from(new Set(guests.map((g) => g.party)));

export function partyColor(party: string): string {
  return PARTY_COLORS[party] ?? "#5f6b7a";
}

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  const first = parts[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1] ?? "") : "";
  return (first.charAt(0) + last.charAt(0)).toUpperCase();
}

export function firstName(name: string): string {
  return name.split(" ")[0] ?? name;
}

export function formatEventDate(): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${event.date}T12:00:00Z`));
}

/** Seat diameter in metres, as drawn. */
export const SEAT_M = 0.85;

export interface Point {
  x: number;
  y: number;
}

export interface TableGeometry {
  centre: Point;
  w: number;
  h: number;
  seats: Point[];
}

/**
 * Round tables: x,y is the centre. The long (top) table: x,y is its top-left
 * corner, the seats run along the side that faces the room.
 */
export function tableGeometry(t: Table): TableGeometry {
  if (t.shape === "long") {
    const w = t.seats * 1;
    const h = 1.2;
    const seats: Point[] = [];
    for (let i = 0; i < t.seats; i++) {
      seats.push({ x: t.x + (w / t.seats) * (i + 0.5), y: t.y - 0.5 });
    }
    return { centre: { x: t.x + w / 2, y: t.y + h / 2 }, w, h, seats };
  }
  const ring = t.seats > 6 ? 1.45 : 1.35;
  const seats: Point[] = [];
  for (let i = 0; i < t.seats; i++) {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / t.seats;
    seats.push({ x: t.x + ring * Math.cos(a), y: t.y + ring * Math.sin(a) });
  }
  return { centre: { x: t.x, y: t.y }, w: 1.8, h: 1.8, seats };
}

export function fixtureCentre(f: Fixture): Point {
  return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
}

export function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function findFixture(kind: Fixture["kind"]): Fixture | undefined {
  return fixtures.find((f) => f.kind === kind);
}
