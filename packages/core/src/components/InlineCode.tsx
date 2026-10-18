import classNames from "clsx";
import React, { ReactNode } from "react";
import { Flex } from "./Flex.js";
import styles from "./InlineCode.module.scss";

interface InlineCodeProps extends Omit<React.ComponentProps<typeof Flex>, "ref"> {
  ref?: React.Ref<HTMLSpanElement>;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const InlineCode = ({ ref, children, className, style, ...flex }: InlineCodeProps) => {
  return (
    <Flex
      as="span"
      inline
      fit
      ref={ref}
      radius="s"
      vertical="center"
      paddingX="4"
      paddingY="1"
      background="neutral-alpha-weak"
      border="neutral-alpha-medium"
      className={classNames(styles.inlineCode, "font-code", className)}
      style={style}
      {...flex}
    >
      {children}
    </Flex>
  );
};

InlineCode.displayName = "InlineCode";

export { InlineCode };
