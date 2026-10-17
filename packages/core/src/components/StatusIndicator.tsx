import classNames from "clsx";
import React, { forwardRef } from "react";
import { Schemes, TShirtSizes } from "../types";
import { Flex } from "./Flex";
import styles from "./StatusIndicator.module.scss";

interface StatusIndicatorProps extends React.ComponentProps<typeof Flex> {
  size?: TShirtSizes;
  /** The dot's palette hue. 2.x called this `color`. */
  scheme?: Schemes | "gray";
  className?: string;
  style?: React.CSSProperties;
}

const StatusIndicator = forwardRef<HTMLDivElement, StatusIndicatorProps>(
  (
    {
      size = "m",
      scheme = "blue",
      "aria-label": ariaLabel = `${scheme} status indicator`,
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
        className={classNames(styles.statusIndicator, styles[size], styles[scheme], className)}
        // A label on a plain div is not exposed (axe: aria-prohibited-attr);
        // as an image the dot is announced by it. `role` can still be
        // overridden through the rest.
        role="img"
        aria-label={ariaLabel}
        radius="full"
        {...rest}
      />
    );
  },
);

StatusIndicator.displayName = "StatusIndicator";

export { StatusIndicator };
