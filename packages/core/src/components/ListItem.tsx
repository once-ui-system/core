import type { CSSProperties, ReactNode } from "react";
import { forwardRef } from "react";
import { cn } from "../classes/utils";
import { Text, type TextComponentProps } from "./Text";

export interface ListItemProps extends TextComponentProps<"li"> {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const ListItem = forwardRef<HTMLLIElement, ListItemProps>(
  ({ className, children, style, ...props }, ref) => {
    return (
      <Text
        ref={ref}
        as="li"
        paddingY="0"
        paddingRight="0"
        paddingLeft="8"
        className={cn("marker:text-neutral-on-background-weak", className)}
        style={style}
        {...props}
      >
        {children}
      </Text>
    );
  },
);

ListItem.displayName = "ListItem";

export { ListItem };
