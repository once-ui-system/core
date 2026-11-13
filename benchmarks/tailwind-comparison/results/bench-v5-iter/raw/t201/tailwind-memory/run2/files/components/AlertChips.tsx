import { TriangleAlert } from "lucide-react";

/** Medical alerts: always solid red with an icon and the word "Alert" for screen readers. */
export function AlertChips({ alerts, size = "sm", className = "" }: { alerts: string[]; size?: "sm" | "md"; className?: string }) {
  if (alerts.length === 0) return null;
  const cls = size === "md" ? "px-3 py-1.5 text-sm" : "px-2 py-0.5 text-xs";
  return (
    <ul aria-label="Medical alerts" className={`flex flex-wrap gap-1.5 ${className}`}>
      {alerts.map((a) => (
        <li
          key={a}
          className={`inline-flex items-center gap-1.5 rounded-md bg-red-700 font-semibold leading-snug text-white ring-1 ring-red-900/20 ${cls}`}
        >
          <TriangleAlert aria-hidden className={size === "md" ? "size-4 shrink-0" : "size-3.5 shrink-0"} strokeWidth={2.5} />
          <span className="sr-only">Medical alert: </span>
          {a}
        </li>
      ))}
    </ul>
  );
}
