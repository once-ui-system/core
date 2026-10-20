import classNames from "clsx";
import React, { forwardRef } from "react";
import { ColorScheme, CondensedTShirtSizes } from "../types";
import { Flex } from "./Flex";
import styles from "./StatusIndicator.module.scss";

/** The colours a status dot takes, here and on Avatar's `statusIndicator`. */
export type StatusIndicatorColor =
  | ColorScheme
  | "blue"
  | "indigo"
  | "violet"
  | "magenta"
  | "pink"
  | "red"
  | "orange"
  | "yellow"
  | "moss"
  | "green"
  | "emerald"
  | "aqua"
  | "cyan"
  | "gray"
  | "rose"
  | "mint"
  | "dusk"
  | "sand"
  | "slate";

interface StatusIndicatorProps extends React.ComponentProps<typeof Flex> {
  size?: CondensedTShirtSizes;
  /**
   * Defaults to `blue`. A palette name (`blue`, `sand`, ...) is that fixed
   * colour; a role (`brand`, `accent`, `neutral`, `info`, `danger`, `warning`,
   * `success`) follows the theme's scheme for it, so `danger` stays the app's
   * danger colour if the theme changes it.
   */
  color?: StatusIndicatorColor;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

const StatusIndicator = forwardRef<HTMLDivElement, StatusIndicatorProps>(
  (
    {
      size = "m",
      color = "blue",
      ariaLabel = `${color} status indicator`,
      "aria-label": nativeAriaLabel,
      className,
      style,
      ...rest
    },
    ref,
  ) => {
    return (
      <Flex
        ref={ref}
        style={style}
        className={classNames(styles.statusIndicator, styles[size], styles[color], className)}
        // A label on a plain div is not exposed (axe: aria-prohibited-attr);
        // as an image the dot is announced by it. Native aria-label wins over
        // ariaLabel, and `role` can still be overridden through the rest.
        role="img"
        aria-label={nativeAriaLabel ?? ariaLabel}
        radius="full"
        {...rest}
      />
    );
  },
);

StatusIndicator.displayName = "StatusIndicator";

export { StatusIndicator };
