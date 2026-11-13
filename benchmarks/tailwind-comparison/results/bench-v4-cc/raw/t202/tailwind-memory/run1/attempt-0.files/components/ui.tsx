import type { ReactNode } from "react";
import { partyColor, rsvpLabel, type Rsvp } from "@/lib/data";

export function Card({
  title,
  action,
  children,
  className = "",
  ...rest
}: {
  title?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={`rounded-2xl border border-stone-200 bg-white shadow-sm ${className}`}
      {...rest}
    >
      {title ? (
        <header className="flex items-center justify-between gap-3 border-b border-stone-100 px-4 py-3">
          <h2 className="text-sm font-semibold tracking-tight text-stone-900">{title}</h2>
          {action}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function PartyDot({ party }: { party: string }) {
  return (
    <span
      aria-hidden
      className="inline-block size-2.5 shrink-0 rounded-full"
      style={{ backgroundColor: partyColor[party] ?? "#57534e" }}
    />
  );
}

export function DietBadge({ diet }: { diet: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
      {diet}
    </span>
  );
}

const rsvpStyles: Record<Rsvp, string> = {
  yes: "bg-emerald-100 text-emerald-900",
  maybe: "bg-amber-100 text-amber-900",
  pending: "bg-stone-100 text-stone-700",
  no: "bg-rose-100 text-rose-900",
};

export function RsvpBadge({ rsvp }: { rsvp: Rsvp }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${rsvpStyles[rsvp]}`}>
      {rsvpLabel[rsvp]}
    </span>
  );
}
