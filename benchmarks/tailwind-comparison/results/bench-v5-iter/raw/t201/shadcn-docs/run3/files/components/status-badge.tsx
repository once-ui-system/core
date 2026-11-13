import { Ban, CalendarClock, CircleCheck, Stethoscope, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { STATUS_LABEL, type Status } from "@/lib/data";
import { cn } from "@/lib/utils";

const styles: Record<Status, { icon: typeof Ban; className: string }> = {
  booked: { icon: CalendarClock, className: "border-slate-300 bg-slate-50 text-slate-800" },
  checked_in: { icon: UserCheck, className: "border-amber-300 bg-amber-100 text-amber-950" },
  in_exam: { icon: Stethoscope, className: "border-sky-300 bg-sky-100 text-sky-950" },
  done: { icon: CircleCheck, className: "border-emerald-300 bg-emerald-100 text-emerald-950" },
  cancelled: { icon: Ban, className: "border-border bg-muted text-muted-foreground" },
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const { icon: Icon, className: tone } = styles[status];
  return (
    <Badge variant="outline" className={cn("gap-1.5 px-2.5 py-1 text-xs font-semibold", tone, className)}>
      <Icon aria-hidden />
      {STATUS_LABEL[status]}
    </Badge>
  );
}
