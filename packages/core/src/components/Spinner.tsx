import classNames from "clsx";
import React, { forwardRef } from "react";
import { TShirtSizes } from "../types.js";
import { Flex } from "./Flex.js";
import styles from "./Spinner.module.scss";

interface SpinnerProps extends React.ComponentProps<typeof Flex> {
  size?: TShirtSizes;
  className?: string;
  style?: React.CSSProperties;
}

const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = "m", "aria-label": ariaLabel = "Loading", className, style, ...rest }, ref) => {
    return (
      <Flex center style={style} className={className} {...rest}>
        {/* The name belongs on the status element, not the outer wrapper the
            rest of the props land on. */}
        <Flex ref={ref} center className={styles[size]} role="status" aria-label={ariaLabel}>
          <Flex fill>
            <Flex
              className={classNames(styles.size)}
              borderStyle="solid"
              fill
              radius="full"
              border="neutral-alpha-medium"
              position="absolute"
            />
            <Flex
              className={classNames(styles.spinner, styles.size)}
              borderStyle="solid"
              fill
              radius="full"
            />
          </Flex>
        </Flex>
      </Flex>
    );
  },
);

Spinner.displayName = "Spinner";

export { Spinner };
