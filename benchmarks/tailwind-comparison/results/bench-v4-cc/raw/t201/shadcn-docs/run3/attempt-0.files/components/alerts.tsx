import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/** Compact, high-contrast chips used wherever a patient appears in a list. */
export function AlertChips({ alerts, className }: { alerts: string[]; className?: string }) {
  if (alerts.length === 0) return null;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label="Medical alerts">
      {alerts.map((alert) => (
        <li key={alert}>
          <span className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">
            <TriangleAlert className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="sr-only">Medical alert: </span>
            {alert}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Large banner for the top of a patient record. */
export function AlertBanner({ name, alerts }: { name: string; alerts: string[] }) {
  if (alerts.length === 0) return null;
  return (
    <section
      aria-labelledby="medical-alerts-heading"
      className="rounded-xl border-2 border-red-600 bg-red-50 p-4 dark:bg-red-950/40"
    >
      <h2
        id="medical-alerts-heading"
        className="flex items-center gap-2 text-sm font-bold tracking-wide text-red-700 uppercase dark:text-red-300"
      >
        <TriangleAlert className="size-5" aria-hidden="true" />
        Medical alerts for {name}
      </h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {alerts.map((alert) => (
          <li
            key={alert}
            className="flex items-center gap-3 rounded-lg bg-red-600 px-4 py-3 text-base font-semibold text-white sm:text-lg"
          >
            <TriangleAlert className="size-6 shrink-0" aria-hidden="true" />
            {alert}
          </li>
        ))}
      </ul>
    </section>
  );
}
