import React, { forwardRef } from "react";
import { IconName } from "../icons";
import { CondensedTShirtSizes, TShirtSizes } from "../types";
import styles from "./Avatar.module.scss";
import { Flex } from "./Flex";
import { Icon } from "./Icon";
import { Media } from "./Media";
import { Skeleton } from "./Skeleton";
import { StatusIndicator, type StatusIndicatorColor } from "./StatusIndicator";
import { Text } from "./Text";

interface AvatarProps extends React.ComponentProps<typeof Flex> {
  size?: TShirtSizes | number;
  value?: string;
  src?: string;
  unoptimized?: boolean;
  loading?: boolean;
  empty?: boolean;
  icon?: IconName;
  /**
   * A status dot on the avatar, in any colour StatusIndicator takes: it is a
   * StatusIndicator. `color` named only four of them, so `"orange"` for "away"
   * was a type error that rendered fine.
   */
  statusIndicator?: {
    color: StatusIndicatorColor;
  };
  style?: React.CSSProperties;
  className?: string;
}

const sizeMapping: Record<TShirtSizes, number> = {
  xs: 20,
  s: 24,
  m: 32,
  l: 48,
  xl: 160,
};

const statusIndicatorSizeMapping: Record<TShirtSizes, CondensedTShirtSizes> = {
  xs: "s",
  s: "s",
  m: "m",
  l: "m",
  xl: "l",
};

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      size = "m",
      value,
      src,
      unoptimized,
      loading,
      empty,
      icon,
      statusIndicator,
      className,
      style = {},
      ...rest
    },
    ref,
  ) => {
    const sizeInRem = typeof size === "number" ? `${size}rem` : undefined;
    const sizeStyle = sizeInRem
      ? {
          width: sizeInRem,
          height: sizeInRem,
          minWidth: sizeInRem,
          minHeight: sizeInRem,
          ...style,
        }
      : style;
    const isEmpty = empty || (!src && !value);

    if (value && src) {
      throw new Error("Avatar cannot have both 'value' and 'src' props.");
    }

    if (loading) {
      return (
        <Skeleton
          {...rest}
          border="neutral-medium"
          shape="circle"
          {...(typeof size === "number" ? { width: size, height: size } : { size })}
          className={`${styles.avatar} ${className || ""}`}
          aria-busy="true"
          aria-label="Loading avatar"
        />
      );
    }

    const renderContent = () => {
      if (isEmpty) {
        return (
          <Icon
            onBackground="neutral-medium"
            name={icon || "person"}
            size="m"
            style={typeof size === "number" ? { fontSize: `${size / 3}rem` } : undefined}
            className={styles.icon}
          />
        );
      }

      if (src) {
        return (
          <Media
            radius="full"
            src={src}
            stretch
            alt="Avatar"
            aspectRatio="1"
            sizes={typeof size === "string" ? `${sizeMapping[size]}px` : `${size * 16}px`}
            unoptimized={unoptimized}
            className={styles.image}
          />
        );
      }

      if (value) {
        return (
          <Text
            as="span"
            onBackground="neutral-weak"
            variant={`body-default-${typeof size === "string" ? size : "m"}`}
            className={styles.value}
          >
            {value}
          </Text>
        );
      }

      return null;
    };

    // role="img" makes everything inside presentational, so the name the
    // children used to carry lives on the wrapper (axe: role-img-alt).
    const baseLabel = value ? `Avatar with initials ${value}` : isEmpty ? "Empty avatar" : "Avatar";
    const label = statusIndicator ? `${baseLabel}, status: ${statusIndicator.color}` : baseLabel;

    return (
      <Flex
        ref={ref}
        role="img"
        aria-label={label}
        horizontal="center"
        vertical="center"
        radius="full"
        border="neutral-strong"
        background="surface"
        style={sizeStyle}
        className={`${styles.avatar} ${typeof size === "string" ? styles[size] : ""} ${className || ""}`}
        {...rest}
      >
        {renderContent()}
        {statusIndicator && (
          <StatusIndicator
            position="absolute"
            size={typeof size === "string" ? statusIndicatorSizeMapping[size] : "l"}
            color={statusIndicator.color}
            className={`${styles.className || ""} ${styles.indicator} ${size === "xl" || (typeof size === "number" && size >= 10) ? styles.position : ""}`}
            aria-label={`Status: ${statusIndicator.color}`}
          />
        )}
      </Flex>
    );
  },
);

Avatar.displayName = "Avatar";

export type { AvatarProps };
export { Avatar };
