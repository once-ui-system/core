import { Tag } from "@once-ui-system/core";
import type { Role, Status } from "@/lib/data";

type Tone = "neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success";

const roleTone: Record<Role, Tone> = {
  Owner: "accent",
  Admin: "brand",
  Member: "neutral",
  Viewer: "info",
};

const statusTone: Record<Status, Tone> = {
  Active: "success",
  Invited: "warning",
  Suspended: "danger",
};

export function RoleBadge({ role }: { role: Role }) {
  return (
    <Tag size="s" tone={roleTone[role]} as="span">
      {role}
    </Tag>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  return (
    <Tag size="s" tone={statusTone[status]} as="span">
      {status}
    </Tag>
  );
}
