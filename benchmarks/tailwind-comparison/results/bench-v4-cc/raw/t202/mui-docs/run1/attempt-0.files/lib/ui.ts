// One hue per party, used on seats, avatars and the legend. Hue and saturation only:
// the tint mixes into the surface colour so it works in light and dark mode.
const PARTY_HSL: Record<string, [number, number]> = {
  Couple: [340, 70],
  "Bride's family": [272, 52],
  "Groom's family": [212, 68],
  "University friends": [158, 55],
  "Work friends": [38, 85],
  "Groom's football club": [96, 50],
  "Plus-ones": [220, 10],
};

export function partyColor(party: string): { solid: string; tint: string } {
  const [h, s] = PARTY_HSL[party] ?? [220, 10];
  return {
    solid: `hsl(${h} ${s}% 46%)`,
    tint: `color-mix(in srgb, hsl(${h} ${s}% 50%) 26%, var(--mui-palette-background-paper))`,
  };
}

export const STRONG_BORDER = "color-mix(in srgb, var(--mui-palette-text-primary) 30%, transparent)";
export const SOFT_BORDER = "color-mix(in srgb, var(--mui-palette-text-primary) 14%, transparent)";

export function tint(colorVar: string, percent: number): string {
  return `color-mix(in srgb, var(--mui-palette-${colorVar}) ${percent}%, transparent)`;
}
