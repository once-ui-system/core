"use client";

import classNames from "clsx";
import React, { ReactNode } from "react";
import { IconName } from "../icons.js";
import type { LeafProps } from "../interfaces.js";
import { RadiusSize, TShirtSizes } from "../types.js";
import { leafLayout, takeLeafProps } from "../utils/leafLayout.js";
import { ElementType } from "./ElementType.js";
import { Flex } from "./Flex.js";
import { Icon } from "./Icon.js";
import styles from "./ToggleButton.module.scss";

interface ToggleButtonCommonProps extends LeafProps {
  label?: ReactNode;
  selected?: boolean;
  variant?: "ghost" | "outline" | "subtle";
  /**
   * Left out, the theme's `density` picks it: s when compact, m when normal
   * (the default), l when spacious. A size given here always wins.
   */
  size?: TShirtSizes;
  /**
   * Corner roundness. Defaults to the button's `size`, which is right for a
   * standalone control and wrong for a tall row in a sidebar — that wants the
   * height of an `l` and the corners of an `m`. Every fleet sidebar was
   * reaching for an inline `borderRadius` to get it.
   */
  radius?: RadiusSize;
  corners?:
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
  horizontal?: "start" | "center" | "end" | "between";
  weight?: "default" | "strong";
  truncate?: boolean;
  disabled?: boolean;
  prefixIcon?: IconName;
  suffixIcon?: IconName;
  children?: ReactNode;
  href?: string;
}

export type ToggleButtonProps = ToggleButtonCommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement>;

const ToggleButton = ({
  ref,
  label,
  selected = false,
  variant = "ghost",
  size: sizeProp,
  radius,
  corners,
  rounded = false,
  horizontal = "center",
  fillWidth,
  weight = "default",
  truncate = false,
  disabled = false,
  prefixIcon,
  suffixIcon,
  className,
  style,
  children,
  href,
  ...rest
}: ToggleButtonProps & { ref?: React.Ref<HTMLElement> }) => {
  const [leaf, props] = takeLeafProps(rest);
  // Without an href it is a button even with no handler yet: as a div it
  // was skipped by Tab. A plain toggle says whether it is on with
  // aria-pressed; one that carries its own state role (tab, menuitemradio)
  // or aria-expanded/-selected/-checked keeps that instead.
  const ownsState =
    props.role !== undefined ||
    props["aria-selected"] !== undefined ||
    props["aria-checked"] !== undefined ||
    props["aria-expanded"] !== undefined ||
    props["aria-pressed"] !== undefined;
  const layout = leafLayout(leaf);
  // Left out, the size is m, restyled by the theme's `density` in CSS.
  const size = sizeProp ?? "m";
  const auto = sizeProp === undefined;
  const iconClass = auto ? styles.icon : undefined;
  return (
    <ElementType
      ref={ref}
      href={href}
      type={href ? undefined : (props.type ?? "button")}
      aria-pressed={href || ownsState ? undefined : selected}
      disabled={disabled}
      data-disabled={disabled ? true : undefined}
      data-border={rounded ? "rounded" : undefined}
      className={classNames(
        styles.button,
        styles[variant],
        styles[size],
        auto && styles.auto,
        auto && radius === undefined && styles.autoRadius,
        selected && styles.selected,
        corners === "none" || radius === "none"
          ? "radius-none"
          : corners
            ? `radius-${radius ?? size}-${corners}`
            : `radius-${radius ?? size}`,
        "text-decoration-none",
        "button",
        disabled ? "cursor-not-allowed" : "cursor-interactive",
        {
          ["fill-width"]: fillWidth,
          ["fit-width"]: !fillWidth,
          ["justify-" + horizontal]: horizontal,
        },
        ...layout.classes,
        className,
      )}
      style={{ ...layout.style, ...style }}
      {...props}
    >
      {prefixIcon && (
        <Icon
          name={prefixIcon}
          size={size === "xl" ? "m" : size === "l" ? "s" : "xs"}
          className={iconClass}
        />
      )}
      {(label || children) && (
        <Flex
          fillWidth={fillWidth}
          horizontal={horizontal}
          paddingX={size === "xl" ? "12" : size === "l" ? "8" : size === "s" ? "4" : "2"}
          textVariant={`label-${weight}-${size === "xl" ? "l" : size === "l" ? "m" : "s"}`}
          position="static"
          className={auto ? styles.label : undefined}
        >
          {label || children}
        </Flex>
      )}
      {suffixIcon && (
        <Icon
          name={suffixIcon}
          size={size === "xl" ? "m" : size === "l" ? "s" : "xs"}
          className={iconClass}
        />
      )}
    </ElementType>
  );
};

ToggleButton.displayName = "ToggleButton";

export { ToggleButton };
