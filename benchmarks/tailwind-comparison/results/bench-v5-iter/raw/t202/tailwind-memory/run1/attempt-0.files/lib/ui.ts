import type { Rsvp } from "./data";

export const PARTY_STYLE: Record<string, { seat: string; dot: string; soft: string }> = {
  Couple: { seat: "bg-stone-900 text-white", dot: "bg-stone-900", soft: "bg-stone-200 text-stone-900" },
  "Bride's family": { seat: "bg-violet-700 text-white", dot: "bg-violet-700", soft: "bg-violet-100 text-violet-900" },
  "Groom's family": { seat: "bg-sky-700 text-white", dot: "bg-sky-700", soft: "bg-sky-100 text-sky-900" },
  "University friends": { seat: "bg-emerald-700 text-white", dot: "bg-emerald-700", soft: "bg-emerald-100 text-emerald-900" },
  "Work friends": { seat: "bg-amber-700 text-white", dot: "bg-amber-700", soft: "bg-amber-100 text-amber-900" },
  "Groom's football club": { seat: "bg-lime-800 text-white", dot: "bg-lime-800", soft: "bg-lime-100 text-lime-900" },
  "Plus-ones": { seat: "bg-pink-700 text-white", dot: "bg-pink-700", soft: "bg-pink-100 text-pink-900" },
};

export function partyStyle(party: string) {
  return (
    PARTY_STYLE[party] ?? { seat: "bg-slate-700 text-white", dot: "bg-slate-700", soft: "bg-slate-100 text-slate-900" }
  );
}

export const RSVP_STYLE: Record<Rsvp, string> = {
  yes: "bg-emerald-100 text-emerald-900 ring-emerald-600/20",
  maybe: "bg-amber-100 text-amber-900 ring-amber-600/20",
  pending: "bg-slate-100 text-slate-700 ring-slate-500/20",
  no: "bg-rose-100 text-rose-900 ring-rose-600/20",
};
