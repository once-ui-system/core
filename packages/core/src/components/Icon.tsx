"use client";

import React, { forwardRef, ReactNode } from "react";
import classNames from "classnames";
import { IconType } from "react-icons";
import { IconName } from "../icons";
import { useIcons } from "../contexts/IconProvider";
import { ColorScheme, ColorWeight } from "../types";
import { Flex, Tooltip, HoverCard } from ".";
import styles from "./Icon.module.scss";

interface IconProps extends React.ComponentProps<typeof Flex> {
  name: IconName;
  onBackground?: `${ColorScheme}-${ColorWeight}`;
  onSolid?: `${ColorScheme}-${ColorWeight}`;
  size?: "xs" | "s" | "m" | "l" | "xl";
  decorative?: boolean;
  tooltip?: ReactNode;
  tooltipPosition?: "top" | "bottom" | "left" | "right";
  className?: string;
  style?: React.CSSProperties;
}

const Icon = forwardRef<HTMLDivElement, IconProps>(
  (
    {
      name,
      onBackground,
      onSolid,
      size = "m",
      decorative = true,
      tooltip,
      tooltipPosition = "top",
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    const { icons } = useIcons();
    const IconComponent: IconType | undefined = icons[name];

    if (!IconComponent) {
      console.warn(`Icon "${name}" does not exist in the library.`);
      return null;
    }

    if (onBackground && onSolid) {
      console.warn(
        "You cannot use both 'onBackground' and 'onSolid' props simultaneously. Only one will be applied.",
      );
    }

    let colorClass = "color-inherit";
    if (onBackground) {
      const [scheme, weight] = onBackground.split("-") as [ColorScheme, ColorWeight];
      colorClass = `${scheme}-on-background-${weight}`;
    } else if (onSolid) {
      const [scheme, weight] = onSolid.split("-") as [ColorScheme, ColorWeight];
      colorClass = `${scheme}-on-solid-${weight}`;
    }

    const icon = (
      <Flex
        inline
        fit
        as="span"
        ref={ref}
        className={classNames(colorClass, styles.icon, styles[size], className)}
        aria-hidden={decorative ? "true" : undefined}
        aria-label={decorative ? undefined : name}
        style={style}
        {...rest}
      >
        <IconComponent />
      </Flex>
    );

    if (tooltip) {
      return (
        <HoverCard
          trigger={icon}
          placement={tooltipPosition}
          offsetDistance="4"
        >
          <Tooltip label={tooltip} />
        </HoverCard>
      );
    }

    return icon;
  },
);

Icon.displayName = "Icon";

export { Icon };
