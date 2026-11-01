"use client";

import classNames from "clsx";
import React, { lazy, ReactNode, Suspense } from "react";
import { useIcons } from "../contexts/IconProvider.js";
import { type IconComponent, IconName } from "../icons.js";
import type { LeafPropsOf } from "../interfaces.js";
import { ColorScheme, ColorWeight, TShirtSizes } from "../types.js";
import { Flex } from "./Flex.js";
import styles from "./Icon.module.scss";

const IconTooltip = lazy(() => import("./IconTooltip.js"));

interface IconProps extends LeafPropsOf<"div"> {
  name: IconName;
  onBackground?: `${ColorScheme}-${ColorWeight}`;
  onSolid?: `${ColorScheme}-${ColorWeight}`;
  size?: TShirtSizes;
  decorative?: boolean;
  tooltip?: ReactNode;
  tooltipPosition?: "top" | "bottom" | "left" | "right";
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

  // An explicit aria-label means the icon carries meaning. A label is only
  // exposed on an element with a role, so a labelled icon is an image.
  const label = rest["aria-label"] ?? (decorative ? undefined : name);

  const icon = (
    <Flex
      inline
      fit
      as="span"
      ref={ref}
      className={classNames(colorClass, styles.icon, styles[size], className)}
      aria-hidden={label ? undefined : "true"}
      aria-label={label}
      role={label ? "img" : undefined}
      style={style}
      {...rest}
    >
      <IconComponent />
    </Flex>
  );

  if (tooltip) {
    return (
      <Suspense fallback={icon}>
        <IconTooltip trigger={icon} tooltip={tooltip} placement={tooltipPosition} />
      </Suspense>
    );
  }

  return icon;
};

Icon.displayName = "Icon";

export { Icon };
