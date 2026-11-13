import { TriangleAlert } from "lucide-react";
import { cx } from "@/lib/cx";

/** Medical alerts: solid red with an icon and the words in screen-reader text, never colour alone. */
export function AlertBadges({ alerts, className }: { alerts: string[]; className?: string }) {
  if (alerts.length === 0) return null;
  return (
    <ul className={cx("flex flex-wrap gap-1.5", className)} aria-label="Medical alerts">
      {alerts.map((a) => (
        <li
          key={a}
          className="inline-flex items-center gap-1.5 rounded-md bg-red-700 px-2 py-1 text-xs font-bold leading-tight text-white sm:text-sm"
        >
          <TriangleAlert className="size-4 shrink-0" aria-hidden />
          <span className="sr-only">Medical alert: </span>
          {a}
        </li>
      ))}
    </ul>
  );
}

/** Large banner used where a patient is the subject of the screen (record, booking form). */
export function AlertBanner({ alerts, name }: { alerts: string[]; name: string }) {
  if (alerts.length === 0) return null;
  return (
    <section aria-label={`Medical alerts for ${name}`} className="rounded-xl border-2 border-red-800 bg-red-700 p-4 text-white shadow-sm">
      <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
        <TriangleAlert className="size-5" aria-hidden />
        Medical alerts for {name}
      </h2>
      <ul className="mt-2 space-y-1 text-lg font-bold leading-snug sm:text-xl">
        {alerts.map((a) => (
          <li key={a} className="flex gap-2">
            <span aria-hidden>&bull;</span>
            <span>{a}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
