"use client";

import React, { forwardRef } from "react";
import { Column } from "./Column";

interface ListProps extends React.ComponentProps<typeof Column> {
  as?: "ul" | "ol";
  /** The first item's number, for a numbered list that does not count from 1. Ignored on `ul`. */
  start?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const List = forwardRef<HTMLDivElement, ListProps>(
  ({ as = "ul", start, className, children, style, ...props }, ref) => {
    if (as === "ol") {
      return (
        <Column
          as="ol"
          // `start` is an `ol` attribute, outside the props Column types; Flex
          // passes it through to the element.
          {...{ start }}
          fillWidth
          margin="0"
          paddingY="0"
          paddingRight="0"
          paddingLeft="20"
          ref={ref}
          className={className}
          style={style}
          {...props}
        >
          {children}
        </Column>
      );
    }

    return (
      <Column
        as="ul"
        fillWidth
        margin="0"
        paddingY="0"
        paddingRight="0"
        paddingLeft="20"
        ref={ref}
        className={className}
        style={style}
        {...props}
      >
        {children}
      </Column>
    );
  },
);

List.displayName = "List";
export { List };
