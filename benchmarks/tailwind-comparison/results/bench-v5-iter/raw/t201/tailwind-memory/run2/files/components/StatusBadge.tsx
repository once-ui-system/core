import { Ban, CircleCheck, Hourglass, Stethoscope, CalendarClock } from "lucide-react";
import { STATUS_LABEL, type Status } from "@/lib/data";

const STYLE: Record<Status, string> = {
  booked: "bg-slate-100 text-slate-700 ring-slate-300",
  checked_in: "bg-amber-100 text-amber-900 ring-amber-300",
  in_exam: "bg-sky-100 text-sky-900 ring-sky-300",
  done: "bg-emerald-100 text-emerald-900 ring-emerald-300",
  cancelled: "bg-white text-slate-500 ring-slate-300 line-through",
};
const ICON = {
  booked: CalendarClock,
  checked_in: Hourglass,
  in_exam: Stethoscope,
  done: CircleCheck,
  cancelled: Ban,
};

export function StatusBadge({ status }: { status: Status }) {
  const Icon = ICON[status];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STYLE[status]}`}>
      <Icon aria-hidden className="size-3.5" />
      {STATUS_LABEL[status]}
    </span>
  );
}
