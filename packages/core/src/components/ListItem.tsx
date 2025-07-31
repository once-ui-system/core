import React, { forwardRef } from "react";
import classNames from "classnames";
import styles from "./List.module.scss";
import { Text } from ".";

interface ListItemProps extends React.ComponentProps<typeof Text> {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const ListItem = forwardRef<HTMLLIElement, ListItemProps>(
  ({ className, children, style, ...props }, ref) => {
    const listItemClass = classNames(styles.listItem, className);

    return (
      <Text as="li" className={listItemClass} style={style} {...props}>
        {children}
      </Text>
    );
  }
);

ListItem.displayName = "ListItem";
export { ListItem }; 