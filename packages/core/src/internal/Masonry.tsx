import classNames from "clsx";
import type { CSSProperties, ReactNode } from "react";
import React, { forwardRef } from "react";
import { Column } from "../components/Column.js";
import { Flex } from "../components/Flex.js";
import { SpacingToken } from "../types.js";
import { sizeValue } from "../utils/layoutClasses.js";
import styles from "./Masonry.module.scss";

export interface MasonryBreakpointProps {
  columns?: number;
  hide?: boolean;
}

/** `<Grid masonry>` (2.x's MasonryGrid): children flow down `columns` CSS columns. */
export interface MasonryProps
  extends Omit<React.ComponentProps<typeof Flex>, "l" | "m" | "s" | "xs"> {
  children: ReactNode;
  gap?: SpacingToken | "-1" | undefined;
  columns?: number;
  style?: CSSProperties;
  className?: string;
  l?: MasonryBreakpointProps;
  m?: MasonryBreakpointProps;
  s?: MasonryBreakpointProps;
  xs?: MasonryBreakpointProps;
}

const Masonry = forwardRef<HTMLDivElement, MasonryProps>(
  ({ children, gap = "8", columns = 3, style, className, l, m, s, xs, ...flex }, ref) => {
    const gapValue = sizeValue(gap, "width") ?? "var(--static-space-8)";

    const classes = classNames(
      columns && styles[`columns-${columns}`],
      l?.columns && styles[`l-columns-${l.columns}`],
      m?.columns && styles[`m-columns-${m.columns}`],
      s?.columns && styles[`s-columns-${s.columns}`],
      xs?.columns && styles[`xs-columns-${xs.columns}`],
      className,
    );

    return (
      <Flex
        fillWidth
        className={classes}
        ref={ref}
        {...flex}
        style={{
          display: "block",
          columnGap: gapValue,
          ...style,
        }}
      >
        {React.Children.map(children, (child, idx) => (
          <Column
            key={idx}
            fillWidth
            fitHeight
            style={{
              breakInside: "avoid",
              marginBottom: gapValue,
            }}
          >
            {child}
          </Column>
        ))}
      </Flex>
    );
  },
);

export { Masonry };

Masonry.displayName = "Masonry";
