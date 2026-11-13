import { TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Medical alerts: solid red, icon plus text, so they are never colour-only and never truncated. */
export function AlertBadges({ alerts, className }: { alerts: string[]; className?: string }) {
  if (alerts.length === 0) return null;
  return (
    <ul aria-label="Medical alerts" className={cn("flex flex-wrap gap-1.5", className)}>
      {alerts.map((alert) => (
        <li key={alert}>
          <Badge
            variant="destructive"
            className="h-auto items-start gap-1 rounded-md bg-red-700 px-2 py-1 text-left text-xs font-semibold leading-snug whitespace-normal text-white dark:bg-red-700"
          >
            <TriangleAlert aria-hidden className="mt-px size-3.5 shrink-0" />
            <span>
              <span className="sr-only">Medical alert: </span>
              {alert}
            </span>
          </Badge>
        </li>
      ))}
    </ul>
  );
}
