import type { ProjectStatus } from "@/lib/data";

const tones: Record<ProjectStatus, string> = {
  Active: "border-emerald-700 bg-emerald-950 text-emerald-300",
  Paused: "border-amber-700 bg-amber-950 text-amber-300",
  Archived: "border-line bg-raised text-muted",
};

const dots: Record<ProjectStatus, string> = {
  Active: "bg-emerald-400",
  Paused: "bg-amber-400",
  Archived: "bg-stone-500",
};

export default function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-xs ${tones[status]}`}
    >
      <span aria-hidden="true" className={`size-1.5 rounded-full ${dots[status]}`} />
      {status}
    </span>
  );
}
