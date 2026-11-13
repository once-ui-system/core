import type { ProjectStatus } from "@/lib/data";

const styles: Record<ProjectStatus, string> = {
  Active: "border-brand-600/30 bg-primary-soft text-brand-800",
  Paused: "border-amber-300 bg-amber-50 text-amber-900",
  Archived: "border-line-strong bg-canvas text-ink-soft",
};

export default function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm border px-1.5 py-px text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}
