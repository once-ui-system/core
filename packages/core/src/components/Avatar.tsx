import React, { forwardRef } from "react";
import { IconName } from "../icons.js";
import { CondensedTShirtSizes, CSSUnit, TShirtSizes } from "../types.js";
import { isCSSUnit } from "../utils/layoutClasses.js";
import styles from "./Avatar.module.scss";
import { Flex } from "./Flex.js";
import { Icon } from "./Icon.js";
import { Media } from "./Media.js";
import { Skeleton } from "./Skeleton.js";
import { StatusIndicator } from "./StatusIndicator.js";
import { Text } from "./Text.js";

interface AvatarProps extends React.ComponentProps<typeof Flex> {
  /**
   * A t-shirt size, a number in px (`40`), or a CSS length (`"2.5rem"`).
   */
  size?: TShirtSizes | number | CSSUnit;
  value?: string;
  src?: string;
  unoptimized?: boolean;
  loading?: boolean;
  empty?: boolean;
  icon?: IconName;
  /** A status dot; `scheme` is its palette hue (2.x called it `color`). */
  statusIndicator?: {
    scheme: "green" | "yellow" | "red" | "gray";
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

/** A custom size in px, as far as it can be read (`"10rem"` reads as 160). */
function approxPx(size: unknown): number {
  if (typeof size === "number") return size;
  const match = typeof size === "string" ? /^(\d*\.?\d+)(px|rem|em)$/.exec(size) : null;
  if (!match) return 0;
  return Number(match[1]) * (match[2] === "px" ? 1 : 16);
}

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
    // A t-shirt size is a class; a number is px and a CSS length is as written.
    const customSize =
      typeof size === "number" ? `${size}px` : isCSSUnit(size) ? (size as string) : undefined;
    const sizeStyle = customSize
      ? {
          width: customSize,
          height: customSize,
          minWidth: customSize,
          minHeight: customSize,
          ...style,
        }
      : style;
    const scale = customSize ? undefined : (size as TShirtSizes);
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
          {...(customSize
            ? { width: customSize as CSSUnit, height: customSize as CSSUnit }
            : { size: scale })}
          className={`${styles.avatar} ${className}`}
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
            style={customSize ? { fontSize: `calc(${customSize} / 3)` } : undefined}
            className={styles.icon}
            aria-label="Empty avatar"
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
            sizes={scale ? `${sizeMapping[scale]}px` : customSize}
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
            textVariant={`body-default-${scale ?? "m"}`}
            className={styles.value}
            aria-label={`Avatar with initials ${value}`}
          >
            {value}
          </Text>
        );
      }

      return null;
    };

    return (
      <Flex
        ref={ref}
        role="img"
        horizontal="center"
        vertical="center"
        radius="full"
        border="neutral-strong"
        background="surface"
        style={sizeStyle}
        className={`${styles.avatar} ${scale ? styles[scale] : ""} ${className || ""}`}
        {...rest}
      >
        {renderContent()}
        {statusIndicator && (
          <StatusIndicator
            position="absolute"
            size={scale ? statusIndicatorSizeMapping[scale] : "l"}
            scheme={statusIndicator.scheme}
            className={`${styles.className || ""} ${styles.indicator} ${size === "xl" || approxPx(size) >= 160 ? styles.position : ""}`}
            aria-label={`Status: ${statusIndicator.scheme}`}
          />
        )}
      </Flex>
    );
  },
);

Avatar.displayName = "Avatar";

export type { AvatarProps };
export { Avatar };
