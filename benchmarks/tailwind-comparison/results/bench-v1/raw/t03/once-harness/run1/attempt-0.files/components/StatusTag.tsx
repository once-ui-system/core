import { Tag } from "@once-ui-system/core";
import type { MemberStatus, ProjectStatus } from "@/lib/data";

const TONES = {
  Active: "success",
  Paused: "warning",
  Archived: "neutral",
  Invited: "info",
  Suspended: "danger",
} as const;

export function StatusTag({ status }: { status: ProjectStatus | MemberStatus }) {
  return <Tag tone={TONES[status]} size="s" label={status} />;
}
