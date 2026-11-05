import classNames from "clsx";
import React from "react";
import type { LeafPropsOf } from "../interfaces.js";
import { TShirtSizes } from "../types.js";
import { Flex } from "./Flex.js";
import styles from "./Spinner.module.scss";

interface SpinnerProps extends LeafPropsOf<"div"> {
  size?: TShirtSizes;
}

const Spinner = ({
  ref,
  size = "m",
  "aria-label": ariaLabel = "Loading",
  className,
  style,
  ...rest
}: SpinnerProps) => {
  return (
    <Flex center style={style} className={className} data-motion="essential" {...rest}>
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
};

Spinner.displayName = "Spinner";

export { Spinner };
