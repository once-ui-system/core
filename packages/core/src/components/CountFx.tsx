"use client";

import { cva } from "class-variance-authority";
import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../classes/utils";
import { Row } from "./Row";
import { Text } from "./Text";

export const countFxVariants = cva("tabular-nums inline-flex items-center");
const COUNT_FX_BASE = countFxVariants();

export interface CountFxProps extends ComponentProps<typeof Text> {
  value: number;
  speed?: number;
  easing?: "linear" | "ease-out" | "ease-in-out";
  format?: (value: number) => string;
  separator?: string;
  decimals?: number;
  effect?: "simple" | "wheel" | "smooth";
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const CountFx = forwardRef<HTMLSpanElement, CountFxProps>(
  (
    {
      value,
      speed = 1000,
      easing = "ease-out",
      format,
      separator,
      decimals,
      effect = "simple",
      className,
      style,
      children,
      ...textProps
    },
    ref,
  ) => {
    const [displayValue, setDisplayValue] = useState(value);
    const [animationProgress, setAnimationProgress] = useState(1);
    const animationRef = useRef<number | undefined>(undefined);
    const previousValueRef = useRef<number>(value);

    // Default format function with separator and decimals support
    const defaultFormat = useCallback(
      (val: number) => {
        let formattedValue = decimals !== undefined ? val.toFixed(decimals) : val.toString();

        if (separator) {
          const parts = formattedValue.split(".");
          parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
          formattedValue = parts.join(".");
        }

        return formattedValue;
      },
      [decimals, separator],
    );

    const formatValue = format || defaultFormat;

    // Easing functions
    const getEasing = useCallback(
      (progress: number): number => {
        switch (easing) {
          case "linear":
            return progress;
          case "ease-out":
            return 1 - (1 - progress) ** 3;
          case "ease-in-out":
            return progress < 0.5 ? 2 * progress * progress : 1 - (-2 * progress + 2) ** 2 / 2;
          default:
            return 1 - (1 - progress) ** 3;
        }
      },
      [easing],
    );

    // Wheel animation: create digit wheels
    const renderWheelDigits = (currentValue: number, targetValue: number) => {
      const currentStr = currentValue.toString().padStart(targetValue.toString().length, "0");
      const targetStr = targetValue.toString();
      const maxLength = Math.max(currentStr.length, targetStr.length);

      return Array.from({ length: maxLength }, (_, index) => {
        const currentDigit = Number.parseInt(currentStr[maxLength - 1 - index] || "0", 10);
        const targetDigit = Number.parseInt(targetStr[maxLength - 1 - index] || "0", 10);

        // Calculate progress for this specific digit
        const digitDifference = targetDigit - currentDigit;
        const digitProgress =
          Math.abs(digitDifference) > 0 ? Math.min(Math.abs(digitDifference) / 10, 1) : 1;

        // Create wheel effect for this digit
        const wheelDigits = [];
        for (let i = 0; i <= 9; i++) {
          const isActive = i === currentDigit;

          // Calculate transition speed based on progress (slower as it approaches target)
          const transitionDuration = 0.1 + digitProgress * 0.2;

          // Calculate position for wheel effect
          let position = 0;
          if (isActive) {
            position = 0;
          } else if (i < currentDigit) {
            position = -100;
          } else {
            position = 100;
          }

          wheelDigits.push(
            <Row
              center
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              key={i}
              className="pointer-events-none h-[1em] w-full"
              style={{
                transform: `translateY(${position * 2}%)`,
                transition: `all ${transitionDuration}s ease-out`,
              }}
            >
              {i}
            </Row>,
          );
        }

        return (
          <Row
            align="center"
            overflow="hidden"
            inline
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed digit position in wheel animation
            key={`wheel-${maxLength - 1 - index}`}
            className="relative isolate h-[1em] w-[0.8em] -mx-[0.125em]"
          >
            {wheelDigits}
          </Row>
        );
      }).reverse();
    };

    // Smooth animation: animate each digit independently from start to target
    const renderSmoothDigits = (startValue: number, targetValue: number, progress: number) => {
      const startStr = startValue.toString().padStart(targetValue.toString().length, "0");
      const targetStr = targetValue.toString();
      const maxLength = Math.max(startStr.length, targetStr.length);

      return Array.from({ length: maxLength }, (_, index) => {
        const startDigit = Number.parseInt(startStr[maxLength - 1 - index] || "0", 10);
        const targetDigit = Number.parseInt(targetStr[maxLength - 1 - index] || "0", 10);

        // Calculate the shortest path between digits (handles wrapping around 0-9)
        let digitDifference = targetDigit - startDigit;
        if (Math.abs(digitDifference) > 5) {
          digitDifference = digitDifference > 0 ? digitDifference - 10 : digitDifference + 10;
        }

        // Calculate the current digit position based on progress
        const currentDigitPosition = startDigit + digitDifference * progress;

        // Create wheel effect for this digit
        const wheelDigits = [];
        for (let i = 0; i <= 9; i++) {
          let relativePosition = i - currentDigitPosition;

          // Handle wrapping around the wheel
          if (relativePosition > 5) relativePosition -= 10;
          if (relativePosition < -5) relativePosition += 10;

          // Convert to percentage position
          const position = relativePosition * 200;
          const opacity = Math.max(0, 1 - Math.abs(relativePosition) * 2);

          wheelDigits.push(
            <Row
              center
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              pointerEvents="none"
              fillWidth
              key={i}
              className="h-[1em] transition-none"
              style={{
                transform: `translateY(${position}%)`,
                opacity,
              }}
            >
              {i}
            </Row>,
          );
        }

        return (
          <Row
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed digit position in smooth animation
            key={`smooth-${maxLength - 1 - index}`}
            className="h-[1em] -mx-[0.125em]"
          >
            <Row
              align="center"
              inline
              overflow="hidden"
              className="relative isolate h-[2em] w-[0.8em] opacity-100"
            >
              {wheelDigits}
            </Row>
          </Row>
        );
      }).reverse();
    };

    useEffect(() => {
      if (value === previousValueRef.current) return;

      const startValue = previousValueRef.current;
      const endValue = value;
      const difference = endValue - startValue;

      let startTime: number | undefined;

      const animate = (timestamp: number) => {
        if (startTime === undefined) startTime = timestamp;

        const elapsed = timestamp - startTime;
        const progress = speed <= 0 ? 1 : Math.min(elapsed / speed, 1);
        const easedProgress = getEasing(progress);

        if (effect === "wheel") {
          const currentValue =
            decimals !== undefined
              ? Number.parseFloat((startValue + difference * easedProgress).toFixed(decimals))
              : Math.floor(startValue + difference * easedProgress);
          setDisplayValue(currentValue);
        } else if (effect === "smooth") {
          setAnimationProgress(easedProgress);
          const currentValue =
            decimals !== undefined
              ? Number.parseFloat((startValue + difference * easedProgress).toFixed(decimals))
              : Math.floor(startValue + difference * easedProgress);
          setDisplayValue(currentValue);
        } else {
          const currentValue = startValue + difference * easedProgress;
          const currentStepValue =
            decimals !== undefined
              ? Number.parseFloat(currentValue.toFixed(decimals))
              : Math.floor(currentValue);
          setDisplayValue(currentStepValue);
        }

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setDisplayValue(endValue);
          setAnimationProgress(1);
          previousValueRef.current = endValue;
        }
      };

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [value, speed, getEasing, effect, decimals]);

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, []);

    if (effect === "wheel") {
      return (
        <span ref={ref} className={cn(COUNT_FX_BASE, className)} style={style}>
          <Text className="inline-flex items-center gap-[0.1em]" {...textProps}>
            {renderWheelDigits(displayValue, value)}
            {children}
          </Text>
        </span>
      );
    }

    if (effect === "smooth") {
      return (
        <span ref={ref} className={cn(COUNT_FX_BASE, className)} style={style}>
          <Text className="inline-flex items-center gap-[0.1em]" {...textProps}>
            {renderSmoothDigits(previousValueRef.current, value, animationProgress)}
            {children}
          </Text>
        </span>
      );
    }

    return (
      <span ref={ref} className={cn(COUNT_FX_BASE, className)} style={style}>
        <Text {...textProps}>
          {formatValue(displayValue)}
          {children}
        </Text>
      </span>
    );
  },
);

CountFx.displayName = "CountFx";

export { CountFx };
