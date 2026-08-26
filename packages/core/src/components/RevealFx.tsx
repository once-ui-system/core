"use client";

import { cva } from "class-variance-authority";
import type { CSSProperties, ReactNode } from "react";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../classes/utils";
import { useReducedMotion } from "../hooks/useReducedMotion";
import type { SpacingToken } from "../types";
import { Flex, type FlexComponentProps } from "./Flex";

export const revealFxVariants = cva("transition-all ease-in-out", {
  variants: {
    state: {
      hidden:
        "[mask-size:400%_100%] [-webkit-mask-size:400%_100%] [mask-image:linear-gradient(to_right,black_0%,black_25%,transparent_50%)] [-webkit-mask-image:linear-gradient(to_right,black_0%,black_25%,transparent_50%)] [mask-position:100%_0] [-webkit-mask-position:100%_0] blur-[1rem]",
      revealed:
        "[mask-size:400%_100%] [-webkit-mask-size:400%_100%] [mask-image:linear-gradient(to_right,black_0%,black_25%,transparent_50%)] [-webkit-mask-image:linear-gradient(to_right,black_0%,black_25%,transparent_50%)] [mask-position:0_0] [-webkit-mask-position:0_0] blur-none",
      revealedNoMask: "blur-none opacity-100",
      hiddenNoMask: "blur-[0.5rem] opacity-0",
    },
  },
  defaultVariants: {
    state: "hidden",
  },
});

const REVEAL_FX_HIDDEN = revealFxVariants({ state: "hidden" });
const REVEAL_FX_REVEALED = revealFxVariants({ state: "revealed" });
const REVEAL_FX_REVEALED_NO_MASK = revealFxVariants({ state: "revealedNoMask" });

export type RevealFxSpeed = "slow" | "medium" | "fast" | number;

export interface RevealFxProps extends FlexComponentProps {
  children?: ReactNode;
  speed?: RevealFxSpeed;
  delay?: number;
  revealedByDefault?: boolean;
  translateY?: number | SpacingToken;
  trigger?: boolean;
  reducedMotion?: boolean | "auto";
  style?: CSSProperties;
  className?: string;
}

export const getSpeedDurationMs = (speed: RevealFxSpeed = "medium"): number => {
  if (typeof speed === "number") {
    return speed;
  }

  switch (speed) {
    case "fast":
      return 1000;
    case "medium":
      return 2000;
    case "slow":
      return 3000;
    default:
      return 2000;
  }
};

export const getTranslateYValue = (translateY?: number | SpacingToken): string | undefined => {
  if (typeof translateY === "number") {
    return `${translateY}rem`;
  }
  if (typeof translateY === "string") {
    return `var(--static-space-${translateY})`;
  }
  return undefined;
};

const RevealFx = forwardRef<HTMLDivElement, RevealFxProps>(
  (
    {
      children,
      speed = "medium",
      delay = 0,
      revealedByDefault = false,
      translateY,
      trigger,
      reducedMotion = "auto",
      style,
      className,
      ...rest
    },
    ref,
  ) => {
    const { shouldAnimate } = useReducedMotion(reducedMotion);
    const [isRevealed, setIsRevealed] = useState(
      trigger !== undefined ? trigger : revealedByDefault || !shouldAnimate,
    );
    const [maskRemoved, setMaskRemoved] = useState(
      trigger !== undefined ? trigger : revealedByDefault || !shouldAnimate,
    );
    const transitionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const durationMs = getSpeedDurationMs(speed);

    useEffect(() => {
      if (!shouldAnimate) {
        setIsRevealed(true);
        setMaskRemoved(true);
        return;
      }

      if (trigger !== undefined) {
        setIsRevealed(trigger);
        setMaskRemoved(false);

        if (trigger) {
          if (transitionTimeoutRef.current) {
            clearTimeout(transitionTimeoutRef.current);
          }

          transitionTimeoutRef.current = setTimeout(() => {
            setMaskRemoved(true);
          }, durationMs);
        }
        return;
      }

      const timer = setTimeout(() => {
        setIsRevealed(true);

        transitionTimeoutRef.current = setTimeout(() => {
          setMaskRemoved(true);
        }, durationMs);
      }, delay * 1000);

      return () => {
        clearTimeout(timer);
        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current);
        }
      };
    }, [delay, durationMs, shouldAnimate, trigger]);

    const speedDuration = shouldAnimate ? `${durationMs / 1000}s` : "0s";
    const translateValue = getTranslateYValue(translateY);

    const revealStyle = useMemo<CSSProperties>(() => {
      const transform = translateValue
        ? isRevealed
          ? "translateY(0)"
          : `translateY(${translateValue})`
        : isRevealed
          ? "translateY(0)"
          : undefined;

      return {
        transitionDuration: speedDuration,
        ...(transform ? { transform } : {}),
        ...style,
      };
    }, [speedDuration, translateValue, isRevealed, style]);

    const variantClass = maskRemoved
      ? REVEAL_FX_REVEALED_NO_MASK
      : isRevealed
        ? REVEAL_FX_REVEALED
        : REVEAL_FX_HIDDEN;

    return (
      <Flex
        ref={ref}
        fillWidth
        style={revealStyle}
        className={cn(variantClass, className)}
        {...rest}
      >
        {children}
      </Flex>
    );
  },
);

RevealFx.displayName = "RevealFx";

export { RevealFx };
