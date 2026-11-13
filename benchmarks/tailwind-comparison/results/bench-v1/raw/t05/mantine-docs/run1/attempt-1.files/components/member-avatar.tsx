"use client";

import { Avatar } from "@mantine/core";
import { getInitials, ROLE_COLORS, type Role } from "@/lib/data";

interface MemberAvatarProps {
  name: string;
  role: Role;
  size?: number | string;
}

/** No image URLs are loaded from the network, so every member shows initials. */
export function MemberAvatar({ name, role, size = 40 }: MemberAvatarProps) {
  return (
    <Avatar
      size={size}
      radius="xl"
      color={ROLE_COLORS[role]}
      variant="light"
      alt=""
      aria-hidden="true"
    >
      {getInitials(name)}
    </Avatar>
  );
}
