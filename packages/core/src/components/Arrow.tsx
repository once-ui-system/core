"use client";

import { cva } from "class-variance-authority";
import type { CSSProperties } from "react";
import { forwardRef, useEffect, useState } from "react";
import { cn } from "../classes/utils";
import { Flex, type FlexComponentProps } from "./Flex";

export const arrowVariants = cva(
  "relative flex items-center justify-center transition-all duration-micro-medium h-16",
  {
    variants: {
      active: {
        true: "w-16 visible",
        false: "w-0 invisible",
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

export const arrowHeadVariants = cva(
  "absolute right-0 rounded-full transition-all duration-micro-medium origin-[right_center] h-[0.0875rem]",
  {
    variants: {
      color: {
        onBackground: "bg-brand-on-background-strong",
        onSolid: "bg-brand-on-solid-strong",
      },
      position: {
        top: "rotate-0",
        bottom: "rotate-0",
      },
      active: {
        true: "w-8",
        false: "w-0 rotate-0",
      },
    },
    compoundVariants: [
      {
        position: "top",
        active: true,
        className: "rotate-45",
      },
      {
        position: "bottom",
        active: true,
        className: "-rotate-45",
      },
    ],
    defaultVariants: {
      color: "onBackground",
      position: "top",
      active: false,
    },
  },
);

export interface ArrowProps extends FlexComponentProps {
  trigger?: string;
  active?: boolean;
  scale?: number;
  color?: "onBackground" | "onSolid";
  style?: CSSProperties;
  className?: string;
}

const Arrow = forwardRef<HTMLDivElement, ArrowProps>(
  ({ trigger, active, scale = 0.8, color = "onBackground", style, className, ...flex }, ref) => {
    const [internalActive, setInternalActive] = useState(false);
    const isActive = active !== undefined ? active : internalActive;

    useEffect(() => {
      if (!trigger) return;
      const triggerElement = document.querySelector(trigger);

      if (triggerElement) {
        const handleMouseOver = () => setInternalActive(true);
        const handleMouseOut = () => setInternalActive(false);

        triggerElement.addEventListener("mouseenter", handleMouseOver);
        triggerElement.addEventListener("mouseleave", handleMouseOut);

        return () => {
          triggerElement.removeEventListener("mouseenter", handleMouseOver);
          triggerElement.removeEventListener("mouseleave", handleMouseOut);
        };
      }
    }, [trigger]);

    return (
      <Flex
        ref={ref}
        center
        className={cn(arrowVariants({ active: isActive }), className)}
        style={{
          transform: `scale(${scale})`,
          ...style,
        }}
        {...flex}
      >
        <Flex
          radius="full"
          position="absolute"
          className={arrowHeadVariants({ color, position: "top", active: isActive })}
        />
        <Flex
          radius="full"
          position="absolute"
          className={arrowHeadVariants({ color, position: "bottom", active: isActive })}
        />
      </Flex>
    );
  },
);

Arrow.displayName = "Arrow";

export { Arrow };
