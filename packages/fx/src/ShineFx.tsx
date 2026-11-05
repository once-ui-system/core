"use client";

import { Text, useReducedMotion } from "@once-ui-system/core";
import classNames from "clsx";
import type React from "react";
import styles from "./ShineFx.module.scss";

export interface ShineFxProps extends Omit<React.ComponentProps<typeof Text>, "ref"> {
  ref?: React.Ref<HTMLSpanElement>;
  /** Milliseconds one sweep takes. Was `speed` until 3.0 (and seconds until 2.0). */
  duration?: number;
  disabled?: boolean;
  inverse?: boolean;
  baseOpacity?: number;
  reducedMotion?: boolean | "auto";
  children?: React.ReactNode;
}

const ShineFx = ({
  ref,
  duration = 1000,
  disabled = false,
  inverse = false,
  baseOpacity = 0.3,
  reducedMotion = "auto",
  children,
  className,
  style,
  ...text
}: ShineFxProps) => {
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
};

ShineFx.displayName = "ShineFx";

export { ShineFx };
