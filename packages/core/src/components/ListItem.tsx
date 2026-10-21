import classNames from "clsx";
import React from "react";
import styles from "./List.module.scss";
import { Text } from "./Text.js";

interface ListItemProps extends Omit<React.ComponentProps<typeof Text>, "ref"> {
  ref?: React.Ref<HTMLLIElement>;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const ListItem = ({ ref, className, children, style, ...props }: ListItemProps) => {
  const listItemClass = classNames(styles.listItem, className);

  return (
    <Text
      as="li"
      ref={ref}
      className={classNames("py-0 pr-0 pl-8", listItemClass)}
      style={style}
      {...props}
    >
      {children}
    </Text>
  );
};

ListItem.displayName = "ListItem";

export { ListItem };
