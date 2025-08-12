"use client";

import React, { forwardRef } from "react";
import { Column } from ".";

interface ListProps extends React.ComponentProps<typeof Column> {
  as?: "ul" | "ol";
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const List = forwardRef<HTMLDivElement, ListProps>(
  ({ as = "ul", className, children, style, ...props }, ref) => {
    if (as === "ol") {
      return (
        <Column
          as="ol"
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
