import { partyColor, rsvpLabel, type Rsvp } from "@/lib/data";

export function PartyDot({ party, className = "" }: { party: string; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block size-2.5 shrink-0 rounded-full ${className}`}
      style={{ background: partyColor(party) }}
    />
  );
}

export function DietBadge({ diet }: { diet: string | null }) {
  if (!diet) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 ring-1 ring-amber-300/70">
      {diet}
    </span>
  );
}

const RSVP_STYLE: Record<Rsvp, string> = {
  yes: "bg-emerald-100 text-emerald-900 ring-emerald-300/70",
  maybe: "bg-amber-100 text-amber-900 ring-amber-300/70",
  pending: "bg-sky-100 text-sky-900 ring-sky-300/70",
  no: "bg-rose-100 text-rose-900 ring-rose-300/70",
};

export function RsvpBadge({ rsvp }: { rsvp: Rsvp }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${RSVP_STYLE[rsvp]}`}
    >
      {rsvpLabel[rsvp]}
    </span>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-stone-200 bg-white shadow-sm print:shadow-none ${className}`}>
      {children}
    </section>
  );
}
