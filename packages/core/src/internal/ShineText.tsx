"use client";

import classNames from "clsx";
import React from "react";
import { Text } from "../components/Text.js";
import { useReducedMotion } from "../hooks/useReducedMotion.js";
import styles from "./ShineText.module.scss";

/**
 * Text with a light sweeping across it: Table's "Loading data…". Internal,
 * so Table does not depend on ShineFx, which is an effect and leaves core for
 * `@once-ui-system/fx`. It is ShineFx with its defaults (a 1s sweep at 0.3
 * base opacity, still under reduced motion), so it looks the same.
 */
export const ShineText = ({
  className,
  style,
  children,
  ...text
}: React.ComponentProps<typeof Text>) => {
  const { shouldAnimate } = useReducedMotion("auto");
  return (
    <Text
      {...text}
      className={classNames(styles.shine, !shouldAnimate && styles.still, className)}
      style={{ ...style, animationDuration: "1000ms", ["--shine-base-opacity" as string]: 0.3 }}
    >
      {children}
    </Text>
  );
};
