import { Ban, CircleCheck, Clock, Stethoscope, CalendarClock } from "lucide-react";
import type { Status } from "@/lib/data";

export const STATUS_LABEL: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
};

const STYLE: Record<Status, string> = {
  booked: "bg-slate-100 text-slate-800 ring-slate-300",
  checked_in: "bg-sky-100 text-sky-900 ring-sky-300",
  in_exam: "bg-violet-700 text-white ring-violet-700",
  done: "bg-emerald-100 text-emerald-900 ring-emerald-300",
  cancelled: "bg-white text-slate-500 ring-slate-300 line-through",
};

function StatusIcon({ status }: { status: Status }) {
  const cls = "size-3.5";
  switch (status) {
    case "booked":
      return <CalendarClock aria-hidden className={cls} />;
    case "checked_in":
      return <Clock aria-hidden className={cls} />;
    case "in_exam":
      return <Stethoscope aria-hidden className={cls} />;
    case "done":
      return <CircleCheck aria-hidden className={cls} />;
    case "cancelled":
      return <Ban aria-hidden className={cls} />;
  }
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${STYLE[status]}`}
    >
      <StatusIcon status={status} />
      {STATUS_LABEL[status]}
    </span>
  );
}
