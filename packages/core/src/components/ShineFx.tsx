"use client";

import classNames from "clsx";
import React, { forwardRef } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion.js";
import styles from "./ShineFx.module.scss";
import { Text } from "./Text.js";

export interface ShineFxProps extends React.ComponentProps<typeof Text> {
  /** Milliseconds one sweep takes. Was `speed` until 3.0 (and seconds until 2.0). */
  duration?: number;
  disabled?: boolean;
  inverse?: boolean;
  baseOpacity?: number;
  reducedMotion?: boolean | "auto";
  children?: React.ReactNode;
}

const ShineFx = forwardRef<HTMLSpanElement, ShineFxProps>(
  (
    {
      duration = 1000,
      disabled = false,
      inverse = false,
      baseOpacity = 0.3,
      reducedMotion = "auto",
      children,
      className,
      style,
      ...text
    },
    ref,
  ) => {
    const { shouldAnimate } = useReducedMotion(reducedMotion);
    const isDisabled = disabled || !shouldAnimate;
    const animationDuration = `${duration}ms`;

    return (
      <Text
        {...text}
        ref={ref}
        className={classNames(
          styles.shineFx,
          isDisabled ? styles.disabled : "",
          inverse ? styles.inverse : styles.default,
          className,
        )}
        style={{
          ...style,
          animationDuration,
          ["--shine-base-opacity" as string]: baseOpacity,
        }}
      >
        {children}
      </Text>
    );
  },
);

ShineFx.displayName = "ShineFx";

export { ShineFx };
