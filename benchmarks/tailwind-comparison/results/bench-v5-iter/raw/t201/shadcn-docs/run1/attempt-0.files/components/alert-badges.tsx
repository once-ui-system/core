import { TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Medical alerts, drawn the same loud way everywhere a patient appears. */
export function AlertBadges({
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
    <ul
      aria-label="Medical alerts"
      className={cn("flex flex-wrap gap-1.5", className)}
    >
      {alerts.map((alert) => (
        <li key={alert}>
          <Badge
            variant="destructive"
            className={cn(
              "gap-1.5 rounded-md font-bold dark:bg-destructive",
              size === "lg"
                ? "px-3 py-1.5 text-sm [&>svg]:size-4"
                : "px-2 py-0.5 text-xs [&>svg]:size-3.5",
            )}
          >
            <TriangleAlert aria-hidden />
            <span className="sr-only">Medical alert: </span>
            {alert}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
