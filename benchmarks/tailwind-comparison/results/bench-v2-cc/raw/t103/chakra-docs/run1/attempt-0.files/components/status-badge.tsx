"use client"

import { Badge } from "@chakra-ui/react"
import type { ProjectStatus } from "@/lib/data"

const palette: Record<ProjectStatus, "green" | "yellow" | "gray"> = {
  Active: "green",
  Paused: "yellow",
  Archived: "gray",
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge colorPalette={palette[status]}>{status}</Badge>
}
