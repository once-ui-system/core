import type { Status } from "@/lib/data";

const LABELS: Record<Status, string> = {
  booked: "Booked",
  checked_in: "Checked in",
  in_exam: "In exam",
  done: "Done",
  cancelled: "Cancelled",
};

const STYLES: Record<Status, string> = {
  booked: "bg-slate-100 text-slate-700 ring-slate-300",
  checked_in: "bg-teal-50 text-teal-800 ring-teal-300",
  in_exam: "bg-indigo-50 text-indigo-800 ring-indigo-300",
  done: "bg-emerald-50 text-emerald-800 ring-emerald-300",
  cancelled: "bg-white text-slate-600 ring-slate-300 line-through",
};

export function StatusPill({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
