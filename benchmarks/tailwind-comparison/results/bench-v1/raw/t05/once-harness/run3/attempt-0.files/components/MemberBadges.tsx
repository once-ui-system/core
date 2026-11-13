import { Tag } from "@once-ui-system/core";
import { ROLE_TONE, STATUS_TONE, type Role, type Status } from "@/lib/data";

export function RoleBadge({ role }: { role: Role }) {
  return <Tag as="span" size="s" tone={ROLE_TONE[role]} label={role} />;
}

export function StatusBadge({ status }: { status: Status }) {
  return <Tag as="span" size="s" tone={STATUS_TONE[status]} label={status} />;
}
