import { Badge } from "@/components/ui/badge"
import type { ProjectStatus } from "@/lib/data"

const variants = {
  Active: "default",
  Paused: "secondary",
  Archived: "outline",
} as const

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge variant={variants[status]}>{status}</Badge>
}
