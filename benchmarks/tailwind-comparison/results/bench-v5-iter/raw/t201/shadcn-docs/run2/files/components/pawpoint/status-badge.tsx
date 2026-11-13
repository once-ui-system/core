import { Check, CircleDashed, DoorOpen, Stethoscope, X } from "lucide-react";
import type { Status } from "@/lib/data";
import { STATUS_LABEL } from "@/lib/schedule";
import { cn } from "@/lib/utils";

const STYLE: Record<Status, string> = {
  booked: "border-slate-300 bg-white text-slate-700",
  checked_in: "border-amber-300 bg-amber-100 text-amber-950",
  in_exam: "border-sky-300 bg-sky-100 text-sky-950",
  done: "border-emerald-200 bg-emerald-50 text-emerald-900",
  cancelled: "border-slate-200 bg-slate-100 text-slate-600 line-through",
};

const ICON: Record<Status, typeof Check> = {
  booked: CircleDashed,
  checked_in: DoorOpen,
  in_exam: Stethoscope,
  done: Check,
  cancelled: X,
};

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const Icon = ICON[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        STYLE[status],
        className,
      )}
    >
      <Icon className="size-3" aria-hidden />
      {STATUS_LABEL[status]}
    </span>
  );
}
