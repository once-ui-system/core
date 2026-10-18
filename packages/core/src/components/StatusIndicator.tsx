import classNames from "clsx";
import React, { forwardRef } from "react";
import { PulseRing } from "../internal/PulseRing.js";
import { Schemes, Tone, TShirtSizes } from "../types.js";
import { Flex } from "./Flex.js";
import styles from "./StatusIndicator.module.scss";

interface StatusIndicatorProps extends React.ComponentProps<typeof Flex> {
  size?: TShirtSizes;
  /** The dot's palette hue. 2.x called this `color`. */
  scheme?: Schemes | "gray";
  /**
   * A dot in a ring that keeps pulsing out (2.x's Pulse), painted in `tone`.
   * It is decorative unless you give it an `aria-label`.
   */
  pulse?: boolean;
  /** The pulsing dot's palette. Default `"brand"`. Only with `pulse`; the plain dot takes `scheme`. */
  tone?: Tone;
  /** The pulsing ring's size, overriding the one `size` sets. Only with `pulse`. */
  pulseSize?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

const StatusIndicator = forwardRef<HTMLDivElement, StatusIndicatorProps>(
  (
    {
      size = "m",
      scheme = "blue",
      pulse = false,
      tone = "brand",
      pulseSize,
      "aria-label": ariaLabel,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    if (pulse) {
      return (
        <PulseRing
          {...(rest as Omit<React.ComponentProps<typeof PulseRing>, "tone" | "size">)}
          ref={ref}
          tone={tone}
          size={size}
          pulseSize={pulseSize}
          className={className}
          style={style}
          // Named, it is an image like the plain dot; unnamed it is decoration, as Pulse was.
          role={ariaLabel ? "img" : undefined}
          aria-label={ariaLabel}
        />
      );
    }
    return (
      <Flex
        ref={ref}
        style={style}
        className={classNames(styles.statusIndicator, styles[size], styles[scheme], className)}
        // A label on a plain div is not exposed (axe: aria-prohibited-attr);
        // as an image the dot is announced by it. `role` can still be
        // overridden through the rest.
        role="img"
        aria-label={ariaLabel ?? `${scheme} status indicator`}
        radius="full"
        {...rest}
      />
    );
  },
);

StatusIndicator.displayName = "StatusIndicator";

export type { StatusIndicatorProps };
export { StatusIndicator };
