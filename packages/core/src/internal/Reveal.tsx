"use client";

import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Flex } from "../components/Flex.js";
import type { CSSUnit, SpacingToken } from "../types.js";
import { translateValue } from "../utils/layoutClasses.js";
import styles from "./Reveal.module.scss";

export interface RevealProps extends React.ComponentProps<typeof Flex> {
  children: React.ReactNode;
  /** Milliseconds the reveal takes. */
  duration?: number;
  revealed?: boolean;
  /** A number is on the token scale; a string a spacing token or a CSS length. As on RevealFx. */
  translateY?: number | SpacingToken | CSSUnit;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * Core's own blur-and-wipe reveal: what Carousel and DatePicker show a new
 * slide or month with. Internal, so neither depends on RevealFx, which is an
 * effect and leaves core for `@once-ui-system/fx`. It is RevealFx with no
 * `delay` and `defaultRevealed` (neither caller sets them), the same classes
 * and the same timings, so it looks the same.
 */
export const Reveal = ({
  ref,
  children,
  duration = 2000,
  revealed,
  translateY,
  style,
  className,
  ...rest
}: RevealProps) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [maskRemoved, setMaskRemoved] = useState(false);
  const maskTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const durationRef = useRef(duration);
  durationRef.current = duration;

  const removeMaskLater = useCallback(() => {
    if (maskTimer.current) clearTimeout(maskTimer.current);
    maskTimer.current = setTimeout(() => setMaskRemoved(true), durationRef.current);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRevealed(true);
      removeMaskLater();
    }, 0);
    return () => {
      clearTimeout(timer);
      if (maskTimer.current) clearTimeout(maskTimer.current);
    };
  }, [removeMaskLater]);

  useEffect(() => {
    if (revealed === undefined) return;
    setIsRevealed(revealed);
    setMaskRemoved(false);
    if (revealed) removeMaskLater();
  }, [revealed, removeMaskLater]);

  const offset = translateValue(translateY);

  const revealStyle: React.CSSProperties = {
    transitionDuration: `${duration}ms`,
    transform: isRevealed ? "translateY(0)" : `translateY(${offset})`,
    ...style,
  };

  const stateClass = maskRemoved
    ? styles.revealedNoMask
    : `${styles.reveal} ${isRevealed ? styles.revealed : styles.hidden}`;

  return (
    <Flex
      fillWidth
      ref={ref}
      style={revealStyle}
      className={`${stateClass} ${className || ""}`}
      {...rest}
    >
      {children}
    </Flex>
  );
};

Reveal.displayName = "Reveal";
