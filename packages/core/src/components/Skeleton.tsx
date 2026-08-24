import { cva } from "class-variance-authority";
import type { CSSProperties } from "react";
import { forwardRef } from "react";
import { cn } from "../classes/utils";
import { Flex, type FlexComponentProps } from "./Flex";

export const skeletonVariants = cva("animate-skeleton inline-flex", {
  variants: {
    shape: {
      line: "rounded-full",
      circle: "rounded-full",
      block: "w-full h-full",
    },
    width: {
      xs: "",
      s: "",
      m: "",
      l: "",
      xl: "",
    },
    height: {
      xs: "",
      s: "",
      m: "",
      l: "",
      xl: "",
    },
    delay: {
      "1": "[animation-delay:0.1s]",
      "2": "[animation-delay:0.2s]",
      "3": "[animation-delay:0.3s]",
      "4": "[animation-delay:0.4s]",
      "5": "[animation-delay:0.5s]",
      "6": "[animation-delay:0.6s]",
    },
  },
  compoundVariants: [
    // Line widths
    { shape: "line", width: "xs", className: "w-[25%]" },
    { shape: "line", width: "s", className: "w-[33%]" },
    { shape: "line", width: "m", className: "w-1/2" },
    { shape: "line", width: "l", className: "w-[75%]" },
    { shape: "line", width: "xl", className: "w-full" },
    // Line heights
    { shape: "line", height: "xs", className: "h-8 min-h-8" },
    { shape: "line", height: "s", className: "h-12 min-h-12" },
    { shape: "line", height: "m", className: "h-16 min-h-16" },
    { shape: "line", height: "l", className: "h-20 min-h-20" },
    { shape: "line", height: "xl", className: "h-24 min-h-24" },
    // Circle sizes (keyed by width)
    { shape: "circle", width: "xs", className: "w-20 min-w-20 h-20 min-h-20" },
    { shape: "circle", width: "s", className: "w-24 min-w-24 h-24 min-h-24" },
    { shape: "circle", width: "m", className: "w-32 min-w-32 h-32 min-h-32" },
    { shape: "circle", width: "l", className: "w-40 min-w-40 h-40 min-h-40" },
    { shape: "circle", width: "xl", className: "w-160 min-w-160 h-160 min-h-160" },
  ],
  defaultVariants: {
    shape: "line",
  },
});

export interface SkeletonProps extends Omit<FlexComponentProps, "width" | "height"> {
  shape?: "line" | "circle" | "block";
  width?: "xl" | "l" | "m" | "s" | "xs";
  height?: "xl" | "l" | "m" | "s" | "xs";
  delay?: "1" | "2" | "3" | "4" | "5" | "6";
  style?: CSSProperties;
  className?: string;
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ shape = "line", width = "m", height = "m", delay, style, className, ...props }, ref) => {
    const resolvedWidth = shape === "circle" && width === "m" && height !== "m" ? height : width;

    return (
      <Flex
        {...props}
        ref={ref}
        style={style}
        inline
        className={cn(
          skeletonVariants({
            shape,
            width: resolvedWidth,
            height,
            delay,
          }),
          className,
        )}
      />
    );
  },
);

Skeleton.displayName = "Skeleton";

export { Skeleton };
