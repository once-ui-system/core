import { forwardRef } from "react";
import { type DimensionValue, View, type ViewProps, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { OnceTheme } from "../theme/theme";
import type { Colors, RadiusSize, ShadowSize, SpacingToken } from "../types";
import type { RefComponent, ViewRef, Writable } from "./refs";

type Alignment = "start" | "center" | "end" | "between" | "around" | "even" | "stretch";
type Size = number | SpacingToken | `${number}%`;

/** Core's `SpacingProps`, without the web-only offsets. Numbers are rem, as on the web. */
export interface SpacingProps {
  padding?: SpacingToken | number;
  paddingLeft?: SpacingToken | number;
  paddingRight?: SpacingToken | number;
  paddingTop?: SpacingToken | number;
  paddingBottom?: SpacingToken | number;
  paddingX?: SpacingToken | number;
  paddingY?: SpacingToken | number;
  margin?: SpacingToken | number;
  marginLeft?: SpacingToken | number;
  marginRight?: SpacingToken | number;
  marginTop?: SpacingToken | number;
  marginBottom?: SpacingToken | number;
  marginX?: SpacingToken | number;
  marginY?: SpacingToken | number;
  gap?: SpacingToken | number;
}

/** Core's `FlexProps`, `SizeProps` and the `StyleProps` that have a native equivalent. */
export interface FlexProps extends SpacingProps, Omit<ViewProps, "style"> {
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  horizontal?: Alignment;
  vertical?: Alignment;
  center?: boolean;
  wrap?: boolean;
  flex?: number;
  background?: Colors | "surface" | "page" | "overlay" | "transparent";
  border?: Colors | "surface" | "transparent";
  borderStyle?: "solid" | "dashed";
  borderWidth?: 1 | 2 | 4 | 8;
  radius?: RadiusSize;
  shadow?: ShadowSize;
  width?: Size;
  height?: Size;
  minWidth?: Size;
  maxWidth?: Size;
  minHeight?: Size;
  maxHeight?: Size;
  fill?: boolean;
  fillWidth?: boolean;
  fillHeight?: boolean;
  fit?: boolean;
  fitWidth?: boolean;
  fitHeight?: boolean;
  style?: ViewStyle | ViewStyle[];
}

const JUSTIFY: Record<Alignment, ViewStyle["justifyContent"]> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
  even: "space-evenly",
  stretch: "flex-start",
};

const ALIGN: Record<Alignment, ViewStyle["alignItems"]> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "stretch",
  around: "stretch",
  even: "stretch",
  stretch: "stretch",
};

function size(theme: OnceTheme, value: Size | undefined): DimensionValue | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "string" && value.endsWith("%")) return value as DimensionValue;
  return theme.space(value as SpacingToken | number);
}

const SPACING_KEYS = [
  "padding",
  "paddingLeft",
  "paddingRight",
  "paddingTop",
  "paddingBottom",
  "paddingX",
  "paddingY",
  "margin",
  "marginLeft",
  "marginRight",
  "marginTop",
  "marginBottom",
  "marginX",
  "marginY",
  "gap",
] as const;

/** Splits the spacing props off a component's props. */
export function splitSpacing<T extends SpacingProps>(
  props: T,
): [SpacingProps, Omit<T, keyof SpacingProps>] {
  const spacing: SpacingProps = {};
  const rest = { ...props };
  for (const key of SPACING_KEYS) {
    if (key in rest) {
      spacing[key] = rest[key] as never;
      delete rest[key];
    }
  }
  return [spacing, rest];
}

/** Spacing props as a style; shared by every component that takes them. */
export function spacingStyle(theme: OnceTheme, p: SpacingProps): ViewStyle {
  const s = (v: SpacingToken | number | undefined) =>
    v === undefined ? undefined : theme.space(v);
  const style: Writable<ViewStyle> = {
    padding: s(p.padding),
    paddingHorizontal: s(p.paddingX),
    paddingVertical: s(p.paddingY),
    paddingLeft: s(p.paddingLeft),
    paddingRight: s(p.paddingRight),
    paddingTop: s(p.paddingTop),
    paddingBottom: s(p.paddingBottom),
    margin: s(p.margin),
    marginHorizontal: s(p.marginX),
    marginVertical: s(p.marginY),
    marginLeft: s(p.marginLeft),
    marginRight: s(p.marginRight),
    marginTop: s(p.marginTop),
    marginBottom: s(p.marginBottom),
    gap: s(p.gap),
  };
  for (const key of Object.keys(style) as (keyof typeof style)[]) {
    if (style[key] === undefined) delete style[key];
  }
  return style;
}

/** Every `FlexProps` style prop as a `ViewStyle`, the rest passed through. */
export function flexStyle(
  theme: OnceTheme,
  props: FlexProps,
): { style: ViewStyle; rest: ViewProps } {
  const [spacing, others] = splitSpacing(props);
  const {
    direction = "row",
    horizontal,
    vertical,
    center,
    wrap,
    flex,
    background,
    border,
    borderStyle,
    borderWidth,
    radius,
    shadow,
    width,
    height,
    minWidth,
    maxWidth,
    minHeight,
    maxHeight,
    fill,
    fillWidth,
    fillHeight,
    fit,
    fitWidth,
    fitHeight,
    style: _style,
    ...rest
  } = others;

  // As on the web, `horizontal` is the main axis of a row and the cross axis of a column.
  const isRow = direction === "row" || direction === "row-reverse";
  const main = isRow ? horizontal : vertical;
  const cross = isRow ? vertical : horizontal;

  const style: Writable<ViewStyle> = {
    flexDirection: direction,
    ...spacingStyle(theme, spacing),
  };
  if (center) {
    style.justifyContent = "center";
    style.alignItems = "center";
  }
  if (main) style.justifyContent = JUSTIFY[main];
  if (cross) style.alignItems = ALIGN[cross];
  if (wrap) style.flexWrap = "wrap";
  if (flex !== undefined) style.flex = flex;
  if (background) style.backgroundColor = theme.background(background);
  if (border) {
    style.borderColor = theme.border(border);
    style.borderWidth = borderWidth ?? 1;
    style.borderStyle = borderStyle ?? "solid";
  }
  if (radius) {
    style.borderRadius = theme.radius(radius);
    style.overflow = "hidden";
  }
  if (shadow) Object.assign(style, theme.shadow(shadow));
  if (fill || fillWidth || maxWidth !== undefined) style.width = "100%";
  if (fill || fillHeight) style.height = "100%";
  if (fit || fitWidth) style.alignSelf = "flex-start";
  if (fit || fitHeight) style.flexGrow = 0;
  const sized = { width, height, minWidth, maxWidth, minHeight, maxHeight };
  for (const [key, value] of Object.entries(sized)) {
    const v = size(theme, value);
    if (v !== undefined) style[key as keyof typeof sized] = v;
  }
  return { style, rest };
}

/** Core's `Flex`: a row by default, as on the web (React Native's `View` is a column). */
export const Flex: RefComponent<FlexProps, ViewRef> = forwardRef<ViewRef, FlexProps>(
  function Flex(props, ref) {
    const theme = useTheme();
    const { style, rest } = flexStyle(theme, props);
    return <View ref={ref} {...rest} style={[style, props.style]} />;
  },
);

export const Column: RefComponent<FlexProps, ViewRef> = forwardRef<ViewRef, FlexProps>(
  function Column(props, ref) {
    return <Flex ref={ref} direction="column" {...props} />;
  },
);

export const Row: RefComponent<FlexProps, ViewRef> = forwardRef<ViewRef, FlexProps>(
  function Row(props, ref) {
    return <Flex ref={ref} direction="row" {...props} />;
  },
);
