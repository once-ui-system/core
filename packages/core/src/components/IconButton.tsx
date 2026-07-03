"use client";

import React, { forwardRef, ReactNode } from "react";
import { ElementType } from "./ElementType";
import { Flex, Icon, Tooltip, HoverCard, Spinner } from ".";
import buttonStyles from "./Button.module.scss";
import iconStyles from "./IconButton.module.scss";
import classNames from "classnames";
import { IconName } from "../icons";
import { ColorScheme, ColorWeight, TShirtSizes } from "../types";

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
  variant?: "primary" | "secondary" | "tertiary" | "quaternary" | "subtle" | "danger" | "success" | "warning" | "ghost" | "link";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
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
      ...props
    },
    ref,
  ) => {
    const radiusSize = size === "s" || size === "m" ? "m" : "l";

    const button = (
      <ElementType
        id={id}
        href={href}
        ref={ref}
        disabled={disabled}
        data-disabled={disabled ? true : undefined}
        data-border={rounded ? "rounded" : undefined}
        className={classNames(
          buttonStyles.button,
          buttonStyles[variant],
          iconStyles[size],
          radius === "none"
            ? "radius-none"
            : radius
              ? `radius-${radiusSize}-${radius}`
              : `radius-${radiusSize}`,
          "text-decoration-none",
          "button",
          disabled ? "cursor-not-allowed" : "cursor-interactive",
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
