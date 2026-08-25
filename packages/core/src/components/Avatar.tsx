"use client";

import { cva } from "class-variance-authority";
import type { CSSProperties } from "react";
import { forwardRef } from "react";
import { cn } from "../classes/utils";
import type { IconName } from "../icons";
import type { CondensedTShirtSizes, TShirtSizes } from "../types";
import { Flex, type FlexComponentProps } from "./Flex";
import { Icon } from "./Icon";
import { Media } from "./Media";
import { Skeleton } from "./Skeleton";
import { StatusIndicator } from "./StatusIndicator";
import { Text } from "./Text";

export const avatarVariants = cva(
  "relative flex items-center justify-center shrink-0 select-none",
  {
    variants: {
      size: {
        xs: "w-20 min-w-20 h-20 min-h-20",
        s: "w-24 min-w-24 h-24 min-h-24",
        m: "w-32 min-w-32 h-32 min-h-32",
        l: "w-48 min-w-48 h-48 min-h-48",
        xl: "w-160 min-w-160 h-160 min-h-160",
      },
    },
    defaultVariants: {
      size: "m",
    },
  },
);

export interface AvatarProps extends FlexComponentProps {
  size?: TShirtSizes | number;
  value?: string;
  src?: string;
  unoptimized?: boolean;
  loading?: boolean;
  empty?: boolean;
  icon?: IconName;
  statusIndicator?: {
    color: "green" | "yellow" | "red" | "gray";
  };
  style?: CSSProperties;
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
    const sizeStyle: CSSProperties = sizeInRem
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
          ref={ref}
          border="neutral-medium"
          shape="circle"
          width={typeof size === "number" ? "m" : size}
          height={typeof size === "number" ? "m" : size}
          style={sizeStyle}
          className={cn(
            typeof size === "string"
              ? avatarVariants({ size })
              : avatarVariants({ size: undefined }),
            className,
          )}
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
            aria-label="Empty avatar"
          />
        );
      }

      if (src) {
        return (
          <Media
            radius="full"
            src={src}
            fill
            alt="Avatar"
            aspectRatio="1"
            sizes={typeof size === "string" ? `${sizeMapping[size]}px` : `${size * 16}px`}
            unoptimized={unoptimized}
            className="object-center"
          />
        );
      }

      if (value) {
        return (
          <Text
            as="span"
            onBackground="neutral-weak"
            variant={`body-default-${typeof size === "string" ? size : "m"}`}
            className="whitespace-nowrap overflow-hidden select-none"
            aria-label={`Avatar with initials ${value}`}
          >
            {value}
          </Text>
        );
      }

      return null;
    };

    const isLarge = size === "xl" || (typeof size === "number" && size >= 10);

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
        className={cn(
          avatarVariants({ size: typeof size === "string" ? size : undefined }),
          className,
        )}
        {...rest}
      >
        {renderContent()}
        {statusIndicator && (
          <StatusIndicator
            position="absolute"
            size={typeof size === "string" ? statusIndicatorSizeMapping[size] : "l"}
            color={statusIndicator.color}
            className={cn(
              "box-content translate-x-2 translate-y-2",
              isLarge ? "bottom-16 right-16" : "bottom-0 right-0",
            )}
            aria-label={`Status: ${statusIndicator.color}`}
          />
        )}
      </Flex>
    );
  },
);

Avatar.displayName = "Avatar";

export { Avatar };
