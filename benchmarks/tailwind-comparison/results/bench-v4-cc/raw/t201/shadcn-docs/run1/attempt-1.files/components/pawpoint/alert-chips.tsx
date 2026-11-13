import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Medical alerts. Solid red with white text and an icon so they cannot be missed,
 * and never rely on colour alone (icon + the words "Medical alert" for screen readers).
 */
export function AlertChips({
  alerts,
  size = "sm",
  className,
}: {
  alerts: string[];
  size?: "sm" | "lg";
  className?: string;
}) {
  if (alerts.length === 0) return null;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label="Medical alerts">
      {alerts.map((alert) => (
        <li
          key={alert}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md bg-red-600 font-semibold text-white shadow-sm ring-1 ring-red-700/40",
            size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1.5 text-base",
          )}
        >
          <TriangleAlert className={size === "sm" ? "size-3.5" : "size-5"} aria-hidden="true" />
          <span className="sr-only">Medical alert: </span>
          {alert}
        </li>
      ))}
    </ul>
  );
}
