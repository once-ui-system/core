import { forwardRef } from "react";
import { useTheme } from "../theme/ThemeProvider";
import type { TShirtSizes } from "../types";
import { Avatar, type AvatarProps } from "./Avatar";
import { Flex, type FlexProps } from "./Flex";
import type { RefComponent, ViewRef } from "./refs";

export interface AvatarGroupProps extends FlexProps {
  avatars: AvatarProps[];
  size?: TShirtSizes;
  /** Stacks each avatar under the one before it instead of over it. */
  reverse?: boolean;
  /** Avatars shown before the rest collapse into a `+n` avatar. */
  limit?: number;
}

/** Core's `AvatarGroup`: avatars overlapping by the `8` spacing step, as in AvatarGroup.module.scss. */
export const AvatarGroup: RefComponent<AvatarGroupProps, ViewRef> = forwardRef<
  ViewRef,
  AvatarGroupProps
>(function AvatarGroup({ avatars, size = "m", reverse = false, limit, ...rest }, ref) {
  const theme = useTheme();
  const shown = limit ? avatars.slice(0, limit) : avatars;
  const remaining = limit && avatars.length > limit ? avatars.length - limit : 0;
  const overlap = -theme.space("8");

  return (
    <Flex ref={ref} vertical="center" {...rest}>
      {shown.map((avatar, index) => (
        <Avatar
          // biome-ignore lint/suspicious/noArrayIndexKey: avatars have no id, as in core
          key={index}
          size={size}
          {...avatar}
          style={{
            marginLeft: index === 0 ? 0 : overlap,
            zIndex: reverse ? shown.length - index : index + 1,
            ...avatar.style,
          }}
        />
      ))}
      {remaining > 0 && (
        <Avatar
          value={`+${remaining}`}
          size={size}
          style={{ marginLeft: shown.length ? overlap : 0, zIndex: reverse ? 0 : shown.length + 1 }}
        />
      )}
    </Flex>
  );
});
