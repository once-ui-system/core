import { Ban, CalendarClock, CircleCheck, Stethoscope, UserCheck } from "lucide-react";
import { STATUS_LABEL, type Status } from "@/lib/data";

const STYLE: Record<Status, { cls: string; Icon: typeof Ban }> = {
  booked: { cls: "bg-slate-100 text-slate-700 ring-slate-300", Icon: CalendarClock },
  checked_in: { cls: "bg-amber-100 text-amber-900 ring-amber-300", Icon: UserCheck },
  in_exam: { cls: "bg-teal-100 text-teal-900 ring-teal-300", Icon: Stethoscope },
  done: { cls: "bg-emerald-50 text-emerald-800 ring-emerald-200", Icon: CircleCheck },
  cancelled: { cls: "bg-white text-slate-500 ring-slate-300", Icon: Ban },
};

export function StatusBadge({ status }: { status: Status }) {
  const { cls, Icon } = STYLE[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${cls}`}
    >
      <Icon aria-hidden="true" className="size-3.5" />
      {STATUS_LABEL[status]}
    </span>
  );
}
