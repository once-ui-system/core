import { Badge } from "@chakra-ui/react"
import { statusLabel, type Status } from "@/lib/data"

const palette: Record<Status, { colorPalette: string; variant: "solid" | "subtle" | "outline" }> = {
  booked: { colorPalette: "gray", variant: "outline" },
  checked_in: { colorPalette: "blue", variant: "solid" },
  in_exam: { colorPalette: "purple", variant: "solid" },
  done: { colorPalette: "green", variant: "subtle" },
  cancelled: { colorPalette: "gray", variant: "subtle" },
}

export function StatusBadge({ status }: { status: Status }) {
  const p = palette[status]
  return (
    <Badge colorPalette={p.colorPalette} variant={p.variant} size="md" textTransform="none">
      {statusLabel[status]}
    </Badge>
  )
}
