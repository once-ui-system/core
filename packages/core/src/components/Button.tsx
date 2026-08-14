"use client";

import { cva } from "class-variance-authority";
import type { CSSProperties, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../classes/utils";
import type { IconName } from "../icons";
import type { ColorScheme, ColorWeight, TShirtSizes } from "../types";
import { Arrow } from "./Arrow";
import { ElementType } from "./ElementType";
import { Flex } from "./Flex";
import { Icon } from "./Icon";
import { Spinner } from "./Spinner";

export const buttonVariants = cva(
  "inline-flex items-center relative select-none p-0 whitespace-nowrap no-underline transition-colors duration-micro-medium focus-visible:z-[1] focus:outline-none [-webkit-tap-highlight-color:transparent]",
  {
    variants: {
      variant: {
        primary:
          "shadow-[inset_0_var(--solid-inset-distance)_var(--solid-inset-size)_var(--solid-inset-color-brand)] bg-brand-solid-medium border-solid border-[length:var(--solid-border-width)] border-[color:var(--solid-border-color-brand)] text-brand-on-solid-strong hover:bg-brand-solid-strong data-[disabled]:shadow-none data-[disabled]:bg-neutral-background-medium data-[disabled]:text-neutral-on-background-weak data-[disabled]:border-transparent data-[disabled]:hover:bg-neutral-background-medium",
        secondary:
          "shadow-[inset_0_var(--solid-inset-distance)_var(--solid-inset-size)_var(--solid-inset-color-neutral)] border border-solid border-neutral-alpha-weak bg-transparent text-neutral-on-background-strong hover:bg-neutral-alpha-weak hover:border-neutral-alpha-weak data-[disabled]:shadow-none data-[disabled]:bg-neutral-background-medium data-[disabled]:text-neutral-on-background-weak data-[disabled]:border-transparent data-[disabled]:hover:bg-neutral-background-medium",
        tertiary:
          "bg-transparent text-neutral-on-background-strong border border-solid border-transparent hover:border-neutral-border-medium data-[disabled]:shadow-none data-[disabled]:bg-neutral-background-medium data-[disabled]:text-neutral-on-background-weak data-[disabled]:border-transparent data-[disabled]:hover:border-transparent",
        quaternary:
          "border-none bg-transparent text-neutral-on-background-medium hover:bg-[color-mix(in_srgb,var(--neutral-background-medium)_70%,transparent)] hover:text-neutral-on-background-strong data-[disabled]:shadow-none data-[disabled]:bg-neutral-background-medium data-[disabled]:text-neutral-on-background-weak data-[disabled]:border-transparent data-[disabled]:hover:bg-neutral-background-medium",
        subtle:
          "bg-[color-mix(in_srgb,var(--neutral-background-medium)_70%,transparent)] border-solid border-[length:var(--solid-border-width)] border-transparent text-neutral-on-background-strong hover:bg-[color-mix(in_srgb,var(--neutral-background-strong)_50%,transparent)] data-[disabled]:shadow-none data-[disabled]:bg-neutral-background-medium data-[disabled]:text-neutral-on-background-weak data-[disabled]:border-transparent data-[disabled]:hover:bg-neutral-background-medium",
        danger:
          "shadow-[inset_0_var(--solid-inset-distance)_var(--solid-inset-size)_var(--solid-inset-color-danger)] bg-danger-solid-medium border-solid border-[length:var(--solid-border-width)] border-[color:var(--solid-border-color-danger)] text-danger-on-solid-strong hover:bg-danger-solid-strong data-[disabled]:shadow-none data-[disabled]:bg-neutral-background-medium data-[disabled]:text-neutral-on-background-weak data-[disabled]:border-transparent data-[disabled]:hover:bg-neutral-background-medium",
        success:
          "shadow-[inset_0_var(--solid-inset-distance)_var(--solid-inset-size)_var(--success-alpha-strong)] bg-success-solid-medium border-solid border-[length:var(--solid-border-width)] border-success-alpha-strong text-success-on-solid-strong hover:bg-success-solid-strong data-[disabled]:shadow-none data-[disabled]:bg-neutral-background-medium data-[disabled]:text-neutral-on-background-weak data-[disabled]:border-transparent data-[disabled]:hover:bg-neutral-background-medium",
        warning:
          "shadow-[inset_0_var(--solid-inset-distance)_var(--solid-inset-size)_var(--warning-alpha-strong)] bg-warning-solid-medium border-solid border-[length:var(--solid-border-width)] border-warning-alpha-strong text-warning-on-solid-strong hover:bg-warning-solid-strong data-[disabled]:shadow-none data-[disabled]:bg-neutral-background-medium data-[disabled]:text-neutral-on-background-weak data-[disabled]:border-transparent data-[disabled]:hover:bg-neutral-background-medium",
        ghost:
          "border-none bg-transparent text-neutral-on-background-medium hover:text-neutral-on-background-strong data-[disabled]:shadow-none data-[disabled]:bg-neutral-background-medium data-[disabled]:text-neutral-on-background-weak data-[disabled]:border-transparent data-[disabled]:hover:text-neutral-on-background-weak",
        link: "border-none bg-transparent text-neutral-on-background-strong hover:underline data-[disabled]:shadow-none data-[disabled]:bg-neutral-background-medium data-[disabled]:text-neutral-on-background-weak data-[disabled]:border-transparent data-[disabled]:hover:no-underline",
      },
      size: {
        xs: "py-2 px-4 min-h-24 h-24 gap-2",
        s: "py-4 px-8 min-h-32 h-32 gap-4",
        m: "py-8 px-12 min-h-40 h-40 gap-4",
        l: "py-12 px-20 min-h-48 h-48 gap-8",
        xl: "py-16 px-24 min-h-56 h-56 gap-12",
      },
      fillWidth: {
        true: "w-full",
        false: "w-fit",
      },
      horizontal: {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
        between: "justify-between",
      },
      disabled: {
        true: "cursor-not-allowed",
        false: "cursor-interactive",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "m",
      fillWidth: false,
      horizontal: "center",
      disabled: false,
    },
  },
);

const getRadiusClass = (radius?: ButtonCommonProps["radius"], size: TShirtSizes = "m") => {
  if (radius === "none") return "rounded-none";
  const radiusSize = size === "xs" ? "s" : size === "s" || size === "m" ? "m" : "l";
  if (!radius) return `rounded-${radiusSize}`;
  switch (radius) {
    case "top":
      return `rounded-t-${radiusSize}`;
    case "right":
      return `rounded-r-${radiusSize}`;
    case "bottom":
      return `rounded-b-${radiusSize}`;
    case "left":
      return `rounded-l-${radiusSize}`;
    case "top-left":
      return `rounded-tl-${radiusSize}`;
    case "top-right":
      return `rounded-tr-${radiusSize}`;
    case "bottom-right":
      return `rounded-br-${radiusSize}`;
    case "bottom-left":
      return `rounded-bl-${radiusSize}`;
    default:
      return `rounded-${radiusSize}`;
  }
};

export interface ButtonCommonProps {
  variant?:
    | "primary"
    | "secondary"
    | "tertiary"
    | "quaternary"
    | "subtle"
    | "danger"
    | "success"
    | "warning"
    | "ghost"
    | "link";
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
  style?: CSSProperties;
  id?: string;
  arrowIcon?: boolean;
  color?: `${ColorScheme}-${ColorWeight}`;
}

export type ButtonProps = ButtonCommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>;
export type AnchorProps = ButtonCommonProps & React.AnchorHTMLAttributes<HTMLAnchorElement>;

const Button = forwardRef<HTMLButtonElement, ButtonProps | AnchorProps>(
  (
    {
      variant = "primary",
      size = "m",
      radius,
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
      color,
      className,
      style,
      type,
      ...props
    },
    ref,
  ) => {
    const iconSize = size === "l" || size === "xl" ? "s" : size === "m" ? "s" : "xs";

    return (
      <ElementType
        id={id}
        href={href}
        ref={ref}
        type={type || (href ? undefined : "button")}
        disabled={disabled}
        data-disabled={disabled ? true : undefined}
        data-border={rounded ? "rounded" : undefined}
        className={cn(
          buttonVariants({
            variant,
            size,
            fillWidth,
            horizontal,
            disabled,
          }),
          getRadiusClass(radius, size),
          className,
        )}
        style={style}
        {...props}
      >
        {prefixIcon && !loading && <Icon name={prefixIcon} size={iconSize} onBackground={color} />}
        {loading && <Spinner size={size} />}
        {(label || children) && (
          <Flex
            paddingX="4"
            paddingY="0"
            textWeight={weight}
            textSize={size}
            className="font-label"
          >
            {label || children}
          </Flex>
        )}
        {arrowIcon && (
          <Arrow
            style={{
              marginLeft: "calc(-1 * var(--static-space-4))",
            }}
            trigger={`#${id}`}
            scale={size === "s" ? 0.8 : size === "m" ? 0.9 : 1}
            color={
              variant === "primary" ||
              variant === "danger" ||
              variant === "success" ||
              variant === "warning"
                ? "onSolid"
                : "onBackground"
            }
          />
        )}
        {suffixIcon && <Icon name={suffixIcon} size={iconSize} onBackground={color} />}
      </ElementType>
    );
  },
);

Button.displayName = "Button";

export { Button };
