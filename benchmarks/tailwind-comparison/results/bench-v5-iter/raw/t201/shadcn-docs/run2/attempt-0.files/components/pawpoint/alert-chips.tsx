import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Medical alerts. Solid red with a warning icon so they cannot be mistaken
 * for ordinary tags, wherever a patient appears.
 */
export function AlertChips({
  alerts,
  className,
  size = "sm",
}: {
  alerts: string[];
  className?: string;
  size?: "sm" | "lg";
}) {
  if (alerts.length === 0) return null;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)} aria-label="Medical alerts">
      {alerts.map((alert) => (
        <li
          key={alert}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md bg-red-700 font-semibold text-white ring-1 ring-red-900/20",
            size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1.5 text-sm",
          )}
        >
          <TriangleAlert className={size === "sm" ? "size-3.5 shrink-0" : "size-4 shrink-0"} aria-hidden />
          <span className="sr-only">Medical alert: </span>
          {alert}
        </li>
      ))}
    </ul>
  );
}
