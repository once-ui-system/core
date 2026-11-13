import type { ProjectStatus } from "@/lib/data";

const styles: Record<ProjectStatus, string> = {
  Active: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  Paused: "bg-amber-50 text-amber-800 ring-amber-600/20",
  Archived: "bg-slate-100 text-slate-700 ring-slate-500/20",
};

const dots: Record<ProjectStatus, string> = {
  Active: "bg-emerald-500",
  Paused: "bg-amber-500",
  Archived: "bg-slate-400",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status]}`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${dots[status]}`} />
      {status}
    </span>
  );
}
