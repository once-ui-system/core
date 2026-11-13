import { Badge } from "@/components/ui/badge";
import type { ProjectStatus } from "@/lib/data";

const dot: Record<ProjectStatus, string> = {
  Active: "bg-emerald-500",
  Paused: "bg-amber-500",
  Archived: "bg-stone-500",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant="outline" className="rounded-sm">
      <span className={`size-1.5 rounded-full ${dot[status]}`} aria-hidden="true" />
      {status}
    </Badge>
  );
}
