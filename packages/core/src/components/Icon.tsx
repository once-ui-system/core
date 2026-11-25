"use client";

import classNames from "clsx";
import React, { lazy, type ReactNode, Suspense } from "react";
import { useIcons } from "../contexts/IconProvider.js";
import { type IconMotionTrigger, iconMotions } from "../icons/motion.js";
import type { IconComponent, IconName } from "../icons.js";
import type { LeafPropsOf } from "../interfaces.js";
import type { ColorScheme, ColorWeight, TShirtSizes } from "../types.js";
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
  /**
   * Plays the icon's own motion, CSS only. `true` uses the trigger the icon is
   * made for: `check` draws in when it appears; `bell`, the arrows, `refresh`,
   * `eye` and `trash` move while the icon or the control around it (a button,
   * link, menu item, option, tab, label) is hovered or keyboard-focused;
   * `checkbox`, `plus`, the chevrons, `heart` and `menu` follow `active`.
   * `"hover"`, `"in"` or `"active"` picks the trigger. Icons without a motion
   * ignore it. Timing follows the theme's `border` shape; nothing moves under
   * reduced motion.
   */
  animate?: boolean | IconMotionTrigger;
  /**
   * The on state of a moving icon: open (chevrons flip, `plus` turns into a
   * cross, `menu` folds into one), checked (`checkbox` fills and ticks), liked
   * (`heart` fills). Implies `animate`.
   */
  active?: boolean;
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
  animate,
  active,
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

  // A built-in that moves: `animate` (or `active` alone) picks its trigger.
  const motion = (iconMotions as Partial<Record<string, IconMotionTrigger>>)[name];
  const trigger =
    motion &&
    (animate === true || (animate === undefined && active !== undefined)
      ? motion
      : animate || undefined);

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
      data-icon={trigger ? name : undefined}
      data-animate={trigger}
      data-active={trigger && active ? "" : undefined}
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
