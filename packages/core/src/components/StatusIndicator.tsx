import { cva } from "class-variance-authority";
import type { CSSProperties } from "react";
import { forwardRef } from "react";
import { cn } from "../classes/utils";
import type { CondensedTShirtSizes, Schemes } from "../types";
import { Flex, type FlexComponentProps } from "./Flex";

export const statusIndicatorVariants = cva("inline-flex shrink-0", {
  variants: {
    size: {
      s: "w-4 h-4",
      m: "w-8 h-8",
      l: "w-16 h-16",
    },
    color: {
      gray: "bg-[var(--scheme-gray-700)]",
      blue: "bg-[var(--scheme-blue-700)]",
      indigo: "bg-[var(--scheme-indigo-700)]",
      violet: "bg-[var(--scheme-violet-700)]",
      magenta: "bg-[var(--scheme-magenta-700)]",
      pink: "bg-[var(--scheme-pink-700)]",
      red: "bg-[var(--scheme-red-700)]",
      orange: "bg-[var(--scheme-orange-700)]",
      yellow: "bg-[var(--scheme-yellow-700)]",
      moss: "bg-[var(--scheme-moss-700)]",
      green: "bg-[var(--scheme-green-700)]",
      emerald: "bg-[var(--scheme-emerald-700)]",
      aqua: "bg-[var(--scheme-aqua-700)]",
      cyan: "bg-[var(--scheme-cyan-700)]",
    },
  },
  defaultVariants: {
    size: "m",
    color: "blue",
  },
});

export interface StatusIndicatorProps extends FlexComponentProps {
  size?: CondensedTShirtSizes;
  color?: Schemes | "gray";
  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
}

const StatusIndicator = forwardRef<HTMLDivElement, StatusIndicatorProps>(
  (
    {
      size = "m",
      color = "blue",
      ariaLabel = `${color} status indicator`,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    return (
      <Flex
        ref={ref}
        style={style}
        className={cn(statusIndicatorVariants({ size, color }), className)}
        aria-label={ariaLabel}
        radius="full"
        {...rest}
      />
    );
  },
);

StatusIndicator.displayName = "StatusIndicator";

export { StatusIndicator };
