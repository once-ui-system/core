import type { CSSProperties } from "react";
import type { Rsvp } from "./data";

const HUES: Record<string, number> = {
  Couple: 340,
  "Bride's family": 20,
  "Groom's family": 215,
  "University friends": 150,
  "Work friends": 265,
  "Groom's football club": 45,
  "Plus-ones": 190,
};

export function partyHue(party: string): number {
  return HUES[party] ?? 0;
}

export function partyStyle(party: string): CSSProperties {
  const h = partyHue(party);
  return {
    backgroundColor: `hsl(${h} 62% 91%)`,
    borderColor: `hsl(${h} 42% 50%)`,
    color: `hsl(${h} 58% 20%)`,
  };
}

export function initials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const RSVP: Record<Rsvp, { label: string; cls: string }> = {
  yes: { label: "Attending", cls: "bg-emerald-50 text-emerald-800 ring-emerald-200" },
  maybe: { label: "Maybe", cls: "bg-amber-50 text-amber-800 ring-amber-200" },
  pending: { label: "Awaiting reply", cls: "bg-stone-100 text-stone-700 ring-stone-300" },
  no: { label: "Declined", cls: "bg-rose-50 text-rose-800 ring-rose-200" },
};

export const PARTY_ORDER = [
  "Couple",
  "Bride's family",
  "Groom's family",
  "University friends",
  "Work friends",
  "Groom's football club",
  "Plus-ones",
];
