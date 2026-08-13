import type { CSSProperties, ReactNode } from "react";
import { forwardRef } from "react";
import { Flex, type FlexComponentProps } from "./Flex";
import { Text } from "./Text";

export interface KbdProps extends FlexComponentProps {
  label?: string;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const Kbd = forwardRef<HTMLDivElement, KbdProps>(
  ({ label, children, className, style, ...rest }, ref) => (
    <Flex
      as="kbd"
      ref={ref}
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
