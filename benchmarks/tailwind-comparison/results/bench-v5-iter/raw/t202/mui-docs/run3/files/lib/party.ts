import { partyHue } from "./data";

/** Soft party colour that works over both light and dark surfaces. */
export function partyTint(party: string, pct = 26): string {
  const h = partyHue[party] ?? 0;
  return `color-mix(in srgb, hsl(${h} 70% 50%) ${pct}%, var(--mui-palette-background-paper))`;
}

export function partyEdge(party: string): string {
  const h = partyHue[party] ?? 0;
  return `hsl(${h} 55% 46%)`;
}
