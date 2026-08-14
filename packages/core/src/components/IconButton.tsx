"use client";

import type { CSSProperties, ReactNode } from "react";
import { forwardRef } from "react";
import { generateClasses } from "../classes/generator";
import { cn } from "../classes/utils";
import type { IconName } from "../icons";
import type { ColorScheme, ColorWeight, RadiusSize, TShirtSizes } from "../types";
import { buttonVariants } from "./Button";
import { ElementType } from "./ElementType";
import { Flex } from "./Flex";
import { HoverCard } from "./HoverCard";
import { Icon } from "./Icon";
import iconStyles from "./IconButton.module.scss";
import { Spinner } from "./Spinner";
import { Tooltip } from "./Tooltip";

interface IconButtonCommonProps {
  icon?: IconName;
  id?: string;
  size?: TShirtSizes;
  radius?:
    | "none"
    | "top"
    | "right"
    | "bottom"
    | "left"
    | "top-left"
    | "top-right"
    | "bottom-right"
    | "bottom-left";
  rounded?: boolean;
  tooltip?: ReactNode;
  tooltipPosition?: "top" | "bottom" | "left" | "right";
  variant?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "quaternary"
    | "subtle"
    | "danger"
    | "success"
    | "warning"
    | "ghost"
    | "link";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  href?: string;
  children?: ReactNode;
  color?: `${ColorScheme}-${ColorWeight}`;
}

export type IconButtonProps = IconButtonCommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>;
type AnchorProps = IconButtonCommonProps & React.AnchorHTMLAttributes<HTMLAnchorElement>;

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps | AnchorProps>(
  (
    {
      icon = "refresh",
      size = "m",
      id,
      radius,
      rounded = false,
      tooltip,
      tooltipPosition = "top",
      variant = "primary",
      loading = false,
      disabled = false,
      href,
      children,
      color,
      className,
      style,
      type,
      ...props
    },
    ref,
  ) => {
    const radiusSize: RadiusSize = size === "s" || size === "m" ? "m" : "l";

    const resolvedRadius = {
      radius: !radius ? radiusSize : radius === "none" ? ("none" as const) : undefined,
      topRadius: radius === "top" ? radiusSize : undefined,
      rightRadius: radius === "right" ? radiusSize : undefined,
      bottomRadius: radius === "bottom" ? radiusSize : undefined,
      leftRadius: radius === "left" ? radiusSize : undefined,
      topLeftRadius: radius === "top-left" ? radiusSize : undefined,
      topRightRadius: radius === "top-right" ? radiusSize : undefined,
      bottomRightRadius: radius === "bottom-right" ? radiusSize : undefined,
      bottomLeftRadius: radius === "bottom-left" ? radiusSize : undefined,
    };

    const button = (
      <ElementType
        id={id}
        href={href}
        ref={ref}
        type={type || (href ? undefined : "button")}
        disabled={disabled}
        data-disabled={disabled ? true : undefined}
        data-border={rounded ? "rounded" : undefined}
        className={cn(
          buttonVariants({
            variant,
          }),
          iconStyles[size],
          generateClasses({
            cursor: disabled ? "not-allowed" : "interactive",
            ...resolvedRadius,
            ...props,
          }),
          className,
        )}
        style={style}
        aria-label={(tooltip || icon) as string | undefined}
        aria-disabled={disabled}
        {...props}
      >
        <Flex fill center>
          {loading ? (
            <Spinner size={size === "l" ? "s" : "xs"} />
          ) : children ? (
            children
          ) : (
            <Icon name={icon} size="s" onBackground={color} />
          )}
        </Flex>
      </ElementType>
    );

    if (tooltip) {
      return (
        <HoverCard
          trigger={button}
          placement={tooltipPosition}
          fade={0}
          scale={0.9}
          duration={200}
          offsetDistance="4"
        >
          <Tooltip label={tooltip} />
        </HoverCard>
      );
    }

    return button;
  },
);

IconButton.displayName = "IconButton";

export { IconButton };
