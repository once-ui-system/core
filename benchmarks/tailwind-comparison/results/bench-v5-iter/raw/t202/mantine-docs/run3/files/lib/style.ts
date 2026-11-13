import { PARTY_COLORS } from "./data";

export type PartyStyle = { bg: string; fg: string; edge: string };

/** Light fill, dark text and a mid edge from one Mantine colour, so contrast holds for every party. */
export function partyStyle(party: string): PartyStyle {
  const c = PARTY_COLORS[party] ?? "gray";
  return {
    bg: `var(--mantine-color-${c}-1)`,
    fg: `color-mix(in srgb, var(--mantine-color-${c}-9) 55%, black)`,
    edge: `var(--mantine-color-${c}-5)`,
  };
}
