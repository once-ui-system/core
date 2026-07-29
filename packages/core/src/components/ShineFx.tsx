"use client";

import React, { forwardRef } from "react";
import { Text } from ".";
import styles from "./ShineFx.module.scss";
import classNames from "clsx";
import { useReducedMotion } from "../hooks/useReducedMotion";

export interface ShineFxProps extends React.ComponentProps<typeof Text> {
  speed?: number;
  disabled?: boolean;
  inverse?: boolean;
  baseOpacity?: number;
  reducedMotion?: boolean | "auto";
  children?: React.ReactNode;
}

const ShineFx = forwardRef<HTMLSpanElement, ShineFxProps>(({
  speed = 1,
  disabled = false,
  inverse = false,
  baseOpacity = 0.3,
  reducedMotion = "auto",
  children,
  className,
  style,
  ...text
}, ref) => {
  const { shouldAnimate } = useReducedMotion(reducedMotion);
  const isDisabled = disabled || !shouldAnimate;
  const animationDuration = `${speed}s`;

  return (
    <Text
      {...text}
      className={classNames(styles.shineFx, isDisabled ? styles.disabled : "", inverse ? styles.inverse : styles.default, className)}
      style={{
        ...style,
        animationDuration,
        ["--shine-base-opacity" as string]: baseOpacity,
      }}
    >
      {children}
    </Text>
  );
})

ShineFx.displayName = "ShineFx";

export { ShineFx };
