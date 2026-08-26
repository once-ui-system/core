"use client";

import { cva } from "class-variance-authority";
import type { ComponentProps, CSSProperties, MouseEvent, ReactNode } from "react";
import { forwardRef, useEffect, useState } from "react";
import { cn } from "../classes/utils";
import { Flex } from "./Flex";

export const glitchFxVariants = cva("relative select-none", {
  variants: {
    speed: {
      slow: "[--glitch-duration:3.5s]",
      medium: "[--glitch-duration:2.5s]",
      fast: "[--glitch-duration:1.5s]",
    },
  },
  defaultVariants: {
    speed: "medium",
  },
});

export interface GlitchFxProps extends ComponentProps<typeof Flex> {
  children: ReactNode;
  speed?: "slow" | "medium" | "fast";
  interval?: number;
  trigger?: "instant" | "hover" | "custom";
  continuous?: boolean;
  className?: string;
  style?: CSSProperties;
}

const GlitchFx = forwardRef<HTMLDivElement, GlitchFxProps>(
  (
    {
      children,
      speed = "medium",
      interval = 2500,
      trigger = "instant",
      continuous = true,
      className,
      style,
      onMouseEnter,
      onMouseLeave,
      ...rest
    },
    ref,
  ) => {
    const [isGlitching, setIsGlitching] = useState(continuous || trigger === "instant");

    useEffect(() => {
      if (continuous || trigger === "instant") {
        setIsGlitching(true);
      } else if (trigger === "hover") {
        setIsGlitching(false);
      }
    }, [continuous, trigger]);

    const handleMouseEnter = (event: MouseEvent<HTMLDivElement>) => {
      if (trigger === "hover") {
        setIsGlitching(true);
      }
      onMouseEnter?.(event);
    };

    const handleMouseLeave = (event: MouseEvent<HTMLDivElement>) => {
      if (trigger === "hover") {
        setIsGlitching(false);
      }
      onMouseLeave?.(event);
    };

    useEffect(() => {
      if (trigger === "custom") {
        let timeoutId: ReturnType<typeof setTimeout> | undefined;
        const glitchInterval = setInterval(() => {
          setIsGlitching(true);
          timeoutId = setTimeout(() => {
            setIsGlitching(false);
          }, 500);
        }, interval);

        return () => {
          clearInterval(glitchInterval);
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
        };
      }
    }, [trigger, interval]);

    return (
      <Flex
        ref={ref}
        inline
        position="relative"
        zIndex={0}
        className={cn(glitchFxVariants({ speed }), className)}
        style={style}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...rest}
      >
        <Flex fillWidth inline zIndex={1}>
          {children}
        </Flex>

        <Flex
          inline
          position="absolute"
          top="0"
          left="0"
          fill
          zIndex={0}
          opacity={50}
          className={cn(
            "pointer-events-none [filter:hue-rotate(260deg)] animate-glitch-blue",
            isGlitching ? "[animation-play-state:running]" : "[animation-play-state:paused]",
          )}
        >
          {children}
        </Flex>

        <Flex
          inline
          position="absolute"
          top="0"
          left="0"
          fill
          zIndex={0}
          opacity={50}
          className={cn(
            "pointer-events-none [filter:hue-rotate(120deg)] animate-glitch-red",
            isGlitching ? "[animation-play-state:running]" : "[animation-play-state:paused]",
          )}
        >
          {children}
        </Flex>
      </Flex>
    );
  },
);

GlitchFx.displayName = "GlitchFx";

export { GlitchFx };
