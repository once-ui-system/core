import classNames from "clsx";
import React from "react";
import type { CSSUnit, StaticSpacingToken } from "../types.js";
import { Flex } from "./Flex.js";
import styles from "./Skeleton.module.scss";

/*
 * A Skeleton's lengths: a number on the token scale (`240` is the token
 * "240", 15rem at the default size), a static spacing token, or a CSS length.
 * No t-shirt step: 1.x read `width="m"` on a Skeleton as its own percentage
 * scale, and through Flex it would be a page-wide responsive width, so it is
 * a type error here. 2.x's bare numbers were rem: the 3.0 codemod writes
 * `width={12}` as `width="12rem"`.
 */

interface SkeletonProps
  extends Omit<
    React.ComponentProps<typeof Flex>,
    "width" | "height" | "minWidth" | "maxWidth" | "minHeight" | "maxHeight"
  > {
  width?: number | StaticSpacingToken | CSSUnit;
  height?: number | StaticSpacingToken | CSSUnit;
  minWidth?: number | StaticSpacingToken | CSSUnit;
  maxWidth?: number | StaticSpacingToken | CSSUnit;
  minHeight?: number | StaticSpacingToken | CSSUnit;
  maxHeight?: number | StaticSpacingToken | CSSUnit;
  /** Defaults to `line`. */
  shape?: "line" | "circle" | "block";
  /**
   * The scale: height for a `line`, diameter for a `circle`, ignored by a
   * `block` (which fills its container).
   *
   * Width is not on this scale: it is a length as on any other element —
   * `width="80%"`, `maxWidth={384}` — instead of a second five-step scale that
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

const Skeleton = ({
  ref,
  shape = "line",
  size = "m",
  delay,
  style,
  className,
  ...props
}: SkeletonProps) => {
  return (
    <Flex
      // A label on a plain div is not announced (axe: aria-prohibited-attr);
      // a labelled skeleton says what is loading, as a status.
      role={props["aria-label"] || props["aria-labelledby"] ? "status" : undefined}
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
};

Skeleton.displayName = "Skeleton";

export { Skeleton };
