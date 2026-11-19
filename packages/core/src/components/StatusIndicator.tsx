import classNames from "clsx";
import type React from "react";
import type { LeafPropsOf } from "../interfaces.js";
import { PulseRing } from "../internal/PulseRing.js";
import type { Schemes, Tone, TShirtSizes } from "../types.js";
import { Flex } from "./Flex.js";
import styles from "./StatusIndicator.module.scss";

/** The fixed palette hues a status dot takes, here and on Avatar's `statusIndicator`. */
export type StatusIndicatorScheme = Schemes | "gray" | "rose" | "mint" | "dusk" | "sand" | "slate";

interface StatusIndicatorProps extends LeafPropsOf<"div"> {
  size?: TShirtSizes;
  /** The dot's palette hue, a fixed colour. 2.x called this `color`. */
  scheme?: StatusIndicatorScheme;
  /**
   * A dot in a ring that keeps pulsing out (2.x's Pulse), painted in `tone`.
   * It is decorative unless you give it an `aria-label`.
   */
  pulse?: boolean;
  /**
   * A theme role (`brand`, `accent`, `neutral`, `info`, `danger`, `warning`,
   * `success`) that follows the theme's scheme for it, so `danger` stays the
   * app's danger colour if the theme changes it. On the plain dot it wins over
   * `scheme`; the pulsing dot defaults to `"brand"`.
   */
  tone?: Tone;
  /** The pulsing ring's size, overriding the one `size` sets. Only with `pulse`. */
  pulseSize?: string | number;
}

const StatusIndicator = ({
  ref,
  size = "m",
  scheme = "blue",
  pulse = false,
  tone,
  pulseSize,
  "aria-label": ariaLabel,
  className,
  style,
  ...rest
}: StatusIndicatorProps) => {
  if (pulse) {
    return (
      <PulseRing
        {...(rest as Omit<React.ComponentProps<typeof PulseRing>, "tone" | "size">)}
        ref={ref}
        tone={tone ?? "brand"}
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
  const hue = tone ?? scheme;
  return (
    <Flex
      ref={ref}
      style={style}
      className={classNames(styles.statusIndicator, styles[size], styles[hue], className)}
      // A label on a plain div is not exposed (axe: aria-prohibited-attr);
      // as an image the dot is announced by it. `role` can still be
      // overridden through the rest.
      role="img"
      aria-label={ariaLabel ?? `${hue} status indicator`}
      radius="full"
      {...rest}
    />
  );
};

StatusIndicator.displayName = "StatusIndicator";

export type { StatusIndicatorProps };
export { StatusIndicator };
