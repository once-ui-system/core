import { TriangleAlert } from "lucide-react";

/** Compact solid-red chips: used wherever a patient appears in a list. */
export function AlertChips({ alerts }: { alerts: string[] }) {
  if (alerts.length === 0) return null;
  return (
    <ul aria-label="Medical alerts" className="flex flex-wrap gap-1.5">
      {alerts.map((alert) => (
        <li
          key={alert}
          className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-xs font-bold text-white"
        >
          <TriangleAlert aria-hidden="true" className="size-3.5 shrink-0" />
          <span className="sr-only">Alert: </span>
          {alert}
        </li>
      ))}
    </ul>
  );
}

/** Full-width banner for a patient's record or a booking form. */
export function AlertBanner({ alerts, name }: { alerts: string[]; name: string }) {
  if (alerts.length === 0) return null;
  return (
    <section
      aria-label={`Medical alerts for ${name}`}
      className="rounded-xl border-2 border-red-600 bg-red-50 p-4"
    >
      <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-red-700">
        <TriangleAlert aria-hidden="true" className="size-5" />
        Medical alerts
      </h2>
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {alerts.map((alert) => (
          <li
            key={alert}
            className="rounded-lg bg-red-600 px-3 py-2 text-base font-bold leading-snug text-white"
          >
            {alert}
          </li>
        ))}
      </ul>
    </section>
  );
}
