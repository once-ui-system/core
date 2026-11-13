import { Badge } from "@chakra-ui/react";
import { type Role, type Status, roleColor, statusColor } from "@/lib/data";

export function RoleBadge({ role }: { role: Role }) {
  return (
    <Badge colorPalette={roleColor(role)} variant="subtle">
      {role}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge colorPalette={statusColor(status)} variant="subtle">
      {status}
    </Badge>
  );
}
