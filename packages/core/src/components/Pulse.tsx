import { cva } from "class-variance-authority";
import type { CSSProperties, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../classes/utils";
import type { ColorScheme, CondensedTShirtSizes } from "../types";
import { Row, type RowProps } from "./Row";

export const pulseVariants = cva("relative inline-flex items-center justify-center", {
  variants: {
    size: {
      s: "min-w-16 min-h-16",
      m: "min-w-24 min-h-24",
      l: "min-w-32 min-h-32",
    },
  },
  defaultVariants: {
    size: "m",
  },
});

export interface PulseProps extends RowProps {
  variant?: ColorScheme;
  size?: CondensedTShirtSizes;
  pulseSize?: string | number;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const Pulse = forwardRef<HTMLDivElement, PulseProps>(
  ({ children, className, style, size = "m", pulseSize, variant = "brand", ...flex }, ref) => {
    return (
      <Row
        ref={ref}
        position="relative"
        minWidth={size === "s" ? "16" : size === "m" ? "24" : "32"}
        minHeight={size === "s" ? "16" : size === "m" ? "24" : "32"}
        center
        data-solid="color"
        className={cn(pulseVariants({ size }), className)}
        style={style}
        {...flex}
      >
        <Row position="absolute" className="left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Row
            solid={`${variant}-medium`}
            radius="full"
            className="origin-center pointer-events-none animate-pulse"
            width={size === "s" ? "32" : size === "m" ? "48" : "64"}
            height={size === "s" ? "32" : size === "m" ? "48" : "64"}
            style={pulseSize != null ? { width: pulseSize, height: pulseSize } : undefined}
          />
        </Row>
        <Row
          solid={`${variant}-strong`}
          minWidth={size === "s" ? "4" : size === "m" ? "8" : "12"}
          minHeight={size === "s" ? "4" : size === "m" ? "8" : "12"}
          radius="full"
        />
        {children}
      </Row>
    );
  },
);

Pulse.displayName = "Pulse";

export { Pulse };
