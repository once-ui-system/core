import { Tag } from "@once-ui-system/core";
import type { Role, Status } from "@/lib/data";

const roleScheme: Record<Role, "brand" | "accent" | "neutral" | "info"> = {
  Owner: "accent",
  Admin: "brand",
  Member: "info",
  Viewer: "neutral",
};

const statusScheme: Record<Status, "success" | "warning" | "danger"> = {
  Active: "success",
  Invited: "warning",
  Suspended: "danger",
};

export function RoleBadge({ role }: { role: Role }) {
  return (
    <Tag size="s" scheme={roleScheme[role]}>
      {role}
    </Tag>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Tag size="s" scheme={statusScheme[status]}>
      {status}
    </Tag>
  );
}
