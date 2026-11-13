import Chip from "@mui/material/Chip";

type Color = "default" | "success" | "warning" | "error" | "info";

const COLORS: Record<string, Color> = {
  Active: "success",
  Paused: "warning",
  Archived: "default",
  Invited: "info",
  Suspended: "error",
};

export default function StatusChip({ status }: { status: string }) {
  return <Chip size="small" label={status} color={COLORS[status] ?? "default"} variant="outlined" />;
}
