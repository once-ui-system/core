import { TriangleAlert } from "lucide-react";

/** Medical alerts: solid red, icon plus text, so they read at a glance and never rely on colour alone. */
export function AlertBadges({ alerts, className = "" }: { alerts: string[]; className?: string }) {
  if (alerts.length === 0) return null;
  return (
    <ul aria-label="Medical alerts" className={`flex flex-wrap gap-1.5 ${className}`}>
      {alerts.map((alert) => (
        <li
          key={alert}
          className="inline-flex items-center gap-1 rounded-md bg-red-700 px-2 py-0.5 text-xs font-bold text-white"
        >
          <TriangleAlert aria-hidden className="size-3.5 shrink-0" />
          <span className="sr-only">Medical alert: </span>
          {alert}
        </li>
      ))}
    </ul>
  );
}

/** Small marker for tight spaces (vet board, lists of names). */
export function AlertMark({ alerts }: { alerts: string[] }) {
  if (alerts.length === 0) return null;
  return (
    <span
      title={alerts.join("; ")}
      className="inline-flex items-center align-middle text-red-700"
    >
      <TriangleAlert aria-hidden className="size-4" />
      <span className="sr-only">Medical alert: {alerts.join("; ")}</span>
    </span>
  );
}
