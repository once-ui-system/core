export const partyOrder = [
  "Couple",
  "Bride's family",
  "Groom's family",
  "University friends",
  "Work friends",
  "Groom's football club",
  "Plus-ones",
] as const;

export function partyIndex(party: string): number {
  const index = partyOrder.indexOf(party as (typeof partyOrder)[number]);
  return index === -1 ? 6 : index;
}
