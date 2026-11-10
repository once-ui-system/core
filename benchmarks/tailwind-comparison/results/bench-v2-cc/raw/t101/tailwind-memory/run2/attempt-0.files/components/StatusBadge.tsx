import type { ProjectStatus } from "@/lib/data";

const styles: Record<ProjectStatus, string> = {
  Active: "bg-brand-soft text-brand-ink ring-brand/30",
  Paused: "bg-amber-50 text-amber-800 ring-amber-600/30",
  Archived: "bg-slate-100 text-slate-600 ring-slate-400/40",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status]}`}
    >
      {status}
    </span>
  );
}
