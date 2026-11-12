import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/** Medical alerts: solid red pills that read as warnings in every place a patient appears. */
export function AlertBadges({
  alerts,
  className,
  size = "sm",
}: {
  alerts: string[];
  className?: string;
  size?: "sm" | "md";
}) {
  if (alerts.length === 0) return null;
  return (
    <ul
      aria-label={alerts.length === 1 ? "Medical alert" : "Medical alerts"}
      className={cn("flex flex-wrap gap-1.5", className)}
    >
      {alerts.map((alert) => (
        <li
          key={alert}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md bg-red-600 font-semibold text-white shadow-xs ring-1 ring-red-700/40",
            size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
          )}
        >
          <TriangleAlert aria-hidden className={size === "sm" ? "size-3.5 shrink-0" : "size-4 shrink-0"} />
          <span className="sr-only">Alert: </span>
          {alert}
        </li>
      ))}
    </ul>
  );
}
