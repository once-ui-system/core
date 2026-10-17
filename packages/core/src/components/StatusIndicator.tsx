import classNames from "clsx";
import React, { forwardRef } from "react";
import { CondensedTShirtSizes } from "../types";
import { Flex } from "./Flex";
import styles from "./StatusIndicator.module.scss";

interface StatusIndicatorProps extends React.ComponentProps<typeof Flex> {
  size?: CondensedTShirtSizes;
  color:
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
    | "gray";
  className?: string;
  style?: React.CSSProperties;
}

const StatusIndicator = forwardRef<HTMLDivElement, StatusIndicatorProps>(
  (
    {
      size = "m",
      color = "blue",
      "aria-label": ariaLabel = `${color} status indicator`,
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
