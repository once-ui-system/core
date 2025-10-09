"use client";

import React, { forwardRef, ReactNode } from "react";
import { ElementType } from "./ElementType";
import { Flex, Icon, Tooltip, HoverCard } from ".";
import buttonStyles from "./Button.module.scss";
import iconStyles from "./IconButton.module.scss";
import classNames from "classnames";
import { IconName } from "../icons";

interface CommonProps {
  icon?: IconName;
  id?: string;
  size?: "s" | "m" | "l";
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
  tooltip?: string;
  tooltipPosition?: "top" | "bottom" | "left" | "right";
  variant?: "primary" | "secondary" | "tertiary" | "danger" | "ghost";
  className?: string;
  style?: React.CSSProperties;
  href?: string;
  children?: ReactNode;
}

export type IconButtonProps = CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>;
type AnchorProps = CommonProps & React.AnchorHTMLAttributes<HTMLAnchorElement>;

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps | AnchorProps>(
  (
    {
      icon = "refresh",
      size = "m",
      id,
      radius,
      tooltip,
      tooltipPosition = "top",
      variant = "primary",
      href,
      children,
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
        className={classNames(
          buttonStyles.button,
          buttonStyles[variant],
          iconStyles[size],
          className,
          radius === "none"
            ? "radius-none"
            : radius
              ? `radius-${radiusSize}-${radius}`
              : `radius-${radiusSize}`,
          "text-decoration-none",
          "button",
          "cursor-interactive",
          className,
        )}
        style={style}
        aria-label={tooltip || icon}
        {...props}
      >
        <Flex fill center>
          {children ? children : <Icon name={icon} size="s" />}
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
