"use client";

import { Badge } from "@mantine/core";
import type { ProjectStatus } from "@/lib/data";

const colors: Record<ProjectStatus, string> = {
  Active: "brand.6",
  Paused: "orange.8",
  Archived: "gray.7",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant="outline" size="sm" color={colors[status]}>
      {status}
    </Badge>
  );
}
