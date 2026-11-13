import { Icon, Tag } from "@once-ui-system/core";
import type { ComponentProps } from "react";
import type { Status } from "@/lib/data";

type IconName = NonNullable<ComponentProps<typeof Icon>["name"]>;
type Tone = "neutral" | "brand" | "accent" | "info" | "danger" | "warning" | "success";

export const STATUS: Record<Status, { label: string; tone: Tone; icon: IconName }> = {
  booked: { label: "Booked", tone: "neutral", icon: "calendar" },
  checked_in: { label: "Checked in", tone: "warning", icon: "time" },
  in_exam: { label: "In exam", tone: "info", icon: "paw" },
  done: { label: "Done", tone: "success", icon: "check" },
  cancelled: { label: "Cancelled", tone: "neutral", icon: "close" },
};

export function StatusTag({ status }: { status: Status }) {
  const s = STATUS[status];
  return <Tag tone={s.tone} prefixIcon={s.icon} label={s.label} />;
}
