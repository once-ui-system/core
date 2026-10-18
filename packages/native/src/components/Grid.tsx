import { Children, forwardRef, useState } from "react";
import { View } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { SpacingToken } from "../types";
import {
  BREAKPOINTS,
  type FlexBreakpointProps,
  type FlexProps,
  flexStyle,
  responsiveProps,
  wrapText,
} from "./Flex";
import type { RefComponent, ViewRef } from "./refs";

/** Core's `GridSize`: one to twelve, as a number or a string. */
export type GridSize =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12;

// A grid lays its children out itself, so the Flex props that place them are left out.
type FlexOnly = "direction" | "horizontal" | "vertical" | "center" | "wrap";

/** The breakpoint keys of core's `GridBreakpointProps` that have a native equivalent. */
export interface GridBreakpointProps extends Omit<FlexBreakpointProps, FlexOnly> {
  columns?: GridSize;
  minColumnWidth?: number | SpacingToken;
}

export interface GridProps extends Omit<FlexProps, FlexOnly | "xl" | "l" | "m" | "s" | "xs"> {
  /** How many equal columns. Set it per breakpoint to reflow. */
  columns?: GridSize;
  /**
   * As many columns as fit, each at least this wide (a spacing token, or a
   * number of rem). Takes precedence over `columns`, as in core.
   */
  minColumnWidth?: number | SpacingToken;
  xl?: GridBreakpointProps;
  l?: GridBreakpointProps;
  m?: GridBreakpointProps;
  s?: GridBreakpointProps;
  xs?: GridBreakpointProps;
}

/**
 * Core's `Grid`: children in equal columns, `gap` apart both ways. Each child
 * sits in a cell of `1 / columns` of the width; a cell gives its child the
 * width, and its height when the child has `flex={1}` or `fillHeight`.
 */
export const Grid: RefComponent<GridProps, ViewRef> = forwardRef<ViewRef, GridProps>(
  function Grid(props, ref) {
    const theme = useTheme();
    // The row's width (a gap wider than the content), measured only for
    // `minColumnWidth`, which counts the columns that fit; the screen until then.
    const [width, setWidth] = useState(theme.width);
    const {
      columns = 1,
      minColumnWidth,
      gap,
      children,
      ...flex
    } = responsiveProps(theme, props as GridProps & FlexProps) as GridProps;
    const { style, rest, userStyle, hidden } = flexStyle(theme, { direction: "column", ...flex });
    if (hidden) return null;

    // As in core, a breakpoint's `columns` overrides a wider one's `minColumnWidth`:
    // whichever of the two the smallest breakpoint in force set wins.
    let auto = props.minColumnWidth !== undefined;
    for (const key of BREAKPOINTS) {
      const override = props[key];
      if (!override || theme.width > theme.breakpoints[key]) continue;
      if (override.minColumnWidth !== undefined) auto = true;
      else if (override.columns !== undefined) auto = false;
    }
    const space = gap === undefined ? 0 : theme.space(gap);
    const count =
      auto && minColumnWidth !== undefined
        ? Math.max(1, Math.floor(width / (theme.space(minColumnWidth) + space)))
        : Math.max(1, Math.floor(Number(columns)));
    // Half a gap either side of every cell, and the row pulled out by as much,
    // gives `gap` between columns and none at the edges, without measuring.
    const half = space / 2;

    return (
      <View ref={ref} {...rest} style={[style, userStyle]}>
        <View
          onLayout={!auto ? undefined : (event) => setWidth(event.nativeEvent.layout.width)}
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            rowGap: space,
            marginHorizontal: -half,
          }}
        >
          {Children.toArray(wrapText(children)).map((child, index) => (
            <View
              // biome-ignore lint/suspicious/noArrayIndexKey: cells are positional
              key={index}
              style={{ width: `${100 / count}%`, paddingHorizontal: half }}
            >
              {child}
            </View>
          ))}
        </View>
      </View>
    );
  },
);
