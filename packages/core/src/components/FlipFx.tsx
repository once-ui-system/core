"use client";

import { cva } from "class-variance-authority";
import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "../classes/utils";
import { Flex, type FlexComponentProps } from "./Flex";

export type FlipDirection = "horizontal" | "vertical";

export const flipFxVariants = cva(
  "relative select-none [transform-style:preserve-3d] [perspective:1000px]",
);
const FLIP_FX_BASE = flipFxVariants();

export const flipFxSideVariants = cva(
  "absolute inset-0 size-full overflow-hidden [backface-visibility:hidden]",
  {
    variants: {
      side: {
        front: "",
        backHorizontal: "[transform:rotateY(180deg)]",
        backVertical: "[transform:rotateX(180deg)]",
      },
    },
    defaultVariants: {
      side: "front",
    },
  },
);
const FRONT_SIDE_BASE = flipFxSideVariants({ side: "front" });
const BACK_HORIZONTAL_BASE = flipFxSideVariants({ side: "backHorizontal" });
const BACK_VERTICAL_BASE = flipFxSideVariants({ side: "backVertical" });

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface FlipFxProps extends FlexComponentProps {
  flipDirection?: FlipDirection;
  timing?: number;
  flipped?: boolean;
  onFlip?: (flipped: boolean) => void;
  disableClickFlip?: boolean;
  autoFlipInterval?: number;
  front: ReactNode;
  back: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const FlipFx = forwardRef<HTMLDivElement, FlipFxProps>(
  (
    {
      flipDirection = "horizontal",
      timing = 2000,
      flipped,
      onFlip,
      disableClickFlip = false,
      autoFlipInterval,
      front,
      back,
      cursor,
      className,
      style,
      ...flex
    },
    ref,
  ) => {
    const [internalFlipped, setInternalFlipped] = useState(false);
    const isControlled = flipped !== undefined;
    const flippedState = isControlled ? flipped : internalFlipped;

    const cardRef = useRef<HTMLDivElement>(null);
    const frontRef = useRef<HTMLDivElement>(null);
    const backRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => cardRef.current as HTMLDivElement);

    useIsomorphicLayoutEffect(() => {
      const updateHeight = () => {
        if (cardRef.current && frontRef.current && backRef.current) {
          const frontH = frontRef.current.scrollHeight;
          const backH = backRef.current.scrollHeight;
          const maxH = Math.max(frontH, backH);
          if (maxH > 0) {
            cardRef.current.style.height = `${maxH}px`;
          }
        }
      };

      updateHeight();

      if (typeof ResizeObserver !== "undefined") {
        const observer = new ResizeObserver(updateHeight);
        if (frontRef.current) observer.observe(frontRef.current);
        if (backRef.current) observer.observe(backRef.current);

        return () => observer.disconnect();
      }
    }, [flippedState, front, back]);

    useEffect(() => {
      if (autoFlipInterval && autoFlipInterval > 0) {
        const interval = setInterval(() => {
          setInternalFlipped((prev) => {
            const next = !prev;
            onFlip?.(isControlled ? !flipped : next);
            return next;
          });
        }, autoFlipInterval * 1000);

        return () => clearInterval(interval);
      }
    }, [autoFlipInterval, isControlled, flipped, onFlip]);

    const handleFlip = useCallback(() => {
      if (disableClickFlip || autoFlipInterval) return;
      const next = !flippedState;
      if (!isControlled) {
        setInternalFlipped(next);
      }
      onFlip?.(next);
    }, [disableClickFlip, autoFlipInterval, flippedState, isControlled, onFlip]);

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleFlip();
        }
      },
      [handleFlip],
    );

    const cardStyle = useMemo<CSSProperties>(
      () => ({
        transform: flippedState
          ? flipDirection === "vertical"
            ? "rotateX(180deg)"
            : "rotateY(180deg)"
          : "none",
        transition: `transform ${timing}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        ...style,
      }),
      [flippedState, flipDirection, timing, style],
    );

    const isInteractive = !disableClickFlip && !autoFlipInterval;

    return (
      <Flex
        ref={cardRef}
        className={cn(FLIP_FX_BASE, className)}
        style={cardStyle}
        cursor={isInteractive ? (cursor ?? "interactive") : cursor}
        onClick={handleFlip}
        onKeyDown={handleKeyDown}
        role="button"
        aria-pressed={flippedState}
        tabIndex={isInteractive ? 0 : -1}
        {...flex}
      >
        <Flex
          ref={frontRef}
          fill
          position="absolute"
          overflow="hidden"
          aria-hidden={flippedState}
          className={FRONT_SIDE_BASE}
        >
          {front}
        </Flex>

        <Flex
          ref={backRef}
          fill
          position="absolute"
          overflow="hidden"
          aria-hidden={!flippedState}
          className={flipDirection === "vertical" ? BACK_VERTICAL_BASE : BACK_HORIZONTAL_BASE}
        >
          {back}
        </Flex>
      </Flex>
    );
  },
);

FlipFx.displayName = "FlipFx";

export { FlipFx };
