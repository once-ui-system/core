export type PartyTone = "brand" | "accent" | "info" | "success" | "warning" | "neutral";

export const PARTY_TONE: Record<string, PartyTone> = {
  Couple: "brand",
  "Bride's family": "accent",
  "Groom's family": "info",
  "University friends": "success",
  "Work friends": "warning",
  "Groom's football club": "neutral",
  "Plus-ones": "neutral",
};

export function toneOf(party: string): PartyTone {
  return PARTY_TONE[party] ?? "neutral";
}

export function seatBg(tone: PartyTone) {
  return (
    {
      brand: "brand-alpha-medium",
      accent: "accent-alpha-medium",
      info: "info-alpha-medium",
      success: "success-alpha-medium",
      warning: "warning-alpha-medium",
      neutral: "neutral-alpha-medium",
    } as const
  )[tone];
}

export function dotBg(tone: PartyTone) {
  return (
    {
      brand: "brand-medium",
      accent: "accent-medium",
      info: "info-medium",
      success: "success-medium",
      warning: "warning-medium",
      neutral: "neutral-medium",
    } as const
  )[tone];
}

export function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function dietTone(diet: string): "warning" | "info" {
  return /allergy/i.test(diet) ? "warning" : "info";
}
