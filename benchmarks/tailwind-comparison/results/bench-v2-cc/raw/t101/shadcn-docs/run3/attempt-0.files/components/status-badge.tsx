import { Badge } from "@/components/ui/badge";
import type { ProjectStatus } from "@/lib/data";

const dot: Record<ProjectStatus, string> = {
  Active: "bg-primary",
  Paused: "bg-chart-4",
  Archived: "bg-muted-foreground",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant="outline" className="gap-1.5 font-normal">
      <span className={`size-1.5 rounded-full ${dot[status]}`} aria-hidden="true" />
      {status}
    </Badge>
  );
}
