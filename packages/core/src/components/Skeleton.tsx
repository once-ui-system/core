"use client";

import React, { forwardRef } from "react";
import classNames from "clsx";

import styles from "./Skeleton.module.scss";
import { Flex } from ".";

interface SkeletonProps extends React.ComponentProps<typeof Flex> {
  shape: "line" | "circle" | "block";
  /**
   * The scale: height for a `line`, diameter for a `circle`, ignored by a
   * `block` (which fills its container).
   *
   * Width is deliberately not here. Skeleton extends Flex, so width is a
   * layout concern expressed the same way as on any other element —
   * `width="80%"`, `maxWidth={24}` — instead of a second five-step scale that
   * only meant percentages.
   */
  size?: "xl" | "l" | "m" | "s" | "xs";
  /**
   * Animation offset in milliseconds, for staggering a group of skeletons.
   * Previously a "1".."6" index into six fixed classes, which is why it read
   * as a step rather than the duration it actually is.
   */
  delay?: number;
  style?: React.CSSProperties;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ shape = "line", size = "m", delay, style, className, ...props }, ref) => {
    return (
      <Flex
        {...props}
        ref={ref}
        style={delay !== undefined ? { animationDelay: `${delay}ms`, ...style } : style}
        radius={shape === "line" || shape === "circle" ? "full" : undefined}
        inline
        className={classNames(
          styles.skeleton,
          styles[shape],
          size && styles["size-" + size],
          className,
        )}
      />
    );
  },
);

Skeleton.displayName = "Skeleton";

export { Skeleton };
