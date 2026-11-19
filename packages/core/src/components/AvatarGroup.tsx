"use client";

import classNames from "clsx";
import React from "react";
import { TShirtSizes } from "../types.js";
import { Avatar, AvatarProps } from "./Avatar.js";
import styles from "./AvatarGroup.module.scss";
import { Flex } from "./Flex.js";

interface AvatarGroupProps extends React.ComponentProps<typeof Flex> {
  avatars: AvatarProps[];
  size?: TShirtSizes;
  reverse?: boolean;
  limit?: number;
  className?: string;
  style?: React.CSSProperties;
}

const AvatarGroup = ({
  ref,
  avatars,
  size = "m",
  reverse = false,
  limit,
  className,
  style,
  ...rest
}: AvatarGroupProps) => {
  const displayedAvatars = limit ? avatars.slice(0, limit) : avatars;
  const remainingCount = limit && avatars.length > limit ? avatars.length - limit : 0;

  return (
    <Flex
      vertical="center"
      ref={ref}
      className={classNames(styles.avatarGroup, className)}
      style={style}
      zIndex={0}
      {...rest}
    >
      {displayedAvatars.map((avatarProps, index) => (
        <Avatar
          key={index}
          size={size}
          {...avatarProps}
          className={styles.avatar}
          style={{
            ...avatarProps.style,
            zIndex: reverse ? displayedAvatars.length - index : index + 1,
          }}
        />
      ))}
      {remainingCount > 0 && (
        <Avatar
          value={`+${remainingCount}`}
          className={styles.avatar}
          size={size}
          style={{
            zIndex: reverse ? -1 : displayedAvatars.length + 1,
          }}
        />
      )}
    </Flex>
  );
};

AvatarGroup.displayName = "AvatarGroup";

export type { AvatarGroupProps };
export { AvatarGroup };
