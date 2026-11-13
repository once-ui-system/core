import type { CSSProperties } from "react";
import { EVENT, type Rsvp } from "@/lib/data";

const PARTY_HUES: Record<string, number> = {
  Couple: 15,
  "Bride's family": 335,
  "Groom's family": 255,
  "University friends": 160,
  "Work friends": 90,
  "Groom's football club": 205,
  "Plus-ones": 295,
};

export const PARTY_NAMES = Object.keys(PARTY_HUES);

function hue(party: string) {
  return PARTY_HUES[party] ?? 270;
}

export function partyStyle(party: string): CSSProperties {
  const h = hue(party);
  return {
    backgroundColor: `oklch(0.92 0.055 ${h})`,
    color: `oklch(0.3 0.09 ${h})`,
    borderColor: `oklch(0.72 0.1 ${h})`,
  };
}

export function partyDot(party: string): string {
  return `oklch(0.66 0.14 ${hue(party)})`;
}

export function initials(name: string): string {
  const words = name.split(" ").filter(Boolean);
  const first = words[0] ?? "";
  const last = words.length > 1 ? (words[words.length - 1] ?? "") : "";
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

export function firstName(name: string): string {
  const words = name.split(" ");
  if (words[0] === "Avó" && words[1]) return `${words[0]} ${words[1]}`;
  return words[0] ?? name;
}

export const RSVP_LABEL: Record<Rsvp, string> = {
  yes: "Attending",
  maybe: "Maybe",
  pending: "Awaiting reply",
  no: "Declined",
};

export function formatEventDate(): string {
  return new Date(`${EVENT.date}T12:00:00Z`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatMetres(m: number): string {
  return `${m.toFixed(1)} m`;
}
