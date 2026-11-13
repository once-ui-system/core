import { Badge } from "@chakra-ui/react";
import type { ProjectStatus } from "@/lib/data";

const palette: Record<ProjectStatus, string> = {
  Active: "green",
  Paused: "orange",
  Archived: "gray",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge colorPalette={palette[status]} variant="subtle">
      {status}
    </Badge>
  );
}
