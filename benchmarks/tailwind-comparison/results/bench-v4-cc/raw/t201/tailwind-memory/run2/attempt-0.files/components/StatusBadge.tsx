import { CircleCheck, Clock, DoorOpen, CalendarClock, Ban } from "lucide-react";
import type { Status } from "@/lib/data";
import { cx } from "@/lib/cx";

const config: Record<Status, { label: string; className: string; Icon: typeof Clock }> = {
  booked: { label: "Booked", className: "bg-stone-100 text-stone-800 ring-stone-300", Icon: CalendarClock },
  checked_in: { label: "Checked in", className: "bg-sky-100 text-sky-900 ring-sky-300", Icon: Clock },
  in_exam: { label: "In exam", className: "bg-teal-700 text-white ring-teal-800", Icon: DoorOpen },
  done: { label: "Done", className: "bg-emerald-50 text-emerald-900 ring-emerald-300", Icon: CircleCheck },
  cancelled: { label: "Cancelled", className: "bg-stone-100 text-stone-600 ring-stone-300 line-through", Icon: Ban },
};

export const statusLabel = (s: Status): string => config[s].label;

export function StatusBadge({ status }: { status: Status }) {
  const { label, className, Icon } = config[status];
  return (
    <span className={cx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset", className)}>
      <Icon className="size-3.5" aria-hidden />
      {label}
    </span>
  );
}
