import { Badge } from "@/components/ui/badge";
import type { ProjectStatus } from "@/lib/data";

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const variant = status === "Active" ? "default" : status === "Paused" ? "secondary" : "outline";
  return (
    <Badge variant={variant} className="rounded-sm">
      {status}
    </Badge>
  );
}
