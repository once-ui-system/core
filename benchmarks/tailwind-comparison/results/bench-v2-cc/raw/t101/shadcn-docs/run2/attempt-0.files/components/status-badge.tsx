import { Badge } from "@/components/ui/badge";
import type { ProjectStatus } from "@/lib/data";

const variants: Record<ProjectStatus, "default" | "secondary" | "outline"> = {
  Active: "default",
  Paused: "secondary",
  Archived: "outline",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge variant={variants[status]}>{status}</Badge>;
}
