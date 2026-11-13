import { TriangleAlert } from "lucide-react";

/** Medical alerts: solid red so they cannot be missed wherever a patient appears. */
export function AlertChips({ alerts, size = "sm" }: { alerts: string[]; size?: "sm" | "lg" }) {
  if (alerts.length === 0) return null;
  const cls =
    size === "lg"
      ? "gap-2 px-3 py-1.5 text-base"
      : "gap-1 px-2 py-0.5 text-xs";
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Medical alerts">
      {alerts.map((a) => (
        <li
          key={a}
          className={`inline-flex items-center rounded-md bg-red-700 font-semibold text-white ${cls}`}
        >
          <TriangleAlert aria-hidden className={size === "lg" ? "size-5 shrink-0" : "size-3.5 shrink-0"} />
          <span className="sr-only">Alert: </span>
          {a}
        </li>
      ))}
    </ul>
  );
}
