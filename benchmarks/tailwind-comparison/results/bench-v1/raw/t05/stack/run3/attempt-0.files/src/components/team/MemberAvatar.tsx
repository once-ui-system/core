import { Avatar } from "@once-ui-system/core";
import { getInitials } from "@/lib/data";

type MemberAvatarProps = {
  name: string;
  size?: "xs" | "s" | "m" | "l" | "xl";
};

/** No photos are bundled, so every member shows initials. */
export function MemberAvatar({ name, size = "m" }: MemberAvatarProps) {
  return <Avatar size={size} value={getInitials(name)} aria-hidden="true" />;
}
