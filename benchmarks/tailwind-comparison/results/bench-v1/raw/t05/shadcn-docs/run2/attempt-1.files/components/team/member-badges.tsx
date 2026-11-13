import { Badge } from "@/components/ui/badge"
import type { Role, Status } from "@/lib/data"

export function RoleBadge({ role }: { role: Role }) {
  return (
    <Badge variant={role === "Owner" ? "default" : "secondary"}>{role}</Badge>
  )
}

export function StatusBadge({ status }: { status: Status }) {
  const variant =
    status === "Active"
      ? "outline"
      : status === "Suspended"
        ? "destructive"
        : "secondary"
  return <Badge variant={variant}>{status}</Badge>
}
