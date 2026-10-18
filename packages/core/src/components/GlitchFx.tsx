"use client";

import classNames from "clsx";
import React, { useCallback, useEffect, useState } from "react";
import type { Speed } from "../types.js";
import { speedFactor } from "../utils/speed.js";
import { Flex } from "./Flex.js";
import styles from "./GlitchFx.module.scss";

interface GlitchFxProps extends React.ComponentProps<typeof Flex> {
  children: React.ReactNode;
  /**
   * A multiplier on the 2.5s glitch cycle (`2` is twice as fast), or
   * `"slow"`/`"medium"`/`"fast"` (0.5, 1, 2).
   */
  speed?: Speed;
  /** Milliseconds between glitches when `trigger="custom"`. */
  interval?: number;
  trigger?: "instant" | "hover" | "custom";
  continuous?: boolean;
}

const GlitchFx = ({
  ref,
  children,
  speed = "medium",
  interval = 2500,
  trigger = "instant",
  continuous = true,
  style,
  ...rest
}: GlitchFxProps) => {
  const [isGlitching, setIsGlitching] = useState(continuous || trigger === "instant");

  useEffect(() => {
    if (continuous || trigger === "instant") {
      setIsGlitching(true);
    }
  }, [continuous, trigger]);

  const handleMouseEnter = () => {
    if (trigger === "hover") {
      setIsGlitching(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === "hover") {
      setIsGlitching(false);
    }
  };

  const triggerGlitch = useCallback(() => {
    if (trigger === "custom") {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 500);
    }
  }, [trigger]);

  useEffect(() => {
    if (trigger === "custom") {
      const glitchInterval = setInterval(triggerGlitch, interval);
      return () => clearInterval(glitchInterval);
    }
  }, [trigger, interval, triggerGlitch]);

  const cycle = `${2500 / speedFactor(speed)}ms`;

  return (
    <Flex
      ref={ref}
      inline
      zIndex={0}
      className={classNames(isGlitching && styles.active)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ ["--glitch-duration" as string]: cycle, ...style }}
      {...rest}
    >
      <Flex fillWidth inline zIndex={1}>
        {children}
      </Flex>

      <Flex
        inline
        position="absolute"
        top="0"
        left="0"
        fill
        zIndex={0}
        opacity={50}
        className={classNames(styles.glitchLayer, styles.blueShift)}
      >
        {children}
      </Flex>

      <Flex
        inline
        position="absolute"
        top="0"
        left="0"
        fill
        zIndex={0}
        opacity={50}
        className={classNames(styles.glitchLayer, styles.redShift)}
      >
        {children}
      </Flex>
    </Flex>
  );
};

GlitchFx.displayName = "GlitchFx";

export { GlitchFx };
