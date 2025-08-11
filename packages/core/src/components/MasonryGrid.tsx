import React, { forwardRef } from "react";
import type { CSSProperties, ReactNode } from "react";
import { SpacingToken } from "../types";
import { Column } from "./Column";
import classNames from "classnames";
import styles from "./MasonryGrid.module.scss";
import { Flex } from "./Flex";

function parseToken(value: SpacingToken | "-1" | number | undefined, type: "width" | "height") {
  if (value === undefined) return undefined;
  if (typeof value === "number") return `${value}rem`;
  if (
    [
      "0",
      "1",
      "2",
      "4",
      "8",
      "12",
      "16",
      "20",
      "24",
      "32",
      "40",
      "48",
      "56",
      "64",
      "80",
      "104",
      "128",
      "160",
    ].includes(value)
  ) {
    return `var(--static-space-${value})`;
  }
  if (["xs", "s", "m", "l", "xl"].includes(value)) {
    return `var(--responsive-${type}-${value})`;
  }
  return undefined;
}

interface MasonryGridProps extends React.ComponentProps<typeof Flex> {
  children: ReactNode;
  gap?: SpacingToken | "-1" | undefined;
  columns?: number;
  style?: CSSProperties;
  className?: string;
}

const MasonryGrid = forwardRef<HTMLDivElement, MasonryGridProps>(
  ({ children, gap = "8", columns = 3, style, className, l, m, s, ...flex }, ref) => {
    const gapValue = parseToken(gap, "width") ?? "var(--static-space-8)";

    const classes = classNames(
      columns && styles[`columns-${columns}`],
      l?.columns && styles[`l-columns-${l.columns}`],
      m?.columns && styles[`m-columns-${m.columns}`],
      s?.columns && styles[`s-columns-${s.columns}`],
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
        }}>
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
