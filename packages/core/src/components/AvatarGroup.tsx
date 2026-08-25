"use client";

import { cva } from "class-variance-authority";
import type { CSSProperties } from "react";
import { forwardRef } from "react";
import { cn } from "../classes/utils";
import type { TShirtSizes } from "../types";
import { Avatar, type AvatarProps } from "./Avatar";
import { Flex, type FlexComponentProps } from "./Flex";

export const avatarGroupVariants = cva("z-0");

export interface AvatarGroupProps extends Omit<FlexComponentProps, "size"> {
  avatars: AvatarProps[];
  size?: TShirtSizes;
  reverse?: boolean;
  limit?: number;
  className?: string;
  style?: CSSProperties;
}

const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ avatars, size = "m", reverse = false, limit, className, style, ...rest }, ref) => {
    const displayedAvatars = limit ? avatars.slice(0, limit) : avatars;
    const remainingCount = limit && avatars.length > limit ? avatars.length - limit : 0;

    return (
      <Flex
        vertical="center"
        ref={ref}
        className={cn(avatarGroupVariants(), className)}
        style={style}
        zIndex={0}
        {...rest}
      >
        {displayedAvatars.map((avatarProps, index) => (
          <Avatar
            // biome-ignore lint/suspicious/noArrayIndexKey: Avatars do not have required unique IDs
            key={index}
            size={size}
            {...avatarProps}
            className={cn("first:ml-0 -ml-8", avatarProps.className)}
            style={{
              ...avatarProps.style,
              zIndex: reverse ? displayedAvatars.length - index : index + 1,
            }}
          />
        ))}
        {remainingCount > 0 && (
          <Avatar
            value={`+${remainingCount}`}
            className="first:ml-0 -ml-8"
            size={size}
            style={{
              zIndex: reverse ? -1 : displayedAvatars.length + 1,
            }}
          />
        )}
      </Flex>
    );
  },
);

AvatarGroup.displayName = "AvatarGroup";

export { AvatarGroup };
