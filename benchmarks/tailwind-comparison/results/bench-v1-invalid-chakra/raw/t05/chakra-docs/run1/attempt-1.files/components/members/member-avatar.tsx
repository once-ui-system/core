import { Box } from "@chakra-ui/react";
import { avatarColor, initialsOf } from "@/lib/data";

interface MemberAvatarProps {
  name: string;
  size?: "sm" | "xl";
}

const SIZES = {
  sm: { box: "32px", font: "xs" },
  xl: { box: "80px", font: "2xl" },
} as const;

/**
 * Deterministic initials avatar. Rendered identically on server and client
 * (no image loading state), so it can't cause a hydration mismatch.
 */
export function MemberAvatar({ name, size = "sm" }: MemberAvatarProps) {
  const palette = avatarColor(name);
  const s = SIZES[size];
  return (
    <Box
      aria-hidden="true"
      flexShrink={0}
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      rounded="full"
      fontWeight="medium"
      userSelect="none"
      width={s.box}
      height={s.box}
      fontSize={s.font}
      bg={`${palette}.subtle`}
      color={`${palette}.fg`}
    >
      {initialsOf(name)}
    </Box>
  );
}
