"use client";

import React, { forwardRef } from "react";
import classNames from "classnames";
import styles from "./BlockQuote.module.scss";
import { Flex } from ".";

interface BlockQuoteProps extends React.ComponentProps<typeof Flex> {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const BlockQuote = forwardRef<HTMLDivElement, BlockQuoteProps>(
  ({ children, className, style, ...rest }, ref) => {
    return (
      <Flex
        ref={ref}
        as="blockquote"
        style={style}
        className={classNames(styles.blockquote, className)}
        {...rest}
      >
        {children}
      </Flex>
    );
  }
);

BlockQuote.displayName = "BlockQuote";
export { BlockQuote };