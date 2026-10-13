import classNames from "clsx";
import type { CSSProperties, ReactNode } from "react";
import React, { forwardRef } from "react";
import { SpacingToken } from "../types";
import { sizeValue } from "../utils/layoutClasses";
import { Column } from "./Column";
import { Flex } from "./Flex";
import styles from "./MasonryGrid.module.scss";

interface MasonryBreakpointProps {
  columns?: number;
  hide?: boolean;
}

interface MasonryGridProps extends Omit<React.ComponentProps<typeof Flex>, "l" | "m" | "s" | "xs"> {
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

const MasonryGrid = forwardRef<HTMLDivElement, MasonryGridProps>(
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

export { MasonryGrid };

MasonryGrid.displayName = "MasonryGrid";
