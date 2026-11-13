import { Ban, CalendarDays, CircleCheck, Hourglass, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Status } from "@/lib/data";

const CONFIG: Record<Status, { label: string; className: string; Icon: typeof Hourglass }> = {
  booked: {
    label: "Booked",
    className: "border-border bg-background text-foreground",
    Icon: CalendarDays,
  },
  checked_in: {
    label: "Checked in",
    className:
      "bg-amber-100 text-amber-950 dark:bg-amber-500/20 dark:text-amber-100",
    Icon: Hourglass,
  },
  in_exam: {
    label: "In exam",
    className: "bg-sky-100 text-sky-950 dark:bg-sky-500/20 dark:text-sky-100",
    Icon: Stethoscope,
  },
  done: {
    label: "Done",
    className:
      "bg-emerald-100 text-emerald-950 dark:bg-emerald-500/20 dark:text-emerald-100",
    Icon: CircleCheck,
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground",
    Icon: Ban,
  },
};

export function statusLabel(status: Status): string {
  return CONFIG[status].label;
}

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const { label, className: tone, Icon } = CONFIG[status];
  return (
    <Badge variant="outline" className={cn("gap-1.5 px-2.5 py-1 text-xs", tone, className)}>
      <Icon aria-hidden="true" />
      {label}
    </Badge>
  );
}
