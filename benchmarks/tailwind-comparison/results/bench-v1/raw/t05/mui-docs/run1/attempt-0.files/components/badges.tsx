import Chip from "@mui/material/Chip";
import type { Role, Status } from "@/lib/data";

type ChipColor = "default" | "primary" | "secondary" | "success" | "warning" | "error" | "info";

const ROLE_COLOR: Record<Role, ChipColor> = {
  Owner: "secondary",
  Admin: "primary",
  Member: "default",
  Viewer: "default",
};

const STATUS_COLOR: Record<Status, ChipColor> = {
  Active: "success",
  Invited: "warning",
  Suspended: "error",
};

export function RoleBadge({ role }: { role: Role }) {
  return (
    <Chip
      label={role}
      size="small"
      color={ROLE_COLOR[role]}
      variant={ROLE_COLOR[role] === "default" ? "outlined" : "filled"}
    />
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Chip
      label={status}
      size="small"
      color={STATUS_COLOR[status]}
      variant="outlined"
    />
  );
}
