import { Children, forwardRef, type ReactNode } from "react";
import {
  type DimensionValue,
  type StyleProp,
  View,
  type ViewProps,
  type ViewStyle,
} from "react-native";
import { useTheme } from "../theme/ThemeProvider";
import type { OnceTheme } from "../theme/theme";
import type { Colors, Opacity, RadiusSize, ShadowSize, SpacingToken } from "../types";
import type { RefComponent, ViewRef, Writable } from "./refs";
import { type SpacingProps, spacingStyle, splitSpacing } from "./spacing";
import { Text } from "./Text";

export { type SpacingProps, spacingStyle, splitSpacing };

type Alignment = "start" | "center" | "end" | "between" | "around" | "even" | "stretch";
type Size = number | SpacingToken | `${number}%`;
type ZIndex = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/** Core's breakpoints, largest first: the order their objects apply in. */
export const BREAKPOINTS = ["xl", "l", "m", "s", "xs"] as const;
export type Breakpoint = (typeof BREAKPOINTS)[number];

export type SafeAreaEdge = "top" | "right" | "bottom" | "left";

/**
 * Core's `FlexProps`, `SizeProps` and the `StyleProps` and `DisplayProps`
 * that have a native equivalent.
 */
export interface FlexProps extends SpacingProps, Omit<ViewProps, "style" | "pointerEvents"> {
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
  /** As on the web, `radius` alone does not clip children: pass `overflow="hidden"`. */
  overflow?: "visible" | "hidden" | "scroll";
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
  aspectRatio?: number | string;
  /** React Native has no `fixed` or `sticky`; `relative` is the default, as in core. */
  position?: "relative" | "absolute" | "static";
  /** Offsets: a spacing token, or a number of rem, as in core. */
  top?: SpacingToken | number;
  right?: SpacingToken | number;
  bottom?: SpacingToken | number;
  left?: SpacingToken | number;
  opacity?: Opacity;
  zIndex?: ZIndex | `${ZIndex}`;
  /** Core's values, plus React Native's `box-none` and `box-only`. */
  pointerEvents?: "none" | "all" | "auto" | "box-none" | "box-only";
  /** Renders nothing, as core's `display: none`. */
  hide?: boolean;
  /** Renders only while the theme is dark (or light); changes no colours. */
  dark?: boolean;
  light?: boolean;
  /**
   * Adds the safe-area insets from `ThemeProvider`'s `insets` to the padding
   * on these edges (`true` for all four): the native side of core's
   * `--safe-area-*` tokens.
   */
  safeArea?: boolean | SafeAreaEdge[];
  /**
   * Breakpoint overrides, as in core: each applies at and below its
   * max-width (`xs` 480, `s` 768, `m` 1024, `l` 1440; `xl` everywhere),
   * larger first so the smaller wins.
   */
  xl?: FlexBreakpointProps;
  l?: FlexBreakpointProps;
  m?: FlexBreakpointProps;
  s?: FlexBreakpointProps;
  xs?: FlexBreakpointProps;
  style?: StyleProp<ViewStyle>;
}

/**
 * The keys of core's `FlexBreakpointProps` that have a native equivalent.
 * Core's `solid`, `borderTop`…`borderY`, `onBackground`, `onSolid`, `align`,
 * the `text*` props, `transition`, `scrollbar`, `overflowX` and `overflowY`
 * are left out, as they are on the base props.
 */
export type FlexBreakpointProps = Pick<
  FlexProps,
  | "direction"
  | "horizontal"
  | "vertical"
  | "center"
  | "wrap"
  | "flex"
  | keyof SpacingProps
  | "top"
  | "right"
  | "bottom"
  | "left"
  | "width"
  | "height"
  | "maxWidth"
  | "minWidth"
  | "minHeight"
  | "maxHeight"
  | "fit"
  | "fitWidth"
  | "fitHeight"
  | "fill"
  | "fillWidth"
  | "fillHeight"
  | "aspectRatio"
  | "background"
  | "border"
  | "borderStyle"
  | "borderWidth"
  | "radius"
  | "shadow"
  | "opacity"
  | "zIndex"
  | "pointerEvents"
  | "dark"
  | "light"
  | "position"
  | "hide"
  | "overflow"
  | "style"
>;

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

/**
 * The props in force at the theme's width: each breakpoint object the width
 * falls within, merged over the base props from `xl` down, as the CSS cascade
 * applies core's media queries. A breakpoint `style` goes after the base one.
 */
export function responsiveProps<P extends FlexProps>(
  theme: OnceTheme,
  props: P,
): Omit<P, Breakpoint> {
  const { xl, l, m, s, xs, ...base } = props;
  const objects = { xl, l, m, s, xs };
  let merged: Omit<P, Breakpoint> = base;
  for (const key of BREAKPOINTS) {
    const override = objects[key];
    if (!override || theme.width > theme.breakpoints[key]) continue;
    const style = override.style ? [merged.style, override.style] : merged.style;
    merged = { ...merged, ...override, style };
  }
  return merged;
}

/**
 * Every `FlexProps` style prop as a `ViewStyle`, after the breakpoint objects
 * for the theme's width. `rest` goes to the view; `userStyle` is the `style`
 * prop in force, to put after `style`. `hidden` means render nothing.
 */
export function flexStyle(
  theme: OnceTheme,
  props: FlexProps,
): { style: ViewStyle; rest: ViewProps; userStyle: StyleProp<ViewStyle>; hidden: boolean } {
  const [spacing, others] = splitSpacing(responsiveProps(theme, props));
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
    overflow,
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
    aspectRatio,
    position,
    top,
    right,
    bottom,
    left,
    opacity,
    zIndex,
    pointerEvents,
    hide,
    dark,
    light,
    safeArea,
    style: userStyle,
    ...rest
  } = others;
  const scheme = theme.settings.theme;
  const hidden = !!hide || (!!dark && scheme !== "dark") || (!!light && scheme !== "light");

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
  // Clipping only on request: on iOS `overflow: hidden` also hides the view's own shadow.
  if (radius) style.borderRadius = theme.radius(radius);
  if (overflow) style.overflow = overflow;
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
  if (aspectRatio !== undefined) style.aspectRatio = aspectRatio;
  if (position) style.position = position;
  const offsets = { top, right, bottom, left };
  for (const [key, value] of Object.entries(offsets)) {
    if (value !== undefined) style[key as SafeAreaEdge] = theme.space(value);
  }
  if (opacity !== undefined) style.opacity = opacity / 100;
  if (zIndex !== undefined) style.zIndex = Number(zIndex);
  if (pointerEvents) style.pointerEvents = pointerEvents === "all" ? "auto" : pointerEvents;
  if (safeArea) {
    const edges: SafeAreaEdge[] = safeArea === true ? ["top", "right", "bottom", "left"] : safeArea;
    for (const edge of edges) {
      // On top of the padding that edge already has, as core's `calc(space + safe-area)`.
      const axis =
        edge === "top" || edge === "bottom" ? style.paddingVertical : style.paddingHorizontal;
      const key = `padding${edge[0].toUpperCase()}${edge.slice(1)}` as
        | "paddingTop"
        | "paddingRight"
        | "paddingBottom"
        | "paddingLeft";
      const current = style[key] ?? axis ?? style.padding ?? 0;
      style[key] = (typeof current === "number" ? current : 0) + theme.insets[edge];
    }
  }
  return { style, rest, userStyle, hidden };
}

/**
 * Bare strings and numbers wrapped in `Text`: the web renders `<Flex>Hi</Flex>`,
 * React Native throws on text outside a `<Text>`.
 */
export function wrapText(children: ReactNode): ReactNode {
  let bare = false;
  Children.forEach(children, (child) => {
    if (typeof child === "string" || typeof child === "number") bare = true;
  });
  if (!bare) return children;
  return Children.map(children, (child) =>
    typeof child === "string" || typeof child === "number" ? <Text>{child}</Text> : child,
  );
}

/** Core's `Flex`: a row by default, as on the web (React Native's `View` is a column). */
export const Flex: RefComponent<FlexProps, ViewRef> = forwardRef<ViewRef, FlexProps>(
  function Flex(props, ref) {
    const theme = useTheme();
    const { style, rest, userStyle, hidden } = flexStyle(theme, props);
    if (hidden) return null;
    return (
      <View ref={ref} {...rest} style={[style, userStyle]}>
        {wrapText(props.children)}
      </View>
    );
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
