"use client";

import React from "react";
import { Text } from ".";
import styles from "./ShineFx.module.scss";
import classNames from "classnames";
import { useReducedMotion } from "../hooks/useReducedMotion";

export interface ShineFxProps extends React.ComponentProps<typeof Text> {
  speed?: number;
  disabled?: boolean;
  inverse?: boolean;
  baseOpacity?: number;
  reducedMotion?: boolean | "auto";
  children?: React.ReactNode;
}

const ShineFx: React.FC<ShineFxProps> = ({
  speed = 1,
  disabled = false,
  inverse = false,
  baseOpacity = 0.3,
  reducedMotion = "auto",
  children,
  className,
  style,
  ...text
}) => {
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
};

ShineFx.displayName = "ShineFx";

export { ShineFx };
