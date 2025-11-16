"use client";

import React from "react";
import { Text } from ".";
import styles from "./ShineFx.module.scss";
import classNames from "classnames";

export interface ShineFxProps extends React.ComponentProps<typeof Text> {
  speed?: number;
  disabled?: boolean;
  inverse?: boolean;
  baseOpacity?: number;
  children?: React.ReactNode;
}

const ShineFx: React.FC<ShineFxProps> = ({
  speed = 1,
  disabled = false,
  inverse = false,
  baseOpacity = 0.3,
  children,
  className,
  style,
  ...text
}) => {
  const animationDuration = `${speed}s`;

  return (
    <Text
      {...text}
      className={classNames(styles.shineFx, disabled ? styles.disabled : "", inverse ? styles.inverse : styles.default, className)}
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
