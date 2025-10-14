"use client";

import React from "react";
import { Text } from ".";
import styles from "./ShineFx.module.scss";

export interface ShineFxProps extends React.ComponentProps<typeof Text> {
  speed?: number;
  disabled?: boolean;
  children?: React.ReactNode;
}

const ShineFx: React.FC<ShineFxProps> = ({
  speed = 5,
  disabled = false,
  children,
  className,
  style,
  ...text
}) => {
  const animationDuration = `${speed}s`;

  return (
    <Text
      {...text}
      className={`${styles.shineFx} ${disabled ? styles.disabled : ""} ${className || ""}`}
      style={{
        ...style,
        animationDuration,
      }}
    >
      {children}
    </Text>
  );
};

ShineFx.displayName = "ShineFx";

export { ShineFx };
