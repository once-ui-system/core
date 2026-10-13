"use client";

import classNames from "clsx";
import React, { forwardRef } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import styles from "./ShineFx.module.scss";
import { Text } from "./Text";

export interface ShineFxProps extends React.ComponentProps<typeof Text> {
  /** Sweep duration in milliseconds. Was seconds until 2.0. */
  speed?: number;
  disabled?: boolean;
  inverse?: boolean;
  baseOpacity?: number;
  reducedMotion?: boolean | "auto";
  children?: React.ReactNode;
}

const ShineFx = forwardRef<HTMLSpanElement, ShineFxProps>(
  (
    {
      speed = 1000,
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
    const animationDuration = `${speed}ms`;

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
