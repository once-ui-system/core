"use client";

import classNames from "clsx";
import React, { forwardRef, ReactNode } from "react";
import { IconName } from "../icons.js";
import { defaultButtonTone } from "../internal/buttonTone.js";
import { Tone, TShirtSizes } from "../types.js";
import { Arrow } from "./Arrow.js";
import styles from "./Button.module.scss";
import { dropdownTriggerProps, useDropdownTrigger } from "./DropdownTriggerContext.js";
import { ElementType } from "./ElementType.js";
import { Flex } from "./Flex.js";
import { Icon } from "./Icon.js";
import { Spinner } from "./Spinner.js";

/** A button's appearance. 2.x's `quaternary` is `ghost`. */
export type ButtonVariant = "primary" | "secondary" | "tertiary" | "ghost" | "link" | "subtle";

interface ButtonCommonProps {
  /** How the button looks. The palette it draws in is `tone`. */
  variant?: ButtonVariant;
  /**
   * Which palette the button draws in: the solid fill of a `primary` button,
   * the label and icons of the others. Defaults to `brand` on `primary` and
   * `neutral` on the rest. 2.x's `variant="danger"` is `tone="danger"`.
   */
  tone?: Tone;
  size?: TShirtSizes;
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
  label?: string;
  weight?: "default" | "strong";
  rounded?: boolean;
  prefixIcon?: IconName;
  suffixIcon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  fillWidth?: boolean;
  horizontal?: "start" | "center" | "end" | "between";
  children?: ReactNode;
  href?: string;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  arrowIcon?: boolean;
}

export type ButtonProps = ButtonCommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>;
export type AnchorProps = ButtonCommonProps & React.AnchorHTMLAttributes<HTMLAnchorElement>;

const Button = forwardRef<HTMLButtonElement, ButtonProps | AnchorProps>(
  (
    {
      variant = "primary",
      tone,
      size = "m",
      corners,
      rounded,
      label,
      weight = "strong",
      children,
      prefixIcon,
      suffixIcon,
      loading = false,
      disabled = false,
      fillWidth = false,
      horizontal = "center",
      href,
      id,
      arrowIcon = false,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const iconSize = size === "l" || size === "xl" ? "s" : size === "m" ? "s" : "xs";
    const radiusSize = size === "xs" ? "s" : size === "s" || size === "m" ? "m" : "l";
    const trigger = useDropdownTrigger();

    return (
      <ElementType
        id={id}
        href={href}
        ref={ref}
        {...dropdownTriggerProps(trigger, href, props.onClick)}
        disabled={disabled}
        data-disabled={disabled ? true : undefined}
        data-border={rounded ? "rounded" : undefined}
        className={classNames(
          styles.button,
          styles[variant],
          styles[`tone-${tone ?? defaultButtonTone(variant)}`],
          styles[size],
          corners === "none"
            ? "radius-none"
            : corners
              ? `radius-${radiusSize}-${corners}`
              : `radius-${radiusSize}`,
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
        {prefixIcon && !loading && <Icon name={prefixIcon} size={iconSize} />}
        {loading && <Spinner size={size} />}
        {(label || children) && (
          <Flex paddingX="4" paddingY="0" textVariant={`label-${weight}-${size}`}>
            {label || children}
          </Flex>
        )}
        {arrowIcon && (
          <Arrow
            style={{
              marginLeft: "calc(-1 * var(--static-space-4))",
            }}
            trigger={"#" + id}
            scale={size === "s" ? 0.8 : size === "m" ? 0.9 : 1}
            color={variant === "primary" ? "onSolid" : "onBackground"}
          />
        )}
        {suffixIcon && <Icon name={suffixIcon} size={iconSize} />}
      </ElementType>
    );
  },
);

Button.displayName = "Button";

export { Button };
