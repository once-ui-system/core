"use client";

import { cva } from "class-variance-authority";
import type { CSSProperties, ReactNode } from "react";
import { forwardRef } from "react";
import { generateClasses } from "../classes/generator";
import { cn } from "../classes/utils";
import type { IconName } from "../icons";
import type { RadiusSize, TShirtSizes } from "../types";
import { ElementType } from "./ElementType";
import { Flex } from "./Flex";
import { Icon } from "./Icon";

export const toggleButtonVariants = cva(
  "inline-flex items-center gap-8 border border-solid bg-transparent text-neutral-on-background-strong transition-colors duration-micro-medium select-none whitespace-nowrap no-underline focus-visible:z-[1] focus-visible:outline-none focus-visible:bg-neutral-alpha-weak focus-visible:border-neutral-alpha-weak [-webkit-tap-highlight-color:transparent] data-[disabled]:bg-neutral-background-medium data-[disabled]:text-neutral-on-background-weak data-[disabled]:border-transparent data-[disabled]:hover:bg-neutral-background-medium data-[disabled]:hover:border-transparent",
  {
    variants: {
      variant: {
        ghost: "border-transparent hover:bg-neutral-alpha-weak hover:border-neutral-alpha-weak",
        outline:
          "border-neutral-alpha-weak hover:bg-neutral-alpha-weak hover:border-neutral-alpha-weak",
        subtle: "border-transparent hover:bg-neutral-alpha-weak hover:border-transparent",
      },
      size: {
        xs: "h-20 min-h-20 py-2 px-8",
        s: "h-24 min-h-24 py-2 px-8",
        m: "h-32 min-h-32 py-4 px-8",
        l: "h-40 min-h-40 py-8 px-16",
        xl: "h-48 min-h-48 py-12 px-20",
      },
      selected: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: ["ghost", "outline"],
        selected: true,
        className:
          "bg-neutral-alpha-medium border-neutral-alpha-weak hover:bg-neutral-alpha-weak hover:border-neutral-alpha-weak",
      },
      {
        variant: "subtle",
        selected: true,
        className:
          "bg-neutral-alpha-medium border-transparent hover:bg-neutral-background-medium hover:border-transparent",
      },
    ],
    defaultVariants: {
      variant: "ghost",
      size: "m",
      selected: false,
    },
  },
);

export interface ToggleButtonCommonProps {
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
  style?: CSSProperties;
  children?: ReactNode;
  href?: string;
  id?: string;
}

export type ToggleButtonProps = ToggleButtonCommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement>;

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
      id,
      type,
      ...props
    },
    ref,
  ) => {
    const iconSize = size === "xl" ? "m" : size === "l" ? "s" : "xs";
    const radiusSize: RadiusSize = radius === "none" ? "none" : (size ?? "m");

    const resolvedRadius = {
      radius: !radius ? radiusSize : radius === "none" ? ("none" as const) : undefined,
      topRadius: radius === "top" ? radiusSize : undefined,
      rightRadius: radius === "right" ? radiusSize : undefined,
      bottomRadius: radius === "bottom" ? radiusSize : undefined,
      leftRadius: radius === "left" ? radiusSize : undefined,
      topLeftRadius: radius === "top-left" ? radiusSize : undefined,
      topRightRadius: radius === "top-right" ? radiusSize : undefined,
      bottomRightRadius: radius === "bottom-right" ? radiusSize : undefined,
      bottomLeftRadius: radius === "bottom-left" ? radiusSize : undefined,
    };

    return (
      <ElementType
        id={id}
        href={href}
        ref={ref}
        type={type || (href ? undefined : "button")}
        disabled={disabled}
        data-disabled={disabled ? true : undefined}
        data-border={rounded ? "rounded" : undefined}
        aria-pressed={selected}
        className={cn(
          toggleButtonVariants({
            variant,
            size,
            selected: Boolean(selected),
          }),
          generateClasses({
            fillWidth,
            fitWidth: !fillWidth,
            horizontal,
            cursor: disabled ? "not-allowed" : "interactive",
            ...resolvedRadius,
            ...props,
          }),
          className,
        )}
        style={style}
        {...props}
      >
        {prefixIcon && <Icon name={prefixIcon} size={iconSize} />}
        {(label || children) && (
          <Flex
            fillWidth={fillWidth}
            horizontal={horizontal}
            textWeight={weight}
            paddingX={size === "xl" ? "12" : size === "l" ? "8" : size === "s" ? "4" : "2"}
            textSize={size === "xl" ? "l" : size === "l" ? "m" : "s"}
            className={cn("font-label", truncate && "truncate")}
            position="static"
          >
            {label || children}
          </Flex>
        )}
        {suffixIcon && <Icon name={suffixIcon} size={iconSize} />}
      </ElementType>
    );
  },
);

ToggleButton.displayName = "ToggleButton";

export { ToggleButton };
