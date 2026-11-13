import { Badge } from "@chakra-ui/react"

const PALETTE: Record<string, string> = {
  Active: "green",
  Paused: "orange",
  Archived: "gray",
  Invited: "blue",
  Suspended: "red",
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge colorPalette={PALETTE[status] ?? "gray"}>{status}</Badge>
}
