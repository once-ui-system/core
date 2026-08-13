import type { CSSProperties, ReactNode } from "react";
import { forwardRef } from "react";
import { Column } from "./Column";
import type { FlexComponentProps } from "./Flex";

export interface ListProps extends Omit<FlexComponentProps, "as"> {
  as?: "ul" | "ol";
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const List = forwardRef<HTMLDivElement, ListProps>(
  ({ as = "ul", className, children, style, ...props }, ref) => {
    return (
      <Column
        as={as}
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
