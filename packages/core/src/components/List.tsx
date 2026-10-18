import classNames from "clsx";
import React from "react";
import type { FlexPropsOf } from "../interfaces.js";
import { Column } from "./Column.js";

interface ListProps extends Omit<FlexPropsOf<"ul">, "ref"> {
  as?: "ul" | "ol";
  /** The first item's number, for a numbered list that does not count from 1. Ignored on `ul`. */
  start?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * A bulleted (`ul`) or numbered (`ol`) list. Unlike `<Column as="ul">`, which
 * drops the browser's markers, it keeps them: the marker classes win over the
 * list reset layout primitives apply.
 */
const List = ({
  ref,
  as = "ul",
  start,
  className,
  children,
  style,
  ...props
}: ListProps & { ref?: React.Ref<HTMLUListElement | HTMLOListElement> }) => {
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
        ref={ref as React.Ref<HTMLOListElement>}
        className={classNames("list-decimal", className)}
        style={style}
        {...(props as Omit<FlexPropsOf<"ol">, "ref">)}
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
      ref={ref as React.Ref<HTMLUListElement>}
      className={classNames("list-disc", className)}
      style={style}
      {...props}
    >
      {children}
    </Column>
  );
};

List.displayName = "List";

export { List };
