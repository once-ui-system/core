import React, { ReactNode, forwardRef } from "react";

import { Flex } from "./Flex";
import { Text } from "./Text";

interface KbdProps extends React.ComponentProps<typeof Flex> {
  label?: string;
  children?: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Kbd = forwardRef<HTMLDivElement, KbdProps>(
  ({ label, children, className, style, ...rest }, ref) => (
    <Flex
      as="kbd"
      ref={ref}
      // A <kbd> belongs in a sentence. Flex is display: flex, so without this
      // one every Kbd in prose broke the line and filled the column.
      inline
      fit
      horizontal="center"
      minWidth="32"
      background="neutral-strong"
      radius="s"
      paddingX="4"
      paddingY="2"
      onBackground="neutral-medium"
      border="neutral-strong"
      className={className}
      style={style}
      {...rest}
    >
      <Text as="span" variant="label-default-s">
        {label || children}
      </Text>
    </Flex>
  ),
);

Kbd.displayName = "Kbd";

export { Kbd };
export type { KbdProps };
