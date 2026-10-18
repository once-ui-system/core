"use client";

import classNames from "clsx";
import React, { ReactNode } from "react";
import { useIcons } from "../contexts/IconProvider.js";
import { type IconComponent, IconName } from "../icons.js";
import { ColorScheme, ColorWeight, TShirtSizes } from "../types.js";
import { Flex } from "./Flex.js";
import { HoverCard } from "./HoverCard.js";
import styles from "./Icon.module.scss";
import { Tooltip } from "./Tooltip.js";

interface IconProps extends React.ComponentProps<typeof Flex> {
  name: IconName;
  onBackground?: `${ColorScheme}-${ColorWeight}`;
  onSolid?: `${ColorScheme}-${ColorWeight}`;
  size?: TShirtSizes;
  decorative?: boolean;
  tooltip?: ReactNode;
  tooltipPosition?: "top" | "bottom" | "left" | "right";
  className?: string;
  style?: React.CSSProperties;
}

const Icon = ({
  ref,
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
}: IconProps) => {
  const { icons } = useIcons();
  const IconComponent: IconComponent | undefined = icons[name];

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
      <HoverCard trigger={icon} placement={tooltipPosition} offsetDistance="4">
        <Tooltip label={tooltip} />
      </HoverCard>
    );
  }

  return icon;
};

Icon.displayName = "Icon";

export { Icon };
