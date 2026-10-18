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
  size = "m",
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
  const layout = leafLayout(leaf);
  return (
    <ElementType
      ref={ref}
      href={href}
      disabled={disabled}
      data-disabled={disabled ? true : undefined}
      data-border={rounded ? "rounded" : undefined}
      className={classNames(
        styles.button,
        styles[variant],
        styles[size],
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
        <Icon name={prefixIcon} size={size === "xl" ? "m" : size === "l" ? "s" : "xs"} />
      )}
      {(label || children) && (
        <Flex
          fillWidth={fillWidth}
          horizontal={horizontal}
          paddingX={size === "xl" ? "12" : size === "l" ? "8" : size === "s" ? "4" : "2"}
          textVariant={`label-${weight}-${size === "xl" ? "l" : size === "l" ? "m" : "s"}`}
          position="static"
        >
          {label || children}
        </Flex>
      )}
      {suffixIcon && (
        <Icon name={suffixIcon} size={size === "xl" ? "m" : size === "l" ? "s" : "xs"} />
      )}
    </ElementType>
  );
};

ToggleButton.displayName = "ToggleButton";

export { ToggleButton };
