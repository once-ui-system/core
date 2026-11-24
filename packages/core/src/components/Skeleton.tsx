import classNames from "clsx";
import React from "react";
import type { CSSUnit, SpacingToken, StaticSpacingToken } from "../types.js";
import { Flex } from "./Flex.js";
import styles from "./Skeleton.module.scss";

/*
 * A Skeleton's lengths: a number on the token scale (`240` is the token
 * "240", 15rem at the default size), a static spacing token, or a CSS length.
 * No t-shirt step: 1.x read `width="m"` on a Skeleton as its own percentage
 * scale, and through Flex it would be a page-wide responsive width, so it is
 * a type error here. 2.x's bare numbers were rem: the 3.0 codemod writes
 * `width={12}` as `width="12rem"`.
 *
 * `minWidth` and `maxWidth` are the exception: they take what Flex's do,
 * including the container sizes "xs"–"xl" (`maxWidth="l"` is
 * `.max-width-l`, `var(--responsive-width-l)`), which cap a skeleton at a
 * content column the way they cap the content it stands in for.
 */

interface SkeletonProps
  extends Omit<
    React.ComponentProps<typeof Flex>,
    "width" | "height" | "minWidth" | "maxWidth" | "minHeight" | "maxHeight"
  > {
  width?: number | StaticSpacingToken | CSSUnit;
  height?: number | StaticSpacingToken | CSSUnit;
  /** Flex's type (`SizeProps`), including the container sizes "xs"–"xl". */
  minWidth?: number | SpacingToken | CSSUnit;
  /** As on Flex, including the container sizes "xs"–"xl". */
  maxWidth?: number | SpacingToken | CSSUnit;
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
  /**
   * `pulse` (default) fades in and out. `generating` is for work that takes a
   * while, such as an image a model is drawing: a dot matrix whose dots swell
   * and take the brand and accent colours as soft fields drift under them.
   * It holds still under reduced motion.
   * Children (a caption, a progress line) sit above it.
   */
  effect?: "pulse" | "generating";
  style?: React.CSSProperties;
  className?: string;
}

const Skeleton = ({
  ref,
  shape = "line",
  size = "m",
  delay,
  effect = "pulse",
  style,
  className,
  children,
  ...props
}: SkeletonProps) => {
  const generating = effect === "generating";
  return (
    <Flex
      // A label on a plain div is not announced (axe: aria-prohibited-attr);
      // a labelled skeleton says what is loading, as a status.
      role={props["aria-label"] || props["aria-labelledby"] ? "status" : undefined}
      aria-busy={generating || undefined}
      {...props}
      ref={ref}
      style={delay !== undefined ? { animationDelay: `${delay}ms`, ...style } : style}
      // A radius the caller passes wins; this only supplies the shape's default.
      radius={props.radius ?? (shape === "line" || shape === "circle" ? "full" : undefined)}
      inline
      className={classNames(
        styles.skeleton,
        styles[shape],
        size && styles["size-" + size],
        generating && styles.generating,
        className,
      )}
    >
      {generating && (
          <span className={styles.mist} aria-hidden="true">
            <span className={styles.field} />
            <span className={styles.field} />
            <span className={styles.field} />
          </span>
      )}
      {children}
    </Flex>
  );
};

Skeleton.displayName = "Skeleton";

export { Skeleton };
