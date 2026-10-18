"use client";

import { type CSSUnit, Flex, type SpacingToken } from "@once-ui-system/core";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { translateValue as resolveTranslate } from "./internal/translate.js";
import styles from "./RevealFx.module.scss";

interface RevealFxProps extends React.ComponentProps<typeof Flex> {
  children: React.ReactNode;
  /**
   * Milliseconds the reveal takes. Was `speed` until 3.0 (`"fast"` 1000,
   * `"medium"` 2000, `"slow"` 3000).
   */
  duration?: number;
  /** Milliseconds before the reveal starts. Was seconds until 2.0. */
  delay?: number;
  defaultRevealed?: boolean;
  /**
   * How far the content travels up as it reveals: a number is on the token
   * scale (`16` is `"16"`, 1rem), a string a spacing token (`"16"`) or a CSS
   * length (`"1rem"`).
   */
  translateY?: number | SpacingToken | CSSUnit;
  revealed?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

const RevealFx = ({
  ref,
  children,
  duration = 2000,
  delay = 0,
  defaultRevealed = false,
  translateY,
  revealed,
  style,
  className,
  ...rest
}: RevealFxProps) => {
  const [isRevealed, setIsRevealed] = useState(defaultRevealed);
  const [maskRemoved, setMaskRemoved] = useState(false);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const controlled = revealed !== undefined;

  useEffect(() => {
    // Controlled: `revealed` alone decides, so the delay timer must not
    // reveal content the caller is still holding back.
    if (controlled) return;
    const timer = setTimeout(() => {
      setIsRevealed(true);

      // Always set a timeout to remove the mask after transition completes
      transitionTimeoutRef.current = setTimeout(() => {
        setMaskRemoved(true);
      }, duration);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [delay, controlled]);

  useEffect(() => {
    if (revealed !== undefined) {
      setIsRevealed(revealed);

      // Reset mask removal state when revealed changes
      setMaskRemoved(false);

      // If revealed is true, set timeout to remove mask after transition
      if (revealed) {
        if (transitionTimeoutRef.current) {
          clearTimeout(transitionTimeoutRef.current);
        }

        transitionTimeoutRef.current = setTimeout(() => {
          setMaskRemoved(true);
        }, duration);
      }
    }
  }, [revealed]);

  const translateValue = resolveTranslate(translateY);

  const revealStyle: React.CSSProperties = {
    transitionDuration: `${duration}ms`,
    transform: isRevealed ? "translateY(0)" : `translateY(${translateValue})`,
    ...style,
  };

  // If mask is removed after transition, use the no-mask classes
  if (maskRemoved) {
    return (
      <Flex
        fillWidth
        ref={ref}
        style={revealStyle}
        className={`${styles.revealedNoMask} ${className || ""}`}
        {...rest}
      >
        {children}
      </Flex>
    );
  }

  return (
    <Flex
      fillWidth
      ref={ref}
      style={revealStyle}
      className={`${styles.revealFx} ${isRevealed ? styles.revealed : styles.hidden} ${className || ""}`}
      {...rest}
    >
      {children}
    </Flex>
  );
};

RevealFx.displayName = "RevealFx";

export { RevealFx };
