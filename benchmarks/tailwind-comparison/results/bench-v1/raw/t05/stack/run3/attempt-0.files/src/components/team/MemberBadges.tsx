import { Tag } from "@once-ui-system/core";
import { type Role, type Status, roleScheme, statusScheme } from "@/lib/data";

export function RoleBadge({ role }: { role: Role }) {
  return (
    <Tag size="s" scheme={roleScheme[role]} label={role} />
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Tag size="s" scheme={statusScheme[status]} label={status} />
  );
}
