import { Children, type CSSProperties, forwardRef, isValidElement, type ReactNode } from "react";
import { cn } from "../classes/utils";
import type { SpacingToken } from "../types";
import { Column } from "./Column";
import { Flex, type FlexComponentProps } from "./Flex";

export interface MasonryBreakpointProps {
  columns?: number | string;
  hide?: boolean;
}

export interface MasonryGridProps extends Omit<FlexComponentProps, "l" | "m" | "s" | "xs" | "gap"> {
  children: ReactNode;
  gap?: SpacingToken | "-1" | number;
  columns?: number | string;
  style?: CSSProperties;
  className?: string;
  xl?: MasonryBreakpointProps;
  l?: MasonryBreakpointProps;
  m?: MasonryBreakpointProps;
  s?: MasonryBreakpointProps;
  xs?: MasonryBreakpointProps;
}

const getColumnsClass = (prefix?: string, cols?: number | string) => {
  if (!cols) return undefined;
  const colClass = `columns-${cols}`;
  return prefix ? `${prefix}:${colClass}` : colClass;
};

const formatGapClass = (prefix: "gap" | "mb", gap?: SpacingToken | "-1" | number) => {
  if (gap === undefined || gap === null) return undefined;
  if (typeof gap === "number") return `${prefix}-[${gap}px]`;
  if (gap === "-1") return `${prefix}-[-1px]`;
  return `${prefix}-${gap}`;
};

const MasonryGrid = forwardRef<HTMLDivElement, MasonryGridProps>(
  ({ children, gap = "8", columns = 3, style, className, xl, l, m, s, xs, ...flex }, ref) => {
    const gapClass = formatGapClass("gap", gap);
    const gapMarginClass = formatGapClass("mb", gap);

    const classes = cn(
      "block",
      getColumnsClass(undefined, columns),
      getColumnsClass("xl", xl?.columns),
      getColumnsClass("l", l?.columns),
      getColumnsClass("m", m?.columns),
      getColumnsClass("s", s?.columns),
      getColumnsClass("xs", xs?.columns),
      xl?.hide && "xl:hidden",
      l?.hide && "l:hidden",
      m?.hide && "m:hidden",
      s?.hide && "s:hidden",
      xs?.hide && "xs:hidden",
      gapClass,
      className,
    );

    return (
      <Flex fillWidth className={classes} ref={ref} style={style} {...flex}>
        {Children.map(children, (child, idx) => {
          const itemKey =
            isValidElement(child) && child.key != null ? child.key : `masonry-item-${idx}`;

          return (
            <Column
              key={itemKey}
              fillWidth
              fitHeight
              className={cn("break-inside-avoid", gapMarginClass)}
            >
              {child}
            </Column>
          );
        })}
      </Flex>
    );
  },
);

MasonryGrid.displayName = "MasonryGrid";

export { MasonryGrid };
