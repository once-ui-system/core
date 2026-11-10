"use client";

import type { CSSProperties } from "react";
import { DIET_COLOR, PARTY_COLOR, RSVP_LABEL, type Rsvp } from "@/lib/data";

export function cssVars(o: Record<string, string>): CSSProperties {
  return o as CSSProperties;
}

export function initialsOf(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function partyColor(party: string): string {
  return PARTY_COLOR[party] ?? "#4d5b6a";
}

export function DietTag({ diet }: { diet: string | null }) {
  if (!diet) return null;
  return (
    <span className="sw-tag" style={cssVars({ "--c": DIET_COLOR[diet] ?? "#6d8fb3" })}>
      {diet}
    </span>
  );
}

export function RsvpTag({ rsvp }: { rsvp: Rsvp }) {
  return <span className={`sw-tag plain ${rsvp}`}>{RSVP_LABEL[rsvp]}</span>;
}
