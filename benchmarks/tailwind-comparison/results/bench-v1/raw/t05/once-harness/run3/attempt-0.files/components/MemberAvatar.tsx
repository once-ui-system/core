import { Avatar } from "@once-ui-system/core";
import { getInitials } from "@/lib/data";

export function MemberAvatar({
  name,
  size = "m",
}: {
  name: string;
  size?: "s" | "m" | "l" | "xl";
}) {
  return <Avatar size={size} value={getInitials(name)} />;
}
