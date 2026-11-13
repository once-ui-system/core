import { Badge } from "@chakra-ui/react";
import type { Role, Status } from "@/lib/data";

const roleColor: Record<Role, string> = {
  Owner: "purple",
  Admin: "blue",
  Member: "gray",
  Viewer: "cyan",
};

const statusColor: Record<Status, string> = {
  Active: "green",
  Invited: "orange",
  Suspended: "red",
};

export function RoleBadge({ role }: { role: Role }) {
  return (
    <Badge colorPalette={roleColor[role]} variant="subtle" size="md">
      {role}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge colorPalette={statusColor[status]} variant="subtle" size="md">
      {status}
    </Badge>
  );
}
