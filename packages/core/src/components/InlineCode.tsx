import classNames from "clsx";
import React, { ReactNode } from "react";
import type { LeafPropsOf } from "../interfaces.js";
import { Flex } from "./Flex.js";
import styles from "./InlineCode.module.scss";

interface InlineCodeProps extends Omit<LeafPropsOf<"span">, "ref"> {
  ref?: React.Ref<HTMLSpanElement>;
  children: ReactNode;
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
