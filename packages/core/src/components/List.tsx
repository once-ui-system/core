import React, { forwardRef } from "react";
import classNames from "classnames";
import styles from "./List.module.scss";
import { Column } from ".";

interface ListProps extends React.ComponentProps<typeof Column> {
  as?: "ul" | "ol";
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const List = forwardRef<HTMLDivElement, ListProps>(
  ({ as = "ul", className, children, style, ...props }, ref) => {
    const listClass = classNames(
      styles.list,
      as === "ul" ? styles.unordered : styles.ordered,
      className
    );

    if (as === "ol") {
      return (
        <Column as="ol" ref={ref} className={listClass} style={style} {...props}>
          {children}
        </Column>
      );
    }

    return (
      <Column as="ul" ref={ref} className={listClass} style={style} {...props}>
        {children}
      </Column>
    );
  }
);

List.displayName = "List";
export { List }; 