"use client";

import { cva } from "class-variance-authority";
import type { CSSProperties, ReactNode } from "react";
import { forwardRef, memo, useMemo } from "react";
import { cn } from "../classes/utils";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { Text, type TextComponentProps } from "./Text";

export const shineFxVariants = cva(
  "inline-block [-webkit-text-fill-color:transparent] [background-size:200%_100%] [-webkit-background-clip:text] bg-clip-text animate-shine",
  {
    variants: {
      inverse: {
        true: "bg-[linear-gradient(120deg,currentColor_40%,color-mix(in_srgb,currentColor,transparent_calc((1-var(--shine-base-opacity,0.3))*100%))_50%,currentColor_60%)]",
        false:
          "bg-[linear-gradient(120deg,color-mix(in_srgb,currentColor,transparent_calc((1-var(--shine-base-opacity,0.3))*100%))_40%,currentColor_50%,color-mix(in_srgb,currentColor,transparent_calc((1-var(--shine-base-opacity,0.3))*100%))_60%)]",
      },
      disabled: {
        true: "animate-none [-webkit-text-fill-color:inherit] bg-none [-webkit-background-clip:unset] [background-clip:unset]",
        false: "",
      },
    },
    defaultVariants: {
      inverse: false,
      disabled: false,
    },
  },
);

export interface ShineFxProps extends TextComponentProps<"span"> {
  speed?: number;
  disabled?: boolean;
  inverse?: boolean;
  baseOpacity?: number;
  reducedMotion?: boolean | "auto";
  children?: ReactNode;
}

const ShineFx = forwardRef<HTMLSpanElement, ShineFxProps>(
  (
    {
      speed = 1,
      disabled = false,
      inverse = false,
      baseOpacity = 0.3,
      reducedMotion = "auto",
      children,
      className,
      style,
      ...textProps
    },
    ref,
  ) => {
    const { shouldAnimate } = useReducedMotion(reducedMotion);
    const isDisabled = disabled || !shouldAnimate;

    const mergedStyle = useMemo<CSSProperties>(
      () =>
        ({
          ...style,
          animationDuration: `${speed}s`,
          "--shine-base-opacity": baseOpacity,
        }) as CSSProperties,
      [style, speed, baseOpacity],
    );

    return (
      <Text
        ref={ref}
        className={cn(
          shineFxVariants({
            inverse,
            disabled: isDisabled,
          }),
          className,
        )}
        style={mergedStyle}
        {...textProps}
      >
        {children}
      </Text>
    );
  },
);

ShineFx.displayName = "ShineFx";

export default memo(ShineFx);
export { ShineFx };
