"use client";

import React, { forwardRef, ReactNode } from "react";
import classNames from "classnames";
import { Flex, Icon, ElementType } from ".";
import styles from "./ToggleButton.module.scss";
import { IconName } from "../icons";
import { TShirtSizes } from "../types";

interface ToggleButtonCommonProps {
  label?: ReactNode;
  selected?: boolean;
  variant?: "ghost" | "outline" | "subtle";
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
  horizontal?: "start" | "center" | "end" | "between";
  fillWidth?: boolean;
  weight?: "default" | "strong";
  truncate?: boolean;
  disabled?: boolean;
  prefixIcon?: IconName;
  suffixIcon?: IconName;
  className?: string;
  style?: React.CSSProperties;
  children?: ReactNode;
  href?: string;
}

export type ToggleButtonProps = ToggleButtonCommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>;

const ToggleButton = forwardRef<HTMLElement, ToggleButtonProps>(
  (
    {
      label,
      selected = false,
      variant = "ghost",
      size = "m",
      radius,
      rounded = false,
      horizontal = "center",
      fillWidth = false,
      weight = "default",
      truncate = false,
      disabled = false,
      prefixIcon,
      suffixIcon,
      className,
      style,
      children,
      href,
      ...props
    },
    ref,
  ) => {
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
          radius === "none"
            ? "radius-none"
            : radius
              ? `radius-${size}-${radius}`
              : `radius-${size}`,
          "text-decoration-none",
          "button",
          disabled ? "cursor-not-allowed" : "cursor-interactive",
          {
            ["fill-width"]: fillWidth,
            ["fit-width"]: !fillWidth,
            ["justify-" + horizontal]: horizontal,
          },
          className,
        )}
        style={style}
        {...props}
      >
        {prefixIcon && <Icon name={prefixIcon} size={size === "xl" ? "m" : size === "l" ? "s" : "xs"} />}
        {(label || children) && (
          <Flex
            fillWidth={fillWidth}
            horizontal={horizontal}
            textWeight={weight}
            paddingX={size === "xl" ? "12" : size === "l" ? "8" : size === "s" ? "4" : "2"}
            textSize={size === "xl" ? "l" : size === "l" ? "m" : "s"}
            className="font-label"
            position="static"
          >
            {label || children}
          </Flex>
        )}
        {suffixIcon && <Icon name={suffixIcon} size={size === "xl" ? "m" : size === "l" ? "s" : "xs"} />}
      </ElementType>
    );
  },
);

ToggleButton.displayName = "ToggleButton";
export { ToggleButton };
